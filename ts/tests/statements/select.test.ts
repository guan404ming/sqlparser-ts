/**
 * SELECT statement tests
 * Comprehensive tests for SELECT statement parsing
 */

import {
  parseOne,
  dialects,
  isQuery,
} from '../test-utils';

describe('SELECT - Basic', () => {
  test('parse simple SELECT', () => {
    const stmt = parseOne('SELECT 1');
    expect(isQuery(stmt)).toBe(true);
  });

  test('parse SELECT with FROM', () => {
    parseOne('SELECT * FROM t');
    parseOne('SELECT a, b, c FROM t');
    parseOne('SELECT t.* FROM t');
  });

  test('parse SELECT with alias', () => {
    parseOne('SELECT a AS alias FROM t');
    parseOne('SELECT a alias FROM t');
    parseOne('SELECT a "alias" FROM t');
  });

  test('parse SELECT with table alias', () => {
    parseOne('SELECT t.a FROM table1 t');
    parseOne('SELECT t.a FROM table1 AS t');
    parseOne('SELECT t.a, u.b FROM table1 t, table2 u');
  });

  test('parse SELECT from multiple tables', () => {
    parseOne('SELECT * FROM t1, t2');
    parseOne('SELECT * FROM t1, t2, t3');
    parseOne('SELECT t1.a, t2.b FROM t1, t2 WHERE t1.id = t2.id');
  });
});

describe('SELECT - DISTINCT', () => {
  test('parse DISTINCT', () => {
    parseOne('SELECT DISTINCT a FROM t');
    parseOne('SELECT DISTINCT a, b FROM t');
  });

  test('parse ALL', () => {
    parseOne('SELECT ALL a FROM t');
  });

  test('parse DISTINCT ON (PostgreSQL)', () => {
    parseOne('SELECT DISTINCT ON (a) * FROM t', dialects.postgresql);
    parseOne('SELECT DISTINCT ON (a, b) a, b, c FROM t', dialects.postgresql);
  });
});

describe('SELECT - WHERE', () => {
  test('parse simple WHERE', () => {
    parseOne('SELECT * FROM t WHERE a = 1');
    parseOne('SELECT * FROM t WHERE a > 1');
    parseOne('SELECT * FROM t WHERE a < 1');
    parseOne('SELECT * FROM t WHERE a >= 1');
    parseOne('SELECT * FROM t WHERE a <= 1');
    parseOne('SELECT * FROM t WHERE a <> 1');
    parseOne('SELECT * FROM t WHERE a != 1');
  });

  test('parse WHERE with AND/OR', () => {
    parseOne('SELECT * FROM t WHERE a = 1 AND b = 2');
    parseOne('SELECT * FROM t WHERE a = 1 OR b = 2');
    parseOne('SELECT * FROM t WHERE a = 1 AND b = 2 OR c = 3');
    parseOne('SELECT * FROM t WHERE (a = 1 AND b = 2) OR c = 3');
  });

  test('parse WHERE with NOT', () => {
    parseOne('SELECT * FROM t WHERE NOT a = 1');
    parseOne('SELECT * FROM t WHERE NOT (a = 1 AND b = 2)');
  });

  test('parse WHERE with NULL checks', () => {
    parseOne('SELECT * FROM t WHERE a IS NULL');
    parseOne('SELECT * FROM t WHERE a IS NOT NULL');
  });

  test('parse WHERE with BETWEEN', () => {
    parseOne('SELECT * FROM t WHERE a BETWEEN 1 AND 10');
    parseOne('SELECT * FROM t WHERE a NOT BETWEEN 1 AND 10');
  });

  test('parse WHERE with IN', () => {
    parseOne('SELECT * FROM t WHERE a IN (1, 2, 3)');
    parseOne('SELECT * FROM t WHERE a NOT IN (1, 2, 3)');
    parseOne('SELECT * FROM t WHERE a IN (SELECT b FROM t2)');
  });

  test('parse WHERE with LIKE', () => {
    parseOne("SELECT * FROM t WHERE a LIKE 'pattern%'");
    parseOne("SELECT * FROM t WHERE a NOT LIKE 'pattern%'");
    parseOne("SELECT * FROM t WHERE a LIKE 'pat%' ESCAPE '\\\\'");
  });

  test('parse WHERE with EXISTS', () => {
    parseOne('SELECT * FROM t WHERE EXISTS (SELECT 1 FROM t2)');
    parseOne('SELECT * FROM t WHERE NOT EXISTS (SELECT 1 FROM t2)');
  });
});

