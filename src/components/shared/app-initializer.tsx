"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useRepositories } from "@/infrastructure/di/repository-context";
import { useAuthStore } from "@/stores/use-auth-store";
import { useProfileStore } from "@/stores/use-profile-store";
import { useSettingsStore } from "@/stores/use-settings-store";
import { useFoodStore } from "@/stores/use-food-store";
import { useDashboardStore } from "@/stores/use-dashboard-store";
import { useMealStore } from "@/stores/use-meal-store";
import { useGamificationStore } from "@/stores/use-gamification-store";
import { useWaterStore } from "@/stores/use-water-store";
import { useWeightStore } from "@/stores/use-weight-store";
import { useAnalyticsStore } from "@/stores/use-analytics-store";
import { useReportStore } from "@/stores/use-report-store";

function isPublicPath(pathname: string): boolean {
  return pathname.startsWith("/login") || pathname.startsWith("/sys/reset");
}

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const repos = useRepositories();
  const router = useRouter();
  const pathname = usePathname();

  const setAuthRepos = useAuthStore((s) => s.setRepos);
  const initializeAuth = useAuthStore((s) => s.initialize);
  const authHydrated = useAuthStore((s) => s.isHydrated);
  const session = useAuthStore((s) => s.session);
  const isAuthenticated = session != null;

  const setProfileRepos = useProfileStore((s) => s.setRepos);
  const setSettingsRepos = useSettingsStore((s) => s.setRepos);
  const setFoodRepos = useFoodStore((s) => s.setRepos);
  const setDashboardRepos = useDashboardStore((s) => s.setRepos);
  const setMealRepos = useMealStore((s) => s.setRepos);
  const setGamificationRepos = useGamificationStore((s) => s.setRepos);
  const setWaterRepos = useWaterStore((s) => s.setRepos);
  const setWeightRepos = useWeightStore((s) => s.setRepos);
  const setAnalyticsRepos = useAnalyticsStore((s) => s.setRepos);
  const setReportRepos = useReportStore((s) => s.setRepos);
  const loadProfile = useProfileStore((s) => s.loadProfile);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const initializeFoods = useFoodStore((s) => s.initialize);
  const loadToday = useDashboardStore((s) => s.loadToday);
  const loadGamification = useGamificationStore((s) => s.load);
  const loadWater = useWaterStore((s) => s.load);
  const loadWeight = useWeightStore((s) => s.load);
  const loadAnalytics = useAnalyticsStore((s) => s.load);
  const loadReports = useReportStore((s) => s.load);
  const profileHydrated = useProfileStore((s) => s.isHydrated);
  const settingsHydrated = useSettingsStore((s) => s.isHydrated);
  const foodsHydrated = useFoodStore((s) => s.isHydrated);
  const isSeeding = useFoodStore((s) => s.isSeeding);
  const hasCompletedOnboarding = useSettingsStore(
    (s) => s.settings?.hasCompletedOnboarding,
  );

  useEffect(() => {
    setAuthRepos(repos);
    void initializeAuth();
  }, [repos, setAuthRepos, initializeAuth]);

  useEffect(() => {
    if (!authHydrated || !isAuthenticated) return;

    setProfileRepos(repos);
    setSettingsRepos(repos);
    setFoodRepos(repos);
    setDashboardRepos(repos);
    setMealRepos(repos);
    setGamificationRepos(repos);
    setWaterRepos(repos);
    setWeightRepos(repos);
    setAnalyticsRepos(repos);
    setReportRepos(repos);
    void loadProfile();
    void loadSettings();
    void initializeFoods();
  }, [
    authHydrated,
    isAuthenticated,
    repos,
    setProfileRepos,
    setSettingsRepos,
    setFoodRepos,
    setDashboardRepos,
    setMealRepos,
    setGamificationRepos,
    setWaterRepos,
    setWeightRepos,
    setAnalyticsRepos,
    setReportRepos,
    loadProfile,
    loadSettings,
    initializeFoods,
  ]);

  useEffect(() => {
    if (!authHydrated || !isAuthenticated) return;
    if (!profileHydrated || !settingsHydrated || !foodsHydrated) return;
    if (!hasCompletedOnboarding) return;
    void loadToday();
    void loadGamification();
    void loadWater();
    void loadWeight();
    void loadAnalytics();
    void loadReports();
  }, [
    authHydrated,
    isAuthenticated,
    profileHydrated,
    settingsHydrated,
    foodsHydrated,
    hasCompletedOnboarding,
    loadToday,
    loadGamification,
    loadWater,
    loadWeight,
    loadAnalytics,
    loadReports,
  ]);

  useEffect(() => {
    if (!authHydrated) return;

    const isPublic = isPublicPath(pathname);

    if (!isAuthenticated && !isPublic) {
      router.replace("/login");
      return;
    }

    if (isAuthenticated && pathname.startsWith("/login")) {
      router.replace("/");
      return;
    }

    if (!isAuthenticated || !settingsHydrated) return;

    const isOnboarding = pathname.startsWith("/onboarding");

    if (!hasCompletedOnboarding && !isOnboarding && !isPublic) {
      router.replace("/onboarding");
    } else if (hasCompletedOnboarding && isOnboarding) {
      router.replace("/");
    }
  }, [
    authHydrated,
    isAuthenticated,
    settingsHydrated,
    hasCompletedOnboarding,
    pathname,
    router,
  ]);

  const isPublic = isPublicPath(pathname);
  const canRenderBeforeFoods =
    isPublic ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/settings");

  if (!authHydrated) {
    if (isPublic) {
      return <>{children}</>;
    }

    return (
      <div className="flex min-h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading NutriAI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  if (
    !profileHydrated ||
    !settingsHydrated ||
    (!foodsHydrated && !canRenderBeforeFoods)
  ) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            {isSeeding ? "Loading food database..." : "Loading NutriAI..."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
