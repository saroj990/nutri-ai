import { z } from "zod";

export const mealTypeSchema = z.enum([
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "pre_workout",
  "post_workout",
]);

export const mealFoodItemInputSchema = z.object({
  foodId: z.string().min(1),
  servings: z.number().positive("Servings must be positive"),
});

export const logMealSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  mealType: mealTypeSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  foods: z.array(mealFoodItemInputSchema).min(1, "Add at least one food"),
  notes: z.string().max(500).optional(),
});

export const mealTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  mealType: mealTypeSchema,
  foods: z.array(mealFoodItemInputSchema).min(1),
});

export type LogMealFormData = z.infer<typeof logMealSchema>;
export type MealTemplateFormData = z.infer<typeof mealTemplateSchema>;
export type MealFoodItemInput = z.infer<typeof mealFoodItemInputSchema>;
