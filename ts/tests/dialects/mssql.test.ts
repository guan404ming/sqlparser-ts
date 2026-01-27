/**
 * Microsoft SQL Server (MSSQL) dialect tests
 * Ported from sqlparser_mssql.rs
 */

import {
  parseOne,
  dialects,
} from '../test-utils';

const mssql = dialects.mssql;

describe('MSSQL - Identifiers', () => {
  test('parse_mssql_identifiers', () => {
    parseOne('SELECT @@version, _foo$123 FROM ##temp', mssql);
  });

  test('parse_delimited_identifiers', () => {
    parseOne('SELECT [a.b!], [FROM] FROM foo [WHERE]', mssql);
  });

  test('parse_table_name_in_square_brackets', () => {
    parseOne('SELECT [a column] FROM [a schema].[a table]', mssql);
  });

  test('parse_single_quoted_aliases', () => {
    parseOne("SELECT foo 'alias'", mssql);
  });
});

describe('MSSQL - Time Travel', () => {
  test('parse_table_time_travel', () => {
    parseOne("SELECT 1 FROM t1 FOR SYSTEM_TIME AS OF '2023-08-18 23:08:18'", mssql);
  });
});

describe('MSSQL - Stored Procedures', () => {
  test('parse_create_procedure', () => {
    parseOne('CREATE PROCEDURE test (@foo INT) AS BEGIN SELECT 1; END', mssql);
    parseOne('CREATE OR ALTER PROCEDURE test (@foo INT, @bar VARCHAR(256)) AS BEGIN SELECT 1; END', mssql);
  });

  test('parse_execute_procedure', () => {
    parseOne('EXEC my_procedure', mssql);
    parseOne('EXECUTE my_procedure @param1 = 1, @param2 = \'test\'', mssql);
  });
});

describe('MSSQL - Functions', () => {
  test('parse_create_function', () => {
    parseOne('CREATE FUNCTION dbo.fn_test (@param1 INT) RETURNS INT AS BEGIN RETURN @param1 * 2; END', mssql);
    parseOne('CREATE OR ALTER FUNCTION dbo.fn_test (@param1 INT) RETURNS TABLE AS RETURN SELECT * FROM t', mssql);
  });

  test('parse_create_function_parameter_default_values', () => {
    parseOne('CREATE FUNCTION test_func (@param1 INT = 42) RETURNS INT AS BEGIN RETURN @param1; END', mssql);
  });
});

describe('MSSQL - APPLY Joins', () => {
  test('parse_cross_apply', () => {
    parseOne('SELECT * FROM t1 CROSS APPLY (SELECT * FROM t2 WHERE t2.id = t1.id) AS sub', mssql);
  });

  test('parse_outer_apply', () => {
    parseOne('SELECT * FROM t1 OUTER APPLY (SELECT * FROM t2 WHERE t2.id = t1.id) AS sub', mssql);
  });
});

describe('MSSQL - OPENJSON', () => {
  test('parse_openjson', () => {
    parseOne("SELECT * FROM OPENJSON(@json)", mssql);
    parseOne("SELECT * FROM OPENJSON(@json, '$.items')", mssql);
    parseOne(`
      SELECT * FROM OPENJSON(@json)
      WITH (id INT, name VARCHAR(100), date DATE '$.date')
    `, mssql);
  });
});

describe('MSSQL - TOP', () => {
  test('parse_top_paren', () => {
    parseOne('SELECT TOP (5) * FROM foo', mssql);
  });

  test('parse_top_percent', () => {
    parseOne('SELECT TOP (5) PERCENT * FROM foo', mssql);
  });

  test('parse_top_with_ties', () => {
    parseOne('SELECT TOP (5) WITH TIES * FROM foo', mssql);
  });

  test('parse_top_percent_with_ties', () => {
    parseOne('SELECT TOP (10) PERCENT WITH TIES * FROM foo', mssql);
  });

  test('parse_top_no_paren', () => {
    parseOne('SELECT TOP 5 bar, baz FROM foo', mssql);
  });
});

