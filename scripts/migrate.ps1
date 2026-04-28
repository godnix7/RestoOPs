# Database Migration Script for RestroOps AI

$ContainerName = "restroops-db"
$DbUser = "restroops_user"
$DbName = "restroops_db"

$Migrations = @(
    "packages/db/migrations/001_initial_schema.sql",
    "packages/db/migrations/002_rls_policies.sql",
    "packages/db/migrations/003_dashboard_data.sql",
    "packages/db/migrations/004_payroll_details.sql",
    "packages/db/migrations/005_ai_conversations.sql"
)

foreach ($migration in $Migrations) {
    Write-Host "Applying migration: $migration" -ForegroundColor Cyan
    if (Test-Path $migration) {
        Get-Content $migration | docker exec -i $ContainerName psql -U $DbUser -d $DbName
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Failed to apply $migration" -ForegroundColor Red
            exit $LASTEXITCODE
        }
    } else {
        Write-Host "Migration file not found: $migration" -ForegroundColor Yellow
    }
}

Write-Host "✅ All migrations applied successfully!" -ForegroundColor Green
