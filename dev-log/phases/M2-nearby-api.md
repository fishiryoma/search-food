# M2：Nearby API 串接

## 目標
- 建立 Firebase Functions 專案結構（TypeScript）
- 實作 `nearby` Cloud Function，代理 Google Places Nearby Search
- 前端呼叫 Function（emulator），在地圖標出附近餐廳 markers

## 開始日期
2026-05-30

## 完成日期
2026-05-30

## 實作內容
- [x] `firebase init functions,firestore,emulators`（TypeScript，Node 22）
- [x] 建立 `functions/src/nearby.ts`（Places Nearby Search 代理 + Firestore 10 分鐘 cache）
- [x] cache 邏輯內嵌於 `nearby.ts`（計畫另建 cache.ts，實際合併以減少跨檔案呼叫）
- [x] 定義 `NearbyResponseSchema`（`lib/schemas.ts`）
- [x] 建立 `lib/api.ts`（fetchNearby，含 Zod runtime 驗證）
- [x] 建立 `hooks/usePlaces.ts`（管理 fetch 狀態，衍生 isLoading）
- [x] 更新 `MapView.tsx`（接收 `places` prop，為每間餐廳渲染 AdvancedMarker）
- [x] 更新 `page.tsx`（整合 usePlaces，header 顯示搜尋狀態與餐廳數量）
- [x] 修正 ESLint config：`functions/**` 加入 globalIgnores（避免 Next.js ESLint 誤掃 CJS 編譯產物）
- [x] ESLint ✅ tsc --noEmit ✅ Prettier ✅

## 遇到的問題
1. **ESLint 誤掃 `functions/lib/`**：編譯後的 CJS 檔觸發 `@typescript-eslint/no-require-imports` 錯誤
   - 解法：在 `eslint.config.mjs` 的 `globalIgnores` 加入 `functions/**`

## 與原計畫的差異
- `cache.ts` 獨立檔案 → 合併進 `nearby.ts`（邏輯不複雜，獨立一檔反而增加複雜度）
- Firebase init 不支援多服務名稱以空格分隔，需逐一執行或用逗號連接

## 下一步
M3：粗篩 UI（類型 + 價位 chip）
