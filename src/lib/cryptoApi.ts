// CoinGecko API utilities for fetching real crypto data
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
  image: string;
}

export interface CryptoDetails extends CryptoPrice {
  market_cap_rank: number;
  high_24h: number;
  low_24h: number;
  circulating_supply: number;
}

export async function fetchTopCryptos(limit: number = 50): Promise<CryptoPrice[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`
    );
    
    if (!response.ok) throw new Error('Failed to fetch crypto data');
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return [];
  }
}

export async function fetchCryptoPrice(coinId: string): Promise<number | null> {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/simple/price?ids=${coinId}&vs_currencies=usd`
    );
    
    if (!response.ok) throw new Error('Failed to fetch price');
    
    const data = await response.json();
    return data[coinId]?.usd || null;
  } catch (error) {
    console.error('Error fetching price:', error);
    return null;
  }
}

export async function searchCrypto(query: string): Promise<CryptoPrice[]> {
  if (!query) return [];
  
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/search?query=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) throw new Error('Failed to search crypto');
    
    const data = await response.json();
    return data.coins.slice(0, 10).map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.thumb,
    }));
  } catch (error) {
    console.error('Error searching crypto:', error);
    return [];
  }
}

export async function fetchGlobalMarketData() {
  try {
    const response = await fetch(`${COINGECKO_API_BASE}/global`);
    
    if (!response.ok) throw new Error('Failed to fetch global data');
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching global data:', error);
    return null;
  }
}

export async function fetchHistoricalData(coinId: string, days: number = 7) {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
    );
    
    if (!response.ok) throw new Error('Failed to fetch historical data');
    
    const data = await response.json();
    return data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      date: new Date(timestamp).toLocaleDateString(),
      price: price,
    }));
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return [];
  }
}

export interface CryptoNewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  published_at: string;
  image_url?: string;
}

export async function fetchCryptoNews(limit: number = 10): Promise<CryptoNewsItem[]> {
  try {
    const response = await fetch(
      `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest`
    );
    
    if (!response.ok) throw new Error('Failed to fetch news');
    
    const data = await response.json();
    return data.Data.slice(0, limit).map((article: any) => ({
      id: article.id,
      title: article.title,
      description: article.body,
      url: article.url,
      source: article.source_info.name,
      published_at: new Date(article.published_on * 1000).toISOString(),
      image_url: article.imageurl,
    }));
  } catch (error) {
    console.error('Error fetching crypto news:', error);
    return [];
  }
}
