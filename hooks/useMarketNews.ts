import { useEffect, useState } from "react";

interface NewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

interface NewsResponse {
  Data: NewsItem[];
}

export function useMarketNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/market-data/news');
        if (!response.ok) {
          throw new Error('Failed to fetch market news');
        }

        const data = await response.json() as NewsResponse;
        setNews(data.Data || []);
        setError(null);
      } catch (err) {
        setError('Failed to load market news');
        console.error('Error fetching market news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return { news, loading, error };
}
