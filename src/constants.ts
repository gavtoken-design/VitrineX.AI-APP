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
        id: 'tmpl-shooting-stars',
        label: 'Movimento Estelar',
        icon: '🌠',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Crie um fundo de céu noturno estrelado com estrelas cadentes animadas, realista, resolução 8k, iluminação cinematográfica, atmosfera azul profunda."
                },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-gradient-card',
        label: 'AI Gradiente',
        icon: '🎨',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Cartão futurista com efeito glassmorphism 3D e bordas gradientes brilhantes, tema escuro, textura de ruído, design de UI premium, estética elegante."
                },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-vertical-stack',
        label: 'Galeria Empilhada',
        icon: '📚',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Galeria vertical de pilhas de imagens, perspectiva 3D, rolagem suave, vitrine de moda de luxo minimalista, estilo de portfólio de alto nível."
                },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-bg-gradient',
        label: 'Brilho Neon',
        icon: '🌈',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Fundo escuro com bordas gradientes neon em movimento, efeito rgb, estética de alta tecnologia, web design moderno, bordas brilhantes."
                },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-leopard-selfie',
        label: 'Estilo Leopard',
        icon: '🐆',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Selfie no espelho vestindo um vestido frente única de estampa de leopardo justo e sem costas. De pé em perfil, cabeça voltada sobre o ombro. Brincos de argola de ouro, colar de corrente com cruz nas costas, pulseiras empilhadas. Smartphone na mão. Fundo de quarto aconchegante, lençóis brancos, manta de tricô bege, cômoda de madeira com gavetas de vime, luminária de cabeceira quente. Efeito starburst de flash, atmosfera quente, fotorrealista, 8k, estética de influenciadora."
                },
                "lighting": {
                    "description": "flash photography, starburst effect, warm atmosphere"
                },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-bathroom-grid',
        label: 'Grade de Beleza',
        icon: '🧖‍♀️',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Grade de estúdio 3x3 fotorrealista mostrando o MESMO sujeito em um ensaio fotográfico de beleza. Fundo cinza claro limpo, iluminação de estúdio suave. Guarda-roupa: roupão branco. Adereços contínuos: toalha, tiara, batom, escova de cabelo. 1) Turbante de toalha, surpresa alegre. 2) Cantando na escova de cabelo como microfone. 3) Colocando tiara brilhante na cabeça. 4) Aplicando batom sorrindo. 5) Foto central: Tiara colocada, sorriso grande e caloroso, visual final. 6) Momento de skincare, máscara facial. Alta nitidez, 8k, identidade e iluminação consistentes em todos os painéis."
                },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-optical-illusion',
        label: 'Pop-Out 3D',
        icon: '📱',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Fotografia de ilusão de ótica hiper-realista. O sujeito parece estar saindo de uma tela de smartphone segurada por uma mão. A tela exibe a interface da câmera mostrando suas botas, enquanto seu tronco real se estende para a realidade. Ele está acenando naturalmente. Interface de câmera iOS visível na tela. Anotações de texto branco manuscritas com setas apontando para elementos da roupa. Estilo de moda de alta qualidade, sorriso confiante. Foto em perspectiva POV olhando para baixo para a mão."
                },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-neon-urban',
        label: 'Neon Urbano',
        icon: '🌃',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Retrato vertical fotorrealista (9:16) do sujeito em uma rua da cidade à noite. Estendendo o dedo indicador em direção à lente da câmera (interação POV). Vestindo camisa de beisebol listrada branca, calça cargo, colar e bolsa transversal. O fundo apresenta luzes neon coloridas da cidade borradas e transeuntes. Bokeh suave cinematográfico, perspectiva de ângulo amplo, leve desfoque de movimento. Sobreposição: Interface de gravação de vídeo de smartphone (REC 00:00:00, 8K/60fps, colchetes de enquadramento). Hiper-realista, estilo Octane Render, expressão confiante."
                },
                "camera": { "aspect_ratio": "9:16" },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-golf-lifestyle',
        label: 'Estilo de Golfe',
        icon: '⛳',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Retrato vertical fotorrealista (4:5) do sujeito agachado profundamente em um campo de golfe verde. Girando o tronco para olhar para o espectador com uma expressão confiante e lúdica. Vestindo top curto rosa choque, saia de tênis branca, tênis brancos, meias altas, luva branca na mão esquerda segurando um taco. Viseira branca. Iluminação suave da hora dourada, primeiro plano de grama verde, árvores e bandeira vermelha ao fundo. Alta definição, estilo de foto espontânea de rede social."
                },
                "camera": { "aspect_ratio": "4:5" },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-winter-photographer',
        label: 'Foto de Inverno',
        icon: '❄️',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Retrato de estilo de vida de inverno fotorrealista em 8k. Sujeito ajoelhado na neve profunda em uma floresta serena de pinheiros. Capturado de perfil, inclinando-se para frente para olhar através do visor de uma câmera profissional DSLR/mirrorless preta com lente zoom. Vestindo uma parca block-color (azul pastel claro e branco), calças de inverno pretas e luvas de malha beges grossas. Uma mochila de lona amarelo-mostarda está nas costas. Luz do dia suave, difusa e nublada. Profundidade de campo rasa (bokeh) desfocando as árvores nevadas ao fundo. Expressão focada, estética fria."
                },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-festive-glamour',
        label: 'Glamour Festivo',
        icon: '🎄',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Retrato festivo de glamour. Sujeito reclinado em um sofá bege texturizado coberto com uma manta de pele fofa. Usando um mini vestido corset tomara que caia branco, luvas de ópera de cetim brancas e botas de couro bege de cano alto. Acessórios: colar de pérolas robusto, pulseira de ouro sobre a luva. A expressão é confiante com contato visual direto. O fundo apresenta uma grande árvore de Natal ricamente decorada com ornamentos dourados/prateados e luzes brancas quentes, além de uma guirlanda de pinheiro fosco na parede. Iluminação ambiente quente, atmosfera elegante e aconchegante."
                },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-noir-portrait',
        label: 'Rosto Noir',
        icon: '🎞️',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Retrato cinematográfico em preto e branco com grão de filme. Close-up extremo de metade do rosto do sujeito. Olhando diretamente para a câmera com a pele iluminada. Posando como uma modelo, mão levantada com o cotovelo apoiado na bochecha, mão em uma pose graciosa. Fundo escuro. Cabelo obscurecendo parcialmente o rosto. Alto contraste, iluminação dramática, resolução 8k."
                },
                "lighting": { "description": "Dramatic high contrast noir lighting" },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-tennis-sunset',
        label: 'Tênis no Pôr do Sol',
        icon: '🎾',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Retrato fotorrealista ao ar livre na hora dourada. Sujeito em um biquíni tie-dye rosa está ajoelhado em uma quadra de tênis de piso duro verde. Inclinando-se para frente, apoiando as mãos no cabo de uma raquete de tênis vertical (moldura rosa e preta). Argolas de ouro, colar de corrente. Expressão: Sorriso suave e confiante, olhar direto. Fundo: Tela de proteção verde na cerca, pinheiros altos, céu azul. Luz solar natural projetando sombras fortes. Estética de rede social, alta definição, proporção 4:5."
                },
                "camera": { "aspect_ratio": "4:5" },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-brand-identity',
        label: 'Identidade de Marca',
        icon: '🛍️',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Conjunto de Mockup de Identidade Visual e Merchandising Profissional. Apresentação de marca de alto nível com uma coleção coesa de itens personalizados: cartões de visita, sacola eco-bag, caderno, xícara de café, camiseta e capa de smartphone. Design de logotipo tipográfico limpo, moderno e minimalista. Exibido em um fundo de estúdio neutro e elegante com iluminação natural suave e sombras de contato. Detalhes de textura premium, renderização 8k fotorrealista, estilo de portfólio de branding corporativo."
                },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-rainy-cafe',
        label: 'Café Chuvoso',
        icon: '☕',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Fotografia de rua fotorrealista do sujeito sentado em um terraço coberto de um café parisiense durante uma chuva. Atmosfera melancólica. Segura uma caneca quente com as duas mãos. Vestindo um sobretudo de couro preto brilhante com gotas de chuva, camisa oxford branca desabotoada, meia-calça de bolinhas e botas de cano curto. Listras de chuva no vidro, reflexos no pavimento molhado, toldo vermelho. Registrada em uma Leica M11 35mm f/1.4. Iluminação suave e nublada, tons frios dessaturados, resolução 8k."
                },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-mirror-chic',
        label: 'Mirror Chic',
        icon: '🤳',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Selfie de espelho vertical hiper-realista com enquadramento da cintura para cima. Usando uma boina de malha bege, cardigã de mohair cinza-taupe, top preto de gola redonda ajustado, jeans azul de cintura alta com cinto preto/dourado e um colar de ouro delicado. Segurando um smartphone rosa claro com câmera de lente tripla. Sala interna minimalista neutra com paredes brancas lisas. Iluminação natural suave e difusa, leve fundo bokeh. Humor: calmo, casual sofisticado, confiante."
                },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-cyber-profile',
        label: 'Perfil Cyber',
        icon: '🤖',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Retrato de perfil lateral cinematográfico cyberpunk ultra-realista. Expressão emocional focada e intensa. Iluminação: Luz de fundo neon azul elétrico e magenta (rim light) com luz principal suave e difusa. Fundo: Luzes abstratas da cidade futurista, letreiros neon borrados. Atmosfera: Escura, melancólica, alto contraste com sombras profundas. Resolução 8K, gradação de cores cinematográfica, emocionalmente poderoso."
                },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-glam-lounge',
        label: 'Glamour Lounge',
        icon: '🍸',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Foto glamourosa de luxo noturno. Sujeito sentado relaxado em um sofá texturizado branco em um lounge, segurando um coquetel âmbar em uma taça coupé. Vestindo um vestido nude/bege de gola alta com recorte e enfeites de cristal, drapeado com um casaco de pele sintética branco nos braços. Acessórios: óculos de sol retangulares pretos pequenos, brincos de argola de ouro grossos. Iluminação: Estilo de fotografia com flash direto com sombras fortes. Fundo: Cortinas cinzas. Humor: Chic, confiante, estética de festa."
                },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-surreal-exhibit',
        label: 'Exibição Surreal',
        icon: '🔮',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Cena de estúdio surreal e hiper-detalhada. Um recipiente de exibição transparente de nível de museu contém um momento congelado: um sujeito parcialmente transformado em outro material (ex: tecido macio se cristalizando). Tratado como uma exibição científica com marcas de medição e partículas suspensas. Iluminação direcional suave, fotorrealista 8k, silencioso, contemplativo, contraste de materiais."
                },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-product-launch',
        label: 'Lançamento de Produto',
        icon: '🚀',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Atue como um Designer de Produto Sênior. 1. ANALISE A ENTRADA (material, cor, textura). 2. SELEÇÃO AUTOMÁTICA DE CATEGORIA: Se Macio -> 'Jaqueta Inteligente para Todos os Climas' (Temp. auto-regulável). Se Rígido -> 'Mochila Commuter Suprema' (Solar, biométrica). Se Mecânico -> 'Tênis Inteligente de Mobilidade Urbana' (Retorno de energia). 3. VISUALIZAÇÃO EM GRADE 2x2: Topo-Esq: Hero Shot (Visão 3/4 limpa de estúdio). Topo-Dir: Foto de Detalhe (Foco macro na textura/tech). Fundo-Esq: Foto Lifestyle (Modelo usando item na cidade moderna). Fundo-Dir: UI de Campanha Kickstarter (Barra verde 100%, botão 'Apoiar Projeto'). Estilo: Iluminação high-key, fotografia comercial 8k, fundo branco/cinza. USE O PRODUTO DE REFERÊNCIA."
                },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-hybrid-transport',
        label: 'Transporte Híbrido',
        icon: '🛴',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Crie uma grade 2x2 visualizando um Dispositivo de Transporte Híbrido futurista. Grade 1: Renderização 3D do dispositivo em uso numa rua movimentada, mostrando recursos únicos. Grade 2: Fotografia de produto estilo Apple brilhante em fundo infinito branco com reflexo e número de patente falso. Grade 3: Texto detalhado estilo revista explicando pontos de venda e benefícios. Grade 4: Desenhos técnicos de patente preto e branco limpos (vista explodida, lateral, topo, perspectiva) em estilo clássico de ilustração de patente. Design baseado na análise e combinação de recursos de patentes passadas de mobilidade urbana."
                },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-monumental-object',
        label: 'Objeto Monumental',
        icon: '🗿',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Transforme um objeto cotidiano (ex: grampeador, caneca, tênis) em um monumento colossal no mundo real. Materiais de superfície fisicamente precisos, com desgaste visível, arranhões, poeira e referências de escala como pessoas e veículos. Filmado de uma perspectiva cinematográfica de ângulo baixo, luz do dia realista, texturas ultra-detalhadas."
                },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-hulk-smash',
        label: 'Esmagar Hulk',
        icon: '👊',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Mão gigante do Hulk pairando sobre uma lata de refrigerante amassada e incrustada no pavimento, ruínas esfumaçadas, estilo de filme de ação explosivo."
                },
                "camera": { "aspect_ratio": "7:9" },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-dark-sorcerer',
        label: 'Feiticeiro Sombrio',
        icon: '🧙‍♂️',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Retrato de fantasia hiper-realista de um feiticeiro sombrio poderoso lançando um feitiço de energia vermelha. Aura mágica vermelha brilhante intensa girando ao redor de sua mão. Anéis de energia de fogo intrincados em movimento. Iluminação cinematográfica, sombras dramáticas no rosto. Olhar focado profundo. Vestindo um manto encapuzado escuro. Atmosfera sombria, fundo místico escuro iluminado por energia vermelha. Detalhes finos na mão e rosto, texturas ultra-detalhadas. Brilho vermelho volumétrico, fumaça atmosférica e brasas ao redor. Composição épica e poderosa."
                },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-virtual-idol',
        label: 'Artigo de Ídolo Virtual',
        icon: '🎤',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Escreva um artigo de destaque intitulado 'Ídolos Virtuais Saindo da Tela: O Novo Padrão do K-Pop em 2026'. Use a função de busca para investigar o prêmio ganho por 'K-Pop Demon Hunters' no MAMA AWARDS 2025 e as últimas conquistas de ídolos virtuais. Envie no estilo da revista de entretenimento futurista '《K-POP HUNTERS》'. Imagem de capa: um grupo feminino virtual de três membros se apresentando. Páginas internas: layout em tons neon capturando a atmosfera de um concerto holográfico."
                },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-cyber-liminal',
        label: 'Sonho Ciber-Liminar',
        icon: '💾',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Crie uma Sequência de Sonho Ciber-Liminar com proporção 2.35:1. Estilo Tríptico Glitchcore vaporwave. 1. Quadro Esq: Ângulo baixo de praça de alimentação de shopping vazia, sujeito apoiado em corrimão neon, efeitos de sangramento VHS. 2. Quadro Centro: Reflexo plano médio em tela de monitor quebrada, sala de servidor escura, efeitos data-moshing. 3. Quadro Dir: Ângulo holandês em estacionamento vazio, luzes fluorescentes piscando, segurando controle de jogo translúcido. Estética: Nostalgia digital, gradientes turquesa/magenta, texturas estáticas CRT. Roupa: Camiseta tech vintage oversized, calça cargo, celular flip holográfico."
                },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-sun-drenched',
        label: 'Retrato Ensolarado',
        icon: '☀️',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Retrato em close-up deslumbrante do sujeito. Ela está apoiada em uma parede sob o sol da tarde. A luz está filtrando através das folhas de uma palmeira, projetando sombras nítidas e de alto contraste das frondes em seu rosto e peito. Um olho está iluminado por um feixe de luz dourada, enquanto o outro está escondido na sombra da folha. O fundo é uma parede de terracota profunda e sombreada. Cores vibrantes, foco nítido, estética ensolarada."
                },
                "camera": { "aspect_ratio": "3:4" },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-winter-editorial',
        label: 'Editorial de Inverno',
        icon: '❄️',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Crie uma colagem de pôster editorial de inverno multi-painel (estética espontânea de iPhone). Sujeito com maquiagem olho esfumado, vestindo casaco de pele sintética curto, meia-calça preta e botas UGG. Acessórios: Fones de ouvido pretos com fio, segurando iPhone 17 Pro Max. Painel 1 (Topo-Esq): Vitrine reflexiva ao entardecer, segurando telefone cobrindo o rosto, luzes de natal, efeitos de vidro fosco. Painel 2 (Topo-Dir): Retrato de rua ultra-amplo, ângulo baixo, inclinando-se para frente, mãos nos bolsos, neve caindo, meia-calça e botas visíveis. Painel 3 (Fundo-Dir): Selfie íntima de cima, segurando copo de café, iluminação de rua quente. Atmosfera: Neve suave, granulação sutil, textura de pele realista, vibe aconchegante de inverno."
                },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-surreal-product',
        label: 'Produto Surreal',
        icon: '💊',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Um conjunto de imagens de fotografia de produto calmas e de alta qualidade. O tema principal é um frasco de suplemento nutricional de alta qualidade. O frasco está completo e limpo, com o lacre inviolável ainda intacto, apresentando um estado geral de um produto industrial altamente preciso e estritamente controlado. O produto é colocado sobre uma superfície de pedra fosca. A textura da pedra é áspera, natural e ligeiramente envelhecida, contrastando com o refinamento do produto. A imagem apresenta um detalhe claro de 'deslocamento funcional': ao lado do frasco de suplemento, há uma {argument name='miniature prop' default='cadeira de descanso em miniatura'} com uma escala claramente desproporcional, parecendo estar preparada para o descanso humano, mas inutilizável, existindo apenas simbolicamente. Simultaneamente, um rótulo de advertência proeminente é afixado no frasco ou próximo a ele, com texto racional e frio que não consegue indicar claramente a fonte do risco. A composição geral utiliza uma abordagem frontal centralizada, tornando a imagem estável e contida, sem ângulos dramáticos, enfatizando a presença do produto e os detalhes materiais. A iluminação de estúdio suave, porém direcional, é usada para apresentar claramente os reflexos no frasco, a textura do papel do rótulo, os detalhes do lacre inviolável e a textura sutil da superfície da pedra. Combinação de adereços em miniatura: aleatória"
                },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-energy-drink',
        label: 'Anúncio de Energético',
        icon: '⚡',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Uma foto de anúncio de estúdio cinematográfico de uma lata de bebida energética de framboesa. A lata de alumínio elegante está em pé no centro, revestida com um acabamento rosa-magenta brilhante. O nome da marca '{argument name=\\'brand name\\' default=\\'MAX ENERGY\\'}' aparece em letras brancas em negrito, com '{argument name=\\'flavor name\\' default=\\'Raspberry Brain Pating\\'}' posicionado ordenadamente abaixo. A lata é envolta em elegantes gráficos com tema de framboesa. Dezenas de framboesas frescas e folhas de hortelã explodem para fora ao redor da lata, congeladas em movimento, criando um poderoso efeito de explosão de energia. Os elementos em primeiro plano são nítidos, enquanto as frutas em segundo plano desvanecem em um desfoque de movimento. O fundo apresenta um gradiente suave de rosa pastel a rosa choque. A iluminação profissional de alto contraste adiciona destaques e reflexos dramáticos, dando ao produto um visual comercial premium."
                },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-explosive-burst',
        label: 'Explosão Cinematográfica',
        icon: '💥',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Crie uma foto de produto de alta qualidade e hiper-realista de {argument name='subject' default='objeto'}, capturada no ar com uma explosão de {argument name='burst type' default='poeira/respingos/fragmentos'} suspensa em movimento. Detalhe tátil, movimento dramático, iluminação de estúdio, close up, {argument name='background color' default='cor de fundo'} vívida. Composição centrada, estética cinematográfica, dinâmico, fotografia publicitária profissional."
                },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model"]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-neon-levitation',
        label: 'Levitação Neon',
        icon: '🛸',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "Transformar produto enviado em sujeito flutuante dinâmico em ambiente neon-noir. Isolar geometria central e marca do produto. Inclinação diagonal dinâmica. Levitando/Flutuando suspenso no ar. Materiais refletem luzes coloridas. Iluminação Cinematic Cyberpunk. Fundo de água escura reflexiva."
                },
                "camera": { "aspect_ratio": "4:5" },
                "negative_prompt": ["new face", "different person", "identity drift", "ai face", "beauty filter", "symmetry correction", "plastic skin", "idealized model", "estúdio chato", "luz do dia", "iluminação plana", "pose estática"]
            }
        }, null, 2)
    },
    // New Structured Prompts with Identity Lock
    {
        id: 'tmpl-prompt-1',
        label: 'Selfie Mirror / Lifestyle',
        icon: '🪞',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "mirror selfie in a cozy bedroom, same physical position as reference"
                },
                "lighting": {
                    "description": "soft natural daylight from window"
                },
                "camera": {
                    "aspect_ratio": "1:1"
                },
                "negative_prompt": [
                    "new face",
                    "different person",
                    "ai face",
                    "face swap",
                    "beauty filter",
                    "symmetry correction",
                    "plastic skin",
                    "idealized model",
                    "identity drift"
                ]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-prompt-2',
        label: 'Moda Editorial Noturna',
        icon: '🌙',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "mirror selfie adapted to an elegant nighttime fashion mood, same physical position as reference"
                },
                "lighting": {
                    "description": "soft controlled low-light ambiance, realistic, no skin alteration"
                },
                "camera": {
                    "aspect_ratio": "4:5"
                },
                "negative_prompt": [
                    "new face",
                    "different person",
                    "ai face",
                    "face swap",
                    "beauty filter",
                    "symmetry correction",
                    "plastic skin",
                    "idealized model",
                    "identity drift"
                ]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-prompt-3',
        label: 'Lifestyle Externo',
        icon: '🌳',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "outdoor mirror-adapted selfie context, same body position and proportions as reference"
                },
                "lighting": {
                    "description": "soft natural daylight, neutral color temperature"
                },
                "camera": {
                    "aspect_ratio": "4:5"
                },
                "negative_prompt": [
                    "new face",
                    "different person",
                    "ai face",
                    "face swap",
                    "beauty filter",
                    "symmetry correction",
                    "plastic skin",
                    "idealized model",
                    "identity drift"
                ]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-prompt-4',
        label: 'Produto / Publicidade',
        icon: '🧴',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "mirror selfie in minimal studio-like bedroom, product visible, person unchanged"
                },
                "lighting": {
                    "description": "soft studio daylight, material-focused, no facial enhancement"
                },
                "camera": {
                    "aspect_ratio": "4:5"
                },
                "negative_prompt": [
                    "new face",
                    "different person",
                    "ai face",
                    "face swap",
                    "beauty filter",
                    "symmetry correction",
                    "plastic skin",
                    "idealized model",
                    "identity drift"
                ]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-prompt-5',
        label: 'Conceitual (Pessoa Fixo)',
        icon: '🧠',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "conceptual mirror-based environment, same physical position as reference"
                },
                "lighting": {
                    "description": "neutral soft light, realistic, restrained"
                },
                "camera": {
                    "aspect_ratio": "1:1"
                },
                "negative_prompt": [
                    "new face",
                    "different person",
                    "ai face",
                    "face swap",
                    "beauty filter",
                    "symmetry correction",
                    "plastic skin",
                    "idealized model",
                    "identity drift"
                ]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-prompt-6',
        label: 'Tecnologia / Social',
        icon: '📱',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "mirror selfie in modern tech-influenced bedroom, same physical position as reference"
                },
                "lighting": {
                    "description": "soft daylight, no dramatic contrast"
                },
                "camera": {
                    "aspect_ratio": "1:1"
                },
                "negative_prompt": [
                    "new face",
                    "different person",
                    "ai face",
                    "face swap",
                    "beauty filter",
                    "symmetry correction",
                    "plastic skin",
                    "idealized model",
                    "identity drift"
                ]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-prompt-7',
        label: 'Produto Minimalista (Luxo)',
        icon: '💎',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "mirror selfie adapted to a minimal luxury product context, same physical position as reference, product placed subtly in environment"
                },
                "lighting": {
                    "description": "soft studio-style daylight emphasizing materials, no skin alteration"
                },
                "camera": {
                    "aspect_ratio": "4:5"
                },
                "negative_prompt": [
                    "new face",
                    "different person",
                    "ai face",
                    "face swap",
                    "beauty filter",
                    "symmetry correction",
                    "plastic skin",
                    "idealized model",
                    "identity drift"
                ]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-prompt-8',
        label: 'Foto Tech (Premium)',
        icon: '⌚',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "mirror selfie in a clean modern bedroom with subtle tech elements, same physical position as reference"
                },
                "lighting": {
                    "description": "soft neutral daylight, controlled contrast"
                },
                "camera": {
                    "aspect_ratio": "1:1"
                },
                "negative_prompt": [
                    "new face",
                    "different person",
                    "ai face",
                    "face swap",
                    "beauty filter",
                    "symmetry correction",
                    "plastic skin",
                    "idealized model",
                    "identity drift"
                ]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-prompt-9',
        label: 'Editorial Beleza / Skincare',
        icon: '🧖‍♀️',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "mirror selfie in a clean bathroom or vanity space, same physical position as reference"
                },
                "lighting": {
                    "description": "soft diffused daylight suitable for skincare, no texture smoothing"
                },
                "camera": {
                    "aspect_ratio": "4:5"
                },
                "negative_prompt": [
                    "new face",
                    "different person",
                    "ai face",
                    "face swap",
                    "beauty filter",
                    "symmetry correction",
                    "plastic skin",
                    "idealized model",
                    "identity drift"
                ]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-prompt-10',
        label: 'Lifestyle Aconchegante',
        icon: '🛋️',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "mirror selfie in a cozy bedroom with warm minimal decor, same physical position as reference"
                },
                "lighting": {
                    "description": "soft natural daylight with gentle warmth"
                },
                "camera": {
                    "aspect_ratio": "1:1"
                },
                "negative_prompt": [
                    "new face",
                    "different person",
                    "ai face",
                    "face swap",
                    "beauty filter",
                    "symmetry correction",
                    "plastic skin",
                    "idealized model",
                    "identity drift"
                ]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-prompt-11',
        label: 'Moda Noturna / Club',
        icon: '🥂',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "mirror selfie adapted to a nightclub fashion mood, same physical position as reference"
                },
                "lighting": {
                    "description": "controlled low-light ambiance, realistic, no facial enhancement"
                },
                "camera": {
                    "aspect_ratio": "4:5"
                },
                "negative_prompt": [
                    "new face",
                    "different person",
                    "ai face",
                    "face swap",
                    "beauty filter",
                    "symmetry correction",
                    "plastic skin",
                    "idealized model",
                    "identity drift"
                ]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-prompt-12',
        label: 'Urbano Noturno / Neon',
        icon: '🌃',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "mirror selfie adapted to an urban neon night aesthetic, same physical position as reference"
                },
                "lighting": {
                    "description": "soft urban ambient light, no color spill on skin"
                },
                "camera": {
                    "aspect_ratio": "9:16"
                },
                "negative_prompt": [
                    "new face",
                    "different person",
                    "ai face",
                    "face swap",
                    "beauty filter",
                    "symmetry correction",
                    "plastic skin",
                    "idealized model",
                    "identity drift"
                ]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-prompt-13',
        label: 'Conceitual Controlado',
        icon: '🎨',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "conceptual environment built around mirror selfie logic, same physical position as reference"
                },
                "lighting": {
                    "description": "neutral soft light, restrained, realistic"
                },
                "camera": {
                    "aspect_ratio": "1:1"
                },
                "negative_prompt": [
                    "new face",
                    "different person",
                    "ai face",
                    "face swap",
                    "beauty filter",
                    "symmetry correction",
                    "plastic skin",
                    "idealized model",
                    "identity drift"
                ]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-prompt-14',
        label: 'Poster / Capa Visual',
        icon: '🖼️',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "mirror selfie adapted to a clean poster-style composition, same physical position as reference"
                },
                "lighting": {
                    "description": "even soft lighting suitable for graphic overlay"
                },
                "camera": {
                    "aspect_ratio": "3:4"
                },
                "negative_prompt": [
                    "new face",
                    "different person",
                    "ai face",
                    "face swap",
                    "beauty filter",
                    "symmetry correction",
                    "plastic skin",
                    "idealized model",
                    "identity drift"
                ]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-prompt-15',
        label: 'Calendário / Clean',
        icon: '📅',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "mirror selfie adapted to a premium calendar aesthetic, same physical position as reference"
                },
                "lighting": {
                    "description": "soft neutral daylight, timeless look"
                },
                "camera": {
                    "aspect_ratio": "3:4"
                },
                "negative_prompt": [
                    "new face",
                    "different person",
                    "ai face",
                    "face swap",
                    "beauty filter",
                    "symmetry correction",
                    "plastic skin",
                    "idealized model",
                    "identity drift"
                ]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-prompt-16',
        label: 'Publicidade Editorial',
        icon: '📰',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "mirror selfie adapted to a commercial editorial ad aesthetic, same physical position as reference"
                },
                "lighting": {
                    "description": "professional studio daylight, no facial modification"
                },
                "camera": {
                    "aspect_ratio": "4:5"
                },
                "negative_prompt": [
                    "new face",
                    "different person",
                    "ai face",
                    "face swap",
                    "beauty filter",
                    "symmetry correction",
                    "plastic skin",
                    "idealized model",
                    "identity drift"
                ]
            }
        }, null, 2)
    },
    {
        id: 'tmpl-prompt-17',
        label: 'Sensual Estético (Safe)',
        icon: '✨',
        basePrompt: JSON.stringify({
            "image_prompt": {
                "reference_image": "UPLOAD_YOUR_REFERENCE_IMAGE",
                "priority_rules": [
                    "REFERENCE IMAGE IS THE ONLY SOURCE OF IDENTITY",
                    "DO NOT GENERATE OR MODIFY FACE OR BODY",
                    "DO NOT DESCRIBE THE SUBJECT",
                    "ONLY ADJUST SCENE, LIGHTING AND CAMERA IF COMPATIBLE",
                    "ANY CONFLICT MUST FAVOR THE REFERENCE IMAGE"
                ],
                "scene": {
                    "description": "mirror selfie with subtle sensual aesthetic, same physical position as reference"
                },
                "lighting": {
                    "description": "soft flattering natural light, realistic skin texture preserved"
                },
                "camera": {
                    "aspect_ratio": "1:1"
                },
                "negative_prompt": [
                    "new face",
                    "different person",
                    "ai face",
                    "face swap",
                    "beauty filter",
                    "symmetry correction",
                    "plastic skin",
                    "idealized model",
                    "identity drift"
                ]
            }
        }, null, 2)
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

export const DEFAULT_NEGATIVE_PROMPT = "new face, different person, identity drift, face swap, ai face, beauty filter, symmetry correction, plastic skin, idealized model, blurry, grain, low resolution, deformed, distorted, disfigured, bad anatomy, bad hands, missing limbs, extra limbs, watermark, text, signature, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, poorly drawn face, mutation, bad proportions, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers";

export const ANIMATION_PROMPTS = [
    {
        id: 'anim-1',
        name: 'Câmera Lenta Cinematográfica',
        description: 'Movimento de câmera lento e épico para produtos ou cenas dramáticas.',
        prompt: 'Cinematic slow motion tracking shot, high quality, 8k, photorealistic, dramatic lighting, depth of field, focused on subject.'
    },
    {
        id: 'anim-2',
        name: 'Rotação 360 do Produto',
        description: 'Rotação suave de produto em fundo estúdio.',
        prompt: '360 degree product rotation, studio lighting, clean background, 4k resolution, smooth motion, professional product showcase.'
    },
    {
        id: 'anim-3',
        name: 'Voo de Drone em Sobrevôo',
        description: 'Voo de drone sobre paisagens ou arquiteturas.',
        prompt: 'Aerial drone shot, flying over landscape, wide angle, high altitude to low altitude transition, stable footage, cinematic lighting.'
    },
    {
        id: 'anim-4',
        name: 'Glitch Cyberpunk',
        description: 'Estilo tech futurista com falhas digitais.',
        prompt: 'Cyberpunk style, neon lights, digital glitch effects, fast paced cuts, futuristic technology, datamosh transitions.'
    },
    {
        id: 'anim-5',
        name: 'Fluxo Líquido',
        description: 'Animação de líquidos abstratos e coloridos.',
        prompt: 'Abstract liquid flowing, mixing colors, macro lens, slow motion, viscosity, vibrant colors, mesmerizing patterns.'
    }
];

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

// --- AI System Instructions & Action Prompts (Internationalization) ---
export const SYSTEM_INSTRUCTION_ENHANCE_PROMPT = `You are a world-class Prompt Engineer for Google Imagen 3 and Midjourney. 
Your task is to rewrite the user's input into a highly detailed, photorealistic, and structured prompt optimized for AI image generation.

Guidelines:
- Focus on lighting (cinematic, volumetric, studio), texture (8k, highly detailed), composition, and style.
- If the user's input is short, expand it creatively but keep the original intent.
- Ensure the output is a single natural language paragraph.
- Do NOT wrap in JSON. Return only the raw enhanced prompt text in English.`;


export const ACTION_PROMPT_VARIATION = "Create a slight variation of this image, keeping the same subject and professional style.";

export const ACTION_PROMPT_SWAP_SUBJECT_PREFIX = "Replace the main subject with: ";
export const ACTION_PROMPT_SWAP_SUBJECT_SUFFIX = ". Keep style and background identical.";
