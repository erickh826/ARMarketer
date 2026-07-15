import type { Prisma, PrismaClient } from '@prisma/client'

export class HotspotService {
  constructor(private readonly prisma: PrismaClient) {}

  listByExperience(experienceId: string) {
    return this.prisma.hotspot.findMany({
      where: { experienceId },
      orderBy: { createdAt: 'asc' },
    })
  }

  findById(id: string) {
    return this.prisma.hotspot.findUnique({ where: { id } })
  }

  create(data: Prisma.HotspotUncheckedCreateInput) {
    return this.prisma.hotspot.create({ data })
  }

  update(id: string, data: Prisma.HotspotUncheckedUpdateInput) {
    return this.prisma.hotspot.update({ where: { id }, data })
  }

  delete(id: string) {
    return this.prisma.hotspot.delete({ where: { id } })
  }
}
