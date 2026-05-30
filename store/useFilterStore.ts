"use client";

import { create } from "zustand";

interface FilterState {
  selectedTypes: string[];
  selectedPriceLevels: number[];
  toggleType: (type: string) => void;
  togglePriceLevel: (level: number) => void;
  reset: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedTypes: [],
  selectedPriceLevels: [],
  toggleType: (type) =>
    set((s) => ({
      selectedTypes: s.selectedTypes.includes(type)
        ? s.selectedTypes.filter((t) => t !== type)
        : [...s.selectedTypes, type],
    })),
  togglePriceLevel: (level) =>
    set((s) => ({
      selectedPriceLevels: s.selectedPriceLevels.includes(level)
        ? s.selectedPriceLevels.filter((l) => l !== level)
        : [...s.selectedPriceLevels, level],
    })),
  reset: () => set({ selectedTypes: [], selectedPriceLevels: [] }),
}));
