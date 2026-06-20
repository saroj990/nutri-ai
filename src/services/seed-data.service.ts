import type { Food } from "@/domain/entities/food";
import type { FoodRepository } from "@/domain/repositories/food.repository";
import type { SettingsRepository } from "@/domain/repositories/settings.repository";
import { createFoodId } from "@/domain/value-objects/ids";
import { seedDataSchema } from "@/domain/schemas/food.schema";
import { searchService } from "@/services/search.service";

const BATCH_SIZE = 100;

export class SeedDataService {
  constructor(
    private foodRepo: FoodRepository,
    private settingsRepo: SettingsRepository,
  ) {}

  async seedIfNeeded(): Promise<{ seeded: boolean; count: number }> {
    const settings = await this.settingsRepo.get();
    if (settings.hasSeededData) {
      const count = await this.foodRepo.count();
      return { seeded: false, count };
    }

    const existingCount = await this.foodRepo.count();
    if (existingCount > 0) {
      await this.settingsRepo.save({
        ...settings,
        hasSeededData: true,
        updatedAt: new Date().toISOString(),
      });
      return { seeded: false, count: existingCount };
    }

    const response = await fetch("/data/seed-foods.json");
    if (!response.ok) {
      throw new Error("Failed to load seed data");
    }

    const json = await response.json();
    const parsed = seedDataSchema.parse(json);
    const now = new Date().toISOString();

    const foods: Food[] = parsed.foods.map((item) => ({
      id: createFoodId(),
      name: item.name,
      brand: item.brand,
      servingSize: item.servingSize,
      servingUnit: item.servingUnit,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      fiber: item.fiber,
      sugar: item.sugar,
      sodium: item.sodium,
      isFavorite: item.isFavorite ?? false,
      tags: item.tags ?? [],
      isCustom: false,
      createdAt: now,
      updatedAt: now,
    }));

    for (let i = 0; i < foods.length; i += BATCH_SIZE) {
      await this.foodRepo.bulkInsert(foods.slice(i, i + BATCH_SIZE));
    }

    await this.settingsRepo.save({
      ...settings,
      hasSeededData: true,
      updatedAt: new Date().toISOString(),
    });

    return { seeded: true, count: foods.length };
  }

  async rebuildSearchIndex(): Promise<void> {
    const foods = await this.foodRepo.getAll();
    searchService.buildIndex(foods);
  }
}
