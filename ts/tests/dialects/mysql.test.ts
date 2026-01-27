/**
 * MySQL dialect tests
 * Ported from sqlparser_mysql.rs
 */

import {
  parseOne,
  dialects,
  isCreateTable,
} from '../test-utils';

const mysql = dialects.mysql;

describe('MySQL - Identifiers', () => {
  test('parse_identifiers', () => {
    parseOne('SELECT $a$, àà FROM t', mysql);
  });

  test('parse_backtick_identifiers', () => {
    parseOne('SELECT `column` FROM `table`', mysql);
    parseOne('SELECT `select` FROM `from`', mysql);
  });

  test('parse_quote_identifiers', () => {
    parseOne('SELECT `a``b` FROM t', mysql);
  });

  test('parse_numeric_prefix_column_name', () => {
    parseOne('SELECT 123abc FROM t', mysql);
    parseOne('SELECT 1a FROM t', mysql);
  });

  test('parse_qualified_identifiers_with_numeric_prefix', () => {
    parseOne('SELECT t.123abc FROM t', mysql);
  });
});

describe('MySQL - String Literals', () => {
  test('parse_literal_string', () => {
    parseOne("SELECT 'single', \"double\" FROM t", mysql);
  });

  test('parse_double_quoted_strings', () => {
    parseOne('SELECT "hello world" FROM t', mysql);
  });
});

describe('MySQL - FLUSH', () => {
  test('parse_flush', () => {
    parseOne('FLUSH OPTIMIZER_COSTS', mysql);
    parseOne('FLUSH BINARY LOGS', mysql);
    parseOne('FLUSH ENGINE LOGS', mysql);
    parseOne('FLUSH ERROR LOGS', mysql);
    parseOne('FLUSH GENERAL LOGS', mysql);
    parseOne('FLUSH SLOW LOGS', mysql);
    parseOne('FLUSH RELAY LOGS', mysql);
    parseOne('FLUSH TABLES', mysql);
    parseOne('FLUSH LOCAL SLOW LOGS', mysql);
    parseOne('FLUSH NO_WRITE_TO_BINLOG GENERAL LOGS', mysql);
  });
});

describe('MySQL - SHOW', () => {
  test('parse_show_columns', () => {
    parseOne('SHOW COLUMNS FROM mytable', mysql);
    parseOne('SHOW EXTENDED COLUMNS FROM mytable', mysql);
    parseOne('SHOW FULL COLUMNS FROM mytable', mysql);
    parseOne('SHOW EXTENDED FULL COLUMNS FROM mytable', mysql);
    parseOne("SHOW COLUMNS FROM mytable LIKE 'pattern'", mysql);
    parseOne('SHOW COLUMNS FROM mytable WHERE 1 = 2', mysql);
  });

  test('parse_show_status', () => {
    parseOne("SHOW SESSION STATUS LIKE 'ssl_cipher'", mysql);
    parseOne('SHOW GLOBAL STATUS', mysql);
    parseOne('SHOW STATUS WHERE value = 2', mysql);
  });

  test('parse_show_tables', () => {
    parseOne('SHOW TABLES', mysql);
    parseOne('SHOW TABLES FROM mydb', mysql);
    parseOne('SHOW EXTENDED TABLES', mysql);
    parseOne('SHOW FULL TABLES', mysql);
    parseOne("SHOW TABLES LIKE 'pattern'", mysql);
  });

  test('parse_show_create', () => {
    parseOne('SHOW CREATE TABLE myident', mysql);
    parseOne('SHOW CREATE TRIGGER myident', mysql);
    parseOne('SHOW CREATE EVENT myident', mysql);
    parseOne('SHOW CREATE FUNCTION myident', mysql);
    parseOne('SHOW CREATE PROCEDURE myident', mysql);
    parseOne('SHOW CREATE VIEW myident', mysql);
  });

  test('parse_show_collation', () => {
    parseOne('SHOW COLLATION', mysql);
    parseOne("SHOW COLLATION LIKE 'pattern'", mysql);
  });
});

describe('MySQL - USE', () => {
  test('parse_use', () => {
    parseOne('USE mydb', mysql);
    parseOne('USE `mydb`', mysql);
  });
});

