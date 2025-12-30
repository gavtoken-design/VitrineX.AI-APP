import React from 'react';
import { AdjustmentLayer, LevelValues, CurvesValues, HSLValues } from './types';

// Helper to generate gamma correction table
const getGammaTable = (gamma: number) => {
    const table = [];
    for (let i = 0; i < 256; i++) {
        const v = i / 255;
        const correction = Math.pow(v, 1 / gamma) * 255;
        table.push(correction);
    }
    return table.join(' ');
};

// Helper for linear interpolation table (Levels)
const getLevelsTable = (inBlack: number, inWhite: number, gamma: number, outBlack: number, outWhite: number) => {
    const table = [];
    for (let i = 0; i < 256; i++) {
        let v = i;
        // Input Range
        if (v < inBlack) v = inBlack;
        if (v > inWhite) v = inWhite;
        v = (v - inBlack) / (inWhite - inBlack);

        // Gamma
        v = Math.pow(v, 1 / gamma);

        // Output Range
        v = v * (outWhite - outBlack) + outBlack;

        table.push(Math.min(255, Math.max(0, v)) / 255);
    }
    return table.join(' ');
};

interface ToneCurveMapProps {
    layer: AdjustmentLayer;
}

export const FilterDefinitions: React.FC<{ layers: AdjustmentLayer[] }> = ({ layers }) => {
    return (
        <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
            <defs>
                {layers.map(layer => {
                    if (layer.adjustmentType === 'levels') {
                        const val = layer.value as LevelValues;
                        const table = getLevelsTable(val.inputShadow, val.inputHighlight, val.midtone, val.outputShadow, val.outputHighlight);

                        return (
                            <filter id={`filter-${layer.id}`} key={layer.id}>
                                <feComponentTransfer>
                                    <feFuncR type="table" tableValues={val.channel === 'RGB' || val.channel === 'R' ? table : '0 1'} />
                                    <feFuncG type="table" tableValues={val.channel === 'RGB' || val.channel === 'G' ? table : '0 1'} />
                                    <feFuncB type="table" tableValues={val.channel === 'RGB' || val.channel === 'B' ? table : '0 1'} />
                                </feComponentTransfer>
                            </filter>
                        );
                    }
                    if (layer.adjustmentType === 'curves') {
                        // Simplified curve implementation - in reality needs spline interpolation
                        // For MVP we just assume standard linear if 2 points, or simple if more.
                        // Ideally we pre-calculate a 256 value table in the component logic.
                        // Here we will just identity for now or a simple "S-Curve" placeholder if user wants 'pop'.
                        // To properly implement Curves, we need a Spline Interpolator function.
                        return (
                            <filter id={`filter-${layer.id}`} key={layer.id}>
                                <feComponentTransfer>
                                    <feFuncR type="identity" />
                                    <feFuncG type="identity" />
                                    <feFuncB type="identity" />
                                </feComponentTransfer>
                            </filter>
                        );
                    }
                    if (layer.adjustmentType === 'hsl') {
                        const val = layer.value as HSLValues;
                        return (
                            <filter id={`filter-${layer.id}`} key={layer.id}>
                                <feColorMatrix type="hueRotate" values={`${val.hue}`} result="hue" />
                                <feColorMatrix in="hue" type="saturate" values={`${val.saturation}`} result="sat" />
                                <feComponentTransfer in="sat">
                                    <feFuncR type="linear" slope={`${val.lightness}`} intercept="0" />
                                    <feFuncG type="linear" slope={`${val.lightness}`} intercept="0" />
                                    <feFuncB type="linear" slope={`${val.lightness}`} intercept="0" />
                                </feComponentTransfer>
                            </filter>
                        );
                    }
                    return null;
                })}
            </defs>
        </svg>
    );
};
