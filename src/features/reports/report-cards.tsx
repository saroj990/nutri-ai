"use client";

import type { PeriodReport } from "@/services/report.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MacroBar } from "@/components/shared/macro-bar";
import { MealCard } from "@/features/meals/meal-card";
import { formatNumber } from "@/features/profile/constants";

interface ReportCardsProps {
  report: PeriodReport;
}

export function ReportCards({ report }: ReportCardsProps) {
  const isDaily = report.period === "daily";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Days tracked" value={String(report.daysTracked)} />
        <StatCard label="Meals logged" value={String(report.mealsLogged)} />
        <StatCard
          label="Avg calories"
          value={`${formatNumber(report.avgCalories)} kcal`}
        />
        <StatCard
          label="Goal hit rate"
          value={`${report.goalCompletionRate}%`}
        />
        <StatCard
          label="Avg protein"
          value={`${report.avgProtein}g`}
        />
        <StatCard label="Avg water" value={`${formatNumber(report.avgWater)} ml`} />
        <StatCard label="Current streak" value={`${report.currentStreak} days`} />
        <StatCard
          label="Weight change"
          value={
            report.weightChange != null
              ? `${report.weightChange > 0 ? "+" : ""}${report.weightChange} kg`
              : "—"
          }
        />
      </div>

      {isDaily && report.daily?.targets && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s macros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <MacroBar
              label="Protein"
              consumed={report.daily.consumed.protein}
              goal={report.daily.targets.dailyProtein}
            />
            <MacroBar
              label="Carbs"
              consumed={report.daily.consumed.carbs}
              goal={report.daily.targets.dailyCarbs}
            />
            <MacroBar
              label="Fat"
              consumed={report.daily.consumed.fat}
              goal={report.daily.targets.dailyFat}
            />
          </CardContent>
        </Card>
      )}

      {isDaily && report.daily && report.daily.meals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s meals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.daily.meals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                compact
                onDelete={() => {}}
                onDuplicate={() => {}}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {!isDaily && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Period summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <p>
              <span className="text-muted-foreground">Period: </span>
              {report.startDate} → {report.endDate}
            </p>
            <p>
              <span className="text-muted-foreground">Longest streak: </span>
              {report.longestStreak} days
            </p>
            <p>
              <span className="text-muted-foreground">Avg carbs: </span>
              {report.avgCarbs}g
            </p>
            <p>
              <span className="text-muted-foreground">Avg fat: </span>
              {report.avgFat}g
            </p>
          </CardContent>
        </Card>
      )}
    </div>
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