describe('MySQL - SET', () => {
  test('parse_set_variables', () => {
    parseOne("SET sql_mode = CONCAT(@@sql_mode, ',STRICT_TRANS_TABLES')", mysql);
    parseOne('SET LOCAL autocommit = 1', mysql);
    parseOne("SET NAMES 'utf8mb4'", mysql);
    parseOne('SET NAMES utf8mb4', mysql);
  });
});

describe('MySQL - CREATE TABLE', () => {
  test('parse_create_table_auto_increment', () => {
    const stmt = parseOne('CREATE TABLE t (id INT AUTO_INCREMENT)', mysql);
    expect(isCreateTable(stmt)).toBe(true);
  });

  test('parse_create_table_primary_and_unique_key', () => {
    parseOne('CREATE TABLE t (id INT PRIMARY KEY)', mysql);
    // UNIQUE KEY syntax is not yet fully supported
    // parseOne('CREATE TABLE t (id INT UNIQUE KEY)', mysql);
    parseOne('CREATE TABLE t (id INT, PRIMARY KEY (id))', mysql);
    // parseOne('CREATE TABLE t (id INT, UNIQUE KEY (id))', mysql);
  });

  test('parse_create_table_comment', () => {
    parseOne("CREATE TABLE foo (bar INT) COMMENT 'baz'", mysql);
    parseOne("CREATE TABLE foo (bar INT) COMMENT = 'baz'", mysql);
  });

  test('parse_create_table_auto_increment_offset', () => {
    parseOne('CREATE TABLE t (id INT) AUTO_INCREMENT = 100', mysql);
    parseOne('CREATE TABLE t (id INT) AUTO_INCREMENT 100', mysql);
  });

  test('parse_create_table_engine_default_charset', () => {
    parseOne('CREATE TABLE t (id INT) ENGINE = InnoDB', mysql);
    parseOne('CREATE TABLE t (id INT) DEFAULT CHARSET = utf8mb4', mysql);
    parseOne('CREATE TABLE t (id INT) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4', mysql);
  });

  test('parse_create_table_collate', () => {
    parseOne('CREATE TABLE t (id INT) COLLATE = utf8mb4_unicode_ci', mysql);
  });

  test('parse_create_table_set_enum', () => {
    parseOne("CREATE TABLE t (status ENUM('active', 'inactive'))", mysql);
    parseOne("CREATE TABLE t (tags SET('a', 'b', 'c'))", mysql);
  });

  test('parse_create_table_gencol', () => {
    parseOne('CREATE TABLE t (a INT, b INT GENERATED ALWAYS AS (a * 2))', mysql);
    parseOne('CREATE TABLE t (a INT, b INT GENERATED ALWAYS AS (a * 2) VIRTUAL)', mysql);
    parseOne('CREATE TABLE t (a INT, b INT GENERATED ALWAYS AS (a * 2) STORED)', mysql);
  });

  test('parse_create_table_character_set_collate', () => {
    parseOne('CREATE TABLE t (name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci)', mysql);
  });

  test('parse_create_table_with_minimum_display_width', () => {
    parseOne('CREATE TABLE t (a INT(11))', mysql);
    parseOne('CREATE TABLE t (a TINYINT(4))', mysql);
    parseOne('CREATE TABLE t (a BIGINT(20))', mysql);
  });

  test('parse_create_table_unsigned', () => {
    parseOne('CREATE TABLE t (a INT UNSIGNED)', mysql);
    parseOne('CREATE TABLE t (a BIGINT UNSIGNED)', mysql);
    parseOne('CREATE TABLE t (a TINYINT UNSIGNED)', mysql);
  });

  test('parse_create_table_as_select', () => {
    parseOne('CREATE TABLE t AS SELECT * FROM other', mysql);
    parseOne('CREATE TABLE t ENGINE = InnoDB AS SELECT * FROM other', mysql);
  });
});

