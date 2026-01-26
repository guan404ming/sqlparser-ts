/**
 * SELECT statement tests
 * Comprehensive tests for SELECT statement parsing
 */

import {
  parse,
  parseOne,
  format,
  expectParseError,
  dialects,
  ensureWasmInitialized,
  isQuery,
} from '../test-utils';

beforeAll(async () => {
  await ensureWasmInitialized();
});

describe('SELECT - Basic', () => {
  test('parse simple SELECT', async () => {
    const stmt = await parseOne('SELECT 1');
    expect(isQuery(stmt)).toBe(true);
  });

  test('parse SELECT with FROM', async () => {
    await parseOne('SELECT * FROM t');
    await parseOne('SELECT a, b, c FROM t');
    await parseOne('SELECT t.* FROM t');
  });

  test('parse SELECT with alias', async () => {
    await parseOne('SELECT a AS alias FROM t');
    await parseOne('SELECT a alias FROM t');
    await parseOne('SELECT a "alias" FROM t');
  });

  test('parse SELECT with table alias', async () => {
    await parseOne('SELECT t.a FROM table1 t');
    await parseOne('SELECT t.a FROM table1 AS t');
    await parseOne('SELECT t.a, u.b FROM table1 t, table2 u');
  });

  test('parse SELECT from multiple tables', async () => {
    await parseOne('SELECT * FROM t1, t2');
    await parseOne('SELECT * FROM t1, t2, t3');
    await parseOne('SELECT t1.a, t2.b FROM t1, t2 WHERE t1.id = t2.id');
  });
});

describe('SELECT - DISTINCT', () => {
  test('parse DISTINCT', async () => {
    await parseOne('SELECT DISTINCT a FROM t');
    await parseOne('SELECT DISTINCT a, b FROM t');
  });

  test('parse ALL', async () => {
    await parseOne('SELECT ALL a FROM t');
  });

  test('parse DISTINCT ON (PostgreSQL)', async () => {
    await parseOne('SELECT DISTINCT ON (a) * FROM t', dialects.postgresql);
    await parseOne('SELECT DISTINCT ON (a, b) a, b, c FROM t', dialects.postgresql);
  });
});

describe('SELECT - WHERE', () => {
  test('parse simple WHERE', async () => {
    await parseOne('SELECT * FROM t WHERE a = 1');
    await parseOne('SELECT * FROM t WHERE a > 1');
    await parseOne('SELECT * FROM t WHERE a < 1');
    await parseOne('SELECT * FROM t WHERE a >= 1');
    await parseOne('SELECT * FROM t WHERE a <= 1');
    await parseOne('SELECT * FROM t WHERE a <> 1');
    await parseOne('SELECT * FROM t WHERE a != 1');
  });

  test('parse WHERE with AND/OR', async () => {
    await parseOne('SELECT * FROM t WHERE a = 1 AND b = 2');
    await parseOne('SELECT * FROM t WHERE a = 1 OR b = 2');
    await parseOne('SELECT * FROM t WHERE a = 1 AND b = 2 OR c = 3');
    await parseOne('SELECT * FROM t WHERE (a = 1 AND b = 2) OR c = 3');
  });

  test('parse WHERE with NOT', async () => {
    await parseOne('SELECT * FROM t WHERE NOT a = 1');
    await parseOne('SELECT * FROM t WHERE NOT (a = 1 AND b = 2)');
  });

  test('parse WHERE with NULL checks', async () => {
    await parseOne('SELECT * FROM t WHERE a IS NULL');
    await parseOne('SELECT * FROM t WHERE a IS NOT NULL');
  });

  test('parse WHERE with BETWEEN', async () => {
    await parseOne('SELECT * FROM t WHERE a BETWEEN 1 AND 10');
    await parseOne('SELECT * FROM t WHERE a NOT BETWEEN 1 AND 10');
  });

  test('parse WHERE with IN', async () => {
    await parseOne('SELECT * FROM t WHERE a IN (1, 2, 3)');
    await parseOne('SELECT * FROM t WHERE a NOT IN (1, 2, 3)');
    await parseOne('SELECT * FROM t WHERE a IN (SELECT b FROM t2)');
  });

  test('parse WHERE with LIKE', async () => {
    await parseOne("SELECT * FROM t WHERE a LIKE 'pattern%'");
    await parseOne("SELECT * FROM t WHERE a NOT LIKE 'pattern%'");
    await parseOne("SELECT * FROM t WHERE a LIKE 'pat%' ESCAPE '\\\\'");
  });

  test('parse WHERE with EXISTS', async () => {
    await parseOne('SELECT * FROM t WHERE EXISTS (SELECT 1 FROM t2)');
    await parseOne('SELECT * FROM t WHERE NOT EXISTS (SELECT 1 FROM t2)');
  });
});

