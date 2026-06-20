import { create } from "zustand";
import { toast } from "sonner";
import type { GamificationState, Achievement } from "@/domain/entities/gamification";
import type { RepositoryContainer } from "@/infrastructure/di/container";

interface GamificationStoreState {
  state: GamificationState | null;
  achievements: Achievement[];
  highlightId: string | null;
  isLoading: boolean;
  _repos: RepositoryContainer | null;

  setRepos: (repos: RepositoryContainer) => void;
  load: () => Promise<void>;
  clearHighlight: () => void;
}

export const useGamificationStore = create<GamificationStoreState>((set, get) => ({
  state: null,
  achievements: [],
  highlightId: null,
  isLoading: false,
  _repos: null,

  setRepos: (repos) => set({ _repos: repos }),

  load: async () => {
    const repos = get()._repos;
    if (!repos) return;

    set({ isLoading: true });
    try {
      const previousUnlocked = get().state?.unlockedAchievements ?? [];
      const [state, achievements] = await Promise.all([
        repos.gamification.getState(),
        repos.gamification.getAchievements(),
      ]);

      const newUnlocks = achievements.filter(
        (achievement) =>
          state.unlockedAchievements.includes(achievement.id) &&
          !previousUnlocked.includes(achievement.id),
      );

      const highlightId = newUnlocks[0]?.id ?? null;

      for (const achievement of newUnlocks) {
        toast.success(`Achievement unlocked: ${achievement.title}`, {
          description: achievement.description,
        });
      }

      set({
        state,
        achievements,
        highlightId,
        isLoading: false,
      });

      if (highlightId) {
        setTimeout(() => {
          if (get().highlightId === highlightId) {
            set({ highlightId: null });
          }
        }, 3000);
      }
    } catch {
      set({ isLoading: false });
    }
  },

  clearHighlight: () => set({ highlightId: null }),
}));
