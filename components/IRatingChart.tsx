"use client";

import { useState, useEffect } from "react";
import type { Category, ChartDataPoint } from "@/lib/types";
import CategoryTabs from "./CategoryTabs";

const CATEGORY_COLORS: Record<Category, string> = {
  road: "#3b82f6",
  oval: "#ef4444",
  dirt_road: "#f97316",
  dirt_oval: "#b45309",
};

interface IRatingChartProps {
  chartData: Record<Category, ChartDataPoint[]>;
}

export default function IRatingChart({ chartData }: IRatingChartProps) {
  const [category, setCategory] = useState<Category>("road");
  const [mounted, setMounted] = useState(false);
  const [RechartsComponents, setRechartsComponents] = useState<{
    AreaChart: React.ComponentType<Record<string, unknown>>;
    Area: React.ComponentType<Record<string, unknown>>;
    XAxis: React.ComponentType<Record<string, unknown>>;
    YAxis: React.ComponentType<Record<string, unknown>>;
    CartesianGrid: React.ComponentType<Record<string, unknown>>;
    Tooltip: React.ComponentType<Record<string, unknown>>;
    ResponsiveContainer: React.ComponentType<Record<string, unknown>>;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    import("recharts").then((mod) => {
      setRechartsComponents({
        AreaChart: mod.AreaChart as unknown as React.ComponentType<Record<string, unknown>>,
        Area: mod.Area as unknown as React.ComponentType<Record<string, unknown>>,
        XAxis: mod.XAxis as unknown as React.ComponentType<Record<string, unknown>>,
        YAxis: mod.YAxis as unknown as React.ComponentType<Record<string, unknown>>,
        CartesianGrid: mod.CartesianGrid as unknown as React.ComponentType<Record<string, unknown>>,
        Tooltip: mod.Tooltip as unknown as React.ComponentType<Record<string, unknown>>,
        ResponsiveContainer: mod.ResponsiveContainer as unknown as React.ComponentType<Record<string, unknown>>,
      });
    });
  }, []);

  const data = chartData[category] ?? [];
  const color = CATEGORY_COLORS[category];

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
      <h2 className="text-lg font-semibold text-gray-100 mb-4">
        iRating History
      </h2>
      <CategoryTabs selected={category} onSelect={setCategory} />

      <div className="mt-4 h-72">
        {!mounted || !RechartsComponents || data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            {data.length === 0 && mounted
              ? "No chart data available for this category."
              : "Loading chart..."}
          </div>
        ) : (
          <RechartsComponents.ResponsiveContainer width="100%" height="100%">
            <RechartsComponents.AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <defs>
                <linearGradient id={`gradient-${category}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <RechartsComponents.CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <RechartsComponents.XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(val: string) => {
                  const d = new Date(val);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <RechartsComponents.YAxis stroke="#6b7280" fontSize={12} domain={["auto", "auto"]} />
              <RechartsComponents.Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #374151",
                  borderRadius: "0.5rem",
                  color: "#f3f4f6",
                  fontSize: "0.875rem",
                }}
                labelFormatter={(label: string) =>
                  new Date(label).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                }
                formatter={(value: number) => [value.toLocaleString(), "iRating"]}
              />
              <RechartsComponents.Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${category})`}
              />
            </RechartsComponents.AreaChart>
          </RechartsComponents.ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
