import { Parser, GenericDialect } from '../../src';

const dialect = new GenericDialect();

describe('DDL Statements', () => {
  describe('CREATE TABLE', () => {
    it('parses simple CREATE TABLE', async () => {
      const result = await Parser.parse(
        'CREATE TABLE users (id INT, name VARCHAR(100))',
        dialect
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('CreateTable');
    });

    it('parses CREATE TABLE with PRIMARY KEY', async () => {
      const result = await Parser.parse(
        'CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100))',
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses CREATE TABLE with constraints', async () => {
      const result = await Parser.parse(
        `CREATE TABLE users (
           id INT PRIMARY KEY,
           email VARCHAR(255) UNIQUE NOT NULL,
           name VARCHAR(100) NOT NULL,
           age INT CHECK (age >= 0)
         )`,
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses CREATE TABLE with FOREIGN KEY', async () => {
      const result = await Parser.parse(
        `CREATE TABLE orders (
           id INT PRIMARY KEY,
           user_id INT REFERENCES users(id),
           total DECIMAL(10, 2)
         )`,
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses CREATE TABLE with DEFAULT', async () => {
      const result = await Parser.parse(
        `CREATE TABLE users (
           id INT PRIMARY KEY,
           status VARCHAR(20) DEFAULT 'active',
           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
         )`,
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses CREATE TABLE IF NOT EXISTS', async () => {
      const result = await Parser.parse(
        'CREATE TABLE IF NOT EXISTS users (id INT)',
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses CREATE TABLE AS SELECT', async () => {
      const result = await Parser.parse(
        'CREATE TABLE users_backup AS SELECT * FROM users',
        dialect
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('CREATE INDEX', () => {
    it('parses CREATE INDEX', async () => {
      const result = await Parser.parse(
        'CREATE INDEX idx_name ON users (name)',
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses CREATE UNIQUE INDEX', async () => {
      const result = await Parser.parse(
        'CREATE UNIQUE INDEX idx_email ON users (email)',
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses CREATE INDEX on multiple columns', async () => {
      const result = await Parser.parse(
        'CREATE INDEX idx_name_email ON users (last_name, first_name)',
        dialect
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('CREATE VIEW', () => {
    it('parses CREATE VIEW', async () => {
      const result = await Parser.parse(
        "CREATE VIEW active_users AS SELECT * FROM users WHERE status = 'active'",
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses CREATE OR REPLACE VIEW', async () => {
      const result = await Parser.parse(
        "CREATE OR REPLACE VIEW active_users AS SELECT * FROM users WHERE status = 'active'",
        dialect
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('ALTER TABLE', () => {
    it('parses ALTER TABLE ADD COLUMN', async () => {
      const result = await Parser.parse(
        'ALTER TABLE users ADD COLUMN phone VARCHAR(20)',
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses ALTER TABLE DROP COLUMN', async () => {
      const result = await Parser.parse(
        'ALTER TABLE users DROP COLUMN phone',
        dialect
      );
      expect(result).toHaveLength(1);
    });

    it('parses ALTER TABLE RENAME', async () => {
      const result = await Parser.parse(
        'ALTER TABLE users RENAME TO customers',
        dialect
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('DROP', () => {
    it('parses DROP TABLE', async () => {
      const result = await Parser.parse('DROP TABLE users', dialect);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('Drop');
    });

    it('parses DROP TABLE IF EXISTS', async () => {
      const result = await Parser.parse('DROP TABLE IF EXISTS users', dialect);
      expect(result).toHaveLength(1);
    });

    it('parses DROP INDEX', async () => {
      const result = await Parser.parse('DROP INDEX idx_name', dialect);
      expect(result).toHaveLength(1);
    });

    it('parses DROP VIEW', async () => {
      const result = await Parser.parse('DROP VIEW active_users', dialect);
      expect(result).toHaveLength(1);
    });

    it('parses DROP multiple tables', async () => {
      const result = await Parser.parse('DROP TABLE users, orders, products', dialect);
      expect(result).toHaveLength(1);
    });
  });
});
