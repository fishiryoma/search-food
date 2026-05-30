# M3：粗篩 UI

## 目標
- 實作類型與價位多選 chip 元件
- 依選擇結果即時過濾地圖 markers 與候選清單

## 開始日期
2026-05-30

## 完成日期
2026-05-30

## 實作內容
- [x] 建立 `store/useFilterStore.ts`（Zustand，selectedTypes / selectedPriceLevels + toggle / reset）
- [x] 建立 `app/components/FilterChips.tsx`
  - 從 places 的 types 陣列聚合，過濾 generic types，只顯示有中文標籤且出現 ≥ 2 次者
  - 依出現次數降冪排序
  - 價位 chip 從 places 資料動態產生（只顯示實際有資料的價位）
  - 選中 → 藍底白字；未選 → 灰底，hover 加深
  - 類型列水平捲動（隱藏 scrollbar）
- [x] 更新 `page.tsx`：加入篩選邏輯（type AND price 雙重過濾）
  - 未選擇任何 chip → 顯示全部
  - Header 副標題改為「顯示 N / M 間餐廳」
- [x] ESLint ✅ tsc --noEmit ✅ Prettier ✅

## 與原計畫的差異
- 無（按計畫完整實作）

## 下一步
M4：LLM 分析端點 + 第二階段細項 UI
