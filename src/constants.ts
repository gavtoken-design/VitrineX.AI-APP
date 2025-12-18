
// Gemini Model Names - Official Google Gemini API models
export const GEMINI_FLASH_MODEL = 'gemini-flash-latest';  // Auto-updates to latest stable
export const GEMINI_PRO_MODEL = 'gemini-pro-latest';      // Auto-updates to latest stable

// Image Generation Models - Imagen 4.0
export const IMAGEN_STANDARD_MODEL = 'imagen-4.0-generate-001';      // Standard quality
export const IMAGEN_ULTRA_MODEL = 'imagen-4.0-ultra-generate-001';  // Ultra quality (highest)
export const GEMINI_IMAGE_MODEL = IMAGEN_ULTRA_MODEL;  // Default to ultra quality

// Video Generation Models - Veo 2.0
export const VEO_GENERATE_MODEL = 'veo-2.0-generate-001';  // Veo 2.0 (Dec 2024, 4K support)

// Audio Models - Gemini 2.5
export const GEMINI_LIVE_AUDIO_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';
export const GEMINI_TTS_FLASH_MODEL = 'gemini-2.5-flash-preview-tts';  // Flash TTS (faster)
export const GEMINI_TTS_PRO_MODEL = 'gemini-2.5-pro-preview-tts';      // Pro TTS (higher quality)
export const GEMINI_TTS_MODEL = GEMINI_TTS_FLASH_MODEL;  // Default to Flash for consistency

// Thinking Model
export const GEMINI_THINKING_MODEL = 'gemini-2.0-flash-thinking-exp';  // Thinking mode experimental




// Default values
export const DEFAULT_ASPECT_RATIO = '16:9';
export const DEFAULT_IMAGE_SIZE = '1K';
export const DEFAULT_VIDEO_RESOLUTION = '720p';

// Supported options for UI
export const IMAGE_ASPECT_RATIOS = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'];
export const IMAGE_SIZES = ['1K', '2K', '4K']; // For Pro Image Model
export const VIDEO_ASPECT_RATIOS = ['16:9', '9:16'];
export const VIDEO_RESOLUTIONS = ['720p', '1080p'];

// Placeholder base64 image for loading states
export const PLACEHOLDER_IMAGE_BASE64 = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjM2MCIgdmlld0JveD0iMCAwIDY0MCAzNjAiIHhtbG5zPSJodHRwOi8vd3d3LnAzLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjY0MCIgaGVpZ2h0PSIzNjAiIGZpbGw9IiNlMGUwZTAiLz4KICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9ImFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjUwIiBmaWxsPSIjYmJiIiBlc3NlbnRpYWw9InNlcnZlIiBmb250LXdlaWdodD0iYm9sZCI+Vml0cmluZVhBSTwvdGV4dD4KPC9zdmc+`;

// Default business profile settings
export const DEFAULT_BUSINESS_PROFILE = {
  name: 'Minha Empresa',
  industry: 'Marketing Digital',
  targetAudience: 'Pequenas e Médias Empresas',
  visualStyle: 'moderno',
};

// Mock data generation delay for simulating API calls
export const MOCK_API_DELAY = 1500;

// User provided API Key from environment variables
export const HARDCODED_API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY || '';

// Pricing & Subscription Configuration
export const SUBSCRIPTION_PRICE_FULL = '197,00';
export const SUBSCRIPTION_PRICE_PROMO = '148,90';
export const SUBSCRIPTION_CURRENCY = 'R$';

// External Support & Payment Links
export const WHATSAPP_SUPPORT_LINK = 'https://wa.me/message/Y35ZHKZWKRGZP1';
export const PAYMENT_LINK = 'https://buy.stripe.com/cNibJ0aqfeUTaA66Pv6oo01';


// --- Seasonal Templates (Christmas & New Year) ---
export const SEASONAL_TEMPLATES = [
  {
    id: 'christmas-sale',
    label: 'Promoção de Natal',
    icon: '🎄',
    basePrompt: 'Crie uma imagem publicitária profissional de Natal para o produto "[PRODUTO]". Estilo minimalista e elegante, fundo vermelho escuro com detalhes em dourado, iluminação suave de estúdio, 4k, alta resolução. Texto "OFERTA DE NATAL" em fonte moderna dourada no topo.',
    // Links ocultos para guiar a IA (Conceito de Few-Shot/Image Prompting)
    referenceImage: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?q=80&w=2069&auto=format&fit=crop',
    colorPalette: ['#8B0000', '#FFD700', '#F0F0F0']
  },
  {
    id: 'new-year-party',
    label: 'Festa de Ano Novo',
    icon: '🥂',
    basePrompt: 'Design de post para redes sociais de Ano Novo 2026. Tema: Festa e Celebração. Cores: Prata, Branco e Azul Marinho. Mostre garrafas de champanhe estourando e confetes. Espaço central para texto promocional. Estilo luxuoso e vibrante.',
    referenceImage: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?q=80&w=2069&auto=format&fit=crop',
    colorPalette: ['#C0C0C0', '#000080', '#FFFFFF']
  },
  {
    id: 'holiday-gift',
    label: 'Guia de Presentes',
    icon: '🎁',
    basePrompt: 'Layout de "Guia de Presentes" para Instagram Stories. Fundo Clean com elementos natalinos sutis (galhos de pinheiro, fitas). Espaços em branco reservados para colagem de produtos. Atmosfera aconchegante e sofisticada.',
    referenceImage: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=2070&auto=format&fit=crop',
    colorPalette: ['#2F4F4F', '#D2691E', '#F5F5DC']
  },
  {
    id: 'stock-clearance',
    label: 'Queima de Estoque',
    icon: '🔥',
    basePrompt: 'Banner impactante de "Queima de Estoque de Fim de Ano". Fundo amarelo vibrante com texto preto em negrito. Elementos de "porcentagem de desconto" flutuando em 3D. Estilo varejo moderno e agressivo, alta conversão.',
    referenceImage: 'https://images.unsplash.com/photo-1526178613552-2b45c6c302f0?q=80&w=2068&auto=format&fit=crop',
    colorPalette: ['#FFD700', '#000000', '#FF4500']
  }
];

// Local Storage Keys
export const STORAGE_KEYS = {
  ADMIN_API_KEYS: 'vitrinex_admin_api_keys',
  THEME_PREFERENCE: 'vitrinex_theme',
  USER_SESSION: 'vitrinex_session'
};
