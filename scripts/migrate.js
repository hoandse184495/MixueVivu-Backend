const fs = require('fs');
const path = require('path');

require('dotenv').config();

const { prisma } = require('../src/config/db');

const migrations = [
  'add_slots_deducted.sql',
  'add_guides.sql',
  'add_provider_approval.sql',
  'expand_image_url_columns.sql',
  'seed_categories.sql',
];

const splitBatches = (sql) =>
  sql
    .split(/^\s*GO\s*;?\s*$/gim)
    .map((batch) => batch.trim())
    .filter(Boolean);

const run = async () => {
  for (const fileName of migrations) {
    const filePath = path.join(__dirname, '..', 'prisma', fileName);
    const sql = fs.readFileSync(filePath, 'utf8').trim();

    if (!sql) continue;

    console.log(`Running ${fileName}...`);
    for (const batch of splitBatches(sql)) {
      await prisma.$executeRawUnsafe(batch);
    }
  }

  console.log('Migrations completed successfully');
};

run()
  .catch((error) => {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
