import { randomUUID } from 'node:crypto'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { StorageProvider } from '@prisma/client'

export type UploadAuthorization = {
  provider: StorageProvider
  key: string
  method: 'PUT'
  uploadUrl: string
  publicUrl: string
  headers: Record<string, string>
}

export type CreateUploadAuthorizationInput = {
  key: string
  contentType: string
  fileSizeBytes?: number
}

export interface StorageService {
  readonly provider: StorageProvider
  buildObjectKey(input: { projectId: string; filename: string; prefix?: string }): string
  createUploadAuthorization(input: CreateUploadAuthorizationInput): Promise<UploadAuthorization>
}

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]+/g, '-').toLowerCase()
}

export class LocalStorageService implements StorageService {
  readonly provider = 'LOCAL' as const

  constructor(
    private readonly options: {
      uploadBaseUrl: string
      publicBaseUrl?: string
    },
  ) {}

  buildObjectKey(input: { projectId: string; filename: string; prefix?: string }) {
    const directory = input.prefix ?? 'assets'
    return `${directory}/${input.projectId}/${randomUUID()}-${sanitizeFilename(input.filename)}`
  }

  async createUploadAuthorization(
    input: CreateUploadAuthorizationInput,
  ): Promise<UploadAuthorization> {
    const publicBaseUrl = this.options.publicBaseUrl ?? this.options.uploadBaseUrl

    return {
      provider: this.provider,
      key: input.key,
      method: 'PUT',
      uploadUrl: `${this.options.uploadBaseUrl.replace(/\/$/, '')}/${input.key}`,
      publicUrl: `${publicBaseUrl.replace(/\/$/, '')}/${input.key}`,
      headers: {
        'content-type': input.contentType,
      },
    }
  }
}

export class S3CompatibleStorageService implements StorageService {
  readonly provider: StorageProvider
  private readonly client: S3Client

  constructor(
    private readonly options: {
      provider: 'S3' | 'R2'
      bucket: string
      region: string
      endpoint?: string
      publicBaseUrl: string
      accessKeyId: string
      secretAccessKey: string
      presignExpiresIn?: number
      forcePathStyle?: boolean
    },
  ) {
    this.provider = options.provider
    this.client = new S3Client({
      region: options.region,
      endpoint: options.endpoint,
      forcePathStyle: options.forcePathStyle,
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
      },
    })
  }

  buildObjectKey(input: { projectId: string; filename: string; prefix?: string }) {
    const directory = input.prefix ?? 'assets'
    return `${directory}/${input.projectId}/${randomUUID()}-${sanitizeFilename(input.filename)}`
  }

  async createUploadAuthorization(
    input: CreateUploadAuthorizationInput,
  ): Promise<UploadAuthorization> {
    const command = new PutObjectCommand({
      Bucket: this.options.bucket,
      Key: input.key,
      ContentType: input.contentType,
    })

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: this.options.presignExpiresIn ?? 900,
    })

    return {
      provider: this.provider,
      key: input.key,
      method: 'PUT',
      uploadUrl,
      publicUrl: `${this.options.publicBaseUrl.replace(/\/$/, '')}/${input.key}`,
      headers: {
        'content-type': input.contentType,
      },
    }
  }
}

export function createStorageServiceFromEnv(): StorageService {
  const provider = (process.env.ASSET_STORAGE_PROVIDER ?? 'LOCAL').toUpperCase() as StorageProvider

  if (provider === 'LOCAL') {
    return new LocalStorageService({
      uploadBaseUrl: process.env.LOCAL_UPLOAD_BASE_URL ?? 'http://localhost:3000/uploads',
      publicBaseUrl: process.env.LOCAL_PUBLIC_BASE_URL,
    })
  }

  if (provider !== 'S3' && provider !== 'R2') {
    throw new Error(`Unsupported storage provider "${provider}". Valid options: LOCAL, S3, R2.`)
  }

  const bucket = process.env.S3_BUCKET
  const region = process.env.S3_REGION
  const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL
  const accessKeyId = process.env.S3_ACCESS_KEY_ID
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY

  if (!bucket || !region || !publicBaseUrl || !accessKeyId || !secretAccessKey) {
    throw new Error('S3/R2 storage configuration is incomplete.')
  }

  return new S3CompatibleStorageService({
    provider,
    bucket,
    region,
    endpoint: process.env.S3_ENDPOINT,
    publicBaseUrl,
    accessKeyId,
    secretAccessKey,
    presignExpiresIn: process.env.S3_PRESIGN_EXPIRES_IN
      ? Number(process.env.S3_PRESIGN_EXPIRES_IN)
      : undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  })
}