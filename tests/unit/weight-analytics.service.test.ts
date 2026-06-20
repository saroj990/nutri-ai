import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { IndexedDBWeightRepository } from "@/repositories/indexeddb/weight.repository";
import { createWeightAnalyticsService } from "@/services/weight-analytics.service";
import { getDatabase, resetDatabaseForTesting } from "@/infrastructure/database/nutriai-db";
import type { RepositoryContainer } from "@/infrastructure/di/container";
import { subtractDays, toDateString } from "@/domain/value-objects/date";
import { createWeightEntryId } from "@/domain/value-objects/ids";

function makeContainer(): RepositoryContainer {
  return {
    food: {} as RepositoryContainer["food"],
    meal: {} as RepositoryContainer["meal"],
    dailyLog: {} as RepositoryContainer["dailyLog"],
    weight: new IndexedDBWeightRepository(),
    userProfile: {} as RepositoryContainer["userProfile"],
    gamification: {} as RepositoryContainer["gamification"],
    settings: {} as RepositoryContainer["settings"],
    localAuth: {} as RepositoryContainer["localAuth"],
  };
}

describe("WeightAnalyticsService", () => {
  let repos: RepositoryContainer;

  beforeEach(async () => {
    resetDatabaseForTesting();
    await getDatabase().open();
    repos = makeContainer();
  });

  afterEach(async () => {
    await getDatabase().delete();
  });

  it("computes weight stats", async () => {
    const today = toDateString();
    await repos.weight.save({
      id: createWeightEntryId(),
      date: subtractDays(today, 4),
      weight: 81,
      createdAt: new Date().toISOString(),
    });
    await repos.weight.save({
      id: createWeightEntryId(),
      date: today,
      weight: 79,
      createdAt: new Date().toISOString(),
    });

    const service = createWeightAnalyticsService(repos);
    const stats = await service.getStats();

    expect(stats.latest?.weight).toBe(79);
    expect(stats.entries).toHaveLength(2);
    expect(stats.change7d).toBe(-2);
  });

  it("upserts weight entry by date", async () => {
    const service = createWeightAnalyticsService(repos);
    const today = toDateString();

    await service.saveEntry({
      date: today,
      weight: 80,
    });
    const updated = await service.saveEntry({
      date: today,
      weight: 79.5,
    });

    const all = await repos.weight.getAll();
    expect(all).toHaveLength(1);
    expect(updated.weight).toBe(79.5);
  });
});
