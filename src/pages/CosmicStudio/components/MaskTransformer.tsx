
import React from 'react';
import { ImageLayer } from '../engine/types';
import { Maximize2 } from 'lucide-react';

interface MaskTransformerProps {
    layer: ImageLayer; // The specific image layer we are masking
    maskRegion: { x: number; y: number; width: number; height: number }; // Relative to image center/layer coords
    zoom: number;
    onUpdateMask: (region: { x: number; y: number; width: number; height: number }) => void;
}

const MaskTransformer: React.FC<MaskTransformerProps> = ({ layer, maskRegion, zoom, onUpdateMask }) => {
    // We need to render this ON TOP of the image layer, but its coordinates are relative to the Image Layer's origin if possible,
    // OR we render it as a child of the image layer in Editor. 
    // Let's assume it's rendered as a child of the layer div in Editor.tsx for easier coordinate space.

    // maskRegion x/y are relative to the CENTER of the image layer?
    // Let's define maskRegion as relative to the TOP-LEFT of the image layer for simplicity in rendering inside the layer div.
    // If layer width is 500, x=0 is left edge.

    const { x, y, width, height } = maskRegion;

    const handleMouseDown = (e: React.MouseEvent, type: 'resize' | 'move', corner?: string) => {
        e.stopPropagation();
        e.preventDefault();

        const startX = e.clientX;
        const startY = e.clientY;
        const startW = width;
        const startH = height;
        const startXPos = x;
        const startYPos = y;

        const onMove = (mv: MouseEvent) => {
            const dx = (mv.clientX - startX) / zoom; // Adjust for zoom
            const dy = (mv.clientY - startY) / zoom;

            let newX = startXPos;
            let newY = startYPos;
            let newW = startW;
            let newH = startH;

            if (type === 'move') {
                newX = startXPos + dx;
                newY = startYPos + dy;
            } else if (type === 'resize' && corner) {
                if (corner.includes('r')) newW = startW + dx;
                if (corner.includes('l')) { newW = startW - dx; newX = startXPos + dx; }
                if (corner.includes('b')) newH = startH + dy;
                if (corner.includes('t')) { newH = startH - dy; newY = startYPos + dy; }
            }

            // Constraints: Keep inside image bounds
            // Image dimensions are stored in `layer`
            const imgW = layer.width || 100;
            const imgH = layer.height || 100;

            if (newX < 0) newX = 0;
            if (newY < 0) newY = 0;
            if (newX + newW > imgW) {
                if (type === 'move') newX = imgW - newW;
                else newW = imgW - newX;
            }
            if (newY + newH > imgH) {
                if (type === 'move') newY = imgH - newH;
                else newH = imgH - newY;
            }

            // Min size
            if (newW < 20) newW = 20;
            if (newH < 20) newH = 20;

            onUpdateMask({ x: newX, y: newY, width: newW, height: newH });
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
            className="absolute border-2 border-emerald-400 bg-emerald-500/20 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] pointer-events-auto"
            style={{
                left: x,
                top: y,
                width: width,
                height: height,
                cursor: 'move',
                zIndex: 1000 // Always top inside the layer
            }}
            onMouseDown={(e) => handleMouseDown(e, 'move')}
        >
            {/* Center Crosshair (Visual only) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-50 pointer-events-none">
                <Maximize2 size={16} className="text-emerald-200" />
            </div>

            {/* Resize Handles */}
            {['tl', 'tr', 'bl', 'br'].map(corner => (
                <div
                    key={corner}
                    onMouseDown={(e) => handleMouseDown(e, 'resize', corner)}
                    className={`absolute w-3 h-3 bg-white border border-emerald-500 rounded-full z-50
                        ${corner[0] === 't' ? '-top-1.5' : '-bottom-1.5'}
                        ${corner[1] === 'l' ? '-left-1.5' : '-right-1.5'}
                        ${(corner === 'tl' || corner === 'br') ? 'cursor-nwse-resize' : 'cursor-nesw-resize'}
                    `}
                />
            ))}

            {/* Label */}
            <div className="absolute -top-7 left-0 bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider shadow-sm pointer-events-none whitespace-nowrap">
                Área de Edição
            </div>
        </div>
    );
};

export default MaskTransformer;
