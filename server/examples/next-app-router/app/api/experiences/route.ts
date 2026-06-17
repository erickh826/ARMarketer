import type { ARContentType, Prisma } from '@prisma/client'
import { arExperienceService } from '../../../lib/services.js'
import { toJsonSafe } from '../../../../../lib/json.js'
import { requireApiKey } from '../../../lib/api-key-auth.js'

type CreateExperienceBody = {
  projectId?: string
  name?: string
  contentType?: ARContentType
  imageTargetId?: string
  mediaAssetId?: string
  contentSceneId?: string
  transform?: unknown
  animationConfig?: unknown
  audioUrl?: string
}

export async function POST(request: Request) {
  const body = await request.json() as CreateExperienceBody

  if (!body.projectId || !body.name || !body.contentType) {
    return Response.json(
      { error: 'projectId, name, and contentType are required.' },
      { status: 400 },
    )
  }

  const authError = await requireApiKey(request, body.projectId)
  if (authError) return authError

  try {
    const data: Prisma.ARExperienceUncheckedCreateInput = {
      projectId: body.projectId,
      name: body.name,
      contentType: body.contentType,
    }
    if (body.imageTargetId !== undefined) data.imageTargetId = body.imageTargetId
    if (body.mediaAssetId !== undefined) data.mediaAssetId = body.mediaAssetId
    if (body.contentSceneId !== undefined) data.contentSceneId = body.contentSceneId
    if (body.transform !== undefined) data.transform = body.transform as Prisma.InputJsonValue
    if (body.animationConfig !== undefined) data.animationConfig = body.animationConfig as Prisma.InputJsonValue
    if (body.audioUrl !== undefined) data.audioUrl = body.audioUrl

    const experience = await arExperienceService.create(data)
    return Response.json(toJsonSafe(experience), { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 422 })
    }
    return Response.json({ error: 'Unexpected error.' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const projectId = url.searchParams.get('projectId')

  if (!projectId) {
    return Response.json(
      { error: 'projectId query parameter is required.' },
      { status: 400 },
    )
  }

  const authError = await requireApiKey(request, projectId)
  if (authError) return authError

  const experiences = await arExperienceService.listByProject(projectId)
  return Response.json(toJsonSafe(experiences))
}
