# Script de Backup Local - VitrineX AI
$date = Get-Date -Format "yyyy-MM-dd_HH-mm"
$backupDir = "_Backups"
$zipName = "$backupDir\Backup_VitrineX_$date.zip"

# Criar pasta de backups se não existir
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Force -Path $backupDir
}

Write-Host "📦 Criando backup do projeto (Excluindo node_modules e dist)..." -ForegroundColor Cyan

# Lista de pastas para ignorar
$exclude = @("node_modules", "dist", "_Backups", ".git", "site.zip")

# Compactar
Compress-Archive -Path * -DestinationPath $zipName -Force -Exclude $exclude

Write-Host "✅ Backup criado com sucesso em: $zipName" -ForegroundColor Green
Read-Host "Pressione Enter para sair"
