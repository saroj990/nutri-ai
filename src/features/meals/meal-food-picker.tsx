"use client";

import { useState } from "react";
import type { Food } from "@/domain/entities/food";
import { Search, Plus, Minus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFoodStore } from "@/stores/use-food-store";
import { getFoodMacros } from "@/domain/entities/food";
import { cn } from "@/lib/utils";

export interface DraftMealFood {
  foodId: string;
  foodName: string;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealFoodPickerProps {
  items: DraftMealFood[];
  onChange: (items: DraftMealFood[]) => void;
}

export function MealFoodPicker({ items, onChange }: MealFoodPickerProps) {
  const [query, setQuery] = useState("");
  const search = useFoodStore((s) => s.search);
  const searchResults = useFoodStore((s) => s.searchResults);

  const handleSearch = (value: string) => {
    setQuery(value);
    search(value, "all");
  };

  const addFood = (food: Food) => {
    const macros = getFoodMacros(food, 1);
    const existing = items.find((i) => i.foodId === food.id);
    if (existing) {
      onChange(
        items.map((i) =>
          i.foodId === food.id
            ? updateServings(i, i.servings + 1, food)
            : i,
        ),
      );
    } else {
      onChange([
        ...items,
        {
          foodId: food.id,
          foodName: food.name,
          servings: 1,
          ...macros,
        },
      ]);
    }
    setQuery("");
    search("", "all");
  };

  const updateServings = (
    item: DraftMealFood,
    servings: number,
    food?: Food,
  ): DraftMealFood => {
    const s = Math.max(0.25, servings);
    const ratio = s / item.servings;
    return {
      ...item,
      servings: s,
      calories: Math.round(item.calories * ratio),
      protein: Math.round(item.protein * ratio * 10) / 10,
      carbs: Math.round(item.carbs * ratio * 10) / 10,
      fat: Math.round(item.fat * ratio * 10) / 10,
    };
  };

  const adjustServings = (foodId: string, delta: number) => {
    onChange(
      items.map((i) =>
        i.foodId === foodId
          ? updateServings(i, i.servings + delta)
          : i,
      ),
    );
  };

  const removeItem = (foodId: string) => {
    onChange(items.filter((i) => i.foodId !== foodId));
  };

  const totals = items.reduce(
    (acc, i) => ({
      calories: acc.calories + i.calories,
      protein: acc.protein + i.protein,
      carbs: acc.carbs + i.carbs,
      fat: acc.fat + i.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search foods to add..."
          className="pl-9"
          aria-label="Search foods to add"
        />
      </div>

      {query && searchResults.length > 0 && (
        <div className="max-h-48 overflow-auto rounded-lg border bg-background shadow-sm">
          {searchResults.slice(0, 8).map((food) => (
            <button
              key={food.id}
              type="button"
              className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-muted"
              onClick={() => addFood(food)}
            >
              <span>
                {food.name}
                {food.brand && (
                  <span className="text-muted-foreground"> · {food.brand}</span>
                )}
              </span>
              <span className="text-muted-foreground">{food.calories} kcal</span>
            </button>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.foodId}
              className="flex items-center gap-3 rounded-lg border px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.foodName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.calories} kcal · P{item.protein}g C{item.carbs}g F
                  {item.fat}g
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => adjustServings(item.foodId, -0.25)}
                  aria-label="Decrease servings"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-10 text-center text-sm font-medium">
                  {item.servings}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => adjustServings(item.foodId, 0.25)}
                  aria-label="Increase servings"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.foodId)}
                className="rounded-md p-1 text-muted-foreground hover:text-destructive"
                aria-label="Remove food"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          <div
            className={cn(
              "rounded-lg bg-muted/50 px-4 py-3 text-sm",
              "flex flex-wrap justify-between gap-2",
            )}
          >
            <span className="font-semibold">Meal total</span>
            <span>
              {totals.calories} kcal · P{Math.round(totals.protein)}g · C
              {Math.round(totals.carbs)}g · F{Math.round(totals.fat)}g
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function draftToMealFoodInputs(
  items: DraftMealFood[],
): Array<{ foodId: string; servings: number }> {
  return items.map((i) => ({ foodId: i.foodId, servings: i.servings }));
}
