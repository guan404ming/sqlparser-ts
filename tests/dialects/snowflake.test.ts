/**
 * Snowflake dialect tests
 * Ported from sqlparser_snowflake.rs
 */

import {
  parseOne,
  dialects,
} from '../test-utils';

const sf = dialects.snowflake;

describe('Snowflake - CREATE TABLE', () => {
  test('parse_create_table', () => {
    parseOne('CREATE TABLE _my_$table (am00unt NUMBER)', sf);
  });

  test('parse_create_or_replace_table', () => {
    parseOne('CREATE OR REPLACE TABLE my_table (a NUMBER)', sf);
  });

  test('parse_create_table_copy_grants', () => {
    parseOne('CREATE OR REPLACE TABLE my_table (a NUMBER) COPY GRANTS', sf);
  });

  test('parse_create_table_enable_schema_evolution', () => {
    parseOne('CREATE TABLE my_table (a NUMBER) ENABLE_SCHEMA_EVOLUTION = TRUE', sf);
  });

  test('parse_create_table_change_tracking', () => {
    parseOne('CREATE TABLE my_table (a NUMBER) CHANGE_TRACKING = TRUE', sf);
  });

  test('parse_create_table_data_retention', () => {
    parseOne('CREATE TABLE my_table (a NUMBER) DATA_RETENTION_TIME_IN_DAYS = 5', sf);
  });

  test('parse_create_table_with_aggregation_policy', () => {
    parseOne('CREATE TABLE my_table (a NUMBER) WITH AGGREGATION POLICY policy_name', sf);
    parseOne('CREATE TABLE my_table (a NUMBER) AGGREGATION POLICY policy_name', sf);
  });

  test('parse_create_table_with_row_access_policy', () => {
    parseOne('CREATE TABLE my_table (a NUMBER, b NUMBER) WITH ROW ACCESS POLICY policy ON (a, b)', sf);
  });

  test('parse_create_table_with_tag', () => {
    parseOne("CREATE TABLE my_table (a NUMBER) WITH TAG (A = 'TAG A', B = 'TAG B')", sf);
    parseOne("CREATE TABLE my_table (a NUMBER) TAG (A = 'TAG A')", sf);
  });

  test('parse_create_transient_table', () => {
    parseOne('CREATE TRANSIENT TABLE CUSTOMER (id INT, name VARCHAR(255))', sf);
  });

  test('parse_create_table_column_comment', () => {
    parseOne("CREATE TABLE my_table (a STRING COMMENT 'some comment')", sf);
  });

  test('parse_create_table_cluster_by', () => {
    parseOne('CREATE TABLE my_table (a INT) CLUSTER BY (a, b, my_func(c))', sf);
  });

  test('parse_create_table_autoincrement', () => {
    parseOne('CREATE TABLE t (id INT AUTOINCREMENT)', sf);
    parseOne('CREATE TABLE t (id INT AUTOINCREMENT START 1 INCREMENT 1)', sf);
    parseOne('CREATE TABLE t (id INT IDENTITY)', sf);
    parseOne('CREATE TABLE t (id INT IDENTITY(1, 1))', sf);
  });

  test('parse_create_table_collated_column', () => {
    parseOne("CREATE TABLE my_table (a TEXT COLLATE 'de_DE')", sf);
  });

  test('parse_create_iceberg_table', () => {
    parseOne("CREATE ICEBERG TABLE my_table (a INT) BASE_LOCATION = 'relative_path'", sf);
  });
});

describe('Snowflake - Views', () => {
  test('parse_create_secure_view', () => {
    parseOne('CREATE SECURE VIEW v AS SELECT 1', sf);
    parseOne('CREATE SECURE MATERIALIZED VIEW v AS SELECT 1', sf);
    parseOne('CREATE OR REPLACE SECURE VIEW v AS SELECT 1', sf);
  });
});

describe('Snowflake - Data Types', () => {
  test('parse_array_type', () => {
    parseOne('SELECT CAST(a AS ARRAY) FROM customer', sf);
  });

  test('parse_variant_type', () => {
    parseOne('CREATE TABLE t (data VARIANT)', sf);
  });

  test('parse_object_type', () => {
    parseOne('CREATE TABLE t (data OBJECT)', sf);
  });
});

describe('Snowflake - Semi-structured Data', () => {
  test('parse_semi_structured_data_traversal', () => {
    parseOne('SELECT a[2 + 2] FROM t', sf);
    parseOne('SELECT a[0].foo.bar FROM t', sf);
    parseOne('SELECT a:b FROM t', sf);
    parseOne('SELECT a:b:c FROM t', sf);
    parseOne('SELECT a[b:c] FROM t', sf);
  });

  test('parse_flatten', () => {
    parseOne("SELECT * FROM TABLE(FLATTEN(input => parse_json('[1, 2, 3]')))", sf);
    parseOne("SELECT * FROM TABLE(FLATTEN(input => parse_json('[1, 2, 3]'), outer => true))", sf);
  });
});

