"use client";

import { useFilterStore } from "@/store/useFilterStore";

function ChipRow({
  items,
  selected,
  onToggle,
}: {
  items: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="flex gap-2 flex-wrap">
      {items.map((item) => {
        const active = selected.includes(item);
        return (
          <button
            key={item}
            onClick={() => onToggle(item)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              active ? "bg-blue-600 text-white" : "bg-white text-zinc-600 hover:bg-blue-100"
            }`}
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
    <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex flex-col gap-2">
      <p className="text-xs font-medium text-blue-600">AI 分析篩選</p>
      {allDishes.length > 0 && (
        <>
          <p className="text-xs text-zinc-400">推薦料理</p>
          <ChipRow items={allDishes} selected={selectedDishes} onToggle={toggleDish} />
        </>
      )}
      {allFlavors.length > 0 && (
        <ChipRow items={allFlavors} selected={selectedFlavors} onToggle={toggleFlavor} />
      )}
    </div>
  );
}