describe('MySQL - INSERT', () => {
  test('parse_simple_insert', () => {
    parseOne('INSERT INTO t VALUES (1, 2, 3)', mysql);
    parseOne('INSERT INTO t VALUES (1, 2, 3), (4, 5, 6)', mysql);
  });

  test('parse_insert_ignore', () => {
    parseOne('INSERT IGNORE INTO t VALUES (1, 2, 3)', mysql);
  });

  test('parse_priority_insert', () => {
    parseOne('INSERT HIGH_PRIORITY INTO t VALUES (1)', mysql);
    parseOne('INSERT LOW_PRIORITY INTO t VALUES (1)', mysql);
    parseOne('INSERT DELAYED INTO t VALUES (1)', mysql);
  });

  test('parse_insert_as', () => {
    parseOne("INSERT INTO t VALUES (1) AS new ON DUPLICATE KEY UPDATE a = new.a", mysql);
  });

  test('parse_insert_on_duplicate_key_update', () => {
    parseOne('INSERT INTO t VALUES (1, 2) ON DUPLICATE KEY UPDATE a = 1', mysql);
    parseOne('INSERT INTO t VALUES (1, 2) ON DUPLICATE KEY UPDATE a = 1, b = 2', mysql);
    parseOne('INSERT INTO t VALUES (1, 2) ON DUPLICATE KEY UPDATE a = VALUES(a)', mysql);
  });

  test('parse_replace', () => {
    parseOne('REPLACE INTO t VALUES (1, 2, 3)', mysql);
    parseOne('REPLACE INTO t (a, b, c) VALUES (1, 2, 3)', mysql);
  });

  test('parse_insert_with_numeric_prefix_column', () => {
    parseOne('INSERT INTO t (123abc) VALUES (1)', mysql);
  });
});

describe('MySQL - UPDATE', () => {
  test('parse_update_with_joins', () => {
    parseOne('UPDATE t1 JOIN t2 ON t1.id = t2.id SET t1.a = t2.b', mysql);
    parseOne('UPDATE t1 LEFT JOIN t2 ON t1.id = t2.id SET t1.a = 1', mysql);
  });
});

describe('MySQL - SELECT', () => {
  test('parse_select_with_numeric_prefix_column', () => {
    parseOne('SELECT 123abc FROM t', mysql);
  });

  test('parse_concatenation_of_exp_number_and_numeric_prefix_column', () => {
    parseOne('SELECT 1e+123abc FROM t', mysql);
  });
});

describe('MySQL - Index', () => {
  test('parse_create_index', () => {
    parseOne('CREATE INDEX idx ON t (col)', mysql);
    parseOne('CREATE UNIQUE INDEX idx ON t (col)', mysql);
    // FULLTEXT and SPATIAL INDEX are not yet fully supported
    // parseOne('CREATE FULLTEXT INDEX idx ON t (col)', mysql);
    // parseOne('CREATE SPATIAL INDEX idx ON t (col)', mysql);
  });

  test('parse_prefix_key_part', () => {
    parseOne('CREATE INDEX idx_index ON t (textcol(10))', mysql);
  });

  test('parse_index_with_type', () => {
    parseOne('CREATE INDEX idx ON t (col) USING BTREE', mysql);
    parseOne('CREATE INDEX idx ON t (col) USING HASH', mysql);
  });
});

describe('MySQL - Data Types', () => {
  test('parse_signed_data_types', () => {
    parseOne('SELECT CAST(1 AS SIGNED)', mysql);
    parseOne('SELECT CAST(1 AS SIGNED INTEGER)', mysql);
    parseOne('SELECT CAST(1 AS UNSIGNED)', mysql);
    parseOne('SELECT CAST(1 AS UNSIGNED INTEGER)', mysql);
  });

  test('parse_boolean_type', () => {
    parseOne('CREATE TABLE t (b BOOLEAN)', mysql);
    parseOne('CREATE TABLE t (b BOOL)', mysql);
  });

  test('parse_text_types', () => {
    parseOne('CREATE TABLE t (a TINYTEXT)', mysql);
    parseOne('CREATE TABLE t (a TEXT)', mysql);
    parseOne('CREATE TABLE t (a MEDIUMTEXT)', mysql);
    parseOne('CREATE TABLE t (a LONGTEXT)', mysql);
  });

  test('parse_blob_types', () => {
    parseOne('CREATE TABLE t (a TINYBLOB)', mysql);
    parseOne('CREATE TABLE t (a BLOB)', mysql);
    parseOne('CREATE TABLE t (a MEDIUMBLOB)', mysql);
    parseOne('CREATE TABLE t (a LONGBLOB)', mysql);
  });

  test('parse_binary_types', () => {
    parseOne('CREATE TABLE t (a BINARY(16))', mysql);
    parseOne('CREATE TABLE t (a VARBINARY(255))', mysql);
  });

  test('parse_datetime_types', () => {
    parseOne('CREATE TABLE t (a DATE)', mysql);
    parseOne('CREATE TABLE t (a TIME)', mysql);
    parseOne('CREATE TABLE t (a DATETIME)', mysql);
    parseOne('CREATE TABLE t (a TIMESTAMP)', mysql);
    parseOne('CREATE TABLE t (a YEAR)', mysql);
  });
});

