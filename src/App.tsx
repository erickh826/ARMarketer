import { ModelViewer } from './components/ModelViewer';

function App() {
  // 這裡可以更改測試用的模型 URL 與 類型
  // 如果你有 test.obj 在 public 資料夾，請將 url 改為 "/test.obj"
  const testModel = {
    url: "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/fbx/Samba%20Dancing.fbx",
    type: "fbx" as const
  };

  return (
    <main style={{ width: '100%', height: '100vh' }}>
      <ModelViewer url={testModel.url} type={testModel.type} />
    </main>
  );
}

export default App;
