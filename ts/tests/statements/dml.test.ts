/**
 * DML (Data Manipulation Language) tests
 * Tests for INSERT, UPDATE, DELETE, MERGE statements
 */

import {
  parseOne,
  dialects,
  ensureWasmInitialized,
  isInsert,
  isUpdate,
  isDelete,
} from '../test-utils';

beforeAll(async () => {
  await ensureWasmInitialized();
});

describe('INSERT', () => {
  describe('INSERT VALUES', () => {
    test('parse INSERT with VALUES', async () => {
      const stmt = await parseOne('INSERT INTO t VALUES (1, 2, 3)');
      expect(isInsert(stmt)).toBe(true);
    });

    test('parse INSERT with column list', async () => {
      await parseOne('INSERT INTO t (a, b, c) VALUES (1, 2, 3)');
    });

    test('parse INSERT with multiple rows', async () => {
      await parseOne('INSERT INTO t VALUES (1, 2), (3, 4), (5, 6)');
      await parseOne('INSERT INTO t (a, b) VALUES (1, 2), (3, 4)');
    });

    test('parse INSERT with expressions', async () => {
      await parseOne("INSERT INTO t VALUES (1 + 1, 'hello', NOW())");
    });

    test('parse INSERT with NULL', async () => {
      await parseOne('INSERT INTO t VALUES (1, NULL, 3)');
    });

    test('parse INSERT with DEFAULT', async () => {
      await parseOne('INSERT INTO t VALUES (DEFAULT, 2, 3)');
    });
  });

  describe('INSERT DEFAULT VALUES', () => {
    test('parse INSERT DEFAULT VALUES', async () => {
      await parseOne('INSERT INTO t DEFAULT VALUES');
    });
  });

  describe('INSERT SELECT', () => {
    test('parse INSERT SELECT', async () => {
      await parseOne('INSERT INTO t SELECT * FROM other');
    });

    test('parse INSERT SELECT with columns', async () => {
      await parseOne('INSERT INTO t (a, b) SELECT c, d FROM other');
    });

    test('parse INSERT SELECT with WHERE', async () => {
      await parseOne('INSERT INTO t SELECT * FROM other WHERE x > 0');
    });
  });

  describe('INSERT with RETURNING (PostgreSQL)', () => {
    test('parse INSERT RETURNING', async () => {
      await parseOne('INSERT INTO t VALUES (1) RETURNING *', dialects.postgresql);
      await parseOne('INSERT INTO t VALUES (1) RETURNING id', dialects.postgresql);
      await parseOne('INSERT INTO t VALUES (1) RETURNING id, name', dialects.postgresql);
      await parseOne('INSERT INTO t VALUES (1) RETURNING id AS new_id', dialects.postgresql);
    });
  });

  describe('INSERT ON CONFLICT (PostgreSQL)', () => {
    test('parse INSERT ON CONFLICT DO NOTHING', async () => {
      await parseOne('INSERT INTO t VALUES (1) ON CONFLICT DO NOTHING', dialects.postgresql);
      await parseOne('INSERT INTO t VALUES (1) ON CONFLICT (id) DO NOTHING', dialects.postgresql);
    });

    test('parse INSERT ON CONFLICT DO UPDATE', async () => {
      await parseOne('INSERT INTO t VALUES (1) ON CONFLICT (id) DO UPDATE SET a = 1', dialects.postgresql);
      await parseOne('INSERT INTO t VALUES (1) ON CONFLICT (id) DO UPDATE SET a = EXCLUDED.a', dialects.postgresql);
      await parseOne('INSERT INTO t VALUES (1) ON CONFLICT ON CONSTRAINT pk DO UPDATE SET a = 1', dialects.postgresql);
    });
  });

  describe('INSERT ON DUPLICATE KEY UPDATE (MySQL)', () => {
    test('parse INSERT ON DUPLICATE KEY UPDATE', async () => {
      await parseOne('INSERT INTO t VALUES (1) ON DUPLICATE KEY UPDATE a = 1', dialects.mysql);
      await parseOne('INSERT INTO t VALUES (1) ON DUPLICATE KEY UPDATE a = VALUES(a)', dialects.mysql);
      await parseOne('INSERT INTO t VALUES (1) ON DUPLICATE KEY UPDATE a = 1, b = 2', dialects.mysql);
    });
  });

  describe('INSERT IGNORE (MySQL)', () => {
    test('parse INSERT IGNORE', async () => {
      await parseOne('INSERT IGNORE INTO t VALUES (1)', dialects.mysql);
    });
  });

  describe('REPLACE (MySQL)', () => {
    test('parse REPLACE', async () => {
      await parseOne('REPLACE INTO t VALUES (1, 2)', dialects.mysql);
      await parseOne('REPLACE INTO t (a, b) VALUES (1, 2)', dialects.mysql);
    });
  });
});

