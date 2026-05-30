# API 研究筆記

## Google Maps Platform

### 使用的 API 清單

| API | 用途 | 計費單位 | 單價 |
|---|---|---|---|
| Maps JavaScript API | 前端地圖顯示、marker、圓圈 | 每 1000 次載入 | $7 |
| Places API (New) — Nearby Search | 搜尋附近餐廳 | 每次請求 | $0.032（Basic）/ $0.040（Advanced） |
| Places API (New) — Place Details | 取得餐廳詳細資訊（選用） | 每次請求 | $0.017（Basic）/ $0.020（Advanced） |

> 每月 $200 USD 免費額度適用於所有 Maps Platform 產品合計。

### 費用試算（個人使用）

**假設**：每天使用 3 次，每次：1 Nearby Search + 1 Maps 載入

| 項目 | 每次 | 每月（90 次） |
|---|---|---|
| Nearby Search | $0.032 | $2.88 |
| Maps JS 載入 | $0.007 | $0.63 |
| **合計** | **$0.039** | **$3.51** |

**結論**：遠低於 $200 免費額度，個人使用實質免費。

### API Key 保護策略

- **Maps JS API Key**（瀏覽器端）：設 HTTP Referrer 白名單（`localhost:3000`、`your-domain.web.app`）
- **Places API Key**（伺服器端）：存 Firebase Secret Manager，只在 Cloud Functions 中使用，**絕不出現在前端**
- 兩個 Key 分開建立，最小權限原則

### 重要限制

- Nearby Search 單次最多回傳 **20 筆**（Basic），進階需分頁
- `priceLevel` 欄位：1（經濟）到 4（高檔），部分餐廳無此欄位
- `types` 陣列：每間餐廳可有多個類型（如 `["restaurant", "food", "establishment"]`）
- QPS 限制：預設 50 QPS（個人使用完全夠用）

---

## Anthropic Claude API

### 選用模型

**Claude Haiku 4.5**（`claude-haiku-4-5-20251001`）

- 原因：成本最低（約 $1/百萬 input token）、速度快（< 2 秒）、足以做餐廳分類任務
- 個人 MVP 使用幾乎免費

### Prompt 設計思路

- System prompt：固定，描述任務（用 prompt caching 節省費用）
- User message：傳入餐廳清單 JSON（名稱、types、評分、評論摘要）
- 輸出格式：要求嚴格 JSON，用 Zod schema 驗證回傳
- 範例 output 結構：
  ```json
  {
    "tags": {
      "cuisine": ["日式", "拉麵"],
      "flavor": ["重口味", "湯底濃郁"],
      "occasion": ["快食", "外帶"]
    }
  }
  ```

### 費用試算

每次 `/analyze` 呼叫約傳入 2,000 tokens（20 間餐廳），輸出 500 tokens：
- Input：$0.002
- Output：$0.002
- **每次分析：$0.004**，個人使用月費 < $0.5

---
<!-- 日後研究其他 API 往下加 -->
