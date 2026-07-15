import type { MediaAssetKind, Prisma } from '@prisma/client'
import { prisma } from '../../../lib/prisma.js'
import { ARExperienceService } from '../../../services/ar-experience.service.js'
import { HotspotService } from '../../../services/hotspot.service.js'
import { ImageTargetService } from '../../../services/image-target.service.js'
import { MediaAssetService } from '../../../services/media-asset.service.js'
import { ProjectService } from '../../../services/project.service.js'
import { createStorageServiceFromEnv } from '../../../storage/storage.service.js'

export const projectService = new ProjectService(prisma)
export const imageTargetService = new ImageTargetService(prisma)
export const arExperienceService = new ARExperienceService(prisma)
export const hotspotService = new HotspotService(prisma)
export const mediaAssetService = new MediaAssetService(prisma)
export const storageService = createStorageServiceFromEnv()

export type UploadAssetRequest = {
  projectId: string
  name?: string
  kind: MediaAssetKind
  originalFilename: string
  mimeType: string
  fileSizeBytes?: number
  sourceFormat?: string
  checksumSha256?: string
  metadata?: Prisma.InputJsonValue
}

export type RegisterDerivedAssetRequest = {
  projectId: string
  sourceAssetId: string
  name: string
  storageKey: string
  processedUrl: string
  fileSizeBytes?: number
  metadata?: Prisma.InputJsonValue
}