describe('UPDATE', () => {
  describe('Basic UPDATE', () => {
    test('parse UPDATE', async () => {
      const stmt = await parseOne('UPDATE t SET a = 1');
      expect(isUpdate(stmt)).toBe(true);
    });

    test('parse UPDATE with multiple columns', async () => {
      await parseOne('UPDATE t SET a = 1, b = 2, c = 3');
    });

    test('parse UPDATE with WHERE', async () => {
      await parseOne('UPDATE t SET a = 1 WHERE id = 1');
    });

    test('parse UPDATE with expressions', async () => {
      await parseOne('UPDATE t SET a = a + 1');
      await parseOne('UPDATE t SET a = b * 2');
    });

    test('parse UPDATE with NULL', async () => {
      await parseOne('UPDATE t SET a = NULL');
    });

    test('parse UPDATE with DEFAULT', async () => {
      await parseOne('UPDATE t SET a = DEFAULT');
    });
  });

  describe('UPDATE with table alias', () => {
    test('parse UPDATE with alias', async () => {
      await parseOne('UPDATE t AS alias SET alias.a = 1');
      await parseOne('UPDATE t alias SET alias.a = 1');
    });
  });

  describe('UPDATE with JOIN (MySQL)', () => {
    test('parse UPDATE with JOIN', async () => {
      await parseOne('UPDATE t1 JOIN t2 ON t1.id = t2.id SET t1.a = t2.b', dialects.mysql);
      await parseOne('UPDATE t1 LEFT JOIN t2 ON t1.id = t2.id SET t1.a = 1', dialects.mysql);
    });
  });

  describe('UPDATE with FROM (PostgreSQL)', () => {
    test('parse UPDATE with FROM', async () => {
      await parseOne('UPDATE t1 SET a = t2.b FROM t2 WHERE t1.id = t2.id', dialects.postgresql);
    });
  });

  describe('UPDATE with RETURNING (PostgreSQL)', () => {
    test('parse UPDATE RETURNING', async () => {
      await parseOne('UPDATE t SET a = 1 RETURNING *', dialects.postgresql);
      await parseOne('UPDATE t SET a = 1 WHERE id = 1 RETURNING id, a', dialects.postgresql);
    });
  });

  describe('UPDATE with LIMIT', () => {
    test('parse UPDATE with LIMIT', async () => {
      await parseOne('UPDATE t SET a = 1 LIMIT 10', dialects.mysql);
    });
  });

  describe('UPDATE with ORDER BY', () => {
    test('parse UPDATE with ORDER BY', async () => {
      await parseOne('UPDATE t SET a = 1 ORDER BY id LIMIT 10', dialects.mysql);
    });
  });
});

describe('DELETE', () => {
  describe('Basic DELETE', () => {
    test('parse DELETE', async () => {
      const stmt = await parseOne('DELETE FROM t');
      expect(isDelete(stmt)).toBe(true);
    });

    test('parse DELETE with WHERE', async () => {
      await parseOne('DELETE FROM t WHERE id = 1');
    });

    test('parse DELETE with complex WHERE', async () => {
      await parseOne('DELETE FROM t WHERE a > 10 AND b < 5');
      await parseOne('DELETE FROM t WHERE a IN (1, 2, 3)');
    });
  });

  describe('DELETE with table alias', () => {
    test('parse DELETE with alias', async () => {
      await parseOne('DELETE FROM t AS alias WHERE alias.id = 1');
    });
  });

  describe('DELETE with USING (PostgreSQL)', () => {
    test('parse DELETE with USING', async () => {
      await parseOne('DELETE FROM t1 USING t2 WHERE t1.id = t2.id', dialects.postgresql);
    });
  });

  describe('DELETE with RETURNING (PostgreSQL)', () => {
    test('parse DELETE RETURNING', async () => {
      await parseOne('DELETE FROM t RETURNING *', dialects.postgresql);
      await parseOne('DELETE FROM t WHERE id = 1 RETURNING id', dialects.postgresql);
    });
  });

  describe('DELETE with JOIN (MySQL)', () => {
    test('parse DELETE with JOIN', async () => {
      await parseOne('DELETE t1 FROM t1 JOIN t2 ON t1.id = t2.id', dialects.mysql);
    });
  });

  describe('DELETE with LIMIT', () => {
    test('parse DELETE with LIMIT', async () => {
      await parseOne('DELETE FROM t LIMIT 10', dialects.mysql);
    });
  });

  describe('DELETE with ORDER BY', () => {
    test('parse DELETE with ORDER BY', async () => {
      await parseOne('DELETE FROM t ORDER BY id LIMIT 10', dialects.mysql);
    });
  });

  describe('Multi-table DELETE', () => {
    test('parse multi-table DELETE', async () => {
      await parseOne('DELETE t1, t2 FROM t1 JOIN t2 ON t1.id = t2.id', dialects.mysql);
    });
  });
});

