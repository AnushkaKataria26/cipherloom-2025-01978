import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp, TrendingDown, Star } from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { fetchTopCryptos, CryptoPrice } from "@/lib/cryptoApi";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";


export default function Markets() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cryptoData, setCryptoData] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCryptoData();
    if (user) {
      loadFavorites();
    }
    const interval = setInterval(loadCryptoData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const loadCryptoData = async () => {
    const data = await fetchTopCryptos(50);
    setCryptoData(data);
    setLoading(false);
  };

  const loadFavorites = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('watchlist')
      .select('coin_id')
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error loading favorites:', error);
      return;
    }
    
    setFavorites(data?.map(item => item.coin_id) || []);
  };

  const toggleFavorite = async (coin: CryptoPrice, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add favorites",
        variant: "destructive",
      });
      return;
    }

    const isFavorite = favorites.includes(coin.id);
    
    if (isFavorite) {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('coin_id', coin.id);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to remove from favorites",
          variant: "destructive",
        });
        return;
      }
      
      setFavorites(prev => prev.filter(id => id !== coin.id));
      toast({
        title: "Removed from favorites",
        description: `${coin.symbol.toUpperCase()} removed from your watchlist`,
      });
    } else {
      const { error } = await supabase
        .from('watchlist')
        .insert({
          user_id: user.id,
          coin_id: coin.id,
          coin_symbol: coin.symbol,
          coin_name: coin.name,
        });
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to add to favorites",
          variant: "destructive",
        });
        return;
      }
      
      setFavorites(prev => [...prev, coin.id]);
      toast({
        title: "Added to favorites",
        description: `${coin.symbol.toUpperCase()} added to your watchlist`,
      });
    }
  };

  const filteredMarkets = cryptoData.filter(coin => 
    coin.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    return `$${volume.toFixed(2)}`;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">Markets</h1>
          </header>
          
          <main className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search cryptocurrencies..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={loadCryptoData} disabled={loading}>
                {loading ? "Loading..." : "Refresh"}
              </Button>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>All Cryptocurrencies</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading market data...</div>
                ) : filteredMarkets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No cryptocurrencies found</div>
                ) : (
                  <div className="space-y-4">
                    {filteredMarkets.map((coin) => (
                      <div key={coin.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-surface-accent transition-colors cursor-pointer" onClick={() => navigate(`/coin/${coin.id}`)}>
                        <div className="flex items-center gap-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={(e) => toggleFavorite(coin, e)}
                          >
                            <Star className={`h-4 w-4 ${favorites.includes(coin.id) ? 'fill-cipher-blue text-cipher-blue' : ''}`} />
                          </Button>
                          {coin.image && (
                            <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground">{coin.symbol.toUpperCase()}</span>
                              <span className="text-sm text-muted-foreground">{coin.name}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">Vol: {formatVolume(coin.total_volume)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-right">
                            <div className="font-semibold text-foreground">{formatPrice(coin.current_price)}</div>
                            <div className="text-sm text-muted-foreground">Cap: {formatVolume(coin.market_cap)}</div>
                          </div>
                          <Badge variant={coin.price_change_percentage_24h >= 0 ? "default" : "destructive"} className="min-w-[80px] justify-center">
                            {coin.price_change_percentage_24h >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                            {coin.price_change_percentage_24h.toFixed(2)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
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
