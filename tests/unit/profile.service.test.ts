import { describe, it, expect } from "vitest";
import {
  buildProfileFromOnboarding,
  applyTargetsToProfile,
  getProfileTargets,
} from "@/services/profile.service";
import type { OnboardingFormData } from "@/domain/schemas/profile.schema";
import { DEFAULT_USER_PROFILE_ID } from "@/lib/constants";
import { onboardingSchema } from "@/domain/schemas/profile.schema";

const onboardingData: OnboardingFormData = {
  name: "Alex",
  gender: "male",
  age: 30,
  height: 180,
  weight: 80,
  targetWeight: 75,
  activityLevel: "moderate",
  goalType: "weight_loss",
  calorieAdjustment: 500,
};

describe("profile.service", () => {
  it("builds profile from onboarding data", () => {
    const profile = buildProfileFromOnboarding(onboardingData);
    expect(profile.id).toBe(DEFAULT_USER_PROFILE_ID);
    expect(profile.name).toBe("Alex");
    expect(profile.useCustomTargets).toBe(false);
    expect(profile.dailyCalories).toBeGreaterThan(0);
    expect(profile.dailyProtein).toBeGreaterThan(0);
  });

  it("applies custom targets when enabled", () => {
    const profile = buildProfileFromOnboarding(onboardingData);
    const updated = applyTargetsToProfile(profile, true, {
      dailyCalories: 2200,
      dailyProtein: 180,
      dailyCarbs: 220,
      dailyFat: 70,
      dailyWater: 3000,
    });
    expect(updated.useCustomTargets).toBe(true);
    expect(updated.dailyCalories).toBe(2200);
    expect(updated.dailyProtein).toBe(180);
  });

  it("recalculates targets when custom is disabled", () => {
    const profile = buildProfileFromOnboarding({
      ...onboardingData,
      goalType: "maintenance",
    });
    const custom = applyTargetsToProfile(profile, true, {
      dailyCalories: 9999,
      dailyProtein: 999,
      dailyCarbs: 999,
      dailyFat: 999,
      dailyWater: 3000,
    });
    const recalculated = applyTargetsToProfile(custom, false);
    expect(recalculated.useCustomTargets).toBe(false);
    expect(recalculated.dailyCalories).not.toBe(9999);
  });

  it("returns null targets for null profile", () => {
    expect(getProfileTargets(null)).toBeNull();
  });
});

describe("onboardingSchema", () => {
  it("validates complete onboarding data", () => {
    const result = onboardingSchema.safeParse(onboardingData);
    expect(result.success).toBe(true);
  });

  it("rejects invalid age", () => {
    const result = onboardingSchema.safeParse({ ...onboardingData, age: 5 });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = onboardingSchema.safeParse({ ...onboardingData, name: "" });
    expect(result.success).toBe(false);
  });
});
