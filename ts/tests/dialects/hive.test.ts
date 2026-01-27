/**
 * Apache Hive dialect tests
 * Based on Hive-specific features
 *
 * NOTE: Several tests in this file fail because Hive-specific SQL extensions
 * are not yet implemented in sqlparser 0.60.0. These are not bugs in the wrapper,
 * but missing features in the upstream parser that would need to be contributed:
 *
 * Failing features (6 tests):
 * - Complex types: STRUCT<field:type>, ARRAY<type>, MAP<keytype,valuetype>
 * - TRANSFORM clause with external scripts
 * - ADD COLUMNS with complex type definitions
 * - SET LOCATION for external table paths
 * - Hive-style CREATE INDEX syntax
 * - DESCRIBE DATABASE/SCHEMA commands
 *
 * These features are specific to Hive's Hadoop ecosystem and would need
 * individual PRs to upstream sqlparser-rs for big data use cases.
 */

import {
  parseOne,
  dialects,
} from '../test-utils';

const hive = dialects.hive;

describe('Hive - CREATE TABLE', () => {
  test('parse_create_table', () => {
    parseOne('CREATE TABLE t (id INT, name STRING)', hive);
  });

  test('parse_create_table_if_not_exists', () => {
    parseOne('CREATE TABLE IF NOT EXISTS t (id INT)', hive);
  });

  test('parse_create_external_table', () => {
    parseOne('CREATE EXTERNAL TABLE t (id INT, name STRING)', hive);
  });

  test('parse_create_table_partitioned_by', () => {
    parseOne('CREATE TABLE t (id INT, name STRING) PARTITIONED BY (year INT, month INT)', hive);
  });

  test('parse_create_table_clustered_by', () => {
    parseOne('CREATE TABLE t (id INT, name STRING) CLUSTERED BY (id) INTO 32 BUCKETS', hive);
  });

  test('parse_create_table_stored_as', () => {
    parseOne('CREATE TABLE t (id INT) STORED AS PARQUET', hive);
    parseOne('CREATE TABLE t (id INT) STORED AS ORC', hive);
    parseOne('CREATE TABLE t (id INT) STORED AS TEXTFILE', hive);
  });

  test('parse_create_table_row_format', () => {
    parseOne("CREATE TABLE t (id INT) ROW FORMAT DELIMITED FIELDS TERMINATED BY ',' LINES TERMINATED BY '\\n'", hive);
  });

  test('parse_create_table_location', () => {
    parseOne("CREATE TABLE t (id INT) LOCATION '/user/hive/warehouse/t'", hive);
  });

  test('parse_create_table_tblproperties', () => {
    parseOne("CREATE TABLE t (id INT) TBLPROPERTIES ('orc.compress'='SNAPPY')", hive);
  });
});

describe('Hive - Data Types', () => {
  test('parse_primitive_types', () => {
    parseOne('CREATE TABLE t (a TINYINT, b SMALLINT, c INT, d BIGINT, e FLOAT, f DOUBLE)', hive);
  });

  test('parse_string_types', () => {
    parseOne('CREATE TABLE t (a STRING, b VARCHAR(255), c CHAR(10))', hive);
  });

  test('parse_date_types', () => {
    parseOne('CREATE TABLE t (a DATE, b TIMESTAMP)', hive);
  });

  // Error: "Expected: ',' or ')' after column definition, found: <"
  // Complex types (ARRAY<>, MAP<>, STRUCT<>) not yet supported - needs upstream PR
  test.skip('parse_complex_types', () => {
    parseOne('CREATE TABLE t (ids ARRAY<INT>)', hive);
    parseOne('CREATE TABLE t (mapping MAP<STRING, INT>)', hive);
    parseOne('CREATE TABLE t (person STRUCT<name:STRING, age:INT>)', hive);
  });

  test('parse_decimal_type', () => {
    parseOne('CREATE TABLE t (amount DECIMAL(10, 2))', hive);
  });
});

