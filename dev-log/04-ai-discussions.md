# 與 AI 討論紀錄

---

## 2026-05-23｜初始規劃 — 需求分析與技術選型

- **提問 / 需求**：設計一個「步行可達餐廳推薦 App」，功能包含定位、Google Maps 串接、1km 搜尋、兩階段篩選、LLM 分析、列出 5 間餐廳並連結 Google Maps。請分析難度與前後端工作。
- **AI 的建議**：
  - 整體難度 ⭐⭐⭐ 中等
  - 前端：Next.js + React + Tailwind；後端：Firebase Cloud Functions
  - 兩階段分析（Places → LLM）以平衡費用與精度
  - 步行範圍簡化為半徑 1000m（等時線成本高）
  - Firebase Cloud Functions 而非 Next.js API Routes（保護 Key + 靜態部署）
- **採用的方案**：全部採用。技術選型確認為 Next.js + TypeScript + Firebase Cloud Functions
- **放棄的方案與原因**：
  - Next.js Route Handlers（需 SSR 環境，費用較高）
  - 全 LLM 分析（第一階段費用與速度不佳）
  - Routes API isochrone（費用過高，MVP 不值得）
- **尚未決定的事項**：（已全部確認）

---

## 2026-05-23｜Google Maps 費用分析

- **提問 / 需求**：若只有個人使用，Google Maps 串接費用為何？
- **AI 的建議**：每月 $200 免費額度，個人每天 3 次搜尋月費約 $3.51，遠低於免費額度，實質免費。
- **採用的方案**：確認可接受，繼續使用 Google Maps Platform
- **放棄的方案與原因**：（無替代方案，Google Maps 是此場景最佳選擇）
- **尚未決定的事項**：需確認是否要 Budget Alert 設定（建議設 $5 警示）

---

## 2026-05-23｜Dev-Log 紀錄系統設計

- **提問 / 需求**：需要記錄每個開發階段的規劃與討論過程，規劃 dev-log 資料夾與 CLAUDE.md，並讓 AI 自動更新 dev-log。
- **AI 的建議**：
  - `dev-log/` 資料夾，6 個根層級 MD + `phases/` 子資料夾（M1–M7 各一份）
  - CLAUDE.md 用強制規則表讓 AI 自動更新
  - `.claude/settings.json` 的 Stop 與 PostToolUse hooks 提供額外提醒
- **採用的方案**：全部採用
- **放棄的方案與原因**：（無）
- **尚未決定的事項**：（無）

---

## 2026-05-23｜工具鏈強化：Prettier + ESLint 規則 + pnpm 遷移

- **提問 / 需求**：(1) 加入 Prettier 格式限制；(2) 每次寫完都要跑 ESLint/tsc 驗證，寫入 CLAUDE.md；(3) 評估 pnpm 遷移可行性
- **AI 的建議**：
  - Prettier：`.prettierrc`（semi/singleQuote/tabWidth/printWidth/endOfLine）+ `eslint-config-prettier` 關閉衝突規則
  - CLAUDE.md 新增「程式碼品質驗證」強制區塊（pnpm lint + tsc + format:check）
  - pnpm：完全來得及，帶來速度/磁碟/嚴謹/Monorepo 就緒四大優勢；遷移成本極低
- **採用的方案**：全部採用
- **過程中發現的問題**：
  - `react-hooks/set-state-in-effect` ESLint 規則不允許在 `useEffect` 內同步呼叫 `setState`（含 functional update）→ 重構 `useGeolocation.ts` 改為衍生 `isLoading` 而非 setState
  - `window.google` 型別未定義 → 安裝 `@types/google.maps`，改用全域 `google`（不需加 `window.`）
  - IDE 的 TypeScript 快取未重整，導致誤報錯誤；實際 `tsc --noEmit` 通過
- **放棄的方案與原因**：（無）
- **尚未決定的事項**：（無）

---
## 2026-05-23｜Marker → AdvancedMarker 遷移

- **提問 / 需求**：執行後 terminal 出現 `google.maps.Marker is deprecated. Please use google.maps.marker.AdvancedMarkerElement instead.`
- **AI 的建議**：
  - `@vis.gl/react-google-maps` 對應元件為 `AdvancedMarker`
  - `AdvancedMarker` 需要父層 `<Map>` 設定 `mapId`
  - 本地開發用 Google 提供的 `"DEMO_MAP_ID"` fallback；正式部署需在 GCP Console 建立 Map ID
  - 新增 `NEXT_PUBLIC_GOOGLE_MAPS_ID` 環境變數，寫入 `.env.local.example`
- **採用的方案**：全部採用
- **放棄的方案與原因**：（無）
- **尚未決定的事項**：正式 Map ID 待上線前於 GCP Console 建立

---

## 2026-06-07｜限流實作：runTransaction vs FieldValue.increment

- **提問 / 需求**：M6 限流實作使用了 `runTransaction`，想了解是否必要，以及 Firestore 寫入有哪些做法。
- **討論摘要**：
  - `runTransaction` 保證「讀→判斷→寫」原子性，可完全避免 race condition（兩個請求同時進來都以為自己是第一個）
  - `FieldValue.increment` 是原子性計數，先寫再讀，允許極小機率在邊界值（第 30 次）同時通過，但不需要鎖定 doc
  - 對此 App 規模（個人使用，每分鐘幾乎不超過個位數請求），race condition 機率極低，不需要 transaction 的複雜度與延遲