describe('MSSQL - Binary Literals', () => {
  test('parse_bin_literal', () => {
    parseOne('SELECT 0xdeadBEEF', mssql);
    parseOne('SELECT 0x00FF', mssql);
  });
});

describe('MSSQL - Roles', () => {
  test('parse_create_role', () => {
    parseOne('CREATE ROLE mssql AUTHORIZATION helena', mssql);
  });

  test('parse_alter_role', () => {
    parseOne('ALTER ROLE old_name WITH NAME = new_name', mssql);
    parseOne('ALTER ROLE role_name ADD MEMBER new_member', mssql);
    parseOne('ALTER ROLE role_name DROP MEMBER old_member', mssql);
  });
});

describe('MSSQL - FOR Clause', () => {
  test('parse_for_json', () => {
    parseOne('SELECT * FROM t FOR JSON PATH', mssql);
    parseOne('SELECT * FROM t FOR JSON AUTO', mssql);
    parseOne("SELECT * FROM t FOR JSON PATH, ROOT('root')", mssql);
    parseOne('SELECT * FROM t FOR JSON PATH, WITHOUT_ARRAY_WRAPPER', mssql);
    parseOne('SELECT * FROM t FOR JSON PATH, INCLUDE_NULL_VALUES', mssql);
  });

  test('parse_for_xml', () => {
    parseOne('SELECT * FROM t FOR XML RAW', mssql);
    parseOne('SELECT * FROM t FOR XML AUTO', mssql);
    parseOne('SELECT * FROM t FOR XML PATH', mssql);
    parseOne("SELECT * FROM t FOR XML PATH('row')", mssql);
    parseOne('SELECT * FROM t FOR XML EXPLICIT', mssql);
  });

  test('parse_for_browse', () => {
    parseOne('SELECT * FROM t FOR BROWSE', mssql);
  });
});

describe('MSSQL - JSON Functions', () => {
  test('parse_json_object', () => {
    parseOne("SELECT JSON_OBJECT('name': name, 'age': age)", mssql);
    parseOne('SELECT JSON_OBJECT(\'key\': value ABSENT ON NULL)', mssql);
    parseOne('SELECT JSON_OBJECT(\'key\': value NULL ON NULL)', mssql);
  });

  test('parse_json_array', () => {
    parseOne('SELECT JSON_ARRAY(1, 2, 3)', mssql);
    parseOne('SELECT JSON_ARRAY(1, 2, 3 ABSENT ON NULL)', mssql);
    parseOne('SELECT JSON_ARRAY(1, 2, 3 NULL ON NULL)', mssql);
  });
});

describe('MSSQL - CAST/CONVERT', () => {
  test('parse_cast_varchar_max', () => {
    parseOne("SELECT CAST('foo' AS VARCHAR(MAX))", mssql);
    parseOne("SELECT CAST('foo' AS NVARCHAR(MAX))", mssql);
  });

  test('parse_convert', () => {
    parseOne('SELECT CONVERT(INT, 1)', mssql);
    parseOne("SELECT CONVERT(VARCHAR(MAX), 'foo')", mssql);
    parseOne('SELECT CONVERT(INT, col, 2)', mssql);
  });
});

describe('MSSQL - SUBSTRING', () => {
  test('parse_substring_in_select', () => {
    parseOne('SELECT DISTINCT SUBSTRING(description, 0, 1) FROM test', mssql);
  });
});

describe('MSSQL - DECLARE', () => {
  test('parse_declare', () => {
    parseOne("DECLARE @foo INT, @bar TEXT = 'foobar'", mssql);
    parseOne('DECLARE @my_cursor CURSOR', mssql);
    parseOne('DECLARE vend_cursor CURSOR FOR SELECT * FROM Purchasing.Vendor', mssql);
  });
});

describe('MSSQL - Cursor Operations', () => {
  test.skip('parse_cursor', () => {
    // Cursor operations not yet fully supported
    parseOne('OPEN my_cursor', mssql);
    parseOne('FETCH NEXT FROM my_cursor INTO @var1, @var2', mssql);
    parseOne('CLOSE my_cursor', mssql);
    parseOne('DEALLOCATE my_cursor', mssql);
  });
});

