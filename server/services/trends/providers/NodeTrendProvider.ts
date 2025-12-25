import googleTrends from 'google-trends-api';
import { ITrendProvider, TrendAnalysisResult, DailyTrend } from '../types';

export class NodeTrendProvider implements ITrendProvider {
    name = "GoogleTrendsNode";

    async getInterestOverTime(keyword: string, geo: string, timeframe: string): Promise<TrendAnalysisResult> {
        const { startTime, endTime } = this.parseTimeframe(timeframe);

        try {
            // Fetch Interest and Related Queries in parallel
            // Note: Google Trends needs keyword, geo, and timeframe for both
            const [interestStr, relatedStr] = await Promise.all([
                googleTrends.interestOverTime({ keyword, geo, startTime, endTime }),
                googleTrends.relatedQueries({ keyword, geo, startTime, endTime })
            ]);

            const interestData = JSON.parse(interestStr);
            const relatedData = JSON.parse(relatedStr);

            return this.mapToResult(interestData, relatedData);
        } catch (e) {
            console.error("NodeProvider Error:", e);
            throw new Error("NodeProvider Failed");
        }
    }

    async getDailyTrends(geo: string): Promise<DailyTrend[]> {
        try {
            const resultString = await googleTrends.dailyTrends({
                geo,
            });
            const result = JSON.parse(resultString);

            // Map google-trends-api format to DailyTrend
            // Usually result.default.trendingSearchesDays[0].trendingSearches
            const days = result.default?.trendingSearchesDays || [];
            if (days.length === 0) return [];

            const trends = days[0].trendingSearches || [];

            return trends.map((t: any) => ({
                query: t.title.query,
                traffic_volume: t.formattedTraffic,
                articles: t.articles.map((a: any) => ({
                    title: a.title,
                    url: a.url,
                    source: a.source
                })),
                image: t.image ? {
                    news_url: t.image.newsUrl,
                    source: t.image.source,
                    image_url: t.image.imageUrl
                } : undefined
            }));

        } catch (e) {
            console.error("NodeProvider Daily Error:", e);
            return [];
        }
    }

    async getRelatedQueries(keyword: string, geo: string, timeframe: string): Promise<any> {
        return {}; // Handled in getInterestOverTime
    }

    private parseTimeframe(timeframe: string): { startTime?: Date, endTime?: Date } {
        const end = new Date();
        const start = new Date();

        if (timeframe.includes('1-m')) {
            start.setMonth(start.getMonth() - 1);
        } else if (timeframe.includes('3-m')) {
            start.setMonth(start.getMonth() - 3);
        } else if (timeframe.includes('12-m') || timeframe.includes('5-y')) {
            // Default 12m for simplicity if parsed vaguely
            start.setFullYear(start.getFullYear() - 1);
        } else if (timeframe.includes('1-d')) {
            start.setDate(start.getDate() - 1);
        } else if (timeframe.includes('7-d')) {
            start.setDate(start.getDate() - 7);
        }

        return { startTime: start };
    }

    private mapToResult(interestData: any, relatedData: any): TrendAnalysisResult {
        // Map Interest
        const timeline = interestData.default?.timelineData || [];
        const mappedTimeline = timeline.map((item: any) => ({
            date: item.formattedTime,
            values: item.value.map((v: number) => ({ value: v }))
        }));

        // Map Related Queries
        const rankedList = relatedData.default?.rankedList || [];
        // rankedList typically has two items: { title: "Top", ... }, { title: "Rising", ... }

        const topItem = rankedList.find((l: any) => l.title === 'Top');
        const risingItem = rankedList.find((l: any) => l.title === 'Rising');

        const topList = topItem?.rankedKeyword || [];
        const risingList = risingItem?.rankedKeyword || [];

        return {
            source: this.name,
            interest_over_time: {
                timeline_data: mappedTimeline
            },
            related_queries: {
                top: topList.map((i: any) => ({ query: i.query, value: i.value })),
                rising: risingList.map((i: any) => ({ query: i.query, value: i.formattedValue })) // formattedValue has "Breakout" etc
            }
        };
    }
}
