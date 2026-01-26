/**
 * Common SQL parser tests
 * Tests SQL features that work across multiple dialects
 * Ported from sqlparser_common.rs
 */

import {
  parse,
  parseOne,
  format,
  expectParseError,
  dialects,
  ensureWasmInitialized,
  isQuery,
  isInsert,
  isUpdate,
  isDelete,
  isCreateTable,
  isCreateView,
  isDrop,
  isTruncate,
} from '../test-utils';

beforeAll(async () => {
  await ensureWasmInitialized();
});

describe('Common SQL - INSERT', () => {
  test('parse_insert_values', async () => {
    await parseOne('INSERT INTO customer VALUES (1, 2, 3)');
    await parseOne("INSERT INTO customer VALUES (1, 2, 3), (4, 5, 6), ('a', 'b', 'c')");
    await parseOne('INSERT INTO public.customer VALUES (1, 2, 3)');
  });

  test('parse_insert_into', async () => {
    const stmt = await parseOne('INSERT INTO customer (id, name) VALUES (1, \'test\')');
    expect(isInsert(stmt)).toBe(true);
  });

  test('parse_insert_default_values', async () => {
    await parseOne('INSERT INTO test_table DEFAULT VALUES');
  });

  test('parse_insert_select', async () => {
    await parseOne('INSERT INTO t SELECT 1');
    await parseOne('INSERT INTO t SELECT * FROM other_table');
    await parseOne('INSERT INTO t (a, b) SELECT c, d FROM other_table');
  });

  test('parse_insert_returning', async () => {
    await parseOne('INSERT INTO t VALUES (1) RETURNING *', dialects.postgresql);
    await parseOne('INSERT INTO t VALUES (1) RETURNING id', dialects.postgresql);
    await parseOne('INSERT INTO t VALUES (1) RETURNING id AS new_id', dialects.postgresql);
  });
});

describe('Common SQL - UPDATE', () => {
  test('parse_update', async () => {
    await parseOne('UPDATE t SET a = 1');
    await parseOne('UPDATE t SET a = 1, b = 2');
    await parseOne('UPDATE t SET a = 1, b = 2, c = 3 WHERE d');
  });

  test('parse_update_with_table_alias', async () => {
    await parseOne("UPDATE users AS u SET u.username = 'new_user' WHERE u.id = 1");
  });

  test('parse_update_set_from', async () => {
    await parseOne(
      'UPDATE t1 SET name = t2.name FROM (SELECT name FROM t2) AS t2 WHERE t1.id = t2.id',
      dialects.postgresql
    );
  });
});

describe('Common SQL - DELETE', () => {
  test('parse_delete_statement', async () => {
    const stmt = await parseOne('DELETE FROM "table"');
    expect(isDelete(stmt)).toBe(true);
  });

  test('parse_where_delete_statement', async () => {
    await parseOne('DELETE FROM foo WHERE name = 5');
  });

  test('parse_delete_with_alias', async () => {
    await parseOne(
      'DELETE FROM basket AS a USING basket AS b WHERE a.id > b.id',
      dialects.postgresql
    );
  });
});

describe('Common SQL - SELECT basics', () => {
  test('parse_simple_select', async () => {
    await parseOne('SELECT id, fname, lname FROM customer WHERE id = 1 LIMIT 5');
  });

  test('parse_select_distinct', async () => {
    await parseOne('SELECT DISTINCT name FROM customer');
  });

  test('parse_select_distinct_two_fields', async () => {
    await parseOne('SELECT DISTINCT name, id FROM customer');
  });

  test('parse_select_all', async () => {
    await parseOne('SELECT ALL name FROM customer');
  });

  test('parse_select_wildcard', async () => {
    await parseOne('SELECT * FROM foo');
    await parseOne('SELECT foo.* FROM foo');
    await parseOne('SELECT schema.foo.* FROM schema.foo');
  });

  test('parse_count_wildcard', async () => {
    await parseOne('SELECT COUNT(*) FROM customer');
    await parseOne('SELECT COUNT(Employee.*) FROM Employee');
  });

  test('parse_select_count_distinct', async () => {
    await parseOne('SELECT COUNT(DISTINCT +x) FROM t');
    await parseOne('SELECT COUNT(ALL +x) FROM t');
  });
});

