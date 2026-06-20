"use client";

import { toast } from "sonner";
import { Droplets } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useWaterStore } from "@/stores/use-water-store";
import { useSettingsStore } from "@/stores/use-settings-store";
import { formatNumber } from "@/features/profile/constants";

interface WaterTrackerProps {
  compact?: boolean;
}

export function WaterTracker({ compact = false }: WaterTrackerProps) {
  const consumed = useWaterStore((s) => s.consumed);
  const goal = useWaterStore((s) => s.goal);
  const addWater = useWaterStore((s) => s.addWater);
  const isLoading = useWaterStore((s) => s.isLoading);
  const quickAdds = useSettingsStore(
    (s) => s.settings?.waterQuickAdds ?? [250, 500, 1000],
  );

  const progress = goal > 0 ? Math.min(100, (consumed / goal) * 100) : 0;
  const remaining = Math.max(0, goal - consumed);

  const handleAdd = async (amount: number) => {
    try {
      await addWater(amount);
      toast.success(`+${amount} ml added`);
    } catch {
      toast.error("Failed to add water");
    }
  };

  return (
    <Card>
      <CardHeader className={compact ? "pb-2" : undefined}>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Droplets className="h-5 w-5 text-blue-500" />
          Water
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-3xl font-bold">{formatNumber(consumed)} ml</p>
          <p className="text-sm text-muted-foreground">
            of {formatNumber(goal)} ml goal · {formatNumber(remaining)} ml left
          </p>
        </div>
        <Progress value={progress} aria-label="Water intake progress" />
        <div className="grid grid-cols-3 gap-2">
          {quickAdds.map((amount) => (
            <Button
              key={amount}
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => handleAdd(amount)}
              className="flex flex-col gap-0.5 py-3 h-auto"
            >
              <span className="text-lg font-bold">+{amount}</span>
              <span className="text-[10px] text-muted-foreground">ml</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
