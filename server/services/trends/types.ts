export interface TrendMetric {
    date: string;
    value: number;
}

export interface RelatedEntity {
    query: string;
    value: string | number; // "Breakout" or 100
    link?: string;
}

export interface TrendAnalysisResult {
    source: string; // "SerpApi" | "GoogleTrendsNode" | "Python"
    interest_over_time: {
        timeline_data: {
            date: string;
            values: { value: number }[];
        }[];
    };
    related_queries: {
        rising: RelatedEntity[];
        top: RelatedEntity[];
    };
    related_topics?: {
        rising: any[];
        top: any[];
    };
}

export interface DailyTrend {
    query: string;
    traffic_volume: string;
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

export interface ITrendProvider {
    name: string;
    getInterestOverTime(keyword: string, geo: string, timeframe: string): Promise<TrendAnalysisResult>;
    getDailyTrends(geo: string): Promise<DailyTrend[]>;
    getRelatedQueries(keyword: string, geo: string, timeframe: string): Promise<any>;
}
