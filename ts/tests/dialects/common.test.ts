/**
 * Common SQL parser tests
 * Tests SQL features that work across multiple dialects
 * Ported from sqlparser_common.rs
 */

import {
  parseOne,
  expectParseError,
  dialects,
  isQuery,
  isInsert,
  isDelete,
  isCreateTable,
  isCreateView,
  isDrop,
  isTruncate,
} from '../test-utils';

describe('Common SQL - INSERT', () => {
  test('parse_insert_values', () => {
    parseOne('INSERT INTO customer VALUES (1, 2, 3)');
    parseOne("INSERT INTO customer VALUES (1, 2, 3), (4, 5, 6), ('a', 'b', 'c')");
    parseOne('INSERT INTO public.customer VALUES (1, 2, 3)');
  });

  test('parse_insert_into', () => {
    const stmt = parseOne('INSERT INTO customer (id, name) VALUES (1, \'test\')');
    expect(isInsert(stmt)).toBe(true);
  });

  test('parse_insert_default_values', () => {
    parseOne('INSERT INTO test_table DEFAULT VALUES');
  });

  test('parse_insert_select', () => {
    parseOne('INSERT INTO t SELECT 1');
    parseOne('INSERT INTO t SELECT * FROM other_table');
    parseOne('INSERT INTO t (a, b) SELECT c, d FROM other_table');
  });

  test('parse_insert_returning', () => {
    parseOne('INSERT INTO t VALUES (1) RETURNING *', dialects.postgresql);
    parseOne('INSERT INTO t VALUES (1) RETURNING id', dialects.postgresql);
    parseOne('INSERT INTO t VALUES (1) RETURNING id AS new_id', dialects.postgresql);
  });
});

describe('Common SQL - UPDATE', () => {
  test('parse_update', () => {
    parseOne('UPDATE t SET a = 1');
    parseOne('UPDATE t SET a = 1, b = 2');
    parseOne('UPDATE t SET a = 1, b = 2, c = 3 WHERE d');
  });

  test('parse_update_with_table_alias', () => {
    parseOne("UPDATE users AS u SET u.username = 'new_user' WHERE u.id = 1");
  });

  test('parse_update_set_from', () => {
    parseOne(
      'UPDATE t1 SET name = t2.name FROM (SELECT name FROM t2) AS t2 WHERE t1.id = t2.id',
      dialects.postgresql
    );
  });
});

describe('Common SQL - DELETE', () => {
  test('parse_delete_statement', () => {
    const stmt = parseOne('DELETE FROM "table"');
    expect(isDelete(stmt)).toBe(true);
  });

  test('parse_where_delete_statement', () => {
    parseOne('DELETE FROM foo WHERE name = 5');
  });

  test('parse_delete_with_alias', () => {
    parseOne(
      'DELETE FROM basket AS a USING basket AS b WHERE a.id > b.id',
      dialects.postgresql
    );
  });
});

describe('Common SQL - SELECT basics', () => {
  test('parse_simple_select', () => {
    parseOne('SELECT id, fname, lname FROM customer WHERE id = 1 LIMIT 5');
  });

  test('parse_select_distinct', () => {
    parseOne('SELECT DISTINCT name FROM customer');
  });

  test('parse_select_distinct_two_fields', () => {
    parseOne('SELECT DISTINCT name, id FROM customer');
  });

  test('parse_select_all', () => {
    parseOne('SELECT ALL name FROM customer');
  });

  test('parse_select_wildcard', () => {
    parseOne('SELECT * FROM foo');
    parseOne('SELECT foo.* FROM foo');
    parseOne('SELECT schema.foo.* FROM schema.foo');
  });

  test('parse_count_wildcard', () => {
    parseOne('SELECT COUNT(*) FROM customer');
    parseOne('SELECT COUNT(Employee.*) FROM Employee');
  });

  test('parse_select_count_distinct', () => {
    parseOne('SELECT COUNT(DISTINCT +x) FROM t');
    parseOne('SELECT COUNT(ALL +x) FROM t');
  });
});

