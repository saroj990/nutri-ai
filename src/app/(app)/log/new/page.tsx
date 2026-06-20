"use client";

import { AppShell } from "@/components/shared/app-shell";
import { LogMealForm } from "@/features/meals/log-meal-form";

export default function NewLogPage() {
  return (
    <AppShell title="Log Meal" description="Add foods to your meal">
      <LogMealForm />
    </AppShell>
  );
}
