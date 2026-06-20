import { create } from "zustand";
import type { RepositoryContainer } from "@/infrastructure/di/container";
import { createWaterService } from "@/services/water.service";
import { useDashboardStore } from "@/stores/use-dashboard-store";
import { useGamificationStore } from "@/stores/use-gamification-store";
import { toDateString } from "@/domain/value-objects/date";

interface WaterState {
  consumed: number;
  goal: number;
  isLoading: boolean;
  _repos: RepositoryContainer | null;

  setRepos: (repos: RepositoryContainer) => void;
  load: () => Promise<void>;
  addWater: (amountMl: number) => Promise<void>;
}

export const useWaterStore = create<WaterState>((set, get) => ({
  consumed: 0,
  goal: 2500,
  isLoading: false,
  _repos: null,

  setRepos: (repos) => set({ _repos: repos }),

  load: async () => {
    const repos = get()._repos;
    if (!repos) return;

    const service = createWaterService(repos);
    const [consumed, goal] = await Promise.all([
      service.getTodayWater(),
      service.getWaterGoal(),
    ]);
    set({ consumed, goal });
  },

  addWater: async (amountMl) => {
    const repos = get()._repos;
    if (!repos) return;

    set({ isLoading: true });
    try {
      const service = createWaterService(repos);
      const log = await service.addWater(amountMl, toDateString());
      set({ consumed: log.waterConsumed, isLoading: false });
      await useDashboardStore.getState().refresh();
      await useGamificationStore.getState().load();
    } catch {
      set({ isLoading: false });
      throw new Error("Failed to add water");
    }
  },
}));
