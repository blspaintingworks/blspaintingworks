const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.project.findMany({}).then(projects => {
  console.log('Projects found:', projects.length);
  console.log(JSON.stringify(projects, null, 2));
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
