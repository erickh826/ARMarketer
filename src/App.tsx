import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Bounds, Center, Environment, Html, OrbitControls } from '@react-three/drei'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { FolderOpen, Loader2, RotateCw, Upload, Box } from 'lucide-react'
import * as THREE from 'three'
import './App.css'

type ModelType = 'fbx' | 'obj'
type TextureUrlMap = Map<string, string>
type TextureRequest = {
  requestedUrl: string
  filename: string
  matched: boolean
}

type TextureDebugInfo = {
  requestedTextures: TextureRequest[]
  materialMapCount: number
  materialCount: number
  loadErrors: string[]
  fallbackAssignments: string[]
}

const textureExtensions = new Set(['png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif', 'avif'])

function getFilenameKey(url: string) {
  const decodedUrl = decodeURIComponent(url)
  const filename = decodedUrl.split(/[\\/]/).pop()

  return filename?.toLowerCase() ?? decodedUrl.toLowerCase()
}

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function tokenizeName(value: string) {
  return normalizeName(value).split(/\s+/).filter(Boolean)
}

function revokeTextureUrls(textureUrlMap: TextureUrlMap) {
  for (const textureUrl of textureUrlMap.values()) {
    URL.revokeObjectURL(textureUrl)
  }
}

function buildTextureUrlMap(files: FileList | File[]) {
  const textureUrlMap: TextureUrlMap = new Map()
  let textureCount = 0

  for (const file of Array.from(files)) {
    const extension = file.name.split('.').pop()?.toLowerCase()

    if (!extension || !textureExtensions.has(extension)) {
      continue
    }

    textureUrlMap.set(file.name.toLowerCase(), URL.createObjectURL(file))
    textureCount += 1
  }

  return { textureUrlMap, textureCount }
}

function getDirectoryLabel(files: FileList | File[]) {
  const firstFile = Array.from(files)[0]
  const relativePath = 'webkitRelativePath' in firstFile ? firstFile.webkitRelativePath : ''

  return relativePath.split('/')[0] || 'Selected folder'
}

function prepareModel(model: THREE.Group, type: ModelType) {
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true
      child.receiveShadow = true

      if (Array.isArray(child.material)) {
        child.material.forEach((material) => {
          material.side = THREE.DoubleSide
          material.needsUpdate = true
        })
      } else if (child.material) {
        child.material.side = THREE.DoubleSide
        child.material.needsUpdate = true
      }
    }
  })

  if (type === 'fbx') {
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3()).length()

    if (size > 0) {
      const scale = 2 / size
      model.scale.setScalar(scale)
    }
  }

  return model
}

function collectMaterialMapCount(model: THREE.Group) {
  let materialMapCount = 0
  let materialCount = 0

  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return
    }

    const materials = Array.isArray(child.material) ? child.material : [child.material]

    for (const material of materials) {
      if (!material) {
        continue
      }

      materialCount += 1

      if ('map' in material && material.map) {
        materialMapCount += 1
      }
    }
  })

  return { materialMapCount, materialCount }
}

function findTextureMatch(
  textureUrlMap: TextureUrlMap,
  label: string,
  hints: string[],
) {
  const labelTokens = tokenizeName(label)

  if (labelTokens.length === 0) {
    return null
  }

  const normalizedHints = hints.map((hint) => normalizeName(hint))
  const entries = Array.from(textureUrlMap.entries())

  const exactMatch = entries.find(([filename]) => {
    const normalizedFile = normalizeName(filename)

    return labelTokens.every((token) => normalizedFile.includes(token))
      && normalizedHints.every((hint) => normalizedFile.includes(hint))
  })

  if (exactMatch) {
    return exactMatch
  }

  const partialMatch = entries.find(([filename]) => {
    const normalizedFile = normalizeName(filename)

    return labelTokens.some((token) => normalizedFile.includes(token))
      && normalizedHints.every((hint) => normalizedFile.includes(hint))
  })

  return partialMatch ?? null
}

