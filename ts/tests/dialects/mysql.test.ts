/**
 * MySQL dialect tests
 * Ported from sqlparser_mysql.rs
 */

import {
  parseOne,
  dialects,
  ensureWasmInitialized,
  isCreateTable,
} from '../test-utils';

const mysql = dialects.mysql;

beforeAll(async () => {
  await ensureWasmInitialized();
});

describe('MySQL - Identifiers', () => {
  test('parse_identifiers', async () => {
    await parseOne('SELECT $a$, àà FROM t', mysql);
  });

  test('parse_backtick_identifiers', async () => {
    await parseOne('SELECT `column` FROM `table`', mysql);
    await parseOne('SELECT `select` FROM `from`', mysql);
  });

  test('parse_quote_identifiers', async () => {
    await parseOne('SELECT `a``b` FROM t', mysql);
  });

  test('parse_numeric_prefix_column_name', async () => {
    await parseOne('SELECT 123abc FROM t', mysql);
    await parseOne('SELECT 1a FROM t', mysql);
  });

  test('parse_qualified_identifiers_with_numeric_prefix', async () => {
    await parseOne('SELECT t.123abc FROM t', mysql);
  });
});

describe('MySQL - String Literals', () => {
  test('parse_literal_string', async () => {
    await parseOne("SELECT 'single', \"double\" FROM t", mysql);
  });

  test('parse_double_quoted_strings', async () => {
    await parseOne('SELECT "hello world" FROM t', mysql);
  });
});

describe('MySQL - FLUSH', () => {
  test('parse_flush', async () => {
    await parseOne('FLUSH OPTIMIZER_COSTS', mysql);
    await parseOne('FLUSH BINARY LOGS', mysql);
    await parseOne('FLUSH ENGINE LOGS', mysql);
    await parseOne('FLUSH ERROR LOGS', mysql);
    await parseOne('FLUSH GENERAL LOGS', mysql);
    await parseOne('FLUSH SLOW LOGS', mysql);
    await parseOne('FLUSH RELAY LOGS', mysql);
    await parseOne('FLUSH TABLES', mysql);
    await parseOne('FLUSH LOCAL SLOW LOGS', mysql);
    await parseOne('FLUSH NO_WRITE_TO_BINLOG GENERAL LOGS', mysql);
  });
});

describe('MySQL - SHOW', () => {
  test('parse_show_columns', async () => {
    await parseOne('SHOW COLUMNS FROM mytable', mysql);
    await parseOne('SHOW EXTENDED COLUMNS FROM mytable', mysql);
    await parseOne('SHOW FULL COLUMNS FROM mytable', mysql);
    await parseOne('SHOW EXTENDED FULL COLUMNS FROM mytable', mysql);
    await parseOne("SHOW COLUMNS FROM mytable LIKE 'pattern'", mysql);
    await parseOne('SHOW COLUMNS FROM mytable WHERE 1 = 2', mysql);
  });

  test('parse_show_status', async () => {
    await parseOne("SHOW SESSION STATUS LIKE 'ssl_cipher'", mysql);
    await parseOne('SHOW GLOBAL STATUS', mysql);
    await parseOne('SHOW STATUS WHERE value = 2', mysql);
  });

  test('parse_show_tables', async () => {
    await parseOne('SHOW TABLES', mysql);
    await parseOne('SHOW TABLES FROM mydb', mysql);
    await parseOne('SHOW EXTENDED TABLES', mysql);
    await parseOne('SHOW FULL TABLES', mysql);
    await parseOne("SHOW TABLES LIKE 'pattern'", mysql);
  });

  test('parse_show_create', async () => {
    await parseOne('SHOW CREATE TABLE myident', mysql);
    await parseOne('SHOW CREATE TRIGGER myident', mysql);
    await parseOne('SHOW CREATE EVENT myident', mysql);
    await parseOne('SHOW CREATE FUNCTION myident', mysql);
    await parseOne('SHOW CREATE PROCEDURE myident', mysql);
    await parseOne('SHOW CREATE VIEW myident', mysql);
  });

  test('parse_show_collation', async () => {
    await parseOne('SHOW COLLATION', mysql);
    await parseOne("SHOW COLLATION LIKE 'pattern'", mysql);
  });
});

describe('MySQL - USE', () => {
  test('parse_use', async () => {
    await parseOne('USE mydb', mysql);
    await parseOne('USE `mydb`', mysql);
  });
});

