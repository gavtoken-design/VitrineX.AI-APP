
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

//Vibe coded by ammaar@google.com

import { GoogleGenAI } from '@google/genai';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { getGeminiClient } from '../../../services/ai/gemini';
import { useAuth } from '../../../contexts/AuthContext';

import { Artifact, Session, ComponentVariation, LayoutOption } from './types';
import { INITIAL_PLACEHOLDERS } from './constants';
import './flash-ui.css';

import { generateId } from './utils';

import DottedGlowBackground from './components/DottedGlowBackground';
import ArtifactCard from './components/ArtifactCard';
import SideDrawer from './components/SideDrawer';
import {
    ThinkingIcon,
    CodeIcon,
    SparklesIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    ArrowUpIcon,
    GridIcon
} from './components/Icons';

export const FlashDesigner: React.FC = () => {
    const { user } = useAuth();

    const [sessions, setSessions] = useState<Session[]>([]);
    const [currentSessionIndex, setCurrentSessionIndex] = useState<number>(-1);
    const [focusedArtifactIndex, setFocusedArtifactIndex] = useState<number | null>(null);

    const [inputValue, setInputValue] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [placeholders, setPlaceholders] = useState<string[]>(INITIAL_PLACEHOLDERS);

    const [drawerState, setDrawerState] = useState<{
        isOpen: boolean;
        mode: 'code' | 'variations' | null;
        title: string;
        data: any;
    }>({ isOpen: false, mode: null, title: '', data: null });

    const [componentVariations, setComponentVariations] = useState<ComponentVariation[]>([]);

    const inputRef = useRef<HTMLInputElement>(null);
    const gridScrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Fix for mobile: reset scroll when focusing an item to prevent "overscroll" state
    useEffect(() => {
        if (focusedArtifactIndex !== null && window.innerWidth <= 1024) {
            if (gridScrollRef.current) {
                gridScrollRef.current.scrollTop = 0;
            }
            window.scrollTo(0, 0);
        }
    }, [focusedArtifactIndex]);

    // Cycle placeholders
    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex(prev => (prev + 1) % placeholders.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [placeholders.length]);

    // Dynamic placeholder generation on load
    useEffect(() => {
        const fetchDynamicPlaceholders = async () => {
            try {

                const ai = await getGeminiClient(undefined, user?.id);
                const response = await ai.models.generateContent({
                    model: 'gemini-2.0-flash-exp', // Using a newer model if available, or fallback to config
                    contents: {
                        role: 'user',
                        parts: [{
                            text: 'Generate 20 creative, short, diverse UI component prompts (e.g. "bioluminescent task list") in Portuguese (Brazil). Return ONLY a raw JSON array of strings. IP SAFEGUARD: Avoid referencing specific famous artists, movies, or brands.'
                        }]
                    },
                });

                const text = response.text || '[]';
                const jsonMatch = text.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    const newPlaceholders = JSON.parse(jsonMatch[0]);
                    if (Array.isArray(newPlaceholders) && newPlaceholders.length > 0) {
                        const shuffled = newPlaceholders.sort(() => 0.5 - Math.random()).slice(0, 10);
                        setPlaceholders(prev => [...prev, ...shuffled]);
                    }
                }
            } catch (e) {
                console.warn("Silently failed to fetch dynamic placeholders", e);
            }
        };
        setTimeout(fetchDynamicPlaceholders, 1000);
    }, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const parseJsonStream = async function* (responseStream: AsyncGenerator<{ text: string }>) {
        let buffer = '';
        for await (const chunk of responseStream) {
            const text = chunk.text;
            if (typeof text !== 'string') continue;
            buffer += text;
            let braceCount = 0;
            let start = buffer.indexOf('{');
            while (start !== -1) {
                braceCount = 0;
                let end = -1;
                for (let i = start; i < buffer.length; i++) {
                    if (buffer[i] === '{') braceCount++;
                    else if (buffer[i] === '}') braceCount--;
                    if (braceCount === 0 && i > start) {
                        end = i;
                        break;
                    }
                }
                if (end !== -1) {
                    const jsonString = buffer.substring(start, end + 1);
                    try {
                        yield JSON.parse(jsonString);
                        buffer = buffer.substring(end + 1);
                        start = buffer.indexOf('{');
                    } catch (e) {
                        start = buffer.indexOf('{', start + 1);
                    }
                } else {
                    break;
                }
            }
        }
    };

    const handleGenerateVariations = useCallback(async () => {
        const currentSession = sessions[currentSessionIndex];
        if (!currentSession || focusedArtifactIndex === null) return;
        const currentArtifact = currentSession.artifacts[focusedArtifactIndex];

        setIsLoading(true);
        setComponentVariations([]);
        setDrawerState({ isOpen: true, mode: 'variations', title: 'Variações', data: currentArtifact.id });

        try {
            const ai = await getGeminiClient(undefined, user?.id);


            const prompt = `
You are a master UI/UX designer. Generate 3 RADICAL CONCEPTUAL VARIATIONS of: "${currentSession.prompt}".

**STRICT IP SAFEGUARD:**
No names of artists. 
Instead, describe the *Physicality* and *Material Logic* of the UI.

**CREATIVE GUIDANCE (Use these as EXAMPLES of how to describe style, but INVENT YOUR OWN):**
1. Example: "Asymmetrical Primary Grid" (Heavy black strokes, rectilinear structure, flat primary pigments, high-contrast white space).
2. Example: "Suspended Kinetic Mobile" (Delicate wire-thin connections, floating organic primary shapes, slow-motion balance, white-void background).
3. Example: "Grainy Risograph Press" (Overprinted translucent inks, dithered grain textures, monochromatic color depth, raw paper substrate).
4. Example: "Volumetric Spectral Fluid" (Generative morphing gradients, soft-focus diffusion, bioluminescent light sources, spectral chromatic aberration).

**YOUR TASK:**
For EACH variation:
- Invent a unique design persona name based on a NEW physical metaphor.
- Rewrite the prompt to fully adopt that metaphor's visual language.
- Generate high-fidelity HTML/CSS with Portuguese (Brazil) text content.

Required JSON Output Format (stream ONE object per line):
\`{ "name": "Persona Name", "html": "..." }\`
        `.trim();

            const responseStream = await ai.models.generateContentStream({
                model: 'gemini-2.0-flash-exp',
                contents: [{ parts: [{ text: prompt }], role: 'user' }],
                config: { temperature: 1.2 }
            });


            for await (const variation of parseJsonStream(responseStream)) {
                if (variation.name && variation.html) {
                    setComponentVariations(prev => [...prev, variation]);
                }
            }
        } catch (e: any) {
            console.error("Error generating variations:", e);
        } finally {
            setIsLoading(false);
        }
    }, [sessions, currentSessionIndex, focusedArtifactIndex]);

    const applyVariation = (html: string) => {
        if (focusedArtifactIndex === null) return;
        setSessions(prev => prev.map((sess, i) =>
            i === currentSessionIndex ? {
                ...sess,
                artifacts: sess.artifacts.map((art, j) =>
                    j === focusedArtifactIndex ? { ...art, html, status: 'complete' } : art
                )
            } : sess
        ));
        setDrawerState(s => ({ ...s, isOpen: false }));
    };

    const handleShowCode = () => {
        const currentSession = sessions[currentSessionIndex];
        if (currentSession && focusedArtifactIndex !== null) {
            const artifact = currentSession.artifacts[focusedArtifactIndex];
            setDrawerState({ isOpen: true, mode: 'code', title: 'Código Fonte', data: artifact.html });
        }
    };

    const handleSendMessage = useCallback(async (manualPrompt?: string) => {
        const promptToUse = manualPrompt || inputValue;
        const trimmedInput = promptToUse.trim();

        if (!trimmedInput || isLoading) return;
        if (!manualPrompt) setInputValue('');

        setIsLoading(true);
        const baseTime = Date.now();
        const sessionId = generateId();

        const placeholderArtifacts: Artifact[] = Array(3).fill(null).map((_, i) => ({
            id: `${sessionId}_${i}`,
            styleName: 'Projetando...',
            html: '',
            status: 'streaming',
        }));

        const newSession: Session = {
            id: sessionId,
            prompt: trimmedInput,
            timestamp: baseTime,
            artifacts: placeholderArtifacts
        };

        setSessions(prev => [...prev, newSession]);
        setCurrentSessionIndex(sessions.length);
        setFocusedArtifactIndex(null);

        try {
            const ai = await getGeminiClient(undefined, user?.id);


            const stylePrompt = `
Generate 3 distinct, highly evocative design directions for: "${trimmedInput}".

**STRICT IP SAFEGUARD:**
Never use artist or brand names. Use physical and material metaphors.

**CREATIVE EXAMPLES (Do not simply copy these, use them as a guide for tone):**
- Example A: "Asymmetrical Rectilinear Blockwork" (Grid-heavy, primary pigments, thick structural strokes, Bauhaus-functionalism vibe).
- Example B: "Grainy Risograph Layering" (Tactile paper texture, overprinted translucent inks, dithered gradients).
- Example C: "Kinetic Wireframe Suspension" (Floating silhouettes, thin balancing lines, organic primary shapes).
- Example D: "Spectral Prismatic Diffusion" (Glassmorphism, caustic refraction, soft-focus morphing gradients).

**GOAL:**
Return ONLY a raw JSON array of 3 *NEW*, creative names for these directions (e.g. ["Tactile Risograph Press", "Kinetic Silhouette Balance", "Primary Pigment Gridwork"]).
        `.trim();

            const styleResponse = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: { role: 'user', parts: [{ text: stylePrompt }] }
            });


            let generatedStyles: string[] = [];
            const styleText = styleResponse.text || '[]';
            const jsonMatch = styleText.match(/\[[\s\S]*\]/);

            if (jsonMatch) {
                try {
                    generatedStyles = JSON.parse(jsonMatch[0]);
                } catch (e) {
                    console.warn("Failed to parse styles, using fallbacks");
                }
            }

            if (!generatedStyles || generatedStyles.length < 3) {
                generatedStyles = [
                    "Primary Pigment Gridwork",
                    "Tactile Risograph Layering",
                    "Kinetic Silhouette Balance"
                ];
            }

            generatedStyles = generatedStyles.slice(0, 3);

            setSessions(prev => prev.map(s => {
                if (s.id !== sessionId) return s;
                return {
                    ...s,
                    artifacts: s.artifacts.map((art, i) => ({
                        ...art,
                        styleName: generatedStyles[i]
                    }))
                };
            }));

            const generateArtifact = async (artifact: Artifact, styleInstruction: string) => {
                try {
                    const prompt = `
You are Flash UI. Create a stunning, high-fidelity UI component for: "${trimmedInput}". Ensure the visible text content of the component is in Portuguese (Brazil).

**CONCEPTUAL DIRECTION: ${styleInstruction}**

**VISUAL EXECUTION RULES:**
1. **Materiality**: Use the specified metaphor to drive every CSS choice. (e.g. if Risograph, use \`feTurbulence\` for grain and \`mix-blend-mode: multiply\` for ink layering).
2. **Typography**: Use high-quality web fonts. Pair a bold sans-serif with a refined monospace for data.
3. **Motion**: Include subtle, high-performance CSS/JS animations (hover transitions, entry reveals).
4. **IP SAFEGUARD**: No artist names or trademarks. 
5. **Layout**: Be bold with negative space and hierarchy. Avoid generic cards.

Return ONLY RAW HTML. No markdown fences.
          `.trim();

                    const responseStream = await ai.models.generateContentStream({
                        model: 'gemini-2.0-flash-exp',
                        contents: [{ parts: [{ text: prompt }], role: "user" }],
                    });


                    let accumulatedHtml = '';
                    for await (const chunk of responseStream) {
                        const text = chunk.text;
                        if (typeof text === 'string') {
                            accumulatedHtml += text;
                            setSessions(prev => prev.map(sess =>
                                sess.id === sessionId ? {
                                    ...sess,
                                    artifacts: sess.artifacts.map(art =>
                                        art.id === artifact.id ? { ...art, html: accumulatedHtml } : art
                                    )
                                } : sess
                            ));
                        }
                    }

                    let finalHtml = accumulatedHtml.trim();
                    if (finalHtml.startsWith('```html')) finalHtml = finalHtml.substring(7).trimStart();
                    if (finalHtml.startsWith('```')) finalHtml = finalHtml.substring(3).trimStart();
                    if (finalHtml.endsWith('```')) finalHtml = finalHtml.substring(0, finalHtml.length - 3).trimEnd();

                    setSessions(prev => prev.map(sess =>
                        sess.id === sessionId ? {
                            ...sess,
                            artifacts: sess.artifacts.map(art =>
                                art.id === artifact.id ? { ...art, html: finalHtml, status: finalHtml ? 'complete' : 'error' } : art
                            )
                        } : sess
                    ));

                } catch (e: any) {
                    console.error('Error generating artifact:', e);
                    setSessions(prev => prev.map(sess =>
                        sess.id === sessionId ? {
                            ...sess,
                            artifacts: sess.artifacts.map(art =>
                                art.id === artifact.id ? { ...art, html: `<div style="color: #ff6b6b; padding: 20px;">Erro: ${e.message}</div>`, status: 'error' } : art
                            )
                        } : sess
                    ));
                }
            };

            await Promise.all(placeholderArtifacts.map((art, i) => generateArtifact(art, generatedStyles[i])));

        } catch (e) {
            console.error("Fatal error in generation process", e);
        } finally {
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [inputValue, isLoading, sessions.length]);

    const handleSurpriseMe = () => {
        const currentPrompt = placeholders[placeholderIndex];
        setInputValue(currentPrompt);
        handleSendMessage(currentPrompt);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !isLoading) {
            event.preventDefault();
            handleSendMessage();
        } else if (event.key === 'Tab' && !inputValue && !isLoading) {
            event.preventDefault();
            setInputValue(placeholders[placeholderIndex]);
        }
    };

    const nextItem = useCallback(() => {
        if (focusedArtifactIndex !== null) {
            if (focusedArtifactIndex < 2) setFocusedArtifactIndex(focusedArtifactIndex + 1);
        } else {
            if (currentSessionIndex < sessions.length - 1) setCurrentSessionIndex(currentSessionIndex + 1);
        }
    }, [currentSessionIndex, sessions.length, focusedArtifactIndex]);

    const prevItem = useCallback(() => {
        if (focusedArtifactIndex !== null) {
            if (focusedArtifactIndex > 0) setFocusedArtifactIndex(focusedArtifactIndex - 1);
        } else {
            if (currentSessionIndex > 0) setCurrentSessionIndex(currentSessionIndex - 1);
        }
    }, [currentSessionIndex, focusedArtifactIndex]);

    const isLoadingDrawer = isLoading && drawerState.mode === 'variations' && componentVariations.length === 0;

    const hasStarted = sessions.length > 0 || isLoading;
    const currentSession = sessions[currentSessionIndex];

    let canGoBack = false;
    let canGoForward = false;

    if (hasStarted) {
        if (focusedArtifactIndex !== null) {
            canGoBack = focusedArtifactIndex > 0;
            canGoForward = focusedArtifactIndex < (currentSession?.artifacts.length || 0) - 1;
        } else {
            canGoBack = currentSessionIndex > 0;
            canGoForward = currentSessionIndex < sessions.length - 1;
        }
    }

    return (
        <div className="flash-ui-root relative w-full h-full bg-[#09090b] text-white font-sans overflow-hidden">
            <a href="https://x.com/ammaar" target="_blank" rel="noreferrer" className={`creator-credit ${hasStarted ? 'hide-on-mobile' : ''}`}>

                criado por @ammaar
            </a>


            <SideDrawer
                isOpen={drawerState.isOpen}
                onClose={() => setDrawerState(s => ({ ...s, isOpen: false }))}
                title={drawerState.title}
            >
                {isLoadingDrawer && (
                    <div className="loading-state">
                        <ThinkingIcon />
                        Projetando variações...
                    </div>
                )}

                {drawerState.mode === 'code' && (
                    <pre className="code-block"><code>{drawerState.data}</code></pre>
                )}

                {drawerState.mode === 'variations' && (
                    <div className="sexy-grid">
                        {componentVariations.map((v, i) => (
                            <div key={i} className="sexy-card" onClick={() => applyVariation(v.html)}>
                                <div className="sexy-preview">
                                    <iframe srcDoc={v.html} title={v.name} sandbox="allow-scripts allow-same-origin" />
                                </div>
                                <div className="sexy-label">{v.name}</div>
                            </div>
                        ))}
                    </div>
                )}
            </SideDrawer>

            <div className="immersive-app">
                <DottedGlowBackground
                    gap={24}
                    radius={1.5}
                    color="rgba(255, 255, 255, 0.02)"
                    glowColor="rgba(255, 255, 255, 0.15)"
                    speedScale={0.5}
                />

                <div className={`stage-container ${focusedArtifactIndex !== null ? 'mode-focus' : 'mode-split'}`}>
                    <div className={`empty-state ${hasStarted ? 'fade-out' : ''}`}>
                        <div className="empty-content">
                            <h1>Flash UI</h1>
                            <p>Geração de UI instantânea com tecnologia Gemini</p>
                            <div className="features-list">
                                <span>✨ Crie interfaces a partir de texto</span>
                                <span>🎨 Explore variações de design</span>
                                <span>💻 Exporte código HTML/CSS limpo</span>
                            </div>
                            <button className="surprise-button" onClick={handleSurpriseMe} disabled={isLoading}>
                                <SparklesIcon /> Surpreenda-me
                            </button>
                        </div>
                    </div>

                    {sessions.map((session, sIndex) => {
                        let positionClass = 'hidden';
                        if (sIndex === currentSessionIndex) positionClass = 'active-session';
                        else if (sIndex < currentSessionIndex) positionClass = 'past-session';
                        else if (sIndex > currentSessionIndex) positionClass = 'future-session';

                        return (
                            <div key={session.id} className={`session-group ${positionClass}`}>
                                <div className="artifact-grid" ref={sIndex === currentSessionIndex ? gridScrollRef : null}>
                                    {session.artifacts.map((artifact, aIndex) => {
                                        const isFocused = focusedArtifactIndex === aIndex;

                                        return (
                                            <ArtifactCard
                                                key={artifact.id}
                                                artifact={artifact}
                                                isFocused={isFocused}
                                                onClick={() => setFocusedArtifactIndex(aIndex)}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {canGoBack && (
                    <button className="nav-handle left" onClick={prevItem} aria-label="Anterior">
                        <ArrowLeftIcon />
                    </button>
                )}
                {canGoForward && (
                    <button className="nav-handle right" onClick={nextItem} aria-label="Próximo">
                        <ArrowRightIcon />
                    </button>
                )}

                <div className={`action-bar ${focusedArtifactIndex !== null ? 'visible' : ''}`}>
                    <div className="active-prompt-label">
                        {currentSession?.prompt}
                    </div>
                    <div className="action-buttons">
                        <button onClick={() => setFocusedArtifactIndex(null)}>
                            <GridIcon /> Grade
                        </button>
                        <button onClick={handleGenerateVariations} disabled={isLoading}>
                            <SparklesIcon /> Variações
                        </button>
                        <button onClick={handleShowCode}>
                            <CodeIcon /> Código
                        </button>
                    </div>
                </div>

                <div className="floating-input-container">
                    <div className={`input-wrapper ${isLoading ? 'loading' : ''}`}>
                        {(!inputValue && !isLoading) && (
                            <div className="animated-placeholder" key={placeholderIndex}>
                                <span className="placeholder-text">{placeholders[placeholderIndex]}</span>
                                <span className="tab-hint">Tab</span>
                            </div>
                        )}
                        {!isLoading ? (
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                            />
                        ) : (
                            <div className="input-generating-label">
                                <span className="generating-prompt-text">{currentSession?.prompt}</span>
                                <ThinkingIcon />
                            </div>
                        )}
                        <button className="send-button" onClick={() => handleSendMessage()} disabled={isLoading || !inputValue.trim()}>
                            <ArrowUpIcon />
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
}



