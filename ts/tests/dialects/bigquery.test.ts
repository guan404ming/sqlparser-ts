import { Parser, BigQueryDialect } from '../../src';

const dialect = new BigQueryDialect();

describe('BigQuery Dialect', () => {
  it('parses backtick project.dataset.table', async () => {
    const sql = 'SELECT * FROM `project.dataset.table`';
    const result = await Parser.parse(sql, dialect);
    expect(result).toHaveLength(1);
  });

  it('parses STRUCT type', async () => {
    const sql = 'SELECT STRUCT(1 AS a, 2 AS b)';
    const result = await Parser.parse(sql, dialect);
    expect(result).toHaveLength(1);
  });

  it('parses ARRAY type', async () => {
    const sql = 'SELECT [1, 2, 3] AS arr';
    const result = await Parser.parse(sql, dialect);
    expect(result).toHaveLength(1);
  });

  it('parses UNNEST', async () => {
    const sql = 'SELECT * FROM UNNEST([1, 2, 3]) AS num';
    const result = await Parser.parse(sql, dialect);
    expect(result).toHaveLength(1);
  });

  it('parses SAFE_CAST', async () => {
    const sql = "SELECT SAFE_CAST('123' AS INT64)";
    const result = await Parser.parse(sql, dialect);
    expect(result).toHaveLength(1);
  });

  it('parses EXCEPT columns', async () => {
    const sql = 'SELECT * EXCEPT (id) FROM users';
    const result = await Parser.parse(sql, dialect);
    expect(result).toHaveLength(1);
  });
});
