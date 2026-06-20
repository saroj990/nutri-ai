import { create } from "zustand";
import type { Food } from "@/domain/entities/food";
import type { FoodFormData } from "@/domain/schemas/food.schema";
import type { RepositoryContainer } from "@/infrastructure/di/container";
import type { FoodTagFilter } from "@/lib/constants";
import { createFoodId } from "@/domain/value-objects/ids";
import { searchService } from "@/services/search.service";
import { SeedDataService } from "@/services/seed-data.service";

interface FoodState {
  foods: Food[];
  searchResults: Food[];
  recentFoodIds: string[];
  searchTerm: string;
  activeTag: FoodTagFilter;
  selectedFoodId: string | null;
  isLoading: boolean;
  isSeeding: boolean;
  isHydrated: boolean;
  totalCount: number;
  error: string | null;
  _repos: RepositoryContainer | null;

  setRepos: (repos: RepositoryContainer) => void;
  initialize: () => Promise<void>;
  loadFoods: () => Promise<void>;
  search: (term?: string, tag?: FoodTagFilter) => void;
  setActiveTag: (tag: FoodTagFilter) => void;
  selectFood: (id: string | null) => void;
  getFoodById: (id: string) => Food | undefined;
  saveFood: (data: FoodFormData, id?: string) => Promise<Food>;
  deleteFood: (id: string) => Promise<void>;
  duplicateFood: (id: string) => Promise<Food>;
  toggleFavorite: (id: string) => Promise<void>;
  trackRecent: (id: string) => Promise<void>;
}

function buildSearchOptions(
  term: string,
  tag: FoodTagFilter,
  recentFoodIds: string[],
) {
  const options: Parameters<typeof searchService.search>[0] = { term };

  switch (tag) {
    case "favorites":
      options.favoritesOnly = true;
      break;
    case "recent":
      options.recentIds = recentFoodIds;
      break;
    case "custom":
      options.customOnly = true;
      break;
    case "all":
      break;
    default:
      options.tags = [tag];
      break;
  }

  return options;
}

export const useFoodStore = create<FoodState>((set, get) => ({
  foods: [],
  searchResults: [],
  recentFoodIds: [],
  searchTerm: "",
  activeTag: "all",
  selectedFoodId: null,
  isLoading: false,
  isSeeding: false,
  isHydrated: false,
  totalCount: 0,
  error: null,
  _repos: null,

  setRepos: (repos) => set({ _repos: repos }),

  initialize: async () => {
    const repos = get()._repos;
    if (!repos || get().isHydrated) return;

    set({ isSeeding: true, error: null });
    try {
      const seedService = new SeedDataService(repos.food, repos.settings);
      await seedService.seedIfNeeded();
      await get().loadFoods();
      await seedService.rebuildSearchIndex();
      set({ isSeeding: false, isHydrated: true });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to initialize foods",
        isSeeding: false,
        isHydrated: true,
      });
    }
  },

  loadFoods: async () => {
    const repos = get()._repos;
    if (!repos) return;

    set({ isLoading: true, error: null });
    try {
      const [foods, recentFoods] = await Promise.all([
        repos.food.getAll(),
        repos.food.getRecent(30),
      ]);
      const recentFoodIds = recentFoods.map((f) => f.id);
      searchService.buildIndex(foods);
      const searchResults = searchService.search(
        buildSearchOptions(get().searchTerm, get().activeTag, recentFoodIds),
      );
      set({
        foods,
        searchResults,
        recentFoodIds,
        totalCount: foods.length,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load foods",
        isLoading: false,
      });
    }
  },

  search: (term, tag) => {
    const searchTerm = term ?? get().searchTerm;
    const activeTag = tag ?? get().activeTag;
    const searchResults = searchService.search(
      buildSearchOptions(searchTerm, activeTag, get().recentFoodIds),
    );
    set({ searchTerm, activeTag, searchResults });
  },

  setActiveTag: (tag) => {
    get().search(get().searchTerm, tag);
  },

  selectFood: (id) => set({ selectedFoodId: id }),

  getFoodById: (id) => get().foods.find((f) => f.id === id),

  saveFood: async (data, id) => {
    const repos = get()._repos;
    if (!repos) throw new Error("Repositories not initialized");

    const now = new Date().toISOString();
    const existing = id ? get().getFoodById(id) : undefined;

    const food: Food = {
      id: (id as Food["id"]) ?? createFoodId(),
      name: data.name,
      brand: data.brand || undefined,
      servingSize: data.servingSize,
      servingUnit: data.servingUnit,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      fiber: data.fiber,
      sugar: data.sugar,
      sodium: data.sodium,
      isFavorite: data.isFavorite ?? existing?.isFavorite ?? false,
      tags: data.tags ?? [],
      isCustom: true,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await repos.food.save(food);
    await get().loadFoods();
    get().search(get().searchTerm, get().activeTag);
    return food;
  },

  deleteFood: async (id) => {
    const repos = get()._repos;
    if (!repos) return;

    await repos.food.delete(id);
    set({ selectedFoodId: null });
    await get().loadFoods();
    get().search(get().searchTerm, get().activeTag);
  },

  duplicateFood: async (id) => {
    const food = get().getFoodById(id);
    if (!food) throw new Error("Food not found");

    return get().saveFood(
      {
        name: `${food.name} (Copy)`,
        brand: food.brand,
        servingSize: food.servingSize,
        servingUnit: food.servingUnit,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
        sugar: food.sugar,
        sodium: food.sodium,
        tags: [...food.tags],
        isFavorite: false,
      },
    );
  },

  toggleFavorite: async (id) => {
    const repos = get()._repos;
    const food = get().getFoodById(id);
    if (!repos || !food) return;

    await repos.food.save({
      ...food,
      isFavorite: !food.isFavorite,
      updatedAt: new Date().toISOString(),
    });
    await get().loadFoods();
    get().search(get().searchTerm, get().activeTag);
  },

  trackRecent: async (id) => {
    const repos = get()._repos;
    if (!repos) return;
    await repos.food.trackRecent(id);
    const recentFoods = await repos.food.getRecent(30);
    set({ recentFoodIds: recentFoods.map((f) => f.id) });
  },
}));
