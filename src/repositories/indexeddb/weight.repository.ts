import type { WeightRepository } from "@/domain/repositories/weight.repository";
import type { WeightEntry } from "@/domain/entities/weight-entry";
import { getDatabase } from "@/infrastructure/database/nutriai-db";

export class IndexedDBWeightRepository implements WeightRepository {
  async getAll(): Promise<WeightEntry[]> {
    const db = getDatabase();
    return db.weightEntries.orderBy("date").toArray();
  }

  async getByDate(date: string): Promise<WeightEntry | null> {
    const db = getDatabase();
    return (await db.weightEntries.where("date").equals(date).first()) ?? null;
  }

  async getByDateRange(from: string, to: string): Promise<WeightEntry[]> {
    const db = getDatabase();
    return db.weightEntries
      .where("date")
      .between(from, to, true, true)
      .toArray();
  }

  async getLatest(): Promise<WeightEntry | null> {
    const db = getDatabase();
    const entries = await db.weightEntries.orderBy("date").reverse().limit(1).toArray();
    return entries[0] ?? null;
  }

  async save(entry: WeightEntry): Promise<void> {
    const db = getDatabase();
    await db.weightEntries.put(entry);
  }

  async delete(id: string): Promise<void> {
    const db = getDatabase();
    await db.weightEntries.delete(id);
  }
}
