import { describe, it, expect } from "vitest";
import { GoalCalculationService } from "@/domain/services/goal-calculation.service";
import type { UserProfile } from "@/domain/entities/user-profile";
import { createUserProfileId } from "@/domain/value-objects/ids";

const baseProfile: UserProfile = {
  id: createUserProfileId(),
  name: "Test User",
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

describe("GoalCalculationService", () => {
  it("calculates BMR for male using Mifflin-St Jeor", () => {
    const bmr = GoalCalculationService.calculateBMR(baseProfile);
    expect(bmr).toBe(10 * 80 + 6.25 * 180 - 5 * 30 + 5);
    expect(bmr).toBe(1780);
  });

  it("calculates BMR for female", () => {
    const bmr = GoalCalculationService.calculateBMR({
      ...baseProfile,
      gender: "female",
    });
    expect(bmr).toBe(10 * 80 + 6.25 * 180 - 5 * 30 - 161);
    expect(bmr).toBe(1614);
  });

  it("calculates TDEE with activity multiplier", () => {
    const bmr = GoalCalculationService.calculateBMR(baseProfile);
    const tdee = GoalCalculationService.calculateTDEE(bmr, "moderate");
    expect(tdee).toBe(Math.round(1780 * 1.55));
    expect(tdee).toBe(2759);
  });

  it("applies calorie deficit for weight loss", () => {
    const targets = GoalCalculationService.calculateTargets(baseProfile);
    const bmr = GoalCalculationService.calculateBMR(baseProfile);
    const tdee = GoalCalculationService.calculateTDEE(bmr, "moderate");
    expect(targets.dailyCalories).toBe(tdee - 500);
    expect(targets.dailyProtein).toBeGreaterThan(0);
    expect(targets.dailyCarbs).toBeGreaterThan(0);
    expect(targets.dailyFat).toBeGreaterThan(0);
  });

  it("applies calorie surplus for weight gain", () => {
    const targets = GoalCalculationService.calculateTargets({
      ...baseProfile,
      goalType: "weight_gain",
      calorieAdjustment: 300,
    });
    const bmr = GoalCalculationService.calculateBMR(baseProfile);
    const tdee = GoalCalculationService.calculateTDEE(bmr, "moderate");
    expect(targets.dailyCalories).toBe(tdee + 300);
  });

  it("uses custom targets when enabled", () => {
    const targets = GoalCalculationService.calculateTargets({
      ...baseProfile,
      useCustomTargets: true,
      dailyCalories: 2200,
      dailyProtein: 180,
      dailyCarbs: 220,
      dailyFat: 70,
    });
    expect(targets.dailyCalories).toBe(2200);
    expect(targets.dailyProtein).toBe(180);
    expect(targets.dailyCarbs).toBe(220);
    expect(targets.dailyFat).toBe(70);
  });
});
