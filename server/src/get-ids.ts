const prisma = require('./lib/prisma').default;
async function main() {
  const user = await prisma.user.findFirst();
  console.log('Valid User ID:', user.id);
  console.log('Valid Workspace ID:', user.workspaceId);
}
main().catch(console.error);