describe('MSSQL - WHILE Statement', () => {
  test.skip('parse_while_statement', () => {
    // WHILE statement not yet fully supported
    parseOne("WHILE 1 = 0 PRINT 'Hello World'", mssql);
    parseOne('WHILE @@FETCH_STATUS = 0 BEGIN FETCH NEXT FROM cursor INTO @var; END', mssql);
  });
});

describe('MSSQL - RAISERROR', () => {
  test('parse_raiserror', () => {
    parseOne("RAISERROR('This is a test', 16, 1)", mssql);
    parseOne("RAISERROR('Error %s', 16, 1, @param) WITH LOG", mssql);
  });
});

describe('MSSQL - USE', () => {
  test('parse_use', () => {
    parseOne('USE mydb', mssql);
    parseOne('USE [mydb]', mssql);
  });
});

describe('MSSQL - CREATE TABLE', () => {
  test('parse_create_table_with_options', () => {
    parseOne('CREATE TABLE t (id INT) WITH (DISTRIBUTION = HASH(id))', mssql);
    parseOne('CREATE TABLE t (id INT, name VARCHAR(100)) WITH (CLUSTERED INDEX (id))', mssql);
  });

  test('parse_create_table_identity_column', () => {
    parseOne('CREATE TABLE mytable (columnA INT IDENTITY NOT NULL)', mssql);
    parseOne('CREATE TABLE mytable (columnA INT IDENTITY(1, 1) NOT NULL)', mssql);
    parseOne('CREATE TABLE mytable (columnA INT IDENTITY(100, 10))', mssql);
  });
});

describe('MSSQL - SET Statements', () => {
  test('parse_set_session_value', () => {
    parseOne('SET NOCOUNT ON', mssql);
    parseOne('SET NOCOUNT OFF', mssql);
    parseOne('SET IDENTITY_INSERT mytable ON', mssql);
    parseOne('SET IDENTITY_INSERT mytable OFF', mssql);
    parseOne('SET TRANSACTION ISOLATION LEVEL READ COMMITTED', mssql);
    parseOne('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE', mssql);
    parseOne('SET ANSI_NULLS ON', mssql);
    parseOne('SET QUOTED_IDENTIFIER ON', mssql);
    parseOne('SET XACT_ABORT ON', mssql);
  });
});

describe('MSSQL - IF/ELSE', () => {
  test('parse_if_else', () => {
    parseOne("IF 1 = 1 SELECT '1' ELSE SELECT '2'", mssql);
    parseOne("IF 1 = 1 BEGIN SELECT '1'; END ELSE BEGIN SELECT '2'; END", mssql);
  });
});

describe('MSSQL - VARBINARY(MAX)', () => {
  test('parse_varbinary_max', () => {
    parseOne('CREATE TABLE example (var_binary_col VARBINARY(MAX))', mssql);
    parseOne('CREATE TABLE example (var_binary_col VARBINARY(50))', mssql);
  });
});

describe('MSSQL - Schema Default', () => {
  test('parse_table_identifier_with_default_schema', () => {
    parseOne('SELECT * FROM mydatabase..MyTable', mssql);
  });
});

