use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use syn::ext::IdentExt;
use syn::{
    Attribute, Expr, ExprLit, Fields, GenericArgument, Generics, Item, Lit, Meta, PathArguments,
    Type,
};

fn sqlparser_src() -> PathBuf {
    let output = Command::new(std::env::var("CARGO").unwrap())
        .args(["metadata", "--format-version", "1"])
        .output()
        .unwrap();
    let metadata: serde_json::Value = serde_json::from_slice(&output.stdout).unwrap();
    let package = metadata["packages"]
        .as_array()
        .unwrap()
        .iter()
        .find(|package| package["name"] == "sqlparser")
        .unwrap();
    Path::new(package["manifest_path"].as_str().unwrap()).with_file_name("src")
}

fn sources(dir: &Path, files: &mut Vec<PathBuf>) {
    for entry in fs::read_dir(dir).unwrap() {
        let path = entry.unwrap().path();
        if path.is_dir() {
            sources(&path, files);
        } else if path.extension().is_some_and(|ext| ext == "rs") {
            files.push(path);
        }
    }
}

fn cfg(meta: &Meta) -> bool {
    match meta {
        Meta::NameValue(pair) if pair.path.is_ident("feature") => match &pair.value {
            Expr::Lit(ExprLit {
                lit: Lit::Str(feature),
                ..
            }) => ["serde", "std"].contains(&feature.value().as_str()),
            _ => panic!("unsupported feature cfg"),
        },
        Meta::List(list) if list.path.is_ident("not") => !cfg(&list.parse_args().unwrap()),
        Meta::Path(path) if path.is_ident("test") => false,
        _ => panic!("unsupported cfg"),
    }
}

fn enabled(attrs: &[Attribute]) -> bool {
    attrs
        .iter()
        .filter(|attr| attr.path().is_ident("cfg"))
        .all(|attr| cfg(&attr.parse_args().unwrap()))
}

fn serialized(attrs: &[Attribute]) -> bool {
    attrs.iter().any(|attr| match &attr.meta {
        Meta::List(list) => list.tokens.to_string().contains("Serialize"),
        _ => false,
    })
}

fn optional(ty: &Type) -> Option<&Type> {
    let Type::Path(path) = ty else { return None };
    let segment = path.path.segments.last()?;
    let PathArguments::AngleBracketed(args) = &segment.arguments else {
        return None;
    };
    match args.args.first() {
        Some(GenericArgument::Type(inner)) if segment.ident == "Option" => Some(inner),
        _ => None,
    }
}

fn ts(ty: &Type) -> String {
    match ty {
        Type::Path(path) => {
            let segment = path.path.segments.last().unwrap();
            let args: Vec<String> = match &segment.arguments {
                PathArguments::AngleBracketed(args) => args
                    .args
                    .iter()
                    .map(|arg| match arg {
                        GenericArgument::Type(ty) => ts(ty),
                        _ => panic!("unsupported generic argument"),
                    })
                    .collect(),
                _ => Vec::new(),
            };
            match (segment.ident.to_string().as_str(), args.as_slice()) {
                ("Box", [inner]) => inner.clone(),
                ("Option", [inner]) => format!("{inner} | undefined"),
                ("Vec", [inner]) if inner.contains('|') => format!("({inner})[]"),
                ("Vec", [inner]) => format!("{inner}[]"),
                ("String" | "char", []) => "string".into(),
                ("bool", []) => "boolean".into(),
                ("i128" | "u128", []) => "bigint".into(),
                (
                    "i8" | "i16" | "i32" | "i64" | "isize" | "u8" | "u16" | "u32" | "u64" | "usize"
                    | "f32" | "f64",
                    [],
                ) => "number".into(),
                (name, []) => name.into(),
                (name, args) => format!("{name}<{}>", args.join(", ")),
            }
        }
        Type::Tuple(tuple) if tuple.elems.is_empty() => "undefined".into(),
        Type::Tuple(tuple) => {
            let items: Vec<_> = tuple.elems.iter().map(ts).collect();
            format!("[{}]", items.join(", "))
        }
        _ => panic!("unsupported type"),
    }
}

