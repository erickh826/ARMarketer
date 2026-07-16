import type { ImageTargetCompileStatus, Prisma, PrismaClient } from '@prisma/client'

export class BindConflictError extends Error {
  readonly status = 409
  constructor(message = 'Target is already bound to another experience.') {
    super(message)
    this.name = 'BindConflictError'
  }
}

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

  async bindExperience(targetId: string, experienceId: string, projectId: string) {
    return this.prisma.$transaction(async (tx) => {
      const experience = await tx.aRExperience.findUnique({ where: { id: experienceId } })
      if (!experience) throw new Error('Experience not found.')
      if (experience.projectId !== projectId)
        throw new Error('Experience and target must belong to the same project.')
      if (experience.imageTargetId !== targetId)
        throw new Error('Experience imageTargetId must match the target being bound.')

      const result = await tx.imageTarget.updateMany({
        where: {
          id: targetId,
          OR: [{ boundExperienceId: null }, { boundExperienceId: experienceId }],
        },
        data: { boundExperienceId: experienceId },
      })
      if (result.count === 0) throw new BindConflictError()

      return tx.imageTarget.findUniqueOrThrow({ where: { id: targetId } })
    })
  }

  unbindExperience(targetId: string) {
    return this.prisma.imageTarget.update({
      where: { id: targetId },
      data: { boundExperienceId: null },
    })
  }

  delete(id: string) {
    return this.prisma.imageTarget.delete({ where: { id } })
  }
}