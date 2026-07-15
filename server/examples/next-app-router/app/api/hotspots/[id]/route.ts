import type { Prisma } from '@prisma/client'
import { arExperienceService, hotspotService } from '../../../../lib/services.js'
import { toJsonSafe } from '../../../../../../lib/json.js'
import { requireApiKey } from '../../../../lib/api-key-auth.js'

type RouteContext = { params: Promise<{ id: string }> }

type PatchHotspotBody = {
  title?: string
  description?: string | null
  targetUrl?: string | null
  position?: { x: number; y: number; z: number }
  normal?: { x: number; y: number; z: number } | null
}

async function resolveAndAuth(request: Request, hotspotId: string) {
  const hotspot = await hotspotService.findById(hotspotId)
  if (!hotspot) {
    return { hotspot: null, authError: Response.json({ error: 'Hotspot not found.' }, { status: 404 }) }
  }
  const experience = await arExperienceService.findById(hotspot.experienceId)
  if (!experience) {
    return { hotspot: null, authError: Response.json({ error: 'Experience not found.' }, { status: 404 }) }
  }
  const authError = await requireApiKey(request, experience.projectId)
  if (authError) return { hotspot: null, authError }
  return { hotspot, authError: null }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params
  const { hotspot, authError } = await resolveAndAuth(request, id)
  if (authError) return authError

  const body = await request.json() as PatchHotspotBody
  const updateData: Prisma.HotspotUncheckedUpdateInput = {}

  if (body.title !== undefined) updateData.title = body.title
  if (body.description !== undefined) updateData.description = body.description
  if (body.targetUrl !== undefined) updateData.targetUrl = body.targetUrl
  if (body.position !== undefined) updateData.position = body.position as Prisma.InputJsonValue
  if (body.normal !== undefined) updateData.normal = body.normal as Prisma.InputJsonValue

  if (Object.keys(updateData).length === 0) {
    return Response.json(toJsonSafe(hotspot!))
  }

  const updated = await hotspotService.update(id, updateData)
  return Response.json(toJsonSafe(updated))
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params
  const { authError } = await resolveAndAuth(request, id)
  if (authError) return authError

  await hotspotService.delete(id)
  return new Response(null, { status: 204 })
}
