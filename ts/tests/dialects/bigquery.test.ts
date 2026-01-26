/**
 * BigQuery dialect tests
 * Ported from sqlparser_bigquery.rs
 */

import {
  parse,
  parseOne,
  format,
  expectParseError,
  dialects,
  ensureWasmInitialized,
  isQuery,
  isInsert,
  isCreateTable,
  isCreateView,
  isMerge,
} from '../test-utils';

const bq = dialects.bigquery;

beforeAll(async () => {
  await ensureWasmInitialized();
});

describe('BigQuery - String Literals', () => {
  test('parse_literal_string', async () => {
    await parseOne("SELECT 'single quoted'", bq);
    await parseOne('SELECT "double quoted"', bq);
    await parseOne("SELECT '''triple single'''", bq);
    await parseOne('SELECT """triple double"""', bq);
  });

  test('parse_byte_literal', async () => {
    await parseOne("SELECT B'abc'", bq);
    await parseOne('SELECT B"abc"', bq);
    await parseOne("SELECT B'''abc'''", bq);
    await parseOne('SELECT B"""abc"""', bq);
  });

  test('parse_raw_literal', async () => {
    await parseOne("SELECT R'abc'", bq);
    await parseOne('SELECT R"abc"', bq);
    await parseOne("SELECT R'''abc'''", bq);
    await parseOne('SELECT R"""abc"""', bq);
    await parseOne("SELECT R'f\\(abc,(.*),def\\)'", bq);
  });

  test('parse_triple_quote_typed_strings', async () => {
    await parseOne('SELECT JSON \'\'\'{"foo":"bar\'s"}\'\'\'', bq);
    await parseOne('SELECT JSON """{"foo":"bar\'s"}"""', bq);
  });
});

describe('BigQuery - Identifiers', () => {
  test('parse_non_reserved_column_alias', async () => {
    await parseOne('SELECT OFFSET, EXPLAIN, ANALYZE, SORT, TOP, VIEW FROM T', bq);
    await parseOne('SELECT 1 AS OFFSET, 2 AS EXPLAIN, 3 AS ANALYZE FROM T', bq);
  });

  test('parse_at_at_identifier', async () => {
    await parseOne('SELECT @@error.stack_trace, @@error.message', bq);
  });

  test('parse_table_identifiers', async () => {
    await parseOne('SELECT * FROM `project.dataset.table`', bq);
    await parseOne('SELECT * FROM `my-project.my_dataset.my_table`', bq);
  });

  test('parse_hyphenated_table_identifiers', async () => {
    await parseOne('SELECT * FROM foo-bar AS f JOIN baz-qux AS b ON f.id = b.id', bq);
    await parseOne('SELECT * FROM foo-123.bar', bq);
  });
});

describe('BigQuery - Data Types', () => {
  test('parse_nested_data_types', async () => {
    await parseOne('CREATE TABLE table1 (x STRUCT<a ARRAY<INT64>, b BYTES(42)>, y ARRAY<STRUCT<INT64>>)', bq);
  });

  test('parse_bigquery_types', async () => {
    await parseOne('CREATE TABLE t (a INT64)', bq);
    await parseOne('CREATE TABLE t (a FLOAT64)', bq);
    await parseOne('CREATE TABLE t (a BOOL)', bq);
    await parseOne('CREATE TABLE t (a STRING)', bq);
    await parseOne('CREATE TABLE t (a BYTES)', bq);
    await parseOne('CREATE TABLE t (a BYTES(42))', bq);
    await parseOne('CREATE TABLE t (a DATE)', bq);
    await parseOne('CREATE TABLE t (a DATETIME)', bq);
    await parseOne('CREATE TABLE t (a TIMESTAMP)', bq);
    await parseOne('CREATE TABLE t (a TIME)', bq);
    await parseOne('CREATE TABLE t (a NUMERIC)', bq);
    await parseOne('CREATE TABLE t (a BIGNUMERIC)', bq);
    await parseOne('CREATE TABLE t (a GEOGRAPHY)', bq);
    await parseOne('CREATE TABLE t (a JSON)', bq);
  });

  test('parse_struct_type', async () => {
    await parseOne('CREATE TABLE t (s STRUCT<x INT64, y STRING>)', bq);
    await parseOne('CREATE TABLE t (s STRUCT<x INT64, y STRUCT<a INT64, b STRING>>)', bq);
  });

  test('parse_array_type', async () => {
    await parseOne('CREATE TABLE t (a ARRAY<INT64>)', bq);
    await parseOne('CREATE TABLE t (a ARRAY<STRUCT<x INT64, y STRING>>)', bq);
  });
});

