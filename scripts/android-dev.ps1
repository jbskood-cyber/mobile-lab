Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Step([string]$Message) {
  Write-Host "`n==> $Message" -ForegroundColor Cyan
}

Write-Step 'Verificando repositorio'
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$trackedChanges = git status --porcelain --untracked-files=no
if ($trackedChanges) {
  throw "Hay cambios locales rastreados. No continuaré hasta que el working tree esté limpio.`n$trackedChanges"
}

$env:NODE_USE_SYSTEM_CA = '1'

Write-Step 'Instalando dependencias sin generar package-lock.json'
npm.cmd install --no-audit --no-fund --package-lock=false

$adb = Get-Command adb -ErrorAction SilentlyContinue
$androidHome = $env:ANDROID_HOME

if ($adb -and $androidHome -and (Test-Path $androidHome)) {
  Write-Step 'Android SDK local detectado'
  $deviceLines = adb devices | Select-Object -Skip 1 | Where-Object { $_.Trim() }
  $authorized = $deviceLines | Where-Object { $_ -match "\tdevice$" }
  $unauthorized = $deviceLines | Where-Object { $_ -match "\tunauthorized$" }

  if ($unauthorized -and -not $authorized) {
    Write-Host 'BLOCKED_USER: desbloquea el Samsung y acepta “Permitir depuración USB”. Luego vuelve a ejecutar este script.' -ForegroundColor Yellow
    exit 20
  }

  if (-not $authorized) {
    Write-Host 'BLOCKED_USER: conecta el Samsung por USB con Depuración USB activada. Luego vuelve a ejecutar este script.' -ForegroundColor Yellow
    exit 21
  }

  Write-Step 'Compilando e instalando FOCO Development Build en el Samsung'
  npx.cmd expo run:android --device
  exit $LASTEXITCODE
}

Write-Step 'No hay Android SDK local completo; se usará EAS Build'
Write-Host 'Primero comprobaré si existe una sesión de Expo/EAS.'

npx.cmd eas-cli@latest whoami
if ($LASTEXITCODE -ne 0) {
  Write-Host 'BLOCKED_USER: ejecuta “npx.cmd eas-cli@latest login”, inicia sesión en Expo y vuelve a ejecutar este script.' -ForegroundColor Yellow
  exit 30
}

Write-Step 'Sesión EAS detectada; iniciando APK development en la nube'
npx.cmd eas-cli@latest build --platform android --profile development
exit $LASTEXITCODE
