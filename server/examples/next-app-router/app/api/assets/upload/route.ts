import {
  mediaAssetService,
  storageService,
  type UploadAssetRequest,
} from '../../../../lib/services.js'
import { toJsonSafe } from '../../../../../../lib/json.js'
import { requireApiKey } from '../../../../lib/api-key-auth.js'

const MAX_UPLOAD_BYTES = 500 * 1024 * 1024

export async function POST(request: Request) {
  const body = await request.json() as UploadAssetRequest

  if (!body.projectId || !body.originalFilename || !body.mimeType || !body.kind) {
    return Response.json(
      { error: 'projectId, originalFilename, mimeType, and kind are required.' },
      { status: 400 },
    )
  }

  const authError = await requireApiKey(request, body.projectId)
  if (authError) return authError

  if (
    body.fileSizeBytes !== undefined
    && (!Number.isFinite(body.fileSizeBytes) || body.fileSizeBytes <= 0)
  ) {
    return Response.json(
      { error: 'fileSizeBytes must be a positive number.' },
      { status: 400 },
    )
  }

  if (body.fileSizeBytes !== undefined && body.fileSizeBytes > MAX_UPLOAD_BYTES) {
    return Response.json(
      { error: 'File exceeds maximum allowed size.' },
      { status: 413 },
    )
  }

  const storageKey = storageService.buildObjectKey({
    projectId: body.projectId,
    filename: body.originalFilename,
    prefix: 'raw',
  })

  const upload = await storageService.createUploadAuthorization({
    key: storageKey,
    contentType: body.mimeType,
    fileSizeBytes: body.fileSizeBytes,
  })

  const asset = await mediaAssetService.createUploadPlaceholder({
    projectId: body.projectId,
    name: body.name ?? body.originalFilename,
    kind: body.kind,
    originalFilename: body.originalFilename,
    mimeType: body.mimeType,
    storageProvider: upload.provider,
    storageKey: upload.key,
    originalUrl: upload.publicUrl,
    sourceFormat: body.sourceFormat,
    fileSizeBytes: body.fileSizeBytes,
    checksumSha256: body.checksumSha256,
    metadata: body.metadata,
  })

  return Response.json(toJsonSafe({ asset, upload }), { status: 201 })
}