# Guia de Ativação do Google Trends em Tempo Real (SerpApi)

Este guia explica como ativar a funcionalidade de dados reais no **Trend Hunter** do VitrineX AI.

## 1. O que foi feito?
Adicionamos um sistema que consulta o Google Trends *antes* de gerar a análise com IA. Isso garante que as tendências sugeridas sejam baseadas em **dados reais de busca**, e não apenas "alucinações" da IA.

---

## 2. Passo a Passo para Ativar

### Passo 1: Obter a Chave API
1. Acesse o site [SerpApi.com](https://serpapi.com/).
2. Crie uma conta gratuita (o plano free permite cerca de 100 buscas/mês, o suficiente para testes).
3. No painel, copie sua **Private API Key**.

### Passo 2: Configurar no Projeto
1. Abra o arquivo `.env` na raiz do seu projeto (se não existir, crie um arquivo chamado `.env`).
2. Adicione a seguinte linha no final do arquivo:

```env
VITE_SERPAPI_KEY=cole_sua_chave_aqui_sem_aspas
```

**Exemplo:**
`VITE_SERPAPI_KEY=59129480128490128490128`

### Passo 3: Reiniciar o Servidor
Como alteramos variáveis de ambiente, você precisa reiniciar o projeto:
1. No terminal onde está rodando o projeto, aperte `Ctrl + C` para parar.
2. Rode `npm run dev` novamente.

---

## 3. Como Testar
1. Vá para a página **Tendências (Trend Hunter)**.
2. Digite um termo quente, exemplo: `"Marketing Digital"`.
3. Clique em **Analisar Tendência**.
4. Se tudo der certo, você verá uma notificação verde: *"Dados em tempo real do Google Trends capturados!"*.
5. A análise da IA agora citará dados específicos, como `"O termo 'Marketing para TikTok' teve um aumento de 150% nas buscas"`.

---

## 4. (Opcional) Configuração de CORS
Se você ver erros de "CORS" (Bloqueio de navegador) no console:
O código atual usa um proxy de demonstração (`cors-anywhere`). Para produção real, o ideal é que essa chamada de API seja feita pelo seu Backend (Supabase Functions ou Node.js), e não diretamente pelo navegador, para proteger sua chave API.

Para uso local/testes, o proxy atual deve funcionar.

---

**VitrineX AI - Plataforma de Alta Performance**
