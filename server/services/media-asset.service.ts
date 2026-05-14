import { MediaAssetStatus } from '@prisma/client'
import type { MediaAsset, Prisma, PrismaClient } from '@prisma/client'

function toBigIntValue(value: bigint | number | string | null | undefined) {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  return typeof value === 'bigint' ? value : BigInt(value)
}

export class MediaAssetService {
  constructor(private readonly prisma: PrismaClient) {}

  createUploadPlaceholder(
    data: Omit<Prisma.MediaAssetUncheckedCreateInput, 'status' | 'fileSizeBytes'> & {
      fileSizeBytes?: bigint | number | string | null
    },
  ) {
    return this.prisma.mediaAsset.create({
      data: {
        ...data,
        fileSizeBytes: toBigIntValue(data.fileSizeBytes),
        status: MediaAssetStatus.UPLOADED,
      },
    })
  }

  async createDerivedAsset(
    data: Omit<Prisma.MediaAssetUncheckedCreateInput, 'status' | 'sourceAssetId' | 'fileSizeBytes'> & {
      sourceAssetId: string
      fileSizeBytes?: bigint | number | string | null
      status?: MediaAssetStatus
    },
  ) {
    return this.prisma.$transaction(async (transaction) => {
      const sourceAsset = await transaction.mediaAsset.findUnique({
        where: { id: data.sourceAssetId },
        select: { id: true, projectId: true },
      })

      if (!sourceAsset) {
        throw new Error(`Source asset ${data.sourceAssetId} not found.`)
      }

      if (sourceAsset.projectId !== data.projectId) {
        throw new Error('Derived asset must belong to the same project as its source asset.')
      }

      return transaction.mediaAsset.create({
        data: {
          ...data,
          fileSizeBytes: toBigIntValue(data.fileSizeBytes),
          status: data.status ?? MediaAssetStatus.READY,
        },
      })
    })
  }

  linkDerivedAsset(sourceAssetId: string, derivedAssetId: string) {
    return this.prisma.mediaAsset.update({
      where: { id: derivedAssetId },
      data: { sourceAssetId },
    })
  }

  listByProject(projectId: string) {
    return this.prisma.mediaAsset.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'desc' },
      include: {
        sourceAsset: true,
        derivedAssets: true,
      },
    })
  }

  findById(id: string) {
    return this.prisma.mediaAsset.findUnique({
      where: { id },
      include: {
        sourceAsset: true,
        derivedAssets: true,
      },
    })
  }

  async findReadyOptimizedAssetForExperience(experienceId: string) {
    const experience = await this.prisma.aRExperience.findUnique({
      where: { id: experienceId },
      include: {
        mediaAsset: {
          include: {
            sourceAsset: true,
            derivedAssets: {
              where: {
                status: MediaAssetStatus.READY,
                processedUrl: { not: null },
              },
              orderBy: { updatedAt: 'desc' },
            },
          },
        },
      },
    })

    if (!experience?.mediaAsset) {
      return null
    }

    return resolveReadyAsset(experience.mediaAsset)
  }
}

type MediaAssetWithRelations = MediaAsset & {
  sourceAsset?: MediaAsset | null
  derivedAssets?: MediaAsset[]
}

export function resolveReadyAsset(asset: MediaAssetWithRelations) {
  if (asset.status === MediaAssetStatus.READY && asset.processedUrl) {
    return asset
  }

  const derivedReadyAsset = asset.derivedAssets?.find(
    (candidate) => candidate.status === MediaAssetStatus.READY && Boolean(candidate.processedUrl),
  )

  if (derivedReadyAsset) {
    return derivedReadyAsset
  }

  if (
    asset.sourceAsset
    && asset.sourceAsset.status === MediaAssetStatus.READY
    && asset.sourceAsset.processedUrl
  ) {
    return asset.sourceAsset
  }

  return null
}