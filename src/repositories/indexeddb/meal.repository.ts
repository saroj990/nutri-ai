import type { MealRepository } from "@/domain/repositories/meal.repository";
import type { Meal } from "@/domain/entities/meal";
import type { MealTemplate } from "@/domain/entities/meal-template";
import { getDatabase } from "@/infrastructure/database/nutriai-db";

export class IndexedDBMealRepository implements MealRepository {
  async getByDate(date: string): Promise<Meal[]> {
    const db = getDatabase();
    return db.meals.where("date").equals(date).toArray();
  }

  async getById(id: string): Promise<Meal | null> {
    const db = getDatabase();
    return (await db.meals.get(id)) ?? null;
  }

  async getByDateRange(from: string, to: string): Promise<Meal[]> {
    const db = getDatabase();
    return db.meals.where("date").between(from, to, true, true).toArray();
  }

  async getTemplates(): Promise<MealTemplate[]> {
    const db = getDatabase();
    return db.mealTemplates.orderBy("name").toArray();
  }

  async getTemplateById(id: string): Promise<MealTemplate | null> {
    const db = getDatabase();
    return (await db.mealTemplates.get(id)) ?? null;
  }

  async save(meal: Meal): Promise<void> {
    const db = getDatabase();
    await db.meals.put(meal);
  }

  async saveTemplate(template: MealTemplate): Promise<void> {
    const db = getDatabase();
    await db.mealTemplates.put(template);
  }

  async delete(id: string): Promise<void> {
    const db = getDatabase();
    await db.meals.delete(id);
  }

  async deleteTemplate(id: string): Promise<void> {
    const db = getDatabase();
    await db.mealTemplates.delete(id);
  }
}
