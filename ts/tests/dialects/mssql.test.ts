/**
 * Microsoft SQL Server (MSSQL) dialect tests
 * Ported from sqlparser_mssql.rs
 */

import {
  parseOne,
  dialects,
  ensureWasmInitialized,
} from '../test-utils';

const mssql = dialects.mssql;

beforeAll(async () => {
  await ensureWasmInitialized();
});

describe('MSSQL - Identifiers', () => {
  test('parse_mssql_identifiers', async () => {
    await parseOne('SELECT @@version, _foo$123 FROM ##temp', mssql);
  });

  test('parse_delimited_identifiers', async () => {
    await parseOne('SELECT [a.b!], [FROM] FROM foo [WHERE]', mssql);
  });

  test('parse_table_name_in_square_brackets', async () => {
    await parseOne('SELECT [a column] FROM [a schema].[a table]', mssql);
  });

  test('parse_single_quoted_aliases', async () => {
    await parseOne("SELECT foo 'alias'", mssql);
  });
});

describe('MSSQL - Time Travel', () => {
  test('parse_table_time_travel', async () => {
    await parseOne("SELECT 1 FROM t1 FOR SYSTEM_TIME AS OF '2023-08-18 23:08:18'", mssql);
  });
});

describe('MSSQL - Stored Procedures', () => {
  test('parse_create_procedure', async () => {
    await parseOne('CREATE PROCEDURE test (@foo INT) AS BEGIN SELECT 1; END', mssql);
    await parseOne('CREATE OR ALTER PROCEDURE test (@foo INT, @bar VARCHAR(256)) AS BEGIN SELECT 1; END', mssql);
  });

  test('parse_execute_procedure', async () => {
    await parseOne('EXEC my_procedure', mssql);
    await parseOne('EXECUTE my_procedure @param1 = 1, @param2 = \'test\'', mssql);
  });
});

describe('MSSQL - Functions', () => {
  test('parse_create_function', async () => {
    await parseOne('CREATE FUNCTION dbo.fn_test (@param1 INT) RETURNS INT AS BEGIN RETURN @param1 * 2; END', mssql);
    await parseOne('CREATE OR ALTER FUNCTION dbo.fn_test (@param1 INT) RETURNS TABLE AS RETURN SELECT * FROM t', mssql);
  });

  test('parse_create_function_parameter_default_values', async () => {
    await parseOne('CREATE FUNCTION test_func (@param1 INT = 42) RETURNS INT AS BEGIN RETURN @param1; END', mssql);
  });
});

describe('MSSQL - APPLY Joins', () => {
  test('parse_cross_apply', async () => {
    await parseOne('SELECT * FROM t1 CROSS APPLY (SELECT * FROM t2 WHERE t2.id = t1.id) AS sub', mssql);
  });

  test('parse_outer_apply', async () => {
    await parseOne('SELECT * FROM t1 OUTER APPLY (SELECT * FROM t2 WHERE t2.id = t1.id) AS sub', mssql);
  });
});

describe('MSSQL - OPENJSON', () => {
  test('parse_openjson', async () => {
    await parseOne("SELECT * FROM OPENJSON(@json)", mssql);
    await parseOne("SELECT * FROM OPENJSON(@json, '$.items')", mssql);
    await parseOne(`
      SELECT * FROM OPENJSON(@json)
      WITH (id INT, name VARCHAR(100), date DATE '$.date')
    `, mssql);
  });
});

describe('MSSQL - TOP', () => {
  test('parse_top_paren', async () => {
    await parseOne('SELECT TOP (5) * FROM foo', mssql);
  });

  test('parse_top_percent', async () => {
    await parseOne('SELECT TOP (5) PERCENT * FROM foo', mssql);
  });

  test('parse_top_with_ties', async () => {
    await parseOne('SELECT TOP (5) WITH TIES * FROM foo', mssql);
  });

  test('parse_top_percent_with_ties', async () => {
    await parseOne('SELECT TOP (10) PERCENT WITH TIES * FROM foo', mssql);
  });

  test('parse_top_no_paren', async () => {
    await parseOne('SELECT TOP 5 bar, baz FROM foo', mssql);
  });
});

describe('MSSQL - Binary Literals', () => {
  test('parse_bin_literal', async () => {
    await parseOne('SELECT 0xdeadBEEF', mssql);
    await parseOne('SELECT 0x00FF', mssql);
  });
});