describe('MERGE', () => {
  test('parse MERGE', async () => {
    await parseOne(`
      MERGE INTO target AS t
      USING source AS s
      ON t.id = s.id
      WHEN MATCHED THEN UPDATE SET t.value = s.value
      WHEN NOT MATCHED THEN INSERT (id, value) VALUES (s.id, s.value)
    `, dialects.postgresql);
  });

  test('parse MERGE with DELETE', async () => {
    await parseOne(`
      MERGE INTO target AS t
      USING source AS s
      ON t.id = s.id
      WHEN MATCHED AND s.deleted THEN DELETE
      WHEN MATCHED THEN UPDATE SET t.value = s.value
      WHEN NOT MATCHED THEN INSERT (id, value) VALUES (s.id, s.value)
    `, dialects.postgresql);
  });

  test('parse MERGE with multiple WHEN clauses', async () => {
    await parseOne(`
      MERGE INTO target AS t
      USING source AS s
      ON t.id = s.id
      WHEN MATCHED AND s.type = 'A' THEN UPDATE SET t.value = s.value
      WHEN MATCHED AND s.type = 'B' THEN DELETE
      WHEN NOT MATCHED AND s.type = 'A' THEN INSERT (id, value) VALUES (s.id, s.value)
    `, dialects.postgresql);
  });

  test('parse MERGE BigQuery style', async () => {
    await parseOne(`
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
  test('parse TRUNCATE', async () => {
    await parseOne('TRUNCATE TABLE t');
    await parseOne('TRUNCATE t');
  });

  test('parse TRUNCATE with options (PostgreSQL)', async () => {
    await parseOne('TRUNCATE TABLE t RESTART IDENTITY', dialects.postgresql);
    await parseOne('TRUNCATE TABLE t CONTINUE IDENTITY', dialects.postgresql);
    await parseOne('TRUNCATE TABLE t CASCADE', dialects.postgresql);
    await parseOne('TRUNCATE TABLE t RESTRICT', dialects.postgresql);
  });
});

describe('UPSERT variations', () => {
  test('PostgreSQL INSERT ON CONFLICT', async () => {
    await parseOne('INSERT INTO t (id, value) VALUES (1, \'a\') ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value', dialects.postgresql);
  });

  test('MySQL INSERT ON DUPLICATE KEY UPDATE', async () => {
    await parseOne('INSERT INTO t (id, value) VALUES (1, \'a\') ON DUPLICATE KEY UPDATE value = VALUES(value)', dialects.mysql);
  });

  test('MySQL REPLACE INTO', async () => {
    await parseOne("REPLACE INTO t (id, value) VALUES (1, 'a')", dialects.mysql);
  });

  test('SQLite INSERT OR REPLACE', async () => {
    await parseOne("INSERT OR REPLACE INTO t (id, value) VALUES (1, 'a')", dialects.sqlite);
  });
});

describe('INSERT ... SET (MySQL)', () => {
  test('parse INSERT SET', async () => {
    await parseOne("INSERT INTO t SET a = 1, b = 'test'", dialects.mysql);
  });
});

describe('UPDATE with subquery', () => {
  test('parse UPDATE with scalar subquery', async () => {
    await parseOne('UPDATE t SET a = (SELECT MAX(b) FROM t2)');
  });

  test('parse UPDATE with correlated subquery', async () => {
    await parseOne('UPDATE t1 SET a = (SELECT b FROM t2 WHERE t2.id = t1.id)');
  });
});

describe('DELETE with subquery', () => {
  test('parse DELETE with subquery in WHERE', async () => {
    await parseOne('DELETE FROM t WHERE id IN (SELECT id FROM t2)');
  });

  test('parse DELETE with EXISTS', async () => {
    await parseOne('DELETE FROM t WHERE EXISTS (SELECT 1 FROM t2 WHERE t2.t_id = t.id)');
  });
});
