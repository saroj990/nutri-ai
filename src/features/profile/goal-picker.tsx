"use client";

import { TrendingDown, Dumbbell, Scale } from "lucide-react";
import type { GoalType } from "@/domain/entities/user-profile";
import { GOAL_OPTIONS } from "@/features/profile/constants";
import { cn } from "@/lib/utils";

const GOAL_ICONS: Record<GoalType, typeof Scale> = {
  weight_loss: TrendingDown,
  maintenance: Scale,
  weight_gain: Dumbbell,
};

interface GoalPickerProps {
  value: GoalType;
  onChange: (goal: GoalType) => void;
}

export function GoalPicker({ value, onChange }: GoalPickerProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {GOAL_OPTIONS.map((option) => {
        const Icon = GOAL_ICONS[option.value];
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
              selected
                ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                : "border-muted hover:border-primary/40 hover:bg-muted/50",
            )}
          >
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full",
                selected ? "bg-primary text-primary-foreground" : "bg-muted",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold">{option.shortLabel}</p>
              <p className="text-xs text-muted-foreground">{option.label}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
