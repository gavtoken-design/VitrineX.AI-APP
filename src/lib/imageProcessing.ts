
import { LogoSettings } from '../components/features/BrandAssetsManager';

export const applyWatermark = async (baseImageSrc: string, logoSettings: LogoSettings): Promise<string> => {
    if (!logoSettings.file || !logoSettings.previewUrl) return baseImageSrc;

    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
        }

        const baseImg = new Image();
        baseImg.crossOrigin = 'anonymous'; // Important for external URLs
        baseImg.src = baseImageSrc;

        baseImg.onload = () => {
            canvas.width = baseImg.width;
            canvas.height = baseImg.height;

            // Draw base image
            ctx.drawImage(baseImg, 0, 0);

            const logoImg = new Image();
            logoImg.src = logoSettings.previewUrl!;

            logoImg.onload = () => {
                // Calculate Logo Dimensions
                const aspectRatio = logoImg.width / logoImg.height;
                // Base logo width relative to image (e.g., 20% of image width by default)
                const baseLogoWidth = canvas.width * 0.2;
                const renderWidth = baseLogoWidth * logoSettings.scale;
                const renderHeight = renderWidth / aspectRatio;

                // Apply Opacity
                ctx.globalAlpha = logoSettings.opacity;

                // Calculate Position
                const padding = canvas.width * 0.05; // 5% padding
                let x = 0;
                let y = 0;

                switch (logoSettings.position) {
                    case 'top-left':
                        x = padding;
                        y = padding;
                        break;
                    case 'top-right':
                        x = canvas.width - renderWidth - padding;
                        y = padding;
                        break;
                    case 'bottom-left':
                        x = padding;
                        y = canvas.height - renderHeight - padding;
                        break;
                    case 'bottom-right':
                        x = canvas.width - renderWidth - padding;
                        y = canvas.height - renderHeight - padding;
                        break;
                    case 'center':
                        x = (canvas.width - renderWidth) / 2;
                        y = (canvas.height - renderHeight) / 2;
                        break;
                }

                // Draw Logo
                ctx.drawImage(logoImg, x, y, renderWidth, renderHeight);

                // Reset Alpha
                ctx.globalAlpha = 1.0;

                // Export
                const resultDataUrl = canvas.toDataURL('image/png');
                resolve(resultDataUrl);
            };

            logoImg.onerror = (err) => reject(new Error('Failed to load logo image'));
        };

        baseImg.onerror = (err) => reject(new Error('Failed to load base image'));
    });
};
