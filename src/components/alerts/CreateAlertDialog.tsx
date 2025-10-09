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

interface CreateAlertDialogProps {
  onSuccess?: () => void;
}

export function CreateAlertDialog({ onSuccess }: CreateAlertDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<CryptoPrice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<CryptoPrice | null>(null);
  const [alertType, setAlertType] = useState<string>("price_above");
  const [targetValue, setTargetValue] = useState("");

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
      const { error } = await supabase.from("price_alerts").insert({
        user_id: user.id,
        coin_symbol: selectedCoin.symbol,
        coin_name: selectedCoin.name,
        alert_type: alertType,
        target_value: parseFloat(targetValue),
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "Alert created",
        description: `You'll be notified when ${selectedCoin.symbol} ${
          alertType === "price_above" ? "goes above" : "goes below"
        } $${targetValue}`,
      });

      setOpen(false);
      setSelectedCoin(null);
      setTargetValue("");
      setSearchQuery("");
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error creating alert",
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
          Create Alert
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Price Alert</DialogTitle>
          <DialogDescription>
            Get notified when a cryptocurrency reaches your target price
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
            <Label htmlFor="type">Alert Type *</Label>
            <Select value={alertType} onValueChange={setAlertType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price_above">Price Above</SelectItem>
                <SelectItem value="price_below">Price Below</SelectItem>
                <SelectItem value="volume_spike">Volume Spike</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">
              {alertType === "volume_spike" ? "Percentage Increase (%)" : "Target Price (USD)"} *
            </Label>
            <Input
              id="target"
              type="number"
              step="any"
              placeholder={alertType === "volume_spike" ? "50" : "0.00"}
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || !selectedCoin}>
            {loading ? "Creating..." : "Create Alert"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
