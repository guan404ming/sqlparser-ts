/**
 * Teradata dialect tests
 */

import { parseOne, dialects } from '../test-utils';

const teradata = dialects.teradata;

describe('Teradata', () => {
  test('parse_basic_select', () => {
    parseOne('SELECT a, b FROM t WHERE a > 1', teradata);
  });
});
