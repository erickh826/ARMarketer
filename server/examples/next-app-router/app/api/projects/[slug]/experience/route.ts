import { projectService } from '../../../../../lib/services.js'
import { toJsonSafe } from '../../../../../../../lib/json.js'
import { resolveReadyAsset } from '../../../../../../../services/media-asset.service.js'

type RouteContext = {
  params: Promise<{
    slug: string
  }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params
  const project = await projectService.getViewerConfigBySlug(slug)

  if (!project) {
    return Response.json({ error: 'Project not found.' }, { status: 404 })
  }

  const payload = {
    ...project,
    experiences: project.experiences.map((experience) => ({
      ...experience,
      resolvedMediaAsset: experience.mediaAsset
        ? resolveReadyAsset(experience.mediaAsset)
        : null,
    })),
  }

  return Response.json(toJsonSafe(payload))
}