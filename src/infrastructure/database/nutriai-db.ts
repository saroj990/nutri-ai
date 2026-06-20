import Dexie, { type Table } from "dexie";
import type { Food } from "@/domain/entities/food";
import type { Meal } from "@/domain/entities/meal";
import type { MealTemplate } from "@/domain/entities/meal-template";
import type { DailyLog } from "@/domain/entities/daily-log";
import type { WeightEntry } from "@/domain/entities/weight-entry";
import type { UserProfile } from "@/domain/entities/user-profile";
import type { GamificationState } from "@/domain/entities/gamification";
import type { AppSettings } from "@/domain/entities/settings";
import type { LocalAuthAccount } from "@/domain/entities/local-auth";

export interface RecentFoodRecord {
  foodId: string;
  lastUsedAt: string;
  useCount: number;
}

export class NutriAIDatabase extends Dexie {
  foods!: Table<Food, string>;
  meals!: Table<Meal, string>;
  mealTemplates!: Table<MealTemplate, string>;
  dailyLogs!: Table<DailyLog, string>;
  weightEntries!: Table<WeightEntry, string>;
  userProfile!: Table<UserProfile, string>;
  gamification!: Table<GamificationState & { id: string }, string>;
  settings!: Table<AppSettings & { id: string }, string>;
  localAuth!: Table<LocalAuthAccount, string>;
  recentFoods!: Table<RecentFoodRecord, string>;

  constructor() {
    super("NutriAIDB");

    this.version(1).stores({
      foods: "id, name, brand, isFavorite, isCustom, *tags, createdAt",
      meals: "id, date, mealType, createdAt, [date+mealType]",
      mealTemplates: "id, name, mealType, createdAt",
      dailyLogs: "id, &date, updatedAt",
      weightEntries: "id, &date, createdAt",
      userProfile: "id",
      gamification: "id",
      settings: "id",
      recentFoods: "foodId, lastUsedAt",
    });

    this.version(2).stores({
      localAuth: "id, &email",
    });
  }
}

let dbInstance: NutriAIDatabase | null = null;

export function getDatabase(): NutriAIDatabase {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is only available in the browser");
  }
  if (!dbInstance) {
    dbInstance = new NutriAIDatabase();
  }
  return dbInstance;
}

export function resetDatabaseForTesting(): void {
  dbInstance = null;
}