describe('MSSQL - Roles', () => {
  test('parse_create_role', async () => {
    await parseOne('CREATE ROLE mssql AUTHORIZATION helena', mssql);
  });

  test('parse_alter_role', async () => {
    await parseOne('ALTER ROLE old_name WITH NAME = new_name', mssql);
    await parseOne('ALTER ROLE role_name ADD MEMBER new_member', mssql);
    await parseOne('ALTER ROLE role_name DROP MEMBER old_member', mssql);
  });
});

describe('MSSQL - FOR Clause', () => {
  test('parse_for_json', async () => {
    await parseOne('SELECT * FROM t FOR JSON PATH', mssql);
    await parseOne('SELECT * FROM t FOR JSON AUTO', mssql);
    await parseOne("SELECT * FROM t FOR JSON PATH, ROOT('root')", mssql);
    await parseOne('SELECT * FROM t FOR JSON PATH, WITHOUT_ARRAY_WRAPPER', mssql);
    await parseOne('SELECT * FROM t FOR JSON PATH, INCLUDE_NULL_VALUES', mssql);
  });

  test('parse_for_xml', async () => {
    await parseOne('SELECT * FROM t FOR XML RAW', mssql);
    await parseOne('SELECT * FROM t FOR XML AUTO', mssql);
    await parseOne('SELECT * FROM t FOR XML PATH', mssql);
    await parseOne("SELECT * FROM t FOR XML PATH('row')", mssql);
    await parseOne('SELECT * FROM t FOR XML EXPLICIT', mssql);
  });

  test('parse_for_browse', async () => {
    await parseOne('SELECT * FROM t FOR BROWSE', mssql);
  });
});

describe('MSSQL - JSON Functions', () => {
  test('parse_json_object', async () => {
    await parseOne("SELECT JSON_OBJECT('name': name, 'age': age)", mssql);
    await parseOne('SELECT JSON_OBJECT(\'key\': value ABSENT ON NULL)', mssql);
    await parseOne('SELECT JSON_OBJECT(\'key\': value NULL ON NULL)', mssql);
  });

  test('parse_json_array', async () => {
    await parseOne('SELECT JSON_ARRAY(1, 2, 3)', mssql);
    await parseOne('SELECT JSON_ARRAY(1, 2, 3 ABSENT ON NULL)', mssql);
    await parseOne('SELECT JSON_ARRAY(1, 2, 3 NULL ON NULL)', mssql);
  });
});

describe('MSSQL - CAST/CONVERT', () => {
  test('parse_cast_varchar_max', async () => {
    await parseOne("SELECT CAST('foo' AS VARCHAR(MAX))", mssql);
    await parseOne("SELECT CAST('foo' AS NVARCHAR(MAX))", mssql);
  });

  test('parse_convert', async () => {
    await parseOne('SELECT CONVERT(INT, 1)', mssql);
    await parseOne("SELECT CONVERT(VARCHAR(MAX), 'foo')", mssql);
    await parseOne('SELECT CONVERT(INT, col, 2)', mssql);
  });
});

describe('MSSQL - SUBSTRING', () => {
  test('parse_substring_in_select', async () => {
    await parseOne('SELECT DISTINCT SUBSTRING(description, 0, 1) FROM test', mssql);
  });
});

describe('MSSQL - DECLARE', () => {
  test('parse_declare', async () => {
    await parseOne("DECLARE @foo INT, @bar TEXT = 'foobar'", mssql);
    await parseOne('DECLARE @my_cursor CURSOR', mssql);
    await parseOne('DECLARE vend_cursor CURSOR FOR SELECT * FROM Purchasing.Vendor', mssql);
  });
});

describe('MSSQL - Cursor Operations', () => {
  test.skip('parse_cursor', async () => {
    // Cursor operations not yet fully supported
    await parseOne('OPEN my_cursor', mssql);
    await parseOne('FETCH NEXT FROM my_cursor INTO @var1, @var2', mssql);
    await parseOne('CLOSE my_cursor', mssql);
    await parseOne('DEALLOCATE my_cursor', mssql);
  });
});

