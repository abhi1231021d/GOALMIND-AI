$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

Write-Host ">>> Stopping any existing processes on ports 8080, 8787, 3000, 80, 5173..." -ForegroundColor Cyan
$portsToClear = @(8080, 8787, 3000, 80, 5173)
foreach ($port in $portsToClear) {
    try {
        $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        foreach ($conn in $conns) {
            if ($conn.OwningProcess -gt 4) {
                Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
            }
        }
    } catch {}
}

Start-Sleep -Milliseconds 800

Write-Host ">>> Starting GoalMind Backend (Port 8080)..." -ForegroundColor Green
$backendJar = Join-Path $root "backend\target\goalmind-backend-1.0.0.jar"
if (Test-Path $backendJar) {
    Start-Process -FilePath "java.exe" -ArgumentList "-jar `"$backendJar`"" -WorkingDirectory (Join-Path $root "backend") -WindowStyle Hidden
} else {
    Start-Process -FilePath "mvn.cmd" -ArgumentList "spring-boot:run" -WorkingDirectory (Join-Path $root "backend") -WindowStyle Hidden
}

Write-Host ">>> Starting Resume & Interview Backend (Port 8787)..." -ForegroundColor Green
$resumeJar = "C:\Users\abhis\OneDrive\Documents\project\ai resume analyzer and interview simulator\ai resume analyzer and interview simulator\target\resume-checker-api-1.0.0.jar"
if (Test-Path $resumeJar) {
    Start-Process -FilePath "java.exe" -ArgumentList "-jar `"$resumeJar`"" -WorkingDirectory (Split-Path $resumeJar) -WindowStyle Hidden
} else {
    $altResumeDir = "C:\Users\abhis\OneDrive\Documents\project\ai resume analyzer and interview simulator\ai resume analyzer and interview simulator"
    if (Test-Path $altResumeDir) {
        Start-Process -FilePath "mvn.cmd" -ArgumentList "spring-boot:run" -WorkingDirectory $altResumeDir -WindowStyle Hidden
    }
}

Write-Host ">>> Starting Unified Frontend (Port 3000)..." -ForegroundColor Green
$frontendNodeModules = Join-Path $root "frontend\node_modules"
if (-not (Test-Path $frontendNodeModules)) {
    Write-Host ">>> Installing frontend dependencies (one-time setup)..." -ForegroundColor Yellow
    Start-Process -FilePath "npm.cmd" -ArgumentList "install" -WorkingDirectory (Join-Path $root "frontend") -Wait -NoNewWindow
}
Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory (Join-Path $root "frontend") -WindowStyle Hidden

Write-Host ">>> Starting Universal Port Gateway (Ports 80 & 5173 -> 3000)..." -ForegroundColor Green
Start-Process -FilePath "node.exe" -ArgumentList (Join-Path $root "gateway.js") -WorkingDirectory $root -WindowStyle Hidden

Write-Host ">>> Waiting for services to become healthy..." -ForegroundColor Yellow
$started = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    $p3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
    $p8080 = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
    if ($p3000 -and $p8080) {
        $started = $true
        break
    }
}

if ($started) {
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host ">>> [SUCCESS] Career Intelligence Platform is online!" -ForegroundColor Green
    Write-Host ">>>   Application URL: http://localhost:3000" -ForegroundColor White
    Write-Host ">>>   Includes: GoalMind AI, Resume Analyzer, Interview Simulator" -ForegroundColor White
    Write-Host "========================================================" -ForegroundColor Green
} else {
    Write-Host ">>> Services initialized in background. Visit http://localhost:3000" -ForegroundColor Yellow
}
