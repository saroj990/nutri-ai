"use client";

import { cn } from "@/lib/utils";

interface CalorieRingProps {
  consumed: number;
  goal: number;
  size?: number;
  className?: string;
}

export function CalorieRing({
  consumed,
  goal,
  size = 160,
  className,
}: CalorieRingProps) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = goal > 0 ? Math.min(consumed / goal, 1.25) : 0;
  const offset = circumference - progress * circumference;
  const remaining = Math.max(0, goal - consumed);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${consumed} of ${goal} calories consumed`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/40"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            "transition-all duration-700 ease-out",
            progress > 1 ? "text-amber-500" : "text-primary",
          )}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold leading-none">
          {remaining.toLocaleString()}
        </span>
        <span className="mt-1 text-xs text-muted-foreground">kcal left</span>
        <span className="mt-0.5 text-[10px] text-muted-foreground">
          {consumed.toLocaleString()} / {goal.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
