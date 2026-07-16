# Issue / Upgrade Tracker

本目錄記錄已識別、待升級處理的系統性問題（非單次 bug 修補）。  
文件供後續 task 拆分與實作優先級參考。

## 文件清單

| 文件 | 主題 | 狀態 |
|------|------|------|
| [concurrency.md](./concurrency.md) | 併發、狀態機、跨表一致性 | P0 已落地（2026-07-16），P1/P2 待做 |

## 使用方式

1. 新 issue 以獨立 markdown 記錄（問題、現況、風險、建議、優先級）。
2. 落地時再拆 `docs/agents/tasks/TASK-xxx.md`，並在此更新狀態。
3. 已完成的 issue 在狀態欄改為 `done`，並連到 RESULT / PR。