describe('BigQuery - STRUCT', () => {
  test('parse_tuple_struct_literal', async () => {
    await parseOne('SELECT (1, 2, 3)', bq);
    await parseOne("SELECT (1, 1.0, '123', true)", bq);
  });

  test('parse_typeless_struct_syntax', async () => {
    await parseOne('SELECT STRUCT(1, 2, 3)', bq);
    await parseOne("SELECT STRUCT('abc')", bq);
    await parseOne("SELECT STRUCT(1 AS a, 'abc' AS b)", bq);
  });

  test('parse_typed_struct_syntax', async () => {
    await parseOne('SELECT STRUCT<INT64>(5)', bq);
    await parseOne('SELECT STRUCT<x INT64, y STRING>(1, t.str_col)', bq);
    await parseOne('SELECT STRUCT<x INT64, y STRUCT<a INT64, b STRING>>(1, STRUCT(2, \'abc\'))', bq);
  });
});

describe('BigQuery - CREATE TABLE', () => {
  test('parse_create_table_with_options', async () => {
    await parseOne("CREATE TABLE t (id INT64) OPTIONS(description = 'test')", bq);
    await parseOne('CREATE TABLE t (id INT64) PARTITION BY DATE(created_at)', bq);
    await parseOne('CREATE TABLE t (id INT64) CLUSTER BY col1, col2', bq);
    await parseOne("CREATE TABLE t (id INT64) PARTITION BY DATE(created_at) CLUSTER BY col1 OPTIONS(description = 'test')", bq);
  });

  test('parse_create_table_as', async () => {
    await parseOne('CREATE TABLE t AS SELECT * FROM other', bq);
    await parseOne('CREATE OR REPLACE TABLE t AS SELECT * FROM other', bq);
  });
});

describe('BigQuery - CREATE VIEW', () => {
  test('parse_create_view_with_options', async () => {
    await parseOne('CREATE VIEW v AS SELECT 1', bq);
    await parseOne("CREATE VIEW v OPTIONS(description = 'test') AS SELECT 1", bq);
    await parseOne("CREATE OR REPLACE VIEW v OPTIONS(description = 'test') AS SELECT 1", bq);
  });
});

describe('BigQuery - Time Travel', () => {
  test('parse_table_time_travel', async () => {
    await parseOne("SELECT 1 FROM t1 FOR SYSTEM_TIME AS OF '2023-01-01 00:00:00'", bq);
    await parseOne('SELECT 1 FROM t1 FOR SYSTEM_TIME AS OF TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)', bq);
  });
});

describe('BigQuery - UNNEST', () => {
  test('parse_unnest', async () => {
    await parseOne('SELECT * FROM UNNEST([1, 2, 3])', bq);
    await parseOne('SELECT * FROM UNNEST([1, 2, 3]) AS num', bq);
    await parseOne('SELECT * FROM UNNEST([1, 2, 3]) AS num WITH OFFSET', bq);
    await parseOne('SELECT * FROM UNNEST([1, 2, 3]) AS num WITH OFFSET AS idx', bq);
  });

  test('parse_join_constraint_unnest_alias', async () => {
    await parseOne('SELECT * FROM t1 JOIN UNNEST(t1.a) AS f ON c1 = c2', bq);
  });
});

describe('BigQuery - MERGE', () => {
  test('parse_merge', async () => {
    await parseOne(`
      MERGE INTO target_table AS t
      USING source_table AS s
      ON t.id = s.id
      WHEN MATCHED THEN
        UPDATE SET t.value = s.value
      WHEN NOT MATCHED THEN
        INSERT (id, value) VALUES (s.id, s.value)
    `, bq);
  });

  test('parse_merge_with_delete', async () => {
    await parseOne(`
      MERGE INTO target AS t
      USING source AS s
      ON t.id = s.id
      WHEN MATCHED AND s.deleted THEN DELETE
      WHEN MATCHED THEN UPDATE SET t.value = s.value
      WHEN NOT MATCHED THEN INSERT (id) VALUES (s.id)
    `, bq);
  });
});

