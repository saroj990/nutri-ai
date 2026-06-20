import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Dexie from "dexie";
import { IndexedDBFoodRepository } from "@/repositories/indexeddb/food.repository";
import { IndexedDBSettingsRepository } from "@/repositories/indexeddb/settings.repository";
import { getDatabase, resetDatabaseForTesting } from "@/infrastructure/database/nutriai-db";
import { createFoodId } from "@/domain/value-objects/ids";
import type { Food } from "@/domain/entities/food";

describe("IndexedDB Repositories", () => {
  beforeEach(async () => {
    resetDatabaseForTesting();
    const db = getDatabase();
    await db.open();
  });

  afterEach(async () => {
    const db = getDatabase();
    await db.delete();
    await Dexie.delete("NutriAIDB");
    resetDatabaseForTesting();
  });

  it("saves and retrieves food", async () => {
    const repo = new IndexedDBFoodRepository();
    const food: Food = {
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
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await repo.save(food);
    const retrieved = await repo.getById(food.id);
    expect(retrieved?.name).toBe("Chicken Breast");
  });

  it("searches foods by name", async () => {
    const repo = new IndexedDBFoodRepository();
    await repo.bulkInsert([
      {
        id: createFoodId(),
        name: "Brown Rice",
        servingSize: 100,
        servingUnit: "g",
        calories: 112,
        protein: 2.6,
        carbs: 24,
        fat: 0.9,
        isFavorite: false,
        tags: ["carb"],
        isCustom: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: createFoodId(),
        name: "White Rice",
        servingSize: 100,
        servingUnit: "g",
        calories: 130,
        protein: 2.7,
        carbs: 28,
        fat: 0.3,
        isFavorite: true,
        tags: ["carb", "indian"],
        isCustom: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    const results = await repo.search({ term: "brown" });
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Brown Rice");
  });

  it("returns default settings", async () => {
    const repo = new IndexedDBSettingsRepository();
    const settings = await repo.get();
    expect(settings.hasCompletedOnboarding).toBe(false);
    expect(settings.waterQuickAdds).toEqual([250, 500, 1000]);
  });
});
