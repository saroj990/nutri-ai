"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  profileEditSchema,
  type ProfileEditFormData,
} from "@/domain/schemas/profile.schema";
import { useProfileStore } from "@/stores/use-profile-store";
import { ACTIVITY_OPTIONS, GENDER_OPTIONS, GOAL_OPTIONS } from "@/features/profile/constants";

export function ProfileForm() {
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const isLoading = useProfileStore((s) => s.isLoading);

  const form = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: profile
      ? {
          name: profile.name,
          gender: profile.gender,
          age: profile.age,
          height: profile.height,
          weight: profile.weight,
          targetWeight: profile.targetWeight,
          activityLevel: profile.activityLevel,
          goalType: profile.goalType,
          calorieAdjustment: profile.calorieAdjustment,
          useCustomTargets: profile.useCustomTargets,
          dailyCalories: profile.dailyCalories,
          dailyProtein: profile.dailyProtein,
          dailyCarbs: profile.dailyCarbs,
          dailyFat: profile.dailyFat,
          dailyWater: profile.dailyWater,
        }
      : undefined,
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        gender: profile.gender,
        age: profile.age,
        height: profile.height,
        weight: profile.weight,
        targetWeight: profile.targetWeight,
        activityLevel: profile.activityLevel,
        goalType: profile.goalType,
        calorieAdjustment: profile.calorieAdjustment,
        useCustomTargets: profile.useCustomTargets,
        dailyCalories: profile.dailyCalories,
        dailyProtein: profile.dailyProtein,
        dailyCarbs: profile.dailyCarbs,
        dailyFat: profile.dailyFat,
        dailyWater: profile.dailyWater,
      });
    }
  }, [profile, form]);

  if (!profile) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No profile found. Complete onboarding first.
        </CardContent>
      </Card>
    );
  }

  const onSubmit = async (data: ProfileEditFormData) => {
    try {
      await updateProfile(data);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Personal Info</CardTitle>
          <CardDescription>Update your basic information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            label="Name"
            htmlFor="profile-name"
            error={form.formState.errors.name?.message}
          >
            <Input id="profile-name" {...form.register("name")} />
          </FormField>
          <FormField label="Gender" htmlFor="profile-gender">
            <Select id="profile-gender" {...form.register("gender")}>
              {GENDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Age" htmlFor="profile-age" error={form.formState.errors.age?.message}>
              <Input id="profile-age" type="number" {...form.register("age", { valueAsNumber: true })} />
            </FormField>
            <FormField label="Height (cm)" htmlFor="profile-height" error={form.formState.errors.height?.message}>
              <Input id="profile-height" type="number" {...form.register("height", { valueAsNumber: true })} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Weight (kg)" htmlFor="profile-weight" error={form.formState.errors.weight?.message}>
              <Input id="profile-weight" type="number" step="0.1" {...form.register("weight", { valueAsNumber: true })} />
            </FormField>
            <FormField label="Target (kg)" htmlFor="profile-target" error={form.formState.errors.targetWeight?.message}>
              <Input id="profile-target" type="number" step="0.1" {...form.register("targetWeight", { valueAsNumber: true })} />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity & Goal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Activity level" htmlFor="profile-activity">
            <Select id="profile-activity" {...form.register("activityLevel")}>
              {ACTIVITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Goal" htmlFor="profile-goal">
            <Select id="profile-goal" {...form.register("goalType")}>
              {GOAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Calorie adjustment" htmlFor="profile-adjustment">
            <Input
              id="profile-adjustment"
              type="number"
              {...form.register("calorieAdjustment", { valueAsNumber: true })}
            />
          </FormField>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}
