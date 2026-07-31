# Concurrency 問題分析與升級建議

- **建立日期:** 2026-07-15
- **範圍:** Phase 1 現況 codebase（server services、Next example API、Prisma schema、ModelViewer）
- **狀態:** 分析完成，尚未實作
- **相關:** `prisma/schema.prisma`、`server/services/*`、`server/examples/next-app-router/**`、`src/components/ModelViewer.tsx`、`docs/plan/pipeline-asset-flow.md`

---

## 1. 摘要

本專案是 **CMS + 資產管線 + Viewer**。目前 Phase 1 以低並發為主，但核心流程多為 **read → check → write**，缺少條件更新（CAS）、列鎖或樂觀鎖。

Schema 上的 `@unique`（例如 `boundExperienceId`、`storageKey`）只能擋「完全重複寫入」，**擋不住**：

- last-write-wins 靜默覆蓋
- 雙 worker 重複 pipeline / compile
- bind 與 `imageTargetId` 分叉
- 編輯器同時儲存造成的 lost update

> 核心判斷：問題不在「有沒有用 async」，而在 **跨表關係與狀態機沒有原子化寫入護欄**。

---

## 2. 風險總表

| 區域 | 機制 | 嚴重度 | 何時會爆 |
|------|------|--------|----------|
| Target ↔ Experience bind | 先讀後寫、無 transaction lock | **高** | 雙 client 綁定 / unbind 競態（現在就可能） |
| Compile status | 狀態機無 CAS | **中→高** | Phase 2 真 .mind 編譯 + 多 worker |
| MediaAsset / pipeline | 無 job claim、無狀態條件更新 | **高** | 真 pipeline 多 worker 時 |
| Upload + storageKey | `Date.now()` key、presign 與 DB 非原子 | **中** | 並發上傳同檔名 |
| Experience PATCH | 跨 entity 校驗與 update 分離 | **中** | 改 mediaAsset / 改 target / 雙人編輯 |
| Viewer 資源 dispose | 快速切模型 + useGLTF cache | **中** | 快速切換大檔 URL |
| Infra（Redis / 多 instance） | 架構有提、code 未見 | **低→中** | 水平擴展後 |

---

## 3. 問題明細

### 3.1 Target–Experience Binding（P0）

#### 現況

- Schema：`ImageTarget.boundExperienceId` 為可選且 `@unique`（一 experience 最多綁一個 target）。
- API：`POST/DELETE …/targets/[id]/bind`
- 實作：`findById` → 業務檢查 → `imageTargetService.update(...)` 裸寫入。
- 無 `$transaction`、無 `FOR UPDATE`、無條件 `updateMany`。

關鍵路徑：

- `server/examples/next-app-router/app/api/targets/[id]/bind/route.ts`
- `server/services/image-target.service.ts`（僅 generic `update`）

#### 競態場景

| 場景 | 結果 |
|------|------|
| 兩 client 同時把不同 experience 綁到同一 target | **Last write wins**，無 409，靜默覆蓋 |
| 同一 experience 同時綁到兩個 target | `@unique` 擋第二筆；錯誤多半是 generic 422/500，非清楚「已被綁定」 |
| 一邊 unbind、一邊 bind | 最終可能是 `null` 或舊 id，順序不可預期 |
| bind 後 `PATCH experience.imageTargetId` | 1:1 bind 與 `imageTargetId` **可能不一致** |

#### 雙關係一致性

系統同時存在：

1. `ARExperience.imageTargetId` — 多 experience 可指向同一 target（N:1）
2. `ImageTarget.boundExperienceId` — 正式「鎖定」的 1:1

Bind 路由要求 `experience.imageTargetId === targetId`，但之後 PATCH 可改 `imageTargetId`，**不會同步清 bind**。

#### 建議修復

1. 新增 `ImageTargetService.bindExperience` / `unbindExperience`（不要只靠 generic update）。
2. 單一 `$transaction` 內完成校驗 + 寫入。
3. 使用條件更新，例如：

```ts
// 偽代碼：原子綁定
const result = await tx.imageTarget.updateMany({
  where: {
    id: targetId,
    OR: [
      { boundExperienceId: null },
      { boundExperienceId: experienceId }, // 冪等重綁
    ],
  },
  data: { boundExperienceId: experienceId },
})
if (result.count === 0) {
  throw new ConflictError('Target already bound to another experience')
}
```

