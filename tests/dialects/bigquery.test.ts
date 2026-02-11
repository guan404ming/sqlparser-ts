/**
 * BigQuery dialect tests
 * Ported from sqlparser_bigquery.rs
 */

import {
  parseOne,
  dialects,
} from '../test-utils';

const bq = dialects.bigquery;

describe('BigQuery - String Literals', () => {
  test('parse_literal_string', () => {
    parseOne("SELECT 'single quoted'", bq);
    parseOne('SELECT "double quoted"', bq);
    parseOne("SELECT '''triple single'''", bq);
    parseOne('SELECT """triple double"""', bq);
  });

  test('parse_byte_literal', () => {
    parseOne("SELECT B'abc'", bq);
    parseOne('SELECT B"abc"', bq);
    parseOne("SELECT B'''abc'''", bq);
    parseOne('SELECT B"""abc"""', bq);
  });

  test('parse_raw_literal', () => {
    parseOne("SELECT R'abc'", bq);
    parseOne('SELECT R"abc"', bq);
    parseOne("SELECT R'''abc'''", bq);
    parseOne('SELECT R"""abc"""', bq);
    parseOne("SELECT R'f\\(abc,(.*),def\\)'", bq);
  });

  test('parse_triple_quote_typed_strings', () => {
    parseOne('SELECT JSON \'\'\'{"foo":"bar\'s"}\'\'\'', bq);
    parseOne('SELECT JSON """{"foo":"bar\'s"}"""', bq);
  });
});

describe('BigQuery - Identifiers', () => {
  test('parse_non_reserved_column_alias', () => {
    parseOne('SELECT OFFSET, EXPLAIN, ANALYZE, SORT, TOP, VIEW FROM T', bq);
    parseOne('SELECT 1 AS OFFSET, 2 AS EXPLAIN, 3 AS ANALYZE FROM T', bq);
  });

  test('parse_at_at_identifier', () => {
    parseOne('SELECT @@error.stack_trace, @@error.message', bq);
  });

  test('parse_table_identifiers', () => {
    parseOne('SELECT * FROM `project.dataset.table`', bq);
    parseOne('SELECT * FROM `my-project.my_dataset.my_table`', bq);
  });

  test('parse_hyphenated_table_identifiers', () => {
    parseOne('SELECT * FROM foo-bar AS f JOIN baz-qux AS b ON f.id = b.id', bq);
    parseOne('SELECT * FROM foo-123.bar', bq);
  });
});

describe('BigQuery - Data Types', () => {
  test('parse_nested_data_types', () => {
    parseOne('CREATE TABLE table1 (x STRUCT<a ARRAY<INT64>, b BYTES(42)>, y ARRAY<STRUCT<INT64>>)', bq);
  });

  test('parse_bigquery_types', () => {
    parseOne('CREATE TABLE t (a INT64)', bq);
    parseOne('CREATE TABLE t (a FLOAT64)', bq);
    parseOne('CREATE TABLE t (a BOOL)', bq);
    parseOne('CREATE TABLE t (a STRING)', bq);
    parseOne('CREATE TABLE t (a BYTES)', bq);
    parseOne('CREATE TABLE t (a BYTES(42))', bq);
    parseOne('CREATE TABLE t (a DATE)', bq);
    parseOne('CREATE TABLE t (a DATETIME)', bq);
    parseOne('CREATE TABLE t (a TIMESTAMP)', bq);
    parseOne('CREATE TABLE t (a TIME)', bq);
    parseOne('CREATE TABLE t (a NUMERIC)', bq);
    parseOne('CREATE TABLE t (a BIGNUMERIC)', bq);
    parseOne('CREATE TABLE t (a GEOGRAPHY)', bq);
    parseOne('CREATE TABLE t (a JSON)', bq);
  });

  test('parse_struct_type', () => {
    parseOne('CREATE TABLE t (s STRUCT<x INT64, y STRING>)', bq);
    parseOne('CREATE TABLE t (s STRUCT<x INT64, y STRUCT<a INT64, b STRING>>)', bq);
  });

  test('parse_array_type', () => {
    parseOne('CREATE TABLE t (a ARRAY<INT64>)', bq);
    parseOne('CREATE TABLE t (a ARRAY<STRUCT<x INT64, y STRING>>)', bq);
  });
});