describe('SELECT - ORDER BY', () => {
  test('parse ORDER BY', async () => {
    await parseOne('SELECT * FROM t ORDER BY a');
    await parseOne('SELECT * FROM t ORDER BY a ASC');
    await parseOne('SELECT * FROM t ORDER BY a DESC');
    await parseOne('SELECT * FROM t ORDER BY a, b');
    await parseOne('SELECT * FROM t ORDER BY a ASC, b DESC');
  });

  test('parse ORDER BY with NULLS', async () => {
    await parseOne('SELECT * FROM t ORDER BY a NULLS FIRST');
    await parseOne('SELECT * FROM t ORDER BY a NULLS LAST');
    await parseOne('SELECT * FROM t ORDER BY a ASC NULLS FIRST');
    await parseOne('SELECT * FROM t ORDER BY a DESC NULLS LAST');
  });

  test('parse ORDER BY with expression', async () => {
    await parseOne('SELECT * FROM t ORDER BY a + b');
    await parseOne('SELECT * FROM t ORDER BY CASE WHEN a > 0 THEN 1 ELSE 2 END');
  });

  test('parse ORDER BY with ordinal', async () => {
    await parseOne('SELECT a, b FROM t ORDER BY 1');
    await parseOne('SELECT a, b FROM t ORDER BY 1, 2');
  });
});

describe('SELECT - GROUP BY', () => {
  test('parse GROUP BY', async () => {
    await parseOne('SELECT a, COUNT(*) FROM t GROUP BY a');
    await parseOne('SELECT a, b, COUNT(*) FROM t GROUP BY a, b');
  });

  test('parse GROUP BY with expression', async () => {
    await parseOne('SELECT YEAR(date), COUNT(*) FROM t GROUP BY YEAR(date)');
  });

  test('parse GROUP BY with ordinal', async () => {
    await parseOne('SELECT a, COUNT(*) FROM t GROUP BY 1');
  });

  test('parse GROUP BY ROLLUP', async () => {
    await parseOne('SELECT a, b, SUM(c) FROM t GROUP BY ROLLUP (a, b)');
  });

  test('parse GROUP BY CUBE', async () => {
    await parseOne('SELECT a, b, SUM(c) FROM t GROUP BY CUBE (a, b)');
  });

  test('parse GROUP BY GROUPING SETS', async () => {
    await parseOne('SELECT a, b, SUM(c) FROM t GROUP BY GROUPING SETS ((a), (b), (a, b), ())');
  });
});

describe('SELECT - HAVING', () => {
  test('parse HAVING', async () => {
    await parseOne('SELECT a, COUNT(*) FROM t GROUP BY a HAVING COUNT(*) > 1');
    await parseOne('SELECT a, SUM(b) FROM t GROUP BY a HAVING SUM(b) >= 100');
  });
});

