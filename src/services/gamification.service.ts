import type { Meal } from "@/domain/entities/meal";
import type { DailyLog } from "@/domain/entities/daily-log";
import {
  calculateLevel,
  XP_REWARDS,
  type GamificationState,
  type Achievement,
} from "@/domain/entities/gamification";
import { StreakService } from "@/domain/services/streak.service";
import { createAchievementId } from "@/domain/value-objects/ids";
import type { RepositoryContainer } from "@/infrastructure/di/container";
import { getProfileTargets } from "@/services/profile.service";

const ACHIEVEMENT_KEYS = [
  "first_meal",
  "streak_7",
  "streak_30",
  "protein_10",
  "meals_100",
  "water_week",
  "weight_10kg",
  "level_5",
] as const;

export class GamificationService {
  constructor(private repos: RepositoryContainer) {}

  async onMealLogged(meal: Meal, dailyLog: DailyLog): Promise<GamificationState> {
    let state = await this.repos.gamification.getState();
    const achievements = await this.repos.gamification.getAchievements();

    state.totalXP += XP_REWARDS.LOG_MEAL;
    state.stats.totalMealsLogged += 1;
    state.stats.totalCaloriesLogged += meal.totalCalories;

    const isNewDay = state.lastLoggedDate !== meal.date;
    if (isNewDay) {
      state.stats.daysLogged += 1;
    }

    state = StreakService.updateStreak(state, meal.date);

    if (state.currentStreak > 0 && isNewDay) {
      state.totalXP += XP_REWARDS.DAILY_STREAK;
    }

    const profile = await this.repos.userProfile.get();
    if (profile) {
      const targets = getProfileTargets(profile);
      if (targets && dailyLog.proteinConsumed >= targets.dailyProtein) {
        const wasUnder =
          dailyLog.proteinConsumed - meal.totalProtein < targets.dailyProtein;
        if (wasUnder) {
          state.totalXP += XP_REWARDS.HIT_PROTEIN_GOAL;
          state.stats.proteinGoalHitCount += 1;
        }
      }

      if (targets) {
        const inRange =
          dailyLog.caloriesConsumed >= targets.dailyCalories * 0.95 &&
          dailyLog.caloriesConsumed <= targets.dailyCalories * 1.05;
        const prevCals = dailyLog.caloriesConsumed - meal.totalCalories;
        const wasOutside =
          prevCals < targets.dailyCalories * 0.95 ||
          prevCals > targets.dailyCalories * 1.05;
        if (inRange && wasOutside) {
          state.totalXP += XP_REWARDS.HIT_CALORIE_GOAL;
        }
      }
    }

    state.level = calculateLevel(state.totalXP);
    state.updatedAt = new Date().toISOString();
    await this.repos.gamification.save(state);

    await this.checkAchievements(state, achievements);

    return this.repos.gamification.getState();
  }

  async onWaterAdded(
    dailyLog: DailyLog,
    amountMl: number,
  ): Promise<GamificationState> {
    const state = await this.repos.gamification.getState();
    const achievements = await this.repos.gamification.getAchievements();

    state.totalXP += XP_REWARDS.LOG_WATER;
    state.level = calculateLevel(state.totalXP);
    state.updatedAt = new Date().toISOString();

    const profile = await this.repos.userProfile.get();
    if (profile) {
      const targets = getProfileTargets(profile);
      if (
        targets &&
        dailyLog.waterConsumed >= targets.dailyWater &&
        dailyLog.waterConsumed - amountMl < targets.dailyWater
      ) {
        state.stats.waterGoalHitCount += 1;
      }
    }

    await this.repos.gamification.save(state);
    await this.checkAchievements(state, achievements);
    return this.repos.gamification.getState();
  }

  async onWeightLogged(): Promise<GamificationState> {
    const state = await this.repos.gamification.getState();
    const achievements = await this.repos.gamification.getAchievements();

    state.totalXP += XP_REWARDS.LOG_WEIGHT;
    state.stats.totalWeightEntries += 1;
    state.level = calculateLevel(state.totalXP);
    state.updatedAt = new Date().toISOString();
    await this.repos.gamification.save(state);

    await this.checkAchievements(state, achievements);
    return this.repos.gamification.getState();
  }

  private async checkAchievements(
    state: GamificationState,
    achievements: Achievement[],
  ): Promise<void> {
    const weightChange = await this.getTrackedWeightChange();
    let currentState = state;

    for (const achievement of achievements) {
      if (currentState.unlockedAchievements.includes(achievement.id)) continue;

      let unlocked = false;
      switch (achievement.condition.type) {
        case "first_meal":
          unlocked = currentState.stats.totalMealsLogged >= 1;
          break;
        case "meals_logged":
          unlocked =
            currentState.stats.totalMealsLogged >= achievement.condition.count;
          break;
        case "streak":
          unlocked = currentState.currentStreak >= achievement.condition.days;
          break;
        case "protein_goal_hit":
          unlocked =
            currentState.stats.proteinGoalHitCount >= achievement.condition.count;
          break;
        case "water_goal_hit":
          unlocked =
            currentState.stats.waterGoalHitCount >= achievement.condition.days;
          break;
        case "weight_change":
          unlocked = weightChange >= achievement.condition.kg;
          break;
        case "level":
          unlocked = currentState.level >= achievement.condition.level;
          break;
        default:
          break;
      }

      if (unlocked) {
        const key = ACHIEVEMENT_KEYS.find(
          (k) => achievement.id === createAchievementId(k),
        );
        if (key) {
          await this.repos.gamification.unlockAchievement(key);
          currentState = await this.repos.gamification.getState();
        }
      }
    }
  }

  private async getTrackedWeightChange(): Promise<number> {
    if (typeof this.repos.weight.getAll !== "function") {
      return 0;
    }

    const entries = await this.repos.weight.getAll();
    if (entries.length < 2) return 0;

    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    const first = sorted[0]!.weight;
    const last = sorted[sorted.length - 1]!.weight;
    return Math.round(Math.abs(last - first) * 10) / 10;
  }
}
