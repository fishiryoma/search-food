"use client";

import { useState } from "react";
import type { UserContext } from "@/lib/schemas";
import { BUDGET_OPTIONS, PREFERENCE_OPTIONS } from "@/lib/questionnaire";

interface Props {
  onComplete: (ctx: UserContext) => void;
}

function ChevronLeft() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export default function QuestionnaireOverlay({ onComplete }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [budget, setBudget] = useState<UserContext["budget"]>("<100");
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
    onComplete({ budget, preferences });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* navigation row：< dots > */}
        <div className="flex items-center justify-between px-5 pt-5">
          <button
            onClick={() => setStep(1)}
            disabled={step === 1}
            className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 disabled:invisible transition-colors cursor-pointer"
          >
            <ChevronLeft />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setStep(1)}
              className={`w-2.5 h-2.5 rounded-full transition-colors cursor-pointer ${step === 1 ? "bg-blue-600" : "bg-zinc-200 hover:bg-zinc-300"}`}
            />
            <button
              onClick={() => setStep(2)}
              className={`w-2.5 h-2.5 rounded-full transition-colors cursor-pointer ${step === 2 ? "bg-blue-600" : "bg-zinc-200 hover:bg-zinc-300"}`}
            />
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={step === 2}
            className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 disabled:invisible transition-colors cursor-pointer"
          >
            <ChevronRight />
          </button>
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
                    className={`w-full py-3.5 rounded-2xl border-2 font-semibold text-base active:scale-95 transition-all cursor-pointer ${
                      budget === opt.value
                        ? "border-blue-500 text-blue-600 bg-blue-50"
                        : "border-zinc-100 text-zinc-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"
                    }`}
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
              <h2 className="text-center text-lg font-bold text-zinc-900 mb-1">想吃什麼嗎？</h2>
              <p className="text-center text-xs text-zinc-400 mb-5">可複選</p>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {PREFERENCE_OPTIONS.map((pref) => {
                  const selected = preferences.includes(pref);
                  return (
                    <button
                      key={pref}
                      onClick={() => togglePreference(pref)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all active:scale-95 cursor-pointer ${
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
                className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-semibold text-base hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
              >
                開始搜尋
              </button>
              <button
                onClick={() => onComplete({ budget: budget!, preferences: [] })}
                className="w-full mt-2 py-2 text-sm text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
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