describe('Common SQL - SELECT clauses', () => {
  test('parse_select_order_by', async () => {
    await parseOne('SELECT id FROM customer ORDER BY id');
    await parseOne('SELECT id FROM customer ORDER BY id ASC');
    await parseOne('SELECT id FROM customer ORDER BY id DESC');
    await parseOne('SELECT id FROM customer ORDER BY id ASC, name DESC');
  });

  test('parse_select_order_by_nulls', async () => {
    await parseOne('SELECT id FROM customer ORDER BY id NULLS FIRST');
    await parseOne('SELECT id FROM customer ORDER BY id NULLS LAST');
    await parseOne('SELECT id FROM customer ORDER BY id ASC NULLS FIRST');
  });

  test('parse_select_order_by_limit', async () => {
    await parseOne('SELECT id FROM customer ORDER BY id LIMIT 5');
    await parseOne('SELECT id FROM customer ORDER BY id LIMIT 5 OFFSET 10');
  });

  test('parse_select_group_by', async () => {
    await parseOne('SELECT lname, fname FROM customer GROUP BY lname, fname');
  });

  test('parse_select_having', async () => {
    await parseOne('SELECT foo FROM t GROUP BY foo HAVING COUNT(*) > 1');
  });

  test('parse_limit_offset', async () => {
    await parseOne('SELECT * FROM t LIMIT 10');
    await parseOne('SELECT * FROM t LIMIT 10 OFFSET 5');
    await parseOne('SELECT * FROM t OFFSET 5');
  });

  test('parse_fetch', async () => {
    await parseOne('SELECT * FROM t FETCH FIRST 5 ROWS ONLY');
    await parseOne('SELECT * FROM t FETCH NEXT 5 ROWS ONLY');
    await parseOne('SELECT * FROM t OFFSET 10 ROWS FETCH FIRST 5 ROWS ONLY');
  });
});

describe('Common SQL - SELECT INTO', () => {
  test('parse_select_into', async () => {
    await parseOne('SELECT * INTO table0 FROM table1');
    await parseOne('SELECT * INTO TEMPORARY table0 FROM table1');
  });
});

describe('Common SQL - Expressions', () => {
  test('parse_compound_expr', async () => {
    await parseOne('SELECT a + b * c FROM t');
    await parseOne('SELECT a * b + c FROM t');
    await parseOne('SELECT a + b + c FROM t');
  });

  test('parse_unary_math', async () => {
    await parseOne('SELECT -a FROM t');
    await parseOne('SELECT +a FROM t');
    await parseOne('SELECT -a + -b FROM t');
    await parseOne('SELECT -a * -b FROM t');
  });

  test('parse_mod', async () => {
    await parseOne('SELECT a % b FROM t');
  });

  test('parse_is_null', async () => {
    await parseOne('SELECT a FROM t WHERE a IS NULL');
    await parseOne('SELECT a FROM t WHERE a IS NOT NULL');
  });

  test('parse_is_boolean', async () => {
    await parseOne('SELECT a FROM t WHERE a IS TRUE');
    await parseOne('SELECT a FROM t WHERE a IS FALSE');
    await parseOne('SELECT a FROM t WHERE a IS NOT TRUE');
    await parseOne('SELECT a FROM t WHERE a IS NOT FALSE');
    await parseOne('SELECT a FROM t WHERE a IS UNKNOWN');
    await parseOne('SELECT a FROM t WHERE a IS NOT UNKNOWN');
  });

  test('parse_is_distinct_from', async () => {
    await parseOne('SELECT a FROM t WHERE a IS DISTINCT FROM b');
    await parseOne('SELECT a FROM t WHERE a IS NOT DISTINCT FROM b');
  });

  test('parse_between', async () => {
    await parseOne('SELECT a FROM t WHERE age BETWEEN 25 AND 32');
    await parseOne('SELECT a FROM t WHERE age NOT BETWEEN 25 AND 32');
  });

  test('parse_like', async () => {
    await parseOne("SELECT a FROM t WHERE name LIKE '%a'");
    await parseOne("SELECT a FROM t WHERE name NOT LIKE '%a'");
    await parseOne("SELECT a FROM t WHERE name LIKE '%a' ESCAPE '\\\\'");
  });

  test('parse_ilike', async () => {
    await parseOne("SELECT a FROM t WHERE name ILIKE '%a'", dialects.postgresql);
    await parseOne("SELECT a FROM t WHERE name NOT ILIKE '%a'", dialects.postgresql);
  });

  test('parse_similar_to', async () => {
    await parseOne("SELECT a FROM t WHERE name SIMILAR TO '%a'", dialects.postgresql);
    await parseOne("SELECT a FROM t WHERE name NOT SIMILAR TO '%a'", dialects.postgresql);
  });

  test('parse_in_list', async () => {
    await parseOne("SELECT a FROM t WHERE segment IN ('HIGH', 'MED')");
    await parseOne("SELECT a FROM t WHERE segment NOT IN ('HIGH', 'MED')");
  });

  test('parse_in_subquery', async () => {
    await parseOne('SELECT a FROM t WHERE segment IN (SELECT segm FROM bar)');
    await parseOne('SELECT a FROM t WHERE segment NOT IN (SELECT segm FROM bar)');
  });

  test('parse_tuple', async () => {
    await parseOne('SELECT (1, 2) FROM t');
    await parseOne('SELECT (1) FROM t');
    await parseOne('SELECT (1, 2, 3) = (a, b, c) FROM t');
  });
});

