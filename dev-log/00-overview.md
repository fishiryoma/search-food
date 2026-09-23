# Search-food — 專案總覽

## 一句話描述
依據目前位置，搜尋步行 1km 內的餐廳，透過兩階段篩選（Google Places + LLM 分析）推薦最符合偏好的 5 間餐廳，並一鍵跳轉 Google Maps 導航。

## 目標
讓使用者在不知道要吃什麼的情況下，快速（< 30 秒）找到附近符合價位與口味的餐廳。

## 技術選型摘要

| 層級 | 技術 |
|---|---|
| 前端 | Vite + React + TypeScript + Tailwind CSS |
| 狀態管理 | Zustand |
| API 驗證 | Zod（前後端共用 schema） |
| 後端 | Firebase Cloud Functions (Gen2) + TypeScript |
| 快取 | Firestore |
| 部署 | Firebase Hosting（靜態）+ Cloud Functions |
| 地圖 | Google Maps JavaScript API + @vis.gl/react-google-maps |
| 餐廳搜尋 | Google Places API (New) — Nearby Search |
| AI 分析 | Google Gemini 3.5 Flash Lite（成本低速度快） |

## 相關連結

- Firebase Console：https://console.firebase.google.com/project/search-food-497209/overview
- GCP Console：https://console.cloud.google.com/home/dashboard?project=search-food-497209
- 正式站：https://search-food-497209.web.app
- Git Repository：https://github.com/fishiryoma/search-food

## 版本歷程

| 日期 | 版本 | 重大變更 |
|---|---|---|
| 2026-05-23 | v0.1 | 專案初始化，建立 dev-log 與 CLAUDE.md |
| 2026-09-20 | v0.8 | 前端框架從 Next.js 改為 Vite + React（ADR-010） |
| 2026-09-21 | v0.9 | AI 分析模型改為 Gemini 3.5 Flash Lite；修正地圖套件記載（`@react-google-maps/api` → `@vis.gl/react-google-maps`，見 ADR-004）；補齊相關連結（ADR-011） |
