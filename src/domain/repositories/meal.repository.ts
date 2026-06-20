import type { Meal } from "../entities/meal";
import type { MealTemplate } from "../entities/meal-template";

export interface MealRepository {
  getByDate(date: string): Promise<Meal[]>;
  getById(id: string): Promise<Meal | null>;
  getByDateRange(from: string, to: string): Promise<Meal[]>;
  getTemplates(): Promise<MealTemplate[]>;
  getTemplateById(id: string): Promise<MealTemplate | null>;
  save(meal: Meal): Promise<void>;
  saveTemplate(template: MealTemplate): Promise<void>;
  delete(id: string): Promise<void>;
  deleteTemplate(id: string): Promise<void>;
}
