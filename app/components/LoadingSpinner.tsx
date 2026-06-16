"use client";

import { useState, useEffect } from "react";

const LOADING_MESSAGES = [
  "正在嗅找附近美食...",
  "我家巷口那家最香啦",
  "都什麼年代了交給 AI 做啦",
  "快了快了、真的快找到了",
  "路邊的貓貓說這幾家不錯",
];

interface Props {
  variant?: "overlay" | "inline";
  label?: string;
}

export default function LoadingSpinner({ variant = "overlay", label }: Props) {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * LOADING_MESSAGES.length));
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (label) return;
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIdx((prev) => {
          const next =
            (prev + 1 + Math.floor(Math.random() * (LOADING_MESSAGES.length - 1))) %
            LOADING_MESSAGES.length;
          return next;
        });
        setFading(false);
      }, 300);
    }, 2800);
    return () => clearInterval(id);
  }, [label]);

  const isOverlay = variant === "overlay";

  // r=26 → circumference≈163.4, 75% arc≈122, gap≈41
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-16 h-16">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            strokeWidth="5"
            className={isOverlay ? "stroke-white/20" : "stroke-zinc-100"}
          />
        </svg>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: "0.85s" }}>
          <svg className="w-full h-full" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              strokeWidth="5"
              strokeDasharray="122 41"
              strokeLinecap="round"
              className={isOverlay ? "stroke-white" : "stroke-orange-500"}
              transform="rotate(-90 32 32)"
            />
          </svg>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`w-2 h-2 rounded-full animate-pulse ${isOverlay ? "bg-white/70" : "bg-orange-400"}`}
          />
        </div>
      </div>
      <p
        className={`text-sm whitespace-nowrap transition-opacity duration-300 ${
          isOverlay ? "text-white drop-shadow-md font-medium" : "text-zinc-400 font-medium"
        } ${fading ? "opacity-0" : "opacity-100"}`}
      >
        {label ?? LOADING_MESSAGES[idx]}
      </p>
    </div>
  );
}
