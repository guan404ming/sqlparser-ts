# SQL Parser Tests

Comprehensive tests for the sqlparser-rs TypeScript wrapper, ported from [apache/datafusion-sqlparser-rs](https://github.com/apache/datafusion-sqlparser-rs).

## Running Tests

```bash
npm test                                    # Run all tests
npm test -- parser.test.ts                 # Run specific file
npm test -- --testNamePattern="SELECT"     # Run tests matching pattern
```

## Test Results

```
Test Suites: 18 passed, 18 total (100%)
Tests:       62 skipped, 856 passed, 918 total
Failures:    0 ✅
```

## Dialect Coverage

| Dialect | Status | Skipped | Notes |
|---------|--------|---------|-------|
| Generic | ✅ Pass | 0 | |
| MySQL | ✅ Pass | 0 | Fully supported |
| PostgreSQL | ✅ Pass | 2 | VACUUM, ANALYZE |
| BigQuery | ✅ Pass | 0 | Fully supported |
| Snowflake | ✅ Pass | 4 | PUT/GET, TASK, STREAM |
| DuckDB | ✅ Pass | 3 | Lambda, SAMPLE, ASOF |
| MSSQL | ✅ Pass | 9 | Procedural features |
| SQLite | ✅ Pass | 4 | PRAGMA, GLOB, DETACH |
| Redshift | ✅ Pass | 7 | DISTKEY, SORTKEY, ENCODE |
| ClickHouse | ✅ Pass | 12 | PARTITION BY, TTL, ENGINE |
| Hive | ✅ Pass | 6 | Complex types, TRANSFORM |
| Oracle | ✅ Pass | 4 | Q quote strings (needs 0.61.0+) |
| Databricks | ✅ Pass | 1 | Time travel (needs 0.61.0+) |

## Skipped Tests (62 total)

**Dialect-specific features (52 tests):**
- ClickHouse (12): PARTITION BY, SAMPLE BY, TTL, ARRAY JOIN, ENGINE, DICTIONARY, ALTER UPDATE/DELETE, SYSTEM
- MSSQL (9): CURSOR, WHILE, BEGIN/END, TRY/CATCH, OUTPUT clause
- Redshift (7): DISTKEY, SORTKEY, DISTSTYLE, ENCODE, COPY options, CREATE EXTERNAL SCHEMA
- Hive (6): ARRAY<>, MAP<>, STRUCT<>, TRANSFORM, CREATE INDEX, DESCRIBE DATABASE
- Snowflake (4): PUT/GET, CREATE/ALTER TASK, CREATE STREAM
- SQLite (4): PRAGMA, GLOB, DETACH DATABASE, ANALYZE
- Oracle (4): Q quote strings (Q'...', NQ'...') - *coming in 0.61.0*
- DuckDB (3): Lambda functions, SAMPLE, ASOF joins
- PostgreSQL (2): VACUUM, ANALYZE
- Databricks (1): Time travel (TIMESTAMP/VERSION AS OF) - *coming in 0.61.0*

**Statement tests (10 tests):**
- Parse errors (8): Parser leniency tests (e.g., JOIN without ON, missing alias)
- DML (1): UPDATE...ORDER BY (MySQL extension)
- DDL (1): CREATE TABLE AS with columns

Each skipped test has an inline comment explaining why it's skipped.

## Test Utilities

```typescript
import { parseOne, dialects } from './test-utils';

test('example', async () => {
  await parseOne('SELECT * FROM users', dialects.mysql);
});
```

Available helpers:
- `parse(sql, dialect)` - Parse and return statements
- `parseOne(sql, dialect)` - Parse and expect one statement
- `expectParseError(sql, dialect)` - Expect parse failure
- `dialects.*` - Pre-configured dialect instances
