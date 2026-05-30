# M6：快取 + 安全強化

## 目標
- Firestore 快取（同座標 10 分鐘內不重呼叫 Places API）
- CORS 收緊（只允許自己的 Hosting 網域）
- 限流（每 IP 每分鐘 30 次）
- Budget Alert 設定

## 開始日期
<!-- 填入 -->

## 完成日期
<!-- 填入 -->

## 實作內容
- [ ] `functions/src/cache.ts` 完整實作（TTL 檢查、write-through）
- [ ] Cache key 設計：`round(lat,3)_round(lng,3)_1000`（精度 ~111m）
- [ ] CORS middleware：正式環境只允許 `your-project.web.app`
- [ ] 限流：Firestore 計數器或 Cloud Armor（依需求決定）
- [ ] GCP Console 設定 Budget Alert（$5 警告 / $20 停止）
- [ ] API Key 使用量監控設定

## 遇到的問題
<!-- 遇到問題時填入 -->

## 與原計畫的差異
<!-- 如有調整請記錄原因 -->

## 下一步
M7：Firebase 完整部署
