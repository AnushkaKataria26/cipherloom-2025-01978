import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AddTransactionDialog } from "@/components/portfolio/AddTransactionDialog";
import { fetchCryptoPrice } from "@/lib/cryptoApi";

interface Holding {
  id: string;
  coin_symbol: string;
  coin_name: string;
  amount: number;
  purchase_price: number;
  purchase_date: string;
  current_price?: number;
}

export default function Portfolio() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      navigate("/auth");
      return;
    }
    loadHoldings();
  }, [session, navigate]);

  const loadHoldings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("portfolio_holdings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch current prices for all holdings
      const holdingsWithPrices = await Promise.all(
        (data || []).map(async (holding) => {
          const price = await fetchCryptoPrice(holding.coin_symbol.toLowerCase());
          return { ...holding, current_price: price || undefined };
        })
      );

      setHoldings(holdingsWithPrices);
    } catch (error: any) {
      toast({
        title: "Error loading portfolio",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("portfolio_holdings")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Transaction deleted",
        description: "Successfully removed from portfolio",
      });
      loadHoldings();
    } catch (error: any) {
      toast({
        title: "Error deleting transaction",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    const csv = [
      ['Coin', 'Amount', 'Purchase Price', 'Current Price', 'Total Value', 'Profit/Loss'],
      ...holdings.map(h => [
        h.coin_name,
        h.amount,
        h.purchase_price,
        h.current_price || 'N/A',
        h.current_price ? (h.amount * h.current_price).toFixed(2) : 'N/A',
        h.current_price ? ((h.amount * h.current_price) - (h.amount * h.purchase_price)).toFixed(2) : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio.csv';
    a.click();

    toast({
      title: "Portfolio exported",
      description: "Your portfolio data has been downloaded",
    });
  };

  const totalValue = holdings.reduce((sum, h) => 
    sum + (h.current_price ? h.amount * h.current_price : 0), 0
  );
  const totalInvested = holdings.reduce((sum, h) => sum + (h.amount * h.purchase_price), 0);
  const totalReturn = totalValue - totalInvested;
  const roi = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">Portfolio</h1>
          </header>
          
          <main className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">Manage your crypto holdings and track performance</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExport} disabled={holdings.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <AddTransactionDialog onSuccess={loadHoldings} />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Total Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Total Return</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>ROI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${roi >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading holdings...</div>
                ) : holdings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No holdings yet. Add your first transaction to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {holdings.map((holding) => {
                      const currentValue = holding.current_price ? holding.amount * holding.current_price : 0;
                      const investedValue = holding.amount * holding.purchase_price;
                      const profit = currentValue - investedValue;
                      const profitPercent = investedValue > 0 ? (profit / investedValue) * 100 : 0;

                      return (
                        <div key={holding.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                          <div>
                            <div className="font-semibold">{holding.coin_name} ({holding.coin_symbol})</div>
                            <div className="text-sm text-muted-foreground">
                              {holding.amount} @ ${holding.purchase_price.toFixed(2)}
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-4">
                            <div>
                              <div className="font-semibold">${currentValue.toFixed(2)}</div>
                              <div className={`text-sm ${profit >= 0 ? 'text-profit' : 'text-loss'}`}>
                                {profit >= 0 ? '+' : ''}${profit.toFixed(2)} ({profitPercent.toFixed(2)}%)
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(holding.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