describe('MSSQL - WHILE Statement', () => {
  test.skip('parse_while_statement', async () => {
    // WHILE statement not yet fully supported
    await parseOne("WHILE 1 = 0 PRINT 'Hello World'", mssql);
    await parseOne('WHILE @@FETCH_STATUS = 0 BEGIN FETCH NEXT FROM cursor INTO @var; END', mssql);
  });
});

describe('MSSQL - RAISERROR', () => {
  test('parse_raiserror', async () => {
    await parseOne("RAISERROR('This is a test', 16, 1)", mssql);
    await parseOne("RAISERROR('Error %s', 16, 1, @param) WITH LOG", mssql);
  });
});

describe('MSSQL - USE', () => {
  test('parse_use', async () => {
    await parseOne('USE mydb', mssql);
    await parseOne('USE [mydb]', mssql);
  });
});

describe('MSSQL - CREATE TABLE', () => {
  test('parse_create_table_with_options', async () => {
    await parseOne('CREATE TABLE t (id INT) WITH (DISTRIBUTION = HASH(id))', mssql);
    await parseOne('CREATE TABLE t (id INT, name VARCHAR(100)) WITH (CLUSTERED INDEX (id))', mssql);
  });

  test('parse_create_table_identity_column', async () => {
    await parseOne('CREATE TABLE mytable (columnA INT IDENTITY NOT NULL)', mssql);
    await parseOne('CREATE TABLE mytable (columnA INT IDENTITY(1, 1) NOT NULL)', mssql);
    await parseOne('CREATE TABLE mytable (columnA INT IDENTITY(100, 10))', mssql);
  });
});

describe('MSSQL - SET Statements', () => {
  test('parse_set_session_value', async () => {
    await parseOne('SET NOCOUNT ON', mssql);
    await parseOne('SET NOCOUNT OFF', mssql);
    await parseOne('SET IDENTITY_INSERT mytable ON', mssql);
    await parseOne('SET IDENTITY_INSERT mytable OFF', mssql);
    await parseOne('SET TRANSACTION ISOLATION LEVEL READ COMMITTED', mssql);
    await parseOne('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE', mssql);
    await parseOne('SET ANSI_NULLS ON', mssql);
    await parseOne('SET QUOTED_IDENTIFIER ON', mssql);
    await parseOne('SET XACT_ABORT ON', mssql);
  });
});

describe('MSSQL - IF/ELSE', () => {
  test('parse_if_else', async () => {
    await parseOne("IF 1 = 1 SELECT '1' ELSE SELECT '2'", mssql);
    await parseOne("IF 1 = 1 BEGIN SELECT '1'; END ELSE BEGIN SELECT '2'; END", mssql);
  });
});

describe('MSSQL - VARBINARY(MAX)', () => {
  test('parse_varbinary_max', async () => {
    await parseOne('CREATE TABLE example (var_binary_col VARBINARY(MAX))', mssql);
    await parseOne('CREATE TABLE example (var_binary_col VARBINARY(50))', mssql);
  });
});

describe('MSSQL - Schema Default', () => {
  test('parse_table_identifier_with_default_schema', async () => {
    await parseOne('SELECT * FROM mydatabase..MyTable', mssql);
  });
});

describe('MSSQL - MERGE with OUTPUT', () => {
  test('parse_merge_with_output', async () => {
    await parseOne(`
      MERGE INTO target AS t
      USING source AS s
      ON t.id = s.id
      WHEN MATCHED THEN UPDATE SET t.value = s.value
      WHEN NOT MATCHED THEN INSERT (id, value) VALUES (s.id, s.value)
      OUTPUT inserted.id, deleted.id
    `, mssql);
  });
});

describe('MSSQL - Triggers', () => {
  test('parse_create_trigger', async () => {
    await parseOne('CREATE TRIGGER my_trigger ON my_table AFTER INSERT AS BEGIN SELECT 1; END', mssql);
    await parseOne('CREATE OR ALTER TRIGGER my_trigger ON my_table AFTER INSERT, UPDATE AS BEGIN SELECT 1; END', mssql);
  });

  test('parse_drop_trigger', async () => {
    await parseOne('DROP TRIGGER emp_stamp', mssql);
    await parseOne('DROP TRIGGER IF EXISTS emp_stamp', mssql);
  });
});

describe('MSSQL - PRINT', () => {
  test('parse_print', async () => {
    await parseOne("PRINT 'Hello, world!'", mssql);
    await parseOne('PRINT @my_variable', mssql);
  });
});

