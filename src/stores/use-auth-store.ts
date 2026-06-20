import { create } from "zustand";
import type { AuthSession } from "@/domain/entities/local-auth";
import type { RepositoryContainer } from "@/infrastructure/di/container";
import { createLocalAuthService } from "@/services/local-auth.service";

interface AuthState {
  session: AuthSession | null;
  hasAccount: boolean;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  _repos: RepositoryContainer | null;

  setRepos: (repos: RepositoryContainer) => void;
  initialize: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  hasAccount: false,
  isHydrated: false,
  isLoading: false,
  error: null,
  _repos: null,

  setRepos: (repos) => set({ _repos: repos }),

  initialize: async () => {
    const repos = get()._repos;
    if (!repos) return;

    try {
      const service = createLocalAuthService(repos.localAuth);
      const hasAccount = await service.hasAccount();
      const session = service.getSession();

      set({
        hasAccount,
        session,
        isHydrated: true,
        error: null,
      });
    } catch (err) {
      set({
        hasAccount: false,
        session: null,
        isHydrated: true,
        error: err instanceof Error ? err.message : "Failed to initialize auth",
      });
    }
  },

  register: async (email, password) => {
    const repos = get()._repos;
    if (!repos) return;

    set({ isLoading: true, error: null });
    try {
      const service = createLocalAuthService(repos.localAuth);
      const session = await service.register(email, password);
      set({
        session,
        hasAccount: true,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Registration failed",
        isLoading: false,
      });
      throw err;
    }
  },

  login: async (email, password) => {
    const repos = get()._repos;
    if (!repos) return;

    set({ isLoading: true, error: null });
    try {
      const service = createLocalAuthService(repos.localAuth);
      const session = await service.login(email, password);
      set({
        session,
        hasAccount: true,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Login failed",
        isLoading: false,
      });
      throw err;
    }
  },

  logout: () => {
    const repos = get()._repos;
    if (repos) {
      createLocalAuthService(repos.localAuth).logout();
    }
    set({ session: null, error: null });
  },
}));
