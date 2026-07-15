import { arExperienceService, hotspotService } from '../../../../../lib/services.js'
import { toJsonSafe } from '../../../../../../../lib/json.js'
import { requireApiKey } from '../../../../../lib/api-key-auth.js'

type RouteContext = { params: Promise<{ id: string }> }

type CreateHotspotBody = {
  title?: string
  description?: string
  targetUrl?: string
  position?: { x: number; y: number; z: number }
  normal?: { x: number; y: number; z: number }
}

async function resolveAndAuth(request: Request, experienceId: string) {
  const experience = await arExperienceService.findById(experienceId)
  if (!experience) {
    return { experience: null, authError: Response.json({ error: 'Experience not found.' }, { status: 404 }) }
  }
  const authError = await requireApiKey(request, experience.projectId)
  if (authError) return { experience: null, authError }
  return { experience, authError: null }
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params
  const { authError } = await resolveAndAuth(request, id)
  if (authError) return authError

  const hotspots = await hotspotService.listByExperience(id)
  return Response.json(toJsonSafe(hotspots))
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params
  const { authError } = await resolveAndAuth(request, id)
  if (authError) return authError

  const body = await request.json() as CreateHotspotBody

  if (!body.title || !body.position) {
    return Response.json({ error: 'title and position are required.' }, { status: 400 })
  }

  const { x, y, z } = body.position
  if (typeof x !== 'number' || typeof y !== 'number' || typeof z !== 'number') {
    return Response.json({ error: 'position must be {x, y, z} numbers.' }, { status: 400 })
  }

  try {
    const hotspot = await hotspotService.create({
      experienceId: id,
      title: body.title,
      description: body.description,
      targetUrl: body.targetUrl,
      position: body.position,
      normal: body.normal,
    })
    return Response.json(toJsonSafe(hotspot), { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 422 })
    }
    return Response.json({ error: 'Unexpected error.' }, { status: 500 })
  }
}
