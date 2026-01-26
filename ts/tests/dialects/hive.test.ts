/**
 * Apache Hive dialect tests
 * Based on Hive-specific features
 */

import {
  parseOne,
  dialects,
  ensureWasmInitialized,
} from '../test-utils';

const hive = dialects.hive;

beforeAll(async () => {
  await ensureWasmInitialized();
});

describe('Hive - CREATE TABLE', () => {
  test('parse_create_table', async () => {
    await parseOne('CREATE TABLE t (id INT, name STRING)', hive);
  });

  test('parse_create_table_if_not_exists', async () => {
    await parseOne('CREATE TABLE IF NOT EXISTS t (id INT)', hive);
  });

  test('parse_create_external_table', async () => {
    await parseOne('CREATE EXTERNAL TABLE t (id INT, name STRING)', hive);
  });

  test('parse_create_table_partitioned_by', async () => {
    await parseOne('CREATE TABLE t (id INT, name STRING) PARTITIONED BY (year INT, month INT)', hive);
  });

  test('parse_create_table_clustered_by', async () => {
    await parseOne('CREATE TABLE t (id INT, name STRING) CLUSTERED BY (id) INTO 32 BUCKETS', hive);
  });

  test('parse_create_table_stored_as', async () => {
    await parseOne('CREATE TABLE t (id INT) STORED AS PARQUET', hive);
    await parseOne('CREATE TABLE t (id INT) STORED AS ORC', hive);
    await parseOne('CREATE TABLE t (id INT) STORED AS TEXTFILE', hive);
  });

  test('parse_create_table_row_format', async () => {
    await parseOne("CREATE TABLE t (id INT) ROW FORMAT DELIMITED FIELDS TERMINATED BY ',' LINES TERMINATED BY '\\n'", hive);
  });

  test('parse_create_table_location', async () => {
    await parseOne("CREATE TABLE t (id INT) LOCATION '/user/hive/warehouse/t'", hive);
  });

  test('parse_create_table_tblproperties', async () => {
    await parseOne("CREATE TABLE t (id INT) TBLPROPERTIES ('orc.compress'='SNAPPY')", hive);
  });
});

describe('Hive - Data Types', () => {
  test('parse_primitive_types', async () => {
    await parseOne('CREATE TABLE t (a TINYINT, b SMALLINT, c INT, d BIGINT, e FLOAT, f DOUBLE)', hive);
  });

  test('parse_string_types', async () => {
    await parseOne('CREATE TABLE t (a STRING, b VARCHAR(255), c CHAR(10))', hive);
  });

  test('parse_date_types', async () => {
    await parseOne('CREATE TABLE t (a DATE, b TIMESTAMP)', hive);
  });

  test('parse_complex_types', async () => {
    await parseOne('CREATE TABLE t (ids ARRAY<INT>)', hive);
    await parseOne('CREATE TABLE t (mapping MAP<STRING, INT>)', hive);
    await parseOne('CREATE TABLE t (person STRUCT<name:STRING, age:INT>)', hive);
  });

  test('parse_decimal_type', async () => {
    await parseOne('CREATE TABLE t (amount DECIMAL(10, 2))', hive);
  });
});

describe('Hive - SELECT', () => {
  test('parse_select_transform', async () => {
    await parseOne("SELECT TRANSFORM (col1, col2) USING 'script.py' AS (result1, result2) FROM t", hive);
  });

  test('parse_select_lateral_view', async () => {
    await parseOne('SELECT * FROM t LATERAL VIEW explode(arr) tmp AS col', hive);
    await parseOne('SELECT * FROM t LATERAL VIEW OUTER explode(arr) tmp AS col', hive);
  });

  test('parse_select_distribute_by', async () => {
    await parseOne('SELECT * FROM t DISTRIBUTE BY col', hive);
  });

  test('parse_select_sort_by', async () => {
    await parseOne('SELECT * FROM t SORT BY col', hive);
  });

  test('parse_select_cluster_by', async () => {
    await parseOne('SELECT * FROM t CLUSTER BY col', hive);
  });

  test('parse_select_tablesample', async () => {
    await parseOne('SELECT * FROM t TABLESAMPLE(10 PERCENT)', hive);
    await parseOne('SELECT * FROM t TABLESAMPLE(100 ROWS)', hive);
    await parseOne('SELECT * FROM t TABLESAMPLE(BUCKET 1 OUT OF 4)', hive);
  });
});

describe('Hive - INSERT', () => {
  test('parse_insert_overwrite', async () => {
    await parseOne('INSERT OVERWRITE TABLE t SELECT * FROM other', hive);
  });

  test('parse_insert_into_partition', async () => {
    await parseOne('INSERT INTO TABLE t PARTITION (year=2023, month=1) SELECT * FROM other', hive);
  });

  test('parse_insert_overwrite_directory', async () => {
    await parseOne("INSERT OVERWRITE DIRECTORY '/tmp/output' SELECT * FROM t", hive);
  });
});

