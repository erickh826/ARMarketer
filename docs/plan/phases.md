# 分階段開發計劃

## Phase 1 — MVP (10 週) — 風險優先路線

| 週次 | 主線 (AR/前端) | 副線 (後端/CMS) | 里程碑 / Gate |
| :--- | :--- | :--- | :--- |
| W1 | MindAR POC (舊紀念卡實測) | 基礎設施 (S3, CI/CD) | 🚦 Gate 1：MindAR 過關？ |
| W2 | FBX viewer POC + 效能測試 | Auth + Schema | 🚦 Gate 2：100MB FBX 可跑？ |
| W3 | Blender Docker Pipeline (DRACO/KTX2) | CRUD API | 🚦 Gate 3：轉檔 < 10MB 且畫質認可？ |
| W4 | 360° 全景 viewer + Hotspot | Asset 上傳 + 轉檔串接 | 全景 End-to-End |
| W5 | Hotspot 編輯器 UI | ImageTarget 管理 | — |
| W6 | AR Experience Viewer | ARExperience CRUD | AR 體驗發布 |
| W7 | AR 卡片產生器 UI | 分享連結 / QR 產生 | — |
| W8 | 手機響應式、錯誤處理 | 權限控管 | — |
| W9 | 3 張紀念卡重製驗收 | 壓力測試 / CDN | 🚦 Gate 4：驗收合格 |
| W10 | Bug fix、部署 | 監控、備份 | 🎯 上線 |

## Phase 2 — 效能、VR 與進階功能
在 MVP 穩定後，Phase 2 將進行深度優化與體驗擴展：
- **WebXR VR 模式：** 支援 Quest Browser 的 VR 場景漫遊。
- **360° 影片 Streaming：** HLS 動態串流，解決超大體積影片載入問題。
- **深度優化：** 針對多種 Android 機種進行 Shader 與記憶體回收機制優化。
- **進階 AR 交互：** 加入物理碰撞、簡單物件動畫控制。