describe('Common SQL - SELECT clauses', () => {
  test('parse_select_order_by', () => {
    parseOne('SELECT id FROM customer ORDER BY id');
    parseOne('SELECT id FROM customer ORDER BY id ASC');
    parseOne('SELECT id FROM customer ORDER BY id DESC');
    parseOne('SELECT id FROM customer ORDER BY id ASC, name DESC');
  });

  test('parse_select_order_by_nulls', () => {
    parseOne('SELECT id FROM customer ORDER BY id NULLS FIRST');
    parseOne('SELECT id FROM customer ORDER BY id NULLS LAST');
    parseOne('SELECT id FROM customer ORDER BY id ASC NULLS FIRST');
  });

  test('parse_select_order_by_limit', () => {
    parseOne('SELECT id FROM customer ORDER BY id LIMIT 5');
    parseOne('SELECT id FROM customer ORDER BY id LIMIT 5 OFFSET 10');
  });

  test('parse_select_group_by', () => {
    parseOne('SELECT lname, fname FROM customer GROUP BY lname, fname');
  });

  test('parse_select_having', () => {
    parseOne('SELECT foo FROM t GROUP BY foo HAVING COUNT(*) > 1');
  });

  test('parse_limit_offset', () => {
    parseOne('SELECT * FROM t LIMIT 10');
    parseOne('SELECT * FROM t LIMIT 10 OFFSET 5');
    parseOne('SELECT * FROM t OFFSET 5');
  });

  test('parse_fetch', () => {
    parseOne('SELECT * FROM t FETCH FIRST 5 ROWS ONLY');
    parseOne('SELECT * FROM t FETCH NEXT 5 ROWS ONLY');
    parseOne('SELECT * FROM t OFFSET 10 ROWS FETCH FIRST 5 ROWS ONLY');
  });
});

describe('Common SQL - SELECT INTO', () => {
  test('parse_select_into', () => {
    parseOne('SELECT * INTO table0 FROM table1');
    parseOne('SELECT * INTO TEMPORARY table0 FROM table1');
  });
});

describe('Common SQL - Expressions', () => {
  test('parse_compound_expr', () => {
    parseOne('SELECT a + b * c FROM t');
    parseOne('SELECT a * b + c FROM t');
    parseOne('SELECT a + b + c FROM t');
  });

  test('parse_unary_math', () => {
    parseOne('SELECT -a FROM t');
    parseOne('SELECT +a FROM t');
    parseOne('SELECT -a + -b FROM t');
    parseOne('SELECT -a * -b FROM t');
  });

  test('parse_mod', () => {
    parseOne('SELECT a % b FROM t');
  });

  test('parse_is_null', () => {
    parseOne('SELECT a FROM t WHERE a IS NULL');
    parseOne('SELECT a FROM t WHERE a IS NOT NULL');
  });

  test('parse_is_boolean', () => {
    parseOne('SELECT a FROM t WHERE a IS TRUE');
    parseOne('SELECT a FROM t WHERE a IS FALSE');
    parseOne('SELECT a FROM t WHERE a IS NOT TRUE');
    parseOne('SELECT a FROM t WHERE a IS NOT FALSE');
    parseOne('SELECT a FROM t WHERE a IS UNKNOWN');
    parseOne('SELECT a FROM t WHERE a IS NOT UNKNOWN');
  });

  test('parse_is_distinct_from', () => {
    parseOne('SELECT a FROM t WHERE a IS DISTINCT FROM b');
    parseOne('SELECT a FROM t WHERE a IS NOT DISTINCT FROM b');
  });

  test('parse_between', () => {
    parseOne('SELECT a FROM t WHERE age BETWEEN 25 AND 32');
    parseOne('SELECT a FROM t WHERE age NOT BETWEEN 25 AND 32');
  });

  test('parse_like', () => {
    parseOne("SELECT a FROM t WHERE name LIKE '%a'");
    parseOne("SELECT a FROM t WHERE name NOT LIKE '%a'");
    parseOne("SELECT a FROM t WHERE name LIKE '%a' ESCAPE '\\\\'");
  });

  test('parse_ilike', () => {
    parseOne("SELECT a FROM t WHERE name ILIKE '%a'", dialects.postgresql);
    parseOne("SELECT a FROM t WHERE name NOT ILIKE '%a'", dialects.postgresql);
  });

  test('parse_similar_to', () => {
    parseOne("SELECT a FROM t WHERE name SIMILAR TO '%a'", dialects.postgresql);
    parseOne("SELECT a FROM t WHERE name NOT SIMILAR TO '%a'", dialects.postgresql);
  });

  test('parse_in_list', () => {
    parseOne("SELECT a FROM t WHERE segment IN ('HIGH', 'MED')");
    parseOne("SELECT a FROM t WHERE segment NOT IN ('HIGH', 'MED')");
  });

  test('parse_in_subquery', () => {
    parseOne('SELECT a FROM t WHERE segment IN (SELECT segm FROM bar)');
    parseOne('SELECT a FROM t WHERE segment NOT IN (SELECT segm FROM bar)');
  });

  test('parse_tuple', () => {
    parseOne('SELECT (1, 2) FROM t');
    parseOne('SELECT (1) FROM t');
    parseOne('SELECT (1, 2, 3) = (a, b, c) FROM t');
  });
});

