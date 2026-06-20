import type { DateString } from "../value-objects/date";
import type { DailyLogId } from "../value-objects/ids";

export interface DailyLog {
  id: DailyLogId;
  date: DateString;
  caloriesConsumed: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
  waterConsumed: number;
  steps?: number;
  notes?: string;
  mealCount: number;
  updatedAt: string;
}
