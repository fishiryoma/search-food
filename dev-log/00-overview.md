# Search-food — 專案總覽

## 一句話描述
依據目前位置，搜尋步行 1km 內的餐廳，透過兩階段篩選（Google Places + LLM 分析）推薦最符合偏好的 5 間餐廳，並一鍵跳轉 Google Maps 導航。

## 目標
讓使用者在不知道要吃什麼的情況下，快速（< 30 秒）找到附近符合價位與口味的餐廳。

## 技術選型摘要

| 層級 | 技術 |
|---|---|
| 前端 | Next.js (React) + TypeScript + Tailwind CSS |
| 狀態管理 | Zustand |
| API 驗證 | Zod（前後端共用 schema） |
| 後端 | Firebase Cloud Functions (Gen2) + TypeScript |
| 快取 | Firestore |
| 部署 | Firebase Hosting（靜態）+ Cloud Functions |
| 地圖 | Google Maps JavaScript API + @react-google-maps/api |
| 餐廳搜尋 | Google Places API (New) — Nearby Search |
| AI 分析 | Anthropic Claude Haiku 4.5（成本低速度快） |

## 相關連結
<!-- 建立後填入 -->
- Firebase Console：
- GCP Console：
- Git Repository：

## 版本歷程

| 日期 | 版本 | 重大變更 |
|---|---|---|
| 2026-05-23 | v0.1 | 專案初始化，建立 dev-log 與 CLAUDE.md |
