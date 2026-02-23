const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const DATABASE_PREFIX = process.env.DATABASE_PREFIX || 'litebans_';

const templatePath = path.join(__dirname, '../prisma/schema.prisma.template');
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');

try {
  let schema = fs.readFileSync(templatePath, 'utf8');

  schema = schema.replace(/{{PREFIX}}/g, DATABASE_PREFIX);

  fs.writeFileSync(schemaPath, schema);

  console.log(`✅ Generated schema.prisma with prefix: "${DATABASE_PREFIX}"`);
} catch (error) {
  console.error('❌ Error generating schema:', error);
  process.exit(1);
}