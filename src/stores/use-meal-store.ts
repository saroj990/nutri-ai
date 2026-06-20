import { create } from "zustand";
import type { Meal } from "@/domain/entities/meal";
import type { MealTemplate } from "@/domain/entities/meal-template";
import type { LogMealInput } from "@/services/meal-logging.service";
import { createMealLoggingService } from "@/services/meal-logging.service";
import type { RepositoryContainer } from "@/infrastructure/di/container";
import type { DateString } from "@/domain/value-objects/date";
import { toDateString } from "@/domain/value-objects/date";
import type { MealFoodItemInput } from "@/domain/schemas/meal.schema";
import type { MealType } from "@/domain/entities/meal";
import { useDashboardStore } from "@/stores/use-dashboard-store";
import { useGamificationStore } from "@/stores/use-gamification-store";

interface MealState {
  meals: Meal[];
  templates: MealTemplate[];
  selectedDate: string;
  isLoading: boolean;
  error: string | null;
  _repos: RepositoryContainer | null;

  setRepos: (repos: RepositoryContainer) => void;
  loadMeals: (date?: string) => Promise<void>;
  loadTemplates: () => Promise<void>;
  logMeal: (input: LogMealInput) => Promise<Meal>;
  deleteMeal: (id: string) => Promise<void>;
  duplicateMeal: (id: string, targetDate?: DateString) => Promise<Meal>;
  saveTemplate: (
    name: string,
    mealType: MealType,
    foods: MealFoodItemInput[],
  ) => Promise<MealTemplate>;
  useTemplate: (templateId: string, date?: DateString) => Promise<Meal>;
  fetchMeal: (id: string) => Promise<Meal | null>;
}

export const useMealStore = create<MealState>((set, get) => ({
  meals: [],
  templates: [],
  selectedDate: toDateString(),
  isLoading: false,
  error: null,
  _repos: null,

  setRepos: (repos) => set({ _repos: repos }),

  loadMeals: async (date) => {
    const repos = get()._repos;
    if (!repos) return;

    const targetDate = date ?? get().selectedDate;
    set({ isLoading: true, error: null, selectedDate: targetDate });
    try {
      const meals = await repos.meal.getByDate(targetDate);
      set({ meals, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load meals",
        isLoading: false,
      });
    }
  },

  loadTemplates: async () => {
    const repos = get()._repos;
    if (!repos) return;

    const templates = await repos.meal.getTemplates();
    set({ templates });
  },

  logMeal: async (input) => {
    const repos = get()._repos;
    if (!repos) throw new Error("Repositories not initialized");

    set({ isLoading: true, error: null });
    try {
      const service = createMealLoggingService(repos);
      const meal = await service.logMeal(input);
      await get().loadMeals(input.date);
      await useDashboardStore.getState().refresh();
      await useGamificationStore.getState().load();
      set({ isLoading: false });
      return meal;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to log meal",
        isLoading: false,
      });
      throw err;
    }
  },

  deleteMeal: async (id) => {
    const repos = get()._repos;
    if (!repos) return;

    set({ isLoading: true });
    try {
      const service = createMealLoggingService(repos);
      await service.deleteMeal(id);
      await get().loadMeals();
      await useDashboardStore.getState().refresh();
      set({ isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to delete meal",
        isLoading: false,
      });
      throw err;
    }
  },

  duplicateMeal: async (id, targetDate) => {
    const repos = get()._repos;
    if (!repos) throw new Error("Repositories not initialized");

    const service = createMealLoggingService(repos);
    const meal = await service.duplicateMeal(
      id,
      targetDate ?? (toDateString() as DateString),
    );
    await get().loadMeals(meal.date);
    await useDashboardStore.getState().refresh();
    await useGamificationStore.getState().load();
    return meal;
  },

  saveTemplate: async (name, mealType, foods) => {
    const repos = get()._repos;
    if (!repos) throw new Error("Repositories not initialized");

    const service = createMealLoggingService(repos);
    const template = await service.saveTemplate(name, mealType, foods);
    await get().loadTemplates();
    return template;
  },

  useTemplate: async (templateId, date) => {
    const repos = get()._repos;
    if (!repos) throw new Error("Repositories not initialized");

    const service = createMealLoggingService(repos);
    const meal = await service.instantiateTemplate(
      templateId,
      date ?? (toDateString() as DateString),
    );
    await get().loadMeals(meal.date);
    await useDashboardStore.getState().refresh();
    await useGamificationStore.getState().load();
    return meal;
  },

  fetchMeal: async (id) => {
    const repos = get()._repos;
    if (!repos) return null;
    return repos.meal.getById(id);
  },
}));
