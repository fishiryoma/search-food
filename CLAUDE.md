# Search-food 開發規範

## 語言
所有回應用繁體中文。

## 技術規範
- **前端**：Next.js (React) + TypeScript，禁止使用 `any`
- **後端**：Firebase Cloud Functions + TypeScript
- **UI**：Tailwind CSS，不用 inline style
- **狀態管理**：Zustand（輕量），禁止 Redux
- **API 驗證**：前後端共用 `lib/schemas.ts` 的 Zod schema
- **React**：只用 functional component + hooks，禁止 class component
- **命名**：元件 PascalCase，函式/變數 camelCase，常數 UPPER_SNAKE_CASE

## Dev-Log 更新規則（強制，每次必須執行）

以下事件發生後，在結束回覆前必須更新對應的 dev-log 檔案：

| 事件 | 必須更新的檔案 |
|---|---|
| 開始一個新的 Milestone | `dev-log/phases/Mx-xxx.md` → 填入目標、開始日期 |
| 完成一個 Milestone | `dev-log/phases/Mx-xxx.md` → 填入完成項目、結束日期、遺留問題 |
| 做了架構/技術決策 | `dev-log/02-architecture-decisions.md` → 新增 ADR 條目 |
| 發現並解決 Bug | `dev-log/05-issues-and-solutions.md` → 記錄問題與解法 |
| 討論後產生設計決策 | `dev-log/04-ai-discussions.md` → 摘要討論與結論 |
| 研究 API 或費用 | `dev-log/03-api-research.md` → 補充研究結果 |

> 若一次對話涉及多個事件，全部一起更新後再結束。

## 程式碼品質驗證（每次改動後強制執行）

每次修改完程式碼，在結束回覆前必須依序執行以下指令，確認全部通過才能結束：

| 指令 | 工具 | 目的 |
|---|---|---|
| `pnpm lint` | ESLint | 檢查語法規則與 React/Next.js 最佳實踐 |
| `pnpm tsc --noEmit` | TypeScript | 確認型別無誤 |
| `pnpm format:check` | Prettier | 確認格式符合 .prettierrc 規則 |

若任一指令有錯誤輸出，**必須修正後**才能結束回覆。

## 開發流程規範
1. 每個 Milestone 開始前先確認上一個 Milestone 的 dev-log 已寫完
2. 不做超出當前 Milestone 範圍的功能（No gold plating）
3. 不寫無謂的 code comment，只寫「為什麼」，不寫「做什麼」
4. API Key 不得出現在前端程式碼（全部走 Cloud Functions）
5. 任何外部 API 呼叫都要加 try/catch，錯誤回傳統一格式 `{ error: string }`
6. 套件管理只用 `pnpm`，禁止使用 npm 或 yarn（.npmrc 已設 engine-strict=true）

## 架構摘要
- 前端：Next.js 純靜態輸出（`output: 'export'`），部署到 Firebase Hosting
- 後端：Firebase Cloud Functions (Gen2, TypeScript)，代理所有 API 呼叫
- 快取：Firestore collection `places_cache`，TTL 10 分鐘
- 金鑰：全部存 Firebase Secret Manager，前端完全不碰

## Milestone 進度
- [x] M1：骨架建立（Next.js + 地圖 + 定位）
- [ ] M2：Nearby API 串接（Functions emulator + 餐廳 markers）
- [ ] M3：粗篩 UI（類型 + 價位 chip）
- [ ] M4：LLM 分析（/analyze 端點 + 第二階段 UI）
- [ ] M5：結果頁面（5 間餐廳卡片 + Google Maps deeplink）
- [ ] M6：快取 + 安全（Firestore cache、CORS、限流）
- [ ] M7：Firebase 部署（Hosting + Functions + Secret）