4. 規則寫清並強制：
   - experience 必須同 project
   - `experience.imageTargetId` 必須等於 target（或在同 transaction 內一併寫入）
   - experience 若已綁在其他 target → 409 或先 unbind 舊 target
5. API 明確回 **409 Conflict**。

#### 驗收建議

- 並發 bind 兩次不同 experience → 恰好一成功、一 409。
- 重複 bind 同一對 → 冪等 200。
- unbind 後可再 bind。
- bind 後改 experience 的 imageTargetId → 被拒，或自動清 `boundExperienceId`（產品需二選一）。

---

### 3.2 Compile Status 狀態機（P1，真編譯前必做）

#### 現況

- Enum：`PENDING | PROCESSING | READY | FAILED`
- Phase 1 stub：`POST …/targets/[id]/compile` 直接設 `READY`
- 僅有記憶體層 check：`if (compileStatus === 'PROCESSING') return 409`

路徑：

- `server/examples/next-app-router/app/api/targets/[id]/compile/route.ts`
- `ImageTargetService.updateCompileStatus`

#### 問題

- check-then-act **非原子**；兩請求同時見非 `PROCESSING` 都會通過。
- DB 無合法狀態轉移約束；任意 code path 可把 `READY` 改回 `PENDING`。
- Phase 1 stub 影響較小；Phase 2 多 worker 會重複編譯或互相覆寫 `compiledMindUrl`。

#### 建議修復

CAS 搶佔：

```ts
const claimed = await prisma.imageTarget.updateMany({
  where: {
    id,
    compileStatus: { in: ['PENDING', 'FAILED', 'READY'] }, // 允許重跑的來源
  },
  data: { compileStatus: 'PROCESSING' },
})
if (claimed.count === 0) {
  // 409 already in progress
}
```

完成時：

```ts
await prisma.imageTarget.updateMany({
  where: { id, compileStatus: 'PROCESSING' },
  data: { compileStatus: 'READY', compiledMindUrl },
})
```

可選：job id / 超時回收 `PROCESSING`。

#### 驗收建議

- 並發 compile → 僅一個進入 `PROCESSING`。
- `PROCESSING` 期間第二次請求 → 409。
- 失敗路徑只能從 `PROCESSING → FAILED`。

---

### 3.3 MediaAsset / Pipeline（P1）

#### 現況（設計 vs 實作）

設計（`docs/plan/pipeline-asset-flow.md`）：

1. 上傳 → `UPLOADED`
2. 派工 → `PROCESSING` + `processingJobId`
3. 產出 derived → `sourceAssetId` + `READY`

實作缺口：

- 無 `claimForProcessing`（條件更新 status + job id）
- `createDerivedAsset` 只驗 source 存在與同 project，不防雙 derived
- `linkDerivedAsset` 無 transaction、無 ownership
- status 可被任意 update，無狀態機
- Viewer 解析：`derivedAssets orderBy updatedAt desc` → 誰後寫完誰被選中

路徑：

- `server/services/media-asset.service.ts`
- `server/examples/next-app-router/app/api/assets/derived/route.ts`

#### 競態場景

| 場景 | 結果 |
|------|------|
| 兩 worker 同時處理同一 `UPLOADED` | 雙轉檔、雙 derived、storage 浪費 |
| 晚到的 `FAILED` 覆蓋已 `READY` | 已可播內容被打回失敗 |
| 多筆 READY derived | Viewer 結果不穩定 |

#### 建議修復

1. **Claim：**

```ts
const claimed = await prisma.mediaAsset.updateMany({
  where: { id, status: 'UPLOADED' },
  data: { status: 'PROCESSING', processingJobId: jobId },
})
if (claimed.count === 0) return // 已被接手
```

2. **Derived 冪等：**  
   例如 unique `(sourceAssetId, processedFormat, profile)` 或依賴 `checksumSha256`；重跑用 upsert。
3. **狀態轉移白名單：**  
   僅允許 `UPLOADED→PROCESSING`、`PROCESSING→READY|FAILED` 等。
4. **Viewer 選片規則固定：**  
   prefer 指定 profile / 最新成功且 checksum 匹配，避免純 `updatedAt` 競態。

