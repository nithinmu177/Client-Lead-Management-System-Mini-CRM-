require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function init() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  console.log('Connected to MySQL.');

  const dbName = process.env.DB_NAME || 'mini_crm';
  await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
  await connection.query(`USE ${dbName}`);
  console.log(`Using database: ${dbName}`);

  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // Split schema by semicolon to run multiple queries
  // Note: This is a simple split, might fail with complex triggers but works for this schema
  const queries = schema
    .split(';')
    .map(q => q.trim())
    .filter(q => q.length > 0);

  for (let query of queries) {
    try {
      await connection.query(query);
      console.log('Executed query successfully.');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('Table already exists, skipping.');
      } else {
        console.warn('Query failed:', err.message);
      }
    }
  }

  await connection.end();
  console.log('Database initialization complete.');
}

init().catch(err => {
  console.error('Initialization failed:', err);
  process.exit(1);
});
