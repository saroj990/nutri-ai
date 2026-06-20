"use client";

import { useRef, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Food } from "@/domain/entities/food";
import { FoodListItem } from "./food-list-item";

interface VirtualFoodListProps {
  foods: Food[];
  selectedId: string | null;
  onSelect: (food: Food) => void;
  onToggleFavorite: (id: string) => void;
  emptyMessage?: string;
}

export function VirtualFoodList({
  foods,
  selectedId,
  onSelect,
  onToggleFavorite,
  emptyMessage = "No foods found",
}: VirtualFoodListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: foods.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 88,
    overscan: 8,
  });

  const handleSelect = useCallback(
    (food: Food) => onSelect(food),
    [onSelect],
  );

  if (foods.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-full min-h-[320px] overflow-auto rounded-lg lg:min-h-[calc(100vh-280px)]"
    >
      <div
        style={{ height: `${virtualizer.getTotalSize()}px` }}
        className="relative w-full"
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const food = foods[virtualRow.index];
          if (!food) return null;
          return (
            <div
              key={food.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="pb-2"
            >
              <FoodListItem
                food={food}
                isSelected={selectedId === food.id}
                onSelect={handleSelect}
                onToggleFavorite={onToggleFavorite}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
