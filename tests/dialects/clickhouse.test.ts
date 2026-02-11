/**
 * ClickHouse dialect tests
 * Based on ClickHouse-specific features
 *
 * NOTE: Many tests in this file fail because ClickHouse-specific SQL extensions
 * are not yet implemented in sqlparser 0.60.0. These are not bugs in the wrapper,
 * but missing features in the upstream parser that would need to be contributed:
 *
 * Failing features (12 tests):
 * - PARTITION BY clause (data partitioning)
 * - SAMPLE BY clause (sampling configuration)
 * - TTL clause (time-to-live for data)
 * - ENGINE clause for materialized views
 * - CREATE DICTIONARY objects
 * - ARRAY JOIN operations
 * - ALTER TABLE UPDATE/DELETE (direct table modifications)
 * - SYSTEM commands (cluster management)
 * - Distributed table syntax
 * - WITH clause special syntax
 *
 * These would each require individual PRs to upstream sqlparser-rs.
 */

import {
  parseOne,
  dialects,
} from '../test-utils';

const clickhouse = dialects.clickhouse;

describe('ClickHouse - CREATE TABLE', () => {
  test('parse_create_table', () => {
    parseOne('CREATE TABLE t (id UInt32, name String) ENGINE = MergeTree() ORDER BY id', clickhouse);
  });

  test('parse_create_table_if_not_exists', () => {
    parseOne('CREATE TABLE IF NOT EXISTS t (id UInt32) ENGINE = MergeTree() ORDER BY id', clickhouse);
  });

  test('parse_create_table_engines', () => {
    parseOne('CREATE TABLE t (id UInt32) ENGINE = MergeTree() ORDER BY id', clickhouse);
    parseOne('CREATE TABLE t (id UInt32) ENGINE = ReplacingMergeTree() ORDER BY id', clickhouse);
    parseOne('CREATE TABLE t (id UInt32) ENGINE = SummingMergeTree() ORDER BY id', clickhouse);
    parseOne('CREATE TABLE t (id UInt32) ENGINE = AggregatingMergeTree() ORDER BY id', clickhouse);
  });

  // Error: "Expected: end of statement, found: PARTITION"
  // PARTITION BY is not yet supported - needs upstream PR
  test.skip('parse_create_table_partition_by', () => {
    parseOne('CREATE TABLE t (id UInt32, date Date) ENGINE = MergeTree() PARTITION BY toYYYYMM(date) ORDER BY id', clickhouse);
  });

  // Error: "Expected: end of statement, found: SAMPLE"
  // SAMPLE BY is not yet supported - needs upstream PR
  test.skip('parse_create_table_sample_by', () => {
    parseOne('CREATE TABLE t (id UInt32) ENGINE = MergeTree() ORDER BY id SAMPLE BY id', clickhouse);
  });

  // Error: "Expected: end of statement, found: TTL"
  // TTL clause is not yet supported - needs upstream PR
  test.skip('parse_create_table_ttl', () => {
    parseOne('CREATE TABLE t (id UInt32, created DateTime) ENGINE = MergeTree() ORDER BY id TTL created + INTERVAL 30 DAY', clickhouse);
  });
});

describe('ClickHouse - Data Types', () => {
  test('parse_integer_types', () => {
    parseOne('CREATE TABLE t (a Int8, b Int16, c Int32, d Int64) ENGINE = Memory', clickhouse);
    parseOne('CREATE TABLE t (a UInt8, b UInt16, c UInt32, d UInt64) ENGINE = Memory', clickhouse);
  });

  test('parse_float_types', () => {
    parseOne('CREATE TABLE t (a Float32, b Float64) ENGINE = Memory', clickhouse);
  });

  test('parse_decimal_types', () => {
    parseOne('CREATE TABLE t (a Decimal(10, 2), b Decimal32(2)) ENGINE = Memory', clickhouse);
  });

  test('parse_string_types', () => {
    parseOne('CREATE TABLE t (a String, b FixedString(10)) ENGINE = Memory', clickhouse);
  });

  test('parse_date_types', () => {
    parseOne('CREATE TABLE t (a Date, b DateTime, c DateTime64(3)) ENGINE = Memory', clickhouse);
  });

  test('parse_array_types', () => {
    parseOne('CREATE TABLE t (ids Array(UInt32)) ENGINE = Memory', clickhouse);
  });

  test('parse_nullable_types', () => {
    parseOne('CREATE TABLE t (name Nullable(String)) ENGINE = Memory', clickhouse);
  });

  test('parse_tuple_types', () => {
    parseOne('CREATE TABLE t (point Tuple(x Float64, y Float64)) ENGINE = Memory', clickhouse);
  });

  test('parse_enum_types', () => {
    parseOne("CREATE TABLE t (status Enum8('active' = 1, 'inactive' = 2)) ENGINE = Memory", clickhouse);
  });
});

describe('ClickHouse - SELECT', () => {
  test('parse_select_with_final', () => {
    parseOne('SELECT * FROM t FINAL', clickhouse);
  });

  // Error: "expected OUTER, SEMI, ANTI or JOIN after LEFT"
  // ARRAY JOIN is not yet supported - needs upstream PR
  test.skip('parse_select_with_array_join', () => {
    parseOne('SELECT * FROM t ARRAY JOIN arr', clickhouse);
    parseOne('SELECT * FROM t LEFT ARRAY JOIN arr', clickhouse);
  });

  test('parse_select_with_prewhere', () => {
    parseOne('SELECT * FROM t PREWHERE id > 100 WHERE name = \'test\'', clickhouse);
  });

  test('parse_select_limit_by', () => {
    parseOne('SELECT * FROM t LIMIT 10 BY category', clickhouse);
  });
});

