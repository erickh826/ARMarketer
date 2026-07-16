import { BindConflictError } from '../../../../../../../services/image-target.service.js'
import { imageTargetService } from '../../../../../lib/services.js'
import { toJsonSafe } from '../../../../../../../lib/json.js'
import { requireApiKey } from '../../../../../lib/api-key-auth.js'

type RouteContext = { params: Promise<{ id: string; experienceId?: string }> }

export async function POST(request: Request, context: RouteContext) {
  const { id: targetId, experienceId } = await context.params

  if (!experienceId) {
    return Response.json({ error: 'experienceId is required.' }, { status: 400 })
  }

  const target = await imageTargetService.findById(targetId)
  if (!target) {
    return Response.json({ error: 'Target not found.' }, { status: 404 })
  }

  const authError = await requireApiKey(request, target.projectId)
  if (authError) return authError

  try {
    const updated = await imageTargetService.bindExperience(targetId, experienceId, target.projectId)
    return Response.json(toJsonSafe(updated))
  } catch (error) {
    if (error instanceof BindConflictError)
      return Response.json({ error: error.message }, { status: 409 })
    if (error instanceof Error)
      return Response.json({ error: error.message }, { status: 422 })
    return Response.json({ error: 'Unexpected error.' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id: targetId } = await context.params

  const target = await imageTargetService.findById(targetId)
  if (!target) {
    return Response.json({ error: 'Target not found.' }, { status: 404 })
  }

  const authError = await requireApiKey(request, target.projectId)
  if (authError) return authError

  await imageTargetService.unbindExperience(targetId)
  return new Response(null, { status: 204 })
}
