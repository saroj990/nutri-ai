"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { FoodForm } from "@/features/foods/food-form";
import { FoodDetailPanel } from "@/features/foods/food-detail-panel";
import { useFoodStore } from "@/stores/use-food-store";
import { Button } from "@/components/ui/button";

export default function FoodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const foods = useFoodStore((s) => s.foods);
  const food = foods.find((f) => f.id === id);

  useEffect(() => {
    if (foods.length > 0 && !food) {
      router.replace("/foods");
    }
  }, [foods.length, food, router]);

  if (!food) {
    return (
      <AppShell title="Food" description="Loading...">
        <div className="flex h-48 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={food.name}
      description={food.brand ?? "View and edit food"}
      actions={
        <Button variant="outline" size="sm" onClick={() => router.push("/foods")}>
          Back to library
        </Button>
      }
    >
      <div className="mx-auto max-w-2xl space-y-6 lg:max-w-3xl">
        <div className="lg:hidden">
          <FoodDetailPanel food={food} />
        </div>
        <FoodForm food={food} onSuccess={() => router.push("/foods")} />
      </div>
    </AppShell>
  );
}
