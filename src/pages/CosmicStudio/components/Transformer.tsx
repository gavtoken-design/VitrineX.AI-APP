
import React, { useEffect, useRef } from 'react';
import { Layer, ImageLayer, TextLayer } from '../../engine/types';
import { RotateCw, Move } from 'lucide-react';

interface TransformerProps {
    layer: Layer;
    zoom: number;
    onUpdate: (id: string, updates: Partial<ImageLayer | TextLayer>) => void;
}

const Transformer: React.FC<TransformerProps> = ({ layer, zoom, onUpdate }) => {
    // Only support Image and Text for generic transform
    if (layer.type === 'adjustment') return null;

    const isImage = layer.type === 'image';
    const isText = layer.type === 'text';

    // Default sizing if not set
    const width = (layer as ImageLayer).width || (isText ? 200 : 300);
    const height = (layer as ImageLayer).height || (isText ? 50 : 300);
    const rotation = (layer as any).rotation || 0;
    const x = (layer as any).x || 0;
    const y = (layer as any).y || 0;

    const handleMouseDown = (e: React.MouseEvent, type: 'resize' | 'rotate' | 'move', corner?: string) => {
        e.stopPropagation();
        e.preventDefault();

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = width;
        const startHeight = height;
        const startRotation = rotation;
        const startXPos = x;
        const startYPos = y;

        const onMove = (mv: MouseEvent) => {
            const dx = (mv.clientX - startX) / zoom;
            const dy = (mv.clientY - startY) / zoom;

            if (type === 'move') {
                onUpdate(layer.id, { x: startXPos + dx, y: startYPos + dy });
            } else if (type === 'rotate') {
                // Simple rotation logic based on center
                // This usually requires calculating angle relative to center
                // simplified for now as just dragging x
                onUpdate(layer.id, { rotation: startRotation + dx });
            } else if (type === 'resize' && corner) {
                let newW = startWidth;
                let newH = startHeight;

                if (corner.includes('r')) newW += dx;
                if (corner.includes('l')) newW -= dx;
                if (corner.includes('b')) newH += dy;
                if (corner.includes('t')) newH -= dy;

                // constrain
                if (newW < 20) newW = 20;
                if (newH < 20) newH = 20;

                onUpdate(layer.id, { width: newW, height: newH });
            }
        };

        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    return (
        <div
            className="absolute border-2 border-purple-500 pointer-events-none"
            style={{
                left: '50%',
                top: '50%',
                width: width,
                height: height,
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rotation}deg)`,
                pointerEvents: 'none', // Allow passing clicks to layer below if needed, but handles need events
                zIndex: 100
            }}
        >
            {/* Move Handle (Center) */}
            {/* <div
                onMouseDown={(e) => handleMouseDown(e, 'move')}
                className="absolute inset-0 cursor-move pointer-events-auto"
            /> */}

            {/* Resize Handles */}
            <div
                onMouseDown={(e) => handleMouseDown(e, 'resize', 'tl')}
                className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-purple-500 rounded-full cursor-nwse-resize pointer-events-auto"
            />
            <div
                onMouseDown={(e) => handleMouseDown(e, 'resize', 'tr')}
                className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-purple-500 rounded-full cursor-nesw-resize pointer-events-auto"
            />
            <div
                onMouseDown={(e) => handleMouseDown(e, 'resize', 'bl')}
                className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-purple-500 rounded-full cursor-nesw-resize pointer-events-auto"
            />
            <div
                onMouseDown={(e) => handleMouseDown(e, 'resize', 'br')}
                className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-purple-500 rounded-full cursor-nwse-resize pointer-events-auto"
            />

            {/* Rotation Handle */}
            <div
                onMouseDown={(e) => handleMouseDown(e, 'rotate')}
                className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-purple-500 rounded-full flex items-center justify-center cursor-ew-resize pointer-events-auto"
            >
                <div className="h-3 w-[1px] bg-purple-500 absolute -bottom-3 left-1/2"></div>
                <RotateCw size={12} className="text-purple-600" />
            </div>
        </div>
    );
};

export default Transformer;
