/**
 * Demo script to test the sqlparser-rs package
 * Run with: node examples/demo.js
 */

const { Parser, GenericDialect, PostgreSqlDialect } = require('../dist/cjs/index.js');

async function main() {
  console.log('=== sqlparser-rs Demo ===\n');

  // 1. Simple parsing
  console.log('1. Parsing simple SELECT:');
  const statements = await Parser.parse('SELECT 1, 2, 3', new GenericDialect());
  console.log('   Parsed', statements.length, 'statement(s)');
  console.log('   Type:', Object.keys(statements[0])[0]);

  // 2. Parse with PostgreSQL dialect
  console.log('\n2. Parsing PostgreSQL syntax:');
  const pgStatements = await Parser.parse(
    "SELECT * FROM users WHERE id = $1 AND name ILIKE '%test%'",
    new PostgreSqlDialect()
  );
  console.log('   Parsed successfully');

  // 3. Format SQL
  console.log('\n3. Formatting SQL:');
  const formatted = await Parser.format('select   *   from   users', new GenericDialect());
  console.log('   Input:  select   *   from   users');
  console.log('   Output:', formatted);

  // 4. Get JSON representation
  console.log('\n4. JSON output:');
  const json = await Parser.parseToJson('SELECT id, name FROM users', new GenericDialect());
  console.log('   JSON length:', json.length, 'chars');
  console.log('   Preview:', json.substring(0, 100) + '...');

  // 5. Validate SQL
  console.log('\n5. Validating SQL:');
  try {
    await Parser.validate('SELECT 1', new GenericDialect());
    console.log('   "SELECT 1" - Valid');
  } catch (e) {
    console.log('   Error:', e.message);
  }

  try {
    await Parser.validate('SELEC * FROM users', new GenericDialect());
  } catch (e) {
    console.log('   "SELEC * FROM users" - Invalid:', e.message);
  }

  // 6. Complex query
  console.log('\n6. Parsing complex query:');
  const complexSql = `
    WITH active_users AS (
      SELECT * FROM users WHERE status = 'active'
    )
    SELECT u.id, u.name, COUNT(o.id) as order_count
    FROM active_users u
    LEFT JOIN orders o ON u.id = o.user_id
    GROUP BY u.id, u.name
    HAVING COUNT(o.id) > 5
    ORDER BY order_count DESC
    LIMIT 10
  `;
  const complex = await Parser.parse(complexSql, new GenericDialect());
  console.log('   Parsed successfully');
  console.log('   Statement type:', Object.keys(complex[0])[0]);

  console.log('\n=== Demo Complete ===');
}

main().catch(console.error);
