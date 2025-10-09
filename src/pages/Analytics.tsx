import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, BarChart3, PieChart } from "lucide-react";
import { fetchGlobalMarketData } from "@/lib/cryptoApi";

export default function Analytics() {
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketData();
    const interval = setInterval(loadMarketData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadMarketData = async () => {
    const data = await fetchGlobalMarketData();
    setMarketData(data);
    setLoading(false);
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">Analytics</h1>
          </header>
          
          <main className="p-6 space-y-6">
            <Tabs defaultValue="market" className="w-full">
              <TabsList>
                <TabsTrigger value="market">Market Analysis</TabsTrigger>
                <TabsTrigger value="trends">Market Trends</TabsTrigger>
                <TabsTrigger value="dominance">Dominance Chart</TabsTrigger>
              </TabsList>
              
              <TabsContent value="market" className="space-y-6 mt-6">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading market data...</div>
                ) : marketData ? (
                  <>
                    <div className="grid gap-6 md:grid-cols-3">
                      <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle className="text-sm font-medium">Market Trend</CardTitle>
                          <TrendingUp className="h-4 w-4 text-profit" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-profit">
                            {marketData.market_cap_change_percentage_24h_usd >= 0 ? 'Bullish' : 'Bearish'}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {marketData.market_cap_change_percentage_24h_usd >= 0 ? '+' : ''}
                            {marketData.market_cap_change_percentage_24h_usd.toFixed(2)}% in 24h
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle className="text-sm font-medium">Total Market Cap</CardTitle>
                          <BarChart3 className="h-4 w-4 text-cipher-blue" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {formatMarketCap(marketData.total_market_cap.usd)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Across {marketData.active_cryptocurrencies} cryptocurrencies
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle className="text-sm font-medium">24h Trading Volume</CardTitle>
                          <PieChart className="h-4 w-4 text-cipher-cyan" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {formatMarketCap(marketData.total_volume.usd)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {marketData.markets} active markets
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bg-card border-border">
                      <CardHeader>
                        <CardTitle>Market Dominance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Bitcoin (BTC)</span>
                          <span className="font-semibold">{marketData.market_cap_percentage.btc.toFixed(2)}%</span>
                        </div>
                        <div className="w-full bg-surface-accent rounded-full h-2">
                          <div 
                            className="bg-gradient-primary h-2 rounded-full" 
                            style={{ width: `${marketData.market_cap_percentage.btc}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Ethereum (ETH)</span>
                          <span className="font-semibold">{marketData.market_cap_percentage.eth.toFixed(2)}%</span>
                        </div>
                        <div className="w-full bg-surface-accent rounded-full h-2">
                          <div 
                            className="bg-cipher-blue h-2 rounded-full" 
                            style={{ width: `${marketData.market_cap_percentage.eth}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">Failed to load market data</div>
                )}
              </TabsContent>
              
              <TabsContent value="trends" className="mt-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Market Trends Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {marketData ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg border border-border">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">DeFi Market Cap</span>
                            <span>{formatMarketCap(marketData.defi_market_cap || 0)}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {((marketData.defi_market_cap / marketData.total_market_cap.usd) * 100).toFixed(2)}% of total market
                          </div>
                        </div>

                        <div className="p-4 rounded-lg border border-border">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Active Markets</span>
                            <span>{marketData.markets.toLocaleString()}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Trading pairs available
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Loading trend data...</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="dominance" className="mt-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Market Cap Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {marketData ? (
                      <div className="space-y-6">
                        {Object.entries(marketData.market_cap_percentage)
                          .sort(([, a]: any, [, b]: any) => b - a)
                          .slice(0, 10)
                          .map(([coin, percentage]: any) => (
                            <div key={coin} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium uppercase">{coin}</span>
                                <span className="text-sm text-muted-foreground">
                                  {percentage.toFixed(2)}%
                                </span>
                              </div>
                              <div className="w-full bg-surface-accent rounded-full h-2">
                                <div 
                                  className="bg-gradient-primary h-2 rounded-full transition-all" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Loading dominance data...</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
