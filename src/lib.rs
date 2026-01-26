use wasm_bindgen::prelude::*;
use sqlparser::dialect::{
    AnsiDialect, BigQueryDialect, ClickHouseDialect, DatabricksDialect,
    Dialect, DuckDbDialect, GenericDialect, HiveDialect, MsSqlDialect,
    MySqlDialect, PostgreSqlDialect, RedshiftSqlDialect, SQLiteDialect,
    SnowflakeDialect,
};
use sqlparser::parser::Parser;
use serde::{Deserialize, Serialize};

#[wasm_bindgen(start)]
pub fn init() {
    console_error_panic_hook::set_once();
}

/// Parser options that can be configured
#[derive(Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ParserOptions {
    #[serde(default)]
    pub trailing_commas: bool,
    #[serde(default)]
    pub recursion_limit: Option<usize>,
}

/// Error information with location details
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ParseError {
    pub message: String,
    pub line: Option<u64>,
    pub column: Option<u64>,
}

fn get_dialect(dialect_name: &str) -> Box<dyn Dialect> {
    match dialect_name.to_lowercase().as_str() {
        "generic" => Box::new(GenericDialect {}),
        "ansi" => Box::new(AnsiDialect {}),
        "mysql" => Box::new(MySqlDialect {}),
        "postgresql" | "postgres" => Box::new(PostgreSqlDialect {}),
        "sqlite" => Box::new(SQLiteDialect {}),
        "snowflake" => Box::new(SnowflakeDialect),
        "redshift" => Box::new(RedshiftSqlDialect {}),
        "mssql" | "sqlserver" => Box::new(MsSqlDialect {}),
        "clickhouse" => Box::new(ClickHouseDialect {}),
        "bigquery" => Box::new(BigQueryDialect),
        "duckdb" => Box::new(DuckDbDialect {}),
        "databricks" => Box::new(DatabricksDialect {}),
        "hive" => Box::new(HiveDialect {}),
        // Oracle dialect may not be available in all versions
        _ => Box::new(GenericDialect {}),
    }
}

/// Parse SQL and return the AST as a JSON value
#[wasm_bindgen]
pub fn parse_sql(dialect: &str, sql: &str) -> Result<JsValue, JsValue> {
    parse_sql_with_options(dialect, sql, JsValue::UNDEFINED)
}

/// Parse SQL with options and return the AST as a JSON value
#[wasm_bindgen]
pub fn parse_sql_with_options(
    dialect: &str,
    sql: &str,
    options: JsValue,
) -> Result<JsValue, JsValue> {
    let dialect_impl = get_dialect(dialect);

    let options: ParserOptions = if options.is_undefined() || options.is_null() {
        ParserOptions::default()
    } else {
        serde_wasm_bindgen::from_value(options)
            .map_err(|e| JsValue::from_str(&format!("Invalid options: {}", e)))?
    };

    let mut parser = Parser::new(dialect_impl.as_ref());

    if let Some(limit) = options.recursion_limit {
        parser = parser.with_recursion_limit(limit);
    }

    // Note: trailing_commas option support depends on sqlparser version

    let tokens = sqlparser::tokenizer::Tokenizer::new(dialect_impl.as_ref(), sql)
        .tokenize()
        .map_err(|e| {
            let error = ParseError {
                message: e.to_string(),
                line: None,
                column: None,
            };
            serde_wasm_bindgen::to_value(&error).unwrap_or(JsValue::from_str(&e.to_string()))
        })?;

    parser = parser.with_tokens(tokens);

    let statements = parser.parse_statements().map_err(|e| {
        let error = ParseError {
            message: e.to_string(),
            line: None,
            column: None,
        };
        serde_wasm_bindgen::to_value(&error).unwrap_or(JsValue::from_str(&e.to_string()))
    })?;

    serde_wasm_bindgen::to_value(&statements)
        .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
}

/// Parse SQL and return the AST as a JSON string
#[wasm_bindgen]
pub fn parse_sql_to_json_string(dialect: &str, sql: &str) -> Result<String, JsValue> {
    let dialect_impl = get_dialect(dialect);

    let statements = Parser::parse_sql(dialect_impl.as_ref(), sql).map_err(|e| {
        JsValue::from_str(&e.to_string())
    })?;

    serde_json::to_string_pretty(&statements)
        .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
}

/// Parse SQL and return a string representation of the AST
#[wasm_bindgen]
pub fn parse_sql_to_string(dialect: &str, sql: &str) -> Result<String, JsValue> {
    let dialect_impl = get_dialect(dialect);

    let statements = Parser::parse_sql(dialect_impl.as_ref(), sql).map_err(|e| {
        JsValue::from_str(&e.to_string())
    })?;

    Ok(statements
        .iter()
        .map(|s| s.to_string())
        .collect::<Vec<_>>()
        .join(";\n"))
}

/// Format SQL by parsing and regenerating it (round-trip)
#[wasm_bindgen]
pub fn format_sql(dialect: &str, sql: &str) -> Result<String, JsValue> {
    parse_sql_to_string(dialect, sql)
}

/// Get a list of all supported dialect names
#[wasm_bindgen]
pub fn get_supported_dialects() -> JsValue {
    let dialects = vec![
        "generic",
        "ansi",
        "mysql",
        "postgresql",
        "sqlite",
        "snowflake",
        "redshift",
        "mssql",
        "clickhouse",
        "bigquery",
        "duckdb",
        "databricks",
        "hive",
    ];

    serde_wasm_bindgen::to_value(&dialects).unwrap()
}

/// Validate SQL syntax without returning the full AST
#[wasm_bindgen]
pub fn validate_sql(dialect: &str, sql: &str) -> Result<bool, JsValue> {
    let dialect_impl = get_dialect(dialect);

    match Parser::parse_sql(dialect_impl.as_ref(), sql) {
        Ok(_) => Ok(true),
        Err(e) => Err(serde_wasm_bindgen::to_value(&ParseError {
            message: e.to_string(),
            line: None,
            column: None,
        }).unwrap_or(JsValue::from_str(&e.to_string()))),
    }
}
