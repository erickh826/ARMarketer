import express from 'express'

function getPort() {
  const value = process.env.EXAMPLE_HOST_PORT ?? process.env.PORT ?? '3001'
  const port = Number(value)

  if (!Number.isFinite(port) || port <= 0) {
    throw new Error(`Invalid host port: ${value}`)
  }

  return port
}

function ensureLocalStorageDefaults(port) {
  if (!process.env.ASSET_STORAGE_PROVIDER) {
    process.env.ASSET_STORAGE_PROVIDER = 'LOCAL'
  }

  if (!process.env.LOCAL_UPLOAD_BASE_URL) {
    process.env.LOCAL_UPLOAD_BASE_URL = `http://localhost:${port}/uploads`
  }

  if (!process.env.LOCAL_PUBLIC_BASE_URL) {
    process.env.LOCAL_PUBLIC_BASE_URL = process.env.LOCAL_UPLOAD_BASE_URL
  }
}

function createHeaders(req) {
  const headers = new Headers()

  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item)
      }
      continue
    }

    if (value !== undefined) {
      headers.set(key, value)
    }
  }

  return headers
}

function buildRequestUrl(req) {
  return `${req.protocol}://${req.get('host')}${req.originalUrl}`
}

function createRequest(req, bodyMode = 'json') {
  const init = {
    method: req.method,
    headers: createHeaders(req),
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    if (bodyMode === 'raw') {
      init.body = req.body ?? Buffer.alloc(0)
    } else if (req.body !== undefined) {
      init.body = JSON.stringify(req.body)
    }
  }

  return new Request(buildRequestUrl(req), init)
}

async function sendFetchResponse(fetchResponse, res) {
  res.status(fetchResponse.status)

  fetchResponse.headers.forEach((value, key) => {
    res.setHeader(key, value)
  })

  const payload = Buffer.from(await fetchResponse.arrayBuffer())

  if (payload.length === 0) {
    res.end()
    return
  }

  res.send(payload)
}

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res)).catch(next)
  }
}

function uploadPathContext(req) {
  const wildcard = req.params[0]

  return {
    params: Promise.resolve({
      path: wildcard.split('/').filter(Boolean),
    }),
  }
}

function projectSlugContext(req) {
  return {
    params: Promise.resolve({
      slug: req.params.slug,
    }),
  }
}

function targetIdContext(req) {
  return {
    params: Promise.resolve({
      id: req.params.id,
    }),
  }
}

async function bootstrap() {
  const port = getPort()
  ensureLocalStorageDefaults(port)

  const [
    { POST: uploadAssetPost },
    { POST: registerDerivedAssetPost },
    { GET: getUploadObject, PUT: putUploadObject },
    { GET: getProjectExperience },
    { POST: createTarget, GET: listTargets },
    { GET: getTarget, PATCH: updateTarget, DELETE: deleteTarget },
    { POST: compileTarget },
  ] = await Promise.all([
    import('../next-app-router/app/api/assets/upload/route.ts'),
    import('../next-app-router/app/api/assets/derived/route.ts'),
    import('../next-app-router/app/uploads/[...path]/route.ts'),
    import('../next-app-router/app/api/projects/[slug]/experience/route.ts'),
    import('../next-app-router/app/api/targets/route.ts'),
    import('../next-app-router/app/api/targets/[id]/route.ts'),
    import('../next-app-router/app/api/targets/[id]/compile/route.ts'),
  ])

  const app = express()

  app.disable('x-powered-by')

  app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key')
    if (_req.method === 'OPTIONS') { res.sendStatus(204); return }
    next()
  })

  app.get('/healthz', (_req, res) => {
    res.status(200).json({
      ok: true,
      storageProvider: process.env.ASSET_STORAGE_PROVIDER,
    })
  })

  app.post('/api/assets/upload', express.json({ limit: '1mb' }), asyncRoute(async (req, res) => {
    const response = await uploadAssetPost(createRequest(req))
    await sendFetchResponse(response, res)
  }))

  app.post('/api/assets/derived', express.json({ limit: '1mb' }), asyncRoute(async (req, res) => {
    const response = await registerDerivedAssetPost(createRequest(req))
    await sendFetchResponse(response, res)
  }))

  app.put(/^\/uploads\/(.+)$/, express.raw({ type: '*/*', limit: '500mb' }), asyncRoute(async (req, res) => {
    const response = await putUploadObject(createRequest(req, 'raw'), uploadPathContext(req))
    await sendFetchResponse(response, res)
  }))

  app.get(/^\/uploads\/(.+)$/, asyncRoute(async (req, res) => {
    const response = await getUploadObject(createRequest(req), uploadPathContext(req))
    await sendFetchResponse(response, res)
  }))

  app.get('/api/projects/:slug/experience', asyncRoute(async (req, res) => {
    const response = await getProjectExperience(createRequest(req), projectSlugContext(req))
    await sendFetchResponse(response, res)
  }))

  app.post('/api/targets', express.json({ limit: '1mb' }), asyncRoute(async (req, res) => {
    const response = await createTarget(createRequest(req))
    await sendFetchResponse(response, res)
  }))

  app.get('/api/targets', asyncRoute(async (req, res) => {
    const response = await listTargets(createRequest(req))
    await sendFetchResponse(response, res)
  }))

  app.get('/api/targets/:id', asyncRoute(async (req, res) => {
    const response = await getTarget(createRequest(req), targetIdContext(req))
    await sendFetchResponse(response, res)
  }))

  app.patch('/api/targets/:id', express.json({ limit: '1mb' }), asyncRoute(async (req, res) => {
    const response = await updateTarget(createRequest(req), targetIdContext(req))
    await sendFetchResponse(response, res)
  }))

  app.delete('/api/targets/:id', asyncRoute(async (req, res) => {
    const response = await deleteTarget(createRequest(req), targetIdContext(req))
    await sendFetchResponse(response, res)
  }))

  app.post('/api/targets/:id/compile', express.json({ limit: '1mb' }), asyncRoute(async (req, res) => {
    const response = await compileTarget(createRequest(req), targetIdContext(req))
    await sendFetchResponse(response, res)
  }))

  app.use((error, _req, res, _next) => {
    if (error instanceof SyntaxError) {
      res.status(400).json({ error: 'Invalid JSON payload.' })
      return
    }

    const message = error instanceof Error ? error.message : 'Unexpected host error.'
    res.status(500).json({ error: message })
  })

  app.listen(port, () => {
    console.log(`Example asset host listening on http://localhost:${port}`)
  })
}

bootstrap().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