describe('SELECT - ORDER BY', () => {
  test('parse ORDER BY', () => {
    parseOne('SELECT * FROM t ORDER BY a');
    parseOne('SELECT * FROM t ORDER BY a ASC');
    parseOne('SELECT * FROM t ORDER BY a DESC');
    parseOne('SELECT * FROM t ORDER BY a, b');
    parseOne('SELECT * FROM t ORDER BY a ASC, b DESC');
  });

  test('parse ORDER BY with NULLS', () => {
    parseOne('SELECT * FROM t ORDER BY a NULLS FIRST');
    parseOne('SELECT * FROM t ORDER BY a NULLS LAST');
    parseOne('SELECT * FROM t ORDER BY a ASC NULLS FIRST');
    parseOne('SELECT * FROM t ORDER BY a DESC NULLS LAST');
  });

  test('parse ORDER BY with expression', () => {
    parseOne('SELECT * FROM t ORDER BY a + b');
    parseOne('SELECT * FROM t ORDER BY CASE WHEN a > 0 THEN 1 ELSE 2 END');
  });

  test('parse ORDER BY with ordinal', () => {
    parseOne('SELECT a, b FROM t ORDER BY 1');
    parseOne('SELECT a, b FROM t ORDER BY 1, 2');
  });
});

describe('SELECT - GROUP BY', () => {
  test('parse GROUP BY', () => {
    parseOne('SELECT a, COUNT(*) FROM t GROUP BY a');
    parseOne('SELECT a, b, COUNT(*) FROM t GROUP BY a, b');
  });

  test('parse GROUP BY with expression', () => {
    parseOne('SELECT YEAR(date), COUNT(*) FROM t GROUP BY YEAR(date)');
  });

  test('parse GROUP BY with ordinal', () => {
    parseOne('SELECT a, COUNT(*) FROM t GROUP BY 1');
  });

  test('parse GROUP BY ROLLUP', () => {
    parseOne('SELECT a, b, SUM(c) FROM t GROUP BY ROLLUP (a, b)');
  });

  test('parse GROUP BY CUBE', () => {
    parseOne('SELECT a, b, SUM(c) FROM t GROUP BY CUBE (a, b)');
  });

  test('parse GROUP BY GROUPING SETS', () => {
    parseOne('SELECT a, b, SUM(c) FROM t GROUP BY GROUPING SETS ((a), (b), (a, b), ())');
  });
});

describe('SELECT - HAVING', () => {
  test('parse HAVING', () => {
    parseOne('SELECT a, COUNT(*) FROM t GROUP BY a HAVING COUNT(*) > 1');
    parseOne('SELECT a, SUM(b) FROM t GROUP BY a HAVING SUM(b) >= 100');
  });
});

describe('SELECT - LIMIT/OFFSET', () => {
  test('parse LIMIT', () => {
    parseOne('SELECT * FROM t LIMIT 10');
    parseOne('SELECT * FROM t LIMIT 10 OFFSET 5');
  });

  test('parse OFFSET', () => {
    parseOne('SELECT * FROM t OFFSET 5');
    parseOne('SELECT * FROM t OFFSET 5 ROWS');
  });

  test('parse FETCH', () => {
    parseOne('SELECT * FROM t FETCH FIRST 5 ROWS ONLY');
    parseOne('SELECT * FROM t FETCH NEXT 5 ROWS ONLY');
    parseOne('SELECT * FROM t OFFSET 10 ROWS FETCH FIRST 5 ROWS ONLY');
    parseOne('SELECT * FROM t FETCH FIRST 5 ROWS WITH TIES');
  });
});

describe('SELECT - JOINs', () => {
  test('parse INNER JOIN', () => {
    parseOne('SELECT * FROM t1 JOIN t2 ON t1.id = t2.id');
    parseOne('SELECT * FROM t1 INNER JOIN t2 ON t1.id = t2.id');
  });

  test('parse LEFT JOIN', () => {
    parseOne('SELECT * FROM t1 LEFT JOIN t2 ON t1.id = t2.id');
    parseOne('SELECT * FROM t1 LEFT OUTER JOIN t2 ON t1.id = t2.id');
  });

  test('parse RIGHT JOIN', () => {
    parseOne('SELECT * FROM t1 RIGHT JOIN t2 ON t1.id = t2.id');
    parseOne('SELECT * FROM t1 RIGHT OUTER JOIN t2 ON t1.id = t2.id');
  });

  test('parse FULL JOIN', () => {
    parseOne('SELECT * FROM t1 FULL JOIN t2 ON t1.id = t2.id');
    parseOne('SELECT * FROM t1 FULL OUTER JOIN t2 ON t1.id = t2.id');
  });

  test('parse CROSS JOIN', () => {
    parseOne('SELECT * FROM t1 CROSS JOIN t2');
  });

  test('parse NATURAL JOIN', () => {
    parseOne('SELECT * FROM t1 NATURAL JOIN t2');
    parseOne('SELECT * FROM t1 NATURAL LEFT JOIN t2');
  });

  test('parse JOIN with USING', () => {
    parseOne('SELECT * FROM t1 JOIN t2 USING (id)');
    parseOne('SELECT * FROM t1 JOIN t2 USING (id, name)');
  });

  test('parse multiple JOINs', () => {
    parseOne('SELECT * FROM t1 JOIN t2 ON t1.id = t2.id JOIN t3 ON t2.id = t3.id');
    parseOne('SELECT * FROM t1 LEFT JOIN t2 ON t1.id = t2.id RIGHT JOIN t3 ON t2.id = t3.id');
  });

  test('parse self JOIN', () => {
    parseOne('SELECT * FROM t t1 JOIN t t2 ON t1.parent_id = t2.id');
  });
});

