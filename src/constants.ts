// Nomes dos Modelos Gemini - Modelos Oficiais da API Google Gemini
export const GEMINI_FLASH_MODEL = 'gemini-3-flash-preview';
export const GEMINI_PRO_MODEL = 'gemini-3-pro-preview';

// Modelos de Geração de Imagem - Gemini 3 Pro Image (Nano Banana Pro)
export const IMAGEN_STANDARD_MODEL = 'imagen-3.0-generate-001'; // Fallback
export const IMAGEN_ULTRA_MODEL = 'imagen-3.0-generate-001'; // Fallback
export const IMAGEN_FAST_MODEL = 'imagen-3.0-fast-generate-001'; // Fallback
export const GEMINI_IMAGE_MODEL = 'gemini-3-pro-image-preview';

// Modelos de Geração de Vídeo - Veo 2.0
export const VEO_GENERATE_MODEL = 'veo-2.0-generate-001';

// Modelos de Áudio - Gemini 3.0
export const GEMINI_LIVE_AUDIO_MODEL = 'gemini-3-flash-preview';
export const GEMINI_TTS_FLASH_MODEL = 'gemini-3-flash-preview';
export const GEMINI_TTS_PRO_MODEL = 'gemini-3-pro-preview';
export const GEMINI_TTS_MODEL = GEMINI_TTS_FLASH_MODEL;

// Modelo de Pensamento (Thinking)
export const GEMINI_THINKING_MODEL = 'gemini-3-pro-preview'; // Gemini 3 suporta "thinking" nativamente

// Padrões de Configuração
export const DEFAULT_THINKING_LEVEL = 'high';




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

// Image Styles for Creative Studio
export const IMAGE_STYLES = [
    { id: 'none', label: 'Nenhum (Livre)', prompt: '' },
    { id: 'photorealistic', label: 'Fotorealista', prompt: 'hyper-realistic photo, 8k resolution, detailed texture, cinematic lighting, shallow depth of field, sharp focus, photography style' },
    { id: 'cinematic', label: 'Cinematográfico', prompt: 'movie still, color graded, dramatic lighting, anamorphic lens, intense atmosphere, detailed production design' },
    { id: 'digital-art', label: 'Arte Digital 3D', prompt: '3D render, octane render, unreal engine 5, ray tracing, volumetrics, clean lines, high fidelity, digital art masterpiece' },
    { id: 'anime', label: 'Anime / Mangá', prompt: 'anime style, studio ghibli inspired, vibrant colors, detailed background, cell shading, expressive characters' },
    { id: 'cyberpunk', label: 'Cyberpunk Neon', prompt: 'cyberpunk city, neon lights, rainy streets, futuristic technology, dark atmosphere with vibrant highlights, blade runner aesthetic' },
    { id: 'minimalist', label: 'Minimalista', prompt: 'minimalist design, clean background, simple shapes, pastel colors, soft lighting, lots of negative space, elegant' },
    { id: 'painting', label: 'Pintura a Óleo', prompt: 'oil painting style, textured brushstrokes, classical art, impressionist vibes, detailed canvas texture' },
];

export const DEFAULT_NEGATIVE_PROMPT = "blurry, grain, low resolution, deformed, distorted, disfigured, bad anatomy, bad hands, missing limbs, extra limbs, watermark, text, signature, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, poorly drawn face, mutation, bad proportions, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers";

export const CODE_TEMPLATES = [
    {
        id: 'hero-gradient',
        name: 'Hero Moderno',
        description: 'Fundo gradiente com cartões estilo vidro',
        prompt: 'Crie uma Hero Section ultra moderna com fundo gradiente animado (mesh gradient), um card central usando glassmorphism, título com fonte inter e um botão CTA com brilho. Estilo 21.dev.',
        code: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hero Moderno</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap');
        
        :root {
            --primary: #6366f1;
            --secondary: #a855f7;
            --dark: #0f172a;
            --light: #f8fafc;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--dark);
            color: var(--light);
            overflow-x: hidden;
            min-h: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .background-mesh {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            z-index: -1;
            background: radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.45) 0%, transparent 25%),
                        radial-gradient(circle at 85% 30%, rgba(168, 85, 247, 0.45) 0%, transparent 25%);
            filter: blur(80px);
            animation: pulseBg 10s infinite alternate;
        }

        @keyframes pulseBg {
            0% { transform: scale(1); }
            100% { transform: scale(1.1); }
        }

        .container {
            max-width: 1200px;
            padding: 2rem;
            text-align: center;
            z-index: 10;
        }

        h1 {
            font-size: 4rem;
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 1.5rem;
            background: linear-gradient(to right, #fff, #94a3b8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -0.05em;
        }

        p {
            font-size: 1.25rem;
            color: #cbd5e1;
            max-width: 600px;
            margin: 0 auto 3rem;
            line-height: 1.6;
        }

        .card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 3rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            transition: transform 0.3s ease;
        }

        .card:hover {
            transform: translateY(-5px);
            border-color: rgba(255, 255, 255, 0.2);
        }

        .btn {
            display: inline-flex;
            align-items: center;
            padding: 1rem 2.5rem;
            border-radius: 50px;
            background: linear-gradient(90deg, var(--primary), var(--secondary));
            color: white;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
        }

        .btn:hover {
            transform: scale(1.05);
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.7);
        }

        @media (max-width: 768px) {
            h1 { font-size: 2.5rem; }
        }
    </style>
</head>
<body>
    <div class="background-mesh"></div>
    
    <div class="container">
        <div class="card">
            <span style="font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--secondary); margin-bottom: 1rem; display: block;">Bem-vindo ao Futuro</span>
            <h1>Crie Experiências<br>Digitais Únicas.</h1>
            <p>Transforme suas ideias em realidade com nossa plataforma de design de última geração impulsionada por IA.</p>
            <a href="#" class="btn">Começar Agora</a>
        </div>
    </div>
