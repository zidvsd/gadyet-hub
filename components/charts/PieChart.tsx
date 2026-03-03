"use client";

import { LabelList, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Package } from "lucide-react";

const chartConfig = {
  count: {
    label: "Orders",
  },
  completed: {
    label: "Completed",
    color: "var(--color-chart-2)",
  },
  processing: {
    label: "Processing",
    color: "var(--color-chart-1)",
  },
  pending: {
    label: "Pending",
    color: "var(--color-chart-3)",
  },
  cancelled: {
    label: "Cancelled",
    color: "var(--color-chart-5)",
  },
} satisfies ChartConfig;

interface OrderPieProps {
  data: { status: string; count: number; fill: string }[];
}

export function ChartPieLabelList({ data }: OrderPieProps) {
  return (
    <Card className="flex flex-col shadow-none">
      <CardHeader className="items-center pb-0">
        <CardTitle>Order Status</CardTitle>
        <CardDescription>Current breakdown of all store orders</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          {/* 1. Added margin to create space for the 'outside' labels */}
          <PieChart margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="count" hideLabel />}
            />
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              innerRadius={50}
              // 2. Reduced outerRadius to 70% to prevent it from hitting the edges
              outerRadius="70%"
              strokeWidth={2}
            >
              <LabelList
                dataKey="status"
                className="fill-foreground capitalize"
                stroke="none"
                fontSize={12}
                // 3. Adjusted offset so labels aren't too far from the pie
                offset={10}
                position="outside"
              />
              <LabelList
                dataKey="count"
                className="fill-background font-bold"
                stroke="none"
                fontSize={12}
                position="inside"
              />
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="status" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          <Package className="size-4" />
          Total Orders: {data.reduce((sum, d) => sum + d.count, 0)}
        </div>
        {data.length > 0 &&
          (() => {
            const mostStatus = data.reduce((prev, curr) =>
              curr.count > prev.count ? curr : prev,
            );
            return (
              <div className="flex items-center gap-2 leading-none text-muted-foreground">
                Most orders are{" "}
                <span className="capitalize">{mostStatus.status}</span> (
                {mostStatus.count})
              </div>
            );
          })()}
      </CardFooter>
    </Card>
  );
}
