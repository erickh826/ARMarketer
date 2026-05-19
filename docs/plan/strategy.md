# 技術與檔案策略

## 4.1 轉檔 Pipeline (必須在 Phase 1 執行)
為了維持高品質 (100MB+ 原檔 -> <10MB 網頁用檔)，導入轉檔 pipeline：
1. 美術上傳高品質 FBX (50~200MB)
2. 自動轉檔：Blender headless → glTF 2.0
3. gltf-transform 最佳化
4. 應用 DRACO 幾何壓縮 + KTX2 貼圖壓縮
5. 前端載入 .glb

## 4.2 效能優化
- CDN 加速、Gzip/Brotli 壓縮。
- 真實進度條顯示。
- Lazy load 與資源釋放 (dispose)。
- Suspense 與 Prefetch。

## 4.3 W3 Pipeline Asset Flow

W3 不只驗證轉檔技術本身，也要驗證資料鏈路是否成立：

1. 原始素材上傳後建立 `MediaAsset`
2. pipeline 執行並產生衍生資產
3. 衍生資產以 `sourceAssetId` 追蹤來源
4. `ARExperience` 以 `mediaAssetId` 指向正式發布內容

詳細流程見 `docs/plan/pipeline-asset-flow.md`。

---

## 4.4 3D 模型載入優化 Pipeline（未來賣點 — 暫緩實作）

> **狀態：Backlog — Phase 2 或更後期**
> 現階段不需處理，但這是相對 ZapWorks 的核心差異化賣點，需追蹤。

### 背景

ZapWorks 要求使用者自行處理 3D 模型，且不提供從原始大檔（數百 MB FBX/OBJ）到 AR 可用狀態的完整優化鏈路。**我們的平台若能提供自動化優化 pipeline，即是產品賣點。**

### 問題核心

原始模型（100~500 MB）不可能直接用於行動 AR，中間必須有：

| 步驟 | 目的 |
|---|---|
| Geometry decimation / LOD | 減少頂點數 |
| Texture baking + KTX2 壓縮 | 減少貼圖記憶體 |
| DRACO 幾何壓縮 | 減少傳輸體積 |
| 目標大小 < 10 MB（行動裝置） | 可在 3~7s 內完成載入 |

### 前端 Service 架構（待設計）

未來可引入獨立的 `ModelLoaderService`，將現有分散在 React hooks（`useGLTF`、`useFBX`、`useLoader`）的邏輯收攏：

- **快取管理**：避免 remount 重複 fetch
- **載入佇列 + AbortController**：可中止大型模型的下載
- **TTR 指標追蹤**：對應 < 3s / 3–7s / > 10s 分級標準
- **格式協商**：自動選擇最佳格式（GLB > FBX > OBJ）

```
src/services/model-loader.service.ts
src/hooks/useModelLoader.ts   ← 取代現有的 useGLTF / useFBX 直接呼叫
```

### 與後端 Pipeline 的接口

- `server/services/media-asset.service.ts` 已有 lineage 追蹤設計
- 未來 `MediaAsset` 可攜帶 `optimizedUrl`（< 10 MB GLB）與 `sourceUrl`（原始檔）
- 前端 `ModelLoaderService` 優先讀 `optimizedUrl`，fallback 到 `sourceUrl`

### 何時實作

- 需支援 > 50 MB 原始模型的客戶上傳流程時
- 進入 Phase 2 效能驗收門檻時
- 或有客戶明確提出 ZapWorks 比較需求時
