import { Parser, MySqlDialect } from '../../src';

const dialect = new MySqlDialect();

describe('MySQL Dialect', () => {
  it('parses backtick identifiers', async () => {
    const sql = 'SELECT `id`, `name` FROM `users`';
    const result = await Parser.parse(sql, dialect);
    expect(result).toHaveLength(1);
  });

  it('parses LIMIT offset syntax', async () => {
    const sql = 'SELECT * FROM users LIMIT 10, 5';
    const result = await Parser.parse(sql, dialect);
    expect(result).toHaveLength(1);
  });

  it('parses AUTO_INCREMENT', async () => {
    const sql = 'CREATE TABLE test (id INT AUTO_INCREMENT PRIMARY KEY)';
    const result = await Parser.parse(sql, dialect);
    expect(result).toHaveLength(1);
  });

  it('parses ON DUPLICATE KEY UPDATE', async () => {
    const sql = `
      INSERT INTO users (id, name) VALUES (1, 'test')
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `;
    const result = await Parser.parse(sql, dialect);
    expect(result).toHaveLength(1);
  });

  it('parses SHOW statements', async () => {
    const sql = 'SHOW TABLES';
    const result = await Parser.parse(sql, dialect);
    expect(result).toHaveLength(1);
  });

  it('parses USE database', async () => {
    const sql = 'USE mydb';
    const result = await Parser.parse(sql, dialect);
    expect(result).toHaveLength(1);
  });

  it('parses INDEX hints', async () => {
    const sql = 'SELECT * FROM users USE INDEX (idx_name) WHERE name = "test"';
    const result = await Parser.parse(sql, dialect);
    expect(result).toHaveLength(1);
  });
});
