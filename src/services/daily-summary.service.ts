import type { Meal } from "@/domain/entities/meal";
import type { GoalTargets } from "@/domain/value-objects/goals";
import type { RepositoryContainer } from "@/infrastructure/di/container";
import { getProfileTargets } from "@/services/profile.service";

export interface DailySummary {
  date: string;
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
  };
  targets: GoalTargets | null;
  remaining: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
  };
  mealCount: number;
  meals: Meal[];
}

export async function buildDailySummary(
  repos: RepositoryContainer,
  date: string,
): Promise<DailySummary> {
  const [dailyLog, meals, profile] = await Promise.all([
    repos.dailyLog.getByDate(date),
    repos.meal.getByDate(date),
    repos.userProfile.get(),
  ]);

  const targets = profile ? getProfileTargets(profile) : null;
  const consumed = {
    calories: dailyLog?.caloriesConsumed ?? 0,
    protein: dailyLog?.proteinConsumed ?? 0,
    carbs: dailyLog?.carbsConsumed ?? 0,
    fat: dailyLog?.fatConsumed ?? 0,
    water: dailyLog?.waterConsumed ?? 0,
  };

  return {
    date,
    consumed,
    targets,
    remaining: {
      calories: Math.max(0, (targets?.dailyCalories ?? 0) - consumed.calories),
      protein: Math.max(0, (targets?.dailyProtein ?? 0) - consumed.protein),
      carbs: Math.max(0, (targets?.dailyCarbs ?? 0) - consumed.carbs),
      fat: Math.max(0, (targets?.dailyFat ?? 0) - consumed.fat),
      water: Math.max(0, (targets?.dailyWater ?? 0) - consumed.water),
    },
    mealCount: dailyLog?.mealCount ?? meals.length,
    meals: meals.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  };
}

export async function getDailySummary(
  repos: RepositoryContainer,
  date: string,
): Promise<DailySummary> {
  return buildDailySummary(repos, date);
}