describe('BigQuery - DELETE', () => {
  test('parse_delete_statement', async () => {
    await parseOne('DELETE FROM table1 WHERE 1', bq);
    await parseOne('DELETE "table" WHERE 1', bq);
  });
});

describe('BigQuery - Trailing Comma', () => {
  test('parse_trailing_comma', async () => {
    await parseOne('SELECT a, FROM t', bq);
    await parseOne('SELECT 1,', bq);
    await parseOne('SELECT a, b, FROM t', bq);
  });
});

describe('BigQuery - CAST', () => {
  test('parse_cast_type', async () => {
    await parseOne('SELECT SAFE_CAST(1 AS INT64)', bq);
    await parseOne('SELECT CAST(1 AS INT64)', bq);
  });

  test('parse_cast_date_format', async () => {
    await parseOne("SELECT CAST(date_valid_from AS DATE FORMAT 'YYYY-MM-DD')", bq);
  });

  test('parse_cast_time_format', async () => {
    await parseOne("SELECT CAST(TIME '21:30:00' AS STRING FORMAT 'PM')", bq);
  });

  test('parse_cast_timestamp_format_tz', async () => {
    await parseOne("SELECT CAST(TIMESTAMP '2008-12-25 00:00:00+00:00' AS STRING FORMAT 'TZH' AT TIME ZONE 'Asia/Kolkata')", bq);
  });
});

describe('BigQuery - Array Functions', () => {
  test('parse_array_agg_func', async () => {
    await parseOne('SELECT ARRAY_AGG(x ORDER BY x)', bq);
    await parseOne('SELECT ARRAY_AGG(x ORDER BY x LIMIT 10)', bq);
    await parseOne('SELECT ARRAY_AGG(DISTINCT x)', bq);
  });

  test('parse_array_agg', async () => {
    await parseOne('SELECT ARRAY_AGG(state)', bq);
    await parseOne('SELECT ARRAY_CONCAT_AGG(x LIMIT 2)', bq);
    await parseOne('SELECT ARRAY_AGG(DISTINCT state IGNORE NULLS ORDER BY population DESC LIMIT 10)', bq);
  });
});

describe('BigQuery - DECLARE', () => {
  test('parse_declare', async () => {
    await parseOne('DECLARE x INT64', bq);
    await parseOne('DECLARE x INT64 DEFAULT 42', bq);
    await parseOne('DECLARE x, y, z INT64 DEFAULT 42', bq);
  });
});

describe('BigQuery - Map Access', () => {
  test('parse_map_access_expr', async () => {
    await parseOne('SELECT users[-1][SAFE_OFFSET(2)].a.b', bq);
    await parseOne('SELECT myfunc()[-1].a[SAFE_OFFSET(2)].b', bq);
  });
});

describe('BigQuery - CREATE FUNCTION', () => {
  test('parse_create_function', async () => {
    await parseOne("CREATE FUNCTION my_func(x INT64) AS (x * 2)", bq);
    await parseOne("CREATE OR REPLACE FUNCTION my_func(x INT64) RETURNS INT64 AS (x * 2)", bq);
    await parseOne("CREATE TEMPORARY FUNCTION my_func(x INT64) AS (x * 2)", bq);
    await parseOne("CREATE FUNCTION my_func(x ANY TYPE) RETURNS INT64 AS (1)", bq);
  });

  test('parse_create_function_with_options', async () => {
    await parseOne("CREATE FUNCTION my_func(x INT64) AS (x * 2) OPTIONS(description = 'test')", bq);
  });
});

describe('BigQuery - TRIM', () => {
  test('parse_trim', async () => {
    await parseOne("SELECT TRIM('xyz', 'a')", bq);
    await parseOne('SELECT TRIM(item_price_id, \'"\')', bq);
  });
});

