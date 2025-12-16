import * as React from 'react';
import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

interface HowToUseProps {
    title?: string;
    steps: string[];
    tips?: string[];
}

const HowToUse: React.FC<HowToUseProps> = ({
    title = "Como Usar",
    steps,
    tips
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl overflow-hidden mb-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-900/30 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <QuestionMarkCircleIcon className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold text-blue-300">{title}</span>
                </div>
                {isOpen ? (
                    <ChevronUpIcon className="w-5 h-5 text-blue-400" />
                ) : (
                    <ChevronDownIcon className="w-5 h-5 text-blue-400" />
                )}
            </button>

            {isOpen && (
                <div className="px-4 pb-4 pt-2 space-y-3 animate-slide-in-from-top">
                    <div>
                        <p className="text-sm font-semibold text-blue-300 mb-2">📋 Passo a Passo:</p>
                        <ol className="space-y-1.5 text-sm text-gray-300">
                            {steps.map((step, index) => (
                                <li key={index} className="flex gap-2">
                                    <span className="font-bold text-blue-400 min-w-[20px]">{index + 1}.</span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {tips && tips.length > 0 && (
                        <div className="pt-2 border-t border-blue-500/20">
                            <p className="text-sm font-semibold text-blue-300 mb-2">💡 Dicas:</p>
                            <ul className="space-y-1 text-sm text-gray-300">
                                {tips.map((tip, index) => (
                                    <li key={index} className="flex gap-2">
                                        <span className="text-blue-400">•</span>
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HowToUse;
