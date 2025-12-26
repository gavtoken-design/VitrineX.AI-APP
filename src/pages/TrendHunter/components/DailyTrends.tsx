
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DailyTrend } from '../../../services/integrations/serpApi';

interface DailyTrendsProps {
    trends: DailyTrend[];
    onSelectTrend: (query: string) => void;
    loading: boolean;
    hasResult: boolean;
}

const DailyTrends: React.FC<DailyTrendsProps> = ({ trends, onSelectTrend, loading, hasResult }) => {
    return (
        <AnimatePresence>
            {!loading && !hasResult && trends.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-20 max-w-5xl mx-auto"
                >
                    <div className="flex items-center gap-3 mb-6 px-4">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Em alta no Brasil agora</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {trends.map((trend, idx) => (
                            <div
                                key={idx}
                                onClick={() => onSelectTrend(trend.query)}
                                className="group cursor-pointer bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all duration-300 relative overflow-hidden backdrop-blur-sm"
                            >
                                <div className="flex items-start justify-between relative z-10">
                                    <div>
                                        <h4 className="font-bold text-white group-hover:text-primary transition-colors line-clamp-1 text-lg mb-1" title={trend.query}>
                                            {trend.query}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            {/* Assuming traffic_volume is available string */}
                                            <span className="text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded text-gray-400">{trend.traffic_volume}</span>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-black text-white/5 group-hover:text-white/10 select-none">#{idx + 1}</span>
                                </div>
                                {trend.articles[0] && (
                                    <p className="text-xs text-gray-500 mt-4 line-clamp-2 leading-relaxed group-hover:text-gray-400 transition-colors">
                                        {trend.articles[0].title}
                                    </p>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DailyTrends;
