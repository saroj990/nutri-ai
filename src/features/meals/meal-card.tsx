"use client";

import Link from "next/link";
import { Copy, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { Meal } from "@/domain/entities/meal";
import { MEAL_TYPE_LABELS } from "@/domain/entities/meal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MealCardProps {
  meal: Meal;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  compact?: boolean;
}

export function MealCard({
  meal,
  onDelete,
  onDuplicate,
  compact = false,
}: MealCardProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <Card className={cn("overflow-hidden", compact && "shadow-none")}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{meal.name}</p>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                  {MEAL_TYPE_LABELS[meal.mealType]}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {meal.foods.map((f) => f.foodName).join(", ")}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {meal.totalCalories} kcal
                </span>
                <span>P {meal.totalProtein}g</span>
                <span>C {meal.totalCarbs}g</span>
                <span>F {meal.totalFat}g</span>
              </div>
            </div>
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowMenu(!showMenu)}
                aria-label="Meal actions"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 z-50 mt-1 w-40 rounded-lg border bg-background py-1 shadow-lg">
                    <Link
                      href={`/log/${meal.id}`}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                      onClick={() => setShowMenu(false)}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                      onClick={() => {
                        setShowMenu(false);
                        onDuplicate(meal.id);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                      Duplicate
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted"
                      onClick={() => {
                        setShowMenu(false);
                        setShowDelete(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete meal?</DialogTitle>
            <DialogDescription>
              Remove &quot;{meal.name}&quot; from today&apos;s log? This cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(meal.id);
                setShowDelete(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