describe('Common SQL - Type Casting', () => {
  test('parse_cast', async () => {
    await parseOne('SELECT CAST(id AS BIGINT) FROM t');
    await parseOne('SELECT CAST(id AS VARCHAR(255)) FROM t');
    await parseOne("SELECT CAST('2023-01-01' AS DATE) FROM t");
  });

  test('parse_try_cast', async () => {
    await parseOne('SELECT TRY_CAST(id AS BIGINT) FROM t');
  });

  test('parse_safe_cast', async () => {
    await parseOne('SELECT SAFE_CAST(id AS INT64) FROM t', dialects.bigquery);
  });
});

describe('Common SQL - Functions', () => {
  test('parse_aggregate_functions', async () => {
    await parseOne('SELECT COUNT(*) FROM t');
    await parseOne('SELECT SUM(amount) FROM t');
    await parseOne('SELECT AVG(amount) FROM t');
    await parseOne('SELECT MIN(amount) FROM t');
    await parseOne('SELECT MAX(amount) FROM t');
  });

  test('parse_function_with_args', async () => {
    await parseOne('SELECT CONCAT(a, b, c) FROM t');
    await parseOne('SELECT SUBSTRING(name, 1, 3) FROM t');
  });

  test('parse_function_schema_qualified', async () => {
    await parseOne('SELECT schema.func(1) FROM t');
    await parseOne('SELECT a.b.c.d(1, 2, 3) FROM t');
  });

  test('parse_extract', async () => {
    await parseOne('SELECT EXTRACT(YEAR FROM date_col) FROM t');
    await parseOne('SELECT EXTRACT(MONTH FROM date_col) FROM t');
    await parseOne('SELECT EXTRACT(DAY FROM date_col) FROM t');
    await parseOne('SELECT EXTRACT(HOUR FROM timestamp_col) FROM t');
  });

  test('parse_trim', async () => {
    await parseOne("SELECT TRIM('  hello  ') FROM t");
    await parseOne("SELECT TRIM(LEADING ' ' FROM '  hello  ') FROM t");
    await parseOne("SELECT TRIM(TRAILING ' ' FROM '  hello  ') FROM t");
    await parseOne("SELECT TRIM(BOTH ' ' FROM '  hello  ') FROM t");
  });

  test('parse_substring', async () => {
    await parseOne('SELECT SUBSTRING(name FROM 1 FOR 3) FROM t');
    await parseOne('SELECT SUBSTRING(name FROM 1) FROM t');
    await parseOne('SELECT SUBSTRING(name, 1, 3) FROM t');
  });

  test('parse_coalesce', async () => {
    await parseOne('SELECT COALESCE(a, b, c) FROM t');
  });

  test('parse_nullif', async () => {
    await parseOne('SELECT NULLIF(a, b) FROM t');
  });
});

