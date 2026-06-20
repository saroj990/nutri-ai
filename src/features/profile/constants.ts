import type {
  ActivityLevel,
  Gender,
  GoalType,
} from "@/domain/entities/user-profile";

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; description: string }[] = [
  { value: "sedentary", label: "Sedentary", description: "Little or no exercise" },
  { value: "light", label: "Light", description: "Exercise 1–3 days/week" },
  { value: "moderate", label: "Moderate", description: "Exercise 3–5 days/week" },
  { value: "active", label: "Active", description: "Exercise 6–7 days/week" },
  { value: "very_active", label: "Very Active", description: "Intense daily exercise or physical job" },
];

export const GOAL_OPTIONS: { value: GoalType; label: string; description: string; shortLabel: string }[] = [
  {
    value: "weight_loss",
    label: "Lose Weight",
    shortLabel: "Cut",
    description: "Calorie deficit to burn fat and get leaner",
  },
  {
    value: "maintenance",
    label: "Stay Fit",
    shortLabel: "Lean",
    description: "Balanced nutrition to maintain your physique",
  },
  {
    value: "weight_gain",
    label: "Bulk Up",
    shortLabel: "Bulk",
    description: "Calorie surplus to build muscle and mass",
  },
];

export function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(Math.round(n));
}
