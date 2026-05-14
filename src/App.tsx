import { ModelViewer } from './components/ModelViewer';

function App() {
  // OBJ smoke test
  // const model = {
  //   url: "/concrete-rubble-scan/source/Rubble_Scan_2/Rubble_Scan_2.obj",
  //   type: "obj" as const,
  //   textureUrl: "/concrete-rubble-scan/textures/tex_u1_v1_diffuse.jpg",
  //   normalUrl: "/concrete-rubble-scan/textures/tex_u1_v1_normal.jpg"
  // };

  // GLB smoke test (TASK-001A)
  const model = {
    url: "/test-assets/test-cube.glb",
    type: "glb" as const
  };

  return (
    <main style={{ width: '100%', height: '100vh' }}>
      <ModelViewer 
        url={model.url} 
        type={model.type} 
        textureUrl={'textureUrl' in model ? (model as { textureUrl?: string }).textureUrl : undefined}
        normalUrl={'normalUrl' in model ? (model as { normalUrl?: string }).normalUrl : undefined}
      />
    </main>
  );
}

export default App;
