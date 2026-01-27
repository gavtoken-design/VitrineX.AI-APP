# 📌 Integração Pinterest - VitrineX AI

## ✅ Implementação Completa

A integração Pinterest foi implementada com sucesso! Agora você pode postar conteúdo criado no VitrineX-AI diretamente no Pinterest.

---

## 🚀 O Que Foi Implementado

### 1. **Scopes OAuth Atualizados** ✅
- `pins:read` - Ler pins
- `pins:write` - **NOVO** - Criar pins
- `boards:read` - **NOVO** - Listar boards
- `boards:write` - **NOVO** - Criar boards

### 2. **PinterestService** ✅
Arquivo: `src/services/pinterest/PinterestService.ts`

**Métodos disponíveis:**
- `isConnected()` - Verifica se está conectado
- `getBoards()` - Lista todos os boards
- `createBoard()` - Cria novo board
- `createPin()` - Cria pin com imagem
- `getPins()` - Busca pins do usuário
- `deletePin()` - Deleta pin

### 3. **Componentes UI** ✅

#### PinterestBoardSelector
`src/components/features/PinterestBoardSelector.tsx`
- Seleção visual de boards
- Criação de novos boards
- Auto-seleção do primeiro board

#### PinterestPostModal  
`src/components/features/PinterestPostModal.tsx`
- Preview da imagem
- Seleção de board
- Campos de título e descrição
- Link opcional
- Validação de dados
- Estados de carregamento

---

## 🎯 Como Usar

### Passo 1: Conectar Pinterest

1. Vá para **Redes Sociais** no menu
2. Clique em **Conectar** no card do Pinterest
3. Faça login no Pinterest
4. Autorize o VitrineX AI
5. Você será redirecionado de volta

### Passo 2: Usar em Qualquer Página

```typescript
import { PinterestPostModal } from '@/components/features/PinterestPostModal';
import { pinterestService } from '@/services/pinterest/PinterestService';
import { useState } from 'react';

function SeuComponente() {
    const [showPinterest, setShowPinterest] = useState(false);
    const [imageUrl, setImageUrl] = useState('');

    return (
        <>
            <button
                onClick={() => setShowPinterest(true)}
                disabled={!pinterestService.isConnected()}
            >
                📌 Postar no Pinterest
            </button>

            <PinterestPostModal
                isOpen={showPinterest}
                onClose={() => setShowPinterest(false)}
                imageUrl={imageUrl}
                initialTitle="Meu Pin Incrível"
                initialDescription="Descrição do meu conteúdo..."
            />
        </>
    );
}
```

### Passo 3: Integrar com Content Generator

**Adicionar em `src/pages/ContentGenerator.tsx`:**

```typescript
// No topo do arquivo
import { PinterestPostModal } from '@/components/features/PinterestPostModal';
import { pinterestService } from '@/services/pinterest/PinterestService';

// No state do component
const [showPinterestModal, setShowPinterestModal] = useState(false);

// No JSX, adicionar botão
<button
    onClick={() => setShowPinterestModal(true)}
    disabled={!pinterestService.isConnected() || !generatedImage}
    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
>
    📌 Publicar no Pinterest
</button>

// Adicionar modal antes do fechamento do component
<PinterestPostModal
    isOpen={showPinterestModal}
    onClose={() => setShowPinterestModal(false)}
    imageUrl={generatedImage}
    initialTitle={generatedTitle}
    initialDescription={generatedContent}
    initialLink="https://vitrinex.site"
/>
```

---

## 📊 Funcionalidades

### ✅ Já Implementadas

- [x] Autenticação OAuth com Pinterest
- [x] Listagem de boards do usuário
- [x] Criação de novos boards
- [x] Seleção de board para publicação
- [x] Upload de pins com imagem URL
- [x] Título e descrição personalizados
- [x] Link de destino opcional
- [x] Preview da imagem antes de postar
- [x] Validação de campos
- [x] Tratamento de erros
- [x] Loading states
- [x] Feedback visual (toasts)

### 🔄 Próximas Melhorias (Opcional)

- [ ] Agendamento de pins
- [ ] Analytics de pins postados
- [ ] Upload de múltiplas imagens
- [ ] Sugestão automática de hashtags
- [ ] Templates otimizados para Pinterest
- [ ] Histórico de pins publicados

---

## 🛡️ Segurança

### ⚠️ Importante: Client Secret

**Problema Atual:**
```typescript
// ❌ Client Secret no frontend (não seguro)
const clientSecret = import.meta.env.VITE_PINTEREST_APP_SECRET;
```

**Solução Recomendada para Produção:**

