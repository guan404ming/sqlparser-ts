/**
 * ClickHouse dialect tests
 * Based on ClickHouse-specific features
 */

import {
  parse,
  parseOne,
  format,
  expectParseError,
  dialects,
  ensureWasmInitialized,
  isQuery,
  isCreateTable,
} from '../test-utils';

const clickhouse = dialects.clickhouse;

beforeAll(async () => {
  await ensureWasmInitialized();
});

describe('ClickHouse - CREATE TABLE', () => {
  test('parse_create_table', async () => {
    await parseOne('CREATE TABLE t (id UInt32, name String) ENGINE = MergeTree() ORDER BY id', clickhouse);
  });

  test('parse_create_table_if_not_exists', async () => {
    await parseOne('CREATE TABLE IF NOT EXISTS t (id UInt32) ENGINE = MergeTree() ORDER BY id', clickhouse);
  });

  test('parse_create_table_engines', async () => {
    await parseOne('CREATE TABLE t (id UInt32) ENGINE = MergeTree() ORDER BY id', clickhouse);
    await parseOne('CREATE TABLE t (id UInt32) ENGINE = ReplacingMergeTree() ORDER BY id', clickhouse);
    await parseOne('CREATE TABLE t (id UInt32) ENGINE = SummingMergeTree() ORDER BY id', clickhouse);
    await parseOne('CREATE TABLE t (id UInt32) ENGINE = AggregatingMergeTree() ORDER BY id', clickhouse);
  });

  test('parse_create_table_partition_by', async () => {
    await parseOne('CREATE TABLE t (id UInt32, date Date) ENGINE = MergeTree() PARTITION BY toYYYYMM(date) ORDER BY id', clickhouse);
  });

  test('parse_create_table_sample_by', async () => {
    await parseOne('CREATE TABLE t (id UInt32) ENGINE = MergeTree() ORDER BY id SAMPLE BY id', clickhouse);
  });

  test('parse_create_table_ttl', async () => {
    await parseOne('CREATE TABLE t (id UInt32, created DateTime) ENGINE = MergeTree() ORDER BY id TTL created + INTERVAL 30 DAY', clickhouse);
  });
});

describe('ClickHouse - Data Types', () => {
  test('parse_integer_types', async () => {
    await parseOne('CREATE TABLE t (a Int8, b Int16, c Int32, d Int64) ENGINE = Memory', clickhouse);
    await parseOne('CREATE TABLE t (a UInt8, b UInt16, c UInt32, d UInt64) ENGINE = Memory', clickhouse);
  });

  test('parse_float_types', async () => {
    await parseOne('CREATE TABLE t (a Float32, b Float64) ENGINE = Memory', clickhouse);
  });

  test('parse_decimal_types', async () => {
    await parseOne('CREATE TABLE t (a Decimal(10, 2), b Decimal32(2)) ENGINE = Memory', clickhouse);
  });

  test('parse_string_types', async () => {
    await parseOne('CREATE TABLE t (a String, b FixedString(10)) ENGINE = Memory', clickhouse);
  });

  test('parse_date_types', async () => {
    await parseOne('CREATE TABLE t (a Date, b DateTime, c DateTime64(3)) ENGINE = Memory', clickhouse);
  });

  test('parse_array_types', async () => {
    await parseOne('CREATE TABLE t (ids Array(UInt32)) ENGINE = Memory', clickhouse);
  });

  test('parse_nullable_types', async () => {
    await parseOne('CREATE TABLE t (name Nullable(String)) ENGINE = Memory', clickhouse);
  });

  test('parse_tuple_types', async () => {
    await parseOne('CREATE TABLE t (point Tuple(x Float64, y Float64)) ENGINE = Memory', clickhouse);
  });

  test('parse_enum_types', async () => {
    await parseOne("CREATE TABLE t (status Enum8('active' = 1, 'inactive' = 2)) ENGINE = Memory", clickhouse);
  });
});

describe('ClickHouse - SELECT', () => {
  test('parse_select_with_final', async () => {
    await parseOne('SELECT * FROM t FINAL', clickhouse);
  });

  test('parse_select_with_array_join', async () => {
    await parseOne('SELECT * FROM t ARRAY JOIN arr', clickhouse);
    await parseOne('SELECT * FROM t LEFT ARRAY JOIN arr', clickhouse);
  });

  test('parse_select_with_prewhere', async () => {
    await parseOne('SELECT * FROM t PREWHERE id > 100 WHERE name = \'test\'', clickhouse);
  });

  test('parse_select_limit_by', async () => {
    await parseOne('SELECT * FROM t LIMIT 10 BY category', clickhouse);
  });
});

