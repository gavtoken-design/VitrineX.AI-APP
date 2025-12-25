import { Trend } from '../../types';

const SERPAPI_KEY = import.meta.env.VITE_SERPAPI_KEY || '';


export interface GoogleTrendsResult {
    interest_over_time: {
        timeline_data: {
            date: string;
            values: { value: number }[];
        }[];
    };
    related_queries: {
        rising: {
            query: string;
            value: string; // "+300%", "Breakout"
        }[];
        top: {
            query: string;
            value: number; // 100, 80...
        }[];
    };
    related_topics: {
        rising: {
            topic: { title: string; type: string };
            value: string;
        }[];
    }
}

/**
 * Fetches Google Trends data via SerpApi.
 * Note: direct browser calls to SerpApi require a backend or proxy to hide the key and handle CORS.
 * For this demo, we assume a proxy or a very permissive dev environment.
 */
export const fetchSerpApiTrends = async (query: string, location: string = 'BR', date: string = 'today 1-m'): Promise<GoogleTrendsResult | null> => {
    if (!SERPAPI_KEY) {
        console.warn('VITE_SERPAPI_KEY not found. Skipping SerpApi fetch.');
        return null;
    }

    const geo = location === 'BR' || location === 'Brazil' || location === 'Brasil' ? 'BR' : '';
    const url = `https://serpapi.com/search.json?engine=google_trends&q=${encodeURIComponent(query)}&geo=${geo}&date=${encodeURIComponent(date)}&api_key=${SERPAPI_KEY}`;

    try {
        // Direct fetch (Restricted by browser CORS unless 'localhost' is allowed in SerpApi Dashboard)
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 403) {
                console.warn('SerpApi 403 Forbidden. Check your API Key or CORS/Origin settings in SerpApi Dashboard.');
            }
            throw new Error(`SerpApi status: ${response.status}`);
        }

        const data = await response.json();
        return data as GoogleTrendsResult;
    } catch (error) {
        console.warn('Failed to fetch SerpApi trends (CORS or Network). Falling back to AI Simulation.', error);
        // We return null to let the AI continue with simulated data instead of crashing
        return null;
    }
};

/**
 * Formats SerpApi data into a string context for LLM analysis
 */
export const formatTrendsDataForAI = (data: GoogleTrendsResult): string => {
    if (!data) return '';

    let context = `\n\n[REAL-TIME DATA FROM GOOGLE TRENDS]\n`;

    // Rising Queries (Breakouts)
    if (data.related_queries?.rising?.length > 0) {
        context += `RISING RELATED QUERIES:\n`;
        data.related_queries.rising.slice(0, 8).forEach(q => {
            context += `- "${q.query}" (${q.value})\n`;
        });
    }

    // Top Queries
    if (data.related_queries?.top?.length > 0) {
        context += `\nTOP RELATED QUERIES:\n`;
        data.related_queries.top.slice(0, 5).forEach(q => {
            context += `- "${q.query}" (Index: ${q.value})\n`;
        });
    }

    // Rising Topics
    if (data.related_topics?.rising?.length > 0) {
        context += `\nRISING TOPICS:\n`;
        data.related_topics.rising.slice(0, 5).forEach(t => {
            context += `- ${t.topic.title} (${t.value})\n`;
        });
    }

    return context;
};

export interface DailyTrend {
    query: string;
    traffic_volume: string; // "50K+"
    image?: {
        news_url: string;
        source: string;
        image_url: string;
    };
    articles: {
        title: string;
        url: string;
        source: string;
    }[];
}

/**
 * Fetches Daily Trending Searches (Hot Trends)
 */
export const fetchDailyTrends = async (geo: string = 'BR'): Promise<DailyTrend[]> => {
    if (!SERPAPI_KEY) {
        // Return some static fallback or empty to prevent crash
        return [];
    }

    // engine=google_trends_trending_searches gets "Daily Search Trends"
    const url = `https://serpapi.com/search.json?engine=google_trends_trending_searches&geo=${geo}&api_key=${SERPAPI_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('SerpApi Daily Trends Error');
        const data = await response.json();

        // Map SerpApi structure to our simple interface
        // Structure: data.trending_searches[]
        if (data.trending_searches && Array.isArray(data.trending_searches)) {
            return data.trending_searches.map((item: any) => ({
                query: item.query,
                traffic_volume: item.formatted_traffic || "Em alta", // Use string directly
                image: item.image ? {
                    news_url: item.image.news_url,
                    source: item.image.source,
                    image_url: item.image.image_url
                } : undefined,
                articles: item.articles || []
            }));
        }
        return [];
    } catch (e) {
        console.warn('Failed to fetch daily trends', e);
        return [];
    }
};
