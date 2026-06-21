require('dotenv').config();

const fs = require('fs/promises');
const path = require('path');

const { connectDB, getPool } = require('../src/config/db');

const run = async () => {
  await connectDB();

  const migrationsDirectory = path.join(__dirname, '..', 'migrations');
  const files = (await fs.readdir(migrationsDirectory))
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const pool = getPool();
  for (const file of files) {
    const sql = await fs.readFile(path.join(migrationsDirectory, file), 'utf8');
    await pool.request().batch(sql);
    console.log(`Applied migration: ${file}`);
  }

  await pool.close();
};

run().catch((error) => {
  console.error('Migration failed:', error.message);
  process.exit(1);
});
