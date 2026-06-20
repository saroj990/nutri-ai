"use client";

import { AppShell } from "@/components/shared/app-shell";
import { FoodForm } from "@/features/foods/food-form";

export default function NewFoodPage() {
  return (
    <AppShell title="Add Food" description="Create a custom food item">
      <FoodForm />
    </AppShell>
  );
}
