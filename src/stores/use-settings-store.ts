import { create } from "zustand";
import type { AppSettings } from "@/domain/entities/settings";
import type { RepositoryContainer } from "@/infrastructure/di/container";

interface SettingsState {
  settings: AppSettings | null;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  _repos: RepositoryContainer | null;

  setRepos: (repos: RepositoryContainer) => void;
  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoading: false,
  isHydrated: false,
  error: null,
  _repos: null,

  setRepos: (repos) => set({ _repos: repos }),

  loadSettings: async () => {
    const repos = get()._repos;
    if (!repos) return;

    set({ isLoading: true, error: null });
    try {
      const settings = await repos.settings.get();
      set({ settings, isLoading: false, isHydrated: true });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load settings",
        isLoading: false,
        isHydrated: true,
      });
    }
  },

  updateSettings: async (partial) => {
    const repos = get()._repos;
    const existing = get().settings;
    if (!repos || !existing) return;

    set({ isLoading: true, error: null });
    try {
      const settings: AppSettings = {
        ...existing,
        ...partial,
        updatedAt: new Date().toISOString(),
      };
      await repos.settings.save(settings);
      set({ settings, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to update settings",
        isLoading: false,
      });
      throw err;
    }
  },
}));
