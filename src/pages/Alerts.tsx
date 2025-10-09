import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CreateAlertDialog } from "@/components/alerts/CreateAlertDialog";
import { Switch } from "@/components/ui/switch";

interface Alert {
  id: string;
  coin_symbol: string;
  coin_name: string;
  alert_type: string;
  target_value: number;
  is_active: boolean;
  triggered_at: string | null;
  created_at: string;
}

export default function Alerts() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      navigate("/auth");
      return;
    }
    loadAlerts();
  }, [session, navigate]);

  const loadAlerts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("price_alerts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading alerts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from("price_alerts")
        .update({ is_active: !currentState })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: currentState ? "Alert disabled" : "Alert enabled",
        description: `Alert has been ${currentState ? 'disabled' : 'enabled'}`,
      });
      loadAlerts();
    } catch (error: any) {
      toast({
        title: "Error updating alert",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("price_alerts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Alert deleted",
        description: "Successfully removed alert",
      });
      loadAlerts();
    } catch (error: any) {
      toast({
        title: "Error deleting alert",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getAlertDescription = (alert: Alert) => {
    const typeLabels = {
      price_above: `Price above $${alert.target_value}`,
      price_below: `Price below $${alert.target_value}`,
      volume_spike: `Volume spike +${alert.target_value}%`,
    };
    return typeLabels[alert.alert_type as keyof typeof typeLabels] || alert.alert_type;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">Price Alerts</h1>
          </header>
          
          <main className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">Set custom alerts for price movements and market events</p>
              <CreateAlertDialog onSuccess={loadAlerts} />
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Your Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading alerts...</div>
                ) : alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No alerts yet. Create your first alert to get notified about price changes.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                        <div className="flex items-center gap-4">
                          <Bell className={`h-5 w-5 ${alert.triggered_at ? 'text-profit' : 'text-muted-foreground'}`} />
                          <div>
                            <div className="font-semibold">{alert.coin_name} ({alert.coin_symbol})</div>
                            <div className="text-sm text-muted-foreground">{getAlertDescription(alert)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {alert.triggered_at && (
                            <Badge variant="default">Triggered</Badge>
                          )}
                          <Switch
                            checked={alert.is_active}
                            onCheckedChange={() => handleToggleActive(alert.id, alert.is_active)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(alert.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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
