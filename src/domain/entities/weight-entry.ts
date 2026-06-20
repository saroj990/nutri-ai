import type { DateString } from "../value-objects/date";
import type { WeightEntryId } from "../value-objects/ids";

export interface WeightEntry {
  id: WeightEntryId;
  date: DateString;
  weight: number;
  bodyFatPercentage?: number;
  notes?: string;
  createdAt: string;
}
