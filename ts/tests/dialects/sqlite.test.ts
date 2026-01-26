/**
 * SQLite dialect tests
 * Based on SQLite-specific features
 */

import {
  parseOne,
  dialects,
  ensureWasmInitialized,
} from '../test-utils';

const sqlite = dialects.sqlite;

beforeAll(async () => {
  await ensureWasmInitialized();
});

describe('SQLite - INSERT', () => {
  test('parse_insert_or_replace', async () => {
    await parseOne('INSERT OR REPLACE INTO t VALUES (1)', sqlite);
  });

  test('parse_insert_or_ignore', async () => {
    await parseOne('INSERT OR IGNORE INTO t VALUES (1)', sqlite);
  });

  test('parse_insert_or_rollback', async () => {
    await parseOne('INSERT OR ROLLBACK INTO t VALUES (1)', sqlite);
  });

  test('parse_insert_or_abort', async () => {
    await parseOne('INSERT OR ABORT INTO t VALUES (1)', sqlite);
  });

  test('parse_insert_or_fail', async () => {
    await parseOne('INSERT OR FAIL INTO t VALUES (1)', sqlite);
  });

  test('parse_replace', async () => {
    await parseOne('REPLACE INTO t VALUES (1)', sqlite);
  });
});

describe('SQLite - CREATE TABLE', () => {
  test('parse_create_table', async () => {
    await parseOne('CREATE TABLE t (id INTEGER PRIMARY KEY)', sqlite);
  });

  test('parse_create_table_autoincrement', async () => {
    await parseOne('CREATE TABLE t (id INTEGER PRIMARY KEY AUTOINCREMENT)', sqlite);
  });

  test('parse_create_table_without_rowid', async () => {
    await parseOne('CREATE TABLE t (id INTEGER PRIMARY KEY) WITHOUT ROWID', sqlite);
  });

  test('parse_create_table_if_not_exists', async () => {
    await parseOne('CREATE TABLE IF NOT EXISTS t (id INTEGER)', sqlite);
  });

  test('parse_create_temp_table', async () => {
    await parseOne('CREATE TEMP TABLE t (id INTEGER)', sqlite);
    await parseOne('CREATE TEMPORARY TABLE t (id INTEGER)', sqlite);
  });
});

describe('SQLite - Data Types', () => {
  test('parse_sqlite_types', async () => {
    await parseOne('CREATE TABLE t (a INTEGER, b TEXT, c REAL, d BLOB)', sqlite);
  });

  test('parse_type_affinity', async () => {
    await parseOne('CREATE TABLE t (id INT, name VARCHAR(255))', sqlite);
  });
});

describe('SQLite - Constraints', () => {
  test('parse_primary_key', async () => {
    await parseOne('CREATE TABLE t (id INTEGER PRIMARY KEY)', sqlite);
  });

  test('parse_unique', async () => {
    await parseOne('CREATE TABLE t (email TEXT UNIQUE)', sqlite);
  });

  test('parse_not_null', async () => {
    await parseOne('CREATE TABLE t (name TEXT NOT NULL)', sqlite);
  });

  test('parse_default', async () => {
    await parseOne("CREATE TABLE t (status TEXT DEFAULT 'active')", sqlite);
  });

  test('parse_check', async () => {
    await parseOne('CREATE TABLE t (age INTEGER CHECK(age >= 18))', sqlite);
  });

  test('parse_foreign_key', async () => {
    await parseOne('CREATE TABLE t (parent_id INTEGER REFERENCES parent(id))', sqlite);
  });

  test('parse_on_conflict_clause', async () => {
    await parseOne('CREATE TABLE t (id INTEGER PRIMARY KEY ON CONFLICT REPLACE)', sqlite);
  });
});

describe('SQLite - Indexes', () => {
  test('parse_create_index', async () => {
    await parseOne('CREATE INDEX idx ON t (col)', sqlite);
  });

  test('parse_create_unique_index', async () => {
    await parseOne('CREATE UNIQUE INDEX idx ON t (col)', sqlite);
  });

  test('parse_create_index_if_not_exists', async () => {
    await parseOne('CREATE INDEX IF NOT EXISTS idx ON t (col)', sqlite);
  });

  test('parse_create_index_where', async () => {
    await parseOne('CREATE INDEX idx ON t (col) WHERE active = 1', sqlite);
  });
});

describe('SQLite - Expressions', () => {
  test('parse_concat_operator', async () => {
    await parseOne("SELECT 'hello' || 'world'", sqlite);
  });

  // TODO: Enable when sqlparser adds GLOB operator support
  // GLOB is SQLite-specific pattern matching (case-sensitive, shell-like wildcards)
  // No upstream PR found for this feature
  test.skip('parse_glob', async () => {
    await parseOne("SELECT * FROM t WHERE name GLOB 'test*'", sqlite);
  });

  test('parse_match', async () => {
    await parseOne("SELECT * FROM t WHERE name MATCH 'pattern'", sqlite);
  });

  test('parse_regexp', async () => {
    await parseOne("SELECT * FROM t WHERE name REGEXP '^test'", sqlite);
  });
});

