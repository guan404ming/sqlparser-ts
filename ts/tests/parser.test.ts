import {
  Parser,
  GenericDialect,
  PostgreSqlDialect,
  MySqlDialect,
  SQLiteDialect,
  SnowflakeDialect,
  BigQueryDialect,
  DuckDbDialect,
  ParserError,
  dialectFromString,
  SUPPORTED_DIALECTS,
} from '../src';

describe('Parser', () => {
  describe('parse', () => {
    it('should parse a simple SELECT statement', async () => {
      const statements = await Parser.parse('SELECT 1', new GenericDialect());
      expect(statements).toHaveLength(1);
      expect(statements[0]).toHaveProperty('Query');
    });

    it('should parse SELECT with columns', async () => {
      const statements = await Parser.parse(
        'SELECT id, name FROM users',
        new GenericDialect()
      );
      expect(statements).toHaveLength(1);
    });

    it('should parse SELECT with WHERE clause', async () => {
      const statements = await Parser.parse(
        "SELECT * FROM users WHERE id = 1 AND name = 'test'",
        new GenericDialect()
      );
      expect(statements).toHaveLength(1);
    });

    it('should parse multiple statements', async () => {
      const statements = await Parser.parse(
        'SELECT 1; SELECT 2; SELECT 3',
        new GenericDialect()
      );
      expect(statements).toHaveLength(3);
    });

    it('should parse INSERT statement', async () => {
      const statements = await Parser.parse(
        "INSERT INTO users (name) VALUES ('Alice')",
        new GenericDialect()
      );
      expect(statements).toHaveLength(1);
      expect(statements[0]).toHaveProperty('Insert');
    });

    it('should parse UPDATE statement', async () => {
      const statements = await Parser.parse(
        "UPDATE users SET name = 'Bob' WHERE id = 1",
        new GenericDialect()
      );
      expect(statements).toHaveLength(1);
      expect(statements[0]).toHaveProperty('Update');
    });

    it('should parse DELETE statement', async () => {
      const statements = await Parser.parse(
        'DELETE FROM users WHERE id = 1',
        new GenericDialect()
      );
      expect(statements).toHaveLength(1);
      expect(statements[0]).toHaveProperty('Delete');
    });

    it('should parse CREATE TABLE statement', async () => {
      const statements = await Parser.parse(
        'CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100))',
        new GenericDialect()
      );
      expect(statements).toHaveLength(1);
      expect(statements[0]).toHaveProperty('CreateTable');
    });
  });

  describe('parse with different dialects', () => {
    it('should parse PostgreSQL-specific syntax', async () => {
      const statements = await Parser.parse(
        "SELECT * FROM users WHERE id = $1 AND name ILIKE '%test%'",
        new PostgreSqlDialect()
      );
      expect(statements).toHaveLength(1);
    });

    it('should parse MySQL-specific syntax', async () => {
      const statements = await Parser.parse(
        'SELECT * FROM users LIMIT 10, 5',
        new MySqlDialect()
      );
      expect(statements).toHaveLength(1);
    });

    it('should parse SQLite-specific syntax', async () => {
      const statements = await Parser.parse(
        'SELECT * FROM users WHERE id = ?',
        new SQLiteDialect()
      );
      expect(statements).toHaveLength(1);
    });

    it('should parse BigQuery-specific syntax', async () => {
      const statements = await Parser.parse(
        'SELECT * FROM `project.dataset.table`',
        new BigQueryDialect()
      );
      expect(statements).toHaveLength(1);
    });

    it('should parse DuckDB-specific syntax', async () => {
      const statements = await Parser.parse(
        'SELECT * FROM read_csv_auto("file.csv")',
        new DuckDbDialect()
      );
      expect(statements).toHaveLength(1);
    });
  });

  describe('parseToJson', () => {
    it('should return JSON string', async () => {
      const json = await Parser.parseToJson('SELECT 1', new GenericDialect());
      expect(typeof json).toBe('string');
      const parsed = JSON.parse(json);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
    });
  });

  describe('parseToString', () => {
    it('should return string representation', async () => {
      const str = await Parser.parseToString('SELECT 1', new GenericDialect());
      expect(typeof str).toBe('string');
      expect(str).toContain('SELECT');
    });
  });

  describe('format', () => {
    it('should format SQL', async () => {
      const formatted = await Parser.format(
        'select   *   from   users',
        new GenericDialect()
      );
      expect(formatted).toBe('SELECT * FROM users');
    });

    it('should format complex SQL', async () => {
      const formatted = await Parser.format(
        "select id,name from users where id=1 and name='test'",
        new GenericDialect()
      );
      expect(formatted).toContain('SELECT');
      expect(formatted).toContain('FROM');
      expect(formatted).toContain('WHERE');
    });
  });

  describe('validate', () => {
    it('should return true for valid SQL', async () => {
      const isValid = await Parser.validate('SELECT 1', new GenericDialect());
      expect(isValid).toBe(true);
    });

    it('should throw for invalid SQL', async () => {
      await expect(
        Parser.validate('SELEC * FROM', new GenericDialect())
      ).rejects.toThrow();
    });
  });

  describe('error handling', () => {
    it('should throw ParserError for invalid SQL', async () => {
      try {
        await Parser.parse('INVALID SQL SYNTAX HERE', new GenericDialect());
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ParserError);
        expect((error as ParserError).message).toBeTruthy();
      }
    });

    it('should throw ParserError for incomplete SQL', async () => {
      try {
        await Parser.parse('SELECT * FROM', new GenericDialect());
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ParserError);
      }
    });
  });

  describe('Parser instance with options', () => {
    it('should respect recursion limit', async () => {
      const parser = new Parser(new GenericDialect()).withRecursionLimit(10);
      const statements = await parser.parseAsync('SELECT 1');
      expect(statements).toHaveLength(1);
    });

    it('should chain options', async () => {
      const parser = new Parser(new PostgreSqlDialect())
        .withRecursionLimit(50)
        .withOptions({ trailingCommas: true });

      const statements = await parser.parseAsync('SELECT 1');
      expect(statements).toHaveLength(1);
    });
  });
});

