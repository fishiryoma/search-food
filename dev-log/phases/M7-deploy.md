# M7：Firebase 部署

## 目標
- Firebase Hosting 部署前端（靜態）
- Cloud Functions 部署後端
- Secret Manager 設定正式金鑰
- 手機瀏覽器實地測試

## 開始日期
<!-- 填入 -->

## 完成日期
<!-- 填入 -->

## 實作內容
- [ ] `firebase init hosting,functions,firestore`
- [ ] `firebase.json` 設定（rewrite、headers）
- [ ] `firebase functions:secrets:set GOOGLE_PLACES_KEY`
- [ ] `firebase functions:secrets:set ANTHROPIC_API_KEY`
- [ ] Maps JS API Key 設 HTTP Referrer 白名單（正式網域）
- [ ] `next build`（`output: 'export'`）確認無 SSR 依賴
- [ ] `firebase deploy`
- [ ] 手機 iOS Safari / Android Chrome 實地測試
- [ ] Firebase Console 確認 Functions 執行正常
- [ ] GCP Console 確認 Places API 用量符合預期

## 遇到的問題
<!-- 遇到問題時填入 -->

## 與原計畫的差異
<!-- 如有調整請記錄原因 -->

## 下一步
MVP 完成。視需求考慮：使用者帳號、更精準的等時線、多語言。