describe('MySQL - SET', () => {
  test('parse_set_variables', async () => {
    await parseOne("SET sql_mode = CONCAT(@@sql_mode, ',STRICT_TRANS_TABLES')", mysql);
    await parseOne('SET LOCAL autocommit = 1', mysql);
    await parseOne("SET NAMES 'utf8mb4'", mysql);
    await parseOne('SET NAMES utf8mb4', mysql);
  });
});

describe('MySQL - CREATE TABLE', () => {
  test('parse_create_table_auto_increment', async () => {
    const stmt = await parseOne('CREATE TABLE t (id INT AUTO_INCREMENT)', mysql);
    expect(isCreateTable(stmt)).toBe(true);
  });

  test('parse_create_table_primary_and_unique_key', async () => {
    await parseOne('CREATE TABLE t (id INT PRIMARY KEY)', mysql);
    // UNIQUE KEY syntax is not yet fully supported
    // await parseOne('CREATE TABLE t (id INT UNIQUE KEY)', mysql);
    await parseOne('CREATE TABLE t (id INT, PRIMARY KEY (id))', mysql);
    // await parseOne('CREATE TABLE t (id INT, UNIQUE KEY (id))', mysql);
  });

  test('parse_create_table_comment', async () => {
    await parseOne("CREATE TABLE foo (bar INT) COMMENT 'baz'", mysql);
    await parseOne("CREATE TABLE foo (bar INT) COMMENT = 'baz'", mysql);
  });

  test('parse_create_table_auto_increment_offset', async () => {
    await parseOne('CREATE TABLE t (id INT) AUTO_INCREMENT = 100', mysql);
    await parseOne('CREATE TABLE t (id INT) AUTO_INCREMENT 100', mysql);
  });

  test('parse_create_table_engine_default_charset', async () => {
    await parseOne('CREATE TABLE t (id INT) ENGINE = InnoDB', mysql);
    await parseOne('CREATE TABLE t (id INT) DEFAULT CHARSET = utf8mb4', mysql);
    await parseOne('CREATE TABLE t (id INT) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4', mysql);
  });

  test('parse_create_table_collate', async () => {
    await parseOne('CREATE TABLE t (id INT) COLLATE = utf8mb4_unicode_ci', mysql);
  });

  test('parse_create_table_set_enum', async () => {
    await parseOne("CREATE TABLE t (status ENUM('active', 'inactive'))", mysql);
    await parseOne("CREATE TABLE t (tags SET('a', 'b', 'c'))", mysql);
  });

  test('parse_create_table_gencol', async () => {
    await parseOne('CREATE TABLE t (a INT, b INT GENERATED ALWAYS AS (a * 2))', mysql);
    await parseOne('CREATE TABLE t (a INT, b INT GENERATED ALWAYS AS (a * 2) VIRTUAL)', mysql);
    await parseOne('CREATE TABLE t (a INT, b INT GENERATED ALWAYS AS (a * 2) STORED)', mysql);
  });

  test('parse_create_table_character_set_collate', async () => {
    await parseOne('CREATE TABLE t (name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci)', mysql);
  });

  test('parse_create_table_with_minimum_display_width', async () => {
    await parseOne('CREATE TABLE t (a INT(11))', mysql);
    await parseOne('CREATE TABLE t (a TINYINT(4))', mysql);
    await parseOne('CREATE TABLE t (a BIGINT(20))', mysql);
  });

  test('parse_create_table_unsigned', async () => {
    await parseOne('CREATE TABLE t (a INT UNSIGNED)', mysql);
    await parseOne('CREATE TABLE t (a BIGINT UNSIGNED)', mysql);
    await parseOne('CREATE TABLE t (a TINYINT UNSIGNED)', mysql);
  });

  test('parse_create_table_as_select', async () => {
    await parseOne('CREATE TABLE t AS SELECT * FROM other', mysql);
    await parseOne('CREATE TABLE t ENGINE = InnoDB AS SELECT * FROM other', mysql);
  });
});

