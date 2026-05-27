# Upload Smoke Test

本文件提供一個最小可操作的 upload smoke test，用來驗證目前 backend skeleton 的三段流程是否接通：

1. `POST /api/assets/upload`
2. `PUT /uploads/...`
3. `GET /uploads/...`

## 目的

- 確認 upload authorization API 可正常回傳 `uploadUrl` 與 `publicUrl`
- 確認 local upload route 可接受檔案寫入
- 確認 `publicUrl` 可以把剛剛上傳的檔案讀回來

## 前提

- 需要有一個實際執行中的 host，能提供下列 routes：
  - `POST /api/assets/upload`
  - `PUT /uploads/[...path]`
  - `GET /uploads/[...path]`
- 目前 repo 主體是 Vite app，server routes 是 example code。
- 如果你還沒有把 example routes 掛進 Next.js app，這份 smoke test 只能先當操作說明，不能直接在目前 Vite dev server 上執行。

## 測試重點

這是 transport smoke test，不是內容正確性測試。

- 可以先上傳一個假的 `.glb` 檔案名稱
- 不要求檔案本身真的能被 3D Viewer 載入
- 只驗證 API、local storage、public readback 這條鏈路是否打通

## PowerShell 範例

### 1. 準備測試檔

```powershell
New-Item -ItemType Directory -Force -Path .tmp | Out-Null
Set-Content -Path .tmp\smoke-test.glb -Value 'smoke-test-payload' -NoNewline
$file = Get-Item .tmp\smoke-test.glb
```

### 2. 取得 upload authorization

```powershell
$body = @{
  projectId = 'REPLACE_WITH_REAL_PROJECT_ID'
  name = 'smoke-test.glb'
  kind = 'MODEL_3D'
  originalFilename = 'smoke-test.glb'
  mimeType = 'model/gltf-binary'
  fileSizeBytes = $file.Length
  sourceFormat = 'glb'
} | ConvertTo-Json

$response = Invoke-RestMethod \
  -Uri 'http://localhost:3000/api/assets/upload' \
  -Method Post \
  -ContentType 'application/json' \
  -Body $body

$response | ConvertTo-Json -Depth 6
```

### 3. 把檔案 PUT 到 uploadUrl

```powershell
$headers = @{}
foreach ($property in $response.upload.headers.PSObject.Properties) {
  $headers[$property.Name] = [string]$property.Value
}

Invoke-WebRequest \
  -Uri $response.upload.uploadUrl \
  -Method Put \
  -InFile .tmp\smoke-test.glb \
  -Headers $headers \
  -ContentType 'model/gltf-binary'
```

預期結果：HTTP `204`

### 4. 從 publicUrl 讀回來

```powershell
$download = Invoke-WebRequest -Uri $response.upload.publicUrl -Method Get
$download.StatusCode
$download.Content
```

預期結果：

- `StatusCode = 200`
- `Content = smoke-test-payload`

## 成功條件

- `POST /api/assets/upload` 回 `201`
- `PUT uploadUrl` 回 `204`
- `GET publicUrl` 回 `200`
- 讀回內容與上傳內容一致

## 失敗時先看哪裡

### `POST /api/assets/upload` 失敗

- `projectId` 是否存在
- request body 是否缺 `originalFilename`、`mimeType`、`kind`
- `fileSizeBytes` 是否為正數，且不超過 500 MB

### `PUT uploadUrl` 失敗

- host 是否真的有掛 `/uploads/[...path]` route
- `uploadUrl` 是否指向正確 host
- request header 是否帶了 `content-type`

### `GET publicUrl` 失敗

- local upload route 是否真的把檔案寫進 `LOCAL_UPLOAD_DIR` 或 `.local/uploads`
- `publicUrl` 是否和目前 host 對應
- path 是否被錯誤轉換

## 目前已知限制

- 目前 skeleton 會在 upload authorization 階段先建立 `MediaAsset` placeholder，還沒做 upload 完成確認。
- 目前 smoke test 只能證明 transport 通了，不能證明資料庫中的資產真的已完成上傳。
- 目前也還沒有驗證 checksum、實際 MIME、實際 bytes 是否與宣告一致。