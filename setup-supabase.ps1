# ============================================
# SUPABASE MIGRATION SETUP SCRIPT
# Complete migration from Django to Supabase
# ============================================

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "AIverse - Supabase Migration Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# STEP 1: Check if Supabase credentials are set
# ============================================

Write-Host "STEP 1: Checking Supabase Configuration..." -ForegroundColor Yellow

$envPath = "frontend\.env"
$envExamplePath = "frontend\.env.example"

if (-not (Test-Path $envPath)) {
    Write-Host "Creating .env file from example..." -ForegroundColor Yellow
    Copy-Item $envExamplePath $envPath
    Write-Host "ERROR: Please update frontend\.env with your Supabase credentials:" -ForegroundColor Red
    Write-Host "  - VITE_SUPABASE_URL=https://your-project-ref.supabase.co" -ForegroundColor Red
    Write-Host "  - VITE_SUPABASE_ANON_KEY=your-anon-key-here" -ForegroundColor Red
    Write-Host ""
    Write-Host "Get these from: https://supabase.com/dashboard → Your Project → Settings → API" -ForegroundColor Yellow
    exit 1
}

# Check if credentials are still placeholder
$envContent = Get-Content $envPath -Raw
if ($envContent -match "your-project-ref" -or $envContent -match "your-anon-key-here") {
    Write-Host "ERROR: Please update frontend\.env with your actual Supabase credentials" -ForegroundColor Red
    Write-Host "Get these from: https://supabase.com/dashboard → Your Project → Settings → API" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Supabase configuration found" -ForegroundColor Green
Write-Host ""

# ============================================
# STEP 2: Check Supabase CLI installation
# ============================================

Write-Host "STEP 2: Checking Supabase CLI..." -ForegroundColor Yellow

try {
    $supabaseVersion = supabase --version 2>&1
    Write-Host "✓ Supabase CLI installed: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Supabase CLI not found" -ForegroundColor Red
    Write-Host "Install it with: npm install -g supabase" -ForegroundColor Yellow
    Write-Host "Then run this script again" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# ============================================
# STEP 3: Install frontend dependencies
# ============================================

Write-Host "STEP 3: Installing Frontend Dependencies..." -ForegroundColor Yellow

Set-Location frontend

# Check if @supabase/supabase-js is already installed
$packageJson = Get-Content package.json | ConvertFrom-Json
if (-not $packageJson.dependencies."@supabase/supabase-js") {
    Write-Host "Installing @supabase/supabase-js..." -ForegroundColor Yellow
    npm install @supabase/supabase-js
    Write-Host "✓ Supabase client installed" -ForegroundColor Green
} else {
    Write-Host "✓ @supabase/supabase-js already installed" -ForegroundColor Green
}

Set-Location ..
Write-Host ""

# ============================================
# STEP 4: Backup and replace API files
# ============================================

Write-Host "STEP 4: Replacing API Service and AuthContext..." -ForegroundColor Yellow

# Backup old files
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "frontend\src\backup_django_$timestamp"

if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

Write-Host "Backing up Django API files to $backupDir..." -ForegroundColor Yellow

# Backup old API and AuthContext
if (Test-Path "frontend\src\services\api.js") {
    Copy-Item "frontend\src\services\api.js" "$backupDir\api.django.js"
    Write-Host "  ✓ Backed up api.js" -ForegroundColor Green
}

if (Test-Path "frontend\src\context\AuthContext.jsx") {
    Copy-Item "frontend\src\context\AuthContext.jsx" "$backupDir\AuthContext.django.jsx"
    Write-Host "  ✓ Backed up AuthContext.jsx" -ForegroundColor Green
}

# Replace with Supabase versions
Write-Host "Replacing with Supabase versions..." -ForegroundColor Yellow

Copy-Item "frontend\src\services\api.supabase.js" "frontend\src\services\api.js" -Force
Write-Host "  ✓ Replaced api.js" -ForegroundColor Green

Copy-Item "frontend\src\context\AuthContext.supabase.jsx" "frontend\src\context\AuthContext.jsx" -Force
Write-Host "  ✓ Replaced AuthContext.jsx" -ForegroundColor Green

Write-Host ""

# ============================================
# STEP 5: Instructions for manual steps
# ============================================

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "MANUAL STEPS REQUIRED" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. CREATE SUPABASE DATABASE SCHEMA:" -ForegroundColor Yellow
Write-Host "   - Go to: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "   - Select your project" -ForegroundColor White
Write-Host "   - Click SQL Editor" -ForegroundColor White
Write-Host "   - Copy contents of: supabase\schema.sql" -ForegroundColor White
Write-Host "   - Paste and run the SQL script" -ForegroundColor White
Write-Host ""

Write-Host "2. DEPLOY EDGE FUNCTIONS:" -ForegroundColor Yellow
Write-Host "   Run these commands:" -ForegroundColor White
Write-Host "   cd supabase" -ForegroundColor Gray
Write-Host "   supabase login" -ForegroundColor Gray
Write-Host "   supabase link --project-ref YOUR-PROJECT-REF" -ForegroundColor Gray
Write-Host "   supabase functions deploy fetch-github-repos" -ForegroundColor Gray
Write-Host "   supabase functions deploy process-leetcode-submission" -ForegroundColor Gray
Write-Host ""

Write-Host "3. TEST LOCALLY:" -ForegroundColor Yellow
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host "   Test registration, login, GitHub, LeetCode, and leaderboard" -ForegroundColor White
Write-Host ""

Write-Host "4. DEPLOY TO FIREBASE:" -ForegroundColor Yellow
Write-Host "   npm run build" -ForegroundColor Gray
Write-Host "   firebase deploy" -ForegroundColor Gray
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Setup script completed!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
