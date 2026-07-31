import { prisma } from '../lib/prisma.js'

async function main() {
  const exp = await prisma.aRExperience.findUnique({
    where: { id: 'cms8eqmkw0000b8jrcng8ctxp' },
    include: { project: true }
  })
  console.log('Experience:', exp)
}

main().catch(console.error).finally(() => prisma.$disconnect())
