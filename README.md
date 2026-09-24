# 附近吃什麼

步行可達餐廳推薦 App，本專案為 vibe coding（與 AI 協作開發）實作。定位後簡短問題，AI 分析 1 公里內的餐廳，並歸類出口味、菜單，讓毫無想法的使用者也能挑出最符合胃口的餐點。

![餐廳推薦與菜單篩選畫面](public/menu-show.png)

## 功能

- 自動定位，搜尋半徑 1km 內餐廳
- 問卷前置：選預算、選口味偏好（可略過）
- Gemini AI 分析每間餐廳，推斷菜系、招牌菜、一句話摘要與推薦分數
- 依 AI 分數排序，首選標示金色 badge
- 地圖標記 + InfoWindow 顯示價位、評分、步行時間
- 口味 / 推薦菜單二維篩選（支援一鍵清除）
- 查看更多推薦（每次 +5 間）
- 重新分析：重打 Nearby API 取最新結果再重算

## 技術架構

前後端分離

**前端（Vite 靜態輸出）**
- Vite + React 19
- TypeScript + Tailwind CSS
- @vis.gl/react-google-maps
- Zustand（篩選狀態）
- Zod（前後端共用 schema）

**後端（Firebase Cloud Functions Gen2）**
- `/nearby` → Google Places Nearby Search API
- `/analyze` → Google Gemini 2.0 Flash
- Firestore → 快取（TTL 10 分鐘）+ 限流
- Secret Manager → 保管所有 API Key

前端純靜態部署至 Firebase Hosting，所有 API Key 僅存在後端。

## 安全性設計

- **API Key 隔離**：所有金鑰（Google Places、Gemini）存於 Firebase Secret Manager，僅 Cloud Functions 讀取，前端 bundle 不含任何後端金鑰
- **CORS 白名單**：正式環境的 Cloud Functions 只接受自己 Hosting 網域的請求，其餘來源一律拒絕
- **雙層限流**：每 IP 每分鐘 30 次請求限制 + 全站每日 100 次 Nearby API 總量上限，避免單一來源或費用失控
- **Firestore 存取控制**：`firestore.rules` 明確拒絕所有 client SDK / REST API 直接存取，資料庫僅能透過 Cloud Functions 的 Admin SDK 存取
- **統一錯誤格式**：外部 API 呼叫皆包 try/catch，錯誤一律回傳 `{ error: string }`，不外洩內部細節

