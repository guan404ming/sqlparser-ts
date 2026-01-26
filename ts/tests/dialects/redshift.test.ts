/**
 * Amazon Redshift dialect tests
 * Based on Redshift-specific features
 *
 * NOTE: Several tests in this file fail because Redshift-specific SQL extensions
 * are not yet implemented in sqlparser 0.60.0. These are not bugs in the wrapper,
 * but missing features in the upstream parser that would need to be contributed:
 *
 * Failing features (7 tests):
 * - DISTKEY (distribution key for data placement across nodes)
 * - SORTKEY (sort order for query optimization)
 * - DISTSTYLE (distribution strategy: EVEN, KEY, ALL)
 * - ENCODE (column compression encoding: LZO, ZSTD, etc.)
 * - COPY command options (bulk data loading from S3/EMR)
 * - ANALYZE command (collect table statistics)
 * - CREATE EXTERNAL SCHEMA (Redshift Spectrum for S3 data)
 *
 * These features are specific to Redshift's MPP architecture and AWS integration.
 * They would need individual PRs to upstream sqlparser-rs for data warehouse use cases.
 */

import {
  parseOne,
  dialects,
  ensureWasmInitialized,
} from '../test-utils';

const redshift = dialects.redshift;

beforeAll(async () => {
  await ensureWasmInitialized();
});

describe('Redshift - CREATE TABLE', () => {
  test('parse_create_table', async () => {
    await parseOne('CREATE TABLE t (id INT)', redshift);
  });

  // Error: "Expected: ',' or ')' after column definition, found: DISTKEY"
  // DISTKEY for distribution keys not yet supported - needs upstream PR
  test.skip('parse_create_table_distkey', async () => {
    await parseOne('CREATE TABLE t (id INT DISTKEY)', redshift);
  });

  // Error: "Expected: end of statement, found: SORTKEY"
  // SORTKEY for sort order optimization not yet supported - needs upstream PR
  test.skip('parse_create_table_sortkey', async () => {
    await parseOne('CREATE TABLE t (id INT, name VARCHAR(255)) SORTKEY(id)', redshift);
    await parseOne('CREATE TABLE t (id INT, name VARCHAR(255)) COMPOUND SORTKEY(id, name)', redshift);
    await parseOne('CREATE TABLE t (id INT, name VARCHAR(255)) INTERLEAVED SORTKEY(id, name)', redshift);
  });

  // Error: "Expected: end of statement, found: DISTSTYLE"
  // DISTSTYLE for distribution strategy not yet supported - needs upstream PR
  test.skip('parse_create_table_diststyle', async () => {
    await parseOne('CREATE TABLE t (id INT) DISTSTYLE EVEN', redshift);
    await parseOne('CREATE TABLE t (id INT) DISTSTYLE KEY', redshift);
    await parseOne('CREATE TABLE t (id INT) DISTSTYLE ALL', redshift);
  });

  // Error: "Expected: ',' or ')' after column definition, found: ENCODE"
  // ENCODE for column compression not yet supported - needs upstream PR
  test.skip('parse_create_table_encode', async () => {
    await parseOne('CREATE TABLE t (id INT ENCODE ZSTD)', redshift);
    await parseOne('CREATE TABLE t (name VARCHAR(255) ENCODE LZO)', redshift);
  });
});

describe('Redshift - Data Types', () => {
  test('parse_redshift_types', async () => {
    await parseOne('CREATE TABLE t (a SMALLINT, b INT, c BIGINT, d REAL, e DOUBLE PRECISION)', redshift);
  });

  test('parse_varchar_max', async () => {
    await parseOne('CREATE TABLE t (name VARCHAR(MAX))', redshift);
  });

  test('parse_super_type', async () => {
    await parseOne('CREATE TABLE t (data SUPER)', redshift);
  });
});

describe('Redshift - COPY', () => {
  test('parse_copy_from_s3', async () => {
    await parseOne("COPY t FROM 's3://bucket/path/' IAM_ROLE 'arn:aws:iam::123456:role/RedshiftRole'", redshift);
  });

  // Error: "Expected: end of statement, found: 'auto'"
  // COPY command options not yet supported - needs upstream PR
  test.skip('parse_copy_with_options', async () => {
    await parseOne(`
      COPY t FROM 's3://bucket/path/'
      IAM_ROLE 'arn:aws:iam::123456:role/RedshiftRole'
      FORMAT AS JSON 'auto'
      GZIP
      REGION 'us-east-1'
    `, redshift);
  });
});

