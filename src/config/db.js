const sql = require('mssql');

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
  },
};

let pool;

const connectDB = async () => {
  try {
    pool = await sql.connect(dbConfig);
    console.log('Connected to SQL Server');
  } catch (error) {
    console.error('SQL Server connection failed:', error.message);
    process.exit(1);
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database is not connected');
  }

  return pool;
};

module.exports = {
  sql,
  connectDB,
  getPool,
};