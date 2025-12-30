"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// A simple utility function to merge class names, replacing the need for an external file.
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

// --- Component Props & Data Types ---

export interface ProcessStep {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    details: string[];
    duration: string;
    image: string; // URL to the image for the phone mockup
}

export interface QuantumTimelineProps {
    steps?: ProcessStep[];
    defaultStep?: string;
}

// --- Default Data ---
const DEMO_STEPS: ProcessStep[] = [
    {
        id: "01",
        title: "Discovery & Planning",
        subtitle: "Understanding Your Vision",
        description: "We begin by diving deep into your business goals, target audience, and technical requirements to build a comprehensive project roadmap.",
        details: ["Architecture Design", "Integration Planning", "Requirement Analysis", "Success Metrics"],
        duration: "1-2 weeks",
        image: "https://placehold.co/300x600/1e293b/ffffff?text=Discovery",
    },
    {
        id: "02",
        title: "Custom Solution Design",
        subtitle: "Architecting Your AI Future",
        description: "A dedicated team of AI experts builds and rigorously tests custom solutions designed to scale with your business.",
        details: ["Custom AI Model Development", "Security & Compliance Setup", "User Experience Design", "API Development"],
        duration: "2-4 weeks",
        image: "https://placehold.co/300x600/4a00e0/ffffff?text=Design",
    },
    {
        id: "03",
        title: "Implementation",
        subtitle: "Bringing Your Vision to Life",
        description: "Our development team brings the designs to life, building a robust and scalable solution with clean, efficient code.",
        details: ["Frontend Development", "Backend Development", "Database Integration", "CI/CD Setup"],
        duration: "4-6 weeks",
        image: "https://placehold.co/300x600/8e2de2/ffffff?text=Implement",
    },
    {
        id: "04",
        title: "Optimization & Launch",
        subtitle: "Ensuring Peak Performance",
        description: "We conduct rigorous testing and performance optimization to ensure a flawless launch and a seamless user experience.",
        details: ["Performance Tuning", "Security Audits", "User Acceptance Testing", "Deployment"],
        duration: "1-2 weeks",
        image: "https://placehold.co/300x600/1e90ff/ffffff?text=Launch",
    },
];


// --- Main Timeline Component ---

export const QuantumTimeline = ({ steps = DEMO_STEPS, defaultStep }: QuantumTimelineProps) => {
    const [activeStep, setActiveStep] = useState(defaultStep || steps[0]?.id);

    const activeStepData = steps.find(step => step.id === activeStep);
    const activeIndex = steps.findIndex(step => step.id === activeStep);

    return (
        <div className="w-full max-w-6xl mx-auto p-8 font-sans bg-white dark:bg-black rounded-2xl shadow-2xl">
            {/* Top Navigation */}
            <TimelineNav steps={steps} activeStep={activeStep} onStepClick={setActiveStep} />

            {/* Main Content */}
            <AnimatePresence mode="wait">
                {activeStepData && (
                    <motion.div
                        key={activeStepData.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-12 grid md:grid-cols-2 gap-12"
                    >
                        <TimelineContent step={activeStepData} />
                        <TimelinePhoneMockup image={activeStepData.image} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Timeline */}
            <BottomTimeline steps={steps} activeIndex={activeIndex} onStepClick={setActiveStep} />
        </div>
    );
};

// --- Sub-components ---

const TimelineNav = ({ steps, activeStep, onStepClick }: { steps: ProcessStep[], activeStep: string, onStepClick: (id: string) => void }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center font-bold">Q</div>
            <span className="text-xl font-bold text-slate-800 dark:text-white">Quantum Process</span>
        </div>
        <div className="hidden md:flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-full">
            {steps.map(step => (
                <button
                    key={step.id}
                    onClick={() => onStepClick(step.id)}
                    className={cn(
                        "px-4 py-1 rounded-full text-sm font-semibold transition-colors",
                        activeStep === step.id
                            ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700"
                    )}
                >
                    {step.id}
                </button>
            ))}
        </div>
    </div>
);

const TimelineContent = ({ step }: { step: ProcessStep }) => (
    <div>
        <span className="text-sm font-bold text-blue-500">{step.id}</span>
        <h2 className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">{step.title}</h2>
        <p className="mt-1 text-slate-600 dark:text-slate-400">{step.subtitle}</p>
        <p className="mt-4 text-slate-700 dark:text-slate-300">{step.description}</p>
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
            {step.details.map((detail, i) => (
                <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-500/10 dark:bg-green-500/20 text-green-500 rounded-full flex items-center justify-center text-xs">✓</div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{detail}</span>
                </div>
            ))}
        </div>
        <div className="mt-6 flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <span className="text-blue-500">⏳</span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Duration: {step.duration}</span>
        </div>
    </div>
);

const TimelinePhoneMockup = ({ image }: { image: string }) => (
    <div className="flex items-center justify-center">
        <div className="w-64 h-[512px] bg-slate-800 dark:bg-slate-900 rounded-[40px] p-4 border-4 border-slate-700 dark:border-slate-800 shadow-2xl">
            <div className="w-full h-full bg-black rounded-[24px] overflow-hidden">
                <img src={image} alt="App Screenshot" className="w-full h-full object-cover" />
            </div>
        </div>
    </div>
);


const BottomTimeline = ({ steps, activeIndex, onStepClick }: { steps: ProcessStep[], activeIndex: number, onStepClick: (id: string) => void }) => (
    <div className="mt-16">
        <div className="relative w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full">
            <motion.div
                className="absolute h-1 bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute w-4 h-4 -top-1.5 rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.2)]"
                initial={{ left: '0%' }}
                animate={{ left: `calc(${(activeIndex / (steps.length - 1)) * 100}% - 8px)` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            />
        </div>
        <div className="mt-4 flex justify-between">
            {steps.map((step, i) => (
                <button key={step.id} onClick={() => onStepClick(step.id)} className="text-center w-1/4">
                    <span className={cn(
                        "text-sm font-semibold transition-colors",
                        i <= activeIndex ? "text-blue-500" : "text-slate-500 dark:text-slate-400"
                    )}>
                        {step.id}
                    </span>
                    <p className={cn(
                        "text-xs mt-1 transition-colors",
                        i <= activeIndex ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"
                    )}>
                        {step.title.split(' ')[0]}
                    </p>
                </button>
            ))}
        </div>
    </div>
);
