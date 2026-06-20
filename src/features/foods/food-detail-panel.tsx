"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, Pencil, Star, Trash2 } from "lucide-react";
import type { Food } from "@/domain/entities/food";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFoodStore } from "@/stores/use-food-store";
import { cn } from "@/lib/utils";

interface FoodDetailPanelProps {
  food: Food | null;
}

export function FoodDetailPanel({ food }: FoodDetailPanelProps) {
  const router = useRouter();
  const toggleFavorite = useFoodStore((s) => s.toggleFavorite);
  const duplicateFood = useFoodStore((s) => s.duplicateFood);
  const deleteFood = useFoodStore((s) => s.deleteFood);
  const trackRecent = useFoodStore((s) => s.trackRecent);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (food) {
      void trackRecent(food.id);
    }
  }, [food, trackRecent]);

  if (!food) {
    return (
      <Card className="hidden h-full min-h-[400px] lg:flex lg:flex-col">
        <CardContent className="flex flex-1 flex-col items-center justify-center text-center text-muted-foreground">
          <p className="text-lg font-medium">Select a food</p>
          <p className="mt-1 text-sm">
            Choose an item from the list to view nutrition details
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleDuplicate = async () => {
    try {
      const copy = await duplicateFood(food.id);
      toast.success("Food duplicated");
      router.push(`/foods/${copy.id}`);
    } catch {
      toast.error("Failed to duplicate food");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteFood(food.id);
      toast.success("Food deleted");
      setShowDelete(false);
    } catch {
      toast.error("Failed to delete food");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-xl leading-tight">{food.name}</CardTitle>
              {food.brand && (
                <p className="mt-1 text-sm text-muted-foreground">{food.brand}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => toggleFavorite(food.id)}
              aria-label={food.isFavorite ? "Remove favorite" : "Add favorite"}
              className="shrink-0 rounded-lg p-2 hover:bg-muted"
            >
              <Star
                className={cn(
                  "h-5 w-5",
                  food.isFavorite
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground",
                )}
              />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-2">
            {food.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
            {food.isCustom && <Badge variant="outline">Custom</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-xl border bg-primary/5 p-4 text-center">
            <p className="text-3xl font-bold text-primary">{food.calories}</p>
            <p className="text-sm text-muted-foreground">
              kcal per {food.servingSize}
              {food.servingUnit}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Protein</p>
              <p className="text-lg font-semibold">{food.protein}g</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Carbs</p>
              <p className="text-lg font-semibold">{food.carbs}g</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Fat</p>
              <p className="text-lg font-semibold">{food.fat}g</p>
            </div>
          </div>

          {(food.fiber != null || food.sugar != null || food.sodium != null) && (
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              {food.fiber != null && (
                <div className="rounded-lg bg-muted p-2">
                  <p className="text-muted-foreground">Fiber</p>
                  <p className="font-medium">{food.fiber}g</p>
                </div>
              )}
              {food.sugar != null && (
                <div className="rounded-lg bg-muted p-2">
                  <p className="text-muted-foreground">Sugar</p>
                  <p className="font-medium">{food.sugar}g</p>
                </div>
              )}
              {food.sodium != null && (
                <div className="rounded-lg bg-muted p-2">
                  <p className="text-muted-foreground">Sodium</p>
                  <p className="font-medium">{food.sodium}mg</p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="default" className="flex-1">
              <Link href={`/foods/${food.id}`}>
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleDuplicate}
            >
              <Copy className="h-4 w-4" />
              Duplicate
            </Button>
            {food.isCustom && (
              <Button
                type="button"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete food?</DialogTitle>
            <DialogDescription>
              This will permanently remove &quot;{food.name}&quot; from your
              library. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
