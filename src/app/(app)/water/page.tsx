"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/shared/app-shell";
import { WaterTracker } from "@/features/water/water-tracker";
import { useWaterStore } from "@/stores/use-water-store";

export default function WaterPage() {
  const load = useWaterStore((s) => s.load);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AppShell title="Water" description="Track your daily hydration" wide>
      <div className="mx-auto max-w-lg">
        <WaterTracker />
      </div>
    </AppShell>
  );
}
