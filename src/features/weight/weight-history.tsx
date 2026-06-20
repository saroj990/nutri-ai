"use client";

import { Trash2 } from "lucide-react";
import type { WeightEntry } from "@/domain/entities/weight-entry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WeightHistoryProps {
  entries: WeightEntry[];
  onDelete: (id: string) => void;
}

export function WeightHistory({ entries, onDelete }: WeightHistoryProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No weight entries yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.slice(0, 14).map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between rounded-lg border px-3 py-2.5"
          >
            <div>
              <p className="font-medium">{entry.weight} kg</p>
              <p className="text-xs text-muted-foreground">
                {entry.date}
                {entry.bodyFatPercentage != null &&
                  ` · ${entry.bodyFatPercentage}% BF`}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(entry.id)}
              aria-label="Delete entry"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
