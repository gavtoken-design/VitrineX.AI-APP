# Script de Atualização Segura
# Verifica arquivos bloqueados e qualidade do código antes de compilar.

$ErrorActionPreference = "Stop"

Write-Host "🛡️  Iniciando Processo de Atualização Segura..." -ForegroundColor Cyan

# 1. Verificar Arquivos Bloqueados
Write-Host "`n1️⃣  Verificando Arquivos Críticos (Lock Manager)..." -ForegroundColor Yellow
try {
    node lock-manager.cjs check
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Verificação de integridade falhou. Arquivos críticos foram alterados." -ForegroundColor Red
        $confirmation = Read-Host "Deseja atualizar o bloqueio com essas alterações? (s/n)"
        if ($confirmation -eq 's') {
            node lock-manager.cjs lock
            Write-Host "✅ Bloqueio atualizado. Prosseguindo..." -ForegroundColor Green
        }
        else {
            Write-Host "🛑 Atualização cancelada pelo usuário." -ForegroundColor Red
            exit 1
        }
    }
}
catch {
    Write-Host "⚠️  Erro ao executar lock-manager.cjs (Primeira execução?)" -ForegroundColor Yellow
    node lock-manager.cjs lock
}

# 2. Verificar Qualidade do Código (TypeScript)
Write-Host "`n2️⃣  Verificando Código (Checagem TypeScript)..." -ForegroundColor Yellow
try {
    # Assumindo que o tsc está disponível via npx ou localmente
    # Usamos --noEmit para verificar apenas os tipos
    npx tsc --noEmit
    if ($LASTEXITCODE -ne 0) { throw "Erros de TypeScript encontrados" }
    Write-Host "✅ Verificação de tipos aprovada." -ForegroundColor Green
}
catch {
    Write-Host "❌ Verificação de tipos falhou. Por favor, corrija os erros antes de atualizar." -ForegroundColor Red
    exit 1
}

# 3. Compilar Projeto
Write-Host "`n3️⃣  Compilando Projeto (atualizando dist)..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Compilação bem-sucedida!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Falha na compilação." -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Atualização Segura Concluída! A pasta 'dist' está pronta." -ForegroundColor Cyan