function applyFallbackTextures(model: THREE.Group, textureUrlMap: TextureUrlMap) {
  const textureLoader = new THREE.TextureLoader()
  const textureCache = new Map<string, THREE.Texture>()
  const assignments: string[] = []

  const loadTexture = (filename: string, url: string, colorTexture = false) => {
    if (!textureCache.has(filename)) {
      const texture = textureLoader.load(url)

      if (colorTexture) {
        texture.colorSpace = THREE.SRGBColorSpace
      }

      textureCache.set(filename, texture)
    }

    return textureCache.get(filename)!
  }

  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return
    }

    const materials = Array.isArray(child.material) ? child.material : [child.material]

    materials.forEach((material, index) => {
      if (!(material instanceof THREE.MeshPhongMaterial || material instanceof THREE.MeshLambertMaterial)) {
        return
      }

      const label = material.name || child.name || `material-${index + 1}`

      const colorMatch = !material.map
        ? findTextureMatch(textureUrlMap, label, ['base color'])
          ?? findTextureMatch(textureUrlMap, label, ['diffuse'])
          ?? findTextureMatch(textureUrlMap, label, ['albedo'])
        : null

      if (colorMatch) {
        const [filename, url] = colorMatch
        material.map = loadTexture(filename, url, true)
        assignments.push(`${label}: map <- ${filename}`)
      }

      const alphaMatch = !material.alphaMap
        ? findTextureMatch(textureUrlMap, label, ['opacity'])
          ?? findTextureMatch(textureUrlMap, label, ['alpha'])
        : null

      if (alphaMatch) {
        const [filename, url] = alphaMatch
        material.alphaMap = loadTexture(filename, url)
        material.transparent = true
        assignments.push(`${label}: alphaMap <- ${filename}`)
      }

      const normalMatch = !material.normalMap
        ? findTextureMatch(textureUrlMap, label, ['normal'])
        : null

      if (normalMatch) {
        const [filename, url] = normalMatch
        material.normalMap = loadTexture(filename, url)
        assignments.push(`${label}: normalMap <- ${filename}`)
      }

      const aoMatch = !material.aoMap
        ? findTextureMatch(textureUrlMap, label, ['ao'])
        : null

      if (aoMatch) {
        const [filename, url] = aoMatch
        material.aoMap = loadTexture(filename, url)
        assignments.push(`${label}: aoMap <- ${filename}`)
      }

      const specularMatch = !material.specularMap
        ? findTextureMatch(textureUrlMap, label, ['metallic'])
          ?? findTextureMatch(textureUrlMap, label, ['specular'])
        : null

      if (specularMatch) {
        const [filename, url] = specularMatch
        material.specularMap = loadTexture(filename, url)
        assignments.push(`${label}: specularMap <- ${filename}`)
      }

      const bumpMatch = !material.bumpMap
        ? findTextureMatch(textureUrlMap, label, ['roughness'])
        : null

      if (bumpMatch) {
        const [filename, url] = bumpMatch
        material.bumpMap = loadTexture(filename, url)
        assignments.push(`${label}: bumpMap <- ${filename}`)
      }

      material.needsUpdate = true
    })
  })

  return assignments
}

function Model({
  url,
  type,
  textureUrlMap,
  onTextureDebug,
}: {
  url: string
  type: ModelType
  textureUrlMap: TextureUrlMap
  onTextureDebug: (debugInfo: TextureDebugInfo) => void
}) {
  const [model, setModel] = useState<THREE.Group | null>(null)

  useEffect(() => {
    let isDisposed = false
    const manager = new THREE.LoadingManager()
    const requestedTextures: TextureRequest[] = []
    const loadErrors: string[] = []

    if (type === 'fbx') {
      manager.setURLModifier((assetUrl) => {
        const filename = getFilenameKey(assetUrl)
        const textureUrl = textureUrlMap.get(filename)

        requestedTextures.push({
          requestedUrl: assetUrl,
          filename,
          matched: Boolean(textureUrl),
        })

        return textureUrl ?? assetUrl
      })

      manager.onError = (assetUrl) => {
        loadErrors.push(assetUrl)
      }
    }

    const loader = type === 'fbx' ? new FBXLoader(manager) : new OBJLoader(manager)

    setModel(null)

    loader.load(
      url,
      (loadedModel) => {
        if (isDisposed) {
          return
        }

        const preparedModel = prepareModel(loadedModel, type)
        const fallbackAssignments = type === 'fbx'
          ? applyFallbackTextures(preparedModel, textureUrlMap)
          : []
        const { materialMapCount, materialCount } = collectMaterialMapCount(preparedModel)

        onTextureDebug({
          requestedTextures,
          materialMapCount,
          materialCount,
          loadErrors,
          fallbackAssignments,
        })
        setModel(preparedModel)
      },
      undefined,
      (error) => {
        if (isDisposed) {
          return
        }

        onTextureDebug({
          requestedTextures,
          materialMapCount: 0,
          materialCount: 0,
          loadErrors: [...loadErrors, String(error)],
          fallbackAssignments: [],
        })
        console.error('Failed to load model resource.', error)
      },
    )

    return () => {
      isDisposed = true
    }
  }, [textureUrlMap, type, url])

  if (!model) {
    return <LoadingOverlay />
  }

  return <primitive object={model} />
}

