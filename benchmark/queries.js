// 150 SQL test cases (50 per complexity level)
// Organized by statement type and complexity

export const queries = {
  // ============================================================
  // SIMPLE QUERIES (50 queries)
  // ============================================================
  simple: {
    // SELECT (20)
    select: [
      'SELECT 1',
      'SELECT 1 + 1',
      'SELECT * FROM t',
      'SELECT * FROM users',
      'SELECT id FROM t',
      'SELECT id FROM orders',
      'SELECT name FROM users',
      'SELECT a, b FROM t',
      'SELECT id, name FROM users',
      'SELECT name, email FROM customers',
      'SELECT COUNT(*) FROM t',
      'SELECT COUNT(*) FROM products',
      'SELECT SUM(a) FROM t',
      'SELECT MAX(price) FROM products',
      'SELECT MIN(id), MAX(id) FROM users',
      'SELECT DISTINCT a FROM t',
      'SELECT DISTINCT category FROM items',
      'SELECT * FROM t LIMIT 10',
      'SELECT id, name FROM users LIMIT 10',
      'SELECT * FROM logs ORDER BY id',
    ],
    // INSERT (10)
    insert: [
      "INSERT INTO t (a) VALUES (1)",
      "INSERT INTO users (name) VALUES ('John')",
      "INSERT INTO logs (msg) VALUES ('test')",
      "INSERT INTO items (id) VALUES (1)",
      "INSERT INTO t1 (a, b) VALUES (1, 'x')",
      "INSERT INTO nums (n) VALUES (100)",
      "INSERT INTO t (a, b) VALUES (1, 2)",
      "INSERT INTO data (x) VALUES (NULL)",
      "INSERT INTO flags (f) VALUES (TRUE)",
      "INSERT INTO scores (s) VALUES (99.5)",
    ],
    // UPDATE (8)
    update: [
      "UPDATE t SET a = 1",
      "UPDATE users SET name = 'Jane'",
      "UPDATE items SET qty = 0",
      "UPDATE logs SET read = 1",
      "UPDATE t SET a = 1 WHERE id = 1",
      "UPDATE users SET active = 0",
      "UPDATE t SET a = a + 1",
      "UPDATE items SET price = 10.99",
    ],
    // DELETE (6)
    delete: [
      'DELETE FROM t',
      'DELETE FROM users',
      'DELETE FROM logs WHERE id = 1',
      'DELETE FROM items WHERE qty = 0',
      'DELETE FROM t WHERE a IS NULL',
      'DELETE FROM old_data',
    ],
    // CREATE/DROP/ALTER (6)
    ddl: [
      'CREATE TABLE t (id INT)',
      'CREATE TABLE users (id INT, name TEXT)',
      'CREATE TABLE logs (id INT, msg TEXT)',
      'DROP TABLE t',
      'DROP TABLE IF EXISTS temp',
      'ALTER TABLE t ADD col INT',
    ],
  },

  // ============================================================
  // MEDIUM QUERIES (50 queries)
  // ============================================================
  medium: {
    // SELECT with WHERE, JOIN, GROUP BY (25)
    select: [
      'SELECT * FROM users WHERE active = 1',
      'SELECT * FROM users WHERE active = 1 AND age > 18',
      'SELECT * FROM t WHERE a > 10 AND b < 20',
      'SELECT id, name FROM users WHERE email LIKE \'%@gmail.com\'',
      'SELECT * FROM orders WHERE total BETWEEN 100 AND 500',
      'SELECT * FROM items WHERE category IN (\'A\', \'B\', \'C\')',
      'SELECT * FROM t WHERE a IS NOT NULL',
      'SELECT * FROM users WHERE name != \'admin\'',
      'SELECT u.id, o.total FROM users u JOIN orders o ON u.id = o.user_id',
      'SELECT * FROM a LEFT JOIN b ON a.id = b.a_id',
      'SELECT * FROM x RIGHT JOIN y ON x.k = y.k',
      'SELECT * FROM t1 INNER JOIN t2 ON t1.id = t2.t1_id',
      'SELECT * FROM a CROSS JOIN b',
      'SELECT category, COUNT(*) FROM products GROUP BY category',
      'SELECT user_id, SUM(amount) FROM payments GROUP BY user_id',
      'SELECT a, COUNT(*) FROM t GROUP BY a HAVING COUNT(*) > 1',
      'SELECT user_id, SUM(amount) FROM payments GROUP BY user_id HAVING SUM(amount) > 100',
      'SELECT * FROM users ORDER BY created_at DESC',
      'SELECT * FROM users ORDER BY created_at DESC LIMIT 20 OFFSET 10',
      'SELECT COALESCE(name, \'Unknown\') FROM users',
      'SELECT NULLIF(a, 0) FROM t',
      'SELECT CASE WHEN age > 18 THEN \'adult\' ELSE \'minor\' END FROM users',
      'SELECT CASE a WHEN 1 THEN \'one\' WHEN 2 THEN \'two\' ELSE \'other\' END FROM t',
      'SELECT id, (SELECT COUNT(*) FROM orders WHERE orders.user_id = users.id) FROM users',
      'SELECT * FROM products WHERE price > (SELECT AVG(price) FROM products)',
    ],
    // INSERT with variations (10)
    insert: [
      "INSERT INTO users (name, email) VALUES ('A', 'a@x.com'), ('B', 'b@x.com')",
      "INSERT INTO t (a, b, c) VALUES (1, 2, 3), (4, 5, 6), (7, 8, 9)",
      "INSERT INTO t (a, b, c) VALUES (1, 2, 3), (4, 5, 6)",
      'INSERT INTO logs (user_id, action) SELECT id, \'login\' FROM users WHERE active = 1',
      "INSERT INTO archive SELECT * FROM logs WHERE date < '2024-01-01'",
      'INSERT INTO stats (user_id, count) SELECT user_id, COUNT(*) FROM orders GROUP BY user_id',
      "INSERT INTO t SELECT * FROM t2 WHERE a > 10",
      "INSERT INTO backup SELECT id, name FROM users",
      "INSERT INTO t (a) SELECT b FROM t2",
      "INSERT INTO results SELECT a, b, a + b FROM nums",
    ],
    // UPDATE with conditions (8)
    update: [
      "UPDATE users SET status = 'inactive' WHERE last_login < '2024-01-01'",
      'UPDATE orders SET discount = 0.1 WHERE total > 1000',
      'UPDATE items SET price = price * 1.1 WHERE category = \'premium\'',
      'UPDATE users SET rank = (SELECT COUNT(*) FROM orders WHERE orders.user_id = users.id)',
      'UPDATE products SET stock = stock - 1 WHERE id IN (SELECT product_id FROM cart)',
      'UPDATE t SET a = b, b = a WHERE id = 1',
      'UPDATE users SET updated_at = NOW() WHERE id = 1',
      'UPDATE t SET a = CASE WHEN b > 0 THEN 1 ELSE 0 END',
    ],
    // DELETE with conditions (4)
    delete: [
      "DELETE FROM sessions WHERE expires_at < NOW()",
      'DELETE FROM logs WHERE user_id IN (SELECT id FROM users WHERE deleted = 1)',
      "DELETE FROM temp WHERE created_at < '2024-01-01'",
      'DELETE FROM t WHERE a IN (SELECT b FROM t2)',
    ],
    // DDL with constraints (3)
    ddl: [
      'CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(255) NOT NULL)',
      'CREATE TABLE orders (id INT, user_id INT REFERENCES users(id))',
      'CREATE INDEX idx_users_email ON users(email)',
    ],
  },

  // ============================================================
  // COMPLEX QUERIES (50 queries)
  // ============================================================
  complex: {
    // CTE, Window functions, complex JOINs (30)
    select: [
      `WITH active_users AS (SELECT * FROM users WHERE active = 1) SELECT * FROM active_users WHERE age > 25`,
      `WITH t AS (SELECT id, name FROM users) SELECT * FROM t`,
      `WITH a AS (SELECT 1 as x), b AS (SELECT 2 as y) SELECT * FROM a, b`,
      `WITH RECURSIVE tree AS (
         SELECT id, parent_id, name, 1 as level FROM categories WHERE parent_id IS NULL
         UNION ALL
         SELECT c.id, c.parent_id, c.name, t.level + 1 FROM categories c JOIN tree t ON c.parent_id = t.id
       ) SELECT * FROM tree`,
      `WITH RECURSIVE nums AS (SELECT 1 as n UNION ALL SELECT n + 1 FROM nums WHERE n < 10) SELECT * FROM nums`,
      `SELECT id, name, ROW_NUMBER() OVER (ORDER BY created_at) as rn FROM users`,
      `SELECT id, ROW_NUMBER() OVER (ORDER BY id) FROM t`,
      `SELECT id, category, price, RANK() OVER (PARTITION BY category ORDER BY price DESC) as rank FROM products`,
      `SELECT id, RANK() OVER (ORDER BY score DESC) FROM students`,
      `SELECT id, DENSE_RANK() OVER (ORDER BY score DESC) FROM students`,
      `SELECT id, amount, SUM(amount) OVER (ORDER BY date) as running_total FROM transactions`,
      `SELECT id, amount, SUM(amount) OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as running_total FROM transactions`,
      `SELECT id, value, LAG(value) OVER (ORDER BY id) as prev_value FROM metrics`,
      `SELECT id, value, LEAD(value) OVER (ORDER BY id) as next_value FROM metrics`,
      `SELECT id, value, LAG(value, 2) OVER (ORDER BY id) as prev2 FROM metrics`,
      `SELECT id, amount, AVG(amount) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as moving_avg FROM sales`,
      `SELECT id, NTILE(4) OVER (ORDER BY score DESC) as quartile FROM students`,
      `SELECT id, FIRST_VALUE(price) OVER (PARTITION BY category ORDER BY date) as first_price FROM products`,
      `SELECT id, LAST_VALUE(price) OVER (PARTITION BY category ORDER BY date) as last_price FROM products`,
      `SELECT a.id, b.name, c.total, d.status
       FROM orders a
       JOIN users b ON a.user_id = b.id
       JOIN payments c ON a.id = c.order_id
       LEFT JOIN shipments d ON a.id = d.order_id
       WHERE a.created_at > '2024-01-01'`,
      `SELECT u.id, u.name,
         COUNT(DISTINCT o.id) as order_count,
         SUM(o.total) as total_spent,
         AVG(o.total) as avg_order
       FROM users u
       LEFT JOIN orders o ON u.id = o.user_id
       GROUP BY u.id, u.name
       HAVING COUNT(DISTINCT o.id) > 5`,
      `SELECT * FROM (
         SELECT *, ROW_NUMBER() OVER (PARTITION BY category ORDER BY sales DESC) as rn
         FROM products
       ) t WHERE rn <= 3`,
      `WITH monthly AS (
         SELECT DATE_TRUNC('month', date) as month, SUM(amount) as total
         FROM transactions GROUP BY DATE_TRUNC('month', date)
       )
       SELECT month, total, total - LAG(total) OVER (ORDER BY month) as diff
       FROM monthly`,
      `SELECT EXTRACT(YEAR FROM date) as year, EXTRACT(MONTH FROM date) as month, SUM(amount)
       FROM sales GROUP BY EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date)
       ORDER BY year, month`,
      `SELECT a.*, b.*, c.* FROM t1 a JOIN t2 b ON a.id = b.a_id JOIN t3 c ON b.id = c.b_id WHERE a.x > 10`,
      `SELECT * FROM t1 UNION SELECT * FROM t2`,
      `SELECT * FROM t1 UNION ALL SELECT * FROM t2`,
      `SELECT * FROM t1 INTERSECT SELECT * FROM t2`,
      `SELECT * FROM t1 EXCEPT SELECT * FROM t2`,
      `SELECT a, b, c FROM t1 UNION SELECT x, y, z FROM t2 ORDER BY 1`,
    ],
    // Complex INSERT (8)
    insert: [
      `INSERT INTO report (user_id, month, total_orders, total_amount)
       SELECT user_id, DATE_TRUNC('month', date), COUNT(*), SUM(amount)
       FROM orders GROUP BY user_id, DATE_TRUNC('month', date)`,
      `INSERT INTO user_stats (user_id, metric, value)
       SELECT id, 'order_count', (SELECT COUNT(*) FROM orders WHERE user_id = users.id)
       FROM users`,
      `WITH new_data AS (SELECT 1 as a, 2 as b, 3 as c) INSERT INTO t SELECT * FROM new_data`,
      `INSERT INTO archive
       SELECT o.*, u.name as user_name, p.method as payment_method
       FROM orders o
       JOIN users u ON o.user_id = u.id
       JOIN payments p ON o.id = p.order_id
       WHERE o.date < '2024-01-01'`,
      `INSERT INTO daily_summary (date, total_users, total_orders, total_revenue)
       SELECT CURRENT_DATE,
         (SELECT COUNT(*) FROM users WHERE active = 1),
         (SELECT COUNT(*) FROM orders WHERE date = CURRENT_DATE),
         (SELECT COALESCE(SUM(total), 0) FROM orders WHERE date = CURRENT_DATE)`,
      `INSERT INTO t1 SELECT a, b, a * b FROM t2 WHERE a > 0`,
      `INSERT INTO results SELECT id, SUM(val) OVER (ORDER BY id) FROM source`,
      `INSERT INTO agg SELECT category, COUNT(*), SUM(price), AVG(price) FROM products GROUP BY category`,
    ],
    // Complex UPDATE (6)
    update: [
      `UPDATE users SET
         total_orders = (SELECT COUNT(*) FROM orders WHERE orders.user_id = users.id),
         total_spent = (SELECT COALESCE(SUM(total), 0) FROM orders WHERE orders.user_id = users.id)`,
      `UPDATE products p SET
         avg_rating = (SELECT AVG(rating) FROM reviews r WHERE r.product_id = p.id),
         review_count = (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id)`,
      `UPDATE orders SET status = 'shipped'
       WHERE id IN (
         SELECT order_id FROM shipments WHERE shipped_at IS NOT NULL
       ) AND status = 'processing'`,
      `UPDATE users u SET tier = (
         CASE
           WHEN (SELECT SUM(total) FROM orders WHERE user_id = u.id) > 10000 THEN 'gold'
           WHEN (SELECT SUM(total) FROM orders WHERE user_id = u.id) > 5000 THEN 'silver'
           ELSE 'bronze'
         END
       )`,
      `UPDATE t SET a = (SELECT MAX(b) FROM t2 WHERE t2.id = t.id)`,
      `UPDATE t1 SET x = t2.y FROM t2 WHERE t1.id = t2.t1_id`,
    ],
    // Complex DDL (6)
    ddl: [
      `CREATE TABLE orders (
         id INT PRIMARY KEY,
         user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
         total DECIMAL(12,2) NOT NULL CHECK (total >= 0),
         status VARCHAR(20) DEFAULT 'pending',
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
       )`,
      `CREATE TABLE audit_log (
         id INT PRIMARY KEY,
         table_name VARCHAR(100) NOT NULL,
         record_id INT NOT NULL,
         action VARCHAR(10) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
         old_data TEXT,
         new_data TEXT,
         changed_by INT REFERENCES users(id),
         changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
       )`,
      `CREATE TABLE products (
         id INT PRIMARY KEY,
         name VARCHAR(255) NOT NULL,
         description TEXT,
         price DECIMAL(10,2) NOT NULL,
         category_id INT REFERENCES categories(id),
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         CONSTRAINT positive_price CHECK (price > 0)
       )`,
      `CREATE VIEW active_orders AS
       SELECT o.*, u.name as user_name, u.email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.status != 'cancelled'`,
      `CREATE TABLE user_preferences (
         user_id INT PRIMARY KEY REFERENCES users(id),
         theme VARCHAR(20) DEFAULT 'light',
         notifications INT DEFAULT 1,
         language VARCHAR(10) DEFAULT 'en',
         timezone VARCHAR(50) DEFAULT 'UTC'
       )`,
      `CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL`,
    ],
  },
};

