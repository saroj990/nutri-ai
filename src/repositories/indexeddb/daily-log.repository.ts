import type { DailyLogRepository } from "@/domain/repositories/daily-log.repository";
import type { DailyLog } from "@/domain/entities/daily-log";
import { createDailyLogId } from "@/domain/value-objects/ids";
import { getDatabase } from "@/infrastructure/database/nutriai-db";

export class IndexedDBDailyLogRepository implements DailyLogRepository {
  async getByDate(date: string): Promise<DailyLog | null> {
    const db = getDatabase();
    return (await db.dailyLogs.where("date").equals(date).first()) ?? null;
  }

  async getByDateRange(from: string, to: string): Promise<DailyLog[]> {
    const db = getDatabase();
    return db.dailyLogs.where("date").between(from, to, true, true).toArray();
  }

  async save(log: DailyLog): Promise<void> {
    const db = getDatabase();
    await db.dailyLogs.put(log);
  }

  async upsertPartial(
    date: string,
    partial: Partial<DailyLog>,
  ): Promise<DailyLog> {
    const existing = await this.getByDate(date);
    const now = new Date().toISOString();

    const log: DailyLog = {
      id: existing?.id ?? createDailyLogId(),
      date: date as DailyLog["date"],
      caloriesConsumed: partial.caloriesConsumed ?? existing?.caloriesConsumed ?? 0,
      proteinConsumed: partial.proteinConsumed ?? existing?.proteinConsumed ?? 0,
      carbsConsumed: partial.carbsConsumed ?? existing?.carbsConsumed ?? 0,
      fatConsumed: partial.fatConsumed ?? existing?.fatConsumed ?? 0,
      waterConsumed: partial.waterConsumed ?? existing?.waterConsumed ?? 0,
      steps: partial.steps ?? existing?.steps,
      notes: partial.notes ?? existing?.notes,
      mealCount: partial.mealCount ?? existing?.mealCount ?? 0,
      updatedAt: now,
    };

    await this.save(log);
    return log;
  }

  async delete(date: string): Promise<void> {
    const db = getDatabase();
    await db.dailyLogs.where("date").equals(date).delete();
  }
}
