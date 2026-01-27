# Roteiro de Evolução: Sugestões e Melhorias para o VitrineX AI

Este documento descreve o plano estratégico para a evolução técnica e funcional do VitrineX AI.

---

## 1. Integrações Estratégicas (Médio Prazo)

### 1.1. Integração Direta com Meta API (Instagram/Facebook)
**Objetivo:** Permitir agendamento e postagem direta sem sair do app.
**Benefício:** Fecha o ciclo "Ideia -> Criação -> Publicação". Aumenta drasticamente a retenção do usuário.
**Complexidade:** Alta (Requer aprovação na Meta for Developers).

### 1.2. Integração com Canva (Canva Button)
**Objetivo:** Permitir que o usuário envie o texto gerado para um design no Canva com um clique.
**Benefício:** Resolve a parte visual da criação de conteúdo de forma profissional.

### 1.3. Google Analytics / Search Console
**Objetivo:** Importar dados do próprio site do usuário para cruzar com dados de mercado.
**Benefício:** Análise personalizada: "O mercado busca X, mas seu site ranqueia para Y".
**Complexidade:** Média (Requer OAuth 2.0 e Google Cloud Project).
**Estratégia:** Utilizar a biblioteca `googleapis` para buscar queries do Search Console e métricas do GA4. Requer que o usuário faça login com Google.

---

## 2. Melhorias de UX/UI (Curto Prazo)

### 2.1. "Dark Mode" Automático
**Sugestão:** Sincronizar o tema do app com a preferência do sistema operacional do celular.
**Impacto:** Conforto visual e percepção de modernidade.

### 2.2. Gestos de Navegação (Swipe)
**Sugestão:** Permitir deslizar entre abas (ex: do Radar para o Gerador) em vez de apenas clicar.
**Impacto:** Experiência nativa mais fluida em mobile.

### 2.3. Feedback Hápitco
**Sugestão:** Vibrações sutis ao completar uma geração de IA ou interagir com gráficos.
**Impacto:** Sensação tátil de resposta do app.

---

## 3. Riscos e Comentários Críticos

### 3.1. Dependência da SerpApi
**Risco:** Se a SerpApi mudar preços ou bloquear acessos, o "Market Radar" para.
**Mitigação:** Criar um adaptador para APIs alternativas (ex: DataForSEO) ou implementar um fallback robusto.

### 3.2. Custo de Tokens (Gemini/OpenAI)
**Risco:** Usuários "heavy users" podem gerar custos altos de API.
**Mitigação:** Implementar sistema de "Créditos" ou "Limites Diários" para usuários Freemium, reservando uso ilimitado para Premium.

### 3.3. Qualidade do Conteúdo
**Risco:** IA gerar conteúdo genérico ou alucinante.
**Mitigação:** Refinar os prompts do sistema com mais contexto (persona, nicho específico) e adicionar um botão de "Revisar/Editar" obrigatório antes de copiar.

---

## 4. Priorização Recomendada

| Ação | Prazo | Impacto | Esforço |
| :--- | :---: | :---: | :---: |
| **Limites de Uso (Quota System)** | Curto/Imediato | Alto (Financeiro) | Médio |
| **Dark Mode System-Sync** | Curto | Médio (UX) | Baixo |
| **Integração Meta/Instagram** | Longo | Muito Alto | Muito Alto |
| **Fallback de API de Trends** | Médio | Alto (Segurança) | Médio |
