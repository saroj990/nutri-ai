import type { FoodRepository, FoodSearchQuery } from "@/domain/repositories/food.repository";
import type { Food } from "@/domain/entities/food";
import { getDatabase } from "@/infrastructure/database/nutriai-db";

export class IndexedDBFoodRepository implements FoodRepository {
  async getAll(): Promise<Food[]> {
    const db = getDatabase();
    return db.foods.orderBy("name").toArray();
  }

  async getById(id: string): Promise<Food | null> {
    const db = getDatabase();
    return (await db.foods.get(id)) ?? null;
  }

  async search(query: FoodSearchQuery): Promise<Food[]> {
    const db = getDatabase();
    let results = await db.foods.toArray();

    if (query.favoritesOnly) {
      results = results.filter((f) => f.isFavorite);
    }

    if (query.tags?.length) {
      results = results.filter((f) =>
        query.tags!.some((tag) => f.tags.includes(tag)),
      );
    }

    if (query.term) {
      const term = query.term.toLowerCase();
      results = results.filter(
        (f) =>
          f.name.toLowerCase().includes(term) ||
          f.brand?.toLowerCase().includes(term) ||
          f.tags.some((t) => t.toLowerCase().includes(term)),
      );
    }

    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  async getFavorites(): Promise<Food[]> {
    const db = getDatabase();
    return db.foods.filter((f) => f.isFavorite).toArray();
  }

  async getRecent(limit: number): Promise<Food[]> {
    const db = getDatabase();
    const recent = await db.recentFoods
      .orderBy("lastUsedAt")
      .reverse()
      .limit(limit)
      .toArray();

    const foods: Food[] = [];
    for (const r of recent) {
      const food = await db.foods.get(r.foodId);
      if (food) foods.push(food);
    }
    return foods;
  }

  async save(food: Food): Promise<void> {
    const db = getDatabase();
    await db.foods.put(food);
  }

  async delete(id: string): Promise<void> {
    const db = getDatabase();
    await db.foods.delete(id);
  }

  async bulkInsert(foods: Food[]): Promise<void> {
    const db = getDatabase();
    await db.foods.bulkPut(foods);
  }

  async count(): Promise<number> {
    const db = getDatabase();
    return db.foods.count();
  }

  async trackRecent(foodId: string): Promise<void> {
    const db = getDatabase();
    const existing = await db.recentFoods.get(foodId);
    await db.recentFoods.put({
      foodId,
      lastUsedAt: new Date().toISOString(),
      useCount: (existing?.useCount ?? 0) + 1,
    });
  }
}
