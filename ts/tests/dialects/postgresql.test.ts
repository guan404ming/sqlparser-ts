import { Parser, PostgreSqlDialect } from '../../src';

const dialect = new PostgreSqlDialect();

describe('PostgreSQL Dialect', () => {
  it('parses $1 placeholders', async () => {
    const sql = 'SELECT * FROM users WHERE id = $1 AND name = $2';
    const result = await Parser.parse(sql, dialect);
    expect(result).toHaveLength(1);
  });

  it('parses ILIKE operator', async () => {
    const sql = "SELECT * FROM users WHERE name ILIKE '%test%'";
    const result = await Parser.parse(sql, dialect);
    expect(result).toHaveLength(1);
  });

  it('parses array syntax', async () => {
    const sql = "SELECT ARRAY[1, 2, 3]";
    const result = await Parser.parse(sql, dialect);
    expect(result).toHaveLength(1);
  });

  it('parses RETURNING clause', async () => {
    const sql = "INSERT INTO users (name) VALUES ('test') RETURNING id";
    const result = await Parser.parse(sql, dialect);
    expect(result).toHaveLength(1);
  });

  it('parses ON CONFLICT', async () => {
    const sql = `
      INSERT INTO users (id, name) VALUES (1, 'test')
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
    `;
    const result = await Parser.parse(sql, dialect);
    expect(result).toHaveLength(1);
  });

  it('parses SERIAL type', async () => {
    const sql = 'CREATE TABLE test (id SERIAL PRIMARY KEY)';
    const result = await Parser.parse(sql, dialect);
    expect(result).toHaveLength(1);
  });

  it('parses JSON operators', async () => {
    const sql = "SELECT data->>'name' FROM users";
    const result = await Parser.parse(sql, dialect);
    expect(result).toHaveLength(1);
  });

  it('parses DISTINCT ON', async () => {
    const sql = 'SELECT DISTINCT ON (user_id) * FROM orders ORDER BY user_id, created_at DESC';
    const result = await Parser.parse(sql, dialect);
    expect(result).toHaveLength(1);
  });
});
