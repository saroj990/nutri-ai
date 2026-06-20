"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/app-shell";
import { WeightForm } from "@/features/weight/weight-form";
import { WeightChart } from "@/features/weight/weight-chart";
import { WeightHistory } from "@/features/weight/weight-history";
import { Card, CardContent } from "@/components/ui/card";
import { useWeightStore } from "@/stores/use-weight-store";
import { formatNumber } from "@/features/profile/constants";

export default function WeightPage() {
  const stats = useWeightStore((s) => s.stats);
  const load = useWeightStore((s) => s.load);
  const deleteEntry = useWeightStore((s) => s.deleteEntry);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async (id: string) => {
    try {
      await deleteEntry(id);
      toast.success("Entry deleted");
    } catch {
      toast.error("Failed to delete entry");
    }
  };

  return (
    <AppShell title="Weight" description="Log and track your progress" wide>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Latest"
              value={stats?.latest ? `${stats.latest.weight} kg` : "—"}
            />
            <StatCard
              label="7-day avg"
              value={
                stats?.weeklyAverage != null
                  ? `${stats.weeklyAverage} kg`
                  : "—"
              }
            />
            <StatCard
              label="30-day avg"
              value={
                stats?.monthlyAverage != null
                  ? `${stats.monthlyAverage} kg`
                  : "—"
              }
            />
            <StatCard
              label="7-day change"
              value={
                stats?.change7d != null
                  ? `${stats.change7d > 0 ? "+" : ""}${formatNumber(stats.change7d)} kg`
                  : "—"
              }
            />
          </div>
          <WeightChart data={stats?.entries ?? []} />
          <WeightHistory
            entries={stats?.entries ?? []}
            onDelete={handleDelete}
          />
        </div>
        <aside>
          <WeightForm />
        </aside>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
