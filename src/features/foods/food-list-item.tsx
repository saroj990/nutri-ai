"use client";

import type { Food } from "@/domain/entities/food";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface FoodListItemProps {
  food: Food;
  isSelected?: boolean;
  onSelect: (food: Food) => void;
  onToggleFavorite: (id: string) => void;
}

export function FoodListItem({
  food,
  isSelected,
  onSelect,
  onToggleFavorite,
}: FoodListItemProps) {
  return (
    <div
      className={cn(
        "group flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 transition-colors hover:bg-muted/50",
        isSelected && "border-primary bg-primary/5",
      )}
      onClick={() => onSelect(food)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(food);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{food.name}</p>
          {food.isCustom && (
            <Badge variant="outline" className="shrink-0 text-[10px]">
              Custom
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {food.brand ? `${food.brand} · ` : ""}
          {food.calories} kcal · {food.servingSize}
          {food.servingUnit}
        </p>
        <p className="text-xs text-muted-foreground">
          P {food.protein}g · C {food.carbs}g · F {food.fat}g
        </p>
      </div>
      <button
        type="button"
        className="shrink-0 rounded-md p-1.5 hover:bg-muted"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(food.id);
        }}
        aria-label={food.isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Star
          className={cn(
            "h-4 w-4",
            food.isFavorite
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground",
          )}
        />
      </button>
    </div>
  );
}
