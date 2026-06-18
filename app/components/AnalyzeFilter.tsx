"use client";

import { useState } from "react";
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
  const { analyses, selectedDishes, selectedFlavors, toggleDish, toggleFlavor, clearFilters } =
    useFilterStore();
  const [isOpen, setIsOpen] = useState(false);

  if (analyses.length === 0) return null;

  const allDishes = [...new Set(analyses.flatMap((a) => a.signature_dishes))].sort();
  const allFlavors = [...new Set(analyses.flatMap((a) => a.flavor))].sort();

  if (allDishes.length === 0 && allFlavors.length === 0) return null;

  const hasActiveFilters = selectedFlavors.length > 0 || selectedDishes.length > 0;

  return (
    <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-2 flex flex-col gap-2">
      {hasActiveFilters && (
        <div className="flex justify-start">
          <button
            onClick={clearFilters}
            className="text-xs text-zinc-400 hover:text-zinc-600  hover:border-zinc-500 transition-colors cursor-pointer border border-zinc-300 px-3 py-1 border-dashed"
          >
            清除篩選
          </button>
        </div>
      )}
      {allFlavors.length > 0 && (
        <>
          <p className="text-xs font-medium text-blue-600">口味偏好篩選</p>
          <ChipRow
            items={allFlavors}
            selected={selectedFlavors}
            onToggle={toggleFlavor}
            variant="flavor"
          />
        </>
      )}
      {allDishes.length > 0 && (
        <>
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="flex items-center gap-1.5 cursor-pointer w-fit"
          >
            <p className="text-xs font-medium text-amber-600">推薦菜單</p>
            {selectedDishes.length > 0 && (
              <span className="text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                {selectedDishes.length}
              </span>
            )}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-amber-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {isOpen && (
            <ChipRow
              items={allDishes}
              selected={selectedDishes}
              onToggle={toggleDish}
              variant="dish"
            />
          )}
        </>
      )}
    </div>
  );
}
