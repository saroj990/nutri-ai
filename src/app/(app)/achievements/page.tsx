"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shared/app-shell";
import { XpBar } from "@/features/gamification/xp-bar";
import { AchievementGrid } from "@/features/gamification/achievement-grid";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGamificationStore } from "@/stores/use-gamification-store";
import { FileText } from "lucide-react";

export default function AchievementsPage() {
  const state = useGamificationStore((s) => s.state);
  const achievements = useGamificationStore((s) => s.achievements);
  const highlightId = useGamificationStore((s) => s.highlightId);
  const load = useGamificationStore((s) => s.load);

  useEffect(() => {
    void load();
  }, [load]);

  if (!state) {
    return (
      <AppShell title="Achievements" description="XP, levels, and badges">
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Achievements" description="XP, levels, and badges" wide>
      <div className="space-y-6">
        <XpBar state={state} />

        <Card>
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Progress reports</p>
              <p className="text-sm text-muted-foreground">
                View daily, weekly, and monthly summaries
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/reports">
                <FileText className="h-4 w-4" />
                View reports
              </Link>
            </Button>
          </CardContent>
        </Card>

        <AchievementGrid
          achievements={achievements}
          unlockedIds={state.unlockedAchievements}
          highlightId={highlightId}
        />
      </div>
    </AppShell>
  );
}
