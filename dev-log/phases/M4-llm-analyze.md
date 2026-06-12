# M4：LLM 分析

## 目標
- 實作 `analyze` Cloud Function（呼叫 Gemini）
- 設計 prompt，要求結構化 JSON 輸出
- 前端第二階段細項篩選 UI

## 開始日期
2026-05-30

## 完成日期
2026-05-30

## 實作內容
- [x] 安裝 `@google/generative-ai` SDK（functions/）
- [x] 建立 `functions/src/analyze.ts`（Gemini 2.0 Flash，responseSchema 強制 JSON 輸出）
- [x] Zod 驗證 LLM 回傳（PlaceAnalysisSchema / AnalyzeResponseSchema）
- [x] 更新 `lib/schemas.ts`（PlaceAnalysis + AnalyzeResponse）
- [x] 更新 `lib/api.ts`（fetchAnalyze）
- [x] 更新 `store/useFilterStore.ts`（加入 analyses / selectedFlavors / selectedOccasions）
- [x] 建立 `app/components/AnalyzeFilter.tsx`（flavor + occasion chip，藍底區塊區分 AI 篩選）
- [x] 更新 `app/page.tsx`：「AI 細篩」按鈕 → loading → AnalyzeFilter 顯示 → 最終篩選
- [x] ESLint ✅ tsc --noEmit ✅ Prettier ✅

## 與原計畫的差異
- Anthropic Claude Haiku → **Gemini 2.0 Flash**（使用者有 Google AI Studio 免費額度）
- Prompt caching 省略（Gemini API 免費額度已夠用，不需額外優化）

---

## 增強版（2026-06-12）

### 動機
原版 AI 分析只輸出 chip 讓使用者手動篩選，體驗不夠「無腦」。使用者希望 AI 直接推薦、不需手動操作。

### 新流程
問卷（預算 + 口味偏好）→ 搜尋 → AI 自動分析 → 依 score 排序，#1 顯示「AI 首選」

### 新增實作
- [x] `lib/schemas.ts`：`PlaceAnalysisSchema` 新增 `signature_dishes[]`, `summary`, `score`
- [x] `lib/schemas.ts`：新增 `UserContextSchema`（budget + preferences）
- [x] `lib/api.ts`：`fetchAnalyze` 加入 `userContext` 參數
- [x] `store/useFilterStore.ts`：新增 `selectedDishes` + `toggleDish`
- [x] `functions/src/analyze.ts`：新 prompt（名稱推斷菜系、招牌菜、摘要、0–100 分數）+ schema 更新
- [x] 新建 `app/components/QuestionnaireOverlay.tsx`（Q1 預算單選 → Q2 偏好複選，全螢幕 overlay）
- [x] `app/components/AnalyzeFilter.tsx`：新增 signature_dishes chips
- [x] `app/components/RestaurantCard.tsx`：新增 summary、排名 #1 顯示 AI 首選金色 badge
- [x] `app/page.tsx`：問卷前置、搜尋後自動觸發 AI 分析（useRef 防重複）、依 score 排序
- [x] ESLint ✅ tsc --noEmit ✅ Prettier ✅

## 下一步
M6：快取 + 安全強化 → M7：Firebase 部署
