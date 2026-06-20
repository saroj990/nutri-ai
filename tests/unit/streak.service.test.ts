import { describe, it, expect } from "vitest";
import { StreakService } from "@/domain/services/streak.service";
import type { GamificationState } from "@/domain/entities/gamification";
import type { DateString } from "@/domain/value-objects/date";

const baseState: GamificationState = {
  totalXP: 0,
  level: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastLoggedDate: null,
  unlockedAchievements: [],
  stats: {
    totalMealsLogged: 0,
    totalCaloriesLogged: 0,
    totalWeightEntries: 0,
    proteinGoalHitCount: 0,
    waterGoalHitCount: 0,
    daysLogged: 0,
  },
  updatedAt: new Date().toISOString(),
};

describe("StreakService", () => {
  it("starts streak at 1 on first log", () => {
    const result = StreakService.updateStreak(
      baseState,
      "2026-06-19" as DateString,
    );
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
    expect(result.lastLoggedDate).toBe("2026-06-19");
  });

  it("increments streak on consecutive days", () => {
    const state: GamificationState = {
      ...baseState,
      currentStreak: 3,
      longestStreak: 5,
      lastLoggedDate: "2026-06-18" as DateString,
    };
    const result = StreakService.updateStreak(
      state,
      "2026-06-19" as DateString,
    );
    expect(result.currentStreak).toBe(4);
    expect(result.longestStreak).toBe(5);
  });

  it("resets streak when gap exists", () => {
    const state: GamificationState = {
      ...baseState,
      currentStreak: 10,
      longestStreak: 10,
      lastLoggedDate: "2026-06-15" as DateString,
    };
    const result = StreakService.updateStreak(
      state,
      "2026-06-19" as DateString,
    );
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(10);
  });

  it("does not change streak for same day", () => {
    const state: GamificationState = {
      ...baseState,
      currentStreak: 5,
      lastLoggedDate: "2026-06-19" as DateString,
    };
    const result = StreakService.updateStreak(
      state,
      "2026-06-19" as DateString,
    );
    expect(result).toBe(state);
  });
});
