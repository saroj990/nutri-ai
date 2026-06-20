"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shared/app-shell";
import { QuickLogFab } from "@/components/shared/quick-log-fab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalorieRing } from "@/components/shared/calorie-ring";
import { MacroBar } from "@/components/shared/macro-bar";
import { MealCard } from "@/features/meals/meal-card";
import { WaterTracker } from "@/features/water/water-tracker";
import { XpBar } from "@/features/gamification/xp-bar";
import { useProfileStore } from "@/stores/use-profile-store";
import { useDashboardStore } from "@/stores/use-dashboard-store";
import { useGamificationStore } from "@/stores/use-gamification-store";
import { useMealStore } from "@/stores/use-meal-store";
import { useWaterStore } from "@/stores/use-water-store";
import { formatNumber } from "@/features/profile/constants";
import { Flame, Droplets, ChevronRight, Target } from "lucide-react";
import { GOAL_OPTIONS } from "@/features/profile/constants";
import { buildDietPlan } from "@/services/diet-plan.service";
import { toast } from "sonner";

export default function DashboardPage() {
  const profile = useProfileStore((s) => s.profile);
  const summary = useDashboardStore((s) => s.summary);
  const loadToday = useDashboardStore((s) => s.loadToday);
  const gamification = useGamificationStore((s) => s.state);
  const loadGamification = useGamificationStore((s) => s.load);
  const deleteMeal = useMealStore((s) => s.deleteMeal);
  const duplicateMeal = useMealStore((s) => s.duplicateMeal);
  const loadMeals = useMealStore((s) => s.loadMeals);
  const loadWater = useWaterStore((s) => s.load);

  useEffect(() => {
    void loadToday();
    void loadGamification();
    void loadMeals();
    void loadWater();
  }, [loadToday, loadGamification, loadMeals, loadWater]);

  const consumed = summary?.consumed ?? {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    water: 0,
  };
  const targets = summary?.targets;
  const calorieGoal = targets?.dailyCalories ?? 2000;
  const proteinGoal = targets?.dailyProtein ?? 150;
  const carbsGoal = targets?.dailyCarbs ?? 200;
  const fatGoal = targets?.dailyFat ?? 67;
  const waterGoal = targets?.dailyWater ?? 2500;
  const recentMeals = summary?.meals.slice(-3).reverse() ?? [];

  const greeting = profile?.name ? `Hi, ${profile.name}` : "NutriAI";
  const goalLabel = profile
    ? GOAL_OPTIONS.find((g) => g.value === profile.goalType)?.label
    : null;
  const plan = profile ? buildDietPlan(profile) : null;

  return (
    <>
      <AppShell
        title={greeting}
        description={
          goalLabel
            ? `${goalLabel} plan · ${formatNumber(plan?.targets.dailyCalories ?? calorieGoal)} kcal`
            : "Today's overview"
        }
        actions={
          <Link
            href="/plan"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <Target className="h-4 w-4" />
            My Plan
          </Link>
        }
      >
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 xl:grid-cols-[1fr_1fr]">
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Calories</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:justify-around">
              <CalorieRing
                consumed={consumed.calories}
                goal={calorieGoal}
                size={180}
              />
              <div className="space-y-3 sm:max-w-xs sm:flex-1">
                <div className="grid grid-cols-2 gap-3 text-center text-sm">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-muted-foreground">Consumed</p>
                    <p className="text-xl font-bold">
                      {formatNumber(consumed.calories)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-3">
                    <p className="text-muted-foreground">Goal</p>
                    <p className="text-xl font-bold text-primary">
                      {formatNumber(calorieGoal)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Macros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MacroBar
                label="Protein"
                consumed={consumed.protein}
                goal={proteinGoal}
              />
              <MacroBar
                label="Carbs"
                consumed={consumed.carbs}
                goal={carbsGoal}
              />
              <MacroBar
                label="Fat"
                consumed={consumed.fat}
                goal={fatGoal}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3 lg:col-span-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Flame className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {gamification?.currentStreak ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Day streak</p>
                </div>
              </CardContent>
            </Card>
            <Link href="/water" className="block transition-opacity hover:opacity-90">
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <Droplets className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {formatNumber(consumed.water)} ml
                    </p>
                    <p className="text-xs text-muted-foreground">
                      / {formatNumber(waterGoal)} ml
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Card className="col-span-2">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Level</p>
                  <p className="text-2xl font-bold">
                    {gamification?.level ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {gamification?.totalXP ?? 0} XP total
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Meals today</p>
                  <p className="text-2xl font-bold">{summary?.mealCount ?? 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {gamification && <XpBar state={gamification} showLink />}
          </div>

          <div className="lg:col-span-2">
            <WaterTracker compact />
          </div>

          {recentMeals.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Recent Meals</CardTitle>
                <Link
                  href="/log"
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  View all
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentMeals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    compact
                    onDelete={async (id) => {
                      try {
                        await deleteMeal(id);
                        toast.success("Meal deleted");
                        void loadToday();
                      } catch {
                        toast.error("Failed to delete");
                      }
                    }}
                    onDuplicate={async (id) => {
                      try {
                        await duplicateMeal(id);
                        toast.success("Meal duplicated");
                        void loadToday();
                      } catch {
                        toast.error("Failed to duplicate");
                      }
                    }}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </AppShell>
      <QuickLogFab />
    </>
  );
}
