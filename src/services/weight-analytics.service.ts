import type { WeightEntry } from "@/domain/entities/weight-entry";
import type { RepositoryContainer } from "@/infrastructure/di/container";
import { subtractDays, toDateString } from "@/domain/value-objects/date";
import { createWeightEntryId } from "@/domain/value-objects/ids";

export interface WeightStats {
  latest: WeightEntry | null;
  weeklyAverage: number | null;
  monthlyAverage: number | null;
  change7d: number | null;
  change30d: number | null;
  entries: WeightEntry[];
}

function average(weights: number[]): number | null {
  if (weights.length === 0) return null;
  return Math.round((weights.reduce((a, b) => a + b, 0) / weights.length) * 10) / 10;
}

export class WeightAnalyticsService {
  constructor(private repos: RepositoryContainer) {}

  async getStats(): Promise<WeightStats> {
    const today = toDateString();
    const weekStart = subtractDays(today, 6);
    const monthStart = subtractDays(today, 29);

    const [all, weekEntries, monthEntries, latest] = await Promise.all([
      this.repos.weight.getAll(),
      this.repos.weight.getByDateRange(weekStart, today),
      this.repos.weight.getByDateRange(monthStart, today),
      this.repos.weight.getLatest(),
    ]);

    const weekWeights = weekEntries.map((e) => e.weight);
    const monthWeights = monthEntries.map((e) => e.weight);

    let change7d: number | null = null;
    if (weekEntries.length >= 2) {
      const sorted = [...weekEntries].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      change7d =
        Math.round(
          (sorted[sorted.length - 1]!.weight - sorted[0]!.weight) * 10,
        ) / 10;
    }

    let change30d: number | null = null;
    if (monthEntries.length >= 2) {
      const sorted = [...monthEntries].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      change30d =
        Math.round(
          (sorted[sorted.length - 1]!.weight - sorted[0]!.weight) * 10,
        ) / 10;
    }

    return {
      latest,
      weeklyAverage: average(weekWeights),
      monthlyAverage: average(monthWeights),
      change7d,
      change30d,
      entries: all.sort((a, b) => b.date.localeCompare(a.date)),
    };
  }

  async saveEntry(
    entry: Omit<WeightEntry, "id" | "createdAt"> & { id?: WeightEntry["id"] },
  ): Promise<WeightEntry> {
    const existing = await this.repos.weight.getByDate(entry.date);
    const now = new Date().toISOString();

    const weightEntry: WeightEntry = {
      id: entry.id ?? existing?.id ?? createWeightEntryId(),
      date: entry.date,
      weight: entry.weight,
      bodyFatPercentage: entry.bodyFatPercentage,
      notes: entry.notes,
      createdAt: existing?.createdAt ?? now,
    };

    if (existing && existing.id !== weightEntry.id) {
      await this.repos.weight.delete(existing.id);
    }

    await this.repos.weight.save(weightEntry);
    return weightEntry;
  }
}

export function createWeightAnalyticsService(
  repos: RepositoryContainer,
): WeightAnalyticsService {
  return new WeightAnalyticsService(repos);
}
