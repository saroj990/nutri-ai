"use client";

import { useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/shared/app-shell";
import { QuickLogFab } from "@/components/shared/quick-log-fab";
import { Button } from "@/components/ui/button";
import { MealList } from "@/features/meals/meal-list";
import { TemplateList } from "@/features/meals/template-list";
import { MacroBar } from "@/components/shared/macro-bar";
import { Card, CardContent } from "@/components/ui/card";
import { useMealStore } from "@/stores/use-meal-store";
import { useDashboardStore } from "@/stores/use-dashboard-store";
import { formatNumber } from "@/features/profile/constants";

export default function LogPage() {
  const meals = useMealStore((s) => s.meals);
  const loadMeals = useMealStore((s) => s.loadMeals);
  const loadTemplates = useMealStore((s) => s.loadTemplates);
  const templates = useMealStore((s) => s.templates);
  const deleteMeal = useMealStore((s) => s.deleteMeal);
  const duplicateMeal = useMealStore((s) => s.duplicateMeal);
  const summary = useDashboardStore((s) => s.summary);
  const loadToday = useDashboardStore((s) => s.loadToday);

  useEffect(() => {
    void loadMeals();
    void loadTemplates();
    void loadToday();
  }, [loadMeals, loadTemplates, loadToday]);

  const handleDelete = async (id: string) => {
    try {
      await deleteMeal(id);
      toast.success("Meal deleted");
    } catch {
      toast.error("Failed to delete meal");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateMeal(id);
      toast.success("Meal duplicated");
    } catch {
      toast.error("Failed to duplicate meal");
    }
  };

  const consumed = summary?.consumed;
  const targets = summary?.targets;

  return (
    <>
      <AppShell
        title="Today's Log"
        description={`${meals.length} meals logged`}
        wide
        actions={
          <Button asChild size="sm">
            <Link href="/log/new">
              <Plus className="h-4 w-4" />
              Log Meal
            </Link>
          </Button>
        }
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {targets && consumed && (
              <Card className="lg:hidden">
                <CardContent className="space-y-3 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Calories</span>
                    <span>
                      {formatNumber(consumed.calories)} /{" "}
                      {formatNumber(targets.dailyCalories)} kcal
                    </span>
                  </div>
                  <MacroBar
                    label="Protein"
                    consumed={consumed.protein}
                    goal={targets.dailyProtein}
                  />
                  <MacroBar
                    label="Carbs"
                    consumed={consumed.carbs}
                    goal={targets.dailyCarbs}
                  />
                  <MacroBar
                    label="Fat"
                    consumed={consumed.fat}
                    goal={targets.dailyFat}
                  />
                </CardContent>
              </Card>
            )}
            <MealList
              meals={meals}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          </div>
          <aside className="space-y-4">
            {targets && consumed && (
              <Card className="hidden lg:block">
                <CardContent className="space-y-4 p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {formatNumber(consumed.calories)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      of {formatNumber(targets.dailyCalories)} kcal
                    </p>
                  </div>
                  <MacroBar
                    label="Protein"
                    consumed={consumed.protein}
                    goal={targets.dailyProtein}
                  />
                  <MacroBar
                    label="Carbs"
                    consumed={consumed.carbs}
                    goal={targets.dailyCarbs}
                  />
                  <MacroBar
                    label="Fat"
                    consumed={consumed.fat}
                    goal={targets.dailyFat}
                  />
                </CardContent>
              </Card>
            )}
            <TemplateList templates={templates} />
          </aside>
        </div>
      </AppShell>
      <QuickLogFab />
    </>
  );
}
