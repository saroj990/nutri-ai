import type { AchievementId } from "../value-objects/ids";
import type { DateString } from "../value-objects/date";

export interface GamificationStats {
  totalMealsLogged: number;
  totalCaloriesLogged: number;
  totalWeightEntries: number;
  proteinGoalHitCount: number;
  waterGoalHitCount: number;
  daysLogged: number;
}

export interface GamificationState {
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastLoggedDate: DateString | null;
  unlockedAchievements: AchievementId[];
  stats: GamificationStats;
  updatedAt: string;
}

export type AchievementCategory =
  | "logging"
  | "streak"
  | "nutrition"
  | "weight"
  | "milestone";

export type AchievementCondition =
  | { type: "meals_logged"; count: number }
  | { type: "streak"; days: number }
  | { type: "protein_goal_hit"; count: number }
  | { type: "water_goal_hit"; days: number }
  | { type: "weight_change"; kg: number }
  | { type: "level"; level: number }
  | { type: "first_meal" };

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  xpReward: number;
  condition: AchievementCondition;
}

export const XP_REWARDS = {
  LOG_MEAL: 10,
  HIT_CALORIE_GOAL: 25,
  HIT_PROTEIN_GOAL: 15,
  LOG_WATER: 5,
  LOG_WEIGHT: 10,
  DAILY_STREAK: 20,
} as const;

export function calculateLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 100));
}

export function xpForNextLevel(level: number): number {
  return (level + 1) ** 2 * 100;
}

export function xpForCurrentLevel(level: number): number {
  return level ** 2 * 100;
}

export function xpProgressInLevel(totalXP: number): {
  level: number;
  current: number;
  needed: number;
  percent: number;
} {
  const level = calculateLevel(totalXP);
  const currentLevelXp = xpForCurrentLevel(level);
  const nextLevelXp = xpForNextLevel(level);
  const current = totalXP - currentLevelXp;
  const needed = nextLevelXp - currentLevelXp;
  const percent = needed > 0 ? Math.min(100, (current / needed) * 100) : 100;

  return { level, current, needed, percent };
}
