# M1：骨架建立

## 目標
- 建立 Next.js (TypeScript + Tailwind) 專案
- 整合 Google Maps JavaScript API
- 實作 Geolocation 定位
- 在地圖上顯示使用者位置 + 1km 半徑圓圈

## 開始日期
2026-05-23

## 完成日期
2026-05-23

## 實作內容
- [x] `npx create-next-app@latest` 建立專案（TypeScript、App Router、Tailwind v4）
- [x] 安裝 `@vis.gl/react-google-maps`、`zustand`、`zod`
- [x] 建立 `app/components/MapView.tsx`（地圖 + Marker + 1km Circle via `google.maps.Circle`）
- [x] 建立 `hooks/useGeolocation.ts`（`getCurrentPosition`，支援錯誤訊息在地化）
- [x] 設定 `next.config.ts`（`output: 'export'`、`images.unoptimized: true`）
- [x] 建立 `lib/schemas.ts`（`GeoCoords`、`Place` Zod schema）
- [x] 建立 `app/page.tsx`（步驟 0 授權畫面 → 步驟 1 地圖顯示）
- [x] 建立 `.env.local.example`
- [x] TypeScript 型別檢查通過（`tsc --noEmit` 零錯誤）
- [x] `npm run dev` 啟動成功，`http://localhost:3000`
- [x] 工具鏈補強：Prettier、pnpm 遷移、ESLint 格式驗證規則（`eslint-config-prettier`）
- [x] 遷移 `Marker` → `AdvancedMarker`（加 `mapId` prop，`DEMO_MAP_ID` fallback），消除 deprecation warning

## 遇到的問題
1. **目錄名含大寫**：`Search-food` 不符 npm 命名規則，`create-next-app` 拒絕執行
   - 解法：手動將目錄改名為 `search-food`
2. **React Maps 套件改版**：原計畫使用 `@react-google-maps/api`，改用 `@vis.gl/react-google-maps`
   - 原因：官方維護、對 React 19 相容性更佳
3. **`google.maps.Marker` 棄用警告**：執行後 terminal 出現 deprecation warning（自 2024-02-21 起棄用）
   - 解法：遷移至 `AdvancedMarker`；`<Map>` 加入 `mapId` prop，本地開發 fallback 為 `"DEMO_MAP_ID"`
4. **`.prettierignore` 未排除 `.claude/`**：`format:check` 對 `settings.local.json` 的行尾報錯
   - 解法：在 `.prettierignore` 加入 `.claude`

## 與原計畫的差異
- Google Maps 套件從 `@react-google-maps/api` 改為 `@vis.gl/react-google-maps`（更新至 ADR-004）
- Next.js 版本為 16.2.6（比計畫中預期的 15.x 高），Tailwind 使用 v4

## 下一步
M2：接上 Firebase Functions emulator，串接 Nearby Search API
