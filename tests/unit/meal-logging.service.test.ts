import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Dexie from "dexie";
import { IndexedDBFoodRepository } from "@/repositories/indexeddb/food.repository";
import { IndexedDBMealRepository } from "@/repositories/indexeddb/meal.repository";
import { IndexedDBDailyLogRepository } from "@/repositories/indexeddb/daily-log.repository";
import { IndexedDBGamificationRepository } from "@/repositories/indexeddb/gamification.repository";
import { IndexedDBUserProfileRepository } from "@/repositories/indexeddb/user-profile.repository";
import { IndexedDBWeightRepository } from "@/repositories/indexeddb/weight.repository";
import { IndexedDBSettingsRepository } from "@/repositories/indexeddb/settings.repository";
import { createMealLoggingService } from "@/services/meal-logging.service";
import { createFoodId, createUserProfileId } from "@/domain/value-objects/ids";
import { getDatabase, resetDatabaseForTesting } from "@/infrastructure/database/nutriai-db";
import type { Food } from "@/domain/entities/food";
import type { RepositoryContainer } from "@/infrastructure/di/container";
import type { DateString } from "@/domain/value-objects/date";
import { DEFAULT_USER_PROFILE_ID } from "@/lib/constants";

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

describe("MealLoggingService", () => {
  let repos: RepositoryContainer;
  let food: Food;

  beforeEach(async () => {
    resetDatabaseForTesting();
    await getDatabase().open();
    repos = makeContainer();

    food = {
      id: createFoodId(),
      name: "Chicken Breast",
      servingSize: 100,
      servingUnit: "g",
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      isFavorite: false,
      tags: ["protein"],
      isCustom: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await repos.food.save(food);

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
    await Dexie.delete("NutriAIDB");
    resetDatabaseForTesting();
  });

  it("logs a meal and updates daily log", async () => {
    const service = createMealLoggingService(repos);
    const meal = await service.logMeal({
      mealType: "lunch",
      date: TODAY,
      foods: [{ foodId: food.id, servings: 1 }],
    });

    expect(meal.totalCalories).toBe(165);
    expect(meal.totalProtein).toBe(31);

    const dailyLog = await repos.dailyLog.getByDate(TODAY);
    expect(dailyLog?.caloriesConsumed).toBe(165);
    expect(dailyLog?.mealCount).toBe(1);
  });

  it("deletes a meal and recomputes daily log", async () => {
    const service = createMealLoggingService(repos);
    const meal = await service.logMeal({
      mealType: "breakfast",
      date: TODAY,
      foods: [{ foodId: food.id, servings: 2 }],
    });

    await service.deleteMeal(meal.id);

    const dailyLog = await repos.dailyLog.getByDate(TODAY);
    expect(dailyLog?.caloriesConsumed).toBe(0);
    expect(dailyLog?.mealCount).toBe(0);
  });

  it("awards gamification XP on meal log", async () => {
    const service = createMealLoggingService(repos);
    await service.logMeal({
      mealType: "dinner",
      date: TODAY,
      foods: [{ foodId: food.id, servings: 1 }],
    });

    const state = await repos.gamification.getState();
    expect(state.stats.totalMealsLogged).toBe(1);
    expect(state.totalXP).toBeGreaterThan(0);
    expect(state.currentStreak).toBe(1);
  });

  it("duplicates a meal to the same day", async () => {
    const service = createMealLoggingService(repos);
    const original = await service.logMeal({
      mealType: "snack",
      date: TODAY,
      foods: [{ foodId: food.id, servings: 1 }],
    });

    const copy = await service.duplicateMeal(original.id, TODAY);
    expect(copy.id).not.toBe(original.id);
    expect(copy.totalCalories).toBe(original.totalCalories);

    const meals = await repos.meal.getByDate(TODAY);
    expect(meals).toHaveLength(2);
  });
});
