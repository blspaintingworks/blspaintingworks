import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany();
  console.log('Seeded projects in DB:', JSON.stringify(projects, null, 2));
}

main().catch(console.error);
