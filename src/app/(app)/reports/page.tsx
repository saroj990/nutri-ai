"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shared/app-shell";
import { ReportCards } from "@/features/reports/report-cards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useReportStore } from "@/stores/use-report-store";
import type { ReportPeriod } from "@/services/report.service";
import { Trophy } from "lucide-react";

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export default function ReportsPage() {
  const period = useReportStore((s) => s.period);
  const report = useReportStore((s) => s.report);
  const isLoading = useReportStore((s) => s.isLoading);
  const setPeriod = useReportStore((s) => s.setPeriod);
  const load = useReportStore((s) => s.load);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AppShell
      title="Reports"
      description="Nutrition summaries by period"
      wide
      actions={
        <Button asChild variant="outline" size="sm">
          <Link href="/achievements">
            <Trophy className="h-4 w-4" />
            Achievements
          </Link>
        </Button>
      }
    >
      <Tabs
        value={period}
        onValueChange={(v) => setPeriod(v as ReportPeriod)}
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
            {isLoading && !report ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                Loading report...
              </div>
            ) : report && report.period === value ? (
              <ReportCards report={report} />
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                Loading report...
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </AppShell>
  );
}
