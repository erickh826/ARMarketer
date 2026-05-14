import type { Prisma, PrismaClient } from '@prisma/client'

export class ProjectService {
  constructor(private readonly prisma: PrismaClient) {}

  create(data: Prisma.ProjectUncheckedCreateInput) {
    return this.prisma.project.create({ data })
  }

  list() {
    return this.prisma.project.findMany({ orderBy: { updatedAt: 'desc' } })
  }

  findById(id: string) {
    return this.prisma.project.findUnique({ where: { id } })
  }

  findBySlug(slug: string) {
    return this.prisma.project.findUnique({ where: { slug } })
  }

  update(id: string, data: Prisma.ProjectUncheckedUpdateInput) {
    return this.prisma.project.update({ where: { id }, data })
  }

  delete(id: string) {
    return this.prisma.project.delete({ where: { id } })
  }

  getViewerConfigBySlug(slug: string) {
    return this.prisma.project.findUnique({
      where: { slug },
      include: {
        imageTargets: {
          orderBy: { updatedAt: 'desc' },
        },
        experiences: {
          orderBy: { updatedAt: 'desc' },
          include: {
            imageTarget: true,
            mediaAsset: {
              include: {
                sourceAsset: true,
                derivedAssets: {
                  where: {
                    status: 'READY',
                    processedUrl: { not: null },
                  },
                  orderBy: { updatedAt: 'desc' },
                },
              },
            },
          },
        },
      },
    })
  }
}