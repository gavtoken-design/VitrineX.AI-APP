/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// @ts-ignore
import { GIFEncoder, quantize, applyPalette } from 'gifenc';

export const getRandomStyle = (): string => {
    const styles = [
        "formado por nuvens brancas e fofas em um céu azul profundo de verão",
        "escrito em constelações brilhantes contra uma galáxia nebulosa escura",
        "arranjado usando folhas coloridas de outono na grama verde úmida",
        "refletido em poças de neon cyberpunk em uma rua chuvosa",
        "desenhado com espuma de latte art em uma xícara de café de cerâmica",
        "brilhando como runas mágicas antigas esculpidas em uma parede de caverna escura",
        "exibido em uma interface holográfica translúcida futurista",
        "esculpido em ouro surrealista derretendo em uma paisagem desértica",
        "arranjado com engrenagens mecânicas intrincadas e maquinário steampunk",
        "formado por águas-vivas bioluminescentes no oceano profundo",
        "composto de fumaça colorida vibrante girando em um quarto escuro",
        "esculpido na casca de um antigo carvalho coberto de musgo",
        "feito de diamantes cintilantes espalhados em veludo preto"
    ];
    return styles[Math.floor(Math.random() * styles.length)];
};

export const cleanBase64 = (data: string): string => {
    // Remove data URL prefix if present to get raw base64
    // Handles generic data:application/octet-stream;base64, patterns too
    return data.replace(/^data:.*,/, '');
};

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

export const createGifFromVideo = async (videoUrl: string): Promise<Blob> => {
    // Runtime check just in case, though standard imports should throw earlier if failed
    if (typeof GIFEncoder !== 'function') {
        throw new Error("A biblioteca GIF falhou ao carregar corretamente. Por favor, atualize a página.");
    }

    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.crossOrigin = "anonymous";
        video.src = videoUrl;
        video.muted = true;

        video.onloadedmetadata = async () => {
            try {
                const duration = video.duration || 5;
                const width = 400; // Downscale for speed
                // Ensure even dimensions
                let height = Math.floor((video.videoHeight / video.videoWidth) * width);
                if (height % 2 !== 0) height -= 1;

                const fps = 10;
                const totalFrames = Math.floor(duration * fps);

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });

                if (!ctx) throw new Error("Não foi possível obter o contexto do canvas");

                // Initialize encoder
                const gif = GIFEncoder();

                for (let i = 0; i < totalFrames; i++) {
                    // Yield to main thread to prevent UI freeze
                    await new Promise(r => setTimeout(r, 0));

                    const time = i / fps;
                    video.currentTime = time;

                    // Wait for seek with timeout
                    await new Promise<void>((r, rej) => {
                        const timeout = setTimeout(() => {
                            video.removeEventListener('seeked', seekHandler);
                            // Proceed anyway if seek takes too long, though frame might be dupe
                            r();
                        }, 1000);

                        const seekHandler = () => {
                            clearTimeout(timeout);
                            video.removeEventListener('seeked', seekHandler);
                            r();
                        };
                        video.addEventListener('seeked', seekHandler);
                    });

                    ctx.drawImage(video, 0, 0, width, height);
                    const imageData = ctx.getImageData(0, 0, width, height);
                    const { data } = imageData;

                    // Quantize
                    const palette = quantize(data, 256);
                    const index = applyPalette(data, palette);

                    gif.writeFrame(index, width, height, { palette, delay: 1000 / fps });
                }

                gif.finish();
                const buffer = gif.bytes();
                resolve(new Blob([buffer], { type: 'image/gif' }));
            } catch (e) {
                console.error("Erro na Geração de GIF:", e);
                reject(e);
            }
        };

        video.onerror = (e) => reject(new Error("Falha ao carregar vídeo"));
        video.load();
    });
};

export const TYPOGRAPHY_SUGGESTIONS = [
    { id: 'cinematic-3d', label: '3D Cinemático', prompt: 'Texto 3D ousado e dimensional com iluminação e sombras realistas' },
    { id: 'neon-cyber', label: 'Neon Cyber', prompt: 'Tipografia de tubo de neon brilhante, estética cyberpunk, brilho vibrante' },
    { id: 'elegant-serif', label: 'Serifa Elegante', prompt: 'Tipografia serifada refinada de alto contraste, visual editorial de luxo' },
    { id: 'bold-sans', label: 'Sans Negrito', prompt: 'Tipografia sem serifa maciça e pesada, geométrica e impactante' },
    { id: 'handwritten', label: 'Manuscrito', prompt: 'Escrita orgânica e fluida com pincel, artística e pessoal' },
    { id: 'retro-80s', label: 'Retrô Anos 80', prompt: 'Tipografia estilo synthwave cromada com linhas do horizonte e brilhos' },
    { id: 'liquid-metal', label: 'Metal Líquido', prompt: 'Tipografia cromada fluida e derretida, surreal e reflexiva' },
    { id: 'botanical', label: 'Botânico', prompt: 'Tipografia entrelaçada com vinhas, flores e elementos da natureza orgânica' },
];
