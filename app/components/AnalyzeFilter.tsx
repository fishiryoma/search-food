"use client";

import { useFilterStore } from "@/store/useFilterStore";

export default function AnalyzeFilter() {
  const { analyses, selectedFlavors, selectedOccasions, toggleFlavor, toggleOccasion } =
    useFilterStore();

  if (analyses.length === 0) return null;

  const allFlavors = [...new Set(analyses.flatMap((a) => a.flavor))].sort();
  const allOccasions = [...new Set(analyses.flatMap((a) => a.occasion))].sort();

  if (allFlavors.length === 0 && allOccasions.length === 0) return null;

  return (
    <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex flex-col gap-2">
      <p className="text-xs font-medium text-blue-600">AI 分析篩選</p>
      {allFlavors.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {allFlavors.map((flavor) => {
            const active = selectedFlavors.includes(flavor);
            return (
              <button
                key={flavor}
                onClick={() => toggleFlavor(flavor)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  active ? "bg-blue-600 text-white" : "bg-white text-zinc-600 hover:bg-blue-100"
                }`}
              >
                {flavor}
              </button>
            );
          })}
        </div>
      )}
      {allOccasions.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {allOccasions.map((occasion) => {
            const active = selectedOccasions.includes(occasion);
            return (
              <button
                key={occasion}
                onClick={() => toggleOccasion(occasion)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  active ? "bg-blue-600 text-white" : "bg-white text-zinc-600 hover:bg-blue-100"
                }`}
              >
                {occasion}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
