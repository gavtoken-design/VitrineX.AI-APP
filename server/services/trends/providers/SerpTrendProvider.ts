import axios from 'axios';
import { ITrendProvider, TrendAnalysisResult, DailyTrend } from '../types';

export class SerpTrendProvider implements ITrendProvider {
    name = "SerpApi";
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.VITE_SERPAPI_KEY || ''; // Read from env
    }

    async getInterestOverTime(keyword: string, geo: string, timeframe: string): Promise<TrendAnalysisResult> {
        if (!this.apiKey) throw new Error("SERPAPI_KEY_MISSING");

        // Map simplified timeframe dates if needed, SerpApi handles "today 1-m" etc well.
        const url = `https://serpapi.com/search.json?engine=google_trends&q=${encodeURIComponent(keyword)}&geo=${geo}&date=${encodeURIComponent(timeframe)}&api_key=${this.apiKey}`;

        const response = await axios.get(url);
        const data = response.data;

        if (response.status !== 200 || data.error) {
            throw new Error(data.error || "SerpApi Error");
        }

        return this.mapToResult(data);
    }

    async getDailyTrends(geo: string): Promise<DailyTrend[]> {
        if (!this.apiKey) return [];

        const url = `https://serpapi.com/search.json?engine=google_trends_trending_searches&geo=${geo}&api_key=${this.apiKey}`;
        const response = await axios.get(url);
        const data = response.data;

        if (data.trending_searches && Array.isArray(data.trending_searches)) {
            return data.trending_searches.map((item: any) => ({
                query: item.query,
                traffic_volume: item.formatted_traffic || "Em alta",
                image: item.image ? {
                    news_url: item.image.news_url,
                    source: item.image.source,
                    image_url: item.image.image_url
                } : undefined,
                articles: item.articles || []
            }));
        }
        return [];
    }

    async getRelatedQueries(keyword: string, geo: string, timeframe: string): Promise<any> {
        // Implemented within getInterestOverTime in this simple version or separate if needed
        return {};
    }

    private mapToResult(data: any): TrendAnalysisResult {
        // Map SerpApi raw result to our Contract
        return {
            source: this.name,
            interest_over_time: data.interest_over_time || { timeline_data: [] },
            related_queries: data.related_queries || { rising: [], top: [] },
            related_topics: data.related_topics
        };
    }
}
