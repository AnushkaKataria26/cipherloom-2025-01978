import { Link } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { MarketOverview } from "@/components/dashboard/MarketOverview";
import { PriceWidget } from "@/components/dashboard/PriceWidget";
import { PortfolioWidget } from "@/components/dashboard/PortfolioWidget";
import { NewsWidget } from "@/components/dashboard/NewsWidget";
import { useAuth } from "@/contexts/AuthContext";
import { Bitcoin, TrendingUp, Shield, Zap } from "lucide-react";
import heroImage from "@/assets/crypto-hero.jpg";

const Index = () => {
  const { user } = useAuth();

  // Landing page for non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Bitcoin className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                CipherLoom
              </h1>
            </div>
            <Link to="/auth">
              <button className="px-6 py-2 bg-gradient-primary text-primary-foreground font-semibold rounded-lg hover:shadow-cipher-glow transition-all duration-200">
                Sign Up
              </button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url(${heroImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="relative container mx-auto px-6 py-24 md:py-32">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Master Crypto Trading
                </span>
                <br />
                <span className="text-foreground">With CipherLoom</span>
              </h2>
              <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                Your comprehensive crypto dashboard for advanced trading, portfolio management, 
                and market analysis. Stay ahead with real-time insights and AI-powered forecasting.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth" className="px-8 py-4 bg-gradient-primary text-primary-foreground font-semibold rounded-lg hover:shadow-cipher-glow transition-all duration-200 text-center">
                  Get Started Free
                </Link>
                <Link to="/auth" className="px-8 py-4 bg-surface-light text-foreground font-semibold rounded-lg border border-border hover:bg-surface-accent transition-all duration-200 text-center">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-surface">
          <div className="container mx-auto px-6">
            <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Everything You Need to Trade Smarter
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-primary-foreground" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Real-Time Markets</h4>
                <p className="text-text-secondary">
                  Track live cryptocurrency prices, market trends, and trading volumes across all major exchanges.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Portfolio Management</h4>
                <p className="text-text-secondary">
                  Manage your crypto portfolio with advanced analytics, performance tracking, and risk assessment.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary-foreground" />
                </div>
                <h4 className="text-xl font-semibold mb-2">AI-Powered Insights</h4>
                <p className="text-text-secondary">
                  Get intelligent market predictions and trading signals powered by advanced machine learning.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-dark">
          <div className="container mx-auto px-6 text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Trading?
            </h3>
            <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
              Join thousands of traders using CipherLoom to make smarter investment decisions.
            </p>
            <Link to="/auth" className="inline-block px-8 py-4 bg-gradient-primary text-primary-foreground font-semibold rounded-lg hover:shadow-cipher-glow transition-all duration-200">
              Create Your Account
            </Link>
          </div>
        </section>
      </div>
    );
  }

  // Dashboard for authenticated users
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <Header />
          <main className="flex-1 space-y-6 p-6">
            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-dark border border-border">
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `url(${heroImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="relative p-8 md:p-12">
                <div className="max-w-2xl">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Welcome back, <span className="bg-gradient-primary bg-clip-text text-transparent">
                      {user.email?.split('@')[0]}
                    </span>
                  </h1>
                  <p className="text-xl text-text-secondary mb-6 leading-relaxed">
                    Your comprehensive crypto dashboard for advanced trading, portfolio management, 
                    and market analysis. Stay ahead of the market with real-time insights.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/markets" className="px-6 py-3 bg-gradient-primary text-primary-foreground font-semibold rounded-lg hover:shadow-cipher-glow transition-all duration-200 text-center">
                      Explore Markets
                    </Link>
                    <Link to="/portfolio" className="px-6 py-3 bg-surface-light text-foreground font-semibold rounded-lg border border-border hover:bg-surface-accent transition-all duration-200 text-center">
                      View Portfolio
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Overview */}
            <MarketOverview />

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <PriceWidget />
                <NewsWidget />
              </div>
              <div className="space-y-6">
                <PortfolioWidget />
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
