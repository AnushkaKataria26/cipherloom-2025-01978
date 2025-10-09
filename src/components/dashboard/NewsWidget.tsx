import { ExternalLink, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { fetchCryptoNews, CryptoNewsItem } from "@/lib/cryptoApi";

const getCategoryFromTags = (tags: string): string => {
  const lower = tags.toLowerCase();
  if (lower.includes('etf') || lower.includes('bitcoin')) return 'ETF';
  if (lower.includes('ethereum') || lower.includes('upgrade')) return 'Technology';
  if (lower.includes('regulation') || lower.includes('sec')) return 'Regulation';
  if (lower.includes('defi')) return 'DeFi';
  return 'Market';
};

const getCategoryColor = (category: string) => {
  const colors = {
    ETF: "bg-cipher-blue/20 text-cipher-blue border-cipher-blue/30",
    Technology: "bg-cipher-cyan/20 text-cipher-cyan border-cipher-cyan/30",
    Regulation: "bg-warning/20 text-warning border-warning/30",
    DeFi: "bg-cipher-purple/20 text-cipher-purple border-cipher-purple/30",
    Market: "bg-surface-light text-text-secondary border-border",
  };
  return colors[category as keyof typeof colors] || "bg-surface-light text-text-secondary border-border";
};

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

export function NewsWidget() {
  const [news, setNews] = useState<CryptoNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      const data = await fetchCryptoNews(4);
      setNews(data);
      setLoading(false);
    };

    loadNews();
    const interval = setInterval(loadNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Latest Crypto News</CardTitle>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <ExternalLink className="w-4 h-4 mr-2" />
          View All
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`p-4 ${i !== 3 ? 'border-b border-border' : ''}`}>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))
          ) : (
            news.map((article, index) => {
              const category = getCategoryFromTags(article.title);
              return (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block p-4 hover:bg-surface-light transition-colors ${
                    index !== news.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getCategoryColor(category)}>
                        {category}
                      </Badge>
                      <TrendingUp className="w-3 h-3 text-profit" />
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {getTimeAgo(article.published_at)}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2 leading-tight">
                    {article.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                    {article.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-text-secondary">{article.source}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-primary">
                      Read More
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </a>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}