describe('BigQuery - STRUCT', () => {
  test('parse_tuple_struct_literal', () => {
    parseOne('SELECT (1, 2, 3)', bq);
    parseOne("SELECT (1, 1.0, '123', true)", bq);
  });

  test('parse_typeless_struct_syntax', () => {
    parseOne('SELECT STRUCT(1, 2, 3)', bq);
    parseOne("SELECT STRUCT('abc')", bq);
    parseOne("SELECT STRUCT(1 AS a, 'abc' AS b)", bq);
  });

  test('parse_typed_struct_syntax', () => {
    parseOne('SELECT STRUCT<INT64>(5)', bq);
    parseOne('SELECT STRUCT<x INT64, y STRING>(1, t.str_col)', bq);
    parseOne('SELECT STRUCT<x INT64, y STRUCT<a INT64, b STRING>>(1, STRUCT(2, \'abc\'))', bq);
  });
});

describe('BigQuery - CREATE TABLE', () => {
  test('parse_create_table_with_options', () => {
    parseOne("CREATE TABLE t (id INT64) OPTIONS(description = 'test')", bq);
    parseOne('CREATE TABLE t (id INT64) PARTITION BY DATE(created_at)', bq);
    parseOne('CREATE TABLE t (id INT64) CLUSTER BY col1, col2', bq);
    parseOne("CREATE TABLE t (id INT64) PARTITION BY DATE(created_at) CLUSTER BY col1 OPTIONS(description = 'test')", bq);
  });

  test('parse_create_table_as', () => {
    parseOne('CREATE TABLE t AS SELECT * FROM other', bq);
    parseOne('CREATE OR REPLACE TABLE t AS SELECT * FROM other', bq);
  });
});

describe('BigQuery - CREATE VIEW', () => {
  test('parse_create_view_with_options', () => {
    parseOne('CREATE VIEW v AS SELECT 1', bq);
    parseOne("CREATE VIEW v OPTIONS(description = 'test') AS SELECT 1", bq);
    parseOne("CREATE OR REPLACE VIEW v OPTIONS(description = 'test') AS SELECT 1", bq);
  });
});

describe('BigQuery - Time Travel', () => {
  test('parse_table_time_travel', () => {
    parseOne("SELECT 1 FROM t1 FOR SYSTEM_TIME AS OF '2023-01-01 00:00:00'", bq);
    parseOne('SELECT 1 FROM t1 FOR SYSTEM_TIME AS OF TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)', bq);
  });
});

describe('BigQuery - UNNEST', () => {
  test('parse_unnest', () => {
    parseOne('SELECT * FROM UNNEST([1, 2, 3])', bq);
    parseOne('SELECT * FROM UNNEST([1, 2, 3]) AS num', bq);
    parseOne('SELECT * FROM UNNEST([1, 2, 3]) AS num WITH OFFSET', bq);
    parseOne('SELECT * FROM UNNEST([1, 2, 3]) AS num WITH OFFSET AS idx', bq);
  });

  test('parse_join_constraint_unnest_alias', () => {
    parseOne('SELECT * FROM t1 JOIN UNNEST(t1.a) AS f ON c1 = c2', bq);
  });
});

