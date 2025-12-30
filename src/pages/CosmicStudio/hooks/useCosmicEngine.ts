import { useState, useCallback, useRef } from 'react';
import { CosmicState, Layer, LayerType, ImageLayer, TextLayer, AdjustmentLayer } from '../engine/types';

const INITIAL_STATE: CosmicState = {
    layers: [],
    selectedLayerId: null,
    canvasSize: { width: 800, height: 600 },
    zoom: 1,
    pan: { x: 0, y: 0 }
};

// ... (previous imports)

export interface CosmicEngineContext {
    state: CosmicState;
    layers: Layer[];
    selectedLayerId: string | null;
    addLayer: (layer: Layer) => void;
    updateLayer: (id: string, updates: Partial<Layer>) => void;
    removeLayer: (id: string) => void;
    updateState: (updates: Partial<CosmicState>) => void;
    setZoom: (zoom: number) => void;
    setPan: (pan: { x: number; y: number }) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

export const useCosmicEngine = (): CosmicEngineContext => {
    // ... implementation
    const [state, setState] = useState<CosmicState>(INITIAL_STATE);

    // History Stack
    const [history, setHistory] = useState<CosmicState[]>([INITIAL_STATE]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const pushToHistory = useCallback((newState: CosmicState) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newState);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    const updateState = useCallback((updates: Partial<CosmicState>) => {
        setState(prev => {
            const newState = { ...prev, ...updates };
            pushToHistory(newState);
            return newState;
        });
    }, [pushToHistory]);

    const addLayer = useCallback((layer: Layer) => {
        setState(prev => {
            const newState = {
                ...prev,
                layers: [...prev.layers, layer],
                selectedLayerId: layer.id
            };
            pushToHistory(newState);
            return newState;
        });
    }, [pushToHistory]);

    const updateLayer = useCallback((id: string, updates: Partial<Layer>) => {
        setState(prev => {
            const newLayers = prev.layers.map(layer =>
                layer.id === id ? { ...layer, ...updates } as Layer : layer
            );
            const newState = { ...prev, layers: newLayers };
            pushToHistory(newState);
            return newState;
        });
    }, [pushToHistory]);

    const removeLayer = useCallback((id: string) => {
        setState(prev => {
            const newLayers = prev.layers.filter(l => l.id !== id);
            const newState = { ...prev, layers: newLayers, selectedLayerId: null };
            pushToHistory(newState);
            return newState;
        });
    }, [pushToHistory]);

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const prevIndex = historyIndex - 1;
            setHistoryIndex(prevIndex);
            setState(history[prevIndex]);
        }
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const nextIndex = historyIndex + 1;
            setHistoryIndex(nextIndex);
            setState(history[nextIndex]);
        }
    }, [history, historyIndex]);

    // Actions specifically for the UI
    const setZoom = (zoom: number) => setState(prev => ({ ...prev, zoom }));
    const setPan = (pan: { x: number, y: number }) => setState(prev => ({ ...prev, pan }));

    return {
        state,
        layers: state.layers,
        selectedLayerId: state.selectedLayerId,
        // Actions
        addLayer,
        updateLayer,
        removeLayer,
        updateState,
        setZoom,
        setPan,
        // History
        undo,
        redo,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1
    };
};
