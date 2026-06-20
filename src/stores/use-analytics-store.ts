import { create } from "zustand";
import type { AnalyticsPeriod, AnalyticsSummary } from "@/services/analytics.service";
import { createAnalyticsService } from "@/services/analytics.service";
import type { RepositoryContainer } from "@/infrastructure/di/container";

interface AnalyticsState {
  period: AnalyticsPeriod;
  summary: AnalyticsSummary | null;
  isLoading: boolean;
  _repos: RepositoryContainer | null;

  setRepos: (repos: RepositoryContainer) => void;
  setPeriod: (period: AnalyticsPeriod) => void;
  load: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  period: "week",
  summary: null,
  isLoading: false,
  _repos: null,

  setRepos: (repos) => set({ _repos: repos }),

  setPeriod: (period) => {
    set({ period });
    void get().load();
  },

  load: async () => {
    const repos = get()._repos;
    if (!repos) return;

    set({ isLoading: true });
    try {
      const service = createAnalyticsService(repos);
      const summary = await service.getSummary(get().period);
      set({ summary, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
