"use client";

import { toast } from "sonner";
import type { MealTemplate } from "@/domain/entities/meal-template";
import { MEAL_TYPE_LABELS } from "@/domain/entities/meal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMealStore } from "@/stores/use-meal-store";
import { Bookmark } from "lucide-react";

interface TemplateListProps {
  templates: MealTemplate[];
}

export function TemplateList({ templates }: TemplateListProps) {
  const useTemplate = useMealStore((s) => s.useTemplate);
  const isLoading = useMealStore((s) => s.isLoading);

  const handleUse = async (templateId: string) => {
    try {
      await useTemplate(templateId);
      toast.success("Template added to today's log");
    } catch {
      toast.error("Failed to use template");
    }
  };

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          <Bookmark className="mx-auto mb-2 h-8 w-8 opacity-40" />
          No templates yet. Save a meal as a template for quick reuse.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Meal Templates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {templates.map((template) => (
          <div
            key={template.id}
            className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{template.name}</p>
              <p className="text-xs text-muted-foreground">
                {MEAL_TYPE_LABELS[template.mealType]} · {template.foods.length}{" "}
                items
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={isLoading}
              onClick={() => handleUse(template.id)}
            >
              Use
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
