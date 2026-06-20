import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { IndexedDBDailyLogRepository } from "@/repositories/indexeddb/daily-log.repository";
import { IndexedDBWeightRepository } from "@/repositories/indexeddb/weight.repository";
import { IndexedDBGamificationRepository } from "@/repositories/indexeddb/gamification.repository";
import { IndexedDBUserProfileRepository } from "@/repositories/indexeddb/user-profile.repository";
import { IndexedDBSettingsRepository } from "@/repositories/indexeddb/settings.repository";
import { IndexedDBMealRepository } from "@/repositories/indexeddb/meal.repository";
import { createReportService } from "@/services/report.service";
import { GoalCalculationService } from "@/domain/services/goal-calculation.service";
import { createDailyLogId, createWeightEntryId } from "@/domain/value-objects/ids";
import { subtractDays, toDateString } from "@/domain/value-objects/date";
import { getDatabase, resetDatabaseForTesting } from "@/infrastructure/database/nutriai-db";
import type { RepositoryContainer } from "@/infrastructure/di/container";
import { DEFAULT_USER_PROFILE_ID } from "@/lib/constants";

function makeContainer(): RepositoryContainer {
  return {
    food: {} as RepositoryContainer["food"],
    meal: new IndexedDBMealRepository(),
    dailyLog: new IndexedDBDailyLogRepository(),
    weight: new IndexedDBWeightRepository(),
    userProfile: new IndexedDBUserProfileRepository(),
    gamification: new IndexedDBGamificationRepository(),
    settings: new IndexedDBSettingsRepository(),
    localAuth: {} as RepositoryContainer["localAuth"],
  };
}

describe("ReportService", () => {
  let repos: RepositoryContainer;
  let onTargetCalories: number;

  beforeEach(async () => {
    resetDatabaseForTesting();
    await getDatabase().open();
    repos = makeContainer();

    await repos.userProfile.save({
      id: DEFAULT_USER_PROFILE_ID,
      name: "Test",
      gender: "male",
      age: 30,
      height: 180,
      weight: 80,
      targetWeight: 75,
      activityLevel: "moderate",
      goalType: "weight_loss",
      dailyCalories: 2000,
      dailyProtein: 150,
      dailyCarbs: 200,
      dailyFat: 67,
      dailyWater: 2500,
      calorieAdjustment: 500,
      useCustomTargets: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const profile = await repos.userProfile.get();
    const targetCalories = profile
      ? GoalCalculationService.calculateTargets(profile).dailyCalories
      : 2000;
    const onTarget = Math.round(targetCalories);
    onTargetCalories = onTarget;

    const today = toDateString();
    const yesterday = subtractDays(today, 1);

    await repos.dailyLog.save({
      id: createDailyLogId(),
      date: yesterday,
      caloriesConsumed: onTarget,
      proteinConsumed: 150,
      carbsConsumed: 200,
      fatConsumed: 65,
      waterConsumed: 2500,
      mealCount: 3,
      updatedAt: new Date().toISOString(),
    });
    await repos.dailyLog.save({
      id: createDailyLogId(),
      date: today,
      caloriesConsumed: onTarget,
      proteinConsumed: 155,
      carbsConsumed: 210,
      fatConsumed: 68,
      waterConsumed: 2600,
      mealCount: 4,
      updatedAt: new Date().toISOString(),
    });

    await repos.weight.save({
      id: createWeightEntryId(),
      date: yesterday,
      weight: 80,
      createdAt: new Date().toISOString(),
    });
    await repos.weight.save({
      id: createWeightEntryId(),
      date: today,
      weight: 79.5,
      createdAt: new Date().toISOString(),
    });
  });

  afterEach(async () => {
    await getDatabase().delete();
  });

  it("generates weekly report with averages and weight change", async () => {
    const service = createReportService(repos);
    const report = await service.getReport("weekly");

    expect(report.period).toBe("weekly");
    expect(report.daysTracked).toBe(2);
    expect(report.mealsLogged).toBe(7);
    expect(report.avgCalories).toBe(onTargetCalories);
    expect(report.weightChange).toBe(-0.5);
    expect(report.goalCompletionRate).toBe(100);
  });

  it("includes daily summary for daily report", async () => {
    const service = createReportService(repos);
    const report = await service.getReport("daily");

    expect(report.period).toBe("daily");
    expect(report.daily?.consumed.calories).toBe(onTargetCalories);
    expect(report.daily?.mealCount).toBe(4);
  });
});
