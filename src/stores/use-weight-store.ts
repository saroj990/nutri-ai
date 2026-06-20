import { create } from "zustand";
import type { WeightStats } from "@/services/weight-analytics.service";
import { createWeightAnalyticsService } from "@/services/weight-analytics.service";
import type { WeightEntryFormData } from "@/domain/schemas/weight.schema";
import type { RepositoryContainer } from "@/infrastructure/di/container";
import type { DateString } from "@/domain/value-objects/date";
import { GamificationService } from "@/services/gamification.service";
import { useGamificationStore } from "@/stores/use-gamification-store";

interface WeightState {
  stats: WeightStats | null;
  isLoading: boolean;
  _repos: RepositoryContainer | null;

  setRepos: (repos: RepositoryContainer) => void;
  load: () => Promise<void>;
  saveEntry: (data: WeightEntryFormData) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}

export const useWeightStore = create<WeightState>((set, get) => ({
  stats: null,
  isLoading: false,
  _repos: null,

  setRepos: (repos) => set({ _repos: repos }),

  load: async () => {
    const repos = get()._repos;
    if (!repos) return;

    set({ isLoading: true });
    try {
      const service = createWeightAnalyticsService(repos);
      const stats = await service.getStats();
      set({ stats, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  saveEntry: async (data) => {
    const repos = get()._repos;
    if (!repos) return;

    set({ isLoading: true });
    try {
      const service = createWeightAnalyticsService(repos);
      const existing = await repos.weight.getByDate(data.date);
      await service.saveEntry({
        date: data.date as DateString,
        weight: data.weight,
        bodyFatPercentage: data.bodyFatPercentage,
        notes: data.notes,
        id: existing?.id,
      });

      const gamification = new GamificationService(repos);
      await gamification.onWeightLogged();
      await useGamificationStore.getState().load();
      await get().load();
    } catch {
      set({ isLoading: false });
      throw new Error("Failed to save weight");
    }
  },

  deleteEntry: async (id) => {
    const repos = get()._repos;
    if (!repos) return;

    await repos.weight.delete(id);
    await get().load();
  },
}));