describe('SELECT - Subqueries', () => {
  test('parse scalar subquery', () => {
    parseOne('SELECT (SELECT MAX(a) FROM t2) FROM t1');
  });

  test('parse subquery in FROM', () => {
    parseOne('SELECT * FROM (SELECT a, b FROM t) AS sub');
    parseOne('SELECT * FROM (SELECT a, b FROM t) sub');
  });

  test('parse subquery in WHERE', () => {
    parseOne('SELECT * FROM t WHERE a IN (SELECT b FROM t2)');
    parseOne('SELECT * FROM t WHERE a = (SELECT MAX(b) FROM t2)');
  });

  test('parse correlated subquery', () => {
    parseOne('SELECT * FROM t1 WHERE EXISTS (SELECT 1 FROM t2 WHERE t2.id = t1.id)');
  });
});

describe('SELECT - CTEs', () => {
  test('parse simple CTE', () => {
    parseOne('WITH cte AS (SELECT 1) SELECT * FROM cte');
  });

  test('parse multiple CTEs', () => {
    parseOne('WITH cte1 AS (SELECT 1), cte2 AS (SELECT 2) SELECT * FROM cte1, cte2');
  });

  test('parse recursive CTE', () => {
    parseOne(`
      WITH RECURSIVE cte AS (
        SELECT 1 AS n
        UNION ALL
        SELECT n + 1 FROM cte WHERE n < 10
      )
      SELECT * FROM cte
    `);
  });

  test('parse CTE with column list', () => {
    parseOne('WITH cte (a, b) AS (SELECT 1, 2) SELECT * FROM cte');
  });
});

describe('SELECT - Set Operations', () => {
  test('parse UNION', () => {
    parseOne('SELECT 1 UNION SELECT 2');
    parseOne('SELECT 1 UNION ALL SELECT 2');
    parseOne('SELECT 1 UNION DISTINCT SELECT 2');
  });

  test('parse INTERSECT', () => {
    parseOne('SELECT 1 INTERSECT SELECT 2');
    parseOne('SELECT 1 INTERSECT ALL SELECT 2');
  });

  test('parse EXCEPT', () => {
    parseOne('SELECT 1 EXCEPT SELECT 2');
    parseOne('SELECT 1 EXCEPT ALL SELECT 2');
  });

  test('parse multiple set operations', () => {
    parseOne('SELECT 1 UNION SELECT 2 UNION SELECT 3');
    parseOne('SELECT 1 UNION SELECT 2 INTERSECT SELECT 3');
    parseOne('(SELECT 1) UNION (SELECT 2) EXCEPT (SELECT 3)');
  });
});

describe('SELECT - Window Functions', () => {
  test('parse window function', () => {
    parseOne('SELECT ROW_NUMBER() OVER () FROM t');
    parseOne('SELECT RANK() OVER (ORDER BY a) FROM t');
    parseOne('SELECT DENSE_RANK() OVER (PARTITION BY b ORDER BY a) FROM t');
  });

  test('parse window function with frame', () => {
    parseOne('SELECT SUM(a) OVER (ORDER BY b ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) FROM t');
    parseOne('SELECT AVG(a) OVER (ORDER BY b ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) FROM t');
    parseOne('SELECT SUM(a) OVER (ORDER BY b RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) FROM t');
  });

  test('parse named window', () => {
    parseOne('SELECT SUM(a) OVER w FROM t WINDOW w AS (PARTITION BY b ORDER BY c)');
    parseOne('SELECT SUM(a) OVER w1, AVG(a) OVER w2 FROM t WINDOW w1 AS (ORDER BY a), w2 AS (ORDER BY b)');
  });

  test('parse aggregate with window', () => {
    parseOne('SELECT SUM(a) OVER (PARTITION BY b) FROM t');
    parseOne('SELECT COUNT(*) OVER (ORDER BY a ROWS UNBOUNDED PRECEDING) FROM t');
  });
});