describe('BigQuery - EXTRACT', () => {
  test('parse_extract_weekday', async () => {
    await parseOne('SELECT EXTRACT(WEEK(MONDAY) FROM d)', bq);
    await parseOne('SELECT EXTRACT(DAYOFWEEK FROM d)', bq);
  });
});

describe('BigQuery - SELECT AS STRUCT/VALUE', () => {
  test('parse_select_as_struct', async () => {
    await parseOne('SELECT AS STRUCT STRUCT(123 AS a, false AS b)', bq);
    await parseOne('SELECT DISTINCT AS STRUCT STRUCT(123 AS a, false AS b)', bq);
  });

  test('parse_select_as_value', async () => {
    await parseOne('SELECT AS VALUE STRUCT(5 AS star_rating, false AS up_down_rating)', bq);
  });
});

describe('BigQuery - Star with EXCEPT/REPLACE', () => {
  test('parse_select_star_except', async () => {
    await parseOne('SELECT * EXCEPT (col1, col2) FROM t', bq);
    await parseOne("SELECT STRUCT<STRING>('foo')[0].* EXCEPT (foo) FROM t", bq);
  });

  test('parse_select_star_replace', async () => {
    await parseOne('SELECT * REPLACE (col1 AS new_col1) FROM t', bq);
  });
});

describe('BigQuery - ANY_VALUE', () => {
  test('parse_any_value', async () => {
    await parseOne('SELECT ANY_VALUE(fruit)', bq);
    await parseOne('SELECT ANY_VALUE(fruit) OVER (PARTITION BY category)', bq);
    await parseOne('SELECT ANY_VALUE(fruit HAVING MAX price)', bq);
  });
});

describe('BigQuery - STRUCT field OPTIONS', () => {
  test('parse_struct_field_options', async () => {
    await parseOne("CREATE TABLE t (s STRUCT<x INT64 OPTIONS(description = 'the x field')>)", bq);
  });
});

describe('BigQuery - EXPORT DATA', () => {
  test('parse_export_data', async () => {
    await parseOne("EXPORT DATA OPTIONS(uri = 'gs://bucket/file.csv', format = 'CSV') AS SELECT * FROM t", bq);
  });
});

describe('BigQuery - BEGIN/END Blocks', () => {
  test('parse_begin', async () => {
    await parseOne('BEGIN SELECT 1; END', bq);
    await parseOne('BEGIN SELECT 1; SELECT 2; END', bq);
  });

  test('parse_begin_with_exception', async () => {
    await parseOne(`
      BEGIN
        SELECT 1;
      EXCEPTION WHEN ERROR THEN
        SELECT 2;
      END
    `, bq);
  });
});

describe('BigQuery - JSON Operations', () => {
  test('parse_json_type', async () => {
    await parseOne('CREATE TABLE t (data JSON)', bq);
  });

  test('parse_json_subscript', async () => {
    await parseOne("SELECT json_col['key'] FROM t", bq);
    await parseOne("SELECT json_col['key1']['key2'] FROM t", bq);
  });
});

describe('BigQuery - Window Functions', () => {
  test('parse_window_functions', async () => {
    await parseOne('SELECT ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) FROM t', bq);
    await parseOne('SELECT RANK() OVER (ORDER BY score DESC) FROM t', bq);
    await parseOne('SELECT DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) FROM t', bq);
  });
});

describe('BigQuery - Parameterized Queries', () => {
  test('parse_positional_parameters', async () => {
    await parseOne('SELECT * FROM t WHERE id = ?', bq);
  });

  test('parse_named_parameters', async () => {
    await parseOne('SELECT * FROM t WHERE id = @id', bq);
    await parseOne('SELECT * FROM t WHERE name = @name AND age = @age', bq);
  });
});

describe('BigQuery - QUALIFY', () => {
  test('parse_qualify', async () => {
    await parseOne('SELECT * FROM t QUALIFY ROW_NUMBER() OVER (PARTITION BY x ORDER BY y) = 1', bq);
  });
});

describe('BigQuery - TABLESAMPLE', () => {
  test('parse_tablesample', async () => {
    await parseOne('SELECT * FROM t TABLESAMPLE SYSTEM (10 PERCENT)', bq);
  });
});
