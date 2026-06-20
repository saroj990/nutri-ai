import type { Food } from "../entities/food";

export interface FoodSearchQuery {
  term?: string;
  favoritesOnly?: boolean;
  tags?: string[];
  limit?: number;
}

export interface FoodRepository {
  getAll(): Promise<Food[]>;
  getById(id: string): Promise<Food | null>;
  search(query: FoodSearchQuery): Promise<Food[]>;
  getFavorites(): Promise<Food[]>;
  getRecent(limit: number): Promise<Food[]>;
  save(food: Food): Promise<void>;
  delete(id: string): Promise<void>;
  bulkInsert(foods: Food[]): Promise<void>;
  count(): Promise<number>;
  trackRecent(foodId: string): Promise<void>;
}