#### 驗收建議

- 雙 worker claim 同一 asset → 恰好一個成功。
- 同一 source 重複 register derived（同 profile）→ 冪等，不產生兩列。
- `READY` 後遲到的 `FAILED` 回報不得覆寫（或需明確 reprocess API）。

---

### 3.4 Upload 與 storageKey（P0 小修）

#### 現況

```ts
// storage.service.ts — Local / S3 皆類似
`${directory}/${projectId}/${Date.now()}-${sanitizeFilename(filename)}`
```

流程：`createUploadAuthorization` → `createUploadPlaceholder`（兩步非原子）。

路徑：

- `server/storage/storage.service.ts`
- `server/examples/next-app-router/app/api/assets/upload/route.ts`
- Local PUT：`app/uploads/[...path]/route.ts`（無條件 `writeFile` 覆寫）

#### 問題

1. `Date.now()` 毫秒解析度：同 ms 同檔名 → 同 key；`storageKey @unique` 使第二筆 DB 失敗，但 local PUT 可能已互相覆蓋。
2. presign 與 DB insert 非原子 → orphan 授權或 orphan row。
3. Local PUT 無 If-None-Match / 禁止覆寫。

#### 建議修復

- key 使用 `crypto.randomUUID()`（或 ulid），勿依賴時間戳。
- 建議順序：先 create placeholder（或 idempotency-key）→ 再簽 upload URL。
- Local/S3 將 key 視為不可變 object id；重複 PUT 拒絕或僅允許完成回調。

#### 驗收建議

- 並發 20 次同檔名 upload → 20 個不同 `storageKey`，皆可寫入。
- DB create 失敗時不應留下可被濫用的長期授權（或授權綁定 asset id）。

---

### 3.5 ARExperience PATCH（P0/P1）

#### 現況

- `create()`：`$transaction` 內做 project / imageTarget / mediaAsset ownership 檢查。
- `PATCH`：僅對 `imageTargetId` 做 find + project 檢查；**`mediaAssetId` 無 ownership 檢查**。
- 校驗與 `update` 不在同一 transaction。
- 無 `version` / `updatedAt` 樂觀鎖。

路徑：

- `server/examples/next-app-router/app/api/experiences/[id]/route.ts`
- `server/services/ar-experience.service.ts`

#### 問題

- 可把 `mediaAssetId` 指到他 project 資產（邏輯漏洞，並發誤操作時放大）。
- 雙編輯者同時存 `transform` / `animationConfig` → **lost update**。
- 已 bind 時改 `imageTargetId` → 與 `boundExperienceId` 分叉。

#### 建議修復

1. update 與 create 共用 ownership 校驗，放進同一 transaction。
2. bind 中的 experience 改 `imageTargetId`：禁止，或同步清 `boundExperienceId`。
3. 編輯器加 optimistic concurrency：`version` 欄或 `WHERE id AND updatedAt = clientSeen`。

#### 驗收建議

- 跨 project `mediaAssetId` → 422。
- 過期 `updatedAt` 儲存 → 409。
- 已 bind 時非法改 target → 明確錯誤或自動 unbind（與 3.1 規則一致）。

---

### 3.6 Frontend ModelViewer（P2）

#### 現況

- `useGLTF` + 本地 Draco；cleanup 中 dispose geometry/material。
- 無 load generation / abort；無「同時只允許一個 in-flight 大檔」策略。

路徑：`src/components/ModelViewer.tsx`

#### 問題

- 快速切換 `url`：過期 load 完成後可能短暫套用或 dispose 到 cache 共用資源。
- 100MB+ 並行載入打滿記憶體 / main thread（Gate 2 行動裝置已敏感）。

#### 建議修復

- 切換 asset 時 serial load；忽略過期 promise（generation counter）。
- dispose 策略對齊 drei/useGLTF cache（必要時 `clear(url)`）。
- 大檔維持單一 in-flight load。

---

### 3.7 基礎設施（P2，擴展時）

| 項目 | 現況 | 意涵 |
|------|------|------|
| Redis | 架構提及，code 未見 | 尚無分散式 lock / job queue |
| Prisma singleton | `globalThis` 防 dev 多實例 | 多 process 各自連線池，需 `connection_limit` |
| 多 instance API | 未規劃水平擴展 | 記憶體內鎖無效；必須 DB CAS 或 Redis |
| Auth | API key per project | 不防同 key 並發寫；靠業務 CAS |

