# Manual de Uso Técnico - VitrineX AI

## 1. Visão Geral do Aplicativo
O **VitrineX AI** é uma plataforma "Mobile-First" de inteligência de mercado e automação de conteúdo, projetada para empreendedores e profissionais de marketing. O sistema integra APIs de tendências (SerpApi/Google Trends) e IA Generativa (Gemini 2.5) para fornecer insights estratégicos e criação automatizada de posts, campanhas e análises competitivas.

A interface foi desenhada com foco em **performance**, **design limpo** e **usabilidade tátil**, utilizando tokens de design rigorosos para garantir consistência em todos os dispositivos.

---

## 2. Estrutura de Navegação (Páginas)

### 2.1. Dashboard (Tela Inicial)
**Objetivo:** Central de comando para visão rápida do status.
**Funções:**
- Visualização de métricas macro.
- Acesso rápido aos módulos principais.
- Notificações contextualizadas.
**Fluxo:** Login -> Dashboard -> Seleção de Módulo.

### 2.2. Market Radar (Radar de Mercado)
**Objetivo:** Monitoramento de concorrentes e tendências em tempo real.
**Funções:**
- **Busca Principal:** Pesquisa de termos de mercado.
- **Comparação:** Modo "Batalha" para comparar dois termos/concorrentes lado a lado.
- **Gráficos:** Visualização de volume de interesse ao longo do tempo.
- **Veredito IA:** Análise qualitativa gerada por IA (Oportunidade, Risco, Ação Recomendada).
**Botões Principais:**
- `Analisar Mercado`: Inicia a busca de dados e geração de veredito.
- `Ícone Troca`: Ativa o modo de comparação.

### 2.3. Content Generator (Gerador de Conteúdo)
**Objetivo:** Criação de textos e scripts para redes sociais.
**Funções:**
- Geração de legendas, roteiros de Reels/TikTok e e-mails.
- Personalização de tom de voz.
**Fluxo:** Inserir Tópico -> Escolher Formato -> Gerar -> Copiar/Salvar.

### 2.4. Trend Hunter
**Objetivo:** Descoberta de tópicos virais.
**Funções:**
- Listagem do que está em alta no momento.
- Filtro por região ou categoria.

### 2.5. Ad Studio & Campaign Builder
**Objetivo:** Gestão de tráfego pago e campanhas estruturadas.
**Funções:**
- Criação de estrutura de campanhas.
- Sugestão de copys para anúncios.

---

## 3. Elementos de Interface (Design System)

### Botões (`.btn-primary`)
- **O que faz:** Ação principal da tela (Ex: "Analisar", "Salvar", "Gerar").
- **Resultado Esperado:** Feedback visual imediato (loading) seguido da execução da tarefa.
- **Design:** Altura mínima de 44px (touch-friendly), cor azul vibrante (`#2563eb`), texto branco.

### Inputs (`.input-primary`)
- **O que faz:** Campo de entrada de texto.
- **Comportamento:** Fundo cinza claro, borda sutil, foco azul. Otimizado para digitação em mobile.

---

## 4. Comportamento Responsivo

### Mobile (Padrão)
- Layout empilhado (coluna única).
- Botões ocupam 100% da largura para facilitar o toque de polegar.
- Menus recolhidos ou navegação inferior (Bottom Nav).

### Tablet (min-width: 768px)
- Container centralizado com largura máxima de 720px.
- Botões ajustam para largura automática ("inline").
- Gráficos ganham mais detalhamento horizontal.

### Desktop (min-width: 1024px)
- Container centralizado (max-width 960px).
- Layouts de duas colunas onde aplicável (ex: Comparação no Radar).
- Uso de espaço lateral para respiro.

---

## 5. Boas Práticas e Erros Comuns

### Boas Práticas
- **Consultas Específicas:** No Radar, use termos específicos (ex: "Tênis Nike" em vez de "Tênis") para dados mais precisos.
- **Cache:** O sistema armazena buscas por 24h para economizar requisições. Se precisar de dados frescos, use o botão de recarregar forçado (se disponível).

### Erros Comuns
- **"Sem Dados":** Ocorre quando o termo é muito nichado e o Google Trends não retorna volume suficiente.
    - *Solução:* Tente um termo mais genérico ou amplo.
- **Bloqueio de API:** Excesso de requisições rápidas.
    - *Solução:* A interface irá alertar. Aguarde alguns segundos.
