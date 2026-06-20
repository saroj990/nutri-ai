"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { NutritionDataPoint, WeightDataPoint } from "@/services/analytics.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NutritionChartsProps {
  nutrition: NutritionDataPoint[];
  weight: WeightDataPoint[];
}

export function NutritionCharts({ nutrition, weight }: NutritionChartsProps) {
  const hasNutrition = nutrition.some((n) => n.calories > 0);
  const hasWeight = weight.length > 0;

  const combined = nutrition.map((n) => {
    const w = weight.find((e) => e.date === n.date);
    return {
      label: n.label,
      calories: n.calories,
      protein: n.protein,
      weight: w?.weight,
    };
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Calories</CardTitle>
        </CardHeader>
        <CardContent>
          {hasNutrition ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={nutrition} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={45} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="calories"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  name="Calories"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No calorie data for this period" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Macros</CardTitle>
        </CardHeader>
        <CardContent>
          {hasNutrition ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={nutrition} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={40} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="protein" stroke="#3b82f6" name="Protein (g)" dot={false} />
                <Line type="monotone" dataKey="carbs" stroke="#f59e0b" name="Carbs (g)" dot={false} />
                <Line type="monotone" dataKey="fat" stroke="#ef4444" name="Fat (g)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No macro data for this period" />
          )}
        </CardContent>
      </Card>

      {hasWeight && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weight & Calories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={combined} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} width={45} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} width={40} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="calories" fill="hsl(var(--primary))" opacity={0.6} name="Calories" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="weight"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Weight (kg)"
                  connectNulls
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