describe('Common SQL - CASE Expression', () => {
  test('parse_case_simple', async () => {
    await parseOne("SELECT CASE status WHEN 1 THEN 'active' ELSE 'inactive' END FROM t");
  });

  test('parse_case_searched', async () => {
    await parseOne("SELECT CASE WHEN status = 1 THEN 'active' ELSE 'inactive' END FROM t");
  });

  test('parse_case_multiple_when', async () => {
    await parseOne(
      "SELECT CASE WHEN a = 1 THEN 'one' WHEN a = 2 THEN 'two' ELSE 'other' END FROM t"
    );
  });

  test('parse_case_no_else', async () => {
    await parseOne("SELECT CASE WHEN a = 1 THEN 'one' END FROM t");
  });
});

describe('Common SQL - Subqueries', () => {
  test('parse_scalar_subquery', async () => {
    await parseOne('SELECT (SELECT MAX(id) FROM t2) FROM t1');
  });

  test('parse_exists', async () => {
    await parseOne('SELECT * FROM t1 WHERE EXISTS (SELECT 1 FROM t2)');
    await parseOne('SELECT * FROM t1 WHERE NOT EXISTS (SELECT 1 FROM t2)');
  });

  test('parse_derived_table', async () => {
    await parseOne('SELECT * FROM (SELECT 1, 2, 3) AS subq');
    await parseOne('SELECT * FROM (SELECT * FROM t) AS subq (a, b, c)');
  });
});

describe('Common SQL - JOINs', () => {
  test('parse_join', async () => {
    await parseOne('SELECT * FROM t1 JOIN t2 ON t1.id = t2.id');
    await parseOne('SELECT * FROM t1 INNER JOIN t2 ON t1.id = t2.id');
  });

  test('parse_left_join', async () => {
    await parseOne('SELECT * FROM t1 LEFT JOIN t2 ON t1.id = t2.id');
    await parseOne('SELECT * FROM t1 LEFT OUTER JOIN t2 ON t1.id = t2.id');
  });

  test('parse_right_join', async () => {
    await parseOne('SELECT * FROM t1 RIGHT JOIN t2 ON t1.id = t2.id');
    await parseOne('SELECT * FROM t1 RIGHT OUTER JOIN t2 ON t1.id = t2.id');
  });

  test('parse_full_join', async () => {
    await parseOne('SELECT * FROM t1 FULL JOIN t2 ON t1.id = t2.id');
    await parseOne('SELECT * FROM t1 FULL OUTER JOIN t2 ON t1.id = t2.id');
  });

  test('parse_cross_join', async () => {
    await parseOne('SELECT * FROM t1 CROSS JOIN t2');
  });

  test('parse_natural_join', async () => {
    await parseOne('SELECT * FROM t1 NATURAL JOIN t2');
    await parseOne('SELECT * FROM t1 NATURAL LEFT JOIN t2');
  });

  test('parse_join_using', async () => {
    await parseOne('SELECT * FROM t1 JOIN t2 USING (id)');
    await parseOne('SELECT * FROM t1 JOIN t2 USING (id, name)');
  });

  test('parse_multiple_joins', async () => {
    await parseOne(
      'SELECT * FROM t1 JOIN t2 ON t1.id = t2.id JOIN t3 ON t2.id = t3.id'
    );
  });
});

describe('Common SQL - Set Operations', () => {
  test('parse_union', async () => {
    await parseOne('SELECT 1 UNION SELECT 2');
    await parseOne('SELECT 1 UNION ALL SELECT 2');
    await parseOne('SELECT 1 UNION DISTINCT SELECT 2');
  });

  test('parse_intersect', async () => {
    await parseOne('SELECT 1 INTERSECT SELECT 2');
    await parseOne('SELECT 1 INTERSECT ALL SELECT 2');
  });

  test('parse_except', async () => {
    await parseOne('SELECT 1 EXCEPT SELECT 2');
    await parseOne('SELECT 1 EXCEPT ALL SELECT 2');
  });

  test('parse_multiple_set_ops', async () => {
    await parseOne('SELECT 1 UNION SELECT 2 UNION SELECT 3');
    await parseOne('SELECT 1 UNION SELECT 2 INTERSECT SELECT 3');
  });
});

