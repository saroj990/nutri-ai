"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  foodFormSchema,
  type FoodFormData,
} from "@/domain/schemas/food.schema";
import type { Food } from "@/domain/entities/food";
import { useFoodStore } from "@/stores/use-food-store";
import { FOOD_TAGS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SERVING_UNITS = [
  "g", "ml", "oz", "cup", "tbsp", "tsp", "piece", "slice", "serving", "scoop",
] as const;

const TAG_OPTIONS = FOOD_TAGS.filter(
  (t) => !["all", "favorites", "recent", "custom"].includes(t.id),
).map((t) => t.id);

interface FoodFormProps {
  food?: Food;
  onSuccess?: (food: Food) => void;
}

export function FoodForm({ food, onSuccess }: FoodFormProps) {
  const router = useRouter();
  const saveFood = useFoodStore((s) => s.saveFood);
  const isLoading = useFoodStore((s) => s.isLoading);

  const form = useForm<FoodFormData>({
    resolver: zodResolver(foodFormSchema),
    defaultValues: {
      name: "",
      brand: "",
      servingSize: 100,
      servingUnit: "g",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      tags: [],
      isFavorite: false,
    },
  });

  const selectedTags = form.watch("tags") ?? [];

  useEffect(() => {
    if (food) {
      form.reset({
        name: food.name,
        brand: food.brand ?? "",
        servingSize: food.servingSize,
        servingUnit: food.servingUnit,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
        sugar: food.sugar,
        sodium: food.sodium,
        tags: food.tags,
        isFavorite: food.isFavorite,
      });
    }
  }, [food, form]);

  const toggleTag = (tag: string) => {
    const current = form.getValues("tags") ?? [];
    if (current.includes(tag)) {
      form.setValue(
        "tags",
        current.filter((t) => t !== tag),
      );
    } else {
      form.setValue("tags", [...current, tag]);
    }
  };

  const onSubmit = async (data: FoodFormData) => {
    try {
      const saved = await saveFood(data, food?.id);
      toast.success(food ? "Food updated" : "Food created");
      onSuccess?.(saved);
      if (!onSuccess) {
        router.push(`/foods?selected=${saved.id}`);
      }
    } catch {
      toast.error("Failed to save food");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{food ? "Edit Food" : "Add Custom Food"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            label="Name"
            htmlFor="food-name"
            error={form.formState.errors.name?.message}
          >
            <Input id="food-name" {...form.register("name")} />
          </FormField>
          <FormField label="Brand (optional)" htmlFor="food-brand">
            <Input id="food-brand" {...form.register("brand")} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Serving size" htmlFor="food-serving-size">
              <Input
                id="food-serving-size"
                type="number"
                step="0.1"
                {...form.register("servingSize", { valueAsNumber: true })}
              />
            </FormField>
            <FormField label="Unit" htmlFor="food-serving-unit">
              <Select id="food-serving-unit" {...form.register("servingUnit")}>
                {SERVING_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nutrition per serving</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <FormField label="Calories" htmlFor="food-calories">
            <Input
              id="food-calories"
              type="number"
              {...form.register("calories", { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Protein (g)" htmlFor="food-protein">
            <Input
              id="food-protein"
              type="number"
              step="0.1"
              {...form.register("protein", { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Carbs (g)" htmlFor="food-carbs">
            <Input
              id="food-carbs"
              type="number"
              step="0.1"
              {...form.register("carbs", { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Fat (g)" htmlFor="food-fat">
            <Input
              id="food-fat"
              type="number"
              step="0.1"
              {...form.register("fat", { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Fiber (g)" htmlFor="food-fiber">
            <Input
              id="food-fiber"
              type="number"
              step="0.1"
              {...form.register("fiber", { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Sugar (g)" htmlFor="food-sugar">
            <Input
              id="food-sugar"
              type="number"
              step="0.1"
              {...form.register("sugar", { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Sodium (mg)" htmlFor="food-sodium">
            <Input
              id="food-sodium"
              type="number"
              {...form.register("sodium", { valueAsNumber: true })}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors",
                  selectedTags.includes(tag)
                    ? "border-primary bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? "Saving..." : food ? "Update Food" : "Add Food"}
        </Button>
      </div>
    </form>
  );
}
