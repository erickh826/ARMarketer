import type { ImageTargetCompileStatus, Prisma, PrismaClient } from '@prisma/client'

export class ImageTargetService {
  constructor(private readonly prisma: PrismaClient) {}

  create(data: Prisma.ImageTargetUncheckedCreateInput) {
    if (!data.sourceImageUrl) {
      throw new Error('sourceImageUrl is required when creating an image target.')
    }

    return this.prisma.imageTarget.create({ data })
  }

  listByProject(projectId: string) {
    return this.prisma.imageTarget.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'desc' },
    })
  }

  findById(id: string) {
    return this.prisma.imageTarget.findUnique({ where: { id } })
  }

  update(id: string, data: Prisma.ImageTargetUncheckedUpdateInput) {
    return this.prisma.imageTarget.update({ where: { id }, data })
  }

  updateCompileStatus(
    id: string,
    compileStatus: ImageTargetCompileStatus,
    options?: {
      compiledMindUrl?: string | null
    },
  ) {
    return this.prisma.imageTarget.update({
      where: { id },
      data: {
        compileStatus,
        ...(options?.compiledMindUrl !== undefined
          ? { compiledMindUrl: options.compiledMindUrl }
          : {}),
      },
    })
  }

  delete(id: string) {
    return this.prisma.imageTarget.delete({ where: { id } })
  }
}