</body>
</html>`
    },
    {
        id: 'pricing-tiers',
        name: 'Tabela de Preços',
        description: 'Cartões de preços estratégicos com efeitos hover',
        prompt: 'Crie uma tabela de preços com 3 planos. O plano central deve ter um destaque (brilho ou borda colorida). Use cards com hover effects suaves e CTAs claros.',
        code: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tabela de Preços</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;700&display=swap');

        :root {
            --bg: #09090b;
            --card-bg: #18181b;
            --accent: #22c55e;
            --text: #e4e4e7;
        }

        body {
            font-family: 'Outfit', sans-serif;
            background-color: var(--bg);
            color: var(--text);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 2rem;
        }

        .pricing-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            max-width: 1200px;
            width: 100%;
        }

        .plan-card {
            background-color: var(--card-bg);
            border: 1px solid #27272a;
            border-radius: 1.5rem;
            padding: 2.5rem;
            display: flex;
            flex-direction: column;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }

        .plan-card:hover {
            transform: translateY(-8px);
            border-color: #3f3f46;
        }

        .plan-card.featured {
            border-color: var(--accent);
            box-shadow: 0 0 40px rgba(34, 197, 94, 0.15);
        }

        .popular-badge {
            position: absolute;
            top: 1rem; right: 1rem;
            background: var(--accent);
            color: #000;
            font-size: 0.75rem;
            font-weight: 700;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            text-transform: uppercase;
        }

        .plan-name { font-size: 1.25rem; color: #a1a1aa; margin-bottom: 0.5rem; }
        .plan-price { font-size: 3.5rem; font-weight: 700; margin-bottom: 2rem; color: #fff; }
        .plan-period { font-size: 1rem; font-weight: 400; color: #71717a; }

        .features { list-style: none; padding: 0; margin-bottom: 2.5rem; flex-grow: 1; }
        .features li {
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            color: #d4d4d8;
        }
        .features li::before {
            content: "✓";
            color: var(--accent);
            margin-right: 0.75rem;
            font-weight: bold;
        }

        .btn {
            width: 100%;
            padding: 1rem;
            border-radius: 0.75rem;
            border: none;
            font-weight: 600;
            cursor: pointer;
            transition: 0.2s;
            font-size: 1rem;
        }

        .btn-outline {
            background: transparent;
            border: 1px solid #3f3f46;
            color: white;
        }
        .btn-outline:hover { background: #27272a; }

        .btn-primary {
            background: var(--accent);
            color: black;
        }
        .btn-primary:hover { opacity: 0.9; box-shadow: 0 0 20px rgba(34, 197, 94, 0.4); }

    </style>
</head>
<body>
    <div className="pricing-grid">
        <!-- Basic -->
        <div className="plan-card">
            <h3 className="plan-name">Básico</h3>
            <div className="plan-price">R$0<span className="plan-period">/mês</span></div>
            <ul className="features">
                <li>1 Projeto</li>
                <li>Hospedagem inclusa</li>
                <li>Suporte por email</li>
            </ul>
            <button className="btn btn-outline">Começar Grátis</button>
        </div>

        <!-- Pro -->
        <div className="plan-card featured">
            <div className="popular-badge">Mais Popular</div>
            <h3 className="plan-name">Pro</h3>
            <div className="plan-price">R$49<span className="plan-period">/mês</span></div>
            <ul className="features">
                <li>10 Projetos</li>
                <li>Domínio Personalizado</li>
                <li>Analytics Avançado</li>
                <li>Suporte Prioritário 24/7</li>
            </ul>
            <button className="btn btn-primary">Assinar Agora</button>
        </div>

        <!-- Enterprise -->
        <div className="plan-card">
            <h3 className="plan-name">Empresarial</h3>
            <div className="plan-price">R$199<span className="plan-period">/mês</span></div>
            <ul className="features">
                <li>Projetos Ilimitados</li>
                <li>SLA de 99.9%</li>
                <li>Gerente de Conta</li>
                <li>API Dedicada</li>
            </ul>
            <button className="btn btn-outline">Falar com Vendas</button>
        </div>
    </div>
</body>
</html>`
    },
    {
        id: 'clean-contact',
        name: 'Contato Minimalista',
        description: 'Formulário de contato elegante',
        prompt: 'Crie uma página de contato minimalista...',
        code: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Fale Conosco</title>
    <style>
        body { background: #121212; color: white; font-family: system-ui; display: flex; height: 100vh; align-items: center; justify-content: center; }
        form { background: #1e1e1e; padding: 40px; border-radius: 12px; width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        h2 { margin-top: 0; color: #fff; margin-bottom: 20px; }
        input, textarea { width: 100%; background: #2c2c2c; border: 1px solid #444; padding: 12px; margin-bottom: 15px; color: white; border-radius: 6px; }
        input:focus, textarea:focus { border-color: #3b82f6; outline: none; }
        button { width: 100%; padding: 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
        button:hover { background: #2563eb; }
    </style>
</head>
<body>
    <form>
        <h2>Entre em Contato</h2>
        <input type="text" placeholder="Nome" required>
        <input type="email" placeholder="Email" required>
        <textarea rows="4" placeholder="Mensagem" required></textarea>
        <button type="button">Enviar Mensagem</button>
    </form>
</body>
</html>`
    }
];

// Local Storage Keys
export const STORAGE_KEYS = {
    ADMIN_API_KEYS: 'vitrinex_admin_api_keys',
    THEME_PREFERENCE: 'vitrinex_theme',
    USER_SESSION: 'vitrinex_session'
};
