import { imageTargetService } from '../../../../lib/services.js'
import { toJsonSafe } from '../../../../../../lib/json.js'
import { requireApiKey } from '../../../../lib/api-key-auth.js'

type RouteContext = { params: Promise<{ id: string }> }

type PatchTargetBody = {
  name?: string
  sourceImageUrl?: string
  physicalWidthCm?: number | null
}

async function resolveAndAuth(request: Request, id: string) {
  const target = await imageTargetService.findById(id)

  if (!target) {
    return { target: null, authError: Response.json({ error: 'Target not found.' }, { status: 404 }) }
  }

  const authError = await requireApiKey(request, target.projectId)
  if (authError) return { target: null, authError }

  return { target, authError: null }
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params
  const { target, authError } = await resolveAndAuth(request, id)
  if (authError) return authError

  return Response.json(toJsonSafe(target!))
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params
  const { target, authError } = await resolveAndAuth(request, id)
  if (authError) return authError

  const body = await request.json() as PatchTargetBody

  const updateData = {
    ...(body.name !== undefined ? { name: body.name } : {}),
    ...(body.sourceImageUrl !== undefined ? { sourceImageUrl: body.sourceImageUrl } : {}),
    ...(body.physicalWidthCm !== undefined ? { physicalWidthCm: body.physicalWidthCm } : {}),
  }

  if (Object.keys(updateData).length === 0) {
    return Response.json(toJsonSafe(target!))
  }

  const updated = await imageTargetService.update(id, updateData)
  return Response.json(toJsonSafe(updated))
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params
  const { authError } = await resolveAndAuth(request, id)
  if (authError) return authError

  await imageTargetService.delete(id)
  return new Response(null, { status: 204 })
}