function LoadingOverlay() {
  return (
    <Html center>
      <div className="loading-overlay">
        <Loader2 className="loading-spinner" />
        <div className="loading-title">Loading model</div>
        <div className="loading-progress">Preparing geometry and materials...</div>
        <div className="loading-track">
          <div className="loading-bar loading-bar-indeterminate" />
        </div>
      </div>
    </Html>
  )
}

function AutoFit({ children }: { children: React.ReactNode }) {
  return (
    <Bounds fit clip observe margin={1.2}>
      <Center>{children}</Center>
    </Bounds>
  )
}

function App() {
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [modelType, setModelType] = useState<ModelType | null>(null)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [textureFolderName, setTextureFolderName] = useState('')
  const [textureCount, setTextureCount] = useState(0)
  const [textureUrlMap, setTextureUrlMap] = useState<TextureUrlMap>(new Map())
  const [textureDebug, setTextureDebug] = useState<TextureDebugInfo>({
    requestedTextures: [],
    materialMapCount: 0,
    materialCount: 0,
    loadErrors: [],
    fallbackAssignments: [],
  })
  const [autoRotate, setAutoRotate] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const textureInputRef = useRef<HTMLInputElement | null>(null)

  const textureDirectoryProps = {
    directory: '',
    webkitdirectory: '',
  } as React.InputHTMLAttributes<HTMLInputElement> & {
    directory: string
    webkitdirectory: string
  }

  useEffect(() => {
    return () => {
      if (modelUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(modelUrl)
      }
    }
  }, [modelUrl])

  useEffect(() => {
    return () => {
      revokeTextureUrls(textureUrlMap)
    }
  }, [textureUrlMap])

  const resetTextureSelection = () => {
    setTextureUrlMap((currentMap) => {
      revokeTextureUrls(currentMap)
      return new Map()
    })
    setTextureDebug({
      requestedTextures: [],
      materialMapCount: 0,
      materialCount: 0,
      loadErrors: [],
      fallbackAssignments: [],
    })
    setTextureFolderName('')
    setTextureCount(0)
  }

  const refreshModelUrl = (file: File) => {
    if (modelUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(modelUrl)
    }

    const nextUrl = URL.createObjectURL(file)
    setModelUrl(nextUrl)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const extension = file.name.split('.').pop()?.toLowerCase()

    if (extension !== 'fbx' && extension !== 'obj') {
      setErrorMessage('Please upload an .fbx or .obj file.')
      event.target.value = ''
      return
    }

    resetTextureSelection()
    setModelFile(file)
    refreshModelUrl(file)
    setModelType(extension)
    setFileName(file.name)
    setFileSize(file.size)
    setErrorMessage('')
    event.target.value = ''
  }

  const handleTextureFolderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files

    if (!files || files.length === 0) {
      return
    }

    if (modelType !== 'fbx' || !modelFile) {
      setErrorMessage('Please choose an FBX model first, then select its textures folder.')
      event.target.value = ''
      return
    }

    const { textureUrlMap: nextTextureUrlMap, textureCount: nextTextureCount } = buildTextureUrlMap(files)

    if (nextTextureCount === 0) {
      setErrorMessage('No supported texture files were found in that folder.')
      event.target.value = ''
      return
    }

    setTextureUrlMap((currentMap) => {
      revokeTextureUrls(currentMap)
      return nextTextureUrlMap
    })
    setTextureFolderName(getDirectoryLabel(files))
    setTextureCount(nextTextureCount)
    refreshModelUrl(modelFile)
    setErrorMessage('')
    event.target.value = ''
  }

  const loadDemo = () => {
    setModelFile(null)
    setModelUrl('https://threejs.org/examples/models/obj/male02/male02.obj')
    setModelType('obj')
    setFileName('male02.obj demo')
    setFileSize(0)
    resetTextureSelection()
    setErrorMessage('')
  }

  return (
    <main className="app-shell">
      <section className="app-header">
        <div>
          <p className="eyebrow">Proof of concept integrated into React</p>
          <h1>3D Model Viewer</h1>
          <p className="intro">
            For textured FBX models, first choose the `.fbx` file, then choose the whole
            `textures` folder so the browser can remap texture paths by filename.
          </p>
        </div>
        <div className="status-card">
          <span className="status-label">Current source</span>
          <strong>{fileName || 'No model loaded'}</strong>
          <span>{modelType ? `${modelType.toUpperCase()} viewer ready` : 'Idle'}</span>
          <span>{textureCount > 0 ? `${textureCount} textures mapped` : 'No texture folder selected'}</span>
        </div>
      </section>

      <section className="viewer-layout">
        <aside className="control-panel">
          <div className="panel-block">
            <h2>Controls</h2>
            <p>Use the first button for the model file. For textures, open the folder you want and click Upload to select that whole folder.</p>
          </div>

          <div className="action-group">
            <button
              type="button"
              className="primary-button"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={18} />
              Choose model file
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => textureInputRef.current?.click()}
              disabled={modelType !== 'fbx' || !modelFile}
            >
              <FolderOpen size={18} />
              Choose textures folder
            </button>

            <button type="button" className="secondary-button" onClick={loadDemo}>
              <Box size={18} />
              Load demo model
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => setAutoRotate((value) => !value)}
            >
              <RotateCw size={18} />
              {autoRotate ? 'Stop auto rotate' : 'Start auto rotate'}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".fbx,.obj"
              onChange={handleFileChange}
              hidden
            />

            <input
              {...textureDirectoryProps}
              ref={textureInputRef}
              type="file"
              multiple
              onChange={handleTextureFolderChange}
              hidden
            />
          </div>

          <div className="panel-block meta-block">
            <div>
              <span className="meta-label">File</span>
              <strong>{fileName || 'Waiting for upload'}</strong>
            </div>
            <div>
              <span className="meta-label">Size</span>
              <strong>{fileSize > 0 ? `${(fileSize / 1024 / 1024).toFixed(2)} MB` : 'Demo / n.a.'}</strong>
            </div>
            <div>
              <span className="meta-label">Textures</span>
              <strong>{textureFolderName ? `${textureFolderName} (${textureCount})` : 'Choose a folder after FBX, then press Upload'}</strong>
            </div>
            <div>
              <span className="meta-label">Tips</span>
              <strong>FBX absolute texture paths are remapped by filename with URLModifier</strong>
            </div>
          </div>

          <div className="panel-block debug-block">
            <div className="debug-header">
              <h2>Texture debug</h2>
              <span className="meta-label">Requested {textureDebug.requestedTextures.length}</span>
            </div>
            <p>
              Materials with color maps: {textureDebug.materialMapCount} / {textureDebug.materialCount}
            </p>
            {textureDebug.fallbackAssignments.length > 0 ? (
              <p className="debug-success">
                Fallback assigned {textureDebug.fallbackAssignments.length} texture maps.
              </p>
            ) : null}
            {textureDebug.loadErrors.length > 0 ? (
              <p className="error-banner">Load errors: {textureDebug.loadErrors.join(' | ')}</p>
            ) : null}
            {textureDebug.requestedTextures.length === 0 ? (
              <p className="debug-empty">No FBX texture requests captured yet.</p>
            ) : (
              <div className="debug-list">
                {textureDebug.requestedTextures.map((request) => (
                  <div className="debug-item" key={`${request.requestedUrl}-${request.filename}`}>
                    <strong>{request.filename}</strong>
                    <span className={request.matched ? 'debug-hit' : 'debug-miss'}>
                      {request.matched ? 'matched' : 'missing'}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {textureDebug.fallbackAssignments.length > 0 ? (
              <div className="debug-list">
                {textureDebug.fallbackAssignments.map((assignment) => (
                  <div className="debug-item" key={assignment}>
                    <strong>{assignment}</strong>
                    <span className="debug-hit">applied</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {errorMessage ? <p className="error-banner">{errorMessage}</p> : null}
        </aside>

        <section className="viewer-panel">
          {!modelUrl || !modelType ? (
            <div className="empty-state">
              <Box size={56} />
              <h2>No model loaded</h2>
              <p>Choose a model file first. For FBX textures, choose the whole textures folder next.</p>
            </div>
          ) : (
            <Canvas
              shadows
              camera={{ position: [3, 2, 5], fov: 45 }}
              gl={{ antialias: true, preserveDrawingBuffer: true }}
            >
              <color attach="background" args={['#08121d']} />
              <ambientLight intensity={0.6} />
              <directionalLight
                position={[5, 8, 5]}
                intensity={1.2}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              <directionalLight position={[-4, 3, -4]} intensity={0.4} />

              <AutoFit>
                <Model
                  url={modelUrl}
                  type={modelType}
                  textureUrlMap={textureUrlMap}
                  onTextureDebug={setTextureDebug}
                />
              </AutoFit>
              <Environment preset="city" />

              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
                <planeGeometry args={[20, 20]} />
                <shadowMaterial opacity={0.3} />
              </mesh>

              <OrbitControls
                makeDefault
                autoRotate={autoRotate}
                autoRotateSpeed={1.5}
                enableDamping
                dampingFactor={0.1}
                minDistance={1}
                maxDistance={20}
              />
            </Canvas>
          )}
        </section>
      </section>
    </main>
  )
}

export default App
