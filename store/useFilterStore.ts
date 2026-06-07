"use client";

import { create } from "zustand";
import type { PlaceAnalysis } from "@/lib/schemas";

interface FilterState {
  // M3 粗篩
  selectedTypes: string[];
  selectedPriceLevels: number[];
  toggleType: (type: string) => void;
  togglePriceLevel: (level: number) => void;
  // M4 LLM 細篩
  analyses: PlaceAnalysis[];
  selectedFlavors: string[];
  selectedOccasions: string[];
  setAnalyses: (analyses: PlaceAnalysis[]) => void;
  toggleFlavor: (flavor: string) => void;
  toggleOccasion: (occasion: string) => void;
  // 重置
  reset: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedTypes: [],
  selectedPriceLevels: [],
  analyses: [],
  selectedFlavors: [],
  selectedOccasions: [],
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
  setAnalyses: (analyses) => set({ analyses, selectedFlavors: [], selectedOccasions: [] }),
  toggleFlavor: (flavor) =>
    set((s) => ({
      selectedFlavors: s.selectedFlavors.includes(flavor)
        ? s.selectedFlavors.filter((f) => f !== flavor)
        : [...s.selectedFlavors, flavor],
    })),
  toggleOccasion: (occasion) =>
    set((s) => ({
      selectedOccasions: s.selectedOccasions.includes(occasion)
        ? s.selectedOccasions.filter((o) => o !== occasion)
        : [...s.selectedOccasions, occasion],
    })),
  reset: () =>
    set({
      selectedTypes: [],
      selectedPriceLevels: [],
      analyses: [],
      selectedFlavors: [],
      selectedOccasions: [],
    }),
}));
