import { ModelViewer } from './components/ModelViewer';

type ModelType = 'obj' | 'fbx' | 'glb';

type ModelConfig = {
  url: string;
  type: ModelType;
  textureUrl?: string;
  normalUrl?: string;
};

const DEFAULT_MODEL: ModelConfig = {
  url: '/test-assets/test-cube.glb',
  type: 'glb'
};

function isModelType(value: string | null): value is ModelType {
  return value === 'obj' || value === 'fbx' || value === 'glb';
}

function inferModelType(url: string): ModelType | undefined {
  const normalizedUrl = url.toLowerCase();

  if (normalizedUrl.endsWith('.obj')) {
    return 'obj';
  }

  if (normalizedUrl.endsWith('.fbx')) {
    return 'fbx';
  }

  if (normalizedUrl.endsWith('.glb') || normalizedUrl.endsWith('.gltf')) {
    return 'glb';
  }

  return undefined;
}

function getModelFromSearchParams(): ModelConfig {
  const searchParams = new URLSearchParams(window.location.search);
  const requestedUrl = searchParams.get('url') ?? searchParams.get('model');
  const requestedType = searchParams.get('type');

  if (!requestedUrl) {
    return DEFAULT_MODEL;
  }

  const type = isModelType(requestedType)
    ? requestedType
    : inferModelType(requestedUrl) ?? DEFAULT_MODEL.type;

  return {
    url: requestedUrl,
    type,
    textureUrl: searchParams.get('textureUrl') ?? searchParams.get('texture') ?? undefined,
    normalUrl: searchParams.get('normalUrl') ?? searchParams.get('normal') ?? undefined
  };
}

function App() {
  const model = getModelFromSearchParams();

  return (
    <main style={{ width: '100%', height: '100vh' }}>
      <ModelViewer 
        url={model.url} 
        type={model.type} 
        textureUrl={model.textureUrl}
        normalUrl={model.normalUrl}
      />
    </main>
  );
}

export default App;
