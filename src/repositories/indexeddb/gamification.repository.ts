import type { GamificationRepository } from "@/domain/repositories/gamification.repository";
import type {
  GamificationState,
  Achievement,
} from "@/domain/entities/gamification";
import { createAchievementId } from "@/domain/value-objects/ids";
import { getDatabase } from "@/infrastructure/database/nutriai-db";

const DEFAULT_GAMIFICATION_ID = "default";

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: createAchievementId("first_meal"),
    title: "First Bite",
    description: "Log your first meal",
    icon: "utensils",
    category: "logging",
    xpReward: 50,
    condition: { type: "first_meal" },
  },
  {
    id: createAchievementId("streak_7"),
    title: "Week Warrior",
    description: "Maintain a 7-day logging streak",
    icon: "flame",
    category: "streak",
    xpReward: 100,
    condition: { type: "streak", days: 7 },
  },
  {
    id: createAchievementId("streak_30"),
    title: "Monthly Master",
    description: "Maintain a 30-day logging streak",
    icon: "trophy",
    category: "streak",
    xpReward: 200,
    condition: { type: "streak", days: 30 },
  },
  {
    id: createAchievementId("protein_10"),
    title: "Protein Pro",
    description: "Hit your protein goal 10 times",
    icon: "dumbbell",
    category: "nutrition",
    xpReward: 150,
    condition: { type: "protein_goal_hit", count: 10 },
  },
  {
    id: createAchievementId("meals_100"),
    title: "Century Club",
    description: "Log 100 meals",
    icon: "medal",
    category: "milestone",
    xpReward: 200,
    condition: { type: "meals_logged", count: 100 },
  },
  {
    id: createAchievementId("water_week"),
    title: "Hydration Hero",
    description: "Hit your water goal 7 times",
    icon: "droplets",
    category: "nutrition",
    xpReward: 100,
    condition: { type: "water_goal_hit", days: 7 },
  },
  {
    id: createAchievementId("weight_10kg"),
    title: "Scale Champion",
    description: "Track 10 kg of total weight change",
    icon: "scale",
    category: "weight",
    xpReward: 150,
    condition: { type: "weight_change", kg: 10 },
  },
  {
    id: createAchievementId("level_5"),
    title: "Rising Star",
    description: "Reach level 5",
    icon: "star",
    category: "milestone",
    xpReward: 250,
    condition: { type: "level", level: 5 },
  },
];

const DEFAULT_STATE: GamificationState = {
  totalXP: 0,
  level: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastLoggedDate: null,
  unlockedAchievements: [],
  stats: {
    totalMealsLogged: 0,
    totalCaloriesLogged: 0,
    totalWeightEntries: 0,
    proteinGoalHitCount: 0,
    waterGoalHitCount: 0,
    daysLogged: 0,
  },
  updatedAt: new Date().toISOString(),
};

export class IndexedDBGamificationRepository implements GamificationRepository {
  async getState(): Promise<GamificationState> {
    const db = getDatabase();
    const stored = await db.gamification.get(DEFAULT_GAMIFICATION_ID);
    if (stored) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...state } = stored;
      return state;
    }
    return {
      ...DEFAULT_STATE,
      stats: { ...DEFAULT_STATE.stats },
      unlockedAchievements: [],
    };
  }

  async save(state: GamificationState): Promise<void> {
    const db = getDatabase();
    await db.gamification.put({ ...state, id: DEFAULT_GAMIFICATION_ID });
  }

  async getAchievements(): Promise<Achievement[]> {
    return DEFAULT_ACHIEVEMENTS;
  }

  async unlockAchievement(id: string): Promise<void> {
    const state = await this.getState();
    const achievementId = createAchievementId(id);
    if (!state.unlockedAchievements.includes(achievementId)) {
      const achievement = DEFAULT_ACHIEVEMENTS.find((a) => a.id === achievementId);
      state.unlockedAchievements.push(achievementId);
      state.totalXP += achievement?.xpReward ?? 0;
      state.level = Math.floor(Math.sqrt(state.totalXP / 100));
      state.updatedAt = new Date().toISOString();
      await this.save(state);
    }
  }
}
