
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const meetings = await prisma.meeting.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('Last 5 Meetings:');
  meetings.forEach(m => {
    console.log(`- ID: ${m.id} | Title: ${m.title} | Status: ${m.status} | Created: ${m.createdAt}`);
  });
}

check()
  .finally(() => prisma.$disconnect());
