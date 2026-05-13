# W3 Pipeline Asset Flow

本文件定義 W3 Blender Docker Pipeline 的資產流，目標是把「原始高品質素材」轉成「可發布的 Web 資產」，並可在 CMS / Viewer / Prisma schema 中追蹤完整來源。

## 1. 目標

- 支援高品質原始素材上傳。
- 產生可發布的 GLB / 全景 / 影片資產。
- 讓每個發布內容都能追溯到原始檔與轉檔流程。

## 2. 核心資料流

1. 使用者在 CMS 上傳原始素材。
2. 系統建立一筆 `MediaAsset`，狀態為 `UPLOADED`。
3. 系統派送轉檔工作，寫入 `processingJobId`，狀態改為 `PROCESSING`。
4. Pipeline 執行 Blender / gltf-transform / Draco / KTX2。
5. 產生轉檔結果後，建立新的 `MediaAsset`，並以 `sourceAssetId` 指向原始資產。
6. 若轉檔成功，轉檔資產狀態標記為 `READY`。
7. `ARExperience` 以 `mediaAssetId` 關聯要實際展示的資產。

## 3. 資產類型對應

| 使用情境 | contentType | MediaAsset.kind | 主要輸出 |
| :--- | :--- | :--- | :--- |
| 3D 模型 AR / Viewer | `MODEL_3D` | `MODEL_3D` | `glb` |
| 360 全景 | `PANORAMA_360` | `PANORAMA_360` | 最佳化全景圖 |
| 360 影片 | `VIDEO_360` | `VIDEO_360` | HLS / mp4 輸出 |

## 4. Prisma 對應原則

- `MediaAsset` 表示真正可追蹤的素材實體。
- `sourceAssetId` 表示素材 lineage，例如：FBX -> GLB。
- `ARExperience.mediaAssetId` 表示目前體驗實際使用的內容資產。
- `ARExperience.contentSceneId` 不承載主要素材 URL，只保留作為 viewer / scene 的輔助 key。

## 5. W3 產出要求

W3 至少要交付以下內容：

- 1 條可執行的 Blender Docker pipeline。
- 1 個從原始 FBX 到 GLB 的成功案例。
- 1 組 Prisma / CMS / Viewer 可以串起來的 `MediaAsset` 資料鏈路。
- 轉檔前後檔案大小與畫質比較紀錄。

## 6. 狀態轉移

### 原始資產

- `UPLOADED`：完成上傳，等待處理。
- `PROCESSING`：pipeline 執行中。
- `FAILED`：轉檔失敗，需要重試或人工檢查。

### 轉檔資產

- `READY`：可供 Viewer / ARExperience 正式使用。
- `FAILED`：輸出不可用。

## 7. 最小流程示例

### 範例 A：FBX 轉 GLB

1. 上傳 `memorial-statue.fbx`
2. 建立原始 `MediaAsset`
3. Pipeline 壓縮並輸出 `memorial-statue.glb`
4. 建立衍生 `MediaAsset`
5. `ARExperience.mediaAssetId` 指向 GLB

### 範例 B：360 影片

1. 上傳原始 360 影片
2. 建立原始 `MediaAsset`
3. Pipeline 轉為可串流版本
4. 建立衍生 `MediaAsset`
5. `ARExperience.contentType = VIDEO_360`

## 8. Gate 3 驗收建議

- 能清楚辨識原始資產與轉檔資產。
- 至少一筆 `MediaAsset` lineage 可被完整追蹤。
- `ARExperience` 能連到正確的可發布資產，而不是靠硬編碼 URL。
- 壓縮後檔案大小與畫質達到 W3 目標。