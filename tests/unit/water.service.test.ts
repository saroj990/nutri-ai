import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { IndexedDBDailyLogRepository } from "@/repositories/indexeddb/daily-log.repository";
import { IndexedDBGamificationRepository } from "@/repositories/indexeddb/gamification.repository";
import { IndexedDBUserProfileRepository } from "@/repositories/indexeddb/user-profile.repository";
import { IndexedDBWeightRepository } from "@/repositories/indexeddb/weight.repository";
import { IndexedDBSettingsRepository } from "@/repositories/indexeddb/settings.repository";
import { createWaterService } from "@/services/water.service";
import { getDatabase, resetDatabaseForTesting } from "@/infrastructure/database/nutriai-db";
import type { RepositoryContainer } from "@/infrastructure/di/container";
import { toDateString } from "@/domain/value-objects/date";
import { DEFAULT_USER_PROFILE_ID } from "@/lib/constants";

const TODAY = toDateString();

function makeContainer(): RepositoryContainer {
  return {
    food: {} as RepositoryContainer["food"],
    meal: {} as RepositoryContainer["meal"],
    dailyLog: new IndexedDBDailyLogRepository(),
    weight: new IndexedDBWeightRepository(),
    userProfile: new IndexedDBUserProfileRepository(),
    gamification: new IndexedDBGamificationRepository(),
    settings: new IndexedDBSettingsRepository(),
    localAuth: {} as RepositoryContainer["localAuth"],
  };
}

describe("WaterService", () => {
  let repos: RepositoryContainer;

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
  });

  afterEach(async () => {
    await getDatabase().delete();
  });

  it("adds water to daily log", async () => {
    const service = createWaterService(repos);
    const log = await service.addWater(250, TODAY);

    expect(log.waterConsumed).toBe(250);
    expect(await service.getTodayWater()).toBe(250);
  });

  it("accumulates water across multiple adds", async () => {
    const service = createWaterService(repos);
    await service.addWater(250, TODAY);
    const log = await service.addWater(500, TODAY);

    expect(log.waterConsumed).toBe(750);
  });

  it("returns water goal from profile", async () => {
    const service = createWaterService(repos);
    const goal = await service.getWaterGoal();

    expect(goal).toBe(2500);
  });
});
