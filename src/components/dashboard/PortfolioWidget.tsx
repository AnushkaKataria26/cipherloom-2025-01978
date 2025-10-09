import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, PieChart, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { fetchTopCryptos } from "@/lib/cryptoApi";

export function PortfolioWidget() {
  const { user } = useAuth();
  const [holdings, setHoldings] = useState<any[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalChange, setTotalChange] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPortfolio();
    }
  }, [user]);

  const loadPortfolio = async () => {
    setLoading(true);
    const { data: portfolioData } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('user_id', user!.id);

    if (portfolioData && portfolioData.length > 0) {
      const cryptos = await fetchTopCryptos(100);
      
      let total = 0;
      let initialTotal = 0;
      const enrichedHoldings = portfolioData.map((holding) => {
        const crypto = cryptos.find(c => c.symbol.toLowerCase() === holding.coin_symbol.toLowerCase());
        const currentValue = crypto ? holding.amount * crypto.current_price : 0;
        const initialValue = holding.amount * holding.purchase_price;
        total += currentValue;
        initialTotal += initialValue;
        
        return {
          ...holding,
          currentPrice: crypto?.current_price || 0,
          currentValue,
          percentage: 0,
          change: crypto ? ((crypto.current_price - holding.purchase_price) / holding.purchase_price * 100) : 0,
          color: getRandomColor()
        };
      });

      enrichedHoldings.forEach(h => {
        h.percentage = (h.currentValue / total) * 100;
      });

      setHoldings(enrichedHoldings.slice(0, 4));
      setTotalValue(total);
      setTotalChange(((total - initialTotal) / initialTotal) * 100);
    }
    setLoading(false);
  };

  const getRandomColor = () => {
    const colors = ['bg-cipher-blue', 'bg-cipher-cyan', 'bg-cipher-purple', 'bg-profit'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (loading || holdings.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Portfolio Overview</CardTitle>
          <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
            <Link to="/portfolio">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Add transactions to track your portfolio</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Portfolio Overview</CardTitle>
        <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
          <Link to="/portfolio">
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {/* Portfolio Summary */}
        <div className="mb-6 p-4 rounded-lg bg-gradient-dark border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Portfolio Value</span>
            <div className={`flex items-center text-sm font-medium ${
              totalChange >= 0 ? 'text-profit' : 'text-loss'
            }`}>
              {totalChange >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {totalChange.toFixed(2)}%
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`text-sm font-medium ${
            totalChange >= 0 ? 'text-profit' : 'text-loss'
          }`}>
            {totalChange >= 0 ? '+' : ''}${(totalValue * (totalChange / 100)).toFixed(2)}
          </div>
        </div>

        {/* Holdings Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Holdings</span>
            <PieChart className="w-4 h-4 text-muted-foreground" />
          </div>
          
          {holdings.map((holding) => (
            <div key={holding.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${holding.color}`}></div>
                  <span className="font-medium text-foreground">{holding.coin_symbol.toUpperCase()}</span>
                  <span className="text-sm text-muted-foreground">{holding.coin_name}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium text-foreground">${holding.currentValue.toFixed(2)}</div>
                  <div className={`text-xs ${
                    holding.change >= 0 ? 'text-profit' : 'text-loss'
                  }`}>
                    {holding.change >= 0 ? '+' : ''}{holding.change.toFixed(2)}%
                  </div>
                </div>
              </div>
              <Progress 
                value={holding.percentage} 
                className="h-2"
              />
              <div className="text-xs text-muted-foreground text-right">
                {holding.percentage.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}