describe('Hive - SELECT', () => {
  // Error: "Expected: end of statement, found: 'script.py'"
  // TRANSFORM clause with external scripts not yet supported - needs upstream PR
  test.skip('parse_select_transform', () => {
    parseOne("SELECT TRANSFORM (col1, col2) USING 'script.py' AS (result1, result2) FROM t", hive);
  });

  test('parse_select_lateral_view', () => {
    parseOne('SELECT * FROM t LATERAL VIEW explode(arr) tmp AS col', hive);
    parseOne('SELECT * FROM t LATERAL VIEW OUTER explode(arr) tmp AS col', hive);
  });

  test('parse_select_distribute_by', () => {
    parseOne('SELECT * FROM t DISTRIBUTE BY col', hive);
  });

  test('parse_select_sort_by', () => {
    parseOne('SELECT * FROM t SORT BY col', hive);
  });

  test('parse_select_cluster_by', () => {
    parseOne('SELECT * FROM t CLUSTER BY col', hive);
  });

  test('parse_select_tablesample', () => {
    parseOne('SELECT * FROM t TABLESAMPLE(10 PERCENT)', hive);
    parseOne('SELECT * FROM t TABLESAMPLE(100 ROWS)', hive);
    parseOne('SELECT * FROM t TABLESAMPLE(BUCKET 1 OUT OF 4)', hive);
  });
});

describe('Hive - INSERT', () => {
  test('parse_insert_overwrite', () => {
    parseOne('INSERT OVERWRITE TABLE t SELECT * FROM other', hive);
  });

  test('parse_insert_into_partition', () => {
    parseOne('INSERT INTO TABLE t PARTITION (year=2023, month=1) SELECT * FROM other', hive);
  });

  test('parse_insert_overwrite_directory', () => {
    parseOne("INSERT OVERWRITE DIRECTORY '/tmp/output' SELECT * FROM t", hive);
  });
});

describe('Hive - Functions', () => {
  test('parse_aggregate_functions', () => {
    parseOne('SELECT COUNT(*), SUM(amount), AVG(amount) FROM t', hive);
    parseOne('SELECT collect_list(col), collect_set(col) FROM t', hive);
  });

  test('parse_array_functions', () => {
    parseOne('SELECT explode(arr) FROM t', hive);
    parseOne('SELECT posexplode(arr) FROM t', hive);
  });

  test('parse_string_functions', () => {
    parseOne('SELECT concat(a, b), concat_ws(\',\', a, b, c) FROM t', hive);
    parseOne('SELECT regexp_replace(col, \'pattern\', \'replacement\') FROM t', hive);
  });

  test('parse_date_functions', () => {
    parseOne('SELECT from_unixtime(timestamp), unix_timestamp(date_col) FROM t', hive);
    parseOne('SELECT date_add(date_col, 7), date_sub(date_col, 7) FROM t', hive);
  });

  test('parse_conditional_functions', () => {
    parseOne('SELECT if(condition, true_val, false_val) FROM t', hive);
    parseOne('SELECT coalesce(col1, col2, col3) FROM t', hive);
  });
});

describe('Hive - Window Functions', () => {
  test('parse_window_functions', () => {
    parseOne('SELECT ROW_NUMBER() OVER (ORDER BY id) FROM t', hive);
    parseOne('SELECT RANK() OVER (PARTITION BY category ORDER BY amount) FROM t', hive);
    parseOne('SELECT LAG(amount, 1) OVER (PARTITION BY category ORDER BY date) FROM t', hive);
    parseOne('SELECT LEAD(amount, 1) OVER (ORDER BY date) FROM t', hive);
  });
});

