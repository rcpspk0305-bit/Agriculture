"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Props = {
  data: number[];
  comparisonData?: number[];
  unit: string;
  color?: string;
  label?: string;
  comparisonLabel?: string;
};

export default function DetailedChart({ 
  data, 
  comparisonData, 
  unit, 
  color = "#00d166",
  label = "Today",
  comparisonLabel = "Previous"
}: Props) {
  const chartData = data.map((val, i) => ({
    time: i,
    today: val,
    previous: comparisonData ? comparisonData[i] : undefined,
  }));

  return (
    <div style={{ width: "100%", height: 320, marginTop: 24 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorToday" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8ca395" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#8ca395" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="time" hide />
          <YAxis 
            stroke="rgba(255,255,255,0.3)" 
            fontSize={12}
            tickFormatter={(value) => `${value}${unit}`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "rgba(10, 17, 15, 0.9)", 
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              color: "#fff",
              backdropFilter: "blur(10px)"
            }}
            itemStyle={{ fontSize: "14px" }}
            labelStyle={{ display: "none" }}
          />
          {comparisonData && (
            <Area
              type="monotone"
              dataKey="previous"
              name={comparisonLabel}
              stroke="#8ca395"
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#colorPrev)"
            />
          )}
          <Area
            type="monotone"
            dataKey="today"
            name={label}
            stroke={color}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorToday)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