describe('SQLite - Functions', () => {
  test('parse_aggregate_functions', async () => {
    await parseOne('SELECT COUNT(*), SUM(amount), AVG(amount) FROM t', sqlite);
  });

  test('parse_string_functions', async () => {
    await parseOne('SELECT LENGTH(name), SUBSTR(name, 1, 3) FROM t', sqlite);
  });

  test('parse_date_functions', async () => {
    await parseOne("SELECT DATE('now'), DATETIME('now'), STRFTIME('%Y', 'now')", sqlite);
  });
});

describe('SQLite - Transactions', () => {
  test('parse_begin', async () => {
    await parseOne('BEGIN', sqlite);
    await parseOne('BEGIN TRANSACTION', sqlite);
    await parseOne('BEGIN IMMEDIATE', sqlite);
    await parseOne('BEGIN EXCLUSIVE', sqlite);
  });

  test('parse_commit', async () => {
    await parseOne('COMMIT', sqlite);
    await parseOne('END', sqlite);
  });

  test('parse_rollback', async () => {
    await parseOne('ROLLBACK', sqlite);
  });

  test('parse_savepoint', async () => {
    await parseOne('SAVEPOINT sp1', sqlite);
    await parseOne('RELEASE sp1', sqlite);
    await parseOne('ROLLBACK TO sp1', sqlite);
  });
});

describe('SQLite - PRAGMA', () => {
  // TODO: Enable when sqlparser adds PRAGMA statement support
  // PRAGMA is SQLite-specific command for configuration and metadata queries
  // No upstream PR found for this feature
  test.skip('parse_pragma', async () => {
    await parseOne('PRAGMA foreign_keys = ON', sqlite);
    await parseOne('PRAGMA table_info(tablename)', sqlite);
  });
});

describe('SQLite - ATTACH/DETACH', () => {
  test('parse_attach', async () => {
    await parseOne("ATTACH DATABASE 'file.db' AS alias", sqlite);
  });

  // TODO: Enable when sqlparser adds DETACH DATABASE support
  // DETACH is SQLite-specific command to detach previously attached databases
  // No upstream PR found for this feature
  test.skip('parse_detach', async () => {
    await parseOne('DETACH DATABASE alias', sqlite);
  });
});

describe('SQLite - VACUUM', () => {
  test('parse_vacuum', async () => {
    await parseOne('VACUUM', sqlite);
  });
});

describe('SQLite - ANALYZE', () => {
  // TODO: Enable when sqlparser adds full ANALYZE support for SQLite
  // ANALYZE in SQLite requires specific table/index name, not supported in current version
  // No upstream PR found for this feature
  test.skip('parse_analyze', async () => {
    await parseOne('ANALYZE', sqlite);
    await parseOne('ANALYZE t', sqlite);
  });
});

describe('SQLite - ALTER TABLE', () => {
  test('parse_alter_table_rename', async () => {
    await parseOne('ALTER TABLE t RENAME TO new_name', sqlite);
  });

  test('parse_alter_table_add_column', async () => {
    await parseOne('ALTER TABLE t ADD COLUMN new_col INTEGER', sqlite);
  });

  test('parse_alter_table_rename_column', async () => {
    await parseOne('ALTER TABLE t RENAME COLUMN old_col TO new_col', sqlite);
  });

  test('parse_alter_table_drop_column', async () => {
    await parseOne('ALTER TABLE t DROP COLUMN col', sqlite);
  });
});

describe('SQLite - CTEs', () => {
  test('parse_cte', async () => {
    await parseOne('WITH cte AS (SELECT 1) SELECT * FROM cte', sqlite);
  });

  test('parse_recursive_cte', async () => {
    await parseOne(`
      WITH RECURSIVE cnt(x) AS (
        SELECT 1
        UNION ALL
        SELECT x+1 FROM cnt WHERE x < 5
      )
      SELECT x FROM cnt
    `, sqlite);
  });
});

describe('SQLite - Window Functions', () => {
  test('parse_window_functions', async () => {
    await parseOne('SELECT ROW_NUMBER() OVER (ORDER BY id) FROM t', sqlite);
    await parseOne('SELECT RANK() OVER (PARTITION BY category ORDER BY amount DESC) FROM t', sqlite);
  });
});

describe('SQLite - JSON1 Extension', () => {
  test('parse_json_extract', async () => {
    await parseOne("SELECT json_extract(data, '$.key') FROM t", sqlite);
  });

  test('parse_json_arrow', async () => {
    await parseOne("SELECT data->'key' FROM t", sqlite);
    await parseOne("SELECT data->>'key' FROM t", sqlite);
  });
});
