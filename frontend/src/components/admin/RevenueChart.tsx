import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import type { RevenueOverviewItem } from "@/types/dashboard";

interface RevenueChartProps {
  data: RevenueOverviewItem[];
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-card px-3 py-2 text-sm shadow-md">
      <p className="font-semibold text-foreground">Month: {label}</p>
      <p className="text-muted-foreground">
        Revenue: {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1);
  return date.toLocaleString("en-US", { month: "short", year: "numeric" });
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      name: formatMonthLabel(item.month),
      revenue: item.revenue,
      monthKey: item.month,
    }));
  }, [data]);

  const { total, avg } = useMemo(() => {
    const total = chartData.reduce((sum, d) => sum + d.revenue, 0);
    return {
      total,
      avg: chartData.length ? Math.round(total / chartData.length) : 0,
    };
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="min-w-0 rounded-2xl border bg-card p-4 sm:p-6 shadow-sm">
        <div className="mb-4 sm:mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">Revenue Overview</h2>
            <p className="text-sm text-muted-foreground">
              Track your store revenue over time
            </p>
          </div>
        </div>
        <div className="h-[240px] sm:h-[320px] w-full min-w-0 flex items-center justify-center">
          <p className="text-muted-foreground">No revenue data available</p>
        </div>
        <div className="mt-4 sm:mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-sm font-medium">Revenue</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="whitespace-nowrap">
              Total: {formatCurrency(total)}
            </span>
            <span className="whitespace-nowrap">
              Avg: {formatCurrency(avg)}/mo
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 rounded-2xl border bg-card p-4 sm:p-6 shadow-sm">
      <div className="mb-4 sm:mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold">Revenue Overview</h2>
          <p className="text-sm text-muted-foreground">
            Track your store revenue over time
          </p>
        </div>
      </div>

      <div className="h-[240px] sm:h-[320px] w-full min-w-0 text-muted-foreground">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  className="text-primary"
                  offset="5%"
                  stopColor="currentColor"
                  stopOpacity={0.35}
                />
                <stop
                  className="text-primary"
                  offset="95%"
                  stopColor="currentColor"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="currentColor"
              strokeOpacity={0.2}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "currentColor" }}
              tickMargin={8}
              interval="preserveStartEnd"
              minTickGap={16}
            />
            <YAxis
              width={44}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "currentColor" }}
              tickFormatter={(v: number) =>
                formatCurrency(v).replace(/\.00$/, "k")
              }
            />
            <Tooltip
              cursor={{ stroke: "currentColor", strokeOpacity: 0.3 }}
              content={<ChartTooltip />}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              className="stroke-primary"
              strokeWidth={2.5}
              fill="url(#revenue-gradient)"
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                className: "fill-primary stroke-background",
              }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 sm:mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-sm font-medium">Revenue</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="whitespace-nowrap">
            Total: {formatCurrency(total)}
          </span>
          <span className="whitespace-nowrap">
            Avg: {formatCurrency(avg)}/mo
          </span>
        </div>
      </div>
    </div>
  );
}
