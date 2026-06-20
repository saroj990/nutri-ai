import type { UserProfileId } from "@/domain/value-objects/ids";

export const DEFAULT_USER_PROFILE_ID = "default" as UserProfileId;

export const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "LayoutDashboard" as const },
  { href: "/plan", label: "My Plan", icon: "Target" as const },
  { href: "/log", label: "Log", icon: "Plus" as const },
  { href: "/foods", label: "Foods", icon: "Apple" as const },
  { href: "/analytics", label: "Stats", icon: "BarChart3" as const },
  { href: "/settings", label: "Settings", icon: "Settings" as const },
] as const;

export const TRACKING_NAV_ITEMS = [
  { href: "/water", label: "Water", icon: "Droplets" as const },
  { href: "/weight", label: "Weight", icon: "Scale" as const },
] as const;

export const ENGAGEMENT_NAV_ITEMS = [
  { href: "/achievements", label: "Achievements", icon: "Trophy" as const },
  { href: "/reports", label: "Reports", icon: "FileText" as const },
] as const;

export const FOOD_TAGS = [
  { id: "all", label: "All" },
  { id: "favorites", label: "Favorites" },
  { id: "recent", label: "Recent" },
  { id: "indian", label: "Indian" },
  { id: "international", label: "International" },
  { id: "protein", label: "Protein" },
  { id: "carb", label: "Carbs" },
  { id: "vegetable", label: "Vegetables" },
  { id: "fruit", label: "Fruits" },
  { id: "dairy", label: "Dairy" },
  { id: "snack", label: "Snacks" },
  { id: "custom", label: "My Foods" },
] as const;

export type FoodTagFilter = (typeof FOOD_TAGS)[number]["id"];
