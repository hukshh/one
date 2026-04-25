require('dotenv').config();
const prisma = require('./lib/prisma').default;

async function main() {
  console.log('🌱 Seeding database...');

  const workspace = await prisma.workspace.upsert({
    where: { slug: 'test-workspace' },
    update: {},
    create: {
      name: 'Test Workspace',
      slug: 'test-workspace',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'ovais7771@gmail.com' },
    update: {},
    create: {
      email: 'ovais7771@gmail.com',
      fullName: 'Test User',
      workspaceId: workspace.id,
    },
  });

  console.log('✅ Seeding completed.');
  console.log('Workspace ID:', workspace.id);
  console.log('User ID:', user.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
