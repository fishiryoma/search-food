# M4：LLM 分析

## 目標
- 實作 `analyze` Cloud Function（呼叫 Claude Haiku 4.5）
- 設計 prompt（用 prompt caching 降低費用）
- 前端第二階段細項篩選 UI

## 開始日期
<!-- 填入 -->

## 完成日期
<!-- 填入 -->

## 實作內容
- [ ] 建立 `functions/src/analyze.ts`
- [ ] Anthropic SDK 整合，系統提示 + prompt caching
- [ ] 要求 JSON 輸出（cuisine / flavor / occasion 標籤）
- [ ] Zod schema 驗證 LLM 回傳
- [ ] Secret Manager 設定 `ANTHROPIC_API_KEY`
- [ ] 前端 `AnalyzeFilter.tsx` 元件（顯示 LLM 標籤 chip）
- [ ] Loading 狀態 UI「分析餐點中…」

## 遇到的問題
<!-- 遇到問題時填入 -->

## 與原計畫的差異
<!-- 如有調整請記錄原因 -->

## 下一步
M5：結果頁面（5 間餐廳卡片 + Google Maps deeplink）
