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
