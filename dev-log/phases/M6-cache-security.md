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
- [x] GCP Console：設定 Budget Alert → 手動步驟，非程式碼（補記於 2026-09-23：已設定，$5/月，50%/90% 門檻通知）
- [x] API Key 限制：Maps JS API 加 HTTP Referrer → Cloud Console 手動設定（補記於 2026-09-23：Places API Key 改採「API restriction」限制為只能呼叫 Places API，IP 限制評估後決定不做，理由見下方「後續強化」）
- [x] ESLint ✅ tsc --noEmit ✅ Prettier ✅

## 與原計畫的差異
- 限流未採用 Cloud Armor（需付費升級），改用 Firestore transaction counter，適合 MVP 規模

---

## 後續強化（補記於 2026-09-23）

M6 完成後，又陸續補強了兩項當初未涵蓋的安全/成本控制措施：

- [x] **全站每日呼叫上限**：`functions/src/utils.ts` 新增 `checkGlobalDailyLimit()`，`global_usage` collection 以日期為 key 累計次數，`nearby` 端點每日最多 100 次（快取命中不計入）。目的是防止單一 IP 輪流換 IP 繞過每分鐘限流時，仍有一道全站總量煞車，避免 Places API 費用失控。
- [x] **`firestore.rules` 從預設佔位規則改為明確拒絕**：原規則是 Firebase 初始化時的預設值（`allow read, write: if request.time < <日期>`），只在建立當下的 30 天內開放所有人讀寫，之後才自動變成全拒絕；期間內等於任何人只要知道 project ID 就能繞過 Cloud Functions 直接讀寫 Firestore。由於此專案 Firestore 只透過 Cloud Functions 的 Admin SDK 存取（Admin SDK 不受規則約束），前端從未安裝 Firebase Client SDK，因此改為明確寫死 `allow read, write: if false`，語意清楚且不會因日期過期而變成意外行為。

### Places API Key IP 限制：評估後決定不做（2026-09-23）

- **背景**：Cloud Functions Gen2 底層是 Cloud Run，預設對外流量走共用、會變動的 Google IP 池，沒有固定出站 IP。要讓「限制成只有 Cloud Functions 打得到」成立，需另外接 Serverless VPC Access connector + Cloud NAT 配一個固定靜態 IP，屬於額外的月費與設定複雜度。
- **決策**：不導入 VPC connector + Cloud NAT，Places API Key 不設定 IP（Application）限制。
- **理由**：
  - Key 只存在 Secret Manager，僅 Cloud Functions 讀取，程式碼以 header（`X-Goog-Api-Key`）傳遞、錯誤訊息只印 Google 回傳內容，不會意外把 key 印進 log；主要外洩管道只剩人為疏失（如誤 commit），機率低
  - 已設定 API restriction（Key 限制為只能呼叫 Places API），外洩後能造成的影響範圍已限縮到單一 API
  - 已設定 Budget Alert（$5/月，50%/90% 通知）作為費用失控時的偵測手段
- **放棄的替代方案**：VPC connector + Cloud NAT 固定 IP — 技術上可行但增加常態性費用與維運複雜度，與個人 MVP 規模不成比例
- **後果與取捨**：IP 限制屬於「事前阻擋」，目前組合（Secret Manager + API restriction + Budget Alert）屬於「縮小範圍 + 事後偵測」，並非完全阻絕外洩後被濫用的可能性，是已知且刻意接受的風險

## 下一步
M7：Firebase 完整部署（Hosting + Functions + Secret Manager）
