import { describe, it, expect } from "vitest";
import {
  buildDietPlan,
  suggestTargetWeight,
} from "@/services/diet-plan.service";
import type { UserProfile } from "@/domain/entities/user-profile";
import { createUserProfileId } from "@/domain/value-objects/ids";

const baseProfile: UserProfile = {
  id: createUserProfileId(),
  name: "Test",
  gender: "male",
  age: 30,
  height: 180,
  weight: 80,
  targetWeight: 75,
  activityLevel: "moderate",
  goalType: "weight_loss",
  dailyCalories: 0,
  dailyProtein: 0,
  dailyCarbs: 0,
  dailyFat: 0,
  dailyWater: 2500,
  calorieAdjustment: 500,
  useCustomTargets: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("buildDietPlan", () => {
  it("creates meal breakdown that sums to daily targets", () => {
    const plan = buildDietPlan(baseProfile);

    expect(plan.goalLabel).toBe("Lose Weight");
    expect(plan.meals).toHaveLength(4);

    const totalCalories = plan.meals.reduce((s, m) => s + m.calories, 0);
    expect(totalCalories).toBe(plan.targets.dailyCalories);
  });

  it("uses higher carbs for bulk goal", () => {
    const cut = buildDietPlan(baseProfile);
    const bulk = buildDietPlan({ ...baseProfile, goalType: "weight_gain" });

    expect(bulk.targets.dailyCarbs).toBeGreaterThan(cut.targets.dailyCarbs);
  });
});

describe("suggestTargetWeight", () => {
  it("suggests lower weight for cut", () => {
    expect(suggestTargetWeight(80, "weight_loss")).toBe(75);
  });

  it("suggests higher weight for bulk", () => {
    expect(suggestTargetWeight(80, "weight_gain")).toBe(85);
  });

  it("keeps weight for maintenance", () => {
    expect(suggestTargetWeight(80, "maintenance")).toBe(80);
  });
});
