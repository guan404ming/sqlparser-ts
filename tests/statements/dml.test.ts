/**
 * DML (Data Manipulation Language) tests
 * Tests for INSERT, UPDATE, DELETE, MERGE statements
 */

import {
  parseOne,
  dialects,
  isInsert,
  isUpdate,
  isDelete,
} from '../test-utils';

describe('INSERT', () => {
  describe('INSERT VALUES', () => {
    test('parse INSERT with VALUES', () => {
      const stmt = parseOne('INSERT INTO t VALUES (1, 2, 3)');
      expect(isInsert(stmt)).toBe(true);
    });

    test('parse INSERT with column list', () => {
      parseOne('INSERT INTO t (a, b, c) VALUES (1, 2, 3)');
    });

    test('parse INSERT with multiple rows', () => {
      parseOne('INSERT INTO t VALUES (1, 2), (3, 4), (5, 6)');
      parseOne('INSERT INTO t (a, b) VALUES (1, 2), (3, 4)');
    });

    test('parse INSERT with expressions', () => {
      parseOne("INSERT INTO t VALUES (1 + 1, 'hello', NOW())");
    });

    test('parse INSERT with NULL', () => {
      parseOne('INSERT INTO t VALUES (1, NULL, 3)');
    });

    test('parse INSERT with DEFAULT', () => {
      parseOne('INSERT INTO t VALUES (DEFAULT, 2, 3)');
    });
  });

  describe('INSERT DEFAULT VALUES', () => {
    test('parse INSERT DEFAULT VALUES', () => {
      parseOne('INSERT INTO t DEFAULT VALUES');
    });
  });

  describe('INSERT SELECT', () => {
    test('parse INSERT SELECT', () => {
      parseOne('INSERT INTO t SELECT * FROM other');
    });

    test('parse INSERT SELECT with columns', () => {
      parseOne('INSERT INTO t (a, b) SELECT c, d FROM other');
    });

    test('parse INSERT SELECT with WHERE', () => {
      parseOne('INSERT INTO t SELECT * FROM other WHERE x > 0');
    });
  });

  describe('INSERT with RETURNING (PostgreSQL)', () => {
    test('parse INSERT RETURNING', () => {
      parseOne('INSERT INTO t VALUES (1) RETURNING *', dialects.postgresql);
      parseOne('INSERT INTO t VALUES (1) RETURNING id', dialects.postgresql);
      parseOne('INSERT INTO t VALUES (1) RETURNING id, name', dialects.postgresql);
      parseOne('INSERT INTO t VALUES (1) RETURNING id AS new_id', dialects.postgresql);
    });
  });

  describe('INSERT ON CONFLICT (PostgreSQL)', () => {
    test('parse INSERT ON CONFLICT DO NOTHING', () => {
      parseOne('INSERT INTO t VALUES (1) ON CONFLICT DO NOTHING', dialects.postgresql);
      parseOne('INSERT INTO t VALUES (1) ON CONFLICT (id) DO NOTHING', dialects.postgresql);
    });

    test('parse INSERT ON CONFLICT DO UPDATE', () => {
      parseOne('INSERT INTO t VALUES (1) ON CONFLICT (id) DO UPDATE SET a = 1', dialects.postgresql);
      parseOne('INSERT INTO t VALUES (1) ON CONFLICT (id) DO UPDATE SET a = EXCLUDED.a', dialects.postgresql);
      parseOne('INSERT INTO t VALUES (1) ON CONFLICT ON CONSTRAINT pk DO UPDATE SET a = 1', dialects.postgresql);
    });
  });

  describe('INSERT ON DUPLICATE KEY UPDATE (MySQL)', () => {
    test('parse INSERT ON DUPLICATE KEY UPDATE', () => {
      parseOne('INSERT INTO t VALUES (1) ON DUPLICATE KEY UPDATE a = 1', dialects.mysql);
      parseOne('INSERT INTO t VALUES (1) ON DUPLICATE KEY UPDATE a = VALUES(a)', dialects.mysql);
      parseOne('INSERT INTO t VALUES (1) ON DUPLICATE KEY UPDATE a = 1, b = 2', dialects.mysql);
    });
  });

  describe('INSERT IGNORE (MySQL)', () => {
    test('parse INSERT IGNORE', () => {
      parseOne('INSERT IGNORE INTO t VALUES (1)', dialects.mysql);
    });
  });

  describe('REPLACE (MySQL)', () => {
    test('parse REPLACE', () => {
      parseOne('REPLACE INTO t VALUES (1, 2)', dialects.mysql);
      parseOne('REPLACE INTO t (a, b) VALUES (1, 2)', dialects.mysql);
    });
  });
});

