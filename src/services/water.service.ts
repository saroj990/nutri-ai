import type { DailyLog } from "@/domain/entities/daily-log";
import type { DateString } from "@/domain/value-objects/date";
import { toDateString } from "@/domain/value-objects/date";
import type { RepositoryContainer } from "@/infrastructure/di/container";
import { GamificationService } from "@/services/gamification.service";
import { getProfileTargets } from "@/services/profile.service";

export class WaterService {
  constructor(
    private repos: RepositoryContainer,
    private gamification: GamificationService,
  ) {}

  async addWater(
    amountMl: number,
    date: DateString = toDateString(),
  ): Promise<DailyLog> {
    const existing = await this.repos.dailyLog.getByDate(date);
    const newTotal = (existing?.waterConsumed ?? 0) + amountMl;

    const log = await this.repos.dailyLog.upsertPartial(date, {
      waterConsumed: newTotal,
    });

    await this.gamification.onWaterAdded(log, amountMl);
    return log;
  }

  async getTodayWater(): Promise<number> {
    const log = await this.repos.dailyLog.getByDate(toDateString());
    return log?.waterConsumed ?? 0;
  }

  async getWaterGoal(): Promise<number> {
    const profile = await this.repos.userProfile.get();
    if (!profile) return 2500;
    return getProfileTargets(profile)?.dailyWater ?? 2500;
  }
}

export function createWaterService(repos: RepositoryContainer): WaterService {
  return new WaterService(repos, new GamificationService(repos));
}
