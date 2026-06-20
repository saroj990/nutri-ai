import { z } from "zod";

export const themeSchema = z.enum(["light", "dark", "system"]);

export const settingsSchema = z.object({
  theme: themeSchema,
  waterQuickAdds: z.array(z.number().int().positive()),
  defaultMealType: z.enum([
    "breakfast",
    "lunch",
    "dinner",
    "snack",
    "pre_workout",
    "post_workout",
  ]),
  reminders: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["water", "meal", "weight"]),
      label: z.string(),
      time: z.string(),
      enabled: z.boolean(),
      daysOfWeek: z.array(z.number().int().min(0).max(6)),
    }),
  ),
  hasCompletedOnboarding: z.boolean(),
  hasSeededData: z.boolean(),
  locale: z.string(),
  updatedAt: z.string(),
});
