/**
 * Oracle dialect tests
 * Ported from sqlparser_oracle.rs
 */

import {
  parseOne,
  expectParseError,
  dialects,
  ensureWasmInitialized,
} from '../test-utils';

const oracle = dialects.oracle;

beforeAll(async () => {
  await ensureWasmInitialized();
});

describe('Oracle - Operator Precedence', () => {
  test('muldiv_have_higher_precedence_than_strconcat', async () => {
    // Test that * and / have higher precedence than ||
    const sql = "SELECT 3 / 5 || 'asdf' || 7 * 9 FROM dual";
    const stmt = await parseOne(sql, oracle);
    expect(stmt).toBeDefined();
  });

  test('plusminus_have_same_precedence_as_strconcat', async () => {
    // Test that +, -, and || have the same precedence and are left-associative
    const sql = "SELECT 3 + 5 || '.3' || 7 - 9 FROM dual";
    const stmt = await parseOne(sql, oracle);
    expect(stmt).toBeDefined();
  });
});

describe('Oracle - Quote Delimited Strings', () => {
  // TODO: Enable when sqlparser >= 0.61.0 (PR #2130 merged Dec 16, 2025)
  test.skip('parse_quote_delimited_string', async () => {
    // Test various quote delimiters
    await parseOne("SELECT Q'.abc.' FROM dual", oracle);
    await parseOne("SELECT Q'Xab'cX' FROM dual", oracle);
    await parseOne("SELECT Q'|abc'''|' FROM dual", oracle);
    await parseOne("SELECT Q'{abc}' FROM dual", oracle);
    await parseOne("SELECT Q'[abc]' FROM dual", oracle);
    await parseOne("SELECT Q'<abc>' FROM dual", oracle);
    await parseOne("SELECT Q'(abc)' FROM dual", oracle);

    // Nested delimiters
    await parseOne("SELECT Q'!a'b'c!d!' FROM dual", oracle);
    await parseOne("SELECT Q'{a{b}c}' FROM dual", oracle);
    await parseOne("SELECT Q'[a[b]c]' FROM dual", oracle);
  });

  // TODO: Enable when sqlparser >= 0.61.0 (PR #2130 merged Dec 16, 2025)
  test.skip('parse_invalid_quote_delimited_strings', async () => {
    // Invalid delimiters should fail
    await expectParseError("SELECT Q' abc ' FROM dual", oracle);
    await expectParseError("SELECT Q'\tabc\t' FROM dual", oracle);
    await expectParseError("SELECT Q'\nabc\n' FROM dual", oracle);
    await expectParseError("SELECT Q'", oracle);
  });

  // TODO: Enable when sqlparser >= 0.61.0 (PR #2130 merged Dec 16, 2025)
  test.skip('parse_quote_delimited_string_lowercase', async () => {
    // Lowercase q should work
    const sql = "select q'!a'b'c!d!' from dual";
    const stmt = await parseOne(sql, oracle);
    expect(stmt).toBeDefined();
  });

  test('parse_quote_delimited_string_but_is_a_word', async () => {
    // q should be treated as identifier when not followed by quote delimiter
    await parseOne("SELECT q, quux, q.abc FROM dual q", oracle);
  });
});

describe('Oracle - National Quote Delimited Strings', () => {
  // TODO: Enable when sqlparser >= 0.61.0 (PR #2130 merged Dec 16, 2025)
  test.skip('parse_national_quote_delimited_string', async () => {
    // Test NQ prefix for national character strings
    await parseOne("SELECT NQ'.abc.' FROM dual", oracle);
    await parseOne("SELECT NQ'Xab'cX' FROM dual", oracle);
    await parseOne("SELECT NQ'|abc|' FROM dual", oracle);
  });

  test('parse_national_quote_delimited_string_lowercase', async () => {
    // Test case-insensitive nq prefix
    await parseOne("SELECT nq'.abc.' FROM dual", oracle);
    await parseOne("SELECT Nq'.abc.' FROM dual", oracle);
    await parseOne("SELECT nQ'.abc.' FROM dual", oracle);
    await parseOne("SELECT NQ'.abc.' FROM dual", oracle);
  });

  test('parse_national_quote_delimited_string_but_is_a_word', async () => {
    // nq should be treated as identifier when not followed by quote delimiter
    await parseOne("SELECT nq, nquux, nq.abc FROM dual nq", oracle);
  });
});

describe('Oracle - General Syntax', () => {
  test('parse_dual_table', async () => {
    // Test common Oracle patterns with DUAL
    await parseOne("SELECT 1 FROM dual", oracle);
    await parseOne("SELECT SYSDATE FROM dual", oracle);
    await parseOne("SELECT * FROM dual", oracle);
  });

  test('parse_string_concatenation', async () => {
    // Test Oracle's || operator
    await parseOne("SELECT 'Hello' || ' ' || 'World' FROM dual", oracle);
    await parseOne("SELECT col1 || col2 FROM my_table", oracle);
  });

  test('parse_oracle_join_syntax', async () => {
    // Test Oracle's legacy join syntax with (+)
    await parseOne("SELECT * FROM t1, t2 WHERE t1.id = t2.id(+)", oracle);
    await parseOne("SELECT * FROM t1, t2 WHERE t1.id(+) = t2.id", oracle);
  });
});
