"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalCalculationService } from "@/domain/services/goal-calculation.service";
import { useProfileStore } from "@/stores/use-profile-store";
import { formatNumber, GOAL_OPTIONS } from "@/features/profile/constants";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/domain/entities/user-profile";

function GoalsForm({ profile }: { profile: UserProfile }) {
  const updateGoals = useProfileStore((s) => s.updateGoals);
  const isLoading = useProfileStore((s) => s.isLoading);

  const [useCustom, setUseCustom] = useState(profile.useCustomTargets);
  const [customCalories, setCustomCalories] = useState(profile.dailyCalories);
  const [customProtein, setCustomProtein] = useState(profile.dailyProtein);
  const [customCarbs, setCustomCarbs] = useState(profile.dailyCarbs);
  const [customFat, setCustomFat] = useState(profile.dailyFat);
  const [customWater, setCustomWater] = useState(profile.dailyWater);

  const calculated = GoalCalculationService.calculateTargets({
    ...profile,
    useCustomTargets: false,
  });

  const bmr = GoalCalculationService.calculateBMR(profile);
  const tdee = GoalCalculationService.calculateTDEE(bmr, profile.activityLevel);

  const goalLabel =
    GOAL_OPTIONS.find((g) => g.value === profile.goalType)?.label ?? profile.goalType;

  const handleSave = async () => {
    try {
      await updateGoals(
        useCustom,
        useCustom
          ? {
              dailyCalories: customCalories,
              dailyProtein: customProtein,
              dailyCarbs: customCarbs,
              dailyFat: customFat,
              dailyWater: customWater,
            }
          : undefined,
      );
      toast.success("Goals updated");
    } catch {
      toast.error("Failed to update goals");
    }
  };

  const handleRecalculate = async () => {
    try {
      await updateGoals(false);
      setUseCustom(false);
      toast.success("Goals recalculated from profile");
    } catch {
      toast.error("Failed to recalculate goals");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Current Goal</CardTitle>
          <CardDescription>{goalLabel}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-muted-foreground">BMR</p>
            <p className="font-semibold">{formatNumber(bmr)} kcal</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-muted-foreground">TDEE</p>
            <p className="font-semibold">{formatNumber(tdee)} kcal</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Targets</CardTitle>
          <CardDescription>
            {useCustom
              ? "Using your custom targets"
              : "Auto-calculated from your profile"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setUseCustom(false)}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                !useCustom
                  ? "border-primary bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              Auto
            </button>
            <button
              type="button"
              onClick={() => setUseCustom(true)}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                useCustom
                  ? "border-primary bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              Custom
            </button>
          </div>

          {!useCustom ? (
            <div className="space-y-3">
              <div className="rounded-xl border bg-primary/5 p-4 text-center">
                <p className="text-3xl font-bold text-primary">
                  {formatNumber(calculated.dailyCalories)}
                </p>
                <p className="text-sm text-muted-foreground">kcal / day</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-lg border p-2">
                  <p className="text-muted-foreground">Protein</p>
                  <p className="font-semibold">{calculated.dailyProtein}g</p>
                </div>
                <div className="rounded-lg border p-2">
                  <p className="text-muted-foreground">Carbs</p>
                  <p className="font-semibold">{calculated.dailyCarbs}g</p>
                </div>
                <div className="rounded-lg border p-2">
                  <p className="text-muted-foreground">Fat</p>
                  <p className="font-semibold">{calculated.dailyFat}g</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleRecalculate}
                disabled={isLoading}
              >
                Recalculate from profile
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <FormField label="Calories (kcal)" htmlFor="custom-calories">
                <Input
                  id="custom-calories"
                  type="number"
                  value={customCalories}
                  onChange={(e) => setCustomCalories(Number(e.target.value))}
                />
              </FormField>
              <div className="grid grid-cols-3 gap-2">
                <FormField label="Protein (g)" htmlFor="custom-protein">
                  <Input
                    id="custom-protein"
                    type="number"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(Number(e.target.value))}
                  />
                </FormField>
                <FormField label="Carbs (g)" htmlFor="custom-carbs">
                  <Input
                    id="custom-carbs"
                    type="number"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(Number(e.target.value))}
                  />
                </FormField>
                <FormField label="Fat (g)" htmlFor="custom-fat">
                  <Input
                    id="custom-fat"
                    type="number"
                    value={customFat}
                    onChange={(e) => setCustomFat(Number(e.target.value))}
                  />
                </FormField>
              </div>
              <FormField label="Water (ml)" htmlFor="custom-water">
                <Input
                  id="custom-water"
                  type="number"
                  value={customWater}
                  onChange={(e) => setCustomWater(Number(e.target.value))}
                />
              </FormField>
            </div>
          )}

          <Button
            type="button"
            className="w-full"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Goals"}
          </Button>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/profile" className="text-primary underline">
          Edit profile
        </Link>{" "}
        to change activity level or goal type
      </p>
    </div>
  );
}

export function GoalsPanel() {
  const profile = useProfileStore((s) => s.profile);

  if (!profile) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No profile found.{" "}
          <Link href="/onboarding" className="text-primary underline">
            Complete onboarding
          </Link>
        </CardContent>
      </Card>
    );
  }

  return <GoalsForm key={profile.updatedAt} profile={profile} />;
}
