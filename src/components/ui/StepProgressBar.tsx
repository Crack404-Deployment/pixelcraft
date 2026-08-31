"use client";

import Link from "next/link";
import { Check } from "lucide-react";

interface StepProgressBarProps {
  currentStep: number;
}

const STEPS = [
  { id: 1, label: "App Icon", href: "/playstore" },
  { id: 2, label: "Feature Graphic", href: "/playstore/feature-graphic" },
  { id: 3, label: "Phone Screenshot", href: "/playstore/phone-screenshots" },
  { id: 4, label: "7-inch Tablet", href: "/playstore/tablet-screenshots" },
  { id: 5, label: "10-inch Tablet", href: "/playstore/10-inch-tablet" },
  { id: 6, label: "Download", href: "/playstore/download" },
];

export default function StepProgressBar({ currentStep }: StepProgressBarProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between relative">
        {STEPS.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isLast = index === STEPS.length - 1;

          return (
            <div key={step.id} className="flex-1 flex flex-col items-center relative">
              {/* Connecting Bar */}
              {!isLast && (
                <div className="absolute top-5 left-[50%] right-[-50%] h-[4px] z-0 bg-slate-800">
                  <div
                    className="h-full bg-orange-500 transition-all duration-300"
                    style={{ width: isCompleted ? "100%" : "0%" }}
                  />
                </div>
              )}

              {/* Numbered / Checkmark Circle */}
              <Link
                href={step.href}
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                  isCompleted
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    : isActive
                    ? "bg-slate-950 text-orange-500 border-2 border-orange-500 ring-4 ring-orange-500/20 shadow-lg"
                    : "bg-slate-900 border-2 border-slate-700 text-slate-400 hover:border-slate-500"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[3]" />
                ) : (
                  <span>{step.id}</span>
                )}
              </Link>

              {/* Step Label */}
              <span
                className={`mt-2 text-xs sm:text-sm font-medium text-center transition-colors ${
                  isActive
                    ? "text-orange-500 font-bold"
                    : isCompleted
                    ? "text-slate-200"
                    : "text-slate-500"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}