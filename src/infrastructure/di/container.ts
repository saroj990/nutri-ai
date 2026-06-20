import type { FoodRepository } from "@/domain/repositories/food.repository";
import type { MealRepository } from "@/domain/repositories/meal.repository";
import type { DailyLogRepository } from "@/domain/repositories/daily-log.repository";
import type { WeightRepository } from "@/domain/repositories/weight.repository";
import type { UserProfileRepository } from "@/domain/repositories/user-profile.repository";
import type { GamificationRepository } from "@/domain/repositories/gamification.repository";
import type { SettingsRepository } from "@/domain/repositories/settings.repository";
import type { LocalAuthRepository } from "@/domain/repositories/local-auth.repository";
import {
  IndexedDBFoodRepository,
  IndexedDBMealRepository,
  IndexedDBDailyLogRepository,
  IndexedDBWeightRepository,
  IndexedDBUserProfileRepository,
  IndexedDBGamificationRepository,
  IndexedDBSettingsRepository,
  IndexedDBLocalAuthRepository,
} from "@/repositories/indexeddb";

export interface RepositoryContainer {
  food: FoodRepository;
  meal: MealRepository;
  dailyLog: DailyLogRepository;
  weight: WeightRepository;
  userProfile: UserProfileRepository;
  gamification: GamificationRepository;
  settings: SettingsRepository;
  localAuth: LocalAuthRepository;
}

export function createIndexedDBContainer(): RepositoryContainer {
  return {
    food: new IndexedDBFoodRepository(),
    meal: new IndexedDBMealRepository(),
    dailyLog: new IndexedDBDailyLogRepository(),
    weight: new IndexedDBWeightRepository(),
    userProfile: new IndexedDBUserProfileRepository(),
    gamification: new IndexedDBGamificationRepository(),
    settings: new IndexedDBSettingsRepository(),
    localAuth: new IndexedDBLocalAuthRepository(),
  };
}