describe('ClickHouse - INSERT', () => {
  test('parse_insert_format', async () => {
    await parseOne('INSERT INTO t FORMAT CSV', clickhouse);
    await parseOne('INSERT INTO t FORMAT JSONEachRow', clickhouse);
  });

  test('parse_insert_select', async () => {
    await parseOne('INSERT INTO t SELECT * FROM other', clickhouse);
  });
});

describe('ClickHouse - Functions', () => {
  test('parse_aggregate_functions', async () => {
    await parseOne('SELECT COUNT(*), SUM(amount), AVG(amount) FROM t', clickhouse);
    await parseOne('SELECT uniq(user_id) FROM t', clickhouse);
    await parseOne('SELECT topK(10)(product_id) FROM t', clickhouse);
  });

  test('parse_array_functions', async () => {
    await parseOne('SELECT arrayMap(x -> x * 2, [1, 2, 3])', clickhouse);
    await parseOne('SELECT arrayFilter(x -> x > 0, [-1, 0, 1])', clickhouse);
  });

  test('parse_string_functions', async () => {
    await parseOne('SELECT lower(name), upper(name) FROM t', clickhouse);
  });

  test('parse_date_functions', async () => {
    await parseOne('SELECT toDate(created), toDateTime(created) FROM t', clickhouse);
    await parseOne('SELECT now(), today(), yesterday()', clickhouse);
  });
});

describe('ClickHouse - Distributed Queries', () => {
  test('parse_distributed_table', async () => {
    await parseOne("CREATE TABLE t_distributed AS t ENGINE = Distributed('cluster', 'database', 't', rand())", clickhouse);
  });

  test('parse_global_join', async () => {
    await parseOne('SELECT * FROM t1 GLOBAL JOIN t2 ON t1.id = t2.id', clickhouse);
  });
});

describe('ClickHouse - Materialized Views', () => {
  test('parse_create_materialized_view', async () => {
    await parseOne('CREATE MATERIALIZED VIEW mv ENGINE = MergeTree() ORDER BY id AS SELECT * FROM t', clickhouse);
  });

  test('parse_create_materialized_view_populate', async () => {
    await parseOne('CREATE MATERIALIZED VIEW mv ENGINE = MergeTree() ORDER BY id POPULATE AS SELECT * FROM t', clickhouse);
  });
});

describe('ClickHouse - Dictionaries', () => {
  test('parse_create_dictionary', async () => {
    await parseOne(`
      CREATE DICTIONARY dict (
        id UInt32,
        name String
      )
      PRIMARY KEY id
      SOURCE(CLICKHOUSE(HOST 'localhost' PORT 9000 TABLE 't'))
      LAYOUT(FLAT())
      LIFETIME(300)
    `, clickhouse);
  });
});

describe('ClickHouse - ALTER', () => {
  test('parse_alter_table_add_column', async () => {
    await parseOne('ALTER TABLE t ADD COLUMN new_col UInt32', clickhouse);
  });

  test('parse_alter_table_drop_column', async () => {
    await parseOne('ALTER TABLE t DROP COLUMN col', clickhouse);
  });

  test('parse_alter_table_modify_column', async () => {
    await parseOne('ALTER TABLE t MODIFY COLUMN col String', clickhouse);
  });

  test('parse_alter_table_update', async () => {
    await parseOne('ALTER TABLE t UPDATE col = col * 2 WHERE id > 100', clickhouse);
  });

  test('parse_alter_table_delete', async () => {
    await parseOne('ALTER TABLE t DELETE WHERE id < 100', clickhouse);
  });
});

describe('ClickHouse - System Operations', () => {
  test('parse_optimize_table', async () => {
    await parseOne('OPTIMIZE TABLE t', clickhouse);
    await parseOne('OPTIMIZE TABLE t FINAL', clickhouse);
  });

  test('parse_system_commands', async () => {
    await parseOne('SYSTEM FLUSH LOGS', clickhouse);
    await parseOne('SYSTEM RELOAD CONFIG', clickhouse);
  });
});

describe('ClickHouse - Special Syntax', () => {
  test('parse_with_clause', async () => {
    await parseOne('WITH 10 AS x SELECT x * 2', clickhouse);
  });

  test('parse_lambda_functions', async () => {
    await parseOne('SELECT arrayMap(x -> x * 2, arr) FROM t', clickhouse);
  });
});
