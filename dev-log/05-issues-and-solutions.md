# 問題與解決方式

---
<!-- 遇到問題時往下新增，格式如下：

## [日期] 問題標題

- **問題描述**：
- **環境（OS / Node / 套件版本）**：
- **錯誤訊息**：
  ```
  （貼上錯誤訊息）
  ```
- **嘗試過的方法**：
  1.
  2.
- **最終解法**：
- **參考資源**：

-->

## 2026-06-16｜TypeScript TS7009 — `new google.maps.Circle` 缺少 construct signature

- **問題描述**：MapView.tsx 使用 `new google.maps.Circle(...)` 時，TypeScript 報 TS7009 `'new' expression whose target lacks a construct signature, implicitly has an 'any' type`，即使已安裝 `@types/google.maps@^3.64.1`。
- **錯誤訊息**：
  ```
  error TS7009: 'new' expression, whose target lacks a construct signature, implicitly has an 'any' type.
  ```
- **嘗試過的方法**：
  1. 確認 `@types/google.maps` 已安裝 → 確認，但仍報錯
  2. 確認 tsconfig 無 `types` 欄位限制 → 確認無限制
- **最終解法**：在 `MapView.tsx` 最頂部加上 `/// <reference types="@types/google.maps" />` 明確引入 global 型別宣告。
- **參考資源**：TypeScript Triple-Slash Directives

---

## 2026-06-16｜TypeScript TS2559 — `new Map(...)` 與 react-google-maps 的 `Map` 元件命名衝突

- **問題描述**：`MapView.tsx` 同時 import `Map` 元件（來自 `@vis.gl/react-google-maps`）並使用 JavaScript 內建 `new Map(...)`，TypeScript 將 `Map` 解析為 React 元件而非內建 Map constructor，導致 TS2559。
- **錯誤訊息**：
  ```
  error TS2559: Type '...' has no properties in common with type 'MapProps'.
  ```
- **最終解法**：將 import 改為 `Map as GoogleMap`，並將 JSX 中的 `<Map>` 替換為 `<GoogleMap>`，避免命名衝突。

---

## 2026-06-16｜M7 部署｜Cloud Build 因 pnpm v10 安全政策封鎖 build scripts

- **問題描述**：`firebase deploy` 時 Cloud Build 執行 `pnpm install` 失敗，錯誤為 `[ERR_PNPM_IGNORED_BUILDS]`。pnpm v10 預設封鎖所有套件的 build scripts（`@firebase/util`、`protobufjs`、`unrs-resolver`），需明確核准才能執行。
- **嘗試過的方法**：
  1. `functions/package.json` 加 `"pnpm": { "onlyBuiltDependencies": [...] }` → pnpm v10 已不讀此欄位，顯示 WARN 並忽略
  2. `functions/pnpm-workspace.yaml` 加 `onlyBuiltDependencies:` → Cloud Build 環境未識別
  3. 本機跑 `pnpm approve-builds` 更新 lockfile → Cloud Build 仍觸發同樣錯誤
- **最終解法**：`functions/` 目錄從 pnpm 改為 npm。刪除 `pnpm-lock.yaml`，執行 `npm install` 產生 `package-lock.json`，`firebase.json` predeploy 改為 `npm --prefix "$RESOURCE_DIR" run build`。
- **附帶問題**：直接在 `functions/` 跑 `npm install` 失敗（`Cannot read properties of null (reading 'matches')`），因為殘留 pnpm 的 `.pnpm/` 虛擬儲存 symlink。解法：先刪 `node_modules` 再跑 `npm install`。

---

## 2026-06-16｜M7 部署｜Cloud Run 預設需要驗證，前端收到 CORS 錯誤

- **問題描述**：Functions 部署成功後，前端打 `/nearby` 出現 CORS 錯誤（`strict-origin-when-cross-origin`）。實際原因是 Cloud Run IAM 預設「需要驗證」，請求在 IAM 層被擋（403）而從未進到 Function 程式碼，因此 CORS header 從未被加入回應。
- **最終解法**：GCP Console → Cloud Run → `nearby` / `analyze` → 安全性 → 驗證 → 改為「允許公開存取」。兩個服務各別設定。
- **補充**：函式程式碼的 CORS 設定（`utils.ts` 的 `ALLOWED_ORIGINS`）本身正確，問題出在 Cloud Run IAM 層比 Function 程式碼更早攔截請求。

---

## 2026-06-18｜篩選邏輯 Bug — 無 analysis 的餐廳在有選 chip 時仍通過篩選

- **問題描述**：使用者選取推薦品項 chip（如「割包」）後，前五名中仍出現明確沒有該品項的餐廳。
- **根本原因**：`finalPlaces` 篩選邏輯中有一行 `if (!a) return true`，導致在 `analysisMap` 找不到對應 analysis 的餐廳，不管選了什麼 chip 一律放行。
  - 這種情況真實發生於：`handleReanalyze` 執行期間 `setNearbyOverride(freshPlaces)` 先更新地圖，而 `runAnalyze` 尚未完成，造成短暫的 places / analyses 不同步。
  - 另外 Gemini 可能漏傳部分餐廳的 analysis，造成 `analysisMap` 查不到該 placeId。
- **最終解法**：改為 `if (!a) return selectedFlavors.length === 0 && selectedDishes.length === 0`——只有在完全沒有選取任何 chip 時，無 analysis 的餐廳才放行；有選 chip 時一律排除。
