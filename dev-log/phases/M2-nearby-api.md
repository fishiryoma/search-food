# M2：Nearby API 串接

## 目標
- 建立 Firebase Functions 專案結構（TypeScript）
- 實作 `nearby` Cloud Function，代理 Google Places Nearby Search
- 前端呼叫 Function（emulator），在地圖標出附近餐廳 markers

## 開始日期
<!-- 填入 -->

## 完成日期
<!-- 填入 -->

## 實作內容
<!-- 完成後條列 -->
- [ ] `firebase init functions` + TypeScript 設定
- [ ] 建立 `functions/src/nearby.ts`（Places Nearby Search 代理）
- [ ] 建立 `functions/src/cache.ts`（Firestore TTL 快取邏輯）
- [ ] 建立 `lib/api.ts`（前端呼叫 Functions 的 client）
- [ ] 定義 `NearbyResponse` Zod schema（`lib/schemas.ts`）
- [ ] 前端整合：定位後自動呼叫，餐廳 markers 顯示在地圖

## 遇到的問題
<!-- 遇到問題時填入 -->

## 與原計畫的差異
<!-- 如有調整請記錄原因 -->

## 下一步
M3：粗篩 UI（類型 + 價位 chip）