describe('Common SQL - Type Casting', () => {
  test('parse_cast', () => {
    parseOne('SELECT CAST(id AS BIGINT) FROM t');
    parseOne('SELECT CAST(id AS VARCHAR(255)) FROM t');
    parseOne("SELECT CAST('2023-01-01' AS DATE) FROM t");
  });

  test('parse_try_cast', () => {
    parseOne('SELECT TRY_CAST(id AS BIGINT) FROM t');
  });

  test('parse_safe_cast', () => {
    parseOne('SELECT SAFE_CAST(id AS INT64) FROM t', dialects.bigquery);
  });
});

describe('Common SQL - Functions', () => {
  test('parse_aggregate_functions', () => {
    parseOne('SELECT COUNT(*) FROM t');
    parseOne('SELECT SUM(amount) FROM t');
    parseOne('SELECT AVG(amount) FROM t');
    parseOne('SELECT MIN(amount) FROM t');
    parseOne('SELECT MAX(amount) FROM t');
  });

  test('parse_function_with_args', () => {
    parseOne('SELECT CONCAT(a, b, c) FROM t');
    parseOne('SELECT SUBSTRING(name, 1, 3) FROM t');
  });

  test('parse_function_schema_qualified', () => {
    parseOne('SELECT schema.func(1) FROM t');
    parseOne('SELECT a.b.c.d(1, 2, 3) FROM t');
  });

  test('parse_extract', () => {
    parseOne('SELECT EXTRACT(YEAR FROM date_col) FROM t');
    parseOne('SELECT EXTRACT(MONTH FROM date_col) FROM t');
    parseOne('SELECT EXTRACT(DAY FROM date_col) FROM t');
    parseOne('SELECT EXTRACT(HOUR FROM timestamp_col) FROM t');
  });

  test('parse_trim', () => {
    parseOne("SELECT TRIM('  hello  ') FROM t");
    parseOne("SELECT TRIM(LEADING ' ' FROM '  hello  ') FROM t");
    parseOne("SELECT TRIM(TRAILING ' ' FROM '  hello  ') FROM t");
    parseOne("SELECT TRIM(BOTH ' ' FROM '  hello  ') FROM t");
  });

  test('parse_substring', () => {
    parseOne('SELECT SUBSTRING(name FROM 1 FOR 3) FROM t');
    parseOne('SELECT SUBSTRING(name FROM 1) FROM t');
    parseOne('SELECT SUBSTRING(name, 1, 3) FROM t');
  });

  test('parse_coalesce', () => {
    parseOne('SELECT COALESCE(a, b, c) FROM t');
  });

  test('parse_nullif', () => {
    parseOne('SELECT NULLIF(a, b) FROM t');
  });
});

