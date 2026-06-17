import { arExperienceService, imageTargetService } from '../../../../../lib/services.js'
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

  const experience = await arExperienceService.findById(experienceId)
  if (!experience) {
    return Response.json({ error: 'Experience not found.' }, { status: 404 })
  }

  if (experience.projectId !== target.projectId) {
    return Response.json(
      { error: 'Experience and target must belong to the same project.' },
      { status: 422 },
    )
  }

  if (experience.imageTargetId !== targetId) {
    return Response.json(
      { error: 'Experience imageTargetId must match the target being bound.' },
      { status: 422 },
    )
  }

  try {
    const updated = await imageTargetService.update(targetId, { boundExperienceId: experienceId })
    return Response.json(toJsonSafe(updated))
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 422 })
    }
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

  await imageTargetService.update(targetId, { boundExperienceId: null })
  return new Response(null, { status: 204 })
}
