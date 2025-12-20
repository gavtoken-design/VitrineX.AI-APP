# Canva Connect API Integration

Este documento explica como configurar a integração com a API do Canva para publicação de conteúdo.

## Passo 1: Criar Conta de Desenvolvedor

1. Acesse [Canva Developers](https://www.canva.dev/)
2. Faça login com sua conta do Canva
3. Clique em "Create an app"

## Passo 2: Configurar o App

Ao criar seu app, configure:

- **App Name**: VitrineX AI
- **App Type**: Connect API
- **Redirect URI**: `http://localhost:8080` (desenvolvimento) ou sua URL de produção

### Escopos Necessários

Marque os seguintes escopos:
- `design:content:read` - Ler designs
- `design:content:write` - Criar/editar designs
- `asset:read` - Ler assets
- `asset:write` - Upload de assets
- `profile:read` - Ler perfil do usuário

## Passo 3: Obter Credenciais

Após criar o app, você receberá:
- **Client ID**: `CAC-XXXXXXXX`
- **Client Secret**: `CSEC-XXXXXXXX`

## Passo 4: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
# Canva Connect API
VITE_CANVA_CLIENT_ID=seu_client_id_aqui
VITE_CANVA_CLIENT_SECRET=seu_client_secret_aqui

# Google Gemini AI
VITE_GEMINI_API_KEY=sua_gemini_api_key

# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key
```

## Passo 5: Usar no App

### Componente CanvaConnect

Adicione o componente `CanvaConnect` em qualquer página:

```tsx
import CanvaConnect from './components/CanvaConnect';

function MyPage() {
  const handlePublishComplete = (urls: string[]) => {
    console.log('Designs exportados:', urls);
  };

  return (
    <CanvaConnect onPublishComplete={handlePublishComplete} />
  );
}
```

### Serviço Canva Direto

Use o serviço `canvaService` diretamente:

```tsx
import { canvaService } from './services/canva';

// Verificar autenticação
if (canvaService.isAuthenticated()) {
  // Listar designs
  const { designs } = await canvaService.listDesigns();
  
  // Publicar design
  const result = await canvaService.publishDesign(designId, 'png');
  
  // Upload de asset
  const asset = await canvaService.uploadAssetFromUrl(imageUrl, 'minha-imagem');
}
```

## Endpoints Disponíveis

| Método | Descrição |
|--------|-----------|
| `canvaService.isAuthenticated()` | Verifica se está autenticado |
| `canvaService.getAuthorizationUrl()` | Gera URL de OAuth |
| `canvaService.getCurrentUser()` | Obtém perfil do usuário |
| `canvaService.listDesigns()` | Lista designs do usuário |
| `canvaService.getDesign(id)` | Obtém um design específico |
| `canvaService.publishDesign(id, format)` | Exporta e retorna URLs |
| `canvaService.uploadAsset(options)` | Upload de arquivo |
| `canvaService.uploadAssetFromUrl(url, name)` | Upload de URL |
| `canvaService.searchTemplates(query)` | Busca templates |

## Fluxo de Publicação

```
┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│  VitrineX AI │────▶│ Canva Connect │────▶│ Publicação   │
│  (Seu App)   │     │     API       │     │  (PNG/PDF)   │
└──────────────┘     └───────────────┘     └──────────────┘
       │                    │                      │
       │ 1. OAuth Login     │                      │
       │ ◀─────────────────▶│                      │
       │                    │                      │
       │ 2. Listar Designs  │                      │
       │ ◀─────────────────▶│                      │
       │                    │                      │
       │ 3. Exportar        │                      │
       │ ──────────────────▶│                      │
       │                    │ 4. Processar         │
       │                    │ ─────────────────────▶
       │                    │                      │
       │ 5. URLs Download   │                      │
       │ ◀──────────────────│◀─────────────────────│
       │                    │                      │
```

## Suporte

Para mais informações, consulte:
- [Canva Connect API Docs](https://www.canva.dev/docs/connect/)
- [API Reference](https://www.canva.dev/docs/connect/api-reference/)
