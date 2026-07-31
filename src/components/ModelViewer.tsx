import React, { Suspense, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useProgress, Html, Stage, useFBX, useGLTF } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import * as THREE from 'three';

// Use locally-served Draco decoder for reproducible load-time measurements.
// Avoids CDN latency variance that would corrupt Gate 2 TTR results.
useGLTF.setDecoderPath('/draco/');

const EMPTY_TEXTURE_DATA_URL = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';

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
  textureUrl?: string;
  normalUrl?: string;
}

const cleanMaterial = (material: THREE.Material) => {
  material.dispose();
  Object.values(material).forEach((value) => {
    if (value && typeof value === 'object' && 'isTexture' in value && value.isTexture) {
      (value as THREE.Texture).dispose();
    }
  });
};

const OBJModel = ({ url, texture, normal }: { url: string; texture?: THREE.Texture; normal?: THREE.Texture }) => {
  const obj = useLoader(OBJLoader, url);
  
  useEffect(() => {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material as THREE.MeshStandardMaterial;
        if (texture) {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          material.map = texture;
        }
        if (normal) material.normalMap = normal;
        material.needsUpdate = true;
      }
    });

    return () => {
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(cleanMaterial);
          } else {
            cleanMaterial(child.material);
          }
        }
      });
    };
  }, [obj, texture, normal]);

  return <primitive object={obj} />;
};

const FBXModel = ({ url, texture, normal }: { url: string; texture?: THREE.Texture; normal?: THREE.Texture }) => {
  const fbx = useFBX(url);
  
  useEffect(() => {
    fbx.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material as THREE.MeshStandardMaterial;
        if (texture) {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          material.map = texture;
        }
        if (normal) material.normalMap = normal;
        material.needsUpdate = true;
      }
    });

    return () => {
      fbx.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(cleanMaterial);
          } else {
            cleanMaterial(child.material);
          }
        }
      });
    };
  }, [fbx, texture, normal]);

  return <primitive object={fbx} />;
};

const GLBModel = ({ url }: { url: string }) => {
  const gltf = useGLTF(url);

  useEffect(() => {
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => {
            material.needsUpdate = true;
          });
        } else {
          child.material.needsUpdate = true;
        }
      }
    });

    return () => {
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(cleanMaterial);
          } else {
            cleanMaterial(child.material);
          }
        }
      });
    };
  }, [gltf]);

  return <primitive object={gltf.scene} />;
};

const TexturedModelContent = ({ url, type, textureUrl, normalUrl }: ModelProps) => {
  const diffuseTexture = useLoader(THREE.TextureLoader, textureUrl ?? EMPTY_TEXTURE_DATA_URL);
  const normalTexture = useLoader(THREE.TextureLoader, normalUrl ?? EMPTY_TEXTURE_DATA_URL);

  const texture = textureUrl ? diffuseTexture : undefined;
  const normal = normalUrl ? normalTexture : undefined;

  if (type === 'fbx') {
    return <FBXModel url={url} texture={texture} normal={normal} />;
  }

  return <OBJModel url={url} texture={texture} normal={normal} />;
};

const ModelContent = ({ url, type, textureUrl, normalUrl }: ModelProps) => {
  if (type === 'glb') {
    return <GLBModel url={url} />;
  }

  return <TexturedModelContent url={url} type={type} textureUrl={textureUrl} normalUrl={normalUrl} />;
};

interface ModelViewerProps {
  url: string;
  type: 'obj' | 'fbx' | 'glb';
  textureUrl?: string;
  normalUrl?: string;
}

export const ModelViewer: React.FC<ModelViewerProps> = ({ url, type, textureUrl, normalUrl }) => {
  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: '#171717', position: 'relative' }}>
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        <Suspense fallback={<Loader />}>
          <Stage environment="city" intensity={0.5}>
            <ModelContent url={url} type={type} textureUrl={textureUrl} normalUrl={normalUrl} />
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
