"use client";

import { useFilterStore } from "@/store/useFilterStore";

function ChipRow({
  items,
  selected,
  onToggle,
  variant,
}: {
  items: string[];
  selected: string[];
  onToggle: (v: string) => void;
  variant: "dish" | "flavor";
}) {
  if (items.length === 0) return null;
  const activeClass = variant === "dish" ? "bg-amber-500 text-white" : "bg-blue-600 text-white";
  const inactiveClass =
    variant === "dish"
      ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
      : "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100";

  return (
    <div className="flex gap-2 flex-wrap">
      {items.map((item) => {
        const active = selected.includes(item);
        return (
          <button
            key={item}
            onClick={() => onToggle(item)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer ${active ? activeClass : inactiveClass}`}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

export default function AnalyzeFilter() {
  const { analyses, selectedDishes, selectedFlavors, toggleDish, toggleFlavor } = useFilterStore();

  if (analyses.length === 0) return null;

  const allDishes = [...new Set(analyses.flatMap((a) => a.signature_dishes))].sort();
  const allFlavors = [...new Set(analyses.flatMap((a) => a.flavor))].sort();

  if (allDishes.length === 0 && allFlavors.length === 0) return null;

  return (
    <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-2 flex flex-col gap-2">
      {allDishes.length > 0 && (
        <>
          <p className="text-xs font-medium text-amber-600">推薦品項</p>
          <ChipRow
            items={allDishes}
            selected={selectedDishes}
            onToggle={toggleDish}
            variant="dish"
          />
        </>
      )}
      {allFlavors.length > 0 && (
        <>
          <p className="text-xs font-medium text-blue-600">口味偏好</p>
          <ChipRow
            items={allFlavors}
            selected={selectedFlavors}
            onToggle={toggleFlavor}
            variant="flavor"
          />
        </>
      )}
    </div>
  );
}
