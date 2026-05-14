import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, extname, relative, resolve } from 'node:path'

type RouteContext = {
  params: Promise<{
    path: string[]
  }>
}

const DEFAULT_CONTENT_TYPE = 'application/octet-stream'

const CONTENT_TYPES: Record<string, string> = {
  '.fbx': 'application/octet-stream',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.wav': 'audio/wav',
  '.webp': 'image/webp',
}

function getUploadRoot() {
  return resolve(process.cwd(), process.env.LOCAL_UPLOAD_DIR ?? '.local/uploads')
}

function resolveStoredPath(pathSegments: string[]) {
  if (
    pathSegments.length === 0
    || pathSegments.some((segment) => !segment || segment === '.' || segment === '..' || /[\\/]/.test(segment))
  ) {
    throw new Error('Invalid upload path.')
  }

  const uploadRoot = getUploadRoot()
  const targetPath = resolve(uploadRoot, ...pathSegments)
  const relativePath = relative(uploadRoot, targetPath)

  if (!relativePath || relativePath.startsWith('..') || resolve(uploadRoot, relativePath) !== targetPath) {
    throw new Error('Invalid upload path.')
  }

  return targetPath
}

function getContentType(filePath: string) {
  return CONTENT_TYPES[extname(filePath).toLowerCase()] ?? DEFAULT_CONTENT_TYPE
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { path } = await context.params
    const targetPath = resolveStoredPath(path)
    const payload = Buffer.from(await request.arrayBuffer())

    await mkdir(dirname(targetPath), { recursive: true })
    await writeFile(targetPath, payload)

    return new Response(null, { status: 204 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid upload path.') {
      return Response.json({ error: error.message }, { status: 400 })
    }

    throw error
  }
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { path } = await context.params
    const targetPath = resolveStoredPath(path)
    const payload = await readFile(targetPath)

    return new Response(payload, {
      status: 200,
      headers: {
        'content-type': getContentType(targetPath),
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid upload path.') {
      return Response.json({ error: error.message }, { status: 400 })
    }

    if (
      typeof error === 'object'
      && error !== null
      && 'code' in error
      && error.code === 'ENOENT'
    ) {
      return Response.json({ error: 'File not found.' }, { status: 404 })
    }

    throw error
  }
}