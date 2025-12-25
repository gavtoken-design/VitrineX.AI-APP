import { ITrendProvider, TrendAnalysisResult, DailyTrend } from './types';
import { NodeTrendProvider } from './providers/NodeTrendProvider';
import { SerpTrendProvider } from './providers/SerpTrendProvider';

export class TrendManager {
    private providers: ITrendProvider[];

    constructor() {
        // Priority: 1. Node (Free), 2. SerpApi (Paid/Backup)
        this.providers = [
            new NodeTrendProvider(),
            new SerpTrendProvider()
        ];
    }

    async getInterestOverTime(keyword: string, geo: string = 'BR', timeframe: string = 'today 1-m'): Promise<TrendAnalysisResult> {
        let lastError: any;

        for (const provider of this.providers) {
            try {
                console.log(`[TrendManager] Trying provider: ${provider.name} for Interest...`);
                const result = await provider.getInterestOverTime(keyword, geo, timeframe);
                return result;
            } catch (error) {
                console.warn(`[TrendManager] Provider ${provider.name} failed:`, error);
                lastError = error;
                // Continue to next provider
            }
        }

        throw lastError || new Error("All Trend Providers failed");
    }

    async getDailyTrends(geo: string = 'BR'): Promise<DailyTrend[]> {
        for (const provider of this.providers) {
            try {
                console.log(`[TrendManager] Trying provider: ${provider.name} for Daily Trends...`);
                const result = await provider.getDailyTrends(geo);
                if (result.length > 0) return result;
            } catch (error) {
                console.warn(`[TrendManager] Provider ${provider.name} failed:`, error);
            }
        }
        return [];
    }
}

export const trendManager = new TrendManager();
