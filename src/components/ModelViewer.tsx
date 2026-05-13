import React, { Suspense, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useProgress, Html, Stage, useFBX } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import * as THREE from 'three';

// Loading Progress Component
const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        width: '300px'
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>載入模型中...</div>
        <div style={{ width: '100%', height: '0.5rem', backgroundColor: '#374151', borderRadius: '9999px', overflow: 'hidden' }}>
          <div 
            style={{ 
              height: '100%', 
              backgroundColor: '#3b82f6', 
              transition: 'all 0.3s ease-out',
              width: `${progress}%` 
            }}
          />
        </div>
        <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', fontFamily: 'monospace' }}>{progress.toFixed(1)}%</div>
        <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#9ca3af' }}>正在處理 100MB+ 模型，請稍候</p>
      </div>
    </Html>
  );
};

interface ModelProps {
  url: string;
  type: 'obj' | 'fbx' | 'glb';
}

const Model = ({ url, type }: ModelProps) => {
  let model: THREE.Group | THREE.Object3D;

  if (type === 'fbx') {
    model = useFBX(url);
  } else if (type === 'obj') {
    model = useLoader(OBJLoader, url);
  } else {
    // glb case - simplified for now
    return null; 
  }

  useEffect(() => {
    return () => {
      // Manual cleanup for large models
      model.traverse((child: any) => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (child.material.isMaterial) {
            cleanMaterial(child.material);
          } else if (Array.isArray(child.material)) {
            child.material.forEach(cleanMaterial);
          }
        }
      });
    };
  }, [model]);

  return <primitive object={model} />;
};

const cleanMaterial = (material: any) => {
  material.dispose();
  for (const key of Object.keys(material)) {
    if (material[key]?.isTexture) {
      material[key].dispose();
    }
  }
};

interface ModelViewerProps {
  url: string;
  type: 'obj' | 'fbx' | 'glb';
}

export const ModelViewer: React.FC<ModelViewerProps> = ({ url, type }) => {
  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: '#171717', position: 'relative' }}>
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        <Suspense fallback={<Loader />}>
          <Stage environment="city" intensity={0.5} contactShadow={true}>
            <Model url={url} type={type} />
          </Stage>
        </Suspense>
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
      </Canvas>
      
      {/* UI Overlay */}
      <div style={{ position: 'absolute', top: '1rem', left: '1rem', padding: '1rem', pointerEvents: 'none' }}>
        <h1 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 'bold', backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: '0.5rem', borderRadius: '0.25rem', margin: 0 }}>ARMarketer Viewer POC</h1>
        <p style={{ color: '#d1d5db', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>測試檔案: {url}</p>
      </div>
    </div>
  );
};