describe('Redshift - UNLOAD', () => {
  test('parse_unload', async () => {
    await parseOne("UNLOAD ('SELECT * FROM t') TO 's3://bucket/path/' IAM_ROLE 'arn:aws:iam::123456:role/RedshiftRole'", redshift);
  });

  test('parse_unload_with_options', async () => {
    await parseOne(`
      UNLOAD ('SELECT * FROM t')
      TO 's3://bucket/path/'
      IAM_ROLE 'arn:aws:iam::123456:role/RedshiftRole'
      PARALLEL OFF
      GZIP
    `, redshift);
  });
});

describe('Redshift - Window Functions', () => {
  test('parse_window_functions', async () => {
    await parseOne('SELECT ROW_NUMBER() OVER (ORDER BY id) FROM t', redshift);
    await parseOne('SELECT RANK() OVER (PARTITION BY category ORDER BY amount) FROM t', redshift);
    await parseOne('SELECT DENSE_RANK() OVER (ORDER BY score DESC) FROM t', redshift);
  });
});

describe('Redshift - Date Functions', () => {
  test('parse_date_functions', async () => {
    await parseOne('SELECT DATEADD(day, 1, date_col) FROM t', redshift);
    await parseOne('SELECT DATEDIFF(day, start_date, end_date) FROM t', redshift);
    await parseOne('SELECT DATE_TRUNC(\'month\', date_col) FROM t', redshift);
  });
});

describe('Redshift - String Functions', () => {
  test('parse_string_functions', async () => {
    await parseOne('SELECT LEN(name) FROM t', redshift);
    await parseOne('SELECT CHARINDEX(\'test\', name) FROM t', redshift);
  });
});

describe('Redshift - Aggregate Functions', () => {
  test('parse_listagg', async () => {
    await parseOne("SELECT LISTAGG(name, ', ') WITHIN GROUP (ORDER BY name) FROM t", redshift);
  });

  test('parse_percentile', async () => {
    await parseOne('SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount) FROM t', redshift);
    await parseOne('SELECT PERCENTILE_DISC(0.5) WITHIN GROUP (ORDER BY amount) FROM t', redshift);
  });
});

describe('Redshift - VACUUM', () => {
  test('parse_vacuum', async () => {
    await parseOne('VACUUM', redshift);
    await parseOne('VACUUM t', redshift);
    await parseOne('VACUUM FULL t', redshift);
    await parseOne('VACUUM DELETE ONLY t', redshift);
    await parseOne('VACUUM SORT ONLY t', redshift);
  });
});

describe('Redshift - ANALYZE', () => {
  // Error: "Expected: identifier, found: EOF"
  // ANALYZE command for table statistics not yet fully supported - needs upstream PR
  test.skip('parse_analyze', async () => {
    await parseOne('ANALYZE', redshift);
    await parseOne('ANALYZE t', redshift);
  });
});

describe('Redshift - System Tables', () => {
  test('parse_stv_tables', async () => {
    await parseOne('SELECT * FROM stv_tbl_perm', redshift);
  });

  test('parse_svv_tables', async () => {
    await parseOne('SELECT * FROM svv_table_info', redshift);
  });
});

describe('Redshift - Spectrum', () => {
  // Error: "Expected: TABLE, found: SCHEMA"
  // CREATE EXTERNAL SCHEMA for Redshift Spectrum not yet supported - needs upstream PR
  test.skip('parse_create_external_schema', async () => {
    await parseOne(`
      CREATE EXTERNAL SCHEMA spectrum_schema
      FROM DATA CATALOG
      DATABASE 'spectrum_db'
      IAM_ROLE 'arn:aws:iam::123456:role/SpectrumRole'
    `, redshift);
  });

  test('parse_create_external_table', async () => {
    await parseOne(`
      CREATE EXTERNAL TABLE spectrum_schema.t (
        id INT,
        name VARCHAR(255)
      )
      STORED AS PARQUET
      LOCATION 's3://bucket/path/'
    `, redshift);
  });
});
