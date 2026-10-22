import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueDataPoint {
  name: string;
  revenue: number;
  orders: number;
}

type Period = "7d" | "30d" | "90d" | "1y";

// Deterministic pseudo-random so data is stable across renders (and SSR-safe)
const seeded = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

const periodData: Record<Period, RevenueDataPoint[]> = {
  "7d": [
    { name: "Mon", revenue: 8500, orders: 85 },
    { name: "Tue", revenue: 9200, orders: 92 },
    { name: "Wed", revenue: 7800, orders: 78 },
    { name: "Thu", revenue: 9500, orders: 95 },
    { name: "Fri", revenue: 11000, orders: 110 },
    { name: "Sat", revenue: 12500, orders: 125 },
    { name: "Sun", revenue: 10800, orders: 108 },
  ],
  "30d": Array.from({ length: 30 }, (_, i) => ({
    name: `${i + 1}`,
    revenue: Math.floor(seeded(i + 1) * 5000) + 3000,
    orders: Math.floor(seeded(i + 101) * 50) + 30,
  })),
  "90d": Array.from({ length: 12 }, (_, i) => ({
    name: `W${i + 1}`,
    revenue: Math.floor(seeded(i + 201) * 30000) + 20000,
    orders: Math.floor(seeded(i + 301) * 300) + 200,
  })),
  "1y": [
    { name: "Jan", revenue: 42000, orders: 420 },
    { name: "Feb", revenue: 38000, orders: 380 },
    { name: "Mar", revenue: 48000, orders: 480 },
    { name: "Apr", revenue: 52000, orders: 520 },
    { name: "May", revenue: 49000, orders: 490 },
    { name: "Jun", revenue: 58000, orders: 580 },
    { name: "Jul", revenue: 62000, orders: 620 },
    { name: "Aug", revenue: 59000, orders: 590 },
    { name: "Sep", revenue: 65000, orders: 650 },
    { name: "Oct", revenue: 71000, orders: 710 },
    { name: "Nov", revenue: 78000, orders: 780 },
    { name: "Dec", revenue: 85000, orders: 850 },
  ],
};

const periods: { value: Period; label: string }[] = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "1y", label: "1 Year" },
];

const labelPrefix: Record<Period, string> = {
  "7d": "Day",
  "30d": "Day",
  "90d": "Week",
  "1y": "Month",
};

const unitLabel: Record<Period, string> = {
  "7d": "day",
  "30d": "day",
  "90d": "week",
  "1y": "mo",
};

function ChartTooltip({
  active,
  payload,
  label,
  period,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  period: Period;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-card px-3 py-2 text-sm shadow-md">
      <p className="font-semibold text-foreground">
        {labelPrefix[period]}: {label}
      </p>
      <p className="text-muted-foreground">
        Revenue: ${payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

export function RevenueChart() {
  const [period, setPeriod] = useState<Period>("1y");
  const data = periodData[period];

  const { total, avg } = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.revenue, 0);
    return { total, avg: data.length ? Math.round(total / data.length) : 0 };
  }, [data]);

  return (
    <div className="min-w-0 rounded-2xl border bg-card p-4 sm:p-6 shadow-sm">
      <div className="mb-4 sm:mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold">Revenue Overview</h2>
          <p className="text-sm text-muted-foreground">
            Track your store revenue over time
          </p>
        </div>
        <select
          className="h-9 w-full sm:w-auto rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring"
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          aria-label="Select time period"
        >
          {periods.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Explicit height on the parent is what ResponsiveContainer needs.
          text-muted-foreground drives axis/grid colors via currentColor. */}
      <div className="h-[240px] sm:h-[320px] w-full min-w-0 text-muted-foreground">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
                {/* currentColor + text-primary works regardless of whether
                    your theme variables are hsl, oklch or hex */}
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
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              cursor={{ stroke: "currentColor", strokeOpacity: 0.3 }}
              content={<ChartTooltip period={period} />}
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
            Total: ${total.toLocaleString()}
          </span>
          <span className="whitespace-nowrap">
            Avg: ${avg.toLocaleString()}/{unitLabel[period]}
          </span>
        </div>
      </div>
    </div>
  );
}