describe('ClickHouse - INSERT', () => {
  test('parse_insert_format', () => {
    parseOne('INSERT INTO t FORMAT CSV', clickhouse);
    parseOne('INSERT INTO t FORMAT JSONEachRow', clickhouse);
  });

  test('parse_insert_select', () => {
    parseOne('INSERT INTO t SELECT * FROM other', clickhouse);
  });
});

describe('ClickHouse - Functions', () => {
  test('parse_aggregate_functions', () => {
    parseOne('SELECT COUNT(*), SUM(amount), AVG(amount) FROM t', clickhouse);
    parseOne('SELECT uniq(user_id) FROM t', clickhouse);
    parseOne('SELECT topK(10)(product_id) FROM t', clickhouse);
  });

  test('parse_array_functions', () => {
    parseOne('SELECT arrayMap(x -> x * 2, [1, 2, 3])', clickhouse);
    parseOne('SELECT arrayFilter(x -> x > 0, [-1, 0, 1])', clickhouse);
  });

  test('parse_string_functions', () => {
    parseOne('SELECT lower(name), upper(name) FROM t', clickhouse);
  });

  test('parse_date_functions', () => {
    parseOne('SELECT toDate(created), toDateTime(created) FROM t', clickhouse);
    parseOne('SELECT now(), today(), yesterday()', clickhouse);
  });
});

describe('ClickHouse - Distributed Queries', () => {
  // Error: "Expected: SELECT, VALUES, or a subquery in the query body, found: t"
  // Distributed table syntax not yet supported - needs upstream PR
  test.skip('parse_distributed_table', () => {
    parseOne("CREATE TABLE t_distributed AS t ENGINE = Distributed('cluster', 'database', 't', rand())", clickhouse);
  });

  test('parse_global_join', () => {
    parseOne('SELECT * FROM t1 GLOBAL JOIN t2 ON t1.id = t2.id', clickhouse);
  });
});

describe('ClickHouse - Materialized Views', () => {
  // Error: "Expected: AS, found: ENGINE"
  // ENGINE clause for materialized views not yet supported - needs upstream PR
  test.skip('parse_create_materialized_view', () => {
    parseOne('CREATE MATERIALIZED VIEW mv ENGINE = MergeTree() ORDER BY id AS SELECT * FROM t', clickhouse);
  });

  // Error: "Expected: AS, found: ENGINE"
  // ENGINE clause and POPULATE for materialized views not yet supported - needs upstream PR
  test.skip('parse_create_materialized_view_populate', () => {
    parseOne('CREATE MATERIALIZED VIEW mv ENGINE = MergeTree() ORDER BY id POPULATE AS SELECT * FROM t', clickhouse);
  });
});

describe('ClickHouse - Dictionaries', () => {
  // Error: "Expected: an object type after CREATE, found: DICTIONARY"
  // CREATE DICTIONARY not yet supported - needs upstream PR
  test.skip('parse_create_dictionary', () => {
    parseOne(`
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
  test('parse_alter_table_add_column', () => {
    parseOne('ALTER TABLE t ADD COLUMN new_col UInt32', clickhouse);
  });

  test('parse_alter_table_drop_column', () => {
    parseOne('ALTER TABLE t DROP COLUMN col', clickhouse);
  });

  test('parse_alter_table_modify_column', () => {
    parseOne('ALTER TABLE t MODIFY COLUMN col String', clickhouse);
  });

  // Error: "Expected: ADD, RENAME, PARTITION, SWAP, DROP, REPLICA IDENTITY, SET, or SET TBLPROPERTIES after ALTER TABLE, found: UPDATE"
  // ALTER TABLE UPDATE not yet supported - needs upstream PR
  test.skip('parse_alter_table_update', () => {
    parseOne('ALTER TABLE t UPDATE col = col * 2 WHERE id > 100', clickhouse);
  });

  // Error: "Expected: ADD, RENAME, PARTITION, SWAP, DROP, REPLICA IDENTITY, SET, or SET TBLPROPERTIES after ALTER TABLE, found: DELETE"
  // ALTER TABLE DELETE not yet supported - needs upstream PR
  test.skip('parse_alter_table_delete', () => {
    parseOne('ALTER TABLE t DELETE WHERE id < 100', clickhouse);
  });
});

describe('ClickHouse - System Operations', () => {
  test('parse_optimize_table', () => {
    parseOne('OPTIMIZE TABLE t', clickhouse);
    parseOne('OPTIMIZE TABLE t FINAL', clickhouse);
  });

  // Error: Parser doesn't recognize SYSTEM commands
  // SYSTEM commands for cluster management not yet supported - needs upstream PR
  test.skip('parse_system_commands', () => {
    parseOne('SYSTEM FLUSH LOGS', clickhouse);
    parseOne('SYSTEM RELOAD CONFIG', clickhouse);
  });
});

describe('ClickHouse - Special Syntax', () => {
  // Error: WITH clause syntax difference from standard SQL
  // ClickHouse-specific WITH clause syntax not yet supported - needs upstream PR
  test.skip('parse_with_clause', () => {
    parseOne('WITH 10 AS x SELECT x * 2', clickhouse);
  });

  test('parse_lambda_functions', () => {
    parseOne('SELECT arrayMap(x -> x * 2, arr) FROM t', clickhouse);
  });
});
