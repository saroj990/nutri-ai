"use client";

import type { Achievement } from "@/domain/entities/gamification";
import { AchievementBadge } from "@/features/gamification/achievement-badge";

interface AchievementGridProps {
  achievements: Achievement[];
  unlockedIds: string[];
  highlightId?: string | null;
}

export function AchievementGrid({
  achievements,
  unlockedIds,
  highlightId,
}: AchievementGridProps) {
  const unlocked = achievements.filter((a) => unlockedIds.includes(a.id));
  const locked = achievements.filter((a) => !unlockedIds.includes(a.id));

  return (
    <div className="space-y-6">
      {unlocked.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            Unlocked ({unlocked.length})
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {unlocked.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                unlocked
                highlight={achievement.id === highlightId}
              />
            ))}
          </div>
        </section>
      )}

      {locked.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            Locked ({locked.length})
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {locked.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                unlocked={false}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
