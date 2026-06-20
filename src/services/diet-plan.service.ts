import type { MealType } from "@/domain/entities/meal";
import { MEAL_TYPE_LABELS } from "@/domain/entities/meal";
import type { GoalType, UserProfile } from "@/domain/entities/user-profile";
import type { GoalTargets } from "@/domain/value-objects/goals";
import { GoalCalculationService } from "@/domain/services/goal-calculation.service";
import { GOAL_OPTIONS } from "@/features/profile/constants";

export interface MealPlanSlot {
  mealType: MealType;
  label: string;
  share: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DietPlan {
  goalType: GoalType;
  goalLabel: string;
  summary: string;
  targets: GoalTargets;
  bmr: number;
  tdee: number;
  meals: MealPlanSlot[];
}

const MEAL_SPLITS: { mealType: MealType; share: number }[] = [
  { mealType: "breakfast", share: 0.25 },
  { mealType: "lunch", share: 0.35 },
  { mealType: "dinner", share: 0.3 },
  { mealType: "snack", share: 0.1 },
];

const PLAN_SUMMARIES: Record<GoalType, string> = {
  weight_loss:
    "High-protein, moderate carbs plan to preserve muscle while you cut fat.",
  maintenance:
    "Balanced macros to fuel training and keep you lean and energized.",
  weight_gain:
    "Higher carbs and calories to support muscle growth and recovery.",
};

export function buildDietPlan(profile: UserProfile): DietPlan {
  const targets = GoalCalculationService.calculateTargets(profile);
  const bmr = GoalCalculationService.calculateBMR(profile);
  const tdee = GoalCalculationService.calculateTDEE(bmr, profile.activityLevel);
  const goalLabel =
    GOAL_OPTIONS.find((g) => g.value === profile.goalType)?.label ?? profile.goalType;

  const meals = MEAL_SPLITS.map(({ mealType, share }, index) => {
    const isLast = index === MEAL_SPLITS.length - 1;
    const priorCalories = MEAL_SPLITS.slice(0, index).reduce(
      (sum, slot) => sum + Math.round(targets.dailyCalories * slot.share),
      0,
    );
    const priorProtein = MEAL_SPLITS.slice(0, index).reduce(
      (sum, slot) => sum + Math.round(targets.dailyProtein * slot.share),
      0,
    );
    const priorCarbs = MEAL_SPLITS.slice(0, index).reduce(
      (sum, slot) => sum + Math.round(targets.dailyCarbs * slot.share),
      0,
    );
    const priorFat = MEAL_SPLITS.slice(0, index).reduce(
      (sum, slot) => sum + Math.round(targets.dailyFat * slot.share),
      0,
    );

    return {
      mealType,
      label: MEAL_TYPE_LABELS[mealType],
      share,
      calories: isLast
        ? targets.dailyCalories - priorCalories
        : Math.round(targets.dailyCalories * share),
      protein: isLast
        ? targets.dailyProtein - priorProtein
        : Math.round(targets.dailyProtein * share),
      carbs: isLast
        ? targets.dailyCarbs - priorCarbs
        : Math.round(targets.dailyCarbs * share),
      fat: isLast ? targets.dailyFat - priorFat : Math.round(targets.dailyFat * share),
    };
  });

  return {
    goalType: profile.goalType,
    goalLabel,
    summary: PLAN_SUMMARIES[profile.goalType],
    targets,
    bmr,
    tdee,
    meals,
  };
}

export function suggestTargetWeight(
  currentWeight: number,
  goalType: GoalType,
): number {
  switch (goalType) {
    case "weight_loss":
      return Math.round((currentWeight - 5) * 10) / 10;
    case "weight_gain":
      return Math.round((currentWeight + 5) * 10) / 10;
    case "maintenance":
      return currentWeight;
  }
}
