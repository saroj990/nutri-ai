import dayjs from "dayjs";
import type { RepositoryContainer } from "@/infrastructure/di/container";
import { subtractDays, toDateString } from "@/domain/value-objects/date";
import type { DateString } from "@/domain/value-objects/date";

export type AnalyticsPeriod = "week" | "month" | "quarter";

export interface NutritionDataPoint {
  date: string;
  label: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}

export interface WeightDataPoint {
  date: string;
  label: string;
  weight: number;
  bodyFatPercentage?: number;
}

export interface AnalyticsSummary {
  period: AnalyticsPeriod;
  nutrition: NutritionDataPoint[];
  weight: WeightDataPoint[];
  averages: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
    weight?: number;
    weightChange?: number;
  };
}

function periodDays(period: AnalyticsPeriod): number {
  switch (period) {
    case "week":
      return 7;
    case "month":
      return 30;
    case "quarter":
      return 90;
  }
}

function formatLabel(date: string, period: AnalyticsPeriod): string {
  const d = dayjs(date);
  if (period === "week") return d.format("ddd");
  if (period === "month") return d.format("MMM D");
  return d.format("MMM D");
}

export class AnalyticsService {
  constructor(private repos: RepositoryContainer) {}

  async getSummary(period: AnalyticsPeriod): Promise<AnalyticsSummary> {
    const days = periodDays(period);
    const end = toDateString();
    const start = subtractDays(end, days - 1);

    const [dailyLogs, weightEntries] = await Promise.all([
      this.repos.dailyLog.getByDateRange(start, end),
      this.repos.weight.getByDateRange(start, end),
    ]);

    const logMap = new Map(dailyLogs.map((l) => [l.date, l]));

    let nutrition: NutritionDataPoint[] = [];

    if (period === "quarter") {
      nutrition = this.aggregateWeekly(start, end, logMap);
    } else {
      nutrition = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = subtractDays(end, i);
        const log = logMap.get(date);
        nutrition.push({
          date,
          label: formatLabel(date, period),
          calories: log?.caloriesConsumed ?? 0,
          protein: log?.proteinConsumed ?? 0,
          carbs: log?.carbsConsumed ?? 0,
          fat: log?.fatConsumed ?? 0,
          water: log?.waterConsumed ?? 0,
        });
      }
    }

    const weight: WeightDataPoint[] = weightEntries
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((e) => ({
        date: e.date,
        label: formatLabel(e.date, period),
        weight: e.weight,
        bodyFatPercentage: e.bodyFatPercentage,
      }));

    const daysWithData = nutrition.filter((n) => n.calories > 0);
    const count = daysWithData.length || 1;

    const avgCalories =
      daysWithData.reduce((s, n) => s + n.calories, 0) / count;
    const avgProtein =
      daysWithData.reduce((s, n) => s + n.protein, 0) / count;
    const avgCarbs = daysWithData.reduce((s, n) => s + n.carbs, 0) / count;
    const avgFat = daysWithData.reduce((s, n) => s + n.fat, 0) / count;
    const avgWater =
      nutrition.reduce((s, n) => s + n.water, 0) / nutrition.length;

    const weights = weight.map((w) => w.weight);
    const avgWeight =
      weights.length > 0
        ? weights.reduce((a, b) => a + b, 0) / weights.length
        : undefined;
    const weightChange =
      weights.length >= 2
        ? weights[weights.length - 1]! - weights[0]!
        : undefined;

    return {
      period,
      nutrition,
      weight,
      averages: {
        calories: Math.round(avgCalories),
        protein: Math.round(avgProtein * 10) / 10,
        carbs: Math.round(avgCarbs * 10) / 10,
        fat: Math.round(avgFat * 10) / 10,
        water: Math.round(avgWater),
        weight: avgWeight ? Math.round(avgWeight * 10) / 10 : undefined,
        weightChange: weightChange
          ? Math.round(weightChange * 10) / 10
          : undefined,
      },
    };
  }

  private aggregateWeekly(
    start: DateString,
    end: DateString,
    logMap: Map<string, { caloriesConsumed: number; proteinConsumed: number; carbsConsumed: number; fatConsumed: number; waterConsumed: number }>,
  ): NutritionDataPoint[] {
    const points: NutritionDataPoint[] = [];
    let cursor = dayjs(start);
    const endDay = dayjs(end);

    while (cursor.isBefore(endDay) || cursor.isSame(endDay, "day")) {
      const weekEnd = cursor.add(6, "day");
      const actualEnd = weekEnd.isAfter(endDay) ? endDay : weekEnd;

      let calories = 0;
      let protein = 0;
      let carbs = 0;
      let fat = 0;
      let water = 0;
      let days = 0;

      let d = cursor;
      while (d.isBefore(actualEnd) || d.isSame(actualEnd, "day")) {
        const dateStr = d.format("YYYY-MM-DD");
        const log = logMap.get(dateStr);
        if (log) {
          calories += log.caloriesConsumed;
          protein += log.proteinConsumed;
          carbs += log.carbsConsumed;
          fat += log.fatConsumed;
          water += log.waterConsumed;
          days++;
        }
        d = d.add(1, "day");
      }

      const divisor = Math.max(days, 1);
      points.push({
        date: cursor.format("YYYY-MM-DD"),
        label: cursor.format("MMM D"),
        calories: Math.round(calories / divisor),
        protein: Math.round((protein / divisor) * 10) / 10,
        carbs: Math.round((carbs / divisor) * 10) / 10,
        fat: Math.round((fat / divisor) * 10) / 10,
        water: Math.round(water / divisor),
      });

      cursor = actualEnd.add(1, "day");
    }

    return points;
  }
}

export function createAnalyticsService(
  repos: RepositoryContainer,
): AnalyticsService {
  return new AnalyticsService(repos);
}