describe('MSSQL - MERGE with OUTPUT', () => {
  test('parse_merge_with_output', () => {
    parseOne(`
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
  test('parse_create_trigger', () => {
    parseOne('CREATE TRIGGER my_trigger ON my_table AFTER INSERT AS BEGIN SELECT 1; END', mssql);
    parseOne('CREATE OR ALTER TRIGGER my_trigger ON my_table AFTER INSERT, UPDATE AS BEGIN SELECT 1; END', mssql);
  });

  test('parse_drop_trigger', () => {
    parseOne('DROP TRIGGER emp_stamp', mssql);
    parseOne('DROP TRIGGER IF EXISTS emp_stamp', mssql);
  });
});

describe('MSSQL - PRINT', () => {
  test('parse_print', () => {
    parseOne("PRINT 'Hello, world!'", mssql);
    parseOne('PRINT @my_variable', mssql);
  });
});

describe('MSSQL - GRANT/DENY', () => {
  test('parse_grant', () => {
    parseOne('GRANT SELECT ON my_table TO public', mssql);
    parseOne('GRANT SELECT ON my_table TO public, db_admin', mssql);
  });

  test('parse_deny', () => {
    parseOne('DENY SELECT ON my_table TO public', mssql);
    parseOne('DENY SELECT ON my_table TO public, db_admin', mssql);
  });
});

describe('MSSQL - No Semicolon Delimiter', () => {
  test.skip('parse_without_semicolons', () => {
    // Multiple statements without semicolons not yet fully supported
    parseOne('DECLARE @x INT DECLARE @y INT', mssql);
  });
});

describe('MSSQL - BEGIN/END Blocks', () => {
  test.skip('parse_begin_end', () => {
    // BEGIN/END blocks not yet fully supported
    parseOne('BEGIN SELECT 1; END', mssql);
    parseOne('BEGIN SELECT 1; SELECT 2; END', mssql);
  });
});

describe('MSSQL - TRY/CATCH', () => {
  test.skip('parse_try_catch', () => {
    // TRY/CATCH not yet fully supported
    parseOne(`
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
  test.skip('parse_transactions', () => {
    // TRAN shorthand not yet fully supported
    parseOne('BEGIN TRANSACTION', mssql);
    parseOne('BEGIN TRAN', mssql);
    parseOne('COMMIT TRANSACTION', mssql);
    parseOne('COMMIT TRAN', mssql);
    parseOne('ROLLBACK TRANSACTION', mssql);
    parseOne('ROLLBACK TRAN', mssql);
    parseOne('SAVE TRANSACTION savepoint_name', mssql);
    parseOne('ROLLBACK TRANSACTION savepoint_name', mssql);
  });
});

describe('MSSQL - THROW', () => {
  test.skip('parse_throw', () => {
    // THROW not yet fully supported
    parseOne("THROW 50000, 'Error message', 1", mssql);
    parseOne('THROW', mssql);
  });
});

describe('MSSQL - WAITFOR', () => {
  test.skip('parse_waitfor', () => {
    // WAITFOR not yet fully supported
    parseOne("WAITFOR DELAY '00:00:10'", mssql);
    parseOne("WAITFOR TIME '23:00:00'", mssql);
  });
});

describe('MSSQL - Temp Tables', () => {
  test('parse_temp_tables', () => {
    parseOne('CREATE TABLE #temp (id INT)', mssql);
    parseOne('CREATE TABLE ##global_temp (id INT)', mssql);
    parseOne('SELECT * FROM #temp', mssql);
  });
});

describe('MSSQL - Table Variables', () => {
  test('parse_table_variables', () => {
    parseOne('DECLARE @my_table TABLE (id INT, name VARCHAR(100))', mssql);
    parseOne('INSERT INTO @my_table VALUES (1, \'test\')', mssql);
  });
});

describe('MSSQL - OUTPUT Clause', () => {
  test.skip('parse_output_clause', () => {
    // OUTPUT clause not yet fully supported
    parseOne('INSERT INTO t (col) OUTPUT inserted.id VALUES (1)', mssql);
    parseOne('DELETE FROM t OUTPUT deleted.* WHERE id = 1', mssql);
    parseOne('UPDATE t SET col = 1 OUTPUT inserted.col, deleted.col WHERE id = 1', mssql);
  });
});

describe('MSSQL - PIVOT/UNPIVOT', () => {
  test('parse_pivot', () => {
    parseOne(`
      SELECT * FROM t
      PIVOT (SUM(amount) FOR year IN ([2020], [2021], [2022])) AS pvt
    `, mssql);
  });

  test('parse_unpivot', () => {
    parseOne(`
      SELECT * FROM t
      UNPIVOT (value FOR year IN ([y2020], [y2021], [y2022])) AS unpvt
    `, mssql);
  });
});
