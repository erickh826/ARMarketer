import type { Prisma, PrismaClient } from '@prisma/client'

export class ARExperienceService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: Prisma.ARExperienceUncheckedCreateInput) {
    return this.prisma.$transaction(async (transaction) => {
      const project = await transaction.project.findUnique({
        where: { id: data.projectId },
        select: { id: true },
      })

      if (!project) {
        throw new Error(`Project ${data.projectId} not found.`)
      }

      if (data.imageTargetId) {
        const imageTarget = await transaction.imageTarget.findUnique({
          where: { id: data.imageTargetId },
          select: { projectId: true },
        })

        if (!imageTarget || imageTarget.projectId !== data.projectId) {
          throw new Error('imageTargetId must belong to the same project.')
        }
      }

      if (data.mediaAssetId) {
        const mediaAsset = await transaction.mediaAsset.findUnique({
          where: { id: data.mediaAssetId },
          select: { projectId: true },
        })

        if (!mediaAsset || mediaAsset.projectId !== data.projectId) {
          throw new Error('mediaAssetId must belong to the same project.')
        }
      }

      return transaction.aRExperience.create({ data })
    })
  }

  findById(id: string) {
    return this.prisma.aRExperience.findUnique({
      where: { id },
      include: {
        imageTarget: true,
        mediaAsset: true,
      },
    })
  }

  listByProject(projectId: string) {
    return this.prisma.aRExperience.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'desc' },
      include: {
        imageTarget: true,
        mediaAsset: true,
      },
    })
  }

  update(id: string, data: Prisma.ARExperienceUncheckedUpdateInput) {
    return this.prisma.aRExperience.update({ where: { id }, data })
  }

  async updateWithValidation(id: string, data: Prisma.ARExperienceUncheckedUpdateInput) {
    return this.prisma.$transaction(async (tx) => {
      const experience = await tx.aRExperience.findUnique({ where: { id } })
      if (!experience) throw new Error('Experience not found.')

      if (data.imageTargetId) {
        const target = await tx.imageTarget.findUnique({ where: { id: data.imageTargetId as string } })
        if (!target || target.projectId !== experience.projectId)
          throw new Error('imageTargetId must belong to the same project.')
      }

      if (data.mediaAssetId) {
        const asset = await tx.mediaAsset.findUnique({ where: { id: data.mediaAssetId as string } })
        if (!asset || asset.projectId !== experience.projectId)
          throw new Error('mediaAssetId must belong to the same project.')
      }

      return tx.aRExperience.update({ where: { id }, data })
    })
  }

  updateSceneConfig(
    id: string,
    data: Pick<
      Prisma.ARExperienceUncheckedUpdateInput,
      'transform' | 'animationConfig' | 'contentSceneId' | 'audioUrl'
    >,
  ) {
    return this.prisma.aRExperience.update({
      where: { id },
      data,
    })
  }

  delete(id: string) {
    return this.prisma.aRExperience.delete({ where: { id } })
  }
}