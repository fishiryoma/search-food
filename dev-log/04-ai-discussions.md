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
<!-- 新的討論往下加，格式：## [日期]｜討論主題 -->
