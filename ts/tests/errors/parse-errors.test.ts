import { Parser, GenericDialect, ParserError } from '../../src';

const dialect = new GenericDialect();

describe('Parse Errors', () => {
  describe('syntax errors', () => {
    it('throws on invalid keyword', async () => {
      await expect(Parser.parse('SELEC * FROM users', dialect)).rejects.toThrow();
    });

    it('throws on incomplete statement', async () => {
      await expect(Parser.parse('SELECT * FROM', dialect)).rejects.toThrow();
    });

    it('throws on missing FROM keyword', async () => {
      await expect(Parser.parse('SELECT * users', dialect)).rejects.toThrow();
    });

    it('throws on unmatched parenthesis', async () => {
      await expect(Parser.parse('SELECT * FROM users WHERE (id = 1', dialect)).rejects.toThrow();
    });

    it('throws on invalid operator', async () => {
      await expect(Parser.parse('SELECT * FROM users WHERE id === 1', dialect)).rejects.toThrow();
    });
  });

  describe('ParserError', () => {
    it('is instance of ParserError', async () => {
      try {
        await Parser.parse('INVALID SQL', dialect);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ParserError);
      }
    });

    it('has error message', async () => {
      try {
        await Parser.parse('SELEC * FROM users', dialect);
        fail('Should have thrown');
      } catch (error) {
        expect((error as ParserError).message).toBeTruthy();
        expect((error as ParserError).message.length).toBeGreaterThan(0);
      }
    });
  });

  describe('edge cases', () => {
    it('handles empty string', async () => {
      const result = await Parser.parse('', dialect);
      expect(result).toHaveLength(0);
    });

    it('handles whitespace only', async () => {
      const result = await Parser.parse('   \n\t  ', dialect);
      expect(result).toHaveLength(0);
    });

    it('handles comments only', async () => {
      const result = await Parser.parse('-- this is a comment', dialect);
      expect(result).toHaveLength(0);
    });

    it('handles multiple semicolons', async () => {
      const result = await Parser.parse('SELECT 1;;;SELECT 2', dialect);
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('handles very long SQL', async () => {
      const columns = Array.from({ length: 100 }, (_, i) => `col${i}`).join(', ');
      const sql = `SELECT ${columns} FROM users`;
      const result = await Parser.parse(sql, dialect);
      expect(result).toHaveLength(1);
    });

    it('handles unicode', async () => {
      const result = await Parser.parse("SELECT * FROM users WHERE name = '你好'", dialect);
      expect(result).toHaveLength(1);
    });

    it('handles special characters in strings', async () => {
      const result = await Parser.parse("SELECT * FROM users WHERE name = 'O''Brien'", dialect);
      expect(result).toHaveLength(1);
    });
  });

  describe('validate', () => {
    it('returns true for valid SQL', async () => {
      const isValid = await Parser.validate('SELECT 1', dialect);
      expect(isValid).toBe(true);
    });

    it('throws for invalid SQL', async () => {
      await expect(Parser.validate('INVALID', dialect)).rejects.toThrow();
    });
  });
});
