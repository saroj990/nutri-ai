import type { UserProfile } from "@/domain/entities/user-profile";
import type { GoalTargets } from "@/domain/value-objects/goals";
import { GoalCalculationService } from "@/domain/services/goal-calculation.service";
import type { OnboardingFormData } from "@/domain/schemas/profile.schema";
import { DEFAULT_USER_PROFILE_ID } from "@/lib/constants";
import { DEFAULT_DAILY_WATER_ML } from "@/domain/value-objects/goals";

export function buildProfileFromOnboarding(
  data: OnboardingFormData,
  existing?: UserProfile | null,
): UserProfile {
  const now = new Date().toISOString();
  const base: UserProfile = {
    id: DEFAULT_USER_PROFILE_ID,
    name: data.name,
    gender: data.gender,
    age: data.age,
    height: data.height,
    weight: data.weight,
    targetWeight: data.targetWeight,
    activityLevel: data.activityLevel,
    goalType: data.goalType,
    calorieAdjustment: data.calorieAdjustment,
    useCustomTargets: false,
    dailyCalories: 0,
    dailyProtein: 0,
    dailyCarbs: 0,
    dailyFat: 0,
    dailyWater: DEFAULT_DAILY_WATER_ML,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const targets = GoalCalculationService.calculateTargets(base);
  return {
    ...base,
    dailyCalories: targets.dailyCalories,
    dailyProtein: targets.dailyProtein,
    dailyCarbs: targets.dailyCarbs,
    dailyFat: targets.dailyFat,
    dailyWater: targets.dailyWater,
  };
}

export function applyTargetsToProfile(
  profile: UserProfile,
  useCustomTargets: boolean,
  custom?: Partial<GoalTargets>,
): UserProfile {
  const updated: UserProfile = {
    ...profile,
    useCustomTargets,
    updatedAt: new Date().toISOString(),
  };

  if (useCustomTargets && custom) {
    return {
      ...updated,
      dailyCalories: custom.dailyCalories ?? profile.dailyCalories,
      dailyProtein: custom.dailyProtein ?? profile.dailyProtein,
      dailyCarbs: custom.dailyCarbs ?? profile.dailyCarbs,
      dailyFat: custom.dailyFat ?? profile.dailyFat,
      dailyWater: custom.dailyWater ?? profile.dailyWater,
    };
  }

  const targets = GoalCalculationService.calculateTargets(updated);
  return {
    ...updated,
    dailyCalories: targets.dailyCalories,
    dailyProtein: targets.dailyProtein,
    dailyCarbs: targets.dailyCarbs,
    dailyFat: targets.dailyFat,
    dailyWater: targets.dailyWater,
  };
}

export function getProfileTargets(profile: UserProfile | null): GoalTargets | null {
  if (!profile) return null;
  return GoalCalculationService.calculateTargets(profile);
}
