import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchGlobalMarketData } from "@/lib/cryptoApi";

export function MarketOverview() {
  const [marketData, setMarketData] = useState<any>(null);

  useEffect(() => {
    loadMarketData();
    const interval = setInterval(loadMarketData, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadMarketData = async () => {
    const data = await fetchGlobalMarketData();
    if (data) setMarketData(data);
  };

  if (!marketData) return null;

  const marketStats = [
    {
      title: "Total Market Cap",
      value: `$${(marketData.total_market_cap.usd / 1e12).toFixed(2)}T`,
      change: `${marketData.market_cap_change_percentage_24h_usd > 0 ? '+' : ''}${marketData.market_cap_change_percentage_24h_usd.toFixed(2)}%`,
      isPositive: marketData.market_cap_change_percentage_24h_usd > 0,
      icon: DollarSign,
    },
    {
      title: "24h Volume",
      value: `$${(marketData.total_volume.usd / 1e9).toFixed(1)}B`,
      change: `${marketData.market_cap_change_percentage_24h_usd > 0 ? '+' : ''}${marketData.market_cap_change_percentage_24h_usd.toFixed(2)}%`,
      isPositive: marketData.market_cap_change_percentage_24h_usd > 0,
      icon: BarChart3,
    },
    {
      title: "BTC Dominance",
      value: `${marketData.market_cap_percentage.btc.toFixed(1)}%`,
      change: `${marketData.market_cap_percentage.btc > 50 ? '+' : '-'}0.5%`,
      isPositive: marketData.market_cap_percentage.btc > 50,
      icon: TrendingUp,
    },
    {
      title: "Active Cryptocurrencies",
      value: marketData.active_cryptocurrencies.toLocaleString(),
      change: `+${marketData.markets}`,
      isPositive: true,
      icon: TrendingUp,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {marketStats.map((stat) => (
        <Card key={stat.title} className="bg-card border-border hover:shadow-cipher-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className={`flex items-center text-sm font-medium ${
                stat.isPositive ? 'text-profit' : 'text-loss'
              }`}>
                {stat.isPositive ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {stat.change}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}