/**
 * DuckDB dialect tests
 * Ported from sqlparser_duckdb.rs
 */

import {
  parseOne,
  dialects,
} from '../test-utils';

const duckdb = dialects.duckdb;

describe('DuckDB - STRUCT Type', () => {
  test('parse_struct', () => {
    parseOne('CREATE TABLE t1 (s STRUCT(v VARCHAR, i INTEGER))', duckdb);
    parseOne('CREATE TABLE t1 (s STRUCT(v VARCHAR, i INTEGER)[])', duckdb);
    parseOne('CREATE TABLE t1 (s STRUCT(v VARCHAR, s STRUCT(a1 INTEGER, a2 VARCHAR))[])', duckdb);
  });

  test('parse_struct_literal', () => {
    parseOne("SELECT {'a': 1, 'b': 2, 'c': 3}", duckdb);
    parseOne("SELECT [{'a': 'abc'}]", duckdb);
    parseOne("SELECT {'a': 1, 'b': [t.str_col]}", duckdb);
  });
});

describe('DuckDB - UNION Type', () => {
  test('parse_union_datatype', () => {
    parseOne('CREATE TABLE tbl1 (one UNION(a INT))', duckdb);
    parseOne('CREATE TABLE tbl1 (two UNION(a INT, b INT))', duckdb);
    parseOne('CREATE TABLE tbl1 (nested UNION(a UNION(b INT)))', duckdb);
  });
});

describe('DuckDB - Wildcard Modifiers', () => {
  test('parse_select_wildcard_with_exclude', () => {
    parseOne('SELECT * EXCLUDE (col_a) FROM data', duckdb);
    parseOne('SELECT name.* EXCLUDE department_id FROM employee_table', duckdb);
    parseOne('SELECT * EXCLUDE (department_id, employee_id) FROM employee_table', duckdb);
  });

  test('parse_select_wildcard_with_replace', () => {
    parseOne('SELECT * REPLACE (col_a * 2 AS col_a) FROM data', duckdb);
  });
});

describe('DuckDB - Integer Division', () => {
  test('parse_div_infix', () => {
    parseOne('SELECT 5 // 2', duckdb);
  });
});

describe('DuckDB - Macros', () => {
  test('parse_create_macro', () => {
    parseOne('CREATE MACRO schema.add(a, b) AS a + b', duckdb);
    parseOne('CREATE MACRO my_macro(x) AS x * 2', duckdb);
  });

  test('parse_create_macro_default_args', () => {
    parseOne('CREATE MACRO add_default(a, b := 5) AS a + b', duckdb);
  });

  test('parse_create_table_macro', () => {
    parseOne('CREATE OR REPLACE TEMPORARY MACRO dynamic_table(col1_value, col2_value) AS TABLE SELECT col1_value AS col1, col2_value AS col2', duckdb);
  });
});

describe('DuckDB - UNION BY NAME', () => {
  test('parse_select_union_by_name', () => {
    parseOne('SELECT * FROM capitals UNION BY NAME SELECT * FROM weather', duckdb);
    parseOne('SELECT * FROM capitals UNION ALL BY NAME SELECT * FROM weather', duckdb);
    parseOne('SELECT * FROM capitals UNION DISTINCT BY NAME SELECT * FROM weather', duckdb);
  });
});

describe('DuckDB - Extensions', () => {
  test('parse_install', () => {
    parseOne('INSTALL tpch', duckdb);
    parseOne('INSTALL httpfs', duckdb);
  });

  test('parse_load_extension', () => {
    parseOne('LOAD my_extension', duckdb);
    parseOne('LOAD httpfs', duckdb);
  });
});

describe('DuckDB - Integer Types', () => {
  test('parse_duckdb_specific_int_types', () => {
    parseOne('SELECT 123::UTINYINT', duckdb);
    parseOne('SELECT 123::USMALLINT', duckdb);
    parseOne('SELECT 123::UBIGINT', duckdb);
    parseOne('SELECT 123::UHUGEINT', duckdb);
    parseOne('SELECT 123::HUGEINT', duckdb);
  });
});

describe('DuckDB - Secrets', () => {
  test('parse_create_secret', () => {
    parseOne('CREATE SECRET ( TYPE type )', duckdb);
    parseOne("CREATE OR REPLACE PERSISTENT SECRET IF NOT EXISTS name IN storage ( TYPE type, KEY 'value' )", duckdb);
  });

  test('parse_drop_secret', () => {
    parseOne('DROP SECRET secret', duckdb);
    parseOne('DROP PERSISTENT SECRET IF EXISTS secret FROM storage', duckdb);
  });
});