describe('Snowflake - Wildcard Modifiers', () => {
  test('parse_select_wildcard_with_exclude', () => {
    parseOne('SELECT * EXCLUDE (col_a) FROM data', sf);
    parseOne('SELECT * EXCLUDE col_a FROM data', sf);
    parseOne('SELECT name.* EXCLUDE department_id FROM employee_table', sf);
    parseOne('SELECT * EXCLUDE (col_a, col_b) FROM data', sf);
  });

  test('parse_select_wildcard_with_rename', () => {
    parseOne('SELECT * RENAME col_a AS col_b FROM data', sf);
    parseOne('SELECT * RENAME (col_a AS col_b, col_c AS col_d) FROM data', sf);
  });

  test('parse_select_wildcard_with_replace', () => {
    parseOne('SELECT * REPLACE (col_a * 2 AS col_a) FROM data', sf);
  });
});

describe('Snowflake - ALTER TABLE', () => {
  test('parse_alter_table_swap_with', () => {
    parseOne('ALTER TABLE tab1 SWAP WITH tab2', sf);
  });

  test('parse_alter_table_clustering', () => {
    parseOne('ALTER TABLE tab CLUSTER BY (c1, "c2", TO_DATE(c3))', sf);
    parseOne('ALTER TABLE tab SUSPEND RECLUSTER', sf);
    parseOne('ALTER TABLE tab RESUME RECLUSTER', sf);
    parseOne('ALTER TABLE tab DROP CLUSTERING KEY', sf);
  });
});

describe('Snowflake - STAGE', () => {
  test('parse_create_stage', () => {
    parseOne('CREATE STAGE s1.s2', sf);
    parseOne("CREATE OR REPLACE TEMPORARY STAGE IF NOT EXISTS s1.s2 COMMENT = 'test'", sf);
    parseOne("CREATE STAGE my_stage URL = 's3://bucket/path/'", sf);
  });

  test('parse_drop_stage', () => {
    parseOne('DROP STAGE s1', sf);
    parseOne('DROP STAGE IF EXISTS s1', sf);
  });
});

describe('Snowflake - COPY INTO', () => {
  test('parse_copy_into', () => {
    parseOne("COPY INTO my_table FROM '@my_stage'", sf);
    parseOne("COPY INTO my_table FROM '@my_stage/path/' FILES = ('file1.csv', 'file2.csv')", sf);
    parseOne("COPY INTO my_table FROM '@my_stage' PATTERN = '.*\\.csv'", sf);
    parseOne("COPY INTO my_table FROM '@my_stage' FILE_FORMAT = (TYPE = CSV)", sf);
    parseOne("COPY INTO my_table FROM '@my_stage' VALIDATION_MODE = RETURN_ERRORS", sf);
  });
});

describe('Snowflake - TRIM', () => {
  test('parse_trim', () => {
    parseOne("SELECT TRIM('xyz', 'a')", sf);
    parseOne("SELECT TRIM('   hello   ')", sf);
  });
});

describe('Snowflake - Position Column', () => {
  test('parse_position_not_function_columns', () => {
    parseOne("SELECT position FROM tbl1 WHERE position NOT IN ('first', 'last')", sf);
  });
});

describe('Snowflake - Subquery Function Argument', () => {
  test('parse_subquery_function_argument', () => {
    parseOne("SELECT parse_json(SELECT '{}')", sf);
  });
});

describe('Snowflake - PIVOT/UNPIVOT', () => {
  test('parse_pivot', () => {
    parseOne(`
      SELECT * FROM (
        SELECT category, amount FROM sales
      ) PIVOT (
        SUM(amount) FOR category IN ('Electronics', 'Clothing')
      )
    `, sf);
  });

  test('parse_unpivot', () => {
    parseOne(`
      SELECT * FROM t UNPIVOT (val FOR col IN (col1, col2, col3))
    `, sf);
  });
});

describe('Snowflake - MATCH_RECOGNIZE', () => {
  test('parse_match_recognize', () => {
    parseOne(`
      SELECT * FROM t
      MATCH_RECOGNIZE (
        ORDER BY ts
        MEASURES A.ts AS a_ts
        PATTERN (A B)
        DEFINE A AS a > 0
      )
    `, sf);
  });
});

describe('Snowflake - Time Travel', () => {
  test('parse_time_travel', () => {
    parseOne("SELECT * FROM t AT (TIMESTAMP => '2023-01-01 00:00:00')", sf);
    parseOne('SELECT * FROM t AT (OFFSET => -3600)', sf);
    parseOne("SELECT * FROM t AT (STATEMENT => 'abc123')", sf);
    parseOne("SELECT * FROM t BEFORE (TIMESTAMP => '2023-01-01 00:00:00')", sf);
  });
});

