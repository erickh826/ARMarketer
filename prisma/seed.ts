import { prisma } from '../server/lib/prisma.js';

async function main() {
  console.log('Seeding database...');

  const project = await prisma.project.upsert({
    where: { id: '001' },
    update: {},
    create: {
      id: '001',
      name: 'Smoke Test Project',
      slug: 'smoke-test',
      apiKey: 'test-key-001',
    },
  });

  console.log(`Project created/updated: ${project.name} (${project.id})`);
  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
