# 架構決策紀錄（ADR）

---

## ADR-001：後端用 Firebase Cloud Functions 而非 Next.js API Routes

- **日期**：2026-05-23
- **背景**：需要保護 Google Places API Key 和 Anthropic API Key，不能讓它們出現在前端 bundle。Next.js 提供 Route Handlers 可以當後端，但也可以用 Firebase Cloud Functions。
- **決策**：採用 Firebase Cloud Functions (Gen2)，前端做純靜態輸出。
- **理由**：
  - Functions 與 Firestore、Secret Manager 原生整合，IAM 自動處理
  - 前端可用 `output: 'export'` 純靜態，部署到 Firebase Hosting 最便宜
  - 每個 endpoint 獨立冷啟動，可單獨擴展
  - 本地 `firebase emulators` 同時模擬 Functions + Firestore，開發體驗一致
- **放棄的替代方案**：Next.js Route Handlers — 需要 SSR 環境（Cloud Run 或 Vercel），費用較高，部署更複雜
- **後果與取捨**：`app/api/` 不存在於此專案；本地開發需同時跑 `next dev` 和 `firebase emulators`

---

## ADR-002：分析策略採兩階段（Places 欄位 → LLM）

- **日期**：2026-05-23
- **背景**：需要分析餐廳類型和餐點細節，有兩種做法：(A) 全部依賴 Places API 內建欄位；(B) 全部用 LLM；(C) 兩階段混合。
- **決策**：兩階段：第一階段用 Places 既有欄位粗篩，使用者主動觸發才呼叫 LLM 深入分析。
- **理由**：
  - 控制 LLM API 費用（只在需要時才呼叫）
  - Places API 的 `types` 和 `priceLevel` 夠用於第一輪篩選
  - LLM 可從餐廳名稱 + Google 評論萃取更細的菜系/口味/場景標籤
- **放棄的替代方案**：
  - 純 Places：精度不足，無法做「清淡/重口味」等細分
  - 全 LLM：第一次載入就要等 LLM，體驗差且費用高
- **後果與取捨**：需要維護兩個分析端點；第二階段需使用者主動觸發（但更符合「越用越精準」的體驗）

---

## ADR-003：步行範圍以半徑圓圈簡化，而非真實等時線

- **日期**：2026-05-23
- **背景**：「步行可達 1km」最精準的做法是用 Google Routes API 的等時線（isochrone），但這需要額外 API、費用更高、實作更複雜。
- **決策**：MVP 用 `radius=1000`（公尺）的圓形半徑呼叫 Nearby Search。
- **理由**：
  - 個人使用場景下，圓圈近似值已足夠實用
  - 避免 Routes API 費用（每次 isochrone 計算約 $0.005）
  - 實作簡單，M1/M2 可快速完成
- **放棄的替代方案**：Routes API Compute Routes Matrix — 精準但貴，日後可作為升級選項
- **後果與取捨**：部分邊緣情況（如有河流阻隔）會顯示實際走不到的餐廳；接受此限制

---

## ADR-004：Google Maps React 套件改用 @vis.gl/react-google-maps

- **日期**：2026-05-23
- **背景**：原計畫使用 `@react-google-maps/api`，但專案使用 React 19，需確認相容性。
- **決策**：改用 `@vis.gl/react-google-maps`（Google 與 vis.gl 社群共同維護）。
- **理由**：
  - 官方積極維護，React 19 相容性有保障
  - API 更符合 React 現代慣例（hooks-first）
  - `APIProvider` + `Map` + `useMap` hook 組合更彈性
- **放棄的替代方案**：`@react-google-maps/api` — 社群支援活躍但非官方，React 19 peer dependency 未明確支援
- **後果與取捨**：
  - `Marker`（legacy）用於 M1，日後升級 `AdvancedMarker` 需在 Google Cloud Console 建立 Map ID
  - `Circle` 需透過 `useMap` + `new google.maps.Circle()` 手動建立，不是 JSX component

---

## ADR-005：問卷前置，取代 M3 手動 chip 篩選作為主流程

- **日期**：2026-06-12
- **背景**：M3 的 chip 篩選要求使用者先了解 Google Maps 餐廳分類（chinese_restaurant、japanese_restaurant 等），對一般使用者不直覺。使用者需求是「無腦選餐廳」。
- **決策**：搜尋前先彈出問卷 overlay（Q1 預算、Q2 口味偏好），答案傳入 AI prompt 作為推薦依據。M3 chip 保留作為進階篩選。
- **理由**：問卷只需回答 2 個問題（Q1 必填、Q2 可略過），門檻極低；AI 拿到使用者條件後可主動排序，使用者不再需要理解 chip 語義。
- **放棄的替代方案**：完全移除 M3 chip — 保留是為了讓有需要的使用者可進一步細篩。
- **後果與取捨**：每次使用都要先過問卷，無法直接搜尋（接受此限制，符合 app 設計目標）

---

## ADR-006：AI 分析自動觸發，不由使用者手動按鈕

- **日期**：2026-06-12
- **背景**：原本需使用者點「AI 細篩」按鈕才觸發分析，多一道操作且使用者可能不知道要點。
- **決策**：`usePlaces` 回傳資料後透過 `useEffect` 自動觸發 `fetchAnalyze`，以 `useRef` 防止重複觸發。
- **理由**：使用者已在問卷提供上下文，AI 不需要再次確認即可直接分析；自動觸發讓體驗更流暢。
- **放棄的替代方案**：手動按鈕 — 保留「重新分析」按鈕供需要更新結果時使用。
- **後果與取捨**：每次打開 app 都會自動呼叫 Gemini API（增加費用），但使用者為個人使用，可接受此成本

---
<!-- 新的 ADR 往下加 -->
