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
