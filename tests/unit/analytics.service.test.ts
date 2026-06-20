import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { IndexedDBDailyLogRepository } from "@/repositories/indexeddb/daily-log.repository";
import { IndexedDBWeightRepository } from "@/repositories/indexeddb/weight.repository";
import { IndexedDBGamificationRepository } from "@/repositories/indexeddb/gamification.repository";
import { IndexedDBUserProfileRepository } from "@/repositories/indexeddb/user-profile.repository";
import { IndexedDBSettingsRepository } from "@/repositories/indexeddb/settings.repository";
import { createAnalyticsService } from "@/services/analytics.service";
import { createDailyLogId, createWeightEntryId } from "@/domain/value-objects/ids";
import { subtractDays, toDateString } from "@/domain/value-objects/date";
import { getDatabase, resetDatabaseForTesting } from "@/infrastructure/database/nutriai-db";
import type { RepositoryContainer } from "@/infrastructure/di/container";

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

describe("AnalyticsService", () => {
  let repos: RepositoryContainer;

  beforeEach(async () => {
    resetDatabaseForTesting();
    await getDatabase().open();
    repos = makeContainer();

    const today = toDateString();
    const dates = [subtractDays(today, 2), subtractDays(today, 1), today];

    for (const [i, date] of dates.entries()) {
      await repos.dailyLog.save({
        id: createDailyLogId(),
        date,
        caloriesConsumed: 1800 + i * 100,
        proteinConsumed: 120 + i * 10,
        carbsConsumed: 200,
        fatConsumed: 60,
        waterConsumed: 2000,
        mealCount: 3,
        updatedAt: new Date().toISOString(),
      });
    }

    await repos.weight.save({
      id: createWeightEntryId(),
      date: subtractDays(today, 2),
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

  it("returns weekly nutrition summary", async () => {
    const service = createAnalyticsService(repos);
    const summary = await service.getSummary("week");

    expect(summary.period).toBe("week");
    expect(summary.nutrition).toHaveLength(7);
    expect(summary.nutrition.find((n) => n.date === toDateString())?.calories).toBe(
      2000,
    );
    expect(summary.weight).toHaveLength(2);
    expect(summary.averages.calories).toBeGreaterThan(0);
    expect(summary.averages.weightChange).toBe(-0.5);
  });

  it("aggregates quarterly data by week", async () => {
    const service = createAnalyticsService(repos);
    const summary = await service.getSummary("quarter");

    expect(summary.nutrition.length).toBeGreaterThan(0);
    expect(summary.nutrition[0]).toHaveProperty("calories");
  });
});
