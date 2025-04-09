// utils/db.js
import { PrismaClient } from "@prisma/client";

// Singleton pattern to prevent connection leaks
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Export only Prisma client
module.exports = prisma;