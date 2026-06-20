"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/shared/app-shell";
import { NutritionCharts } from "@/features/analytics/nutrition-charts";
import { WeightChart } from "@/features/weight/weight-chart";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalyticsStore } from "@/stores/use-analytics-store";
import { formatNumber } from "@/features/profile/constants";
import type { AnalyticsPeriod } from "@/services/analytics.service";

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
];

export default function AnalyticsPage() {
  const period = useAnalyticsStore((s) => s.period);
  const summary = useAnalyticsStore((s) => s.summary);
  const isLoading = useAnalyticsStore((s) => s.isLoading);
  const setPeriod = useAnalyticsStore((s) => s.setPeriod);
  const load = useAnalyticsStore((s) => s.load);

  useEffect(() => {
    void load();
  }, [load]);

  const averages = summary?.averages;

  return (
    <AppShell title="Analytics" description="Nutrition and weight trends" wide>
      <Tabs
        value={period}
        onValueChange={(v) => setPeriod(v as AnalyticsPeriod)}
        className="space-y-4"
      >
        <TabsList className="max-w-md">
          {PERIODS.map(({ value, label }) => (
            <TabsTrigger key={value} value={value}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {PERIODS.map(({ value }) => (
          <TabsContent key={value} value={value}>
            {isLoading && !summary ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                Loading analytics...
              </div>
            ) : (
              <div className="space-y-6">
                {averages && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    <AvgCard label="Avg calories" value={`${formatNumber(averages.calories)}`} />
                    <AvgCard label="Avg protein" value={`${averages.protein}g`} />
                    <AvgCard label="Avg carbs" value={`${averages.carbs}g`} />
                    <AvgCard label="Avg fat" value={`${averages.fat}g`} />
                    <AvgCard label="Avg water" value={`${formatNumber(averages.water)} ml`} />
                    <AvgCard
                      label="Weight change"
                      value={
                        averages.weightChange != null
                          ? `${averages.weightChange > 0 ? "+" : ""}${averages.weightChange} kg`
                          : "—"
                      }
                    />
                  </div>
                )}
                {summary && (
                  <>
                    <NutritionCharts
                      nutrition={summary.nutrition}
                      weight={summary.weight}
                    />
                    <WeightChart
                      data={summary.weight}
                      title="Weight Trend"
                    />
                  </>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </AppShell>
  );
}

function AvgCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
