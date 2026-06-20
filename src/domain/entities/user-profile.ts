import type { UserProfileId } from "../value-objects/ids";

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type GoalType = "weight_loss" | "weight_gain" | "maintenance";

export interface UserProfile {
  id: UserProfileId;
  name: string;
  gender: Gender;
  age: number;
  height: number;
  weight: number;
  targetWeight: number;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  dailyWater: number;
  calorieAdjustment: number;
  useCustomTargets: boolean;
  createdAt: string;
  updatedAt: string;
}
