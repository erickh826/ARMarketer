import { imageTargetService } from '../../../../../lib/services.js'
import { toJsonSafe } from '../../../../../../../lib/json.js'
import { requireApiKey } from '../../../../../lib/api-key-auth.js'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * POST /api/targets/:id/compile
 *
 * Phase 1 stub: no actual .mind compilation is performed.
 * Sets compileStatus to READY immediately to unblock target-experience binding.
 * Real MindAR compiler integration is a Phase 2 task.
 */
export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params

  const target = await imageTargetService.findById(id)
  if (!target) {
    return Response.json({ error: 'Target not found.' }, { status: 404 })
  }

  const authError = await requireApiKey(request, target.projectId)
  if (authError) return authError

  if (target.compileStatus === 'PROCESSING') {
    return Response.json(
      { error: 'Compilation already in progress.' },
      { status: 409 },
    )
  }

  const updated = await imageTargetService.updateCompileStatus(id, 'READY')

  return Response.json(
    toJsonSafe({
      target: updated,
      stub: true,
      message: 'Phase 1 stub: compileStatus set to READY. Real .mind compilation not yet implemented.',
    }),
  )
}
