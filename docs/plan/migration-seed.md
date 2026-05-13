# Migration 與 Seed 規劃

本文件定義 ARMarketer 在 W2-W3 的資料庫初始化策略，目標是讓 Prisma schema 不只可驗證，也能順利進入 migration、seed 與本地開發流程。

## 1. 目標

- 建立可重複執行的 Prisma migration 流程。
- 建立最小 seed 資料，支援 CMS 與 Viewer 開發。
- 降低 schema 快速變動時對開發節奏的影響。

## 2. Migration 原則

- W2 以核心模型為先：Project、ImageTarget、MediaAsset、ARExperience。
- schema 先穩定關聯與欄位責任，再建立第一版 migration。
- migration 命名應以功能為中心，例如：`init_core_models`、`add_media_asset_lineage`。
- 在 W2-W3 期間避免頻繁 rewrite 舊 migration，除非尚未進入共享環境。

## 3. 第一版 Migration 建議範圍

第一版 migration 應至少包含：

- `Project`
- `ImageTarget`
- `MediaAsset`
- `ARExperience`
- 所有 enum：
  - `ImageTargetCompileStatus`
  - `ARContentType`
  - `MediaAssetKind`
  - `MediaAssetStatus`
  - `StorageProvider`

## 4. Seed 資料策略

Seed 不應追求完整業務資料，而應優先滿足開發與驗證流程。

### 4.1 最小 Seed 集

- 1 個 `Project`
- 1 個 `ImageTarget`
- 2 個 `MediaAsset`
  - 1 筆原始 FBX / OBJ 素材
  - 1 筆由原始素材導出的 GLB
- 1 個 `ARExperience`
  - 關聯 `Project`
  - 關聯 `ImageTarget`
  - 關聯 `mediaAssetId`

### 4.2 Seed 用途

- 驗證 CMS 列表頁與 detail 頁。
- 驗證 Viewer 取用 `ARExperience -> MediaAsset` 的鏈路。
- 驗證 pipeline 完成後，`MediaAsset` lineage 是否能被追蹤。

## 5. W2-W3 實作順序

1. 完成 schema 定稿。
2. 建立第一版 migration。
3. 建立 seed script。
4. 以 seed 資料串 CMS 基礎頁面與 Viewer。
5. 等 W3 pipeline 穩定後，再補 processing metadata 與 job 狀態欄位。

## 6. 建議的 Seed 欄位內容

### Project

- `name`: Demo Memorial Card
- `slug`: demo-memorial-card

### ImageTarget

- `name`: Front Card Target
- `sourceImageUrl`: 測試 target image URL
- `compileStatus`: `READY`
- `compiledMindUrl`: 測試 `.mind` URL

### MediaAsset（原始檔）

- `kind`: `MODEL_3D`
- `originalFilename`: `demo-model.fbx`
- `sourceFormat`: `fbx`
- `status`: `UPLOADED`

### MediaAsset（轉檔檔）

- `kind`: `MODEL_3D`
- `processedFormat`: `glb`
- `status`: `READY`
- `sourceAssetId`: 指向原始檔

### ARExperience

- `contentType`: `MODEL_3D`
- `mediaAssetId`: 指向 GLB 資產
- `contentSceneId`: 可為空，或只存 viewer 內部場景 key

## 7. 風險與控制

- 若 schema 尚未穩定，不要過早擴大 seed 數量。
- 若 pipeline 尚未完成，不要把 seed 綁死在真實轉檔結果。
- 若 content 模型仍在調整，seed 的目的是驗證資料鏈路，而不是模擬完整 production 資料。

## 8. 結論

W2-W3 的 migration / seed 工作重點，不是把資料庫一次做滿，而是先讓 schema、migration、seed、Viewer、CMS 形成一條可反覆驗證的最小鏈路。