describe('SELECT - LIMIT/OFFSET', () => {
  test('parse LIMIT', async () => {
    await parseOne('SELECT * FROM t LIMIT 10');
    await parseOne('SELECT * FROM t LIMIT 10 OFFSET 5');
  });

  test('parse OFFSET', async () => {
    await parseOne('SELECT * FROM t OFFSET 5');
    await parseOne('SELECT * FROM t OFFSET 5 ROWS');
  });

  test('parse FETCH', async () => {
    await parseOne('SELECT * FROM t FETCH FIRST 5 ROWS ONLY');
    await parseOne('SELECT * FROM t FETCH NEXT 5 ROWS ONLY');
    await parseOne('SELECT * FROM t OFFSET 10 ROWS FETCH FIRST 5 ROWS ONLY');
    await parseOne('SELECT * FROM t FETCH FIRST 5 ROWS WITH TIES');
  });
});

describe('SELECT - JOINs', () => {
  test('parse INNER JOIN', async () => {
    await parseOne('SELECT * FROM t1 JOIN t2 ON t1.id = t2.id');
    await parseOne('SELECT * FROM t1 INNER JOIN t2 ON t1.id = t2.id');
  });

  test('parse LEFT JOIN', async () => {
    await parseOne('SELECT * FROM t1 LEFT JOIN t2 ON t1.id = t2.id');
    await parseOne('SELECT * FROM t1 LEFT OUTER JOIN t2 ON t1.id = t2.id');
  });

  test('parse RIGHT JOIN', async () => {
    await parseOne('SELECT * FROM t1 RIGHT JOIN t2 ON t1.id = t2.id');
    await parseOne('SELECT * FROM t1 RIGHT OUTER JOIN t2 ON t1.id = t2.id');
  });

  test('parse FULL JOIN', async () => {
    await parseOne('SELECT * FROM t1 FULL JOIN t2 ON t1.id = t2.id');
    await parseOne('SELECT * FROM t1 FULL OUTER JOIN t2 ON t1.id = t2.id');
  });

  test('parse CROSS JOIN', async () => {
    await parseOne('SELECT * FROM t1 CROSS JOIN t2');
  });

  test('parse NATURAL JOIN', async () => {
    await parseOne('SELECT * FROM t1 NATURAL JOIN t2');
    await parseOne('SELECT * FROM t1 NATURAL LEFT JOIN t2');
  });

  test('parse JOIN with USING', async () => {
    await parseOne('SELECT * FROM t1 JOIN t2 USING (id)');
    await parseOne('SELECT * FROM t1 JOIN t2 USING (id, name)');
  });

  test('parse multiple JOINs', async () => {
    await parseOne('SELECT * FROM t1 JOIN t2 ON t1.id = t2.id JOIN t3 ON t2.id = t3.id');
    await parseOne('SELECT * FROM t1 LEFT JOIN t2 ON t1.id = t2.id RIGHT JOIN t3 ON t2.id = t3.id');
  });

  test('parse self JOIN', async () => {
    await parseOne('SELECT * FROM t t1 JOIN t t2 ON t1.parent_id = t2.id');
  });
});

describe('SELECT - Subqueries', () => {
  test('parse scalar subquery', async () => {
    await parseOne('SELECT (SELECT MAX(a) FROM t2) FROM t1');
  });

  test('parse subquery in FROM', async () => {
    await parseOne('SELECT * FROM (SELECT a, b FROM t) AS sub');
    await parseOne('SELECT * FROM (SELECT a, b FROM t) sub');
  });

  test('parse subquery in WHERE', async () => {
    await parseOne('SELECT * FROM t WHERE a IN (SELECT b FROM t2)');
    await parseOne('SELECT * FROM t WHERE a = (SELECT MAX(b) FROM t2)');
  });

  test('parse correlated subquery', async () => {
    await parseOne('SELECT * FROM t1 WHERE EXISTS (SELECT 1 FROM t2 WHERE t2.id = t1.id)');
  });
});

