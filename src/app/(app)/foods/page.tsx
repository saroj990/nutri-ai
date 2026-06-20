"use client";

import { Suspense, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/shared/app-shell";
import { Button } from "@/components/ui/button";
import { FoodSearchBar } from "@/features/foods/food-search-bar";
import { VirtualFoodList } from "@/features/foods/virtual-food-list";
import { FoodDetailPanel } from "@/features/foods/food-detail-panel";
import { useFoodStore } from "@/stores/use-food-store";

function FoodsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const foods = useFoodStore((s) => s.foods);
  const searchResults = useFoodStore((s) => s.searchResults);
  const selectFood = useFoodStore((s) => s.selectFood);
  const toggleFavorite = useFoodStore((s) => s.toggleFavorite);
  const isLoading = useFoodStore((s) => s.isLoading);

  const paramSelected = searchParams.get("selected");
  const storeSelectedId = useFoodStore((s) => s.selectedFoodId);
  const effectiveSelectedId = storeSelectedId ?? paramSelected;

  useEffect(() => {
    if (paramSelected) {
      selectFood(paramSelected);
    }
  }, [paramSelected, selectFood]);

  const selectedFood = useMemo(
    () => foods.find((f) => f.id === effectiveSelectedId) ?? null,
    [foods, effectiveSelectedId],
  );

  const handleSelect = useCallback(
    (food: { id: string }) => {
      selectFood(food.id);
      if (window.innerWidth < 1024) {
        router.push(`/foods/${food.id}`);
      }
    },
    [selectFood, router],
  );

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(320px,420px)_1fr] lg:gap-6">
      <div className="flex flex-col gap-4">
        <FoodSearchBar />
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <VirtualFoodList
            foods={searchResults}
            selectedId={effectiveSelectedId}
            onSelect={handleSelect}
            onToggleFavorite={(id) => void toggleFavorite(id)}
          />
        )}
      </div>
      <div className="hidden lg:block">
        <FoodDetailPanel food={selectedFood} />
      </div>
    </div>
  );
}

export default function FoodsPage() {
  return (
    <AppShell
      title="Food Library"
      description="Search and manage foods"
      wide
      actions={
        <Button asChild size="sm">
          <Link href="/foods/new">
            <Plus className="h-4 w-4" />
            Add Food
          </Link>
        </Button>
      }
    >
      <Suspense
        fallback={
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        }
      >
        <FoodsPageContent />
      </Suspense>
    </AppShell>
  );
}
