# Lighthouse CI lokaal op Windows.
# chrome-launcher kan op Windows zijn tijdelijke profielmap niet opruimen (EPERM),
# waardoor `npm run lighthouse` faalt. Dit script start Chrome zelf met een
# debug-poort en laat Lighthouse daaraan koppelen. In CI (Linux) is dit niet nodig.
#
# Gebruik:  powershell -File scripts/lighthouse-local.ps1            (mobiel)
#           powershell -File scripts/lighthouse-local.ps1 -Desktop   (desktop)
param([switch]$Desktop)

$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chromePath)) { throw "Chrome niet gevonden op $chromePath" }

$profile = Join-Path $env:TEMP "lh-profile"
Remove-Item -Recurse -Force $profile -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $profile | Out-Null

$chrome = Start-Process -FilePath $chromePath -PassThru -ArgumentList @(
  "--headless=new", "--remote-debugging-port=9222", "--user-data-dir=$profile",
  "--no-first-run", "--disable-gpu", "about:blank"
)
Start-Sleep -Seconds 3

try {
  $args = @("--collect.settings.port=9222")
  if ($Desktop) {
    $args += "--collect.settings.preset=desktop"
  }
  npx lhci autorun @args
  $exit = $LASTEXITCODE
} finally {
  Stop-Process -Id $chrome.Id -Force -ErrorAction SilentlyContinue
}
exit $exit
