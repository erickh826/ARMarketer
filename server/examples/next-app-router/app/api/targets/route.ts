import { imageTargetService } from '../../../lib/services.js'
import { toJsonSafe } from '../../../../../lib/json.js'
import { requireApiKey } from '../../../lib/api-key-auth.js'

type CreateTargetBody = {
  projectId?: string
  name?: string
  sourceImageUrl?: string
  physicalWidthCm?: number
}

export async function POST(request: Request) {
  const body = await request.json() as CreateTargetBody

  if (!body.projectId || !body.name || !body.sourceImageUrl) {
    return Response.json(
      { error: 'projectId, name, and sourceImageUrl are required.' },
      { status: 400 },
    )
  }

  const authError = await requireApiKey(request, body.projectId)
  if (authError) return authError

  try {
    const target = await imageTargetService.create({
      projectId: body.projectId,
      name: body.name,
      sourceImageUrl: body.sourceImageUrl,
      ...(body.physicalWidthCm !== undefined ? { physicalWidthCm: body.physicalWidthCm } : {}),
    })

    return Response.json(toJsonSafe(target), { status: 201 })
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

  const targets = await imageTargetService.listByProject(projectId)
  return Response.json(toJsonSafe(targets))
}
