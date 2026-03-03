"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface ChartAreaDefaultProps {
  revenueData: { month: string; revenue: number }[];
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function ChartAreaDefault({ revenueData }: ChartAreaDefaultProps) {
  const growthStats = useMemo(() => {
    if (!revenueData || revenueData.length < 2) {
      return { change: "0", isPositive: true };
    }

    // Comparing first item in array to last item in array for overall period growth
    const first = revenueData[0].revenue;
    const last = revenueData[revenueData.length - 1].revenue;

    if (first === 0)
      return { change: last > 0 ? "100" : "0", isPositive: true };

    const diff = ((last - first) / first) * 100;
    return {
      change: Math.abs(diff).toLocaleString(undefined, {
        maximumFractionDigits: 1,
      }),
      isPositive: diff >= 0,
    };
  }, [revenueData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Growth</CardTitle>
        <CardDescription>
          Total revenue generated (PHP) over the selected period
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={revenueData}
            margin={{
              left: 0, // Adjusted to make room for Y-Axis labels
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={30}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            {/* Added Y-Axis to show Peso values */}
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(value) => `Period: ${value}`}
                  // Formats the tooltip value to Peso
                  formatter={(value) => `₱${Number(value).toLocaleString()}`}
                />
              }
            />
            <Area
              dataKey="revenue"
              type="monotone" // FIXED: Changed from monotone to linear to stop the "below zero" dip
              fill="var(--color-revenue)"
              fillOpacity={0.4}
              stroke="var(--color-revenue)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-1">
            <div className="flex items-center gap-2 leading-none font-bold">
              Revenue {growthStats.isPositive ? "up" : "down"} by{" "}
              {growthStats.change}%
              {growthStats.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="text-muted-foreground leading-none text-xs">
              {revenueData.length > 0
                ? `${revenueData[0].month} - ${revenueData[revenueData.length - 1].month}`
                : "No data in range"}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
