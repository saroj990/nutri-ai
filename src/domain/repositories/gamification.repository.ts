import type { GamificationState, Achievement } from "../entities/gamification";

export interface GamificationRepository {
  getState(): Promise<GamificationState>;
  save(state: GamificationState): Promise<void>;
  getAchievements(): Promise<Achievement[]>;
  unlockAchievement(id: string): Promise<void>;
}