describe('Common SQL - CTEs (WITH clause)', () => {
  test('parse_cte', async () => {
    await parseOne('WITH cte AS (SELECT 1) SELECT * FROM cte');
  });

  test('parse_multiple_ctes', async () => {
    await parseOne(
      'WITH cte1 AS (SELECT 1), cte2 AS (SELECT 2) SELECT * FROM cte1, cte2'
    );
  });

  test('parse_recursive_cte', async () => {
    await parseOne(
      'WITH RECURSIVE cte AS (SELECT 1 UNION ALL SELECT n + 1 FROM cte WHERE n < 10) SELECT * FROM cte'
    );
  });
});

describe('Common SQL - Window Functions', () => {
  test('parse_window_function', async () => {
    await parseOne('SELECT ROW_NUMBER() OVER () FROM t');
    await parseOne('SELECT RANK() OVER (ORDER BY id) FROM t');
    await parseOne('SELECT DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) FROM t');
  });

  test('parse_window_function_with_frame', async () => {
    await parseOne('SELECT SUM(amount) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) FROM t');
    await parseOne('SELECT AVG(amount) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) FROM t');
  });

  test('parse_named_window', async () => {
    await parseOne('SELECT SUM(amount) OVER w FROM t WINDOW w AS (PARTITION BY dept ORDER BY id)');
  });
});

describe('Common SQL - DDL', () => {
  test('parse_create_table', async () => {
    const stmt = await parseOne('CREATE TABLE t (id INT, name VARCHAR(255))');
    expect(isCreateTable(stmt)).toBe(true);
  });

  test('parse_create_table_if_not_exists', async () => {
    await parseOne('CREATE TABLE IF NOT EXISTS t (id INT)');
  });

  test('parse_create_table_primary_key', async () => {
    await parseOne('CREATE TABLE t (id INT PRIMARY KEY, name VARCHAR(255))');
    await parseOne('CREATE TABLE t (id INT, name VARCHAR(255), PRIMARY KEY (id))');
  });

  test('parse_create_table_foreign_key', async () => {
    await parseOne('CREATE TABLE t (id INT, parent_id INT REFERENCES parent(id))');
    await parseOne('CREATE TABLE t (id INT, parent_id INT, FOREIGN KEY (parent_id) REFERENCES parent(id))');
  });

  test('parse_create_table_not_null', async () => {
    await parseOne('CREATE TABLE t (id INT NOT NULL, name VARCHAR(255))');
  });

  test('parse_create_table_default', async () => {
    await parseOne('CREATE TABLE t (id INT DEFAULT 0, name VARCHAR(255) DEFAULT \'unnamed\')');
  });

  test('parse_create_table_unique', async () => {
    await parseOne('CREATE TABLE t (id INT UNIQUE, name VARCHAR(255))');
    await parseOne('CREATE TABLE t (id INT, name VARCHAR(255), UNIQUE (id))');
  });

  test('parse_create_table_check', async () => {
    await parseOne('CREATE TABLE t (id INT CHECK (id > 0), name VARCHAR(255))');
  });

  test('parse_create_view', async () => {
    const stmt = await parseOne('CREATE VIEW v AS SELECT * FROM t');
    expect(isCreateView(stmt)).toBe(true);
  });

  test('parse_create_or_replace_view', async () => {
    await parseOne('CREATE OR REPLACE VIEW v AS SELECT * FROM t');
  });

  test('parse_drop_table', async () => {
    const stmt = await parseOne('DROP TABLE t');
    expect(isDrop(stmt)).toBe(true);
  });

  test('parse_drop_table_if_exists', async () => {
    await parseOne('DROP TABLE IF EXISTS t');
  });

  test('parse_drop_table_cascade', async () => {
    await parseOne('DROP TABLE t CASCADE', dialects.postgresql);
  });

  test('parse_truncate', async () => {
    const stmt = await parseOne('TRUNCATE TABLE t');
    expect(isTruncate(stmt)).toBe(true);
  });
});

