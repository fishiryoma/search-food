# 附近吃什麼

步行可達餐廳推薦 App。定位後回答兩個問題，AI 從 1 公里內的餐廳挑出最符合你今天胃口的幾間。

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

```
前端 (Next.js 靜態輸出)          後端 (Firebase Cloud Functions Gen2)
─────────────────────           ─────────────────────────────────────
Next.js 16 + React 19           /nearby  → Google Places Nearby Search API
TypeScript + Tailwind CSS        /analyze → Google Gemini 2.0 Flash
@vis.gl/react-google-maps        Firestore → 快取（TTL 10 分鐘）+ 限流
Zustand（篩選狀態）               Secret Manager → 保管所有 API Key
Zod（前後端共用 schema）
```

前端純靜態部署至 Firebase Hosting，所有 API Key 僅存在後端。

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
# 填入 NEXT_PUBLIC_GOOGLE_MAPS_KEY 和 NEXT_PUBLIC_GOOGLE_MAPS_ID
```

**3. 安裝 Functions 依賴**

```bash
cd functions && npm install && cd ..
```

**4. 設定 Functions 本機 Secret**

```bash
# functions/.secret.local（不納入版控）
GOOGLE_PLACES_KEY=your_places_api_key
GEMINI_KEY=your_gemini_api_key
```

**5. 啟動本機環境（兩個終端）**

```bash
# 終端 1：Firebase Emulator（Functions + Firestore）
firebase emulators:start --only functions,firestore

# 終端 2：Next.js Dev Server
pnpm dev
```

打開 [http://localhost:3000](http://localhost:3000)

## 專案結構

```
├── app/
│   ├── components/
│   │   ├── AnalyzeFilter.tsx     # 口味 / 推薦菜單篩選器
│   │   ├── LoadingSpinner.tsx
│   │   ├── MapView.tsx           # Google Maps + Markers + InfoWindow
│   │   ├── QuestionnaireOverlay.tsx  # 問卷 overlay
│   │   └── RestaurantCard.tsx    # 餐廳卡片
│   └── page.tsx                  # 主流程控制
├── functions/src/
│   ├── nearby.ts                 # /nearby endpoint
│   ├── analyze.ts                # /analyze endpoint（Gemini）
│   └── utils.ts                  # CORS、限流
├── hooks/
│   ├── useGeolocation.ts
│   ├── usePlaces.ts
│   └── useWalkingTime.ts         # Haversine 步行時間估算
├── lib/
│   ├── api.ts                    # fetchNearby / fetchAnalyze
│   ├── questionnaire.ts          # 問卷選項常數
│   └── schemas.ts                # Zod schema（前後端共用）
└── store/
    └── useFilterStore.ts         # Zustand 篩選狀態
```

## 指令

```bash
pnpm dev              # 啟動開發伺服器
pnpm build            # 靜態輸出到 out/
pnpm lint             # ESLint
pnpm tsc --noEmit     # TypeScript 型別檢查
pnpm format           # Prettier 格式化
pnpm format:check     # Prettier 格式驗證
```

## 部署

```bash
# 前端 + Functions 同時部署
firebase deploy

# 只部署 Functions
firebase deploy --only functions

# 只部署前端
pnpm build && firebase deploy --only hosting
```

Functions 使用 Firebase Secret Manager 管理 API Key，部署前需先設定：

```bash
firebase functions:secrets:set GOOGLE_PLACES_KEY
firebase functions:secrets:set GEMINI_KEY
```
