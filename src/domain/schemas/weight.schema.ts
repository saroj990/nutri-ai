import { z } from "zod";

export const weightEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weight: z.number().min(30).max(300),
  bodyFatPercentage: z.number().min(1).max(60).optional(),
  notes: z.string().max(500).optional(),
});

export type WeightEntryFormData = z.infer<typeof weightEntrySchema>;
