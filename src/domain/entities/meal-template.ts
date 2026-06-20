import type { MealType } from "./meal";
import type { FoodId, MealTemplateId } from "../value-objects/ids";

export interface TemplateFoodItem {
  foodId: FoodId;
  servings: number;
}

export interface MealTemplate {
  id: MealTemplateId;
  name: string;
  mealType: MealType;
  foods: TemplateFoodItem[];
  createdAt: string;
  updatedAt: string;
}
