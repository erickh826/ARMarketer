import type { Prisma } from '@prisma/client'
import { arExperienceService, imageTargetService } from '../../../../lib/services.js'
import { toJsonSafe } from '../../../../../../lib/json.js'
import { requireApiKey } from '../../../../lib/api-key-auth.js'

type RouteContext = { params: Promise<{ id: string }> }

type PatchExperienceBody = {
  name?: string
  imageTargetId?: string | null
  mediaAssetId?: string | null
  contentSceneId?: string | null
  transform?: unknown
  animationConfig?: unknown
  audioUrl?: string | null
}

async function resolveAndAuth(request: Request, id: string) {
  const experience = await arExperienceService.findById(id)

  if (!experience) {
    return { experience: null, authError: Response.json({ error: 'Experience not found.' }, { status: 404 }) }
  }

  const authError = await requireApiKey(request, experience.projectId)
  if (authError) return { experience: null, authError }

  return { experience, authError: null }
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params
  const { experience, authError } = await resolveAndAuth(request, id)
  if (authError) return authError

  return Response.json(toJsonSafe(experience!))
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params
  const { experience, authError } = await resolveAndAuth(request, id)
  if (authError) return authError

  const body = await request.json() as PatchExperienceBody

  if (body.imageTargetId) {
    const target = await imageTargetService.findById(body.imageTargetId)
    if (!target || target.projectId !== experience!.projectId) {
      return Response.json(
        { error: 'imageTargetId must belong to the same project.' },
        { status: 422 },
      )
    }
  }

  const updateData: Prisma.ARExperienceUncheckedUpdateInput = {}
  if (body.name !== undefined) updateData.name = body.name
  if (body.imageTargetId !== undefined) updateData.imageTargetId = body.imageTargetId
  if (body.mediaAssetId !== undefined) updateData.mediaAssetId = body.mediaAssetId
  if (body.contentSceneId !== undefined) updateData.contentSceneId = body.contentSceneId
  if (body.transform !== undefined) updateData.transform = body.transform as Prisma.InputJsonValue
  if (body.animationConfig !== undefined) updateData.animationConfig = body.animationConfig as Prisma.InputJsonValue
  if (body.audioUrl !== undefined) updateData.audioUrl = body.audioUrl

  if (Object.keys(updateData).length === 0) {
    return Response.json(toJsonSafe(experience!))
  }

  const updated = await arExperienceService.update(id, updateData)
  return Response.json(toJsonSafe(updated))
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params
  const { authError } = await resolveAndAuth(request, id)
  if (authError) return authError

  await arExperienceService.delete(id)
  return new Response(null, { status: 204 })
}
