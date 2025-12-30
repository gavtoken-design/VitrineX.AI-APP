export type LayerType = 'image' | 'text' | 'adjustment';

export interface BaseLayer {
    id: string;
    type: LayerType;
    name: string;
    visible: boolean;
    opacity: number; // 0-1
}

export interface ImageLayer extends BaseLayer {
    type: 'image';
    src: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    rotation?: number;
    scale?: number;
}

export interface TextLayer extends BaseLayer {
    type: 'text';
    text: string;
    x: number;
    y: number;
    color: string;
    fontSize: number;
    fontFamily?: string;
}

export interface LevelValues {
    inputShadow: number;
    inputHighlight: number;
    midtone: number; // Gamma
    outputShadow: number;
    outputHighlight: number;
    channel: 'RGB' | 'R' | 'G' | 'B';
}

export interface CurvePoint {
    x: number;
    y: number;
}

export interface CurvesValues {
    points: CurvePoint[];
    channel: 'RGB' | 'R' | 'G' | 'B';
}

export interface HSLValues {
    hue: number;        // 0-360
    saturation: number; // 0-2
    lightness: number;  // 0-2 (slope)
}

export interface AdjustmentLayer extends BaseLayer {
    type: 'adjustment';
    adjustmentType: 'brightness' | 'contrast' | 'saturation' | 'hue' | 'blur' | 'sepia' | 'grayscale' | 'levels' | 'curves' | 'hsl';
    value: number | LevelValues | CurvesValues | HSLValues;
}

export type Layer = ImageLayer | TextLayer | AdjustmentLayer;

export interface CosmicState {
    layers: Layer[];
    selectedLayerId: string | null;
    canvasSize: { width: number; height: number };
    zoom: number;
    pan: { x: number; y: number };
}
