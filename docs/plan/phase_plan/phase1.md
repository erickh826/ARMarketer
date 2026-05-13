# Phase 1 Plan — MVP（10 週）執行計劃

本文件依據 system_plan.md、docs/plan/phases.md、docs/plan/overview.md、docs/plan/architecture.md、docs/plan/strategy.md 與 docs/plan/validation.md 整理，目的是把 Phase 1 從概念規劃落成可執行的 MVP 路線圖。

## 1. Phase 1 目標

Phase 1 的核心任務不是一次把平台做完，而是先驗證三件最關鍵的事情：

1. Image Tracking AR 是否能在手機瀏覽器穩定成立。
2. 高品質 3D 素材是否能從 100MB+ 原檔轉成可上線的 Web 資產。
3. 最終是否能以 CMS + Viewer + Pipeline 的串接流程，重建至少 3 張舊 Zapworks 紀念卡。

## 2. Phase 1 成功定義

本階段結束時，至少要達成以下成果：

- Marketing 可上傳印刷品圖與 3D 素材，建立 AR 體驗。
- 手機瀏覽器掃描印刷卡片後，3D 內容可於 3 秒內顯示。
- 100MB FBX 可在 5 分鐘內完成轉檔，輸出檔案目標小於 10MB。
- 轉檔後畫質由美術驗收為等同或優於 Zapworks。
- 至少 3 張舊紀念卡完成重製並可對外展示。

## 3. 工作流拆分

### 3.1 前端 / AR Viewer 流

- 目標：建立可在手機瀏覽器上運作的 3D / AR Viewer。
- 技術：React、Vite、Three.js、React Three Fiber、MindAR。
- 主要責任：
    - 建立 FBX / OBJ / GLB 檢視與載入流程。
    - 建立 Image Tracking AR Viewer。
    - 處理行動裝置效能、載入進度與資源釋放。
- 主要風險：MindAR 穩定度不足、行動裝置 GPU / 記憶體限制。

### 3.2 後端 / CMS 流

- 目標：建立可管理素材、目標圖與 AR 體驗的後台基礎。
- 技術方向：Node.js + Express 或 Next.js API、Prisma、PostgreSQL、S3 / R2。
- 主要責任：
    - 建立 Project、ImageTarget、ARExperience 的資料模型。
    - 建立素材上傳、目標圖管理、體驗 CRUD。
    - 串接轉檔與發布流程。
- 主要風險：資料模型過早定死、檔案上傳與狀態同步複雜度提升。

### 3.3 轉檔 Pipeline 流

- 目標：將高品質原始模型轉成可上線的 Web 資產。
- 技術：Blender Headless、gltf-transform、Draco、KTX2、Docker。
- 主要責任：
    - 支援 FBX / OBJ 輸入，輸出 glb。
    - 建立壓縮與最佳化流程。
    - 將轉檔結果回寫 CMS，供 Viewer 載入。
- 主要風險：轉檔時間過長、貼圖品質下降、壓縮後材質失真。

## 4. 10 週執行節奏

| 週次 | 前端 / AR 主線 | 後端 / CMS 副線 | 交付物 | Gate / 檢查點 |
| :--- | :--- | :--- | :--- | :--- |
| W1 | MindAR POC（舊紀念卡實測） | 建立基礎 infra 規劃、儲存與部署方式 | MindAR Demo、裝置測試紀錄 | Gate 1：MindAR 在主要手機可穩定辨識 |
| W2 | FBX Viewer POC + 效能測試 | Auth 與核心 Schema 起稿 | Viewer POC、100MB 載入測試報告 | Gate 2：100MB 素材可載入並可操作 |
| W3 | 串接 glb 載入驗證 | Project / ImageTarget / ARExperience schema 定稿 | Blender Docker Pipeline POC | Gate 3：轉檔結果可控制在 <10MB 且品質可接受 |
| W4 | 360 Viewer + Hotspot POC | Asset Upload API、檔案儲存串接 | 全景內容可獨立發布 | Viewer 與素材上傳首次串通 |
| W5 | Hotspot 編輯器 UI | ImageTarget 管理介面 / API | 編輯器初版、Target 管理頁 | 可建立可編輯內容骨架 |
| W6 | AR Experience Viewer | ARExperience CRUD 與發布資料流 | Viewer 可讀取正式資料 | AR 體驗可從 CMS 發布 |
| W7 | AR 卡片產生器 UI | 分享連結 / QR Code | 分享頁與 QR 產生流程 | 體驗可交付給外部使用者 |
| W8 | Mobile UX、錯誤處理、載入狀態 | 權限控管、資料狀態管理 | 響應式與錯誤處理完成 | 主要使用流程穩定 |
| W9 | 3 張舊紀念卡重製驗收 | 壓測、快取、CDN 驗證 | 3 個可展示案例 | Gate 4：驗收條件達標 |
| W10 | 修正缺陷、部署、展示包裝 | 監控、備份、上線檢查 | MVP 上線版本 | 正式上線 |

