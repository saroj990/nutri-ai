import { z } from "zod";

export const servingUnitSchema = z.enum([
  "g",
  "ml",
  "oz",
  "cup",
  "tbsp",
  "tsp",
  "piece",
  "slice",
  "serving",
  "scoop",
]);

export const foodFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  brand: z.string().max(100).optional(),
  servingSize: z.number().positive("Serving size must be positive"),
  servingUnit: servingUnitSchema,
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  fiber: z.number().min(0).optional(),
  sugar: z.number().min(0).optional(),
  sodium: z.number().min(0).optional(),
  tags: z.array(z.string()),
  isFavorite: z.boolean(),
});

export const seedFoodSchema = foodFormSchema.extend({
  isCustom: z.boolean().optional(),
});

export const seedDataSchema = z.object({
  version: z.string(),
  count: z.number(),
  generatedAt: z.string(),
  foods: z.array(seedFoodSchema),
});

export type FoodFormData = z.infer<typeof foodFormSchema>;