> Firestore 各 collection（`places_cache`、`rate_limits`、`global_usage`）的用途、Document ID 規則、欄位與清理策略，詳見 [`dev-log/phases/M6-cache-security.md`](dev-log/phases/M6-cache-security.md#firestore-資料結構參考補記於-2026-09-24)。

## 開發方式：Vibe Coding

本專案採 vibe coding 方式開發，全程與 AI 協作，並透過兩個機制維持開發品質與可追蹤性：

- **CLAUDE.md**：定義專案的技術規範與 AI 行為準則（例如前端禁止使用 `any`、只能用 pnpm、每次改動後強制跑 lint / tsc / format 檢查等），讓 AI 助理在每次協作時都遵循一致的規則。
- **dev-log/**：紀錄開發過程與成果，避免與 AI 協作時脈絡遺失、決策不可追溯。想找特定細節可以從這裡查：
  - `00-overview.md`：專案總覽、技術選型摘要、版本歷程
  - `01-requirements.md`：完整功能規格與 Out of Scope 範圍
  - `02-architecture-decisions.md`：架構決策（ADR），例如為何用 Cloud Functions 而非 Next.js API Routes、為何從 Next.js 改用 Vite
  - `03-api-research.md`：Google Places / Gemini API 的費用試算、限制與模型選型
  - `04-ai-discussions.md`：與 AI 討論後的設計決策摘要
  - `05-issues-and-solutions.md`：踩過的 Bug 與解法（TypeScript 型別問題、部署錯誤等）
  - `phases/`：各 Milestone 的目標、進度與遺留問題，例如 `M6-cache-security.md` 內含 Firestore 資料結構、快取／限流／安全性設計的完整記錄

## 前置需求

- Node.js >= 20
- pnpm >= 9
- Firebase CLI：`npm install -g firebase-tools`
- 已建立的 Firebase 專案（Firestore、Cloud Functions、Hosting 啟用）

需要的 API Key（全部在 GCP Console 建立）：

| Key | 用途 |
|---|---|
| Google Maps JavaScript API Key | 前端地圖顯示（限制 HTTP Referrer） |
| Google Maps Map ID | AdvancedMarker 用，未設定自動 fallback 到 DEMO_MAP_ID（選填） |
| Google Places API Key | 後端 Nearby Search（僅限 Cloud Functions IP） |
| Gemini API Key | 後端 AI 分析 |

## 本機開發

**1. 安裝前端依賴**

```bash
pnpm install
```

**2. 設定前端環境變數**

```bash
cp .env.local.example .env.local
# 填入 VITE_GOOGLE_MAPS_KEY 和 VITE_GOOGLE_MAPS_ID
```

**3. 安裝 Functions 依賴**

```bash
cd functions && npm install && cd ..
```

**4. 設定 Functions 本機 Secret**

```bash
# functions/.secret.local（不納入版控）
GOOGLE_PLACES_KEY=your_places_api_key
GEMINI_API_KEY=your_gemini_api_key
```

**5. 啟動本機環境（兩個終端）**

```bash
# 終端 1：Firebase Emulator（Functions + Firestore）
firebase emulators:start --only functions,firestore

# 終端 2：Vite Dev Server
pnpm dev
```

打開 [http://localhost:5173](http://localhost:5173)

> **注意**：`firebase emulators:start` 不會自動重新編譯 TypeScript，emulator 實際執行的是 `functions/lib/` 裡上一次編譯出來的 JS。修改 `functions/src/*.ts` 後，若沒有重新編譯，emulator 會繼續跑舊版程式碼。修改 Functions 程式碼後，用以下其中一種方式讓 emulator 讀到最新版本：
>
> ```bash
> # 方式 A：改一次、手動編譯一次
> cd functions && npm run build && cd ..
>
> # 方式 B：另開一個終端持續監看變更、自動編譯
> cd functions && npm run build:watch
> ```

## 專案結構

```
├── src/
│   ├── components/
│   │   ├── AnalyzeFilter.tsx     # 口味 / 推薦菜單篩選器
│   │   ├── LoadingSpinner.tsx
│   │   ├── MapView.tsx           # Google Maps + Markers + InfoWindow
│   │   ├── QuestionnaireOverlay.tsx  # 問卷 overlay
│   │   └── RestaurantCard.tsx    # 餐廳卡片
│   ├── hooks/
│   │   ├── useGeolocation.ts
│   │   ├── usePlaces.ts
│   │   └── useWalkingTime.ts     # Haversine 步行時間估算
│   ├── lib/
│   │   ├── api.ts                # fetchNearby / fetchAnalyze
│   │   ├── questionnaire.ts      # 問卷選項常數
│   │   └── schemas.ts            # Zod schema（前後端共用）
│   ├── store/
│   │   └── useFilterStore.ts     # Zustand 篩選狀態
│   ├── App.tsx                   # 主流程控制
│   └── main.tsx                  # 進入點
├── functions/src/
│   ├── nearby.ts                 # /nearby endpoint
│   ├── analyze.ts                # /analyze endpoint（Gemini）
│   └── utils.ts                  # CORS、限流
└── index.html
```

## 指令

```bash
pnpm dev              # 啟動開發伺服器
pnpm build            # 靜態輸出到 dist/
pnpm preview          # 預覽 build 結果
pnpm lint             # ESLint
pnpm tsc --noEmit     # TypeScript 型別檢查
pnpm format           # Prettier 格式化
pnpm format:check     # Prettier 格式驗證
```

## 部署

```bash
# 前端 + Functions 同時部署（firebase deploy 不會自動 build，需先手動建置前端）
pnpm build && firebase deploy

# 只部署 Functions
firebase deploy --only functions

# 只部署前端
pnpm build && firebase deploy --only hosting
```

Functions 使用 Firebase Secret Manager 管理 API Key，部署前需先設定：

```bash
firebase functions:secrets:set GOOGLE_PLACES_KEY
firebase functions:secrets:set GEMINI_API_KEY
```