describe('Dialects', () => {
  describe('dialectFromString', () => {
    it('should create dialect from string', () => {
      const dialect = dialectFromString('postgresql');
      expect(dialect).toBeDefined();
      expect(dialect?.name).toBe('postgresql');
    });

    it('should handle aliases', () => {
      const pgDialect = dialectFromString('postgres');
      expect(pgDialect?.name).toBe('postgresql');

      const mssqlDialect = dialectFromString('sqlserver');
      expect(mssqlDialect?.name).toBe('mssql');
    });

    it('should return undefined for unknown dialect', () => {
      const dialect = dialectFromString('unknown_dialect');
      expect(dialect).toBeUndefined();
    });

    it('should be case-insensitive', () => {
      const dialect = dialectFromString('PostgreSQL');
      expect(dialect).toBeDefined();
      expect(dialect?.name).toBe('postgresql');
    });
  });

  describe('SUPPORTED_DIALECTS', () => {
    it('should contain all supported dialects', () => {
      expect(SUPPORTED_DIALECTS).toContain('generic');
      expect(SUPPORTED_DIALECTS).toContain('postgresql');
      expect(SUPPORTED_DIALECTS).toContain('mysql');
      expect(SUPPORTED_DIALECTS).toContain('sqlite');
      expect(SUPPORTED_DIALECTS).toContain('bigquery');
      expect(SUPPORTED_DIALECTS).toContain('snowflake');
    });
  });
});

describe('Complex SQL parsing', () => {
  it('should parse JOIN queries', async () => {
    const statements = await Parser.parse(
      `SELECT u.id, u.name, o.order_id
       FROM users u
       LEFT JOIN orders o ON u.id = o.user_id
       WHERE o.status = 'active'`,
      new GenericDialect()
    );
    expect(statements).toHaveLength(1);
  });

  it('should parse subqueries', async () => {
    const statements = await Parser.parse(
      `SELECT * FROM users WHERE id IN (SELECT user_id FROM orders)`,
      new GenericDialect()
    );
    expect(statements).toHaveLength(1);
  });

  it('should parse CTEs', async () => {
    const statements = await Parser.parse(
      `WITH active_users AS (
         SELECT * FROM users WHERE status = 'active'
       )
       SELECT * FROM active_users`,
      new GenericDialect()
    );
    expect(statements).toHaveLength(1);
  });

  it('should parse window functions', async () => {
    const statements = await Parser.parse(
      `SELECT id, name,
              ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as rank
       FROM employees`,
      new GenericDialect()
    );
    expect(statements).toHaveLength(1);
  });

  it('should parse CASE expressions', async () => {
    const statements = await Parser.parse(
      `SELECT id,
              CASE WHEN status = 'active' THEN 1
                   WHEN status = 'inactive' THEN 0
                   ELSE -1
              END as status_code
       FROM users`,
      new GenericDialect()
    );
    expect(statements).toHaveLength(1);
  });

  it('should parse UNION queries', async () => {
    const statements = await Parser.parse(
      `SELECT id, name FROM users
       UNION ALL
       SELECT id, name FROM archived_users`,
      new GenericDialect()
    );
    expect(statements).toHaveLength(1);
  });

  it('should parse GROUP BY with HAVING', async () => {
    const statements = await Parser.parse(
      `SELECT department, COUNT(*) as count
       FROM employees
       GROUP BY department
       HAVING COUNT(*) > 5
       ORDER BY count DESC`,
      new GenericDialect()
    );
    expect(statements).toHaveLength(1);
  });
});
