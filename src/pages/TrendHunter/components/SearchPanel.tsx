
import React from 'react';
import { motion } from 'framer-motion';
import {
    MagnifyingGlassIcon,
    ClipboardDocumentIcon,
    MapPinIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';
import Button from '../../../components/ui/Button';
import { OBJECTIVES } from '../types';

interface SearchPanelProps {
    query: string;
    setQuery: (val: string) => void;
    city: string;
    setCity: (val: string) => void;
    objective: string;
    setObjective: (val: string) => void;
    locationStatus: 'pending' | 'success' | 'denied';
    loading: boolean;
    hasResult: boolean;
    onSearch: () => void;
    onClear: () => void;
    onPaste: () => void;
}

const SearchPanel: React.FC<SearchPanelProps> = ({
    query, setQuery,
    city, setCity,
    objective, setObjective,
    locationStatus,
    loading,
    hasResult,
    onSearch,
    onClear,
    onPaste
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto max-w-5xl mb-16 relative"
        >
            <div className="liquid-card p-1 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-white/5 shadow-2xl">
                <div className="bg-[#0A0F19]/90 backdrop-blur-xl rounded-[2.3rem] p-6 md:p-10 border border-white/5">

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* Search Input */}
                        <div className="md:col-span-8 space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">O que você procura?</label>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                                <div className="relative bg-black/50 border border-white/10 rounded-2xl flex items-center overflow-hidden focus-within:border-primary/50 transition-colors">
                                    <MagnifyingGlassIcon className="w-6 h-6 text-gray-500 ml-4" />
                                    <input
                                        id="trendQuery"
                                        className="w-full bg-transparent border-none text-xl px-4 py-5 text-white placeholder-gray-600 focus:ring-0 font-medium"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Ex: 'micro-saas', 'inteligência artificial'..."
                                        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                                    />
                                    <button
                                        onClick={onPaste}
                                        className="p-3 mr-2 text-gray-500 hover:text-white transition-colors hover:bg-white/10 rounded-xl"
                                        title="Colar da área de transferência"
                                    >
                                        <ClipboardDocumentIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Location Input */}
                        <div className="md:col-span-4 space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Localização</label>
                            <div className="relative bg-black/50 border border-white/10 rounded-2xl flex items-center overflow-hidden focus-within:border-primary/50 transition-colors h-[72px]">
                                <MapPinIcon className="w-6 h-6 text-gray-500 ml-4" />
                                <input
                                    type="text"
                                    className="w-full bg-transparent border-none text-base px-4 py-5 text-white placeholder-gray-600 focus:ring-0"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Global..."
                                />
                                {locationStatus === 'success' && !city && (
                                    <div className="absolute right-3 flex items-center gap-1 text-green-400 text-[10px] font-bold bg-green-900/30 px-2 py-1 rounded-full border border-green-500/20">
                                        <GlobeAltIcon className="w-3 h-3" /> GPS
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Objectives */}
                    <div className="mt-8 space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Objetivo da Análise</label>
                        <div className="flex flex-wrap gap-3">
                            {OBJECTIVES.map(obj => (
                                <button
                                    key={obj.id}
                                    onClick={() => setObjective(obj.id)}
                                    className={`relative px-6 py-4 rounded-xl text-sm font-bold transition-all duration-300 border flex items-center gap-3 ${objective === obj.id
                                        ? 'bg-primary/20 text-primary border-primary/50 shadow-[0_0_20px_rgba(var(--color-primary),0.3)]'
                                        : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:border-white/20 hover:text-white'
                                        }`}
                                >
                                    <span className="text-xl">{obj.icon}</span>
                                    {obj.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Footer */}
                    <div className="mt-10 pt-8 border-t border-white/5 flex justify-end gap-4">
                        {(query || hasResult) && (
                            <Button onClick={onClear} variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5">
                                Limpar
                            </Button>
                        )}
                        <Button
                            onClick={onSearch}
                            isLoading={loading}
                            variant="liquid"
                            className="px-10 py-6 h-auto text-base font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-transform bg-primary hover:bg-primary-dark"
                        >
                            {loading ? 'Processando IA...' : 'Analisar Agora'}
                        </Button>
                    </div>

                </div>
            </div>
        </motion.div>
    );
};

export default SearchPanel;
