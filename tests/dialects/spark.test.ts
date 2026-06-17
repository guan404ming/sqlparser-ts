/**
 * Spark SQL dialect tests
 */

import { parseOne, dialects } from '../test-utils';

const spark = dialects.spark;

describe('Spark SQL', () => {
  test('parse_basic_select', () => {
    parseOne('SELECT a, b FROM t WHERE a > 1', spark);
  });

  test('parse_struct_type', () => {
    parseOne('CREATE TABLE t (s STRUCT<a: INT, b: STRING>)', spark);
  });
});