// Dialect-specific queries (additional queries per dialect)
export const dialectQueries = {
  mysql: {
    simple: [
      'SELECT @@version',
      'SHOW TABLES',
      'SHOW DATABASES',
      'DESC users',
      'SELECT * FROM users LIMIT 10, 5',
    ],
    medium: [
      'SELECT * FROM users WHERE name REGEXP \'^[A-Z]\'',
      'SELECT GROUP_CONCAT(name) FROM users GROUP BY category',
      'INSERT INTO t SET a = 1, b = 2',
      'REPLACE INTO users (id, name) VALUES (1, \'John\')',
      'SELECT * FROM orders FOR UPDATE',
    ],
    complex: [
      'SELECT * FROM users WHERE MATCH(name, bio) AGAINST (\'search term\')',
      'INSERT INTO t (a) VALUES (1) ON DUPLICATE KEY UPDATE a = VALUES(a) + 1',
      'SELECT JSON_EXTRACT(data, \'$.name\') FROM users',
    ],
  },
  postgresql: {
    simple: [
      'SELECT version()',
      'SELECT NOW()',
      'SELECT CURRENT_USER',
      'SELECT * FROM users FETCH FIRST 10 ROWS ONLY',
      'SELECT \'hello\'::TEXT',
    ],
    medium: [
      'SELECT * FROM users WHERE name ~ \'^[A-Z]\'',
      'SELECT ARRAY_AGG(name) FROM users GROUP BY category',
      'SELECT * FROM users WHERE data @> \'{\"active\": true}\'',
      'SELECT * FROM users WHERE tags && ARRAY[\'a\', \'b\']',
      'INSERT INTO t (a) VALUES (1) RETURNING *',
    ],
    complex: [
      'SELECT * FROM users WHERE data ->> \'name\' = \'John\'',
      'INSERT INTO t (a) VALUES (1) ON CONFLICT (a) DO UPDATE SET a = EXCLUDED.a',
      'SELECT * FROM generate_series(1, 10) AS n',
    ],
  },
  sqlite: {
    simple: [
      'SELECT sqlite_version()',
      'SELECT last_insert_rowid()',
      'SELECT typeof(1)',
      'SELECT * FROM users WHERE rowid = 1',
      'VACUUM',
    ],
    medium: [
      'SELECT * FROM users WHERE name GLOB \'[A-Z]*\'',
      'SELECT group_concat(name) FROM users GROUP BY category',
      'INSERT OR REPLACE INTO users (id, name) VALUES (1, \'John\')',
      'INSERT OR IGNORE INTO users (id, name) VALUES (1, \'John\')',
      'SELECT * FROM users INDEXED BY idx_name WHERE name = \'John\'',
    ],
    complex: [
      'SELECT json_extract(data, \'$.name\') FROM users',
      'INSERT INTO t (a) VALUES (1) ON CONFLICT(a) DO UPDATE SET a = excluded.a',
      'WITH RECURSIVE cnt(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM cnt WHERE x<10) SELECT x FROM cnt',
    ],
  },
};

// Get all queries for a dialect
export function getQueriesForDialect(dialect) {
  const result = { simple: [], medium: [], complex: [] };

  // Add generic queries
  for (const level of ['simple', 'medium', 'complex']) {
    for (const stmts of Object.values(queries[level])) {
      result[level].push(...stmts);
    }
  }

  // Add dialect-specific queries
  if (dialectQueries[dialect]) {
    for (const level of ['simple', 'medium', 'complex']) {
      if (dialectQueries[dialect][level]) {
        result[level].push(...dialectQueries[dialect][level]);
      }
    }
  }

  return result;
}

// Get total query count
export function getQueryCount() {
  let total = 0;
  for (const level of ['simple', 'medium', 'complex']) {
    for (const stmts of Object.values(queries[level])) {
      total += stmts.length;
    }
  }
  return total;
}

export const dialects = ['mysql', 'postgresql', 'sqlite'];
