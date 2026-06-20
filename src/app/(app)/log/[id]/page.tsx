"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { LogMealForm } from "@/features/meals/log-meal-form";
import { useMealStore } from "@/stores/use-meal-store";
import type { Meal } from "@/domain/entities/meal";

export default function EditLogPage() {
  const params = useParams();
  const id = params.id as string;
  const fetchMeal = useMealStore((s) => s.fetchMeal);
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchMeal(id).then((m) => {
      setMeal(m);
      setLoading(false);
    });
  }, [id, fetchMeal]);

  if (loading) {
    return (
      <AppShell title="Edit Meal" description="Loading...">
        <div className="flex h-48 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  if (!meal) {
    return (
      <AppShell title="Edit Meal" description="Not found">
        <p className="text-center text-muted-foreground">Meal not found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Edit Meal" description={meal.name}>
      <LogMealForm meal={meal} />
    </AppShell>
  );
}