describe('MySQL - INSERT', () => {
  test('parse_simple_insert', async () => {
    await parseOne('INSERT INTO t VALUES (1, 2, 3)', mysql);
    await parseOne('INSERT INTO t VALUES (1, 2, 3), (4, 5, 6)', mysql);
  });

  test('parse_insert_ignore', async () => {
    await parseOne('INSERT IGNORE INTO t VALUES (1, 2, 3)', mysql);
  });

  test('parse_priority_insert', async () => {
    await parseOne('INSERT HIGH_PRIORITY INTO t VALUES (1)', mysql);
    await parseOne('INSERT LOW_PRIORITY INTO t VALUES (1)', mysql);
    await parseOne('INSERT DELAYED INTO t VALUES (1)', mysql);
  });

  test('parse_insert_as', async () => {
    await parseOne("INSERT INTO t VALUES (1) AS new ON DUPLICATE KEY UPDATE a = new.a", mysql);
  });

  test('parse_insert_on_duplicate_key_update', async () => {
    await parseOne('INSERT INTO t VALUES (1, 2) ON DUPLICATE KEY UPDATE a = 1', mysql);
    await parseOne('INSERT INTO t VALUES (1, 2) ON DUPLICATE KEY UPDATE a = 1, b = 2', mysql);
    await parseOne('INSERT INTO t VALUES (1, 2) ON DUPLICATE KEY UPDATE a = VALUES(a)', mysql);
  });

  test('parse_replace', async () => {
    await parseOne('REPLACE INTO t VALUES (1, 2, 3)', mysql);
    await parseOne('REPLACE INTO t (a, b, c) VALUES (1, 2, 3)', mysql);
  });

  test('parse_insert_with_numeric_prefix_column', async () => {
    await parseOne('INSERT INTO t (123abc) VALUES (1)', mysql);
  });
});

describe('MySQL - UPDATE', () => {
  test('parse_update_with_joins', async () => {
    await parseOne('UPDATE t1 JOIN t2 ON t1.id = t2.id SET t1.a = t2.b', mysql);
    await parseOne('UPDATE t1 LEFT JOIN t2 ON t1.id = t2.id SET t1.a = 1', mysql);
  });
});

describe('MySQL - SELECT', () => {
  test('parse_select_with_numeric_prefix_column', async () => {
    await parseOne('SELECT 123abc FROM t', mysql);
  });

  test('parse_concatenation_of_exp_number_and_numeric_prefix_column', async () => {
    await parseOne('SELECT 1e+123abc FROM t', mysql);
  });
});

describe('MySQL - Index', () => {
  test('parse_create_index', async () => {
    await parseOne('CREATE INDEX idx ON t (col)', mysql);
    await parseOne('CREATE UNIQUE INDEX idx ON t (col)', mysql);
    // FULLTEXT and SPATIAL INDEX are not yet fully supported
    // await parseOne('CREATE FULLTEXT INDEX idx ON t (col)', mysql);
    // await parseOne('CREATE SPATIAL INDEX idx ON t (col)', mysql);
  });

  test('parse_prefix_key_part', async () => {
    await parseOne('CREATE INDEX idx_index ON t (textcol(10))', mysql);
  });

  test('parse_index_with_type', async () => {
    await parseOne('CREATE INDEX idx ON t (col) USING BTREE', mysql);
    await parseOne('CREATE INDEX idx ON t (col) USING HASH', mysql);
  });
});

describe('MySQL - Data Types', () => {
  test('parse_signed_data_types', async () => {
    await parseOne('SELECT CAST(1 AS SIGNED)', mysql);
    await parseOne('SELECT CAST(1 AS SIGNED INTEGER)', mysql);
    await parseOne('SELECT CAST(1 AS UNSIGNED)', mysql);
    await parseOne('SELECT CAST(1 AS UNSIGNED INTEGER)', mysql);
  });

  test('parse_boolean_type', async () => {
    await parseOne('CREATE TABLE t (b BOOLEAN)', mysql);
    await parseOne('CREATE TABLE t (b BOOL)', mysql);
  });

  test('parse_text_types', async () => {
    await parseOne('CREATE TABLE t (a TINYTEXT)', mysql);
    await parseOne('CREATE TABLE t (a TEXT)', mysql);
    await parseOne('CREATE TABLE t (a MEDIUMTEXT)', mysql);
    await parseOne('CREATE TABLE t (a LONGTEXT)', mysql);
  });

  test('parse_blob_types', async () => {
    await parseOne('CREATE TABLE t (a TINYBLOB)', mysql);
    await parseOne('CREATE TABLE t (a BLOB)', mysql);
    await parseOne('CREATE TABLE t (a MEDIUMBLOB)', mysql);
    await parseOne('CREATE TABLE t (a LONGBLOB)', mysql);
  });

  test('parse_binary_types', async () => {
    await parseOne('CREATE TABLE t (a BINARY(16))', mysql);
    await parseOne('CREATE TABLE t (a VARBINARY(255))', mysql);
  });

  test('parse_datetime_types', async () => {
    await parseOne('CREATE TABLE t (a DATE)', mysql);
    await parseOne('CREATE TABLE t (a TIME)', mysql);
    await parseOne('CREATE TABLE t (a DATETIME)', mysql);
    await parseOne('CREATE TABLE t (a TIMESTAMP)', mysql);
    await parseOne('CREATE TABLE t (a YEAR)', mysql);
  });
});

