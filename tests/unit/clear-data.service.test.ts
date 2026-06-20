import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { IndexedDBDailyLogRepository } from "@/repositories/indexeddb/daily-log.repository";
import { IndexedDBSettingsRepository } from "@/repositories/indexeddb/settings.repository";
import { IndexedDBLocalAuthRepository } from "@/repositories/indexeddb/local-auth.repository";
import { createLocalAuthService } from "@/services/local-auth.service";
import { clearAllAppData } from "@/services/clear-data.service";
import { createDailyLogId } from "@/domain/value-objects/ids";
import { writeAuthSession } from "@/lib/auth-session";
import { getDatabase, resetDatabaseForTesting } from "@/infrastructure/database/nutriai-db";

describe("clearAllAppData", () => {
  beforeEach(async () => {
    resetDatabaseForTesting();
    await getDatabase().open();

    const dailyLog = new IndexedDBDailyLogRepository();
    await dailyLog.save({
      id: createDailyLogId(),
      date: "2026-06-19",
      caloriesConsumed: 500,
      proteinConsumed: 40,
      carbsConsumed: 50,
      fatConsumed: 15,
      waterConsumed: 1000,
      mealCount: 1,
      updatedAt: new Date().toISOString(),
    });

    const auth = createLocalAuthService(new IndexedDBLocalAuthRepository());
    await auth.register("user@example.com", "password123");
    writeAuthSession({ email: "user@example.com", issuedAt: new Date().toISOString() });
  });

  afterEach(async () => {
    await getDatabase().delete();
  });

  it("wipes all tables and session", async () => {
    const db = getDatabase();
    expect(await db.dailyLogs.count()).toBeGreaterThan(0);
    expect(await db.localAuth.count()).toBe(1);

    await clearAllAppData();

    const freshDb = getDatabase();
    expect(await freshDb.dailyLogs.count()).toBe(0);
    expect(await freshDb.localAuth.count()).toBe(0);

    const settings = await new IndexedDBSettingsRepository().get();
    expect(settings.hasCompletedOnboarding).toBe(false);
  });
});
