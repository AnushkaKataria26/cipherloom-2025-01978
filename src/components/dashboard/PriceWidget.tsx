import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Star, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { fetchTopCryptos, type CryptoPrice } from "@/lib/cryptoApi";
import { Link } from "react-router-dom";

export function PriceWidget() {
  const [cryptos, setCryptos] = useState<CryptoPrice[]>([]);

  useEffect(() => {
    loadCryptos();
    const interval = setInterval(loadCryptos, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadCryptos = async () => {
    const data = await fetchTopCryptos(5);
    setCryptos(data);
  };
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Top Cryptocurrencies</CardTitle>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          View All
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {cryptos.map((crypto, index) => (
            <div 
              key={crypto.id} 
              className={`flex items-center justify-between p-4 hover:bg-surface-light transition-colors ${
                index !== cryptos.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-foreground">{crypto.name}</span>
                      <span className="text-sm text-muted-foreground">{crypto.symbol.toUpperCase()}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Vol: ${(crypto.total_volume / 1e9).toFixed(2)}B
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold text-foreground">${crypto.current_price.toLocaleString()}</div>
                <div className="flex items-center justify-end space-x-2">
                  <div className={`flex items-center text-sm font-medium ${
                    crypto.price_change_percentage_24h > 0 ? 'text-profit' : 'text-loss'
                  }`}>
                    {crypto.price_change_percentage_24h > 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {crypto.price_change_percentage_24h.toFixed(2)}%
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                      <DropdownMenuItem>Add to Portfolio</DropdownMenuItem>
                      <DropdownMenuItem>Set Alert</DropdownMenuItem>
                      <DropdownMenuItem>View Chart</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}