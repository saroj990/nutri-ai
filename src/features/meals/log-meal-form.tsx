"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Meal, MealType } from "@/domain/entities/meal";
import { MEAL_TYPE_LABELS } from "@/domain/entities/meal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MealFoodPicker,
  draftToMealFoodInputs,
  type DraftMealFood,
} from "@/features/meals/meal-food-picker";
import { useMealStore } from "@/stores/use-meal-store";
import { toDateString } from "@/domain/value-objects/date";
import type { DateString } from "@/domain/value-objects/date";

const MEAL_TYPES = Object.keys(MEAL_TYPE_LABELS) as MealType[];

interface LogMealFormProps {
  meal?: Meal;
  defaultMealType?: MealType;
  defaultDate?: DateString;
  onSuccess?: () => void;
}

export function LogMealForm({
  meal,
  defaultMealType = "breakfast",
  defaultDate,
  onSuccess,
}: LogMealFormProps) {
  const router = useRouter();
  const logMeal = useMealStore((s) => s.logMeal);
  const saveTemplate = useMealStore((s) => s.saveTemplate);
  const isLoading = useMealStore((s) => s.isLoading);

  const [mealType, setMealType] = useState<MealType>(
    meal?.mealType ?? defaultMealType,
  );
  const [name, setName] = useState(meal?.name ?? "");
  const [notes, setNotes] = useState(meal?.notes ?? "");
  const [date, setDate] = useState(meal?.date ?? defaultDate ?? toDateString());
  const [items, setItems] = useState<DraftMealFood[]>([]);
  const [showTemplate, setShowTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

  useEffect(() => {
    if (meal) {
      setItems(
        meal.foods.map((f) => ({
          foodId: f.foodId,
          foodName: f.foodName,
          servings: f.servings,
          calories: f.macros.calories,
          protein: f.macros.protein,
          carbs: f.macros.carbs,
          fat: f.macros.fat,
        })),
      );
    }
  }, [meal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Add at least one food");
      return;
    }

    try {
      await logMeal({
        id: meal?.id,
        name: name || MEAL_TYPE_LABELS[mealType],
        mealType,
        date: date as DateString,
        foods: draftToMealFoodInputs(items),
        notes: notes || undefined,
      });
      toast.success(meal ? "Meal updated" : "Meal logged!");
      onSuccess?.() ?? router.push("/log");
    } catch {
      toast.error("Failed to save meal");
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim() || items.length === 0) return;
    try {
      await saveTemplate(templateName, mealType, draftToMealFoodInputs(items));
      toast.success("Template saved");
      setShowTemplate(false);
      setTemplateName("");
    } catch {
      toast.error("Failed to save template");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4 lg:max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>{meal ? "Edit Meal" : "Log Meal"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField label="Meal type" htmlFor="meal-type">
              <Select
                id="meal-type"
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
              >
                {MEAL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {MEAL_TYPE_LABELS[t]}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Date" htmlFor="meal-date">
              <Input
                id="meal-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value as DateString)}
              />
            </FormField>
            <FormField label="Name (optional)" htmlFor="meal-name" className="md:col-span-2">
              <Input
                id="meal-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={MEAL_TYPE_LABELS[mealType]}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Foods</CardTitle>
          </CardHeader>
          <CardContent>
            <MealFoodPicker items={items} onChange={setItems} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <FormField label="Notes (optional)" htmlFor="meal-notes">
              <Input
                id="meal-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about this meal..."
              />
            </FormField>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowTemplate(true)}
            disabled={items.length === 0}
          >
            Save as Template
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? "Saving..." : meal ? "Update Meal" : "Log Meal"}
          </Button>
        </div>
      </form>

      <Dialog open={showTemplate} onOpenChange={setShowTemplate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
          </DialogHeader>
          <FormField label="Template name" htmlFor="template-name">
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g. Morning Oats"
            />
          </FormField>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplate(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