describe('DuckDB - ATTACH/DETACH', () => {
  test('parse_attach_database', () => {
    parseOne("ATTACH 'sqlite_file.db' AS sqlite_db", duckdb);
    parseOne("ATTACH DATABASE IF NOT EXISTS 'sqlite_file.db' AS sqlite_db (TYPE sqlite)", duckdb);
    parseOne("ATTACH 'postgres://user.name:pass-word@some.url.com:5432/postgres'", duckdb);
  });

  test('parse_detach_database', () => {
    parseOne('DETACH db_name', duckdb);
    parseOne('DETACH DATABASE IF EXISTS db_name', duckdb);
  });
});

describe('DuckDB - Named Arguments', () => {
  test('parse_named_argument_function', () => {
    parseOne("SELECT FUN(a := '1', b := '2') FROM foo", duckdb);
    parseOne("SELECT read_csv(filename := 'test.csv', header := true)", duckdb);
  });
});

describe('DuckDB - Array Index', () => {
  test('parse_array_index', () => {
    parseOne("SELECT ['a', 'b', 'c'][3] AS three", duckdb);
    parseOne('SELECT arr[1] FROM t', duckdb);
    parseOne('SELECT arr[1][2] FROM t', duckdb);
  });
});

describe('DuckDB - USE', () => {
  test('parse_use', () => {
    parseOne('USE mydb', duckdb);
    parseOne('USE "mydb"', duckdb);
    parseOne("USE 'mydb'", duckdb);
    parseOne('USE mydb.my_schema', duckdb);
    parseOne('USE "CATALOG"."my_schema"', duckdb);
  });
});

describe('DuckDB - TRIM', () => {
  test('parse_trim', () => {
    parseOne("SELECT TRIM('xyz', 'a')", duckdb);
    parseOne('SELECT customer_id, TRIM(item_price_id, \'"\') AS item_price_id FROM t', duckdb);
  });
});

describe('DuckDB - EXTRACT with Quotes', () => {
  test('parse_extract_single_quotes', () => {
    parseOne("SELECT EXTRACT('month' FROM my_timestamp) FROM my_table", duckdb);
    parseOne("SELECT EXTRACT('year' FROM date_col)", duckdb);
  });
});

describe('DuckDB - Lambda Functions', () => {
  test.skip('parse_lambda_function', () => {
    // Lambda functions not yet fully supported
    parseOne('SELECT [3, 4, 5, 6].list_filter(lambda x : x > 4)', duckdb);
    parseOne('SELECT list_filter([1, 2, 3], x -> x > 1)', duckdb);
    parseOne('SELECT list_filter([1, 3, 1, 5], lambda x, i : x > i)', duckdb);
    parseOne('SELECT list_transform([1, 2, 3], lambda x : x * 2)', duckdb);
  });
});

describe('DuckDB - COPY', () => {
  test('parse_copy', () => {
    parseOne("COPY t TO 'file.csv'", duckdb);
    parseOne("COPY t TO 'file.csv' (FORMAT CSV, HEADER true)", duckdb);
    parseOne("COPY t FROM 'file.csv'", duckdb);
    parseOne("COPY (SELECT * FROM t) TO 'file.csv'", duckdb);
  });
});

describe('DuckDB - PIVOT/UNPIVOT', () => {
  test('parse_pivot', () => {
    parseOne(`
      SELECT * FROM t
      PIVOT (SUM(amount) FOR year IN (2020, 2021, 2022))
    `, duckdb);
  });

  test('parse_unpivot', () => {
    parseOne(`
      SELECT * FROM t
      UNPIVOT (value FOR year IN (y2020, y2021, y2022))
    `, duckdb);
  });
});

describe('DuckDB - DESCRIBE', () => {
  test('parse_describe', () => {
    parseOne('DESCRIBE t', duckdb);
    parseOne('DESCRIBE SELECT * FROM t', duckdb);
  });
});

describe('DuckDB - EXPLAIN', () => {
  test('parse_explain', () => {
    parseOne('EXPLAIN SELECT * FROM t', duckdb);
    parseOne('EXPLAIN ANALYZE SELECT * FROM t', duckdb);
  });
});

