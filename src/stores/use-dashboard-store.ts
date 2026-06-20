import { create } from "zustand";
import type { DailySummary } from "@/services/daily-summary.service";
import { getDailySummary } from "@/services/daily-summary.service";
import type { RepositoryContainer } from "@/infrastructure/di/container";
import { toDateString } from "@/domain/value-objects/date";

interface DashboardState {
  summary: DailySummary | null;
  selectedDate: string;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  _repos: RepositoryContainer | null;

  setRepos: (repos: RepositoryContainer) => void;
  loadToday: () => Promise<void>;
  loadDate: (date: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  summary: null,
  selectedDate: toDateString(),
  isLoading: false,
  isHydrated: false,
  error: null,
  _repos: null,

  setRepos: (repos) => set({ _repos: repos }),

  loadToday: async () => {
    await get().loadDate(toDateString());
  },

  loadDate: async (date) => {
    const repos = get()._repos;
    if (!repos) return;

    set({ isLoading: true, error: null, selectedDate: date });
    try {
      const summary = await getDailySummary(repos, date);
      set({ summary, isLoading: false, isHydrated: true });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load dashboard",
        isLoading: false,
        isHydrated: true,
      });
    }
  },

  refresh: async () => {
    await get().loadDate(get().selectedDate);
  },
}));