describe('SELECT - CASE Expression', () => {
  test('parse simple CASE', () => {
    parseOne("SELECT CASE a WHEN 1 THEN 'one' WHEN 2 THEN 'two' ELSE 'other' END FROM t");
  });

  test('parse searched CASE', () => {
    parseOne("SELECT CASE WHEN a = 1 THEN 'one' WHEN a = 2 THEN 'two' ELSE 'other' END FROM t");
  });

  test('parse nested CASE', () => {
    parseOne("SELECT CASE WHEN a = 1 THEN CASE WHEN b = 1 THEN 'aa' ELSE 'ab' END ELSE 'other' END FROM t");
  });

  test('parse CASE without ELSE', () => {
    parseOne("SELECT CASE WHEN a = 1 THEN 'one' END FROM t");
  });
});

describe('SELECT - Expressions', () => {
  test('parse arithmetic expressions', () => {
    parseOne('SELECT a + b FROM t');
    parseOne('SELECT a - b FROM t');
    parseOne('SELECT a * b FROM t');
    parseOne('SELECT a / b FROM t');
    parseOne('SELECT a % b FROM t');
    parseOne('SELECT a + b * c FROM t');
    parseOne('SELECT (a + b) * c FROM t');
  });

  test('parse comparison expressions', () => {
    parseOne('SELECT a = b FROM t');
    parseOne('SELECT a <> b FROM t');
    parseOne('SELECT a > b FROM t');
    parseOne('SELECT a < b FROM t');
  });

  test('parse logical expressions', () => {
    parseOne('SELECT a AND b FROM t');
    parseOne('SELECT a OR b FROM t');
    parseOne('SELECT NOT a FROM t');
  });

  test('parse IS expressions', () => {
    parseOne('SELECT a IS NULL FROM t');
    parseOne('SELECT a IS NOT NULL FROM t');
    parseOne('SELECT a IS TRUE FROM t');
    parseOne('SELECT a IS FALSE FROM t');
    parseOne('SELECT a IS UNKNOWN FROM t');
    parseOne('SELECT a IS DISTINCT FROM b FROM t');
  });

  test('parse string concatenation', () => {
    parseOne("SELECT 'hello' || 'world' FROM t");
    parseOne("SELECT a || b || c FROM t");
  });
});

describe('SELECT - Functions', () => {
  test('parse aggregate functions', () => {
    parseOne('SELECT COUNT(*) FROM t');
    parseOne('SELECT COUNT(a) FROM t');
    parseOne('SELECT COUNT(DISTINCT a) FROM t');
    parseOne('SELECT SUM(a) FROM t');
    parseOne('SELECT AVG(a) FROM t');
    parseOne('SELECT MIN(a) FROM t');
    parseOne('SELECT MAX(a) FROM t');
  });

  test('parse scalar functions', () => {
    parseOne('SELECT UPPER(a) FROM t');
    parseOne('SELECT LOWER(a) FROM t');
    parseOne('SELECT LENGTH(a) FROM t');
    parseOne('SELECT SUBSTRING(a, 1, 3) FROM t');
    parseOne('SELECT COALESCE(a, b, c) FROM t');
    parseOne('SELECT NULLIF(a, b) FROM t');
  });

  test('parse date/time functions', () => {
    parseOne('SELECT CURRENT_DATE');
    parseOne('SELECT CURRENT_TIME');
    parseOne('SELECT CURRENT_TIMESTAMP');
    parseOne('SELECT EXTRACT(YEAR FROM a) FROM t');
  });
});

describe('SELECT - Type Casting', () => {
  test('parse CAST', () => {
    parseOne('SELECT CAST(a AS INT) FROM t');
    parseOne('SELECT CAST(a AS VARCHAR(100)) FROM t');
    parseOne("SELECT CAST('2023-01-01' AS DATE) FROM t");
  });

  test('parse TRY_CAST', () => {
    parseOne('SELECT TRY_CAST(a AS INT) FROM t');
  });

  test('parse PostgreSQL double-colon cast', () => {
    parseOne('SELECT a::INT FROM t', dialects.postgresql);
    parseOne("SELECT '2023-01-01'::DATE FROM t", dialects.postgresql);
  });
});

describe('SELECT - Qualified References', () => {
  test('parse qualified column', () => {
    parseOne('SELECT t.a FROM t');
    parseOne('SELECT schema.t.a FROM schema.t');
  });

  test('parse qualified table', () => {
    parseOne('SELECT * FROM schema.table1');
    parseOne('SELECT * FROM catalog.schema.table1');
  });
});
