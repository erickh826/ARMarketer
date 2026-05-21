import { prisma } from '../../../lib/prisma.js'

/**
 * Validates the x-api-key header against the project's stored apiKey.
 * Returns null if the request is authorized, or a 401/403 Response if not.
 *
 * Projects with no apiKey set are open (allows existing data to keep working
 * without configuration). Set apiKey on a project to require auth.
 */
export async function requireApiKey(
  request: Request,
  projectId: string,
): Promise<Response | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { apiKey: true },
  })

  if (!project) {
    return Response.json({ error: 'Project not found.' }, { status: 404 })
  }

  if (project.apiKey === null) {
    return null
  }

  const provided = request.headers.get('x-api-key')

  if (!provided) {
    return Response.json(
      { error: 'x-api-key header is required.' },
      { status: 401 },
    )
  }

  if (provided !== project.apiKey) {
    return Response.json({ error: 'Invalid API key.' }, { status: 403 })
  }

  return null
}
