import type { Macros } from "../value-objects/macros";
import { scaleMacros } from "../value-objects/macros";
import type { ServingUnit } from "../value-objects/serving";
import type { FoodId } from "../value-objects/ids";

export interface Food {
  id: FoodId;
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: ServingUnit;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  isFavorite: boolean;
  tags: string[];
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

export function getFoodMacros(food: Food, servings = 1): Macros {
  return scaleMacros(
    {
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    },
    servings,
  );
}