describe('SELECT - CTEs', () => {
  test('parse simple CTE', async () => {
    await parseOne('WITH cte AS (SELECT 1) SELECT * FROM cte');
  });

  test('parse multiple CTEs', async () => {
    await parseOne('WITH cte1 AS (SELECT 1), cte2 AS (SELECT 2) SELECT * FROM cte1, cte2');
  });

  test('parse recursive CTE', async () => {
    await parseOne(`
      WITH RECURSIVE cte AS (
        SELECT 1 AS n
        UNION ALL
        SELECT n + 1 FROM cte WHERE n < 10
      )
      SELECT * FROM cte
    `);
  });

  test('parse CTE with column list', async () => {
    await parseOne('WITH cte (a, b) AS (SELECT 1, 2) SELECT * FROM cte');
  });
});

describe('SELECT - Set Operations', () => {
  test('parse UNION', async () => {
    await parseOne('SELECT 1 UNION SELECT 2');
    await parseOne('SELECT 1 UNION ALL SELECT 2');
    await parseOne('SELECT 1 UNION DISTINCT SELECT 2');
  });

  test('parse INTERSECT', async () => {
    await parseOne('SELECT 1 INTERSECT SELECT 2');
    await parseOne('SELECT 1 INTERSECT ALL SELECT 2');
  });

  test('parse EXCEPT', async () => {
    await parseOne('SELECT 1 EXCEPT SELECT 2');
    await parseOne('SELECT 1 EXCEPT ALL SELECT 2');
  });

  test('parse multiple set operations', async () => {
    await parseOne('SELECT 1 UNION SELECT 2 UNION SELECT 3');
    await parseOne('SELECT 1 UNION SELECT 2 INTERSECT SELECT 3');
    await parseOne('(SELECT 1) UNION (SELECT 2) EXCEPT (SELECT 3)');
  });
});

describe('SELECT - Window Functions', () => {
  test('parse window function', async () => {
    await parseOne('SELECT ROW_NUMBER() OVER () FROM t');
    await parseOne('SELECT RANK() OVER (ORDER BY a) FROM t');
    await parseOne('SELECT DENSE_RANK() OVER (PARTITION BY b ORDER BY a) FROM t');
  });

  test('parse window function with frame', async () => {
    await parseOne('SELECT SUM(a) OVER (ORDER BY b ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) FROM t');
    await parseOne('SELECT AVG(a) OVER (ORDER BY b ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) FROM t');
    await parseOne('SELECT SUM(a) OVER (ORDER BY b RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) FROM t');
  });

  test('parse named window', async () => {
    await parseOne('SELECT SUM(a) OVER w FROM t WINDOW w AS (PARTITION BY b ORDER BY c)');
    await parseOne('SELECT SUM(a) OVER w1, AVG(a) OVER w2 FROM t WINDOW w1 AS (ORDER BY a), w2 AS (ORDER BY b)');
  });

  test('parse aggregate with window', async () => {
    await parseOne('SELECT SUM(a) OVER (PARTITION BY b) FROM t');
    await parseOne('SELECT COUNT(*) OVER (ORDER BY a ROWS UNBOUNDED PRECEDING) FROM t');
  });
});

describe('SELECT - CASE Expression', () => {
  test('parse simple CASE', async () => {
    await parseOne("SELECT CASE a WHEN 1 THEN 'one' WHEN 2 THEN 'two' ELSE 'other' END FROM t");
  });

  test('parse searched CASE', async () => {
    await parseOne("SELECT CASE WHEN a = 1 THEN 'one' WHEN a = 2 THEN 'two' ELSE 'other' END FROM t");
  });

  test('parse nested CASE', async () => {
    await parseOne("SELECT CASE WHEN a = 1 THEN CASE WHEN b = 1 THEN 'aa' ELSE 'ab' END ELSE 'other' END FROM t");
  });

  test('parse CASE without ELSE', async () => {
    await parseOne("SELECT CASE WHEN a = 1 THEN 'one' END FROM t");
  });
});

