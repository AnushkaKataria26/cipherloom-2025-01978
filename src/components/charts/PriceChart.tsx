import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useState, useEffect } from "react";
import { fetchHistoricalData } from "@/lib/cryptoApi";
import { Button } from "@/components/ui/button";

interface PriceChartProps {
  coinId: string;
  coinName: string;
}

export function PriceChart({ coinId, coinName }: PriceChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<number>(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, [coinId, timeRange]);

  const loadChartData = async () => {
    setLoading(true);
    const data = await fetchHistoricalData(coinId, timeRange);
    setChartData(data);
    setLoading(false);
  };

  const chartConfig = {
    price: {
      label: "Price",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{coinName} Price Chart</CardTitle>
        <CardDescription>Historical price data</CardDescription>
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            variant={timeRange === 1 ? "default" : "outline"}
            onClick={() => setTimeRange(1)}
          >
            24H
          </Button>
          <Button
            size="sm"
            variant={timeRange === 7 ? "default" : "outline"}
            onClick={() => setTimeRange(7)}
          >
            7D
          </Button>
          <Button
            size="sm"
            variant={timeRange === 30 ? "default" : "outline"}
            onClick={() => setTimeRange(30)}
          >
            30D
          </Button>
          <Button
            size="sm"
            variant={timeRange === 90 ? "default" : "outline"}
            onClick={() => setTimeRange(90)}
          >
            90D
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading chart...</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
