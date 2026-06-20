import type { DailyLog } from "../entities/daily-log";

export interface DailyLogRepository {
  getByDate(date: string): Promise<DailyLog | null>;
  getByDateRange(from: string, to: string): Promise<DailyLog[]>;
  save(log: DailyLog): Promise<void>;
  upsertPartial(date: string, partial: Partial<DailyLog>): Promise<DailyLog>;
  delete(date: string): Promise<void>;
}
