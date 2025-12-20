
import * as React from 'react';
import { useState, useRef } from 'react';
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';

export interface LogoSettings {
    file: File | null;
    previewUrl: string | null;
    position: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    opacity: number;
    scale: number;
}

interface BrandAssetsManagerProps {
    settings: LogoSettings;
    onSettingsChange: (settings: LogoSettings) => void;
}

const BrandAssetsManager: React.FC<BrandAssetsManagerProps> = ({ settings, onSettingsChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            onSettingsChange({ ...settings, file, previewUrl: url });
        }
    };

    const clearLogo = () => {
        onSettingsChange({ ...settings, file: null, previewUrl: null });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="bg-surface rounded-xl border border-border p-5 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-title flex items-center gap-2">
                <span className="bg-primary/10 text-primary p-1 rounded-md">©</span>
                Identidade Visual
            </h3>

            {!settings.previewUrl ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-center h-32"
                >
                    <CloudArrowUpIcon className="w-8 h-8 text-muted mb-2" />
                    <p className="text-xs text-muted font-medium">Upload Logo (PNG)</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                >
                    {/* Preview & Remove */}
                    <div className="relative bg-grid-pattern p-4 rounded-lg border border-border flex justify-center h-32 items-center">
                        <img
                            src={settings.previewUrl}
                            alt="Logo Preview"
                            className="max-h-full max-w-full object-contain"
                            style={{ opacity: settings.opacity, transform: `scale(${settings.scale})` }}
                        />
                        <button
                            onClick={clearLogo}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                        >
                            <XMarkIcon className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="space-y-3">
                        {/* Position Grid */}
                        <div>
                            <label className="text-xs font-medium text-muted block mb-2">Posição</label>
                            <div className="grid grid-cols-3 gap-1 w-24 mx-auto">
                                {(['top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const).map((pos) => {
                                    const isCornerOrCenter = (['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'] as const).includes(pos as any);
                                    if (!isCornerOrCenter) return <div key={pos} />; // Empty cells for grid layout if simplified
                                    return (
                                        <button
                                            key={pos}
                                            onClick={() => onSettingsChange({ ...settings, position: pos })}
                                            className={`w-full aspect-square rounded-sm border ${settings.position === pos ? 'bg-primary border-primary' : 'bg-background border-border hover:bg-white/5'}`}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        {/* Sliders */}
                        <div>
                            <label className="text-xs font-medium text-muted mb-1 flex justify-between">
                                Opacidade <span>{Math.round(settings.opacity * 100)}%</span>
                            </label>
                            <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.05"
                                value={settings.opacity}
                                onChange={(e) => onSettingsChange({ ...settings, opacity: parseFloat(e.target.value) })}
                                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted mb-1 flex justify-between">
                                Escala <span>{settings.scale}x</span>
                            </label>
                            <input
                                type="range"
                                min="0.2"
                                max="2.0"
                                step="0.1"
                                value={settings.scale}
                                onChange={(e) => onSettingsChange({ ...settings, scale: parseFloat(e.target.value) })}
                                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default BrandAssetsManager;
