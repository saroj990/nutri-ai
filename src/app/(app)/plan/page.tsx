"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shared/app-shell";
import { DietPlanChart } from "@/features/plan/diet-plan-chart";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProfileStore } from "@/stores/use-profile-store";
import { useDashboardStore } from "@/stores/use-dashboard-store";
import { useMealStore } from "@/stores/use-meal-store";
import { buildDietPlan } from "@/services/diet-plan.service";
import { formatNumber } from "@/features/profile/constants";
import { Plus, Target } from "lucide-react";

export default function PlanPage() {
  const profile = useProfileStore((s) => s.profile);
  const summary = useDashboardStore((s) => s.summary);
  const loadToday = useDashboardStore((s) => s.loadToday);
  const meals = useMealStore((s) => s.meals);
  const loadMeals = useMealStore((s) => s.loadMeals);

  useEffect(() => {
    void loadToday();
    void loadMeals();
  }, [loadToday, loadMeals]);

  if (!profile) {
    return (
      <AppShell title="My Plan" description="Your personalized diet chart">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Complete onboarding to get your plan.{" "}
            <Link href="/onboarding" className="text-primary underline">
              Set up profile
            </Link>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const plan = buildDietPlan(profile);
  const consumed = summary?.consumed;

  return (
    <AppShell
      title="My Plan"
      description={`${plan.goalLabel} · ${formatNumber(plan.targets.dailyCalories)} kcal/day`}
      wide
      actions={
        <Button asChild size="sm">
          <Link href="/log/new">
            <Plus className="h-4 w-4" />
            Log meal
          </Link>
        </Button>
      }
    >
      <div className="space-y-4">
        <Card>
          <CardContent className="flex flex-wrap items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{plan.goalLabel} plan</p>
              <p className="text-sm text-muted-foreground">
                {profile.weight} kg → {profile.targetWeight} kg target · BMR{" "}
                {formatNumber(plan.bmr)} · TDEE {formatNumber(plan.tdee)}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/goals">Edit targets</Link>
            </Button>
          </CardContent>
        </Card>

        <DietPlanChart
          plan={plan}
          consumed={consumed}
          meals={meals}
          showLogLink
        />
      </div>
    </AppShell>
  );
}
