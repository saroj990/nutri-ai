"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { WeightDataPoint } from "@/services/analytics.service";
import type { WeightEntry } from "@/domain/entities/weight-entry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WeightChartProps {
  data: WeightDataPoint[] | WeightEntry[];
  title?: string;
  height?: number;
}

function normalizeData(
  data: WeightDataPoint[] | WeightEntry[],
): { label: string; weight: number }[] {
  return [...data]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({
      label:
        "label" in d && d.label
          ? d.label
          : new Date(d.date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            }),
      weight: d.weight,
    }));
}

export function WeightChart({
  data,
  title = "Weight Trend",
  height = 280,
}: WeightChartProps) {
  const chartData = normalizeData(data);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            Log weight entries to see your trend
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              className="text-muted-foreground"
            />
            <YAxis
              domain={["dataMin - 1", "dataMax + 1"]}
              tick={{ fontSize: 11 }}
              width={40}
              className="text-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value) => [`${value ?? 0} kg`, "Weight"]}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 4, fill: "hsl(var(--primary))" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
