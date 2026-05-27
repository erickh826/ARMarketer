# Cursor Review Navigation

本文件只整理這次由我處理的內容，方便其他 model 快速 review。

## 1. 本次我處理的範圍

### A. Phase 1 規劃文件整理

- 目的：把原本過於簡略的 W1-W10 / 三條工作流摘要，整理成可執行的 MVP Phase 1 計劃。
- 主要內容：
  - 補上 Phase 1 目標與成功定義。
  - 對齊 system_plan、overview、architecture、strategy、validation。
  - 補上 10 週節奏、交付物、驗收指標、風險與應對。

涉及檔案：

- docs/plan/phase_plan/phase1.md

### B. W2 副線 Prisma Schema 骨架

- 目的：為後續 CMS 建立 Project、ImageTarget、ARExperience 的資料模型骨架。
- 主要內容：
  - 安裝 Prisma 與 @prisma/client。
  - 建立 Prisma 7 的 config 檔。
  - 建立 schema.prisma，先定義核心 enum、relations、index。
  - 補一份 .env.example 供本地後續接資料庫。

涉及檔案：

- package.json
- package-lock.json
- prisma.config.ts
- prisma/schema.prisma
- .env.example

## 2. 目前狀態

### 已完成

- docs/plan/phase_plan/phase1.md 已從摘要版整理成可 review 的正式計劃草案。
- Prisma 套件已加進 repo。
- Prisma schema 初稿已建立。

### 尚未確認完成

- npx prisma validate 目前尚未被我確認為成功通過。
- 目前 terminal 最後狀態顯示 prisma validate exit code = 1，所以 schema/config/env 還需要 reviewer 再確認一次。

## 3. Reviewer 建議先看什麼

### 規劃文件 review

先看：

- docs/plan/phase_plan/phase1.md

請重點檢查：

- 是否與 system_plan.md 的總方向一致。
- W2 到 W10 的節奏是否合理。
- 驗收指標是否過度樂觀或缺少依賴條件。
- Phase 1 是否真的聚焦在 MVP，而不是把範圍拉太大。

### Schema review

先看：

- prisma/schema.prisma
- prisma.config.ts
- .env.example

請重點檢查：

- Project、ImageTarget、ARExperience 的 relation 是否符合未來 CMS 使用方式。
- boundExperience 與 imageTarget / experience 的雙向關係是否過度複雜。
- enum 命名與 contentType 是否足夠支援後續內容型別。
- Prisma 7 config 寫法是否正確。
- validate 失敗是不是單純因為 DATABASE_URL / env 問題，還是 schema relation 本身有錯。

## 4. 不在我這次處理核心範圍內的部分

以下內容不是我這次 review 導航的主體，但 repo 目前也有變更，review 時要分開看：

- src/App.tsx
- src/components/ModelViewer.tsx
- public/concrete-rubble-scan/**

這些比較像是任務 A 或其他模型產生的前端 / 資產改動，不建議和我的 Prisma / planning 變更混在一起評估。

## 5. 建議 review 結論格式

其他 model 如果要回覆，建議至少回答這四件事：

1. phase1.md 是否方向正確。
2. prisma/schema.prisma 的 relation 是否合理。
3. prisma validate 失敗最可能的根因是什麼。
4. 下一步應先修 schema，還是先補 API / migration 流程。