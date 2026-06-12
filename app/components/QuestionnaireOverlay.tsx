"use client";

import { useState } from "react";
import type { UserContext } from "@/lib/schemas";

const BUDGET_OPTIONS: { label: string; value: UserContext["budget"] }[] = [
  { label: "< 100 元", value: "<100" },
  { label: "100 ~ 200 元", value: "100~200" },
  { label: "> 300 元", value: ">300" },
];

const PREFERENCE_OPTIONS = ["飯", "麵", "鹹", "甜", "湯", "乾", "熱", "冷"];

interface Props {
  onComplete: (ctx: UserContext) => void;
}

export default function QuestionnaireOverlay({ onComplete }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [budget, setBudget] = useState<UserContext["budget"] | null>(null);
  const [preferences, setPreferences] = useState<string[]>([]);

  function handleBudgetSelect(value: UserContext["budget"]) {
    setBudget(value);
    setStep(2);
  }

  function togglePreference(pref: string) {
    setPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  }

  function handleConfirm() {
    if (!budget) return;
    onComplete({ budget, preferences });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* progress dots */}
        <div className="flex gap-1.5 justify-center pt-5">
          <div className={`w-2 h-2 rounded-full ${step >= 1 ? "bg-blue-600" : "bg-zinc-200"}`} />
          <div className={`w-2 h-2 rounded-full ${step >= 2 ? "bg-blue-600" : "bg-zinc-200"}`} />
        </div>

        <div className="px-6 pt-4 pb-6">
          {step === 1 && (
            <>
              <p className="text-center text-xs text-zinc-400 mb-1">問題 1 / 2</p>
              <h2 className="text-center text-lg font-bold text-zinc-900 mb-5">
                今天的預算大概是？
              </h2>
              <div className="flex flex-col gap-3">
                {BUDGET_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleBudgetSelect(opt.value)}
                    className="w-full py-3.5 rounded-2xl border-2 border-zinc-100 text-zinc-700 font-semibold text-base hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 active:scale-95 transition-all"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-center text-xs text-zinc-400 mb-1">問題 2 / 2</p>
              <h2 className="text-center text-lg font-bold text-zinc-900 mb-1">
                有什麼特別想吃的嗎？
              </h2>
              <p className="text-center text-xs text-zinc-400 mb-5">可複選，或直接略過</p>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {PREFERENCE_OPTIONS.map((pref) => {
                  const selected = preferences.includes(pref);
                  return (
                    <button
                      key={pref}
                      onClick={() => togglePreference(pref)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all active:scale-95 ${
                        selected
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-zinc-200 text-zinc-600 hover:border-blue-300"
                      }`}
                    >
                      {pref}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleConfirm}
                className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-semibold text-base hover:bg-blue-700 active:scale-95 transition-all"
              >
                開始搜尋
              </button>
              <button
                onClick={() => onComplete({ budget: budget!, preferences: [] })}
                className="w-full mt-2 py-2 text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                略過，直接搜尋
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
