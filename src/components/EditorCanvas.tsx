import { Suspense, useEffect } from 'react'
import { Canvas, useLoader, ThreeEvent } from '@react-three/fiber'
import {
  OrbitControls,
  PerspectiveCamera,
  useProgress,
  Html,
  Stage,
  useGLTF,
} from '@react-three/drei'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import * as THREE from 'three'
import type { Hotspot, Vec3 } from './HotspotEditor'

useGLTF.setDecoderPath('/draco/')

const EMPTY_TEXTURE_DATA_URL = 'data:image/gif;base64,R0lGODlhAQABAAAAACw='

const Loader = () => {
  const { progress } = useProgress()
  return (
    <Html center>
      <div style={{
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '0.5rem',
        minWidth: '200px',
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: '0.5rem' }}>載入中...</div>
        <div style={{ background: '#374151', borderRadius: '4px', overflow: 'hidden', height: '6px' }}>
          <div style={{ background: '#3b82f6', height: '100%', width: `${progress}%`, transition: 'width 0.2s' }} />
        </div>
      </div>
    </Html>
  )
}

interface HotspotMarkerProps {
  hotspot: Hotspot
  selected: boolean
  onSelect: () => void
}

const HotspotMarker = ({ hotspot, selected, onSelect }: HotspotMarkerProps) => (
  <Html position={[hotspot.position.x, hotspot.position.y, hotspot.position.z]} center>
    <button
      onClick={(e) => { e.stopPropagation(); onSelect() }}
      title={hotspot.title}
      style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        border: selected ? '3px solid #fff' : '2px solid #fff',
        background: selected ? '#3b82f6' : '#f59e0b',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
        transform: selected ? 'scale(1.2)' : 'scale(1)',
        transition: 'all 0.15s',
      }}
    >
      ●
    </button>
  </Html>
)

interface InteractiveModelProps {
  url: string
  type: 'obj' | 'glb'
  addMode: boolean
  hotspots: Hotspot[]
  selectedId: string | null
  onPlaced: (pos: Vec3) => void
  onSelectHotspot: (id: string) => void
}

const GLBInteractive = ({
  url, addMode, hotspots, selectedId, onPlaced, onSelectHotspot,
}: Omit<InteractiveModelProps, 'type'>) => {
  const gltf = useGLTF(url, true)

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!addMode) return
    e.stopPropagation()
    onPlaced({ x: e.point.x, y: e.point.y, z: e.point.z })
  }

  return (
    <>
      <primitive object={gltf.scene} onClick={handleClick} />
      {hotspots.map((h) => (
        <HotspotMarker
          key={h.id}
          hotspot={h}
          selected={h.id === selectedId}
          onSelect={() => onSelectHotspot(h.id)}
        />
      ))}
    </>
  )
}

const OBJInteractive = ({
  url, addMode, hotspots, selectedId, onPlaced, onSelectHotspot,
}: Omit<InteractiveModelProps, 'type'>) => {
  const obj = useLoader(OBJLoader, url)

  useEffect(() => {
    return () => {
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
        }
      })
    }
  }, [obj])

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!addMode) return
    e.stopPropagation()
    onPlaced({ x: e.point.x, y: e.point.y, z: e.point.z })
  }

  return (
    <>
      <primitive object={obj} onClick={handleClick} />
      {hotspots.map((h) => (
        <HotspotMarker
          key={h.id}
          hotspot={h}
          selected={h.id === selectedId}
          onSelect={() => onSelectHotspot(h.id)}
        />
      ))}
    </>
  )
}

interface EditorCanvasProps {
  assetUrl: string
  assetType: 'obj' | 'glb'
  addMode: boolean
  hotspots: Hotspot[]
  selectedId: string | null
  onPlaced: (pos: Vec3) => void
  onSelectHotspot: (id: string) => void
}

export const EditorCanvas = ({
  assetUrl, assetType, addMode, hotspots, selectedId, onPlaced, onSelectHotspot,
}: EditorCanvasProps) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      cursor: addMode ? 'crosshair' : 'default',
      position: 'relative',
    }}>
      {addMode && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(59,130,246,0.9)',
          color: 'white',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '13px',
          zIndex: 10,
          pointerEvents: 'none',
        }}>
          模型上點擊以放置 Hotspot
        </div>
      )}
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        <Suspense fallback={<Loader />}>
          <Stage environment="city" intensity={0.5}>
            {assetType === 'glb' ? (
              <GLBInteractive
                url={assetUrl}
                addMode={addMode}
                hotspots={hotspots}
                selectedId={selectedId}
                onPlaced={onPlaced}
                onSelectHotspot={onSelectHotspot}
              />
            ) : (
              <OBJInteractive
                url={assetUrl}
                addMode={addMode}
                hotspots={hotspots}
                selectedId={selectedId}
                onPlaced={onPlaced}
                onSelectHotspot={onSelectHotspot}
              />
            )}
          </Stage>
        </Suspense>
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
      </Canvas>
    </div>
  )
}
