"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  onboardingSchema,
  type OnboardingFormData,
} from "@/domain/schemas/profile.schema";
import type { GoalType } from "@/domain/entities/user-profile";
import { buildProfileFromOnboarding } from "@/services/profile.service";
import { buildDietPlan, suggestTargetWeight } from "@/services/diet-plan.service";
import { useProfileStore } from "@/stores/use-profile-store";
import { GoalPicker } from "@/features/profile/goal-picker";
import { DietPlanChart } from "@/features/plan/diet-plan-chart";
import {
  ACTIVITY_OPTIONS,
  GENDER_OPTIONS,
  GOAL_OPTIONS,
  formatNumber,
} from "@/features/profile/constants";
import { cn } from "@/lib/utils";

const STEPS = ["Welcome", "Body", "Goal", "Your Plan"] as const;

const defaultValues: OnboardingFormData = {
  name: "",
  gender: "male",
  age: 25,
  height: 170,
  weight: 70,
  targetWeight: 65,
  activityLevel: "moderate",
  goalType: "weight_loss",
  calorieAdjustment: 500,
};

function defaultCalorieAdjustment(goalType: GoalType): number {
  switch (goalType) {
    case "weight_loss":
      return 500;
    case "weight_gain":
      return 300;
    case "maintenance":
      return 0;
  }
}

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const completeOnboarding = useProfileStore((s) => s.completeOnboarding);
  const isLoading = useProfileStore((s) => s.isLoading);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues,
    mode: "onChange",
  });

  const goalType = form.watch("goalType");
  const weight = form.watch("weight");
  const name = form.watch("name");

  const previewProfile = buildProfileFromOnboarding({
    ...defaultValues,
    ...form.getValues(),
    name: name || "You",
  });
  const plan = buildDietPlan(previewProfile);

  const stepFields: (keyof OnboardingFormData)[][] = [
    ["name"],
    ["gender", "age", "height", "weight", "targetWeight"],
    ["activityLevel", "goalType", "calorieAdjustment"],
    [],
  ];

  const handleGoalChange = (nextGoal: GoalType) => {
    form.setValue("goalType", nextGoal);
    form.setValue("calorieAdjustment", defaultCalorieAdjustment(nextGoal));
    if (weight > 0) {
      form.setValue("targetWeight", suggestTargetWeight(weight, nextGoal));
    }
  };

  const validateStep = async () => {
    const fields = stepFields[step] ?? [];
    if (fields.length === 0) return true;
    return form.trigger(fields);
  };

  const next = async () => {
    const valid = await validateStep();
    if (!valid) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      await completeOnboarding(data);
      toast.success("Your diet plan is ready!");
      router.replace("/plan");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  const goalOption = GOAL_OPTIONS.find((g) => g.value === goalType);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                    ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className="hidden text-[10px] text-muted-foreground sm:block">
              {label}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Let&apos;s build your plan</CardTitle>
              <CardDescription>
                Tell us about yourself and we&apos;ll create a personalized diet
                chart — calories, macros, and meal targets to log against.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                label="Your name"
                htmlFor="name"
                error={form.formState.errors.name?.message}
              >
                <Input
                  id="name"
                  placeholder="e.g. Alex"
                  autoFocus
                  {...form.register("name")}
                />
              </FormField>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Height & weight</CardTitle>
              <CardDescription>
                We use these to calculate your daily calorie needs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Gender" htmlFor="gender">
                <Select id="gender" {...form.register("gender")}>
                  {GENDER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Age"
                  htmlFor="age"
                  error={form.formState.errors.age?.message}
                >
                  <Input
                    id="age"
                    type="number"
                    {...form.register("age", { valueAsNumber: true })}
                  />
                </FormField>
                <FormField
                  label="Height (cm)"
                  htmlFor="height"
                  error={form.formState.errors.height?.message}
                >
                  <Input
                    id="height"
                    type="number"
                    {...form.register("height", { valueAsNumber: true })}
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Current weight (kg)"
                  htmlFor="weight"
                  error={form.formState.errors.weight?.message}
                >
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    {...form.register("weight", {
                      valueAsNumber: true,
                      onChange: (e) => {
                        const w = Number(e.target.value);
                        if (w > 0) {
                          form.setValue(
                            "targetWeight",
                            suggestTargetWeight(w, form.getValues("goalType")),
                          );
                        }
                      },
                    })}
                  />
                </FormField>
                <FormField
                  label="Target weight (kg)"
                  htmlFor="targetWeight"
                  error={form.formState.errors.targetWeight?.message}
                >
                  <Input
                    id="targetWeight"
                    type="number"
                    step="0.1"
                    {...form.register("targetWeight", { valueAsNumber: true })}
                  />
                </FormField>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>What&apos;s your goal?</CardTitle>
              <CardDescription>
                Choose bulk, stay fit, or lose weight — we&apos;ll tailor your
                macros and meal plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <GoalPicker value={goalType} onChange={handleGoalChange} />
              <p className="text-center text-sm text-muted-foreground">
                {goalOption?.description}
              </p>
              <FormField label="Activity level" htmlFor="activityLevel">
                <Select id="activityLevel" {...form.register("activityLevel")}>
                  {ACTIVITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label} — {o.description}
                    </option>
                  ))}
                </Select>
              </FormField>
              {goalType !== "maintenance" && (
                <FormField
                  label={
                    goalType === "weight_loss"
                      ? "Daily calorie deficit"
                      : "Daily calorie surplus"
                  }
                  htmlFor="calorieAdjustment"
                  error={form.formState.errors.calorieAdjustment?.message}
                >
                  <Input
                    id="calorieAdjustment"
                    type="number"
                    step="50"
                    {...form.register("calorieAdjustment", { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground">
                    kcal per day (recommended: 300–500)
                  </p>
                </FormField>
              )}
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your personalized diet plan</CardTitle>
                <CardDescription>
                  {plan.goalLabel} · {formatNumber(plan.targets.dailyCalories)}{" "}
                  kcal/day — log meals against these targets
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-muted-foreground">BMR</p>
                  <p className="text-lg font-semibold">{formatNumber(plan.bmr)} kcal</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-muted-foreground">TDEE</p>
                  <p className="text-lg font-semibold">{formatNumber(plan.tdee)} kcal</p>
                </div>
              </CardContent>
            </Card>
            <DietPlanChart plan={plan} />
          </div>
        )}

        <div className="flex gap-3 pt-4">
          {step > 0 && (
            <Button type="button" variant="outline" onClick={back} className="flex-1">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next} className="flex-1">
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Creating plan..." : "Start logging"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
