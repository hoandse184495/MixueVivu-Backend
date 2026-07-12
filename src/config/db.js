const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('Connected to SQL Server via Prisma');
  } catch (error) {
    console.error('Prisma connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = {
  prisma,
  connectDB,
};