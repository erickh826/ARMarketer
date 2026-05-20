import { mediaAssetService, storageService, type RegisterDerivedAssetRequest } from '../../../../lib/services.js'
import { toJsonSafe } from '../../../../../../lib/json.js'

const MAX_UPLOAD_BYTES = 500 * 1024 * 1024
const DERIVED_STORAGE_PROVIDER = storageService.provider === 'R2' ? 'R2' : 'LOCAL'

export async function POST(request: Request) {
  const body = await request.json() as RegisterDerivedAssetRequest

  if (!body.projectId || !body.sourceAssetId || !body.name || !body.storageKey || !body.processedUrl) {
    return Response.json(
      { error: 'projectId, sourceAssetId, name, storageKey, and processedUrl are required.' },
      { status: 400 },
    )
  }

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

  try {
    const createdAsset = await mediaAssetService.createDerivedAsset({
      projectId: body.projectId,
      sourceAssetId: body.sourceAssetId,
      name: body.name,
      kind: 'MODEL_3D',
      originalFilename: body.name,
      mimeType: 'model/gltf-binary',
      storageProvider: DERIVED_STORAGE_PROVIDER,
      storageKey: body.storageKey,
      originalUrl: body.processedUrl,
      processedUrl: body.processedUrl,
      processedFormat: 'glb',
      fileSizeBytes: body.fileSizeBytes,
      metadata: body.metadata,
      status: 'READY',
    })

    const asset = await mediaAssetService.findById(createdAsset.id)

    if (!asset) {
      throw new Error(`Derived asset ${createdAsset.id} was created but could not be reloaded.`)
    }

    return Response.json(
      toJsonSafe({
        asset,
        lineage: {
          sourceAssetId: asset.sourceAssetId,
          derivedAssetId: asset.id,
        },
      }),
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return Response.json({ error: error.message }, { status: 404 })
      }

      if (error.message.includes('same project')) {
        return Response.json({ error: error.message }, { status: 422 })
      }
    }

    throw error
  }
}
