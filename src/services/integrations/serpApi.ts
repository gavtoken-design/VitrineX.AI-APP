import { Trend } from '../../types';

// Using local backend now
// In production, this should come from env (e.g., import.meta.env.VITE_API_URL)
const API_URL = 'http://localhost:4000/api/trends';

export interface GoogleTrendsResult {
    source?: string;
    interest_over_time: {
        timeline_data: {
            date: string;
            values: { value: number }[];
        }[];
    };
    related_queries: {
        rising: {
            query: string;
            value: string | number; // "+300%", "Breakout", 100
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
 * Fetches Google Trends data via our Unified Backend.
 * Allows using Native Node provider or SerpApi fallback automatically.
 */
export const fetchSerpApiTrends = async (query: string, location: string = 'BR', date: string = 'today 1-m'): Promise<GoogleTrendsResult | null> => {
    const geo = location === 'BR' || location === 'Brazil' || location === 'Brasil' ? 'BR' : '';

    try {
        const response = await fetch(`${API_URL}/interest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keyword: query, geo, timeframe: date })
        });

        if (!response.ok) {
            throw new Error(`Trends API status: ${response.status}`);
        }

        const data = await response.json();
        return data as GoogleTrendsResult;
    } catch (error) {
        console.warn('Failed to fetch trends from backend.', error);
        return null;
    }
};

/**
 * Formats Trends data (Context for AI)
 */
export const formatTrendsDataForAI = (data: GoogleTrendsResult): string => {
    if (!data) return '';

    let context = `\n\n[REAL-TIME DATA FROM GOOGLE TRENDS (${data.source || 'Unified'})]\n`;

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
            // Handle if value is number or string (100 or '100')
            context += `- "${q.query}" (Index: ${q.value})\n`;
        });
    }

    // Rising Topics (if available)
    if (data.related_topics?.rising?.length > 0) {
        context += `\nRISING TOPICS:\n`;
        // Safe access
        const topics = Array.isArray(data.related_topics.rising) ? data.related_topics.rising : [];
        topics.slice(0, 5).forEach((t: any) => {
            const title = t.topic?.title || 'Topic';
            context += `- ${title} (${t.value})\n`;
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
 * Fetches Daily Trending Searches (Hot Trends) from Backend
 */
export const fetchDailyTrends = async (geo: string = 'BR'): Promise<DailyTrend[]> => {
    try {
        const response = await fetch(`${API_URL}/daily?geo=${geo}`);
        if (!response.ok) throw new Error('Daily Trends API Error');
        const data = await response.json();

        if (Array.isArray(data)) {
            return data;
        }
        return [];
    } catch (e) {
        console.warn('Failed to fetch daily trends from backend', e);
        return [];
    }
};
