/**
 * Databricks dialect tests
 * Ported from sqlparser_databricks.rs
 */

import {
  parseOne,
  expectParseError,
  dialects,
} from '../test-utils';

const databricks = dialects.databricks;

describe('Databricks - Identifiers and Strings', () => {
  test('parse_databricks_identifiers', () => {
    // Backtick-delimited identifiers
    parseOne('SELECT `Ä`', databricks);
    parseOne('SELECT `col name with spaces`', databricks);
    parseOne('SELECT `table`.`column` FROM `my_table`', databricks);

    // Double-quoted strings (not identifiers in Databricks)
    parseOne('SELECT "Ä"', databricks);
    parseOne('SELECT "string with spaces"', databricks);
  });
});

describe('Databricks - EXISTS Function', () => {
  test('parse_databricks_exists', () => {
    // EXISTS as a function (not a keyword)
    parseOne('SELECT EXISTS(array(1, 2, 3), x -> x IS NULL)', databricks);
    parseOne('SELECT EXISTS(col, x -> x > 5) FROM my_table', databricks);

    // Test incomplete expressions should fail
    expectParseError('SELECT EXISTS(array(1, 2, 3), x ->)', databricks);
  });
});

describe('Databricks - Lambda Functions', () => {
  test('parse_databricks_lambdas', () => {
    // Arrow syntax for lambda parameters
    parseOne('SELECT array_sort(array(5, 3, 1), (x, y) -> x - y)', databricks);

    // Lambda with CASE statement
    parseOne(
      'SELECT array_sort(array(5, 3, 1), (x, y) -> CASE WHEN x > y THEN 1 ELSE -1 END)',
      databricks
    );

    // map_zip_with function
    parseOne(
      "SELECT map_zip_with(map('a', 1), map('a', 2), (k, v1, v2) -> v1 + v2)",
      databricks
    );

    // transform function
    parseOne('SELECT transform(array(1, 2, 3), x -> x * 2)', databricks);
    parseOne('SELECT transform(col, x -> x + 1) FROM my_table', databricks);
  });
});

describe('Databricks - VALUES Clause', () => {
  test('parse_values_clause', () => {
    // VALUES clause for row constructors
    parseOne('VALUES ("one", 1), ("two", 2)', databricks);
    parseOne("VALUES ('a', 1), ('b', 2), ('c', 3)", databricks);

    // VALUES in FROM clause
    parseOne('SELECT * FROM VALUES ("one", 1), ("two", 2) AS t(word, num)', databricks);

    // VALUES as a table identifier (should work)
    parseOne('SELECT * FROM values', databricks);
  });
});

describe('Databricks - USE Statement', () => {
  test('parse_use', () => {
    // USE CATALOG
    parseOne('USE CATALOG my_catalog', databricks);
    parseOne('USE CATALOG `my-catalog`', databricks);

    // USE DATABASE
    parseOne('USE DATABASE my_db', databricks);
    parseOne('USE my_db', databricks);

    // USE SCHEMA
    parseOne('USE SCHEMA my_schema', databricks);
    parseOne('USE SCHEMA catalog.schema', databricks);

    // Error cases - missing identifier
    expectParseError('USE CATALOG', databricks);
    expectParseError('USE DATABASE', databricks);
  });
});

describe('Databricks - STRUCT Function', () => {
  test('parse_databricks_struct_function', () => {
    // STRUCT with positional arguments
    parseOne('SELECT STRUCT(1, "foo", true)', databricks);
    parseOne('SELECT STRUCT(col1, col2, col3) FROM my_table', databricks);

    // STRUCT with named fields (AS syntax)
    parseOne('SELECT STRUCT(1 AS id, "foo" AS name)', databricks);
    parseOne('SELECT STRUCT(id AS user_id, name AS user_name) FROM users', databricks);

    // Mixed named and unnamed struct fields
    parseOne('SELECT STRUCT(1, "foo" AS name, true)', databricks);
  });
});

describe('Databricks - TIMESTAMP_NTZ', () => {
  test('parse_timestamp_ntz', () => {
    // TIMESTAMP_NTZ literal syntax
    parseOne("SELECT TIMESTAMP_NTZ '2025-03-29T18:52:00'", databricks);
    parseOne("SELECT TIMESTAMP_NTZ '2025-01-26 12:00:00'", databricks);

    // Double-colon cast operator with TIMESTAMP_NTZ
    parseOne("SELECT '2025-03-29T18:52:00'::TIMESTAMP_NTZ", databricks);
    parseOne("SELECT col::TIMESTAMP_NTZ FROM my_table", databricks);

    // Column definitions using TIMESTAMP_NTZ
    parseOne('CREATE TABLE events (event_time TIMESTAMP_NTZ)', databricks);
    parseOne(
      'CREATE TABLE events (id INT, event_time TIMESTAMP_NTZ, data STRING)',
      databricks
    );
  });
});

describe('Databricks - Table Time Travel', () => {
  test('parse_table_time_travel', () => {
    // TIMESTAMP AS OF for temporal queries
    parseOne(
      "SELECT * FROM t1 TIMESTAMP AS OF '2018-10-18T22:15:12.013Z'",
      databricks
    );
    parseOne(
      "SELECT * FROM my_table TIMESTAMP AS OF '2025-01-26T00:00:00'",
      databricks
    );

    // VERSION AS OF for version-specific queries
    parseOne('SELECT * FROM t1 VERSION AS OF 123', databricks);
    parseOne('SELECT * FROM my_table VERSION AS OF 1', databricks);

    // Time travel with joins
    parseOne(
      "SELECT * FROM t1 TIMESTAMP AS OF '2018-10-18T22:15:12.013Z' JOIN t2 ON t1.id = t2.id",
      databricks
    );

    // Invalid syntax variations should fail
    expectParseError('SELECT * FROM t1 TIMESTAMP AS OF', databricks);
    expectParseError('SELECT * FROM t1 VERSION AS OF', databricks);
  });
});

describe('Databricks - General Syntax', () => {
  test('parse_common_databricks_queries', () => {
    // Delta Lake operations
    parseOne('SELECT * FROM delta.`/path/to/table`', databricks);

    // Column aliases
    parseOne('SELECT col1 AS alias1, col2 alias2 FROM my_table', databricks);

    // Subqueries
    parseOne('SELECT * FROM (SELECT * FROM t1) AS subq', databricks);
  });
});