describe('BigQuery - MERGE', () => {
  test('parse_merge', () => {
    parseOne(`
      MERGE INTO target_table AS t
      USING source_table AS s
      ON t.id = s.id
      WHEN MATCHED THEN
        UPDATE SET t.value = s.value
      WHEN NOT MATCHED THEN
        INSERT (id, value) VALUES (s.id, s.value)
    `, bq);
  });

  test('parse_merge_with_delete', () => {
    parseOne(`
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
  test('parse_delete_statement', () => {
    parseOne('DELETE FROM table1 WHERE 1', bq);
    parseOne('DELETE "table" WHERE 1', bq);
  });
});

describe('BigQuery - Trailing Comma', () => {
  test('parse_trailing_comma', () => {
    parseOne('SELECT a, FROM t', bq);
    parseOne('SELECT 1,', bq);
    parseOne('SELECT a, b, FROM t', bq);
  });
});

describe('BigQuery - CAST', () => {
  test('parse_cast_type', () => {
    parseOne('SELECT SAFE_CAST(1 AS INT64)', bq);
    parseOne('SELECT CAST(1 AS INT64)', bq);
  });

  test('parse_cast_date_format', () => {
    parseOne("SELECT CAST(date_valid_from AS DATE FORMAT 'YYYY-MM-DD')", bq);
  });

  test('parse_cast_time_format', () => {
    parseOne("SELECT CAST(TIME '21:30:00' AS STRING FORMAT 'PM')", bq);
  });

  test('parse_cast_timestamp_format_tz', () => {
    parseOne("SELECT CAST(TIMESTAMP '2008-12-25 00:00:00+00:00' AS STRING FORMAT 'TZH' AT TIME ZONE 'Asia/Kolkata')", bq);
  });
});

describe('BigQuery - Array Functions', () => {
  test('parse_array_agg_func', () => {
    parseOne('SELECT ARRAY_AGG(x ORDER BY x)', bq);
    parseOne('SELECT ARRAY_AGG(x ORDER BY x LIMIT 10)', bq);
    parseOne('SELECT ARRAY_AGG(DISTINCT x)', bq);
  });

  test('parse_array_agg', () => {
    parseOne('SELECT ARRAY_AGG(state)', bq);
    parseOne('SELECT ARRAY_CONCAT_AGG(x LIMIT 2)', bq);
    parseOne('SELECT ARRAY_AGG(DISTINCT state IGNORE NULLS ORDER BY population DESC LIMIT 10)', bq);
  });
});

describe('BigQuery - DECLARE', () => {
  test('parse_declare', () => {
    parseOne('DECLARE x INT64', bq);
    parseOne('DECLARE x INT64 DEFAULT 42', bq);
    parseOne('DECLARE x, y, z INT64 DEFAULT 42', bq);
  });
});

describe('BigQuery - Map Access', () => {
  test('parse_map_access_expr', () => {
    parseOne('SELECT users[-1][SAFE_OFFSET(2)].a.b', bq);
    parseOne('SELECT myfunc()[-1].a[SAFE_OFFSET(2)].b', bq);
  });
});

describe('BigQuery - CREATE FUNCTION', () => {
  test('parse_create_function', () => {
    parseOne("CREATE FUNCTION my_func(x INT64) AS (x * 2)", bq);
    parseOne("CREATE OR REPLACE FUNCTION my_func(x INT64) RETURNS INT64 AS (x * 2)", bq);
    parseOne("CREATE TEMPORARY FUNCTION my_func(x INT64) AS (x * 2)", bq);
    parseOne("CREATE FUNCTION my_func(x ANY TYPE) RETURNS INT64 AS (1)", bq);
  });

  test('parse_create_function_with_options', () => {
    parseOne("CREATE FUNCTION my_func(x INT64) AS (x * 2) OPTIONS(description = 'test')", bq);
  });
});

describe('BigQuery - TRIM', () => {
  test('parse_trim', () => {
    parseOne("SELECT TRIM('xyz', 'a')", bq);
    parseOne('SELECT TRIM(item_price_id, \'"\')', bq);
  });
});

describe('BigQuery - EXTRACT', () => {
  test('parse_extract_weekday', () => {
    parseOne('SELECT EXTRACT(WEEK(MONDAY) FROM d)', bq);
    parseOne('SELECT EXTRACT(DAYOFWEEK FROM d)', bq);
  });
});

describe('BigQuery - SELECT AS STRUCT/VALUE', () => {
  test('parse_select_as_struct', () => {
    parseOne('SELECT AS STRUCT STRUCT(123 AS a, false AS b)', bq);
    parseOne('SELECT DISTINCT AS STRUCT STRUCT(123 AS a, false AS b)', bq);
  });

  test('parse_select_as_value', () => {
    parseOne('SELECT AS VALUE STRUCT(5 AS star_rating, false AS up_down_rating)', bq);
  });
});

describe('BigQuery - Star with EXCEPT/REPLACE', () => {
  test('parse_select_star_except', () => {
    parseOne('SELECT * EXCEPT (col1, col2) FROM t', bq);
    parseOne("SELECT STRUCT<STRING>('foo')[0].* EXCEPT (foo) FROM t", bq);
  });

  test('parse_select_star_replace', () => {
    parseOne('SELECT * REPLACE (col1 AS new_col1) FROM t', bq);
  });
});

describe('BigQuery - ANY_VALUE', () => {
  test('parse_any_value', () => {
    parseOne('SELECT ANY_VALUE(fruit)', bq);
    parseOne('SELECT ANY_VALUE(fruit) OVER (PARTITION BY category)', bq);
    parseOne('SELECT ANY_VALUE(fruit HAVING MAX price)', bq);
  });
});

describe('BigQuery - STRUCT field OPTIONS', () => {
  test('parse_struct_field_options', () => {
    parseOne("CREATE TABLE t (s STRUCT<x INT64 OPTIONS(description = 'the x field')>)", bq);
  });
});

describe('BigQuery - EXPORT DATA', () => {
  test('parse_export_data', () => {
    parseOne("EXPORT DATA OPTIONS(uri = 'gs://bucket/file.csv', format = 'CSV') AS SELECT * FROM t", bq);
  });
});

describe('BigQuery - BEGIN/END Blocks', () => {
  test('parse_begin', () => {
    parseOne('BEGIN SELECT 1; END', bq);
    parseOne('BEGIN SELECT 1; SELECT 2; END', bq);
  });

  test('parse_begin_with_exception', () => {
    parseOne(`
      BEGIN
        SELECT 1;
      EXCEPTION WHEN ERROR THEN
        SELECT 2;
      END
    `, bq);
  });
});

describe('BigQuery - JSON Operations', () => {
  test('parse_json_type', () => {
    parseOne('CREATE TABLE t (data JSON)', bq);
  });

  test('parse_json_subscript', () => {
    parseOne("SELECT json_col['key'] FROM t", bq);
    parseOne("SELECT json_col['key1']['key2'] FROM t", bq);
  });
});

describe('BigQuery - Window Functions', () => {
  test('parse_window_functions', () => {
    parseOne('SELECT ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) FROM t', bq);
    parseOne('SELECT RANK() OVER (ORDER BY score DESC) FROM t', bq);
    parseOne('SELECT DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) FROM t', bq);
  });
});

describe('BigQuery - Parameterized Queries', () => {
  test('parse_positional_parameters', () => {
    parseOne('SELECT * FROM t WHERE id = ?', bq);
  });

  test('parse_named_parameters', () => {
    parseOne('SELECT * FROM t WHERE id = @id', bq);
    parseOne('SELECT * FROM t WHERE name = @name AND age = @age', bq);
  });
});

describe('BigQuery - QUALIFY', () => {
  test('parse_qualify', () => {
    parseOne('SELECT * FROM t QUALIFY ROW_NUMBER() OVER (PARTITION BY x ORDER BY y) = 1', bq);
  });
});

describe('BigQuery - TABLESAMPLE', () => {
  test('parse_tablesample', () => {
    parseOne('SELECT * FROM t TABLESAMPLE SYSTEM (10 PERCENT)', bq);
  });
});
