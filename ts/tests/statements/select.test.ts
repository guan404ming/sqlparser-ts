import { Parser, GenericDialect } from '../../src';

const dialect = new GenericDialect();

describe('SELECT Statements', () => {
  describe('basic', () => {
    it('parses SELECT *', async () => {
      const result = await Parser.parse('SELECT * FROM users', dialect);
      expect(result).toHaveLength(1);
    });

    it('parses SELECT columns', async () => {
      const result = await Parser.parse('SELECT id, name, email FROM users', dialect);
      expect(result).toHaveLength(1);
    });

    it('parses SELECT with alias', async () => {
      const result = await Parser.parse('SELECT id AS user_id, name AS user_name FROM users u', dialect);
      expect(result).toHaveLength(1);
    });

    it('parses SELECT DISTINCT', async () => {
      const result = await Parser.parse('SELECT DISTINCT name FROM users', dialect);
      expect(result).toHaveLength(1);
    });
  });

  describe('WHERE', () => {
    it('parses simple WHERE', async () => {
      const result = await Parser.parse('SELECT * FROM users WHERE id = 1', dialect);
      expect(result).toHaveLength(1);
    });

    it('parses WHERE with AND/OR', async () => {
      const result = await Parser.parse(
        "SELECT * FROM users WHERE id = 1 AND name = 'test' OR status = 'active'",
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses WHERE IN', async () => {
      const result = await Parser.parse('SELECT * FROM users WHERE id IN (1, 2, 3)', dialect);
      expect(result).toHaveLength(1);
    });

    it('parses WHERE BETWEEN', async () => {
      const result = await Parser.parse('SELECT * FROM users WHERE age BETWEEN 18 AND 65', dialect);
      expect(result).toHaveLength(1);
    });

    it('parses WHERE LIKE', async () => {
      const result = await Parser.parse("SELECT * FROM users WHERE name LIKE '%test%'", dialect);
      expect(result).toHaveLength(1);
    });

    it('parses WHERE IS NULL', async () => {
      const result = await Parser.parse('SELECT * FROM users WHERE deleted_at IS NULL', dialect);
      expect(result).toHaveLength(1);
    });
  });

  describe('JOIN', () => {
    it('parses INNER JOIN', async () => {
      const result = await Parser.parse(
        'SELECT * FROM users INNER JOIN orders ON users.id = orders.user_id',
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses LEFT JOIN', async () => {
      const result = await Parser.parse(
        'SELECT * FROM users LEFT JOIN orders ON users.id = orders.user_id',
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses RIGHT JOIN', async () => {
      const result = await Parser.parse(
        'SELECT * FROM users RIGHT JOIN orders ON users.id = orders.user_id',
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses multiple JOINs', async () => {
      const result = await Parser.parse(
        `SELECT * FROM users
         LEFT JOIN orders ON users.id = orders.user_id
         LEFT JOIN products ON orders.product_id = products.id`,
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses CROSS JOIN', async () => {
      const result = await Parser.parse('SELECT * FROM users CROSS JOIN products', dialect);
      expect(result).toHaveLength(1);
    });
  });

  describe('GROUP BY / HAVING', () => {
    it('parses GROUP BY', async () => {
      const result = await Parser.parse(
        'SELECT department, COUNT(*) FROM employees GROUP BY department',
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses GROUP BY with HAVING', async () => {
      const result = await Parser.parse(
        'SELECT department, COUNT(*) as cnt FROM employees GROUP BY department HAVING COUNT(*) > 5',
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses GROUP BY multiple columns', async () => {
      const result = await Parser.parse(
        'SELECT department, role, COUNT(*) FROM employees GROUP BY department, role',
        dialect
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('ORDER BY / LIMIT', () => {
    it('parses ORDER BY', async () => {
      const result = await Parser.parse('SELECT * FROM users ORDER BY name', dialect);
      expect(result).toHaveLength(1);
    });

    it('parses ORDER BY DESC', async () => {
      const result = await Parser.parse('SELECT * FROM users ORDER BY created_at DESC', dialect);
      expect(result).toHaveLength(1);
    });

    it('parses ORDER BY multiple columns', async () => {
      const result = await Parser.parse(
        'SELECT * FROM users ORDER BY last_name ASC, first_name ASC',
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses LIMIT', async () => {
      const result = await Parser.parse('SELECT * FROM users LIMIT 10', dialect);
      expect(result).toHaveLength(1);
    });

    it('parses LIMIT with OFFSET', async () => {
      const result = await Parser.parse('SELECT * FROM users LIMIT 10 OFFSET 20', dialect);
      expect(result).toHaveLength(1);
    });
  });

  describe('subqueries', () => {
    it('parses subquery in WHERE', async () => {
      const result = await Parser.parse(
        'SELECT * FROM users WHERE id IN (SELECT user_id FROM orders)',
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses subquery in FROM', async () => {
      const result = await Parser.parse(
        'SELECT * FROM (SELECT id, name FROM users) AS sub',
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses correlated subquery', async () => {
      const result = await Parser.parse(
        `SELECT * FROM users u
         WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id)`,
        dialect
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('CTE', () => {
    it('parses simple CTE', async () => {
      const result = await Parser.parse(
        `WITH active_users AS (SELECT * FROM users WHERE status = 'active')
         SELECT * FROM active_users`,
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses multiple CTEs', async () => {
      const result = await Parser.parse(
        `WITH
           active_users AS (SELECT * FROM users WHERE status = 'active'),
           recent_orders AS (SELECT * FROM orders WHERE created_at > '2024-01-01')
         SELECT * FROM active_users JOIN recent_orders ON active_users.id = recent_orders.user_id`,
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses recursive CTE', async () => {
      const result = await Parser.parse(
        `WITH RECURSIVE cte AS (
           SELECT 1 AS n
           UNION ALL
           SELECT n + 1 FROM cte WHERE n < 10
         )
         SELECT * FROM cte`,
        dialect
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('UNION', () => {
    it('parses UNION', async () => {
      const result = await Parser.parse(
        'SELECT id, name FROM users UNION SELECT id, name FROM admins',
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses UNION ALL', async () => {
      const result = await Parser.parse(
        'SELECT id, name FROM users UNION ALL SELECT id, name FROM admins',
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses INTERSECT', async () => {
      const result = await Parser.parse(
        'SELECT id FROM users INTERSECT SELECT user_id FROM orders',
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses EXCEPT', async () => {
      const result = await Parser.parse(
        'SELECT id FROM users EXCEPT SELECT user_id FROM banned_users',
        dialect
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('window functions', () => {
    it('parses ROW_NUMBER', async () => {
      const result = await Parser.parse(
        'SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn FROM users',
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses PARTITION BY', async () => {
      const result = await Parser.parse(
        'SELECT id, ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn FROM employees',
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses multiple window functions', async () => {
      const result = await Parser.parse(
        `SELECT id,
           ROW_NUMBER() OVER (ORDER BY id) AS rn,
           SUM(amount) OVER (PARTITION BY user_id) AS total
         FROM orders`,
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses LEAD/LAG', async () => {
      const result = await Parser.parse(
        'SELECT id, LAG(amount, 1) OVER (ORDER BY created_at) AS prev_amount FROM orders',
        dialect
      );
      expect(result).toHaveLength(1);
    });
  });
});
