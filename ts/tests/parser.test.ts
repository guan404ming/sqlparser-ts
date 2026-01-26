/**
 * Basic parser tests
 * Tests core parser functionality across dialects
 */

import {
  parse,
  parseOne,
  format,
  validate,
  expectParseError,
  dialects,
  ensureWasmInitialized,
  isQuery,
  isInsert,
  isUpdate,
  isDelete,
} from './test-utils';

beforeAll(async () => {
  await ensureWasmInitialized();
});

describe('Parser', () => {
  describe('basic parsing', () => {
    test('parses simple SELECT', async () => {
      const stmt = await parseOne('SELECT 1');
      expect(isQuery(stmt)).toBe(true);
    });

    test('parses SELECT with FROM', async () => {
      const stmt = await parseOne('SELECT * FROM users');
      expect(isQuery(stmt)).toBe(true);
    });

    test('parses SELECT with WHERE', async () => {
      const stmt = await parseOne('SELECT * FROM users WHERE id = 1');
      expect(isQuery(stmt)).toBe(true);
    });

    test('parses multiple statements', async () => {
      const statements = await parse('SELECT 1; SELECT 2; SELECT 3');
      expect(statements).toHaveLength(3);
    });

    test('parses INSERT', async () => {
      const stmt = await parseOne('INSERT INTO users (name) VALUES (\'test\')');
      expect(isInsert(stmt)).toBe(true);
    });

    test('parses UPDATE', async () => {
      const stmt = await parseOne('UPDATE users SET name = \'test\' WHERE id = 1');
      expect(isUpdate(stmt)).toBe(true);
    });

    test('parses DELETE', async () => {
      const stmt = await parseOne('DELETE FROM users WHERE id = 1');
      expect(isDelete(stmt)).toBe(true);
    });
  });

  describe('format', () => {
    test('formats SELECT statement', async () => {
      const formatted = await format('select   *   from   users');
      expect(formatted).toBe('SELECT * FROM users');
    });

    test('formats complex SELECT', async () => {
      const formatted = await format(
        'select a,b,c from t1 join t2 on t1.id=t2.id where a>1'
      );
      expect(formatted).toContain('SELECT');
      expect(formatted).toContain('JOIN');
    });
  });

  describe('validate', () => {
    test('validates correct SQL', async () => {
      const isValid = await validate('SELECT * FROM users');
      expect(isValid).toBe(true);
    });

    test('rejects invalid SQL', async () => {
      await expect(validate('SELEC * FROM')).rejects.toThrow();
    });
  });

  describe('error handling', () => {
    test('throws on invalid SQL', async () => {
      const error = await expectParseError('SELECT * FORM users');
      expect(error).toBeDefined();
    });

    test('throws on incomplete SQL', async () => {
      const error = await expectParseError('SELECT');
      expect(error).toBeDefined();
    });

    test('throws on unmatched parentheses', async () => {
      const error = await expectParseError('SELECT (1 + 2');
      expect(error).toBeDefined();
    });
  });

  describe('dialect-specific parsing', () => {
    test('parses MySQL backtick identifiers', async () => {
      const stmt = await parseOne('SELECT `column` FROM `table`', dialects.mysql);
      expect(isQuery(stmt)).toBe(true);
    });

    test('parses PostgreSQL double-colon cast', async () => {
      const stmt = await parseOne('SELECT 1::INTEGER', dialects.postgresql);
      expect(isQuery(stmt)).toBe(true);
    });

    test('parses MSSQL square bracket identifiers', async () => {
      const stmt = await parseOne('SELECT [column] FROM [table]', dialects.mssql);
      expect(isQuery(stmt)).toBe(true);
    });

    test('parses BigQuery backtick identifiers', async () => {
      const stmt = await parseOne('SELECT * FROM `project.dataset.table`', dialects.bigquery);
      expect(isQuery(stmt)).toBe(true);
    });
  });
});

describe('Numeric Literals', () => {
  test('parses integer', async () => {
    await parseOne('SELECT 123');
  });

  test('parses decimal', async () => {
    await parseOne('SELECT 123.456');
  });

  test('parses scientific notation', async () => {
    await parseOne('SELECT 1e10');
    await parseOne('SELECT 1E10');
    await parseOne('SELECT 1e-10');
    await parseOne('SELECT 1.5e+10');
  });

  test('parses negative numbers', async () => {
    await parseOne('SELECT -123');
    await parseOne('SELECT -123.456');
  });
});

describe('String Literals', () => {
  test('parses single-quoted strings', async () => {
    await parseOne("SELECT 'hello'");
  });

  test('parses escaped single quotes', async () => {
    await parseOne("SELECT 'it''s a test'");
  });

  test('parses empty string', async () => {
    await parseOne("SELECT ''");
  });
});

describe('Identifiers', () => {
  test('parses simple identifiers', async () => {
    await parseOne('SELECT foo FROM bar');
  });

  test('parses qualified identifiers', async () => {
    await parseOne('SELECT schema.table.column FROM schema.table');
  });

  test('parses identifiers with underscores', async () => {
    await parseOne('SELECT my_column FROM my_table');
  });

  test('parses identifiers starting with underscore', async () => {
    await parseOne('SELECT _private FROM _table');
  });
});

describe('Comments', () => {
  test('parses single-line comment', async () => {
    await parseOne('SELECT 1 -- this is a comment');
  });

  test('parses multi-line comment', async () => {
    await parseOne('SELECT /* comment */ 1');
  });

  test('parses nested comments in some dialects', async () => {
    // PostgreSQL and some other dialects support nested comments
    await parseOne('SELECT /* outer /* inner */ outer */ 1', dialects.postgresql);
  });
});

describe('Whitespace handling', () => {
  test('handles extra whitespace', async () => {
    await parseOne('SELECT   1   FROM   t');
  });

  test('handles newlines', async () => {
    await parseOne('SELECT\n1\nFROM\nt');
  });

  test('handles tabs', async () => {
    await parseOne('SELECT\t1\tFROM\tt');
  });
});

describe('Case sensitivity', () => {
  test('keywords are case-insensitive', async () => {
    await parseOne('select * from users');
    await parseOne('SELECT * FROM users');
    await parseOne('Select * From Users');
  });

  test('identifiers preserve case', async () => {
    const formatted = await format('SELECT MyColumn FROM MyTable');
    expect(formatted).toContain('MyColumn');
    expect(formatted).toContain('MyTable');
  });
});