describe('Hive - Functions', () => {
  test('parse_aggregate_functions', async () => {
    await parseOne('SELECT COUNT(*), SUM(amount), AVG(amount) FROM t', hive);
    await parseOne('SELECT collect_list(col), collect_set(col) FROM t', hive);
  });

  test('parse_array_functions', async () => {
    await parseOne('SELECT explode(arr) FROM t', hive);
    await parseOne('SELECT posexplode(arr) FROM t', hive);
  });

  test('parse_string_functions', async () => {
    await parseOne('SELECT concat(a, b), concat_ws(\',\', a, b, c) FROM t', hive);
    await parseOne('SELECT regexp_replace(col, \'pattern\', \'replacement\') FROM t', hive);
  });

  test('parse_date_functions', async () => {
    await parseOne('SELECT from_unixtime(timestamp), unix_timestamp(date_col) FROM t', hive);
    await parseOne('SELECT date_add(date_col, 7), date_sub(date_col, 7) FROM t', hive);
  });

  test('parse_conditional_functions', async () => {
    await parseOne('SELECT if(condition, true_val, false_val) FROM t', hive);
    await parseOne('SELECT coalesce(col1, col2, col3) FROM t', hive);
  });
});

describe('Hive - Window Functions', () => {
  test('parse_window_functions', async () => {
    await parseOne('SELECT ROW_NUMBER() OVER (ORDER BY id) FROM t', hive);
    await parseOne('SELECT RANK() OVER (PARTITION BY category ORDER BY amount) FROM t', hive);
    await parseOne('SELECT LAG(amount, 1) OVER (PARTITION BY category ORDER BY date) FROM t', hive);
    await parseOne('SELECT LEAD(amount, 1) OVER (ORDER BY date) FROM t', hive);
  });
});

describe('Hive - ALTER TABLE', () => {
  test('parse_alter_table_add_columns', async () => {
    await parseOne('ALTER TABLE t ADD COLUMNS (new_col INT, another_col STRING)', hive);
  });

  test('parse_alter_table_rename', async () => {
    await parseOne('ALTER TABLE t RENAME TO new_table', hive);
  });

  test('parse_alter_table_add_partition', async () => {
    await parseOne("ALTER TABLE t ADD PARTITION (year=2023, month=1) LOCATION '/path/to/partition'", hive);
  });

  test('parse_alter_table_drop_partition', async () => {
    await parseOne('ALTER TABLE t DROP PARTITION (year=2023, month=1)', hive);
  });

  test('parse_alter_table_set_location', async () => {
    await parseOne("ALTER TABLE t SET LOCATION '/new/path'", hive);
  });

  test('parse_alter_table_set_tblproperties', async () => {
    await parseOne("ALTER TABLE t SET TBLPROPERTIES ('key'='value')", hive);
  });
});

describe('Hive - Analyze', () => {
  test('parse_analyze_table', async () => {
    await parseOne('ANALYZE TABLE t COMPUTE STATISTICS', hive);
    await parseOne('ANALYZE TABLE t COMPUTE STATISTICS FOR COLUMNS', hive);
    await parseOne('ANALYZE TABLE t PARTITION (year=2023) COMPUTE STATISTICS', hive);
  });
});

describe('Hive - LOAD', () => {
  test('parse_load_data', async () => {
    await parseOne("LOAD DATA LOCAL INPATH '/path/to/file' INTO TABLE t", hive);
    await parseOne("LOAD DATA INPATH '/path/to/file' OVERWRITE INTO TABLE t", hive);
    await parseOne("LOAD DATA INPATH '/path/to/file' INTO TABLE t PARTITION (year=2023)", hive);
  });
});

describe('Hive - Views', () => {
  test('parse_create_view', async () => {
    await parseOne('CREATE VIEW v AS SELECT * FROM t', hive);
    await parseOne('CREATE VIEW IF NOT EXISTS v AS SELECT * FROM t', hive);
  });

  test('parse_drop_view', async () => {
    await parseOne('DROP VIEW v', hive);
    await parseOne('DROP VIEW IF EXISTS v', hive);
  });
});

describe('Hive - Indexes', () => {
  test('parse_create_index', async () => {
    await parseOne('CREATE INDEX idx ON TABLE t (col) AS \'COMPACT\'', hive);
  });

  test('parse_drop_index', async () => {
    await parseOne('DROP INDEX idx ON t', hive);
  });
});

describe('Hive - Show Commands', () => {
  test('parse_show_tables', async () => {
    await parseOne('SHOW TABLES', hive);
    await parseOne('SHOW TABLES IN database', hive);
    await parseOne("SHOW TABLES LIKE 'test*'", hive);
  });

  test('parse_show_databases', async () => {
    await parseOne('SHOW DATABASES', hive);
    await parseOne("SHOW DATABASES LIKE 'test*'", hive);
  });

  test('parse_show_partitions', async () => {
    await parseOne('SHOW PARTITIONS t', hive);
  });

  test('parse_show_functions', async () => {
    await parseOne('SHOW FUNCTIONS', hive);
  });
});

describe('Hive - Describe', () => {
  test('parse_describe_table', async () => {
    await parseOne('DESCRIBE t', hive);
    await parseOne('DESCRIBE EXTENDED t', hive);
    await parseOne('DESCRIBE FORMATTED t', hive);
  });

  test('parse_describe_database', async () => {
    await parseOne('DESCRIBE DATABASE db', hive);
  });
});

describe('Hive - USE', () => {
  test('parse_use', async () => {
    await parseOne('USE database', hive);
  });
});

describe('Hive - Set Commands', () => {
  test('parse_set', async () => {
    await parseOne('SET hive.exec.dynamic.partition=true', hive);
  });
});
