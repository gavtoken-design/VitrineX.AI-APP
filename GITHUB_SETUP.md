# Configuração do GitHub Privado 🔒

Este guia te ajuda a salvar seu projeto em um repositório seguro e privado no GitHub.

## Passo 1: Criar o Repositório

1. Acesse [github.com/new](https://github.com/new).
2. **Repository name:** Digite `vitrinex-ai-app` (ou o nome que preferir).
3. **Privacidade:** Marque a opção **Private** (Privado) - *Isso é muito importante para proteger seu código*.
4. Não marque "Add a README file" (pois já temos um).
5. Clique em **Create repository**.

## Passo 2: Conectar seu Projeto

Copie os comandos que o GitHub vai te mostrar (na seção *"...or push an existing repository from the command line"*). Devem ser parecidos com isso:

```bash
git remote add origin https://github.com/SEU_USUARIO/vitrinex-ai-app.git
git branch -M main
git push -u origin main

```

## Passo 3: Enviar o Código (Pela primeira vez)

1. `git add .`
2. `git commit -m "O que você fez hoje"`
3. `git push`

Vou deixar o terminal pronto para você. Apenas me envie o **link do repositório** que você criou (ex: `https://github.com/seu-nome/repo.git`) que eu rodo os comandos para você!

---

**Dica para os próximos dias:**
Sempre que finalizar um dia de trabalho, rode:
