import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function run() {
  try {
    const sql = fs.readFileSync('./rls.sql', 'utf8');
    // executeRawUnsafe allows raw strings including multiple statements if supported, 
    // but Prisma sometimes restricts multiple statements. Let's split by ';' if needed,
    // or just run it. Actually executeRawUnsafe runs the whole block in PG.
    await prisma.$executeRawUnsafe(sql);
    console.log('SQL executed successfully!');
  } catch (err) {
    console.error('Error executing SQL via Prisma:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
