import type { RepositoryContainer } from "@/infrastructure/di/container";
import { subtractDays, toDateString } from "@/domain/value-objects/date";
import type { DateString } from "@/domain/value-objects/date";
import { buildDailySummary, type DailySummary } from "@/services/daily-summary.service";
import { getProfileTargets } from "@/services/profile.service";

export type ReportPeriod = "daily" | "weekly" | "monthly";

export interface PeriodReport {
  period: ReportPeriod;
  startDate: DateString;
  endDate: DateString;
  daysTracked: number;
  mealsLogged: number;
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  avgWater: number;
  weightChange: number | null;
  goalCompletionRate: number;
  currentStreak: number;
  longestStreak: number;
  daily?: DailySummary;
}

function periodRange(period: ReportPeriod): { start: DateString; end: DateString } {
  const end = toDateString();
  switch (period) {
    case "daily":
      return { start: end, end };
    case "weekly":
      return { start: subtractDays(end, 6), end };
    case "monthly":
      return { start: subtractDays(end, 29), end };
  }
}

function isCalorieGoalHit(
  calories: number,
  target: number | undefined,
): boolean {
  if (!target) return false;
  return calories >= target * 0.95 && calories <= target * 1.05;
}

export class ReportService {
  constructor(private repos: RepositoryContainer) {}

  async getReport(period: ReportPeriod): Promise<PeriodReport> {
    const { start, end } = periodRange(period);
    const [dailyLogs, weightEntries, gamification, profile] = await Promise.all([
      this.repos.dailyLog.getByDateRange(start, end),
      this.repos.weight.getByDateRange(start, end),
      this.repos.gamification.getState(),
      this.repos.userProfile.get(),
    ]);

    const targets = profile ? getProfileTargets(profile) : null;
    const logsWithMeals = dailyLogs.filter((log) => log.mealCount > 0);
    const daysTracked = logsWithMeals.length;
    const mealsLogged = dailyLogs.reduce((sum, log) => sum + log.mealCount, 0);

    const divisor = Math.max(daysTracked, 1);
    const avgCalories =
      logsWithMeals.reduce((sum, log) => sum + log.caloriesConsumed, 0) / divisor;
    const avgProtein =
      logsWithMeals.reduce((sum, log) => sum + log.proteinConsumed, 0) / divisor;
    const avgCarbs =
      logsWithMeals.reduce((sum, log) => sum + log.carbsConsumed, 0) / divisor;
    const avgFat =
      logsWithMeals.reduce((sum, log) => sum + log.fatConsumed, 0) / divisor;
    const avgWater =
      dailyLogs.reduce((sum, log) => sum + log.waterConsumed, 0) /
      Math.max(dailyLogs.length, 1);

    const goalDays = logsWithMeals.filter((log) =>
      isCalorieGoalHit(log.caloriesConsumed, targets?.dailyCalories),
    ).length;
    const goalCompletionRate =
      daysTracked > 0 ? Math.round((goalDays / daysTracked) * 100) : 0;

    let weightChange: number | null = null;
    if (weightEntries.length >= 2) {
      const sorted = [...weightEntries].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      weightChange =
        Math.round(
          (sorted[sorted.length - 1]!.weight - sorted[0]!.weight) * 10,
        ) / 10;
    }

    const report: PeriodReport = {
      period,
      startDate: start,
      endDate: end,
      daysTracked,
      mealsLogged,
      avgCalories: Math.round(avgCalories),
      avgProtein: Math.round(avgProtein * 10) / 10,
      avgCarbs: Math.round(avgCarbs * 10) / 10,
      avgFat: Math.round(avgFat * 10) / 10,
      avgWater: Math.round(avgWater),
      weightChange,
      goalCompletionRate,
      currentStreak: gamification.currentStreak,
      longestStreak: gamification.longestStreak,
    };

    if (period === "daily") {
      report.daily = await buildDailySummary(this.repos, end);
    }

    return report;
  }
}

export function createReportService(repos: RepositoryContainer): ReportService {
  return new ReportService(repos);
}