describe('MSSQL - GRANT/DENY', () => {
  test('parse_grant', async () => {
    await parseOne('GRANT SELECT ON my_table TO public', mssql);
    await parseOne('GRANT SELECT ON my_table TO public, db_admin', mssql);
  });

  test('parse_deny', async () => {
    await parseOne('DENY SELECT ON my_table TO public', mssql);
    await parseOne('DENY SELECT ON my_table TO public, db_admin', mssql);
  });
});

describe('MSSQL - No Semicolon Delimiter', () => {
  test.skip('parse_without_semicolons', async () => {
    // Multiple statements without semicolons not yet fully supported
    await parseOne('DECLARE @x INT DECLARE @y INT', mssql);
  });
});

describe('MSSQL - BEGIN/END Blocks', () => {
  test.skip('parse_begin_end', async () => {
    // BEGIN/END blocks not yet fully supported
    await parseOne('BEGIN SELECT 1; END', mssql);
    await parseOne('BEGIN SELECT 1; SELECT 2; END', mssql);
  });
});

describe('MSSQL - TRY/CATCH', () => {
  test.skip('parse_try_catch', async () => {
    // TRY/CATCH not yet fully supported
    await parseOne(`
      BEGIN TRY
        SELECT 1;
      END TRY
      BEGIN CATCH
        SELECT ERROR_MESSAGE();
      END CATCH
    `, mssql);
  });
});

describe('MSSQL - Transactions', () => {
  test.skip('parse_transactions', async () => {
    // TRAN shorthand not yet fully supported
    await parseOne('BEGIN TRANSACTION', mssql);
    await parseOne('BEGIN TRAN', mssql);
    await parseOne('COMMIT TRANSACTION', mssql);
    await parseOne('COMMIT TRAN', mssql);
    await parseOne('ROLLBACK TRANSACTION', mssql);
    await parseOne('ROLLBACK TRAN', mssql);
    await parseOne('SAVE TRANSACTION savepoint_name', mssql);
    await parseOne('ROLLBACK TRANSACTION savepoint_name', mssql);
  });
});

describe('MSSQL - THROW', () => {
  test.skip('parse_throw', async () => {
    // THROW not yet fully supported
    await parseOne("THROW 50000, 'Error message', 1", mssql);
    await parseOne('THROW', mssql);
  });
});

describe('MSSQL - WAITFOR', () => {
  test.skip('parse_waitfor', async () => {
    // WAITFOR not yet fully supported
    await parseOne("WAITFOR DELAY '00:00:10'", mssql);
    await parseOne("WAITFOR TIME '23:00:00'", mssql);
  });
});

describe('MSSQL - Temp Tables', () => {
  test('parse_temp_tables', async () => {
    await parseOne('CREATE TABLE #temp (id INT)', mssql);
    await parseOne('CREATE TABLE ##global_temp (id INT)', mssql);
    await parseOne('SELECT * FROM #temp', mssql);
  });
});

describe('MSSQL - Table Variables', () => {
  test('parse_table_variables', async () => {
    await parseOne('DECLARE @my_table TABLE (id INT, name VARCHAR(100))', mssql);
    await parseOne('INSERT INTO @my_table VALUES (1, \'test\')', mssql);
  });
});

describe('MSSQL - OUTPUT Clause', () => {
  test.skip('parse_output_clause', async () => {
    // OUTPUT clause not yet fully supported
    await parseOne('INSERT INTO t (col) OUTPUT inserted.id VALUES (1)', mssql);
    await parseOne('DELETE FROM t OUTPUT deleted.* WHERE id = 1', mssql);
    await parseOne('UPDATE t SET col = 1 OUTPUT inserted.col, deleted.col WHERE id = 1', mssql);
  });
});

describe('MSSQL - PIVOT/UNPIVOT', () => {
  test('parse_pivot', async () => {
    await parseOne(`
      SELECT * FROM t
      PIVOT (SUM(amount) FOR year IN ([2020], [2021], [2022])) AS pvt
    `, mssql);
  });

  test('parse_unpivot', async () => {
    await parseOne(`
      SELECT * FROM t
      UNPIVOT (value FOR year IN ([y2020], [y2021], [y2022])) AS unpvt
    `, mssql);
  });
});
