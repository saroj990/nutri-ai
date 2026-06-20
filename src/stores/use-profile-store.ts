import { create } from "zustand";
import type { UserProfile } from "@/domain/entities/user-profile";
import type { GoalTargets } from "@/domain/value-objects/goals";
import type { OnboardingFormData, ProfileEditFormData } from "@/domain/schemas/profile.schema";
import type { RepositoryContainer } from "@/infrastructure/di/container";
import {
  applyTargetsToProfile,
  buildProfileFromOnboarding,
  getProfileTargets,
} from "@/services/profile.service";
import { useSettingsStore } from "@/stores/use-settings-store";

interface ProfileState {
  profile: UserProfile | null;
  targets: GoalTargets | null;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  _repos: RepositoryContainer | null;

  setRepos: (repos: RepositoryContainer) => void;
  loadProfile: () => Promise<void>;
  completeOnboarding: (data: OnboardingFormData) => Promise<void>;
  updateProfile: (data: ProfileEditFormData) => Promise<void>;
  updateGoals: (
    useCustomTargets: boolean,
    custom?: Partial<GoalTargets>,
  ) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  targets: null,
  isLoading: false,
  isHydrated: false,
  error: null,
  _repos: null,

  setRepos: (repos) => set({ _repos: repos }),

  loadProfile: async () => {
    const repos = get()._repos;
    if (!repos) return;

    set({ isLoading: true, error: null });
    try {
      const profile = await repos.userProfile.get();
      set({
        profile,
        targets: getProfileTargets(profile),
        isLoading: false,
        isHydrated: true,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load profile",
        isLoading: false,
        isHydrated: true,
      });
    }
  },

  completeOnboarding: async (data) => {
    const repos = get()._repos;
    if (!repos) return;

    set({ isLoading: true, error: null });
    try {
      const profile = buildProfileFromOnboarding(data);
      await repos.userProfile.save(profile);

      const settings = await repos.settings.get();
      await repos.settings.save({
        ...settings,
        hasCompletedOnboarding: true,
        updatedAt: new Date().toISOString(),
      });

      await useSettingsStore.getState().loadSettings();

      set({
        profile,
        targets: getProfileTargets(profile),
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to save profile",
        isLoading: false,
      });
      throw err;
    }
  },

  updateProfile: async (data) => {
    const repos = get()._repos;
    const existing = get().profile;
    if (!repos || !existing) return;

    set({ isLoading: true, error: null });
    try {
      let profile: UserProfile = {
        ...existing,
        name: data.name,
        gender: data.gender,
        age: data.age,
        height: data.height,
        weight: data.weight,
        targetWeight: data.targetWeight,
        activityLevel: data.activityLevel,
        goalType: data.goalType,
        calorieAdjustment: data.calorieAdjustment,
        useCustomTargets: data.useCustomTargets,
        updatedAt: new Date().toISOString(),
      };

      profile = applyTargetsToProfile(
        profile,
        data.useCustomTargets,
        data.useCustomTargets
          ? {
              dailyCalories: data.dailyCalories,
              dailyProtein: data.dailyProtein,
              dailyCarbs: data.dailyCarbs,
              dailyFat: data.dailyFat,
              dailyWater: data.dailyWater,
            }
          : undefined,
      );

      await repos.userProfile.save(profile);
      set({
        profile,
        targets: getProfileTargets(profile),
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to update profile",
        isLoading: false,
      });
      throw err;
    }
  },

  updateGoals: async (useCustomTargets, custom) => {
    const repos = get()._repos;
    const existing = get().profile;
    if (!repos || !existing) return;

    set({ isLoading: true, error: null });
    try {
      const profile = applyTargetsToProfile(
        existing,
        useCustomTargets,
        custom,
      );
      await repos.userProfile.save(profile);
      set({
        profile,
        targets: getProfileTargets(profile),
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to update goals",
        isLoading: false,
      });
      throw err;
    }
  },
}));