describe('Common SQL - CASE Expression', () => {
  test('parse_case_simple', () => {
    parseOne("SELECT CASE status WHEN 1 THEN 'active' ELSE 'inactive' END FROM t");
  });

  test('parse_case_searched', () => {
    parseOne("SELECT CASE WHEN status = 1 THEN 'active' ELSE 'inactive' END FROM t");
  });

  test('parse_case_multiple_when', () => {
    parseOne(
      "SELECT CASE WHEN a = 1 THEN 'one' WHEN a = 2 THEN 'two' ELSE 'other' END FROM t"
    );
  });

  test('parse_case_no_else', () => {
    parseOne("SELECT CASE WHEN a = 1 THEN 'one' END FROM t");
  });
});

describe('Common SQL - Subqueries', () => {
  test('parse_scalar_subquery', () => {
    parseOne('SELECT (SELECT MAX(id) FROM t2) FROM t1');
  });

  test('parse_exists', () => {
    parseOne('SELECT * FROM t1 WHERE EXISTS (SELECT 1 FROM t2)');
    parseOne('SELECT * FROM t1 WHERE NOT EXISTS (SELECT 1 FROM t2)');
  });

  test('parse_derived_table', () => {
    parseOne('SELECT * FROM (SELECT 1, 2, 3) AS subq');
    parseOne('SELECT * FROM (SELECT * FROM t) AS subq (a, b, c)');
  });
});

describe('Common SQL - JOINs', () => {
  test('parse_join', () => {
    parseOne('SELECT * FROM t1 JOIN t2 ON t1.id = t2.id');
    parseOne('SELECT * FROM t1 INNER JOIN t2 ON t1.id = t2.id');
  });

  test('parse_left_join', () => {
    parseOne('SELECT * FROM t1 LEFT JOIN t2 ON t1.id = t2.id');
    parseOne('SELECT * FROM t1 LEFT OUTER JOIN t2 ON t1.id = t2.id');
  });

  test('parse_right_join', () => {
    parseOne('SELECT * FROM t1 RIGHT JOIN t2 ON t1.id = t2.id');
    parseOne('SELECT * FROM t1 RIGHT OUTER JOIN t2 ON t1.id = t2.id');
  });

  test('parse_full_join', () => {
    parseOne('SELECT * FROM t1 FULL JOIN t2 ON t1.id = t2.id');
    parseOne('SELECT * FROM t1 FULL OUTER JOIN t2 ON t1.id = t2.id');
  });

  test('parse_cross_join', () => {
    parseOne('SELECT * FROM t1 CROSS JOIN t2');
  });

  test('parse_natural_join', () => {
    parseOne('SELECT * FROM t1 NATURAL JOIN t2');
    parseOne('SELECT * FROM t1 NATURAL LEFT JOIN t2');
  });

  test('parse_join_using', () => {
    parseOne('SELECT * FROM t1 JOIN t2 USING (id)');
    parseOne('SELECT * FROM t1 JOIN t2 USING (id, name)');
  });

  test('parse_multiple_joins', () => {
    parseOne(
      'SELECT * FROM t1 JOIN t2 ON t1.id = t2.id JOIN t3 ON t2.id = t3.id'
    );
  });
});

describe('Common SQL - Set Operations', () => {
  test('parse_union', () => {
    parseOne('SELECT 1 UNION SELECT 2');
    parseOne('SELECT 1 UNION ALL SELECT 2');
    parseOne('SELECT 1 UNION DISTINCT SELECT 2');
  });

  test('parse_intersect', () => {
    parseOne('SELECT 1 INTERSECT SELECT 2');
    parseOne('SELECT 1 INTERSECT ALL SELECT 2');
  });

  test('parse_except', () => {
    parseOne('SELECT 1 EXCEPT SELECT 2');
    parseOne('SELECT 1 EXCEPT ALL SELECT 2');
  });

  test('parse_multiple_set_ops', () => {
    parseOne('SELECT 1 UNION SELECT 2 UNION SELECT 3');
    parseOne('SELECT 1 UNION SELECT 2 INTERSECT SELECT 3');
  });
});

