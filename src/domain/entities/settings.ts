import type { MealType } from "./meal";

export type ThemeMode = "light" | "dark" | "system";

export interface Reminder {
  id: string;
  type: "water" | "meal" | "weight";
  label: string;
  time: string;
  enabled: boolean;
  daysOfWeek: number[];
}

export interface AppSettings {
  theme: ThemeMode;
  waterQuickAdds: number[];
  defaultMealType: MealType;
  reminders: Reminder[];
  hasCompletedOnboarding: boolean;
  hasSeededData: boolean;
  locale: string;
  updatedAt: string;
}

export const DEFAULT_SETTINGS: Omit<AppSettings, "updatedAt"> = {
  theme: "system",
  waterQuickAdds: [250, 500, 1000],
  defaultMealType: "breakfast",
  reminders: [],
  hasCompletedOnboarding: false,
  hasSeededData: false,
  locale: "en",
};
