import { z } from "zod";

export const genderSchema = z.enum([
  "male",
  "female",
  "other",
  "prefer_not_to_say",
]);

export const activityLevelSchema = z.enum([
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
]);

export const goalTypeSchema = z.enum([
  "weight_loss",
  "weight_gain",
  "maintenance",
]);

export const profileBodySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  gender: genderSchema,
  age: z.number().int().min(13, "Must be at least 13").max(120),
  height: z.number().min(100, "Height must be at least 100 cm").max(250),
  weight: z.number().min(30, "Weight must be at least 30 kg").max(300),
  targetWeight: z.number().min(30, "Target must be at least 30 kg").max(300),
});

export const profileGoalsSchema = z.object({
  activityLevel: activityLevelSchema,
  goalType: goalTypeSchema,
  calorieAdjustment: z.number().int().min(0).max(1500),
});

export const onboardingSchema = profileBodySchema.merge(profileGoalsSchema);

export const customTargetsSchema = z.object({
  useCustomTargets: z.boolean(),
  dailyCalories: z.number().int().min(800).max(10000),
  dailyProtein: z.number().int().min(0).max(1000),
  dailyCarbs: z.number().int().min(0).max(1000),
  dailyFat: z.number().int().min(0).max(500),
  dailyWater: z.number().int().min(500).max(10000),
});

export const profileEditSchema = profileBodySchema.merge(customTargetsSchema).extend({
  activityLevel: activityLevelSchema,
  goalType: goalTypeSchema,
  calorieAdjustment: z.number().int().min(0).max(1500),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;
export type ProfileEditFormData = z.infer<typeof profileEditSchema>;
export type CustomTargetsFormData = z.infer<typeof customTargetsSchema>;
