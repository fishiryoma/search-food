import type { UserContext } from "@/lib/schemas";

export const BUDGET_OPTIONS: { label: string; value: UserContext["budget"] }[] = [
  { label: "< 100 元", value: "<100" },
  { label: "100 ~ 200 元", value: "100~200" },
  { label: "> 300 元", value: ">300" },
];

export const PREFERENCE_OPTIONS = [
  "飯",
  "麵",
  "鹹",
  "甜",
  "湯",
  "乾",
  "熱",
  "冷",
  "酒",
  "異國",
  "素食",
];