describe('Common SQL - CTEs (WITH clause)', () => {
  test('parse_cte', () => {
    parseOne('WITH cte AS (SELECT 1) SELECT * FROM cte');
  });

  test('parse_multiple_ctes', () => {
    parseOne(
      'WITH cte1 AS (SELECT 1), cte2 AS (SELECT 2) SELECT * FROM cte1, cte2'
    );
  });

  test('parse_recursive_cte', () => {
    parseOne(
      'WITH RECURSIVE cte AS (SELECT 1 UNION ALL SELECT n + 1 FROM cte WHERE n < 10) SELECT * FROM cte'
    );
  });
});

describe('Common SQL - Window Functions', () => {
  test('parse_window_function', () => {
    parseOne('SELECT ROW_NUMBER() OVER () FROM t');
    parseOne('SELECT RANK() OVER (ORDER BY id) FROM t');
    parseOne('SELECT DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) FROM t');
  });

  test('parse_window_function_with_frame', () => {
    parseOne('SELECT SUM(amount) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) FROM t');
    parseOne('SELECT AVG(amount) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) FROM t');
  });

  test('parse_named_window', () => {
    parseOne('SELECT SUM(amount) OVER w FROM t WINDOW w AS (PARTITION BY dept ORDER BY id)');
  });
});

describe('Common SQL - DDL', () => {
  test('parse_create_table', () => {
    const stmt = parseOne('CREATE TABLE t (id INT, name VARCHAR(255))');
    expect(isCreateTable(stmt)).toBe(true);
  });

  test('parse_create_table_if_not_exists', () => {
    parseOne('CREATE TABLE IF NOT EXISTS t (id INT)');
  });

  test('parse_create_table_primary_key', () => {
    parseOne('CREATE TABLE t (id INT PRIMARY KEY, name VARCHAR(255))');
    parseOne('CREATE TABLE t (id INT, name VARCHAR(255), PRIMARY KEY (id))');
  });

  test('parse_create_table_foreign_key', () => {
    parseOne('CREATE TABLE t (id INT, parent_id INT REFERENCES parent(id))');
    parseOne('CREATE TABLE t (id INT, parent_id INT, FOREIGN KEY (parent_id) REFERENCES parent(id))');
  });

  test('parse_create_table_not_null', () => {
    parseOne('CREATE TABLE t (id INT NOT NULL, name VARCHAR(255))');
  });

  test('parse_create_table_default', () => {
    parseOne('CREATE TABLE t (id INT DEFAULT 0, name VARCHAR(255) DEFAULT \'unnamed\')');
  });

  test('parse_create_table_unique', () => {
    parseOne('CREATE TABLE t (id INT UNIQUE, name VARCHAR(255))');
    parseOne('CREATE TABLE t (id INT, name VARCHAR(255), UNIQUE (id))');
  });

  test('parse_create_table_check', () => {
    parseOne('CREATE TABLE t (id INT CHECK (id > 0), name VARCHAR(255))');
  });

  test('parse_create_view', () => {
    const stmt = parseOne('CREATE VIEW v AS SELECT * FROM t');
    expect(isCreateView(stmt)).toBe(true);
  });

  test('parse_create_or_replace_view', () => {
    parseOne('CREATE OR REPLACE VIEW v AS SELECT * FROM t');
  });

  test('parse_drop_table', () => {
    const stmt = parseOne('DROP TABLE t');
    expect(isDrop(stmt)).toBe(true);
  });

  test('parse_drop_table_if_exists', () => {
    parseOne('DROP TABLE IF EXISTS t');
  });

  test('parse_drop_table_cascade', () => {
    parseOne('DROP TABLE t CASCADE', dialects.postgresql);
  });

  test('parse_truncate', () => {
    const stmt = parseOne('TRUNCATE TABLE t');
    expect(isTruncate(stmt)).toBe(true);
  });
});

