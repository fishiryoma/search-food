# M6：快取 + 安全強化

## 目標
- Firestore 快取（同座標 10 分鐘內不重呼叫 Places API）
- CORS 收緊（只允許自己的 Hosting 網域）
- 限流（每 IP 每分鐘 30 次）
- Budget Alert 設定

## 開始日期
2026-06-07

## 完成日期
2026-06-07

## 實作內容
- [x] Firestore cache（TTL 10 分鐘）— 已於 M2 完成，無需再動
- [x] 建立 `functions/src/utils.ts`（ALLOWED_ORIGINS + checkRateLimit 共用邏輯）
- [x] CORS 限制：emulator 允許所有來源，正式環境限定 `search-food-497209.web.app` / `.firebaseapp.com`
- [x] 限流：Firestore transaction-based 計數器，key = `{ip}_{minute_bucket}`，上限 30 req/min
  - `expireAtBucket` 欄位保留，供未來清理腳本識別過期文件
- [ ] GCP Console：設定 Budget Alert（$5 警告 / $20 停止）→ 手動步驟，非程式碼
- [ ] API Key 限制：Maps JS API 加 HTTP Referrer、Places API 加 IP 限制 → Cloud Console 手動設定
- [x] ESLint ✅ tsc --noEmit ✅ Prettier ✅

## 與原計畫的差異
- 限流未採用 Cloud Armor（需付費升級），改用 Firestore transaction counter，適合 MVP 規模

## 下一步
M7：Firebase 完整部署（Hosting + Functions + Secret Manager）
