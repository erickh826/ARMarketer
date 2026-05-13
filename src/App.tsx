import { ModelViewer } from './components/ModelViewer';

function App() {
  const testModel = {
    url: "/concrete-rubble-scan/source/Rubble_Scan_2/Rubble_Scan_2.obj",
    type: "obj" as const,
    textureUrl: "/concrete-rubble-scan/textures/tex_u1_v1_diffuse.jpg",
    normalUrl: "/concrete-rubble-scan/textures/tex_u1_v1_normal.jpg"
  };

  return (
    <main style={{ width: '100%', height: '100vh' }}>
      <ModelViewer 
        url={testModel.url} 
        type={testModel.type} 
        textureUrl={testModel.textureUrl} 
        normalUrl={testModel.normalUrl} 
      />
    </main>
  );
}

export default App;