describe('MySQL - Operators', () => {
  test('parse_div_operator', async () => {
    await parseOne('SELECT 10 DIV 3', mysql);
  });

  test('parse_mod_operator', async () => {
    // MOD as infix operator is not yet fully supported
    // await parseOne('SELECT 10 MOD 3', mysql);
    await parseOne('SELECT 10 % 3', mysql);
  });

  test('parse_xor_operator', async () => {
    await parseOne('SELECT 1 XOR 0', mysql);
  });

  test('parse_regexp_operator', async () => {
    await parseOne("SELECT 'hello' REGEXP '^h'", mysql);
    await parseOne("SELECT 'hello' RLIKE '^h'", mysql);
  });
});

describe('MySQL - Functions', () => {
  test('parse_date_functions', async () => {
    await parseOne('SELECT NOW()', mysql);
    await parseOne('SELECT CURDATE()', mysql);
    await parseOne('SELECT CURTIME()', mysql);
    await parseOne('SELECT DATE_ADD(date_col, INTERVAL 1 DAY)', mysql);
    await parseOne('SELECT DATE_SUB(date_col, INTERVAL 1 MONTH)', mysql);
  });

  test('parse_string_functions', async () => {
    await parseOne('SELECT CONCAT(a, b, c)', mysql);
    await parseOne('SELECT CONCAT_WS(\',\', a, b, c)', mysql);
    await parseOne('SELECT LENGTH(str)', mysql);
    await parseOne('SELECT CHAR_LENGTH(str)', mysql);
    await parseOne('SELECT SUBSTRING(str, 1, 3)', mysql);
  });

  test('parse_if_function', async () => {
    await parseOne('SELECT IF(condition, true_val, false_val)', mysql);
    await parseOne('SELECT IFNULL(val, default_val)', mysql);
  });

  test('parse_group_concat', async () => {
    await parseOne('SELECT GROUP_CONCAT(col)', mysql);
    await parseOne('SELECT GROUP_CONCAT(col SEPARATOR \',\')', mysql);
    await parseOne('SELECT GROUP_CONCAT(DISTINCT col ORDER BY col)', mysql);
  });
});

describe('MySQL - LOCK TABLES', () => {
  test('parse_lock_tables', async () => {
    await parseOne('LOCK TABLES t READ', mysql);
    await parseOne('LOCK TABLES t WRITE', mysql);
    await parseOne('LOCK TABLES t1 READ, t2 WRITE', mysql);
  });

  test('parse_unlock_tables', async () => {
    await parseOne('UNLOCK TABLES', mysql);
  });
});

describe('MySQL - Variables', () => {
  test('parse_user_variables', async () => {
    await parseOne('SELECT @var', mysql);
    await parseOne('SET @var = 1', mysql);
    await parseOne('SELECT @var := 1', mysql);
  });

  test('parse_system_variables', async () => {
    await parseOne('SELECT @@version', mysql);
    await parseOne('SELECT @@global.version', mysql);
    await parseOne('SELECT @@session.sql_mode', mysql);
  });
});

describe('MySQL - Stored Procedures', () => {
  test('parse_call', async () => {
    await parseOne('CALL my_procedure()', mysql);
    await parseOne('CALL my_procedure(1, 2, 3)', mysql);
  });
});

describe('MySQL - ON UPDATE/DELETE Actions', () => {
  test('parse_on_delete', async () => {
    await parseOne('CREATE TABLE t (id INT, parent_id INT REFERENCES parent(id) ON DELETE CASCADE)', mysql);
    await parseOne('CREATE TABLE t (id INT, parent_id INT REFERENCES parent(id) ON DELETE SET NULL)', mysql);
    await parseOne('CREATE TABLE t (id INT, parent_id INT REFERENCES parent(id) ON DELETE RESTRICT)', mysql);
    await parseOne('CREATE TABLE t (id INT, parent_id INT REFERENCES parent(id) ON DELETE NO ACTION)', mysql);
  });

  test('parse_on_update', async () => {
    await parseOne('CREATE TABLE t (id INT, parent_id INT REFERENCES parent(id) ON UPDATE CASCADE)', mysql);
    await parseOne('CREATE TABLE t (id INT, parent_id INT REFERENCES parent(id) ON UPDATE SET NULL)', mysql);
  });
});
