"use client";

import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { xpProgressInLevel } from "@/domain/entities/gamification";
import type { GamificationState } from "@/domain/entities/gamification";

interface XpBarProps {
  state: GamificationState;
  showLink?: boolean;
}

export function XpBar({ state, showLink = false }: XpBarProps) {
  const { level, current, needed, percent } = xpProgressInLevel(state.totalXP);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Level {level}
        </CardTitle>
        {showLink && (
          <Link
            href="/achievements"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Achievements
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {current} / {needed} XP to next level
          </span>
          <span className="font-medium">{state.totalXP} XP total</span>
        </div>
        <Progress value={percent} aria-label="XP progress to next level" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{state.unlockedAchievements.length} achievements</span>
          <span>{state.currentStreak} day streak</span>
        </div>
      </CardContent>
    </Card>
  );
}
