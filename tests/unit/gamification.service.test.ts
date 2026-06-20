import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { IndexedDBFoodRepository } from "@/repositories/indexeddb/food.repository";
import { IndexedDBMealRepository } from "@/repositories/indexeddb/meal.repository";
import { IndexedDBDailyLogRepository } from "@/repositories/indexeddb/daily-log.repository";
import { IndexedDBWeightRepository } from "@/repositories/indexeddb/weight.repository";
import { IndexedDBGamificationRepository } from "@/repositories/indexeddb/gamification.repository";
import { IndexedDBUserProfileRepository } from "@/repositories/indexeddb/user-profile.repository";
import { IndexedDBSettingsRepository } from "@/repositories/indexeddb/settings.repository";
import { GamificationService } from "@/services/gamification.service";
import { createAchievementId, createDailyLogId, createMealId } from "@/domain/value-objects/ids";
import { getDatabase, resetDatabaseForTesting } from "@/infrastructure/database/nutriai-db";
import type { RepositoryContainer } from "@/infrastructure/di/container";
import type { DateString } from "@/domain/value-objects/date";
import { DEFAULT_USER_PROFILE_ID } from "@/lib/constants";
import type { Meal } from "@/domain/entities/meal";
import type { DailyLog } from "@/domain/entities/daily-log";
import {
  calculateLevel,
  xpProgressInLevel,
} from "@/domain/entities/gamification";

const TODAY = "2026-06-19" as DateString;

function makeContainer(): RepositoryContainer {
  return {
    food: new IndexedDBFoodRepository(),
    meal: new IndexedDBMealRepository(),
    dailyLog: new IndexedDBDailyLogRepository(),
    weight: new IndexedDBWeightRepository(),
    userProfile: new IndexedDBUserProfileRepository(),
    gamification: new IndexedDBGamificationRepository(),
    settings: new IndexedDBSettingsRepository(),
    localAuth: {} as RepositoryContainer["localAuth"],
  };
}

describe("GamificationService", () => {
  let repos: RepositoryContainer;
  let service: GamificationService;

  beforeEach(async () => {
    resetDatabaseForTesting();
    await getDatabase().open();
    repos = makeContainer();
    service = new GamificationService(repos);

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
  });

  afterEach(async () => {
    await getDatabase().delete();
  });

  it("unlocks First Bite on first meal", async () => {
    const meal: Meal = {
      id: createMealId(),
      date: TODAY,
      mealType: "lunch",
      foods: [],
      totalCalories: 500,
      totalProtein: 40,
      totalCarbs: 50,
      totalFat: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const dailyLog: DailyLog = {
      id: createDailyLogId(),
      date: TODAY,
      caloriesConsumed: 500,
      proteinConsumed: 40,
      carbsConsumed: 50,
      fatConsumed: 15,
      waterConsumed: 0,
      mealCount: 1,
      updatedAt: new Date().toISOString(),
    };

    const state = await service.onMealLogged(meal, dailyLog);

    expect(state.stats.totalMealsLogged).toBe(1);
    expect(state.unlockedAchievements).toContain(
      createAchievementId("first_meal"),
    );
    expect(state.totalXP).toBeGreaterThan(10);
  });
});

describe("xpProgressInLevel", () => {
  it("calculates progress within current level", () => {
    expect(calculateLevel(0)).toBe(0);
    const progress = xpProgressInLevel(250);
    expect(progress.level).toBe(1);
    expect(progress.current).toBe(150);
    expect(progress.needed).toBe(300);
    expect(progress.percent).toBeCloseTo(50);
  });
});
