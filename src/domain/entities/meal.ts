import type { Macros } from "../value-objects/macros";
import { addMacros, ZERO_MACROS } from "../value-objects/macros";
import type { DateString } from "../value-objects/date";
import type { FoodId, MealId } from "../value-objects/ids";

export type MealType =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack"
  | "pre_workout"
  | "post_workout";

export interface MealFoodItem {
  foodId: FoodId;
  foodName: string;
  servings: number;
  macros: Macros;
}

export interface Meal {
  id: MealId;
  name: string;
  mealType: MealType;
  date: DateString;
  foods: MealFoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export function computeMealTotals(foods: MealFoodItem[]): Macros {
  return foods.reduce((acc, item) => addMacros(acc, item.macros), ZERO_MACROS);
}

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
  pre_workout: "Pre Workout",
  post_workout: "Post Workout",
};
