import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchTopCryptos, type CryptoPrice } from "@/lib/cryptoApi";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function Converter() {
  const [fromAmount, setFromAmount] = useState("1");
  const [toAmount, setToAmount] = useState("0");
  const [cryptos, setCryptos] = useState<CryptoPrice[]>([]);
  const [fromCrypto, setFromCrypto] = useState<CryptoPrice | null>(null);
  const [toCrypto, setToCrypto] = useState<CryptoPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFrom, setOpenFrom] = useState(false);
  const [openTo, setOpenTo] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCryptos();
  }, []);

  useEffect(() => {
    if (fromCrypto && toCrypto && fromAmount) {
      const amount = parseFloat(fromAmount);
      if (!isNaN(amount)) {
        const result = (amount * fromCrypto.current_price) / toCrypto.current_price;
        setToAmount(result.toFixed(8));
      }
    }
  }, [fromAmount, fromCrypto, toCrypto]);

  const loadCryptos = async () => {
    setLoading(true);
    const data = await fetchTopCryptos(100);
    setCryptos(data);
    if (data.length > 0) {
      setFromCrypto(data[0]); // Bitcoin
      setToCrypto(data[1]); // Ethereum
    }
    setLoading(false);
  };

  const handleSwap = () => {
    const tempCrypto = fromCrypto;
    setFromCrypto(toCrypto);
    setToCrypto(tempCrypto);
    
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleConvert = () => {
    if (fromCrypto && toCrypto) {
      toast({
        title: "Conversion complete",
        description: `${fromAmount} ${fromCrypto.symbol.toUpperCase()} = ${toAmount} ${toCrypto.symbol.toUpperCase()}`,
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">Currency Converter</h1>
          </header>
          
          <main className="p-6">
            <div className="max-w-2xl mx-auto">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Convert Cryptocurrency</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">From</label>
                        <div className="flex gap-2">
                          <Input 
                            type="number" 
                            value={fromAmount}
                            onChange={(e) => setFromAmount(e.target.value)}
                            className="flex-1"
                            placeholder="Enter amount"
                          />
                          <Popover open={openFrom} onOpenChange={setOpenFrom}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="min-w-[140px] justify-between">
                                {fromCrypto ? (
                                  <span className="flex items-center gap-2">
                                    <img src={fromCrypto.image} alt={fromCrypto.name} className="w-5 h-5" />
                                    {fromCrypto.symbol.toUpperCase()}
                                  </span>
                                ) : "Select"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0" align="end">
                              <Command>
                                <CommandInput placeholder="Search crypto..." />
                                <CommandList>
                                  <CommandEmpty>No crypto found.</CommandEmpty>
                                  <CommandGroup>
                                    {cryptos.map((crypto) => (
                                      <CommandItem
                                        key={crypto.id}
                                        value={crypto.id}
                                        onSelect={() => {
                                          setFromCrypto(crypto);
                                          setOpenFrom(false);
                                        }}
                                      >
                                        <img src={crypto.image} alt={crypto.name} className="w-5 h-5 mr-2" />
                                        <span className="font-medium">{crypto.name}</span>
                                        <span className="ml-2 text-muted-foreground">{crypto.symbol.toUpperCase()}</span>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-full"
                          onClick={handleSwap}
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">To</label>
                        <div className="flex gap-2">
                          <Input 
                            type="number" 
                            value={toAmount}
                            readOnly
                            className="flex-1"
                            placeholder="Result"
                          />
                          <Popover open={openTo} onOpenChange={setOpenTo}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="min-w-[140px] justify-between">
                                {toCrypto ? (
                                  <span className="flex items-center gap-2">
                                    <img src={toCrypto.image} alt={toCrypto.name} className="w-5 h-5" />
                                    {toCrypto.symbol.toUpperCase()}
                                  </span>
                                ) : "Select"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0" align="end">
                              <Command>
                                <CommandInput placeholder="Search crypto..." />
                                <CommandList>
                                  <CommandEmpty>No crypto found.</CommandEmpty>
                                  <CommandGroup>
                                    {cryptos.map((crypto) => (
                                      <CommandItem
                                        key={crypto.id}
                                        value={crypto.id}
                                        onSelect={() => {
                                          setToCrypto(crypto);
                                          setOpenTo(false);
                                        }}
                                      >
                                        <img src={crypto.image} alt={crypto.name} className="w-5 h-5 mr-2" />
                                        <span className="font-medium">{crypto.name}</span>
                                        <span className="ml-2 text-muted-foreground">{crypto.symbol.toUpperCase()}</span>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      {fromCrypto && toCrypto && (
                        <div className="p-4 rounded-lg bg-surface-accent">
                          <div className="text-sm text-muted-foreground">Exchange Rate</div>
                          <div className="text-lg font-semibold">
                            1 {fromCrypto.symbol.toUpperCase()} = {(fromCrypto.current_price / toCrypto.current_price).toFixed(8)} {toCrypto.symbol.toUpperCase()}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            1 {fromCrypto.symbol.toUpperCase()} = ${fromCrypto.current_price.toLocaleString()} USD
                          </div>
                        </div>
                      )}

                      <Button className="w-full" size="lg" onClick={handleConvert}>Convert</Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