describe('SELECT - Expressions', () => {
  test('parse arithmetic expressions', async () => {
    await parseOne('SELECT a + b FROM t');
    await parseOne('SELECT a - b FROM t');
    await parseOne('SELECT a * b FROM t');
    await parseOne('SELECT a / b FROM t');
    await parseOne('SELECT a % b FROM t');
    await parseOne('SELECT a + b * c FROM t');
    await parseOne('SELECT (a + b) * c FROM t');
  });

  test('parse comparison expressions', async () => {
    await parseOne('SELECT a = b FROM t');
    await parseOne('SELECT a <> b FROM t');
    await parseOne('SELECT a > b FROM t');
    await parseOne('SELECT a < b FROM t');
  });

  test('parse logical expressions', async () => {
    await parseOne('SELECT a AND b FROM t');
    await parseOne('SELECT a OR b FROM t');
    await parseOne('SELECT NOT a FROM t');
  });

  test('parse IS expressions', async () => {
    await parseOne('SELECT a IS NULL FROM t');
    await parseOne('SELECT a IS NOT NULL FROM t');
    await parseOne('SELECT a IS TRUE FROM t');
    await parseOne('SELECT a IS FALSE FROM t');
    await parseOne('SELECT a IS UNKNOWN FROM t');
    await parseOne('SELECT a IS DISTINCT FROM b FROM t');
  });

  test('parse string concatenation', async () => {
    await parseOne("SELECT 'hello' || 'world' FROM t");
    await parseOne("SELECT a || b || c FROM t");
  });
});

describe('SELECT - Functions', () => {
  test('parse aggregate functions', async () => {
    await parseOne('SELECT COUNT(*) FROM t');
    await parseOne('SELECT COUNT(a) FROM t');
    await parseOne('SELECT COUNT(DISTINCT a) FROM t');
    await parseOne('SELECT SUM(a) FROM t');
    await parseOne('SELECT AVG(a) FROM t');
    await parseOne('SELECT MIN(a) FROM t');
    await parseOne('SELECT MAX(a) FROM t');
  });

  test('parse scalar functions', async () => {
    await parseOne('SELECT UPPER(a) FROM t');
    await parseOne('SELECT LOWER(a) FROM t');
    await parseOne('SELECT LENGTH(a) FROM t');
    await parseOne('SELECT SUBSTRING(a, 1, 3) FROM t');
    await parseOne('SELECT COALESCE(a, b, c) FROM t');
    await parseOne('SELECT NULLIF(a, b) FROM t');
  });

  test('parse date/time functions', async () => {
    await parseOne('SELECT CURRENT_DATE');
    await parseOne('SELECT CURRENT_TIME');
    await parseOne('SELECT CURRENT_TIMESTAMP');
    await parseOne('SELECT EXTRACT(YEAR FROM a) FROM t');
  });
});

describe('SELECT - Type Casting', () => {
  test('parse CAST', async () => {
    await parseOne('SELECT CAST(a AS INT) FROM t');
    await parseOne('SELECT CAST(a AS VARCHAR(100)) FROM t');
    await parseOne("SELECT CAST('2023-01-01' AS DATE) FROM t");
  });

  test('parse TRY_CAST', async () => {
    await parseOne('SELECT TRY_CAST(a AS INT) FROM t');
  });

  test('parse PostgreSQL double-colon cast', async () => {
    await parseOne('SELECT a::INT FROM t', dialects.postgresql);
    await parseOne("SELECT '2023-01-01'::DATE FROM t", dialects.postgresql);
  });
});

describe('SELECT - Qualified References', () => {
  test('parse qualified column', async () => {
    await parseOne('SELECT t.a FROM t');
    await parseOne('SELECT schema.t.a FROM schema.t');
  });

  test('parse qualified table', async () => {
    await parseOne('SELECT * FROM schema.table1');
    await parseOne('SELECT * FROM catalog.schema.table1');
  });
});
