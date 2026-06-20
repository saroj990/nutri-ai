"use client";

import Link from "next/link";
import type { DietPlan } from "@/services/diet-plan.service";
import type { Meal } from "@/domain/entities/meal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MacroBar } from "@/components/shared/macro-bar";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/features/profile/constants";
import { Plus } from "lucide-react";

interface DietPlanChartProps {
  plan: DietPlan;
  consumed?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  meals?: Meal[];
  showLogLink?: boolean;
}

export function DietPlanChart({
  plan,
  consumed,
  meals = [],
  showLogLink = false,
}: DietPlanChartProps) {
  const consumedByType = meals.reduce(
    (acc, meal) => {
      const slot = acc[meal.mealType] ?? {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };
      acc[meal.mealType] = {
        calories: slot.calories + meal.totalCalories,
        protein: slot.protein + meal.totalProtein,
        carbs: slot.carbs + meal.totalCarbs,
        fat: slot.fat + meal.totalFat,
      };
      return acc;
    },
    {} as Record<string, { calories: number; protein: number; carbs: number; fat: number }>,
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Daily diet chart</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{plan.summary}</p>
          <div className="rounded-xl border bg-primary/5 p-4 text-center">
            <p className="text-sm text-muted-foreground">Daily calorie target</p>
            <p className="text-4xl font-bold text-primary">
              {formatNumber(plan.targets.dailyCalories)}
            </p>
            <p className="text-sm text-muted-foreground">kcal / day</p>
          </div>
          {consumed && (
            <div className="space-y-3">
              <MacroBar
                label="Calories"
                consumed={consumed.calories}
                goal={plan.targets.dailyCalories}
                unit=" kcal"
              />
              <MacroBar
                label="Protein"
                consumed={consumed.protein}
                goal={plan.targets.dailyProtein}
              />
              <MacroBar
                label="Carbs"
                consumed={consumed.carbs}
                goal={plan.targets.dailyCarbs}
              />
              <MacroBar
                label="Fat"
                consumed={consumed.fat}
                goal={plan.targets.dailyFat}
              />
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-lg border p-2">
              <p className="text-muted-foreground">Protein</p>
              <p className="font-semibold">{plan.targets.dailyProtein}g</p>
            </div>
            <div className="rounded-lg border p-2">
              <p className="text-muted-foreground">Carbs</p>
              <p className="font-semibold">{plan.targets.dailyCarbs}g</p>
            </div>
            <div className="rounded-lg border p-2">
              <p className="text-muted-foreground">Fat</p>
              <p className="font-semibold">{plan.targets.dailyFat}g</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Meal breakdown</CardTitle>
          {showLogLink && (
            <Button asChild size="sm" variant="outline">
              <Link href="/log/new">
                <Plus className="h-4 w-4" />
                Log meal
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {plan.meals.map((slot) => {
            const logged = consumedByType[slot.mealType];
            return (
              <div
                key={slot.mealType}
                className="rounded-lg border p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{slot.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Target: {formatNumber(slot.calories)} kcal · {slot.protein}g P ·{" "}
                      {slot.carbs}g C · {slot.fat}g F
                    </p>
                  </div>
                  {logged && logged.calories > 0 && (
                    <div className="text-right text-sm">
                      <p className="font-semibold text-primary">
                        {formatNumber(logged.calories)} kcal
                      </p>
                      <p className="text-xs text-muted-foreground">logged</p>
                    </div>
                  )}
                </div>
                {logged && logged.calories > 0 && (
                  <MacroBar
                    label="Progress"
                    consumed={logged.calories}
                    goal={slot.calories}
                    unit=" kcal"
                    className="mt-2"
                  />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
