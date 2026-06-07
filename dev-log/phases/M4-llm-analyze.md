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

## 下一步
M5：結果頁面（5 間餐廳卡片 + Google Maps deeplink）
