import { Parser, GenericDialect } from '../../src';

const dialect = new GenericDialect();

describe('DML Statements', () => {
  describe('INSERT', () => {
    it('parses INSERT VALUES', async () => {
      const result = await Parser.parse(
        "INSERT INTO users (name, email) VALUES ('John', 'john@test.com')",
        dialect
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('Insert');
    });

    it('parses INSERT multiple rows', async () => {
      const result = await Parser.parse(
        "INSERT INTO users (name) VALUES ('John'), ('Jane'), ('Bob')",
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses INSERT SELECT', async () => {
      const result = await Parser.parse(
        'INSERT INTO users_backup SELECT * FROM users',
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses INSERT with column list', async () => {
      const result = await Parser.parse(
        "INSERT INTO users (id, name, email, created_at) VALUES (1, 'John', 'john@test.com', NOW())",
        dialect
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('UPDATE', () => {
    it('parses simple UPDATE', async () => {
      const result = await Parser.parse(
        "UPDATE users SET name = 'John' WHERE id = 1",
        dialect
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('Update');
    });

    it('parses UPDATE multiple columns', async () => {
      const result = await Parser.parse(
        "UPDATE users SET name = 'John', email = 'john@test.com', updated_at = NOW() WHERE id = 1",
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses UPDATE with subquery', async () => {
      const result = await Parser.parse(
        `UPDATE users SET status = 'premium'
         WHERE id IN (SELECT user_id FROM orders WHERE total > 1000)`,
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses UPDATE with JOIN', async () => {
      const result = await Parser.parse(
        `UPDATE users u
         SET u.order_count = (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id)`,
        dialect
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('DELETE', () => {
    it('parses simple DELETE', async () => {
      const result = await Parser.parse('DELETE FROM users WHERE id = 1', dialect);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('Delete');
    });

    it('parses DELETE all', async () => {
      const result = await Parser.parse('DELETE FROM users', dialect);
      expect(result).toHaveLength(1);
    });

    it('parses DELETE with subquery', async () => {
      const result = await Parser.parse(
        `DELETE FROM users
         WHERE id IN (SELECT user_id FROM banned_users)`,
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses DELETE with complex WHERE', async () => {
      const result = await Parser.parse(
        `DELETE FROM logs
         WHERE created_at < '2024-01-01' AND level = 'debug'`,
        dialect
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('TRUNCATE', () => {
    it('parses TRUNCATE', async () => {
      const result = await Parser.parse('TRUNCATE TABLE users', dialect);
      expect(result).toHaveLength(1);
    });
  });
});