describe('DuckDB - SAMPLE', () => {
  test.skip('parse_sample', () => {
    // SAMPLE clauses not yet fully supported
    parseOne('SELECT * FROM t USING SAMPLE 10%', duckdb);
    parseOne('SELECT * FROM t USING SAMPLE 100 ROWS', duckdb);
    parseOne('SELECT * FROM t TABLESAMPLE RESERVOIR(10%)', duckdb);
  });
});

describe('DuckDB - ASOF JOIN', () => {
  test.skip('parse_asof_join', () => {
    // ASOF JOIN not yet fully supported
    parseOne('SELECT * FROM t1 ASOF JOIN t2 ON t1.ts >= t2.ts', duckdb);
    parseOne('SELECT * FROM t1 ASOF LEFT JOIN t2 ON t1.ts >= t2.ts', duckdb);
  });
});

describe('DuckDB - POSITIONAL JOIN', () => {
  test('parse_positional_join', () => {
    parseOne('SELECT * FROM t1 POSITIONAL JOIN t2', duckdb);
  });
});

describe('DuckDB - QUALIFY', () => {
  test('parse_qualify', () => {
    parseOne('SELECT * FROM t QUALIFY ROW_NUMBER() OVER () = 1', duckdb);
  });
});

describe('DuckDB - GROUP BY ALL', () => {
  test('parse_group_by_all', () => {
    parseOne('SELECT category, COUNT(*) FROM t GROUP BY ALL', duckdb);
  });
});

describe('DuckDB - ORDER BY ALL', () => {
  test('parse_order_by_all', () => {
    parseOne('SELECT * FROM t ORDER BY ALL', duckdb);
    parseOne('SELECT * FROM t ORDER BY ALL DESC', duckdb);
  });
});

describe('DuckDB - COLUMNS Expression', () => {
  test('parse_columns_expression', () => {
    parseOne("SELECT COLUMNS('.*_id') FROM t", duckdb);
    parseOne("SELECT MIN(COLUMNS(*)) FROM t", duckdb);
  });
});

describe('DuckDB - Recursive CTE', () => {
  test('parse_recursive_cte', () => {
    parseOne(`
      WITH RECURSIVE cnt AS (
        SELECT 1 AS n
        UNION ALL
        SELECT n + 1 FROM cnt WHERE n < 10
      )
      SELECT * FROM cnt
    `, duckdb);
  });
});

describe('DuckDB - Window Functions', () => {
  test('parse_window_functions', () => {
    parseOne('SELECT ROW_NUMBER() OVER () FROM t', duckdb);
    parseOne('SELECT RANK() OVER (ORDER BY x) FROM t', duckdb);
    parseOne('SELECT LAG(x, 1) OVER (ORDER BY y) FROM t', duckdb);
    parseOne('SELECT LEAD(x, 1) OVER (PARTITION BY category ORDER BY y) FROM t', duckdb);
  });
});

describe('DuckDB - List Functions', () => {
  test('parse_list_functions', () => {
    parseOne('SELECT list_value(1, 2, 3)', duckdb);
    parseOne('SELECT list_aggregate([1, 2, 3], \'sum\')', duckdb);
    parseOne('SELECT list_sort([3, 1, 2])', duckdb);
    parseOne('SELECT list_distinct([1, 1, 2, 2, 3])', duckdb);
  });
});

describe('DuckDB - Map Functions', () => {
  test('parse_map_functions', () => {
    parseOne("SELECT map([1, 2], ['a', 'b'])", duckdb);
    parseOne("SELECT map_from_entries([{'key': 1, 'value': 'a'}])", duckdb);
  });
});

describe('DuckDB - JSON Functions', () => {
  test('parse_json_functions', () => {
    parseOne("SELECT json_extract(data, '$.key')", duckdb);
    parseOne("SELECT data->>'$.key'", duckdb);
    parseOne("SELECT data->'$.key'", duckdb);
  });
});

describe('DuckDB - Struct Access', () => {
  test('parse_struct_access', () => {
    parseOne('SELECT s.field FROM t', duckdb);
    parseOne("SELECT struct_extract(s, 'field')", duckdb);
  });
});

describe('DuckDB - Try/Catch Cast', () => {
  test('parse_try_cast', () => {
    parseOne("SELECT TRY_CAST('abc' AS INTEGER)", duckdb);
  });
});
