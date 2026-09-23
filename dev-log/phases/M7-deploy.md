# M7：Firebase 部署

## 目標
- Firebase Hosting 部署前端（靜態）
- Cloud Functions 部署後端
- Secret Manager 設定正式金鑰
- 手機瀏覽器實地測試

## 開始日期
2026-06-16

## 完成日期
2026-06-17

## 部署前必須手動完成（GCP Console）
- [x] Maps JS API Key：加 HTTP Referrer 白名單，限定 `https://search-food-497209.web.app/*`（GCP Console → APIs & Services → Credentials）
- [x] Budget Alert（GCP Console → Billing → Budgets & alerts）— 補記於 2026-09-23：已設定，$5/月，50%/90% 門檻通知
- [ ] Google Places API Key：加 IP 限制（Cloud Functions 對外 IP）— 補記於 2026-09-23：評估後決定不做，改採 API restriction（限制為只能呼叫 Places API）+ Budget Alert 作為替代防線，詳細理由見 `phases/M6-cache-security.md`

## 實作內容
- [x] `firebase init hosting,functions,firestore`
- [x] `firebase.json` 設定（rewrite、headers）
- [x] `firebase functions:secrets:set GOOGLE_PLACES_KEY`
- [x] `firebase functions:secrets:set GEMINI_API_KEY`
- [x] `next build`（`output: 'export'`）確認無 SSR 依賴
- [x] `firebase deploy`
- [x] 手機 iOS Safari / Android Chrome 實地測試
- [x] Firebase Console 確認 Functions 執行正常
- [x] GCP Console 確認 Places API 用量符合預期

> 補記於 2026-09-21：以上原始清單當時未同步勾選，依「完成項目」與「遇到的問題」章節內容回填，實際完成狀態以本次補勾為準。

## 完成項目
- Firebase Hosting 部署成功，URL：https://search-food-497209.web.app
- Cloud Functions (nearby / analyze) 部署成功，區域 us-central1
- Secret Manager 設定 GOOGLE_PLACES_KEY / GEMINI_API_KEY
- Maps JS API Key 設定 HTTP Referrer 限制（hosting domain）
- Cloud Run IAM 設為公開存取（解決 CORS 403 問題）
- functions/ 套件管理器改為 npm（解決 pnpm v10 Cloud Build 錯誤）

## 遇到的問題
- pnpm v10 `ERR_PNPM_IGNORED_BUILDS` 封鎖 Cloud Build → 改用 npm（詳見 issues-and-solutions）
- `npm install` 殘留 pnpm symlink 導致失敗 → 先刪 node_modules 再裝
- Cloud Run IAM 預設需驗證 → 前端收 CORS 錯誤 → GCP Console 改為公開存取

## 與原計畫的差異
- functions 套件管理器從 pnpm 改為 npm（Cloud Build 環境限制）
- Cloud Run IAM 設定需手動在 GCP Console 操作（firebase.json 無法控制）

## 部署後優化（2026-06-17）
- 手機版結果頁改為全頁 scroll（移除獨立 scroll 容器）
- Header 新增使用者查詢條件顯示（預算 + 偏好 chip）
- "重新分析" 改為先重打 nearby API 取新餐廳再分析（避免結果幾乎相同）

## 下一步
MVP 完成。視需求考慮：使用者帳號、更精準的等時線、多語言。