describe('Common SQL - ALTER TABLE', () => {
  test('parse_alter_table_add_column', () => {
    parseOne('ALTER TABLE t ADD COLUMN new_col INT');
    parseOne('ALTER TABLE t ADD new_col INT');
  });

  test('parse_alter_table_drop_column', () => {
    parseOne('ALTER TABLE t DROP COLUMN old_col');
    parseOne('ALTER TABLE t DROP old_col');
  });

  test('parse_alter_table_rename_column', () => {
    parseOne('ALTER TABLE t RENAME COLUMN old_name TO new_name');
  });

  test('parse_alter_table_rename_table', () => {
    parseOne('ALTER TABLE t RENAME TO new_name');
  });

  test('parse_alter_table_add_constraint', () => {
    parseOne('ALTER TABLE t ADD CONSTRAINT pk PRIMARY KEY (id)');
    parseOne('ALTER TABLE t ADD CONSTRAINT fk FOREIGN KEY (parent_id) REFERENCES parent(id)');
  });

  test('parse_alter_table_drop_constraint', () => {
    parseOne('ALTER TABLE t DROP CONSTRAINT pk');
  });
});

describe('Common SQL - INDEX', () => {
  test('parse_create_index', () => {
    parseOne('CREATE INDEX idx ON t (col)');
    parseOne('CREATE INDEX idx ON t (col1, col2)');
  });

  test('parse_create_unique_index', () => {
    parseOne('CREATE UNIQUE INDEX idx ON t (col)');
  });

  test('parse_create_index_if_not_exists', () => {
    parseOne('CREATE INDEX IF NOT EXISTS idx ON t (col)');
  });

  test('parse_drop_index', () => {
    parseOne('DROP INDEX idx');
  });
});

describe('Common SQL - Transactions', () => {
  test('parse_begin', () => {
    parseOne('BEGIN');
    parseOne('BEGIN TRANSACTION');
    parseOne('START TRANSACTION');
  });

  test('parse_commit', () => {
    parseOne('COMMIT');
    parseOne('COMMIT TRANSACTION');
  });

  test('parse_rollback', () => {
    parseOne('ROLLBACK');
    parseOne('ROLLBACK TRANSACTION');
  });

  test('parse_savepoint', () => {
    parseOne('SAVEPOINT sp1');
  });

  test('parse_rollback_to_savepoint', () => {
    parseOne('ROLLBACK TO SAVEPOINT sp1');
    parseOne('ROLLBACK TO sp1');
  });

  test('parse_release_savepoint', () => {
    parseOne('RELEASE SAVEPOINT sp1');
    parseOne('RELEASE sp1');
  });
});

describe('Common SQL - JSON Operations', () => {
  test('parse_json_arrow_operators', () => {
    parseOne("SELECT data->'key' FROM t", dialects.postgresql);
    parseOne("SELECT data->>'key' FROM t", dialects.postgresql);
  });

  test('parse_json_object', () => {
    parseOne("SELECT JSON_OBJECT('name' : 'value')", dialects.postgresql);
  });
});

describe('Common SQL - Arrays', () => {
  test('parse_array_literal', () => {
    parseOne('SELECT ARRAY[1, 2, 3]', dialects.postgresql);
  });

  test('parse_array_subscript', () => {
    parseOne('SELECT arr[1] FROM t', dialects.postgresql);
    parseOne('SELECT arr[1][2] FROM t', dialects.postgresql);
  });
});

describe('Common SQL - EXPLAIN', () => {
  test('parse_explain', () => {
    parseOne('EXPLAIN SELECT * FROM t');
  });

  test('parse_explain_analyze', () => {
    parseOne('EXPLAIN ANALYZE SELECT * FROM t');
  });
});

describe('Common SQL - Error Cases', () => {
  test('parse_invalid_table_name', () => {
    expectParseError('SELECT * FROM 123invalid');
  });

  test('parse_select_all_distinct', () => {
    expectParseError('SELECT ALL DISTINCT name FROM customer');
  });

  test('parse_missing_from', () => {
    // This is actually valid - SELECT 1 doesn't need FROM
    const stmt = parseOne('SELECT 1');
    expect(isQuery(stmt)).toBe(true);
  });

  test('parse_unterminated_string', () => {
    expectParseError("SELECT 'unterminated");
  });

  test('parse_unmatched_parentheses', () => {
    expectParseError('SELECT (1 + 2');
    expectParseError('SELECT 1 + 2)');
  });
});