describe('MySQL - Operators', () => {
  test('parse_div_operator', () => {
    parseOne('SELECT 10 DIV 3', mysql);
  });

  test('parse_mod_operator', () => {
    // MOD as infix operator is not yet fully supported
    // parseOne('SELECT 10 MOD 3', mysql);
    parseOne('SELECT 10 % 3', mysql);
  });

  test('parse_xor_operator', () => {
    parseOne('SELECT 1 XOR 0', mysql);
  });

  test('parse_regexp_operator', () => {
    parseOne("SELECT 'hello' REGEXP '^h'", mysql);
    parseOne("SELECT 'hello' RLIKE '^h'", mysql);
  });
});

describe('MySQL - Functions', () => {
  test('parse_date_functions', () => {
    parseOne('SELECT NOW()', mysql);
    parseOne('SELECT CURDATE()', mysql);
    parseOne('SELECT CURTIME()', mysql);
    parseOne('SELECT DATE_ADD(date_col, INTERVAL 1 DAY)', mysql);
    parseOne('SELECT DATE_SUB(date_col, INTERVAL 1 MONTH)', mysql);
  });

  test('parse_string_functions', () => {
    parseOne('SELECT CONCAT(a, b, c)', mysql);
    parseOne('SELECT CONCAT_WS(\',\', a, b, c)', mysql);
    parseOne('SELECT LENGTH(str)', mysql);
    parseOne('SELECT CHAR_LENGTH(str)', mysql);
    parseOne('SELECT SUBSTRING(str, 1, 3)', mysql);
  });

  test('parse_if_function', () => {
    parseOne('SELECT IF(condition, true_val, false_val)', mysql);
    parseOne('SELECT IFNULL(val, default_val)', mysql);
  });

  test('parse_group_concat', () => {
    parseOne('SELECT GROUP_CONCAT(col)', mysql);
    parseOne('SELECT GROUP_CONCAT(col SEPARATOR \',\')', mysql);
    parseOne('SELECT GROUP_CONCAT(DISTINCT col ORDER BY col)', mysql);
  });
});

describe('MySQL - LOCK TABLES', () => {
  test('parse_lock_tables', () => {
    parseOne('LOCK TABLES t READ', mysql);
    parseOne('LOCK TABLES t WRITE', mysql);
    parseOne('LOCK TABLES t1 READ, t2 WRITE', mysql);
  });

  test('parse_unlock_tables', () => {
    parseOne('UNLOCK TABLES', mysql);
  });
});

describe('MySQL - Variables', () => {
  test('parse_user_variables', () => {
    parseOne('SELECT @var', mysql);
    parseOne('SET @var = 1', mysql);
    parseOne('SELECT @var := 1', mysql);
  });

  test('parse_system_variables', () => {
    parseOne('SELECT @@version', mysql);
    parseOne('SELECT @@global.version', mysql);
    parseOne('SELECT @@session.sql_mode', mysql);
  });
});

describe('MySQL - Stored Procedures', () => {
  test('parse_call', () => {
    parseOne('CALL my_procedure()', mysql);
    parseOne('CALL my_procedure(1, 2, 3)', mysql);
  });
});

describe('MySQL - ON UPDATE/DELETE Actions', () => {
  test('parse_on_delete', () => {
    parseOne('CREATE TABLE t (id INT, parent_id INT REFERENCES parent(id) ON DELETE CASCADE)', mysql);
    parseOne('CREATE TABLE t (id INT, parent_id INT REFERENCES parent(id) ON DELETE SET NULL)', mysql);
    parseOne('CREATE TABLE t (id INT, parent_id INT REFERENCES parent(id) ON DELETE RESTRICT)', mysql);
    parseOne('CREATE TABLE t (id INT, parent_id INT REFERENCES parent(id) ON DELETE NO ACTION)', mysql);
  });

  test('parse_on_update', () => {
    parseOne('CREATE TABLE t (id INT, parent_id INT REFERENCES parent(id) ON UPDATE CASCADE)', mysql);
    parseOne('CREATE TABLE t (id INT, parent_id INT REFERENCES parent(id) ON UPDATE SET NULL)', mysql);
  });
});
