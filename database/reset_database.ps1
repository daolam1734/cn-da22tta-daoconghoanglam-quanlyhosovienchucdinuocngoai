# Reset Database Script
# This script will drop and recreate the database with proper UTF-8 encoding

$ErrorActionPreference = "Stop"
$env:PGPASSWORD = "1734"
$DB_NAME = "qlhs"
$DB_USER = "postgres"

Write-Host "=== Resetting Database ===" -ForegroundColor Cyan

# Terminate all connections
Write-Host "Terminating existing connections..." -ForegroundColor Yellow
psql -U $DB_USER -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();"

# Drop database
Write-Host "Dropping existing database..." -ForegroundColor Yellow
psql -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;"

# Create database with UTF-8
Write-Host "Creating new database with UTF-8 encoding..." -ForegroundColor Yellow
psql -U $DB_USER -c "CREATE DATABASE $DB_NAME WITH ENCODING='UTF8' LC_COLLATE='en_US.UTF-8' LC_CTYPE='en_US.UTF-8' TEMPLATE=template0;"

# Import schema
Write-Host "Importing schema..." -ForegroundColor Yellow
$schemaPath = Join-Path $PSScriptRoot "schema.sql"

# Read file with correct encoding and pipe to psql
Get-Content $schemaPath -Encoding UTF8 | psql -U $DB_USER -d $DB_NAME

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n=== Database reset successfully! ===" -ForegroundColor Green
    
    # Verify data
    Write-Host "`nVerifying data..." -ForegroundColor Cyan
    psql -U $DB_USER -d $DB_NAME -c "SELECT ma_loai, ten_loai FROM LoaiChuyenDi LIMIT 3;"
    psql -U $DB_USER -d $DB_NAME -c "SELECT ma_vai_tro, ten_vai_tro FROM VaiTro LIMIT 3;"
    psql -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public';"
} else {
    Write-Host "`n=== Error occurred during import ===" -ForegroundColor Red
    exit 1
}
