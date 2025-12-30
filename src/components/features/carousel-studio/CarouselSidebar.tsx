
import * as React from 'react';
import {
    CommandLineIcon,
    PaintBrushIcon,
    AdjustmentsHorizontalIcon,
    BeakerIcon,
    ChevronDownIcon,
    CircleStackIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../ui/Button';
import BrandAssetsManager, { LogoSettings } from '../BrandAssetsManager';
import { IMAGE_STYLES } from '../../../constants';

interface CarouselSidebarProps {
    theme: string;
    setTheme: (v: string) => void;
    onGenerate: () => void;
    loading: boolean;
    fontFamily: string;
    setFontFamily: (v: string) => void;
    textColor: string;
    setTextColor: (v: string) => void;
    logoSettings: LogoSettings;
    setLogoSettings: (v: LogoSettings) => void;
    selectedStyle: string;
    setSelectedStyle: (v: string) => void;
    aspectRatio: string;
    setAspectRatio: (v: string) => void;
    resolution: string;
    setResolution: (v: string) => void;
    lightingStyle: string;
    setLightingStyle: (v: string) => void;
    sharpness: string;
    setSharpness: (v: string) => void;
}

const CarouselSidebar: React.FC<CarouselSidebarProps> = ({
    theme,
    setTheme,
    onGenerate,
    loading,
    fontFamily,
    setFontFamily,
    textColor,
    setTextColor,
    logoSettings,
    setLogoSettings,
    selectedStyle,
    setSelectedStyle,
    aspectRatio,
    setAspectRatio,
    resolution,
    setResolution,
    lightingStyle,
    setLightingStyle,
    sharpness,
    setSharpness
}) => {
    const [showAdvanced, setShowAdvanced] = React.useState(false);

    return (
        <aside className="w-full space-y-8">

            {/* BLOCO 1 — Direção Estratégica */}
            <section className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/[0.02] shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <CommandLineIcon className="w-5 h-5 ml-0.5" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-premium-primary)]">Direção Estratégica</h3>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-bold text-[var(--text-premium-secondary)] uppercase tracking-widest pl-1">O que vamos criar?</label>
                    <textarea
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        placeholder="Ex: Como a IA vai transformar o varejo em 2025. Inclua dicas práticas e cases de sucesso..."
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none h-40 transition-all resize-none font-medium leading-relaxed custom-scrollbar"
                    />
                </div>

                <Button
                    onClick={onGenerate}
                    isLoading={loading}
                    variant="liquid"
                    className="w-full mt-6 py-4 font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-blue-500/20 rounded-xl"
                >
                    {loading ? 'Processando...' : 'Gerar Carrossel'}
                </Button>
            </section>

            {/* BLOCO 2 — Identidade Visual */}
            <section className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/[0.02] shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <PaintBrushIcon className="w-5 h-5 ml-0.5" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-premium-primary)]">Identidade Visual</h3>
                </div>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-[var(--text-premium-secondary)] uppercase tracking-widest pl-1">Tipografia</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Inter', 'Montserrat', 'Playfair Display', 'Space Grotesk'].map(font => (
                                <button
                                    key={font}
                                    onClick={() => setFontFamily(font)}
                                    className={`py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all border ${fontFamily === font ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'bg-white/5 border-transparent text-[var(--text-premium-muted)] hover:bg-white/10 hover:text-white'}`}
                                    style={{ fontFamily: font }}
                                >
                                    {font}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-[var(--text-premium-secondary)] uppercase tracking-widest pl-1">Cor do Texto</label>
                        <div className="flex items-center gap-3 bg-black/40 p-2 rounded-xl border border-white/10">
                            <input
                                type="color"
                                value={textColor}
                                onChange={e => setTextColor(e.target.value)}
                                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none p-0"
                            />
                            <div className="flex-1 text-xs font-mono font-bold text-gray-300 uppercase">
                                {textColor}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <label className="text-[10px] font-bold text-[var(--text-premium-secondary)] uppercase tracking-widest mb-4 block pl-1">Branding</label>
                        <BrandAssetsManager settings={logoSettings} onSettingsChange={setLogoSettings} />
                    </div>

                    <div className="pt-6 border-t border-white/5 bg-black/20 p-2 rounded-xl">
                        <label className="text-[10px] font-bold text-[var(--text-premium-secondary)] uppercase tracking-widest mb-2 block pl-1">Estilo Visual</label>
                        <select
                            value={selectedStyle}
                            onChange={(e) => setSelectedStyle(e.target.value)}
                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs font-bold text-gray-300 focus:border-blue-500/50 outline-none"
                        >
                            {IMAGE_STYLES.map(style => (
                                <option key={style.id} value={style.id}>{style.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            {/* BLOCO 3 — Parâmetros Técnicos */}
            <section className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/[0.02] shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <AdjustmentsHorizontalIcon className="w-5 h-5 ml-0.5" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-premium-primary)]">Parâmetros</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--text-premium-secondary)] uppercase pl-1">Proporção</label>
                        <select
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value)}
                            className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-bold text-gray-300 focus:border-blue-500/50 outline-none transition-all"
                        >
                            <option value="1:1">1:1 (Post)</option>
                            <option value="3:4">3:4 (Portrait)</option>
                            <option value="16:9">16:9 (Wide)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--text-premium-secondary)] uppercase pl-1">Qualidade</label>
                        <select
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-bold text-gray-300 focus:border-blue-500/50 outline-none transition-all"
                        >
                            <option value="1K">High Def</option>
                            <option value="2K">Ultra HD</option>
                            <option value="4K">Master</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* BLOCO 4 — Refinamento Master */}
            <section className="glass-panel rounded-[2rem] border border-white/10 overflow-hidden bg-black/20 shadow-xl">
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all text-left outline-none"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <BeakerIcon className="w-5 h-5 ml-0.5" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-premium-primary)]">Refinamento</h3>
                            <p className="text-[9px] font-bold text-[var(--text-premium-muted)] uppercase tracking-widest mt-1">Ajustes Finos de IA</p>
                        </div>
                    </div>
                    <motion.div animate={{ rotate: showAdvanced ? 180 : 0 }}>
                        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                    </motion.div>
                </button>

                <AnimatePresence>
                    {showAdvanced && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-6 pb-6 pt-0 space-y-6 border-t border-white/5"
                        >
                            <div className="space-y-4 pt-4">
                                <label className="text-[10px] font-bold text-[var(--text-premium-secondary)] uppercase block pl-1">Estilo de Iluminação</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['natural', 'cinematic', 'neon', 'studio'].map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => setLightingStyle(mode)}
                                            className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all border ${lightingStyle === mode ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-white/5 border-transparent text-gray-600 hover:text-gray-400'}`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[var(--text-premium-secondary)] uppercase block pl-1">Nitidez</label>
                                <select
                                    value={sharpness}
                                    onChange={(e) => setSharpness(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-black/40 border border-white/5 rounded-xl text-xs font-bold text-gray-300 focus:border-amber-500/50 outline-none transition-all"
                                >
                                    <option value="standard">Padrão</option>
                                    <option value="critical">Hiper-realista (Crítico)</option>
                                    <option value="raw">Raw Photography</option>
                                </select>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

        </aside>
    );
};

export default CarouselSidebar;