fn members(fields: &Fields) -> Vec<String> {
    fields
        .iter()
        .filter(|field| enabled(&field.attrs))
        .map(|field| {
            let name = field.ident.as_ref().unwrap().unraw();
            match optional(&field.ty) {
                Some(inner) => format!("{name}?: {}", ts(inner)),
                None => format!("{name}: {}", ts(&field.ty)),
            }
        })
        .collect()
}

fn shape(fields: &Fields) -> Option<String> {
    let types: Vec<_> = fields
        .iter()
        .filter(|field| enabled(&field.attrs))
        .map(|field| ts(&field.ty))
        .collect();
    match fields {
        Fields::Unit => None,
        Fields::Named(_) if types.is_empty() => Some("Record<string, never>".into()),
        Fields::Named(_) => Some(format!("{{ {} }}", members(fields).join("; "))),
        Fields::Unnamed(_) if types.len() == 1 => Some(types[0].clone()),
        Fields::Unnamed(_) => Some(format!("[{}]", types.join(", "))),
    }
}

fn header(name: &str, generics: &Generics) -> String {
    let params: Vec<_> = generics
        .type_params()
        .map(|param| param.ident.to_string())
        .collect();
    match params.is_empty() {
        true => name.into(),
        false => format!("{name}<{}>", params.join(", ")),
    }
}

fn union(name: String, variants: Vec<String>) -> String {
    match variants.is_empty() {
        true => format!("export type {name} = never;"),
        false => format!("export type {name} =\n  | {};", variants.join("\n  | ")),
    }
}

fn declare(item: &Item) -> Option<(String, String)> {
    match item {
        Item::Struct(item) if serialized(&item.attrs) && enabled(&item.attrs) => {
            let name = header(&item.ident.to_string(), &item.generics);
            let declaration = match &item.fields {
                Fields::Named(named) if !named.named.is_empty() => {
                    let lines: Vec<_> = members(&item.fields)
                        .iter()
                        .map(|member| format!("  {member};\n"))
                        .collect();
                    format!("export interface {name} {{\n{}}}", lines.concat())
                }
                fields => format!(
                    "export type {name} = {};",
                    shape(fields).unwrap_or("undefined".into())
                ),
            };
            Some((item.ident.to_string(), declaration))
        }
        Item::Enum(item) if serialized(&item.attrs) && enabled(&item.attrs) => {
            let variants = item
                .variants
                .iter()
                .filter(|variant| enabled(&variant.attrs))
                .map(|variant| match shape(&variant.fields) {
                    Some(shape) => format!("{{ {}: {shape} }}", variant.ident),
                    None => format!("'{}'", variant.ident),
                })
                .collect();
            let name = header(&item.ident.to_string(), &item.generics);
            Some((item.ident.to_string(), union(name, variants)))
        }
        Item::Macro(item) if item.mac.path.is_ident("define_keywords") => {
            let tokens: Vec<_> = item.mac.tokens.clone().into_iter().collect();
            let keywords = tokens
                .split(|token| token.to_string() == ",")
                .filter_map(|chunk| chunk.first())
                .map(|keyword| format!("'{keyword}'"));
            let variants = ["'NoKeyword'".to_string()]
                .into_iter()
                .chain(keywords)
                .collect();
            Some(("Keyword".into(), union("Keyword".into(), variants)))
        }
        _ => None,
    }
}

fn main() {
    let src = sqlparser_src();
    let mut files = vec![src.join("tokenizer.rs"), src.join("keywords.rs")];
    sources(&src.join("ast"), &mut files);
    let declarations: BTreeMap<_, _> = files
        .iter()
        .flat_map(|file| {
            syn::parse_file(&fs::read_to_string(file).unwrap())
                .unwrap()
                .items
        })
        .filter_map(|item| declare(&item))
        .collect();
    let declarations: Vec<_> = declarations.into_values().collect();
    println!("{}", declarations.join("\n\n"));
}
