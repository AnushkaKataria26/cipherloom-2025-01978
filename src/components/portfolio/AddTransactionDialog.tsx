import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus } from "lucide-react";
import { searchCrypto, CryptoPrice } from "@/lib/cryptoApi";

interface AddTransactionDialogProps {
  onSuccess?: () => void;
}

export function AddTransactionDialog({ onSuccess }: AddTransactionDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<CryptoPrice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<CryptoPrice | null>(null);
  const [amount, setAmount] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 1) {
      const results = await searchCrypto(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoin || !user) return;

    setLoading(true);

    try {
      const { error } = await supabase.from("portfolio_holdings").insert({
        user_id: user.id,
        coin_symbol: selectedCoin.symbol,
        coin_name: selectedCoin.name,
        amount: parseFloat(amount),
        purchase_price: parseFloat(purchasePrice),
        purchase_date: new Date(purchaseDate).toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Transaction added",
        description: `Successfully added ${amount} ${selectedCoin.symbol} to your portfolio`,
      });

      setOpen(false);
      setSelectedCoin(null);
      setAmount("");
      setPurchasePrice("");
      setSearchQuery("");
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error adding transaction",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Add a new cryptocurrency transaction to your portfolio
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="coin">Cryptocurrency *</Label>
            {selectedCoin ? (
              <div className="flex items-center justify-between p-2 border rounded-md">
                <span>{selectedCoin.name} ({selectedCoin.symbol})</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCoin(null)}
                >
                  Change
                </Button>
              </div>
            ) : (
              <>
                <Input
                  id="coin"
                  placeholder="Search cryptocurrency..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {searchResults.length > 0 && (
                  <div className="border rounded-md max-h-48 overflow-y-auto">
                    {searchResults.map((coin) => (
                      <button
                        key={coin.id}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-surface-accent transition-colors"
                        onClick={() => {
                          setSelectedCoin(coin);
                          setSearchResults([]);
                        }}
                      >
                        {coin.name} ({coin.symbol})
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Purchase Price (USD) *</Label>
            <Input
              id="price"
              type="number"
              step="any"
              placeholder="0.00"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Purchase Date *</Label>
            <Input
              id="date"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || !selectedCoin}>
            {loading ? "Adding..." : "Add Transaction"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