- **採用的方案**：改用 `FieldValue.increment`，更簡單、延遲更低
- **放棄的方案與原因**：`runTransaction` — 對此 App 過度設計，增加 Firestore 一次 transaction 的往返延遲
- **程式碼結論**：
  ```typescript
  await ref.set({ count: FieldValue.increment(1), expireAtBucket: bucket + 2 }, { merge: true });
  const snap = await ref.get();
  return ((snap.data()?.count as number) ?? 0) <= limitPerMin;
  ```

---

## 2026-06-12｜M4 增強 — AI 主動推薦與問卷前置

- **提問 / 需求**：現有 M4 分析只給 chip 讓使用者手動篩選，功能太「雞肋」，希望 AI 做出更多分析讓使用者無腦選餐廳。具體要求：
  1. AI 從餐廳名稱推斷細緻菜系（不用 Google Maps 分類），推不出來再搜尋
  2. 細篩顯示泰式知名料理如「椒麻雞」，但前提要確認餐廳有這道菜
  3. 搜尋前彈出問卷：Q1 單選預算（<100 / 100~200 / >300），Q2 複選口味偏好（飯/麵/鹹/甜/湯/乾/熱/冷）
- **AI 的建議**：
  - 問卷設計為全螢幕 overlay，Q1 選完立即跳 Q2（不需下一步按鈕），Q2 可略過
  - AI prompt 加入 userContext，要求根據名稱推斷細緻菜系 + 招牌菜 + 一句話摘要 + 0–100 推薦分數
  - Schema 新增 `signature_dishes[]`, `summary`, `score`
  - 搜尋後自動觸發 AI 分析（useRef 防重複），取代手動「AI 細篩」按鈕
  - 卡片依 score 排序，#1 顯示「AI 首選」金色 badge
- **採用的方案**：全部採用
- **放棄的方案與原因**：
  - Gemini Search Grounding（驗證菜單）— 增加延遲與費用，MVP 先用訓練知識推斷，不確定時留空
  - 完全移除 M3 chip — 保留作為進階篩選
- **尚未決定的事項**：Gemini Search Grounding 可在 M8+ 引入以提升招牌菜準確度

---

## 2026-06-16｜地圖 Marker InfoWindow 設計 — native 風格 vs AI 摘要

- **提問 / 需求**：點擊地圖紅點後希望顯示資訊，討論要用自訂 InfoWindow 還是 Google Maps 原生 place card 風格。原生 place card（點藍圈外 POI 標籤彈出的）有地址、Google Maps 連結，但紅點是 AdvancedMarker，無法直接觸發原生 place card。
- **討論摘要**：
  - `AdvancedMarker` 是自訂 DOM 覆蓋層，點擊只觸發 `onClick` callback，不會觸發 Google Maps 原生 place card（原生 place card 只對地圖 tile 上的 POI 標籤有效）
  - `@vis.gl/react-google-maps` 的 `InfoWindow` 支援 `headerContent` prop，可將名稱放進 native header 區塊，呈現與原生 place card 一致的分層結構
  - 標題灰色問題：透過 `headerContent` 傳入自訂 React element 即可控制顏色，不受 Google 預設樣式限制
- **採用的方案**：InfoWindow 顯示 priceLevel（$～$$$$）、rating（⭐）、步行分鐘（Haversine 估算）、「在 Google 地圖上查看」連結，不顯示 AI summary（summary 已在卡片列表中呈現，避免重複）
- **放棄的方案與原因**：
  - 在 InfoWindow 中顯示 AI summary — 與卡片列表重複，InfoWindow 應聚焦快速識別（距離、價位、評分）
  - 使用原生 Google Maps place card — AdvancedMarker 機制上無法觸發，須改為非自訂 Marker 才行

---

## 2026-06-18｜推薦品項篩選邏輯 — OR/AND 行為與空陣列處理

- **提問 / 需求**：同時選兩個推薦品項 chip，是代表同時包含兩個（AND），還是只要有任何一個（OR）？全選時應該顯示幾間餐廳？
- **討論結論**：
  - **多選 chip 採 OR 邏輯**（`.some()`）：選越多 = 範圍越廣，符合「放寬篩選」直覺
  - 口味與品項兩個條件之間是 AND：必須同時符合兩個維度
  - **空陣列（`signature_dishes: []`）不應放行**：Gemini 沒給標籤的餐廳，在有選 chip 時應被排除，而非視為萬用牌。決策依據：chip 代表「這間餐廳有這道菜」，無標籤代表「不確定有沒有」，不應強制通過。
  - 全選所有 chip 時，有標籤的餐廳都會通過（OR 邏輯必然），無標籤的餐廳仍被排除。這是可接受的行為，不需特殊處理。
- **放棄的方案**：曾短暫實作「空陣列 = 放行」（`a.flavor.length === 0 || ...`），但使用者確認空陣列不應放行後撤回。
<!-- 新的討論往下加，格式：## [日期]｜討論主題 -->
