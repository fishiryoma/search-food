"use client";

import { create } from "zustand";
import type { PlaceAnalysis } from "@/lib/schemas";

interface FilterState {
  analyses: PlaceAnalysis[];
  selectedFlavors: string[];
  selectedDishes: string[];
  setAnalyses: (analyses: PlaceAnalysis[]) => void;
  toggleFlavor: (flavor: string) => void;
  toggleDish: (dish: string) => void;
  reset: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  analyses: [],
  selectedFlavors: [],
  selectedDishes: [],
  setAnalyses: (analyses) => set({ analyses, selectedFlavors: [], selectedDishes: [] }),
  toggleFlavor: (flavor) =>
    set((s) => ({
      selectedFlavors: s.selectedFlavors.includes(flavor)
        ? s.selectedFlavors.filter((f) => f !== flavor)
        : [...s.selectedFlavors, flavor],
    })),
  toggleDish: (dish) =>
    set((s) => ({
      selectedDishes: s.selectedDishes.includes(dish)
        ? s.selectedDishes.filter((d) => d !== dish)
        : [...s.selectedDishes, dish],
    })),
  reset: () => set({ analyses: [], selectedFlavors: [], selectedDishes: [] }),
}));
