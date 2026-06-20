import type { UserProfile, ActivityLevel } from "../entities/user-profile";
import type { GoalTargets } from "../value-objects/goals";
import { DEFAULT_DAILY_WATER_ML } from "../value-objects/goals";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export class GoalCalculationService {
  static calculateBMR(
    profile: Pick<UserProfile, "gender" | "age" | "weight" | "height">,
  ): number {
    const { gender, age, weight, height } = profile;
    if (gender === "male") {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    }
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }

  static calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
    return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
  }

  static calculateTargets(profile: UserProfile): GoalTargets {
    if (profile.useCustomTargets) {
      return {
        dailyCalories: profile.dailyCalories,
        dailyProtein: profile.dailyProtein,
        dailyCarbs: profile.dailyCarbs,
        dailyFat: profile.dailyFat,
        dailyWater: profile.dailyWater || DEFAULT_DAILY_WATER_ML,
      };
    }

    const bmr = this.calculateBMR(profile);
    const tdee = this.calculateTDEE(bmr, profile.activityLevel);
    let calories = tdee;

    switch (profile.goalType) {
      case "weight_loss":
        calories = tdee - (profile.calorieAdjustment || 500);
        break;
      case "weight_gain":
        calories = tdee + (profile.calorieAdjustment || 300);
        break;
      case "maintenance":
        calories = tdee;
        break;
    }

    const macroSplit = this.getMacroSplit(profile.goalType);

    return {
      dailyCalories: calories,
      dailyProtein: Math.round((calories * macroSplit.protein) / 4),
      dailyCarbs: Math.round((calories * macroSplit.carbs) / 4),
      dailyFat: Math.round((calories * macroSplit.fat) / 9),
      dailyWater: profile.dailyWater || DEFAULT_DAILY_WATER_ML,
    };
  }

  private static getMacroSplit(goalType: UserProfile["goalType"]): {
    protein: number;
    carbs: number;
    fat: number;
  } {
    switch (goalType) {
      case "weight_loss":
        return { protein: 0.35, carbs: 0.35, fat: 0.3 };
      case "weight_gain":
        return { protein: 0.3, carbs: 0.45, fat: 0.25 };
      case "maintenance":
      default:
        return { protein: 0.3, carbs: 0.4, fat: 0.3 };
    }
  }
}
