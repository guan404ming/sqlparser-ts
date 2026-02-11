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
  isQuery,
  isInsert,
  isUpdate,
  isDelete,
} from './test-utils';

describe('Parser', () => {
  describe('basic parsing', () => {
    test('parses simple SELECT', () => {
      const stmt = parseOne('SELECT 1');
      expect(isQuery(stmt)).toBe(true);
    });

    test('parses SELECT with FROM', () => {
      const stmt = parseOne('SELECT * FROM users');
      expect(isQuery(stmt)).toBe(true);
    });

    test('parses SELECT with WHERE', () => {
      const stmt = parseOne('SELECT * FROM users WHERE id = 1');
      expect(isQuery(stmt)).toBe(true);
    });

    test('parses multiple statements', () => {
      const statements = parse('SELECT 1; SELECT 2; SELECT 3');
      expect(statements).toHaveLength(3);
    });

    test('parses INSERT', () => {
      const stmt = parseOne('INSERT INTO users (name) VALUES (\'test\')');
      expect(isInsert(stmt)).toBe(true);
    });

    test('parses UPDATE', () => {
      const stmt = parseOne('UPDATE users SET name = \'test\' WHERE id = 1');
      expect(isUpdate(stmt)).toBe(true);
    });

    test('parses DELETE', () => {
      const stmt = parseOne('DELETE FROM users WHERE id = 1');
      expect(isDelete(stmt)).toBe(true);
    });
  });

  describe('format', () => {
    test('formats SELECT statement', () => {
      const formatted = format('select   *   from   users');
      expect(formatted).toBe('SELECT * FROM users');
    });

    test('formats complex SELECT', () => {
      const formatted = format(
        'select a,b,c from t1 join t2 on t1.id=t2.id where a>1'
      );
      expect(formatted).toContain('SELECT');
      expect(formatted).toContain('JOIN');
    });
  });

  describe('validate', () => {
    test('validates correct SQL', () => {
      const isValid = validate('SELECT * FROM users');
      expect(isValid).toBe(true);
    });

    test('rejects invalid SQL', () => {
      expect(() => validate('SELEC * FROM')).toThrow();
    });
  });

  describe('error handling', () => {
    test('throws on invalid SQL', () => {
      const error = expectParseError('SELECT * FORM users');
      expect(error).toBeDefined();
    });

    test('throws on incomplete SQL', () => {
      const error = expectParseError('SELECT');
      expect(error).toBeDefined();
    });

    test('throws on unmatched parentheses', () => {
      const error = expectParseError('SELECT (1 + 2');
      expect(error).toBeDefined();
    });
  });

  describe('dialect-specific parsing', () => {
    test('parses MySQL backtick identifiers', () => {
      const stmt = parseOne('SELECT `column` FROM `table`', dialects.mysql);
      expect(isQuery(stmt)).toBe(true);
    });

    test('parses PostgreSQL double-colon cast', () => {
      const stmt = parseOne('SELECT 1::INTEGER', dialects.postgresql);
      expect(isQuery(stmt)).toBe(true);
    });

    test('parses MSSQL square bracket identifiers', () => {
      const stmt = parseOne('SELECT [column] FROM [table]', dialects.mssql);
      expect(isQuery(stmt)).toBe(true);
    });

    test('parses BigQuery backtick identifiers', () => {
      const stmt = parseOne('SELECT * FROM `project.dataset.table`', dialects.bigquery);
      expect(isQuery(stmt)).toBe(true);
    });
  });
});

describe('Numeric Literals', () => {
  test('parses integer', () => {
    parseOne('SELECT 123');
  });

  test('parses decimal', () => {
    parseOne('SELECT 123.456');
  });

  test('parses scientific notation', () => {
    parseOne('SELECT 1e10');
    parseOne('SELECT 1E10');
    parseOne('SELECT 1e-10');
    parseOne('SELECT 1.5e+10');
  });

  test('parses negative numbers', () => {
    parseOne('SELECT -123');
    parseOne('SELECT -123.456');
  });
});

describe('String Literals', () => {
  test('parses single-quoted strings', () => {
    parseOne("SELECT 'hello'");
  });

  test('parses escaped single quotes', () => {
    parseOne("SELECT 'it''s a test'");
  });

  test('parses empty string', () => {
    parseOne("SELECT ''");
  });
});

describe('Identifiers', () => {
  test('parses simple identifiers', () => {
    parseOne('SELECT foo FROM bar');
  });

  test('parses qualified identifiers', () => {
    parseOne('SELECT schema.table.column FROM schema.table');
  });

  test('parses identifiers with underscores', () => {
    parseOne('SELECT my_column FROM my_table');
  });

  test('parses identifiers starting with underscore', () => {
    parseOne('SELECT _private FROM _table');
  });
});

describe('Comments', () => {
  test('parses single-line comment', () => {
    parseOne('SELECT 1 -- this is a comment');
  });

  test('parses multi-line comment', () => {
    parseOne('SELECT /* comment */ 1');
  });

  test('parses nested comments in some dialects', () => {
    // PostgreSQL and some other dialects support nested comments
    parseOne('SELECT /* outer /* inner */ outer */ 1', dialects.postgresql);
  });
});

describe('Whitespace handling', () => {
  test('handles extra whitespace', () => {
    parseOne('SELECT   1   FROM   t');
  });

  test('handles newlines', () => {
    parseOne('SELECT\n1\nFROM\nt');
  });

  test('handles tabs', () => {
    parseOne('SELECT\t1\tFROM\tt');
  });
});

describe('Case sensitivity', () => {
  test('keywords are case-insensitive', () => {
    parseOne('select * from users');
    parseOne('SELECT * FROM users');
    parseOne('Select * From Users');
  });

  test('identifiers preserve case', () => {
    const formatted = format('SELECT MyColumn FROM MyTable');
    expect(formatted).toContain('MyColumn');
    expect(formatted).toContain('MyTable');
  });
});