describe('Snowflake - SAMPLE', () => {
  test('parse_sample', () => {
    parseOne('SELECT * FROM t SAMPLE (10)', sf);
    parseOne('SELECT * FROM t SAMPLE ROW (10)', sf);
    parseOne('SELECT * FROM t SAMPLE BLOCK (10)', sf);
    parseOne('SELECT * FROM t TABLESAMPLE (10 ROWS)', sf);
  });
});

describe('Snowflake - CONNECT BY', () => {
  test('parse_connect_by', () => {
    parseOne('SELECT * FROM t START WITH parent_id IS NULL CONNECT BY PRIOR id = parent_id', sf);
  });
});

describe('Snowflake - QUALIFY', () => {
  test('parse_qualify', () => {
    parseOne('SELECT * FROM t QUALIFY ROW_NUMBER() OVER (PARTITION BY category ORDER BY amount DESC) = 1', sf);
  });
});

describe('Snowflake - DECLARE', () => {
  test('parse_declare', () => {
    parseOne('DECLARE my_var INT', sf);
    parseOne('DECLARE my_var INT DEFAULT 0', sf);
    parseOne('DECLARE my_cursor CURSOR FOR SELECT * FROM t', sf);
    parseOne('DECLARE my_resultset RESULTSET', sf);
    parseOne('DECLARE my_exception EXCEPTION', sf);
  });
});

describe('Snowflake - PUT/GET', () => {
  test.skip('parse_put_get', () => {
    // PUT/GET are not yet supported by the parser
    parseOne("PUT file:///path/to/file @my_stage", sf);
    parseOne("GET @my_stage file:///path/to/dir/", sf);
  });
});

describe('Snowflake - Dynamic SQL', () => {
  test('parse_execute_immediate', () => {
    parseOne("EXECUTE IMMEDIATE 'SELECT 1'", sf);
    parseOne('EXECUTE IMMEDIATE :query_var', sf);
  });
});

describe('Snowflake - MERGE', () => {
  test('parse_merge', () => {
    parseOne(`
      MERGE INTO target AS t
      USING source AS s
      ON t.id = s.id
      WHEN MATCHED THEN UPDATE SET t.col = s.col
      WHEN NOT MATCHED THEN INSERT (id, col) VALUES (s.id, s.col)
    `, sf);
  });
});

describe('Snowflake - Comments', () => {
  test('parse_comment', () => {
    parseOne("COMMENT ON TABLE t IS 'This is a table'", sf);
    parseOne("COMMENT ON COLUMN t.col IS 'This is a column'", sf);
  });
});

describe('Snowflake - SHOW Commands', () => {
  test('parse_show', () => {
    parseOne('SHOW TABLES', sf);
    parseOne('SHOW TABLES IN SCHEMA my_schema', sf);
    parseOne('SHOW DATABASES', sf);
    parseOne('SHOW SCHEMAS', sf);
    parseOne('SHOW VIEWS', sf);
    parseOne('SHOW COLUMNS IN TABLE t', sf);
  });
});

describe('Snowflake - USE', () => {
  test('parse_use', () => {
    parseOne('USE DATABASE my_db', sf);
    parseOne('USE SCHEMA my_schema', sf);
    parseOne('USE WAREHOUSE my_wh', sf);
    parseOne('USE ROLE my_role', sf);
  });
});

describe('Snowflake - Task Management', () => {
  test.skip('parse_create_task', () => {
    // CREATE TASK is not yet supported
    parseOne("CREATE TASK my_task SCHEDULE = 'USING CRON 0 * * * * UTC' AS SELECT 1", sf);
    parseOne("CREATE TASK my_task WAREHOUSE = my_wh AS SELECT 1", sf);
  });

  test.skip('parse_alter_task', () => {
    // ALTER TASK is not yet supported
    parseOne('ALTER TASK my_task RESUME', sf);
    parseOne('ALTER TASK my_task SUSPEND', sf);
  });
});

describe('Snowflake - Stream', () => {
  test.skip('parse_create_stream', () => {
    // CREATE STREAM is not yet supported
    parseOne('CREATE STREAM my_stream ON TABLE my_table', sf);
    parseOne('CREATE OR REPLACE STREAM my_stream ON TABLE my_table', sf);
  });
});

describe('Snowflake - Procedures', () => {
  test('parse_call', () => {
    parseOne('CALL my_procedure()', sf);
    parseOne("CALL my_procedure(1, 'test')", sf);
  });
});

describe('Snowflake - IFF Function', () => {
  test('parse_iff', () => {
    parseOne("SELECT IFF(condition, 'yes', 'no')", sf);
  });
});

describe('Snowflake - DATE_PART/DATE_TRUNC', () => {
  test('parse_date_functions', () => {
    parseOne("SELECT DATE_PART('year', date_col)", sf);
    parseOne("SELECT DATE_TRUNC('month', date_col)", sf);
    parseOne("SELECT DATEADD('day', 1, date_col)", sf);
    parseOne("SELECT DATEDIFF('day', date1, date2)", sf);
  });
});
