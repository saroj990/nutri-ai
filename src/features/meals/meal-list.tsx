"use client";

import type { Meal, MealType } from "@/domain/entities/meal";
import { MEAL_TYPE_LABELS } from "@/domain/entities/meal";
import { MealCard } from "./meal-card";

const MEAL_ORDER: MealType[] = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "pre_workout",
  "post_workout",
];

interface MealListProps {
  meals: Meal[];
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function MealList({ meals, onDelete, onDuplicate }: MealListProps) {
  const grouped = MEAL_ORDER.map((type) => ({
    type,
    meals: meals.filter((m) => m.mealType === type),
  })).filter((g) => g.meals.length > 0);

  if (meals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <p className="text-lg font-medium">No meals logged today</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap + to log your first meal
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map(({ type, meals: typeMeals }) => (
        <section key={type}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {MEAL_TYPE_LABELS[type]}
          </h3>
          <div className="space-y-3">
            {typeMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