原則：**先做 DB 條件更新，再考慮 Redis**。單 instance 下 CAS 已足夠多數場景。

---

## 4. 優先級與落地順序

### P0 — 現有 API 已暴露，建議先做

| # | 項目 | 主要檔案 |
|---|------|----------|
| 1 | 原子 `bindExperience` / `unbind` + 409 | `image-target.service.ts`、bind route |
| 2 | Experience update 補 `mediaAssetId` ownership + bind 一致性 | `ar-experience.service.ts`、experiences PATCH |
| 3 | `storageKey` 改 UUID | `storage.service.ts` |

### P1 — 真 pipeline / 真 compile 前必做

| # | 項目 | 主要檔案 |
|---|------|----------|
| 4 | MediaAsset claim + `processingJobId` | `media-asset.service.ts` |
| 5 | Compile 狀態 CAS + 合法轉移 | `image-target.service.ts`、compile route |
| 6 | Derived 註冊冪等 | schema + `createDerivedAsset` |

### P2 — 多編輯者 / 擴展後

| # | 項目 |
|---|------|
| 7 | Experience / Target optimistic locking（`version` 或 `updatedAt`） |
| 8 | Viewer load 取消與資源生命週期 |
| 9 | 多 instance：Redis lock 或 DB advisory lock |

---

## 5. 建議的通用模式（全專案共用）

之後所有「狀態欄位」與「1:1 綁定」統一用下列模式之一：

1. **CAS / 條件更新**  
   `updateMany({ where: { id, status: expected }, data: { status: next } })`  
   `count === 0` → 409

2. **Transaction + 列鎖（高衝突熱點）**  
   interactive transaction 內 `findUnique` + 需要時 raw `FOR UPDATE`

3. **樂觀鎖（CMS 編輯）**  
   client 帶 `updatedAt` 或 `version`；衝突回 409 讓 UI 重載

4. **冪等鍵（上傳 / job / derived）**  
   UUID object key、`Idempotency-Key` header、derived unique(source, profile)

避免：

- 只在應用層 `if (status === X)` 再 `update`
- 只靠 `@unique` 當唯一併發策略
- 跨表校驗與寫入拆成多個無鎖 round-trip

---

## 6. 非目標（本文件不處理）

- 完整 job queue 產品選型（BullMQ / SQS / etc.）— 另開 upgrade issue
- 分散式事務 / saga 完整設計
- MindAR 執行期 tracking 執行緒模型
- 壓測數字與 SLA（需另做 load test 規格）

---

## 7. 後續 task 拆分建議

可從此文件拆成 agent tasks，例如：

| 建議 Task | 範圍 |
|-----------|------|
| TASK-xxx Bind atomicity | P0 #1 |
| TASK-xxx Experience update guards | P0 #2 |
| TASK-xxx Storage key UUID | P0 #3 |
| TASK-xxx Asset processing claim | P1 #4–6 |
| TASK-xxx Compile CAS | P1 #5 |

拆 task 時請在本目錄更新 [README.md](./README.md) 狀態，並連到 `docs/agents/tasks/`。

---

## 8. 參考程式位置速查

| 主題 | 路徑 |
|------|------|
| Schema | `prisma/schema.prisma` |
| Bind API | `server/examples/next-app-router/app/api/targets/[id]/bind/route.ts` |
| Compile API | `server/examples/next-app-router/app/api/targets/[id]/compile/route.ts` |
| Upload API | `server/examples/next-app-router/app/api/assets/upload/route.ts` |
| Derived API | `server/examples/next-app-router/app/api/assets/derived/route.ts` |
| Experience PATCH | `server/examples/next-app-router/app/api/experiences/[id]/route.ts` |
| Services | `server/services/*.ts` |
| Storage | `server/storage/storage.service.ts` |
| Local PUT | `server/examples/next-app-router/app/uploads/[...path]/route.ts` |
| Viewer | `src/components/ModelViewer.tsx` |
| Pipeline 設計 | `docs/plan/pipeline-asset-flow.md` |
| Backend review（歷史） | `docs/archive/sessions-w1-w4/backend-skeleton-review.md` |