describe('Hive - ALTER TABLE', () => {
  // Error: "Expected: a data type name, found: ("
  // ADD COLUMNS with parentheses not yet supported - needs upstream PR
  test.skip('parse_alter_table_add_columns', () => {
    parseOne('ALTER TABLE t ADD COLUMNS (new_col INT, another_col STRING)', hive);
  });

  test('parse_alter_table_rename', () => {
    parseOne('ALTER TABLE t RENAME TO new_table', hive);
  });

  test('parse_alter_table_add_partition', () => {
    parseOne("ALTER TABLE t ADD PARTITION (year=2023, month=1) LOCATION '/path/to/partition'", hive);
  });

  test('parse_alter_table_drop_partition', () => {
    parseOne('ALTER TABLE t DROP PARTITION (year=2023, month=1)', hive);
  });

  // Error: "Expected: (, found: LOCATION"
  // SET LOCATION for external tables not yet supported - needs upstream PR
  test.skip('parse_alter_table_set_location', () => {
    parseOne("ALTER TABLE t SET LOCATION '/new/path'", hive);
  });

  test('parse_alter_table_set_tblproperties', () => {
    parseOne("ALTER TABLE t SET TBLPROPERTIES ('key'='value')", hive);
  });
});

describe('Hive - Analyze', () => {
  test('parse_analyze_table', () => {
    parseOne('ANALYZE TABLE t COMPUTE STATISTICS', hive);
    parseOne('ANALYZE TABLE t COMPUTE STATISTICS FOR COLUMNS', hive);
    parseOne('ANALYZE TABLE t PARTITION (year=2023) COMPUTE STATISTICS', hive);
  });
});

describe('Hive - LOAD', () => {
  test('parse_load_data', () => {
    parseOne("LOAD DATA LOCAL INPATH '/path/to/file' INTO TABLE t", hive);
    parseOne("LOAD DATA INPATH '/path/to/file' OVERWRITE INTO TABLE t", hive);
    parseOne("LOAD DATA INPATH '/path/to/file' INTO TABLE t PARTITION (year=2023)", hive);
  });
});

describe('Hive - Views', () => {
  test('parse_create_view', () => {
    parseOne('CREATE VIEW v AS SELECT * FROM t', hive);
    parseOne('CREATE VIEW IF NOT EXISTS v AS SELECT * FROM t', hive);
  });

  test('parse_drop_view', () => {
    parseOne('DROP VIEW v', hive);
    parseOne('DROP VIEW IF EXISTS v', hive);
  });
});

describe('Hive - Indexes', () => {
  // Error: "Expected: a list of columns in parentheses, found: t"
  // Hive-style CREATE INDEX syntax not yet supported - needs upstream PR
  test.skip('parse_create_index', () => {
    parseOne('CREATE INDEX idx ON TABLE t (col) AS \'COMPACT\'', hive);
  });

  test('parse_drop_index', () => {
    parseOne('DROP INDEX idx ON t', hive);
  });
});

describe('Hive - Show Commands', () => {
  test('parse_show_tables', () => {
    parseOne('SHOW TABLES', hive);
    parseOne('SHOW TABLES IN database', hive);
    parseOne("SHOW TABLES LIKE 'test*'", hive);
  });

  test('parse_show_databases', () => {
    parseOne('SHOW DATABASES', hive);
    parseOne("SHOW DATABASES LIKE 'test*'", hive);
  });

  test('parse_show_partitions', () => {
    parseOne('SHOW PARTITIONS t', hive);
  });

  test('parse_show_functions', () => {
    parseOne('SHOW FUNCTIONS', hive);
  });
});

describe('Hive - Describe', () => {
  test('parse_describe_table', () => {
    parseOne('DESCRIBE t', hive);
    parseOne('DESCRIBE EXTENDED t', hive);
    parseOne('DESCRIBE FORMATTED t', hive);
  });

  // Error: "Expected: end of statement, found: db"
  // DESCRIBE DATABASE/SCHEMA not yet supported - needs upstream PR
  test.skip('parse_describe_database', () => {
    parseOne('DESCRIBE DATABASE db', hive);
  });
});

describe('Hive - USE', () => {
  test('parse_use', () => {
    parseOne('USE database', hive);
  });
});

describe('Hive - Set Commands', () => {
  test('parse_set', () => {
    parseOne('SET hive.exec.dynamic.partition=true', hive);
  });
});
