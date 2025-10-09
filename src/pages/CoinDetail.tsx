import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { PriceChart } from "@/components/charts/PriceChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { fetchTopCryptos } from "@/lib/cryptoApi";

export default function CoinDetail() {
  const { coinId } = useParams<{ coinId: string }>();
  const navigate = useNavigate();
  const [coinData, setCoinData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoinData();
  }, [coinId]);

  const loadCoinData = async () => {
    const data = await fetchTopCryptos(250);
    const coin = data.find((c) => c.id === coinId);
    setCoinData(coin);
    setLoading(false);
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex-1">
            <Header />
            <main className="p-6">
              <p>Loading...</p>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!coinData) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex-1">
            <Header />
            <main className="p-6">
              <p>Coin not found</p>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1">
          <Header />
          <main className="p-6 space-y-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/markets")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Markets
            </Button>

            <div className="flex items-center gap-4">
              <img src={coinData.image} alt={coinData.name} className="w-12 h-12" />
              <div>
                <h1 className="text-3xl font-bold">{coinData.name}</h1>
                <p className="text-muted-foreground text-lg">{coinData.symbol.toUpperCase()}</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Current Price</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    ${coinData.current_price.toLocaleString()}
                  </p>
                  <div className={`flex items-center gap-1 mt-2 ${
                    coinData.price_change_percentage_24h >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}>
                    {coinData.price_change_percentage_24h >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="font-semibold">
                      {coinData.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Cap</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    ${(coinData.market_cap / 1e9).toFixed(2)}B
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>24h Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    ${(coinData.total_volume / 1e9).toFixed(2)}B
                  </p>
                </CardContent>
              </Card>
            </div>

            <PriceChart coinId={coinData.id} coinName={coinData.name} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
