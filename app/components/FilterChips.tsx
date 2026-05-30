"use client";

import { useFilterStore } from "@/store/useFilterStore";
import type { Place } from "@/lib/schemas";

const TYPE_LABELS: Record<string, string> = {
  japanese_restaurant: "日式",
  chinese_restaurant: "中式",
  korean_restaurant: "韓式",
  american_restaurant: "美式",
  italian_restaurant: "義式",
  thai_restaurant: "泰式",
  french_restaurant: "法式",
  seafood_restaurant: "海鮮",
  ramen_restaurant: "拉麵",
  sushi_restaurant: "壽司",
  cafe: "咖啡廳",
  coffee_shop: "咖啡廳",
  bakery: "烘焙",
  fast_food_restaurant: "速食",
  pizza_restaurant: "披薩",
  sandwich_shop: "三明治",
  noodle_restaurant: "麵食",
  vegetarian_restaurant: "素食",
  vegan_restaurant: "純素",
  bar: "酒吧",
  brunch_restaurant: "早午餐",
  breakfast_restaurant: "早餐",
  buffet_restaurant: "自助餐",
  hot_pot_restaurant: "火鍋",
  steak_house: "牛排",
};

const GENERIC_TYPES = new Set([
  "restaurant",
  "food",
  "establishment",
  "point_of_interest",
  "store",
  "meal_takeaway",
  "meal_delivery",
]);

const PRICE_LABELS: Record<number, string> = { 1: "$", 2: "$$", 3: "$$$", 4: "$$$$" };

interface FilterChipsProps {
  places: Place[];
}

export default function FilterChips({ places }: FilterChipsProps) {
  const { selectedTypes, selectedPriceLevels, toggleType, togglePriceLevel } = useFilterStore();

  // 統計各 type 出現次數，只顯示有中文標籤且出現 ≥ 2 次者
  const typeCounts = new Map<string, number>();
  for (const place of places) {
    for (const type of place.types) {
      if (!GENERIC_TYPES.has(type) && TYPE_LABELS[type]) {
        typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
      }
    }
  }
  const availableTypes = [...typeCounts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([type]) => type);

  const availablePriceLevels = [
    ...new Set(places.map((p) => p.priceLevel).filter((p): p is number => p !== undefined)),
  ].sort();

  if (availableTypes.length === 0 && availablePriceLevels.length === 0) return null;

  return (
    <div className="bg-white border-b border-zinc-100 px-4 py-2 flex flex-col gap-2">
      {availableTypes.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {availableTypes.map((type) => {
            const active = selectedTypes.includes(type);
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  active ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {TYPE_LABELS[type]}
              </button>
            );
          })}
        </div>
      )}
      {availablePriceLevels.length > 0 && (
        <div className="flex gap-2">
          {availablePriceLevels.map((level) => {
            const active = selectedPriceLevels.includes(level);
            return (
              <button
                key={level}
                onClick={() => togglePriceLevel(level)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  active ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {PRICE_LABELS[level]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
