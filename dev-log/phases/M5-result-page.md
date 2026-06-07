# M5：結果頁面

## 目標
- 建立餐廳卡片 UI
- 一鍵跳轉 Google Maps
- 空結果狀態處理

## 開始日期
2026-06-07

## 完成日期
2026-06-07

## 實作內容
- [x] 建立 `app/components/RestaurantCard.tsx`（名稱、cuisine 標籤、評分、評論數、價位、距離）
- [x] Haversine 距離計算（m / km 自動切換顯示）
- [x] Google Maps deeplink：`https://www.google.com/maps/search/?api=1&query=<name>&query_place_id=<placeId>`
- [x] 空結果狀態處理（無餐廳 / 篩選後空結果分兩種文案）
- [x] Top 5 排序：依 `rating` 降冪，前端計算（不需額外 Cloud Function）
- [x] 版面：地圖 45vh 固定高度，卡片列表 flex-1 可捲動
- [x] ESLint ✅ tsc --noEmit ✅ Prettier ✅

## 與原計畫的差異
- `refine` Cloud Function 省略：排序邏輯純運算（按評分降冪取前 5），前端直接計算即可，
  不需要額外的 Function 呼叫、部署與延遲

## 下一步
M6：快取 + 安全強化（Firestore cache TTL、CORS domain 限制、限流）