describe('Common SQL - ALTER TABLE', () => {
  test('parse_alter_table_add_column', async () => {
    await parseOne('ALTER TABLE t ADD COLUMN new_col INT');
    await parseOne('ALTER TABLE t ADD new_col INT');
  });

  test('parse_alter_table_drop_column', async () => {
    await parseOne('ALTER TABLE t DROP COLUMN old_col');
    await parseOne('ALTER TABLE t DROP old_col');
  });

  test('parse_alter_table_rename_column', async () => {
    await parseOne('ALTER TABLE t RENAME COLUMN old_name TO new_name');
  });

  test('parse_alter_table_rename_table', async () => {
    await parseOne('ALTER TABLE t RENAME TO new_name');
  });

  test('parse_alter_table_add_constraint', async () => {
    await parseOne('ALTER TABLE t ADD CONSTRAINT pk PRIMARY KEY (id)');
    await parseOne('ALTER TABLE t ADD CONSTRAINT fk FOREIGN KEY (parent_id) REFERENCES parent(id)');
  });

  test('parse_alter_table_drop_constraint', async () => {
    await parseOne('ALTER TABLE t DROP CONSTRAINT pk');
  });
});

describe('Common SQL - INDEX', () => {
  test('parse_create_index', async () => {
    await parseOne('CREATE INDEX idx ON t (col)');
    await parseOne('CREATE INDEX idx ON t (col1, col2)');
  });

  test('parse_create_unique_index', async () => {
    await parseOne('CREATE UNIQUE INDEX idx ON t (col)');
  });

  test('parse_create_index_if_not_exists', async () => {
    await parseOne('CREATE INDEX IF NOT EXISTS idx ON t (col)');
  });

  test('parse_drop_index', async () => {
    await parseOne('DROP INDEX idx');
  });
});

describe('Common SQL - Transactions', () => {
  test('parse_begin', async () => {
    await parseOne('BEGIN');
    await parseOne('BEGIN TRANSACTION');
    await parseOne('START TRANSACTION');
  });

  test('parse_commit', async () => {
    await parseOne('COMMIT');
    await parseOne('COMMIT TRANSACTION');
  });

  test('parse_rollback', async () => {
    await parseOne('ROLLBACK');
    await parseOne('ROLLBACK TRANSACTION');
  });

  test('parse_savepoint', async () => {
    await parseOne('SAVEPOINT sp1');
  });

  test('parse_rollback_to_savepoint', async () => {
    await parseOne('ROLLBACK TO SAVEPOINT sp1');
    await parseOne('ROLLBACK TO sp1');
  });

  test('parse_release_savepoint', async () => {
    await parseOne('RELEASE SAVEPOINT sp1');
    await parseOne('RELEASE sp1');
  });
});

describe('Common SQL - JSON Operations', () => {
  test('parse_json_arrow_operators', async () => {
    await parseOne("SELECT data->'key' FROM t", dialects.postgresql);
    await parseOne("SELECT data->>'key' FROM t", dialects.postgresql);
  });

  test('parse_json_object', async () => {
    await parseOne("SELECT JSON_OBJECT('name' : 'value')", dialects.postgresql);
  });
});

describe('Common SQL - Arrays', () => {
  test('parse_array_literal', async () => {
    await parseOne('SELECT ARRAY[1, 2, 3]', dialects.postgresql);
  });

  test('parse_array_subscript', async () => {
    await parseOne('SELECT arr[1] FROM t', dialects.postgresql);
    await parseOne('SELECT arr[1][2] FROM t', dialects.postgresql);
  });
});

describe('Common SQL - EXPLAIN', () => {
  test('parse_explain', async () => {
    await parseOne('EXPLAIN SELECT * FROM t');
  });

  test('parse_explain_analyze', async () => {
    await parseOne('EXPLAIN ANALYZE SELECT * FROM t');
  });
});

describe('Common SQL - Error Cases', () => {
  test('parse_invalid_table_name', async () => {
    await expectParseError('SELECT * FROM 123invalid');
  });

  test('parse_select_all_distinct', async () => {
    await expectParseError('SELECT ALL DISTINCT name FROM customer');
  });

  test('parse_missing_from', async () => {
    // This is actually valid - SELECT 1 doesn't need FROM
    const stmt = await parseOne('SELECT 1');
    expect(isQuery(stmt)).toBe(true);
  });

  test('parse_unterminated_string', async () => {
    await expectParseError("SELECT 'unterminated");
  });

  test('parse_unmatched_parentheses', async () => {
    await expectParseError('SELECT (1 + 2');
    await expectParseError('SELECT 1 + 2)');
  });
});