1. **Criar endpoint no backend:**
```typescript
// Backend: /api/pinterest/exchange-token
app.post('/api/pinterest/exchange-token', async (req, res) => {
    const { code } = req.body;
    const clientId = process.env.PINTEREST_CLIENT_ID;
    const clientSecret = process.env.PINTEREST_CLIENT_SECRET; // ✅ Seguro
    
    // Fazer troca de token
    const result = await exchangeToken(code, clientId, clientSecret);
    res.json(result);
});
```

2. **Atualizar frontend:**
```typescript
// Frontend: Chamar backend em vez de fazer direto
const data = await fetch('/api/pinterest/exchange-token', {
    method: 'POST',
    body: JSON.stringify({ code })
});
```

---

## 🧪 Como Testar

### 1. Teste de Conexão
```bash
1. Abrir página de Redes Sociais
2. Clicar em "Conectar" no Pinterest
3. Fazer login e autorizar
4. Verificar que aparece "Conectado"
```

### 2. Teste de Boards
```bash
1. Abrir modal de publicação
2. Verificar que boards estão listados
3. Clicar em "Criar Novo Board"
4. Digitar nome e criar
5. Verificar que novo board aparece
```

### 3. Teste de Publicação
```bash
1. Gerar uma imagem no Content Generator
2. Clicar em "Publicar no Pinterest"
3. Selecionar board
4. Preencher título e descrição
5. Clicar em "Publicar"
6. Verificar toast de sucesso
7. Abrir Pinterest web e confirmar que pin foi criado
```

---

## 📝 Variáveis de Ambiente Necessárias

Adicione ao seu `.env`:

```bash
# Pinterest API v5
VITE_PINTEREST_APP_ID=1541794
VITE_PINTEREST_APP_SECRET=seu_secret_aqui

# ⚠️ Atenção: VITE_PINTEREST_APP_SECRET não deve estar no frontend em produção
# Mova para backend quando for para produção
```

---

## 🐛 Troubleshooting

### Erro: "Pinterest não está conectado"
**Solução:** Vá em Redes Sociais e conecte sua conta primeiro

### Erro: "Token expirado"
**Solução:** Desconecte e reconecte sua conta Pinterest

### Erro: "Sem permissão para criar pins"
**Solução:** Verifique se os scopes foram atualizados corretamente (pins:write)

### Erro: "Falha ao criar pin"
**Verificar:**
1. URL da imagem está acessível publicamente
2. Título não está vazio
3. Board está selecionado
4. Token é válido

---

## 📊 Limites da API Pinterest

| Limite | Valor |
|--------|-------|
| Pins por dia | 200 pins |
| Requests por hora | 1.000 requests |
| Tamanho máximo de imagem | 32 MB |
| Formatos suportados | PNG, JPEG |
| Dimensões mínimas | 100x100px |
| Título máximo | 100 caracteres |
| Descrição máxima | 500 caracteres |

---

## ✨ Exemplo de Uso Completo

```typescript
import React, { useState } from 'react';
import { PinterestPostModal } from '@/components/features/PinterestPostModal';
import { pinterestService } from '@/services/pinterest/PinterestService';
import { useToast } from '@/contexts/ToastContext';

export function MinhaPage() {
    const [showModal, setShowModal] = useState(false);
    const { addToast } = useToast();

    const handleOpenModal = () => {
        if (!pinterestService.isConnected()) {
            addToast({
                type: 'warning',
                message: 'Conecte sua conta Pinterest primeiro',
                action: {
                    label: 'Conectar',
                    onClick: () => window.location.href = '/?module=SocialNetworks'
                }
            });
            return;
        }
        setShowModal(true);
    };

    return (
        <div>
            <img src="https://example.com/image.jpg" alt="Minha imagem" />
            
            <button onClick={handleOpenModal}>
                📌 Publicar no Pinterest
            </button>

            <PinterestPostModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                imageUrl="https://example.com/image.jpg"
                initialTitle="Design Criativo"
                initialDescription="Um design incrível criado com IA #design #criatividade"
                initialLink="https://meusite.com"
            />
        </div>
    );
}
```

---

## 🎉 Conclusão

A integração Pinterest está completa e funcional! Agora os usuários podem:

✅ Conectar suas contas Pinterest  
✅ Listar e criar boards  
✅ Publicar pins com suas imagens  
✅ Personalizar título, descrição e link  
✅ Receber feedback imediato  

**Próximo passo**: Integrar com as páginas que geram conteúdo (Content Generator, Ad Studio, Campaign Builder, etc.)

---

**Criado em**: 2026-01-25  
**Versão**: 1.0.0  
**Status**: ✅ Implementado e Pronto para Uso