## 5. 每週關鍵輸出

### W1-W3：技術風險驗證期

- 先驗證 AR 辨識、模型載入與自動轉檔三條風險最高的技術線。
- 此階段不追求完整 UI，優先取得可量化測試結果。
- 交付形式以 POC、測試紀錄、轉檔樣本與裝置清單為主。

### W4-W7：功能串接成形期

- 將 Viewer、CMS、Pipeline 串成單一內容流程。
- 逐步把單點功能轉為「可建立體驗、可發布、可分享」的完整路徑。
- 交付形式以內部可操作頁面、API 與內容流為主。

### W8-W10：驗收與上線期

- 集中處理行動裝置體驗、權限、穩定性與部署品質。
- 驗證是否能以新平台重做實際業務案例。
- 交付形式以驗收案例、部署環境與操作文件為主。

## 6. 主要交付物清單

- MindAR 行動裝置實測報告。
- 100MB 級模型 Viewer POC 與載入效能紀錄。
- Blender Docker 轉檔流程與 glb 產物樣本。
- ImageTarget / ARExperience / Project 資料模型與 CRUD API。
- 資產上傳、轉檔、發布、分享的端到端流程。
- 至少 3 張舊 Zapworks 紀念卡重製案例。
- MVP 正式部署版本。

## 7. 驗收指標

### 技術驗收

- 首屏顯示時間小於 5 秒。
- 主要內容完整載入時間小於 30 秒。
- Image Tracking 後 3D 內容在 3 秒內顯示。
- 100MB FBX 轉檔時間小於 5 分鐘。
- 轉檔輸出檔案目標小於 10MB。

### 業務驗收

- 內容團隊可自行建立並管理 AR 體驗。
- 新平台可支援年度常態型 AR 紀念卡專案。
- 平台畫質與體驗需達到可替代 Zapworks 的水準。

## 8. 風險與應對

| 風險 | 說明 | 應對 |
| :--- | :--- | :--- |
| MindAR 辨識不穩 | 不同手機對 image tracking 表現差異大 | W1 提前做多機測試，不過關就評估 Zappar SDK |
| 模型過大導致手機卡頓 | 原始素材可能超過行動裝置負荷 | 優先推進 glb、Draco、KTX2、Lazy Load 與 Dispose |
| 轉檔後材質品質下降 | 壓縮可能造成貼圖或材質失真 | 建立美術驗收機制，保留可調壓縮參數 |
| 舊專案無法直接遷移 | Zapworks 卡片不能直接搬移 | 以 3 張代表案例重製，建立標準重建流程 |
| 功能面太廣導致 MVP 失焦 | 同時做 AR、CMS、VR、全景容易分散 | 以「AR 體驗發布鏈路」為唯一 Phase 1 主軸 |

## 9. 執行原則

- 先驗證風險，再擴充功能。
- 先完成端到端流程，再優化 UI 完整度。
- 優先支援手機瀏覽器體驗，不先追求桌面進階功能。
- 每週至少保留一個可展示成果，避免只累積不可見技術工作。

## 10. 建議的 Phase 1 完成標準

若 Phase 1 結束時滿足以下條件，即可視為可進入下一階段：

- 已有穩定可展示的手機 Web AR 體驗。
- 內容建立流程已可由內部團隊重複操作。
- 3D 素材品質與載入效率已達商用最低門檻。
- 既有 Zapworks 案例已成功重建至少 3 件。
- 部署環境、監控與備份機制已具備基本上線條件。