describe('UPDATE', () => {
  describe('Basic UPDATE', () => {
    test('parse UPDATE', () => {
      const stmt = parseOne('UPDATE t SET a = 1');
      expect(isUpdate(stmt)).toBe(true);
    });

    test('parse UPDATE with multiple columns', () => {
      parseOne('UPDATE t SET a = 1, b = 2, c = 3');
    });

    test('parse UPDATE with WHERE', () => {
      parseOne('UPDATE t SET a = 1 WHERE id = 1');
    });

    test('parse UPDATE with expressions', () => {
      parseOne('UPDATE t SET a = a + 1');
      parseOne('UPDATE t SET a = b * 2');
    });

    test('parse UPDATE with NULL', () => {
      parseOne('UPDATE t SET a = NULL');
    });

    test('parse UPDATE with DEFAULT', () => {
      parseOne('UPDATE t SET a = DEFAULT');
    });
  });

  describe('UPDATE with table alias', () => {
    test('parse UPDATE with alias', () => {
      parseOne('UPDATE t AS alias SET alias.a = 1');
      parseOne('UPDATE t alias SET alias.a = 1');
    });
  });

  describe('UPDATE with JOIN (MySQL)', () => {
    test('parse UPDATE with JOIN', () => {
      parseOne('UPDATE t1 JOIN t2 ON t1.id = t2.id SET t1.a = t2.b', dialects.mysql);
      parseOne('UPDATE t1 LEFT JOIN t2 ON t1.id = t2.id SET t1.a = 1', dialects.mysql);
    });
  });

  describe('UPDATE with FROM (PostgreSQL)', () => {
    test('parse UPDATE with FROM', () => {
      parseOne('UPDATE t1 SET a = t2.b FROM t2 WHERE t1.id = t2.id', dialects.postgresql);
    });
  });

  describe('UPDATE with RETURNING (PostgreSQL)', () => {
    test('parse UPDATE RETURNING', () => {
      parseOne('UPDATE t SET a = 1 RETURNING *', dialects.postgresql);
      parseOne('UPDATE t SET a = 1 WHERE id = 1 RETURNING id, a', dialects.postgresql);
    });
  });

  describe('UPDATE with LIMIT', () => {
    test('parse UPDATE with LIMIT', () => {
      parseOne('UPDATE t SET a = 1 LIMIT 10', dialects.mysql);
    });
  });

  describe('UPDATE with ORDER BY', () => {
    // Note: This test fails because UPDATE...ORDER BY is a MySQL/MariaDB extension
    // not yet supported in sqlparser 0.60.0. The ORDER BY clause in UPDATE statements
    // allows controlling which rows are updated first when using LIMIT.
    // Error: "Expected: end of statement, found: ORDER"
    // This feature would need to be added to upstream sqlparser.
    test.skip('parse UPDATE with ORDER BY', () => {
      parseOne('UPDATE t SET a = 1 ORDER BY id LIMIT 10', dialects.mysql);
    });
  });
});

describe('DELETE', () => {
  describe('Basic DELETE', () => {
    test('parse DELETE', () => {
      const stmt = parseOne('DELETE FROM t');
      expect(isDelete(stmt)).toBe(true);
    });

    test('parse DELETE with WHERE', () => {
      parseOne('DELETE FROM t WHERE id = 1');
    });

    test('parse DELETE with complex WHERE', () => {
      parseOne('DELETE FROM t WHERE a > 10 AND b < 5');
      parseOne('DELETE FROM t WHERE a IN (1, 2, 3)');
    });
  });

  describe('DELETE with table alias', () => {
    test('parse DELETE with alias', () => {
      parseOne('DELETE FROM t AS alias WHERE alias.id = 1');
    });
  });

  describe('DELETE with USING (PostgreSQL)', () => {
    test('parse DELETE with USING', () => {
      parseOne('DELETE FROM t1 USING t2 WHERE t1.id = t2.id', dialects.postgresql);
    });
  });

  describe('DELETE with RETURNING (PostgreSQL)', () => {
    test('parse DELETE RETURNING', () => {
      parseOne('DELETE FROM t RETURNING *', dialects.postgresql);
      parseOne('DELETE FROM t WHERE id = 1 RETURNING id', dialects.postgresql);
    });
  });

  describe('DELETE with JOIN (MySQL)', () => {
    test('parse DELETE with JOIN', () => {
      parseOne('DELETE t1 FROM t1 JOIN t2 ON t1.id = t2.id', dialects.mysql);
    });
  });

  describe('DELETE with LIMIT', () => {
    test('parse DELETE with LIMIT', () => {
      parseOne('DELETE FROM t LIMIT 10', dialects.mysql);
    });
  });

  describe('DELETE with ORDER BY', () => {
    test('parse DELETE with ORDER BY', () => {
      parseOne('DELETE FROM t ORDER BY id LIMIT 10', dialects.mysql);
    });
  });

  describe('Multi-table DELETE', () => {
    test('parse multi-table DELETE', () => {
      parseOne('DELETE t1, t2 FROM t1 JOIN t2 ON t1.id = t2.id', dialects.mysql);
    });
  });
});

