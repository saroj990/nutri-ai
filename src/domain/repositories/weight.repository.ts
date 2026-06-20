import type { WeightEntry } from "../entities/weight-entry";

export interface WeightRepository {
  getAll(): Promise<WeightEntry[]>;
  getByDate(date: string): Promise<WeightEntry | null>;
  getByDateRange(from: string, to: string): Promise<WeightEntry[]>;
  getLatest(): Promise<WeightEntry | null>;
  save(entry: WeightEntry): Promise<void>;
  delete(id: string): Promise<void>;
}
