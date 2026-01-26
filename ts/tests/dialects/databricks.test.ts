/**
 * Databricks dialect tests
 * Ported from sqlparser_databricks.rs
 */

import {
  parseOne,
  expectParseError,
  dialects,
  ensureWasmInitialized,
} from '../test-utils';

const databricks = dialects.databricks;

beforeAll(async () => {
  await ensureWasmInitialized();
});

describe('Databricks - Identifiers and Strings', () => {
  test('test_databricks_identifiers', async () => {
    // Backtick-delimited identifiers
    await parseOne('SELECT `Ä`', databricks);
    await parseOne('SELECT `col name with spaces`', databricks);
    await parseOne('SELECT `table`.`column` FROM `my_table`', databricks);

    // Double-quoted strings (not identifiers in Databricks)
    await parseOne('SELECT "Ä"', databricks);
    await parseOne('SELECT "string with spaces"', databricks);
  });
});

describe('Databricks - EXISTS Function', () => {
  test('test_databricks_exists', async () => {
    // EXISTS as a function (not a keyword)
    await parseOne('SELECT EXISTS(array(1, 2, 3), x -> x IS NULL)', databricks);
    await parseOne('SELECT EXISTS(col, x -> x > 5) FROM my_table', databricks);

    // Test incomplete expressions should fail
    await expectParseError('SELECT EXISTS(array(1, 2, 3), x ->)', databricks);
  });
});

describe('Databricks - Lambda Functions', () => {
  test('test_databricks_lambdas', async () => {
    // Arrow syntax for lambda parameters
    await parseOne('SELECT array_sort(array(5, 3, 1), (x, y) -> x - y)', databricks);

    // Lambda with CASE statement
    await parseOne(
      'SELECT array_sort(array(5, 3, 1), (x, y) -> CASE WHEN x > y THEN 1 ELSE -1 END)',
      databricks
    );

    // map_zip_with function
    await parseOne(
      "SELECT map_zip_with(map('a', 1), map('a', 2), (k, v1, v2) -> v1 + v2)",
      databricks
    );

    // transform function
    await parseOne('SELECT transform(array(1, 2, 3), x -> x * 2)', databricks);
    await parseOne('SELECT transform(col, x -> x + 1) FROM my_table', databricks);
  });
});

describe('Databricks - VALUES Clause', () => {
  test('test_values_clause', async () => {
    // VALUES clause for row constructors
    await parseOne('VALUES ("one", 1), ("two", 2)', databricks);
    await parseOne("VALUES ('a', 1), ('b', 2), ('c', 3)", databricks);

    // VALUES in FROM clause
    await parseOne('SELECT * FROM VALUES ("one", 1), ("two", 2) AS t(word, num)', databricks);

    // VALUES as a table identifier (should work)
    await parseOne('SELECT * FROM values', databricks);
  });
});

describe('Databricks - USE Statement', () => {
  test('parse_use', async () => {
    // USE CATALOG
    await parseOne('USE CATALOG my_catalog', databricks);
    await parseOne('USE CATALOG `my-catalog`', databricks);

    // USE DATABASE
    await parseOne('USE DATABASE my_db', databricks);
    await parseOne('USE my_db', databricks);

    // USE SCHEMA
    await parseOne('USE SCHEMA my_schema', databricks);
    await parseOne('USE SCHEMA catalog.schema', databricks);

    // Error cases - missing identifier
    await expectParseError('USE CATALOG', databricks);
    await expectParseError('USE DATABASE', databricks);
  });
});

describe('Databricks - STRUCT Function', () => {
  test('parse_databricks_struct_function', async () => {
    // STRUCT with positional arguments
    await parseOne('SELECT STRUCT(1, "foo", true)', databricks);
    await parseOne('SELECT STRUCT(col1, col2, col3) FROM my_table', databricks);

    // STRUCT with named fields (AS syntax)
    await parseOne('SELECT STRUCT(1 AS id, "foo" AS name)', databricks);
    await parseOne('SELECT STRUCT(id AS user_id, name AS user_name) FROM users', databricks);

    // Mixed named and unnamed struct fields
    await parseOne('SELECT STRUCT(1, "foo" AS name, true)', databricks);
  });
});

describe('Databricks - TIMESTAMP_NTZ', () => {
  test('data_type_timestamp_ntz', async () => {
    // TIMESTAMP_NTZ literal syntax
    await parseOne("SELECT TIMESTAMP_NTZ '2025-03-29T18:52:00'", databricks);
    await parseOne("SELECT TIMESTAMP_NTZ '2025-01-26 12:00:00'", databricks);

    // Double-colon cast operator with TIMESTAMP_NTZ
    await parseOne("SELECT '2025-03-29T18:52:00'::TIMESTAMP_NTZ", databricks);
    await parseOne("SELECT col::TIMESTAMP_NTZ FROM my_table", databricks);

    // Column definitions using TIMESTAMP_NTZ
    await parseOne('CREATE TABLE events (event_time TIMESTAMP_NTZ)', databricks);
    await parseOne(
      'CREATE TABLE events (id INT, event_time TIMESTAMP_NTZ, data STRING)',
      databricks
    );
  });
});

describe('Databricks - Table Time Travel', () => {
  // TODO: Enable when sqlparser >= 0.61.0
  // - TIMESTAMP AS OF: PR #2134 merged Jan 7, 2026
  // - VERSION AS OF: PR #2155 merged Jan 20, 2026
  test.skip('parse_table_time_travel', async () => {
    // TIMESTAMP AS OF for temporal queries
    await parseOne(
      "SELECT * FROM t1 TIMESTAMP AS OF '2018-10-18T22:15:12.013Z'",
      databricks
    );
    await parseOne(
      "SELECT * FROM my_table TIMESTAMP AS OF '2025-01-26T00:00:00'",
      databricks
    );

    // VERSION AS OF for version-specific queries
    await parseOne('SELECT * FROM t1 VERSION AS OF 123', databricks);
    await parseOne('SELECT * FROM my_table VERSION AS OF 1', databricks);

    // Time travel with joins
    await parseOne(
      "SELECT * FROM t1 TIMESTAMP AS OF '2018-10-18T22:15:12.013Z' JOIN t2 ON t1.id = t2.id",
      databricks
    );

    // Invalid syntax variations should fail
    await expectParseError('SELECT * FROM t1 TIMESTAMP AS OF', databricks);
    await expectParseError('SELECT * FROM t1 VERSION AS OF', databricks);
  });
});

describe('Databricks - General Syntax', () => {
  test('parse_common_databricks_queries', async () => {
    // Delta Lake operations
    await parseOne('SELECT * FROM delta.`/path/to/table`', databricks);

    // Column aliases
    await parseOne('SELECT col1 AS alias1, col2 alias2 FROM my_table', databricks);

    // Subqueries
    await parseOne('SELECT * FROM (SELECT * FROM t1) AS subq', databricks);
  });
});