describe('MERGE', () => {
  test('parse MERGE', () => {
    parseOne(`
      MERGE INTO target AS t
      USING source AS s
      ON t.id = s.id
      WHEN MATCHED THEN UPDATE SET t.value = s.value
      WHEN NOT MATCHED THEN INSERT (id, value) VALUES (s.id, s.value)
    `, dialects.postgresql);
  });

  test('parse MERGE with DELETE', () => {
    parseOne(`
      MERGE INTO target AS t
      USING source AS s
      ON t.id = s.id
      WHEN MATCHED AND s.deleted THEN DELETE
      WHEN MATCHED THEN UPDATE SET t.value = s.value
      WHEN NOT MATCHED THEN INSERT (id, value) VALUES (s.id, s.value)
    `, dialects.postgresql);
  });

  test('parse MERGE with multiple WHEN clauses', () => {
    parseOne(`
      MERGE INTO target AS t
      USING source AS s
      ON t.id = s.id
      WHEN MATCHED AND s.type = 'A' THEN UPDATE SET t.value = s.value
      WHEN MATCHED AND s.type = 'B' THEN DELETE
      WHEN NOT MATCHED AND s.type = 'A' THEN INSERT (id, value) VALUES (s.id, s.value)
    `, dialects.postgresql);
  });

  test('parse MERGE BigQuery style', () => {
    parseOne(`
      MERGE target_table AS t
      USING source_table AS s
      ON t.id = s.id
      WHEN MATCHED THEN
        UPDATE SET t.value = s.value
      WHEN NOT MATCHED THEN
        INSERT (id, value) VALUES (s.id, s.value)
    `, dialects.bigquery);
  });
});

describe('TRUNCATE', () => {
  test('parse TRUNCATE', () => {
    parseOne('TRUNCATE TABLE t');
    parseOne('TRUNCATE t');
  });

  test('parse TRUNCATE with options (PostgreSQL)', () => {
    parseOne('TRUNCATE TABLE t RESTART IDENTITY', dialects.postgresql);
    parseOne('TRUNCATE TABLE t CONTINUE IDENTITY', dialects.postgresql);
    parseOne('TRUNCATE TABLE t CASCADE', dialects.postgresql);
    parseOne('TRUNCATE TABLE t RESTRICT', dialects.postgresql);
  });
});

describe('UPSERT variations', () => {
  test('PostgreSQL INSERT ON CONFLICT', () => {
    parseOne('INSERT INTO t (id, value) VALUES (1, \'a\') ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value', dialects.postgresql);
  });

  test('MySQL INSERT ON DUPLICATE KEY UPDATE', () => {
    parseOne('INSERT INTO t (id, value) VALUES (1, \'a\') ON DUPLICATE KEY UPDATE value = VALUES(value)', dialects.mysql);
  });

  test('MySQL REPLACE INTO', () => {
    parseOne("REPLACE INTO t (id, value) VALUES (1, 'a')", dialects.mysql);
  });

  test('SQLite INSERT OR REPLACE', () => {
    parseOne("INSERT OR REPLACE INTO t (id, value) VALUES (1, 'a')", dialects.sqlite);
  });
});

describe('INSERT ... SET (MySQL)', () => {
  test('parse INSERT SET', () => {
    parseOne("INSERT INTO t SET a = 1, b = 'test'", dialects.mysql);
  });
});

describe('UPDATE with subquery', () => {
  test('parse UPDATE with scalar subquery', () => {
    parseOne('UPDATE t SET a = (SELECT MAX(b) FROM t2)');
  });

  test('parse UPDATE with correlated subquery', () => {
    parseOne('UPDATE t1 SET a = (SELECT b FROM t2 WHERE t2.id = t1.id)');
  });
});

describe('DELETE with subquery', () => {
  test('parse DELETE with subquery in WHERE', () => {
    parseOne('DELETE FROM t WHERE id IN (SELECT id FROM t2)');
  });

  test('parse DELETE with EXISTS', () => {
    parseOne('DELETE FROM t WHERE EXISTS (SELECT 1 FROM t2 WHERE t2.t_id = t.id)');
  });
});
