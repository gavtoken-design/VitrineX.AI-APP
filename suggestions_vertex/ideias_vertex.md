# Sugestões de Recursos VERTEX (Aproveitando Créditos Google)

Este documento detalha como podemos usar o **Vertex AI Search** e o **Agent Builder** para potencializar o VitrineX sem gastar créditos de API direta, focando em ferramentas "No-Code" configuráveis do Google.

## Regra de Ouro: Configuração vs. Programação
- Chamadas diretas ao Gemini via SDK -> **NÃO usa créditos**.
- Configurar Vertex AI Search (RAG pronto) ou Agent Builder -> **USA créditos**.

---

## 1. Módulo "Cérebro da Marca" (Vertex AI Search)
O usuário sobe seus PDFs de branding, manuais de produtos, e links de sites.
- **Funcionalidade**: Uma barra de busca semântica em toda a biblioteca do usuário.
- **Uso Crítico**: "O que o meu guia de branding diz sobre o tom de voz para o Instagram?"
- **Grounding**: As sugestões de posts no Content Generator podem ser baseadas ("grounded") nesses documentos reais.

## 2. Agente de Atendimento "Plug-and-Play" (Agent Builder)
O VitrineX oferece uma interface para configurar um Agente do Google.
- **Funcionalidade**: O usuário desenha o fluxo de atendimento para o site dele (Vendas, FAQ, Suporte) dentro do painel do Google, e o VitrineX apenas integra o widget.
- **Diferencial**: O VitrineX ajuda o usuário a "setar" o agente com as melhores práticas de marketing.

## 3. Radar de Mercado com Grounding Real (Vertex AI Search)
Indexar sites de concorrentes ou portais de notícias do nicho via Vertex Search.
- **Funcionalidade**: No Market Radar, ao invés da IA "alucinar" ou apenas resumir o que veio da SerpApi, ela faz uma busca no índice de sites reais configurado no Google Cloud.
- **Resultado**: Respostas muito mais precisas e com links diretos para as fontes.

## 4. Analista de Documentos Estratégicos
Upload de relatórios de tráfego (PDF/DOCX) ou exportações de dados comerciais.
- **Funcionalidade**: Um chat que responde perguntas complexas sobre os documentos: "Qual produto teve a maior dor identificada nos feedbacks dos clientes deste mês?"
- **Vantagem**: O Google cuida de todo o RAG (Retrieval Augmented Generation), economizando meses de desenvolvimento.

---

## Próximos Passos (Plano de Trabalho Sugerido)
1. **Fase de Setup**: O usuário configura o Google Cloud Project com o faturamento (billing) ativo.
2. **Integração de Credenciais**: Criar uma forma segura (no Settings) de conectar esses serviços via JSON de Service Account.
3. **Módulo Experimental**: Criar a página `Vertex.tsx` apenas como um laboratório para testar esses widgets do Google Cloud antes de integrar no fluxo principal.

**Não vamos mexer em nada no código do App agora.** Este arquivo serve apenas para sua leitura e decisão futura.
