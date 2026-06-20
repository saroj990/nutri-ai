"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  weightEntrySchema,
  type WeightEntryFormData,
} from "@/domain/schemas/weight.schema";
import { useWeightStore } from "@/stores/use-weight-store";
import { useProfileStore } from "@/stores/use-profile-store";
import { toDateString } from "@/domain/value-objects/date";

export function WeightForm() {
  const saveEntry = useWeightStore((s) => s.saveEntry);
  const isLoading = useWeightStore((s) => s.isLoading);
  const profile = useProfileStore((s) => s.profile);
  const latest = useWeightStore((s) => s.stats?.latest);

  const form = useForm<WeightEntryFormData>({
    resolver: zodResolver(weightEntrySchema),
    defaultValues: {
      date: toDateString(),
      weight: profile?.weight ?? 70,
      bodyFatPercentage: undefined,
      notes: "",
    },
  });

  useEffect(() => {
    if (latest) {
      form.setValue("weight", latest.weight);
    } else if (profile) {
      form.setValue("weight", profile.weight);
    }
  }, [latest, profile, form]);

  const onSubmit = async (data: WeightEntryFormData) => {
    try {
      await saveEntry(data);
      toast.success("Weight logged");
      form.setValue("notes", "");
    } catch {
      toast.error("Failed to save weight");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Weight</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Date" htmlFor="weight-date">
              <Input
                id="weight-date"
                type="date"
                {...form.register("date")}
              />
            </FormField>
            <FormField
              label="Weight (kg)"
              htmlFor="weight-value"
              error={form.formState.errors.weight?.message}
            >
              <Input
                id="weight-value"
                type="number"
                step="0.1"
                {...form.register("weight", { valueAsNumber: true })}
              />
            </FormField>
          </div>
          <FormField label="Body fat % (optional)" htmlFor="weight-bf">
            <Input
              id="weight-bf"
              type="number"
              step="0.1"
              {...form.register("bodyFatPercentage", { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Notes (optional)" htmlFor="weight-notes">
            <Input id="weight-notes" {...form.register("notes")} />
          </FormField>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Weight"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
