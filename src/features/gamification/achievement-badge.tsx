"use client";

import {
  Utensils,
  Flame,
  Trophy,
  Dumbbell,
  Medal,
  Droplets,
  Scale,
  Star,
  type LucideIcon,
} from "lucide-react";
import type { Achievement } from "@/domain/entities/gamification";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  utensils: Utensils,
  flame: Flame,
  trophy: Trophy,
  dumbbell: Dumbbell,
  medal: Medal,
  droplets: Droplets,
  scale: Scale,
  star: Star,
};

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  highlight?: boolean;
}

export function AchievementBadge({
  achievement,
  unlocked,
  highlight = false,
}: AchievementBadgeProps) {
  const Icon = ICON_MAP[achievement.icon] ?? Medal;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
        unlocked
          ? "border-primary/30 bg-primary/5"
          : "border-muted bg-muted/30 opacity-60",
        highlight && unlocked && "animate-pulse ring-2 ring-primary ring-offset-2",
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full",
          unlocked ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-semibold">{achievement.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {achievement.description}
        </p>
      </div>
      <span className="text-[10px] font-medium text-muted-foreground">
        +{achievement.xpReward} XP
      </span>
    </div>
  );
}
