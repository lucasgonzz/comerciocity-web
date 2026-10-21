# ================================================================
#  publicar.ps1  (4/10/2026)
# ================================================================
#  Compila la web pública (Vite) y la sube al hosting compartido de Hostinger,
#  a la raíz de comerciocity.com (domains/comerciocity.com/public_html/).
#
#  QUÉ SUBE: index.html, assets/ (JS, CSS, imágenes con hash), og-comerciocity.jpg,
#  favicon.svg, icons.svg, .htaccess y el retiro service-worker.js. Los assets viejos quedan en el servidor (no
#  rompen nada: nadie los referencia) y antes de pisar index.html se guarda una copia
#  index-anterior-<fecha>.html al lado, para volver atrás en un comando.
#
#  QUÉ NO TOCA: images/ (las entrevistas de los testimonios, 1,5 GB), las carpetas
#  de los clientes (api, spa, demo, ...) ni nada fuera de la lista de arriba.
#
#  REQUISITOS: node + npm, PuTTY (plink/pscp en el PATH) y las cuatro variables de
#  entorno SSH_SHARED_HOSTING_HOST / _USERNAME / _PASSWORD / _PORT (están a nivel
#  usuario en esta máquina desde el 31/8/2026).
#
#  USO (PowerShell, desde cualquier carpeta):
#    C:\cc-worktrees\comerciocity-web\scripts\publicar.ps1
#    C:\cc-worktrees\comerciocity-web\scripts\publicar.ps1 -SinBuild   # sube el dist que ya está
# ================================================================

[CmdletBinding()]
param(
    [switch]$SinBuild
)

$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $PSScriptRoot
$dist = Join-Path $raiz 'dist'

foreach ($v in 'SSH_SHARED_HOSTING_HOST', 'SSH_SHARED_HOSTING_USERNAME', 'SSH_SHARED_HOSTING_PASSWORD', 'SSH_SHARED_HOSTING_PORT') {
    if (-not (Get-Item "env:$v" -ErrorAction SilentlyContinue)) {
        throw "Falta la variable de entorno $v. Sin ella no hay a dónde subir."
    }
}

$sshHost = $env:SSH_SHARED_HOSTING_HOST
$usuario = $env:SSH_SHARED_HOSTING_USERNAME
$clave = $env:SSH_SHARED_HOSTING_PASSWORD
$puerto = $env:SSH_SHARED_HOSTING_PORT
$destino = 'domains/comerciocity.com/public_html'
$fecha = Get-Date -Format 'yyyyMMdd-HHmmss'

if (-not $SinBuild) {
    Write-Host "== Compilando ($raiz)" -ForegroundColor Cyan
    Push-Location $raiz
    try {
        npm run build
        if ($LASTEXITCODE -ne 0) { throw "El build falló (exit $LASTEXITCODE)." }
    }
    finally {
        Pop-Location
    }
}

if (-not (Test-Path (Join-Path $dist 'index.html'))) {
    throw "No existe $dist\index.html. Corré sin -SinBuild."
}
foreach ($necesario in @('service-worker.js', '.htaccess')) {
    if (-not (Test-Path (Join-Path $dist $necesario))) {
        throw "Falta $necesario en dist. No se publica sin el retiro del worker y sus cabeceras."
    }
}

Write-Host "== Respaldo verificado del index, worker anterior y .htaccess en el servidor" -ForegroundColor Cyan
$respaldo = "cd $destino && cp -p index.html index-anterior-$fecha.html && cmp -s index.html index-anterior-$fecha.html && for archivo in service-worker.js .htaccess; do if [ -f `"`$archivo`" ]; then cp -p `"`$archivo`" `"`$archivo-anterior-$fecha`" && cmp -s `"`$archivo`" `"`$archivo-anterior-$fecha`" || exit 1; else printf '%s\n' `"ausente: `$archivo`" > `"`$archivo-ausente-$fecha`" || exit 1; fi; done"
& plink -ssh -batch -P $puerto -l $usuario -pw $clave $sshHost $respaldo
if ($LASTEXITCODE -ne 0) { throw "No se pudieron verificar los respaldos previos (exit $LASTEXITCODE). No se subió ningún archivo." }

Write-Host "== Subiendo assets/" -ForegroundColor Cyan
& pscp -batch -P $puerto -pw $clave -r (Join-Path $dist 'assets') "$usuario@${sshHost}:$destino/"
if ($LASTEXITCODE -ne 0) { throw "La subida de assets/ falló (exit $LASTEXITCODE)." }

Write-Host "== Subiendo archivos sueltos" -ForegroundColor Cyan
$sueltos = @('og-comerciocity.jpg', 'favicon.svg', 'icons.svg', '.htaccess') | ForEach-Object { Join-Path $dist $_ } | Where-Object { Test-Path $_ }
& pscp -batch -P $puerto -pw $clave @sueltos "$usuario@${sshHost}:$destino/"
if ($LASTEXITCODE -ne 0) { throw "La subida de los archivos sueltos falló (exit $LASTEXITCODE)." }

# Las dos miniaturas de los testimonios viejos (los .mp4 grandes ya están en el servidor).
$imgs = Join-Path $dist 'images\testimonials'
if (Test-Path $imgs) {
    & plink -ssh -batch -P $puerto -l $usuario -pw $clave $sshHost "mkdir -p $destino/images/testimonials"
    & pscp -batch -P $puerto -pw $clave (Join-Path $imgs 'innovate.jpeg') (Join-Path $imgs 'pack.png') "$usuario@${sshHost}:$destino/images/testimonials/"
}

# index.html al final: es el que cambia qué JS/CSS se sirve, así que va cuando todo lo demás ya está arriba.
Write-Host "== Subiendo index.html" -ForegroundColor Cyan
& pscp -batch -P $puerto -pw $clave (Join-Path $dist 'index.html') "$usuario@${sshHost}:$destino/index.html"
if ($LASTEXITCODE -ne 0) { throw "La subida de index.html falló (exit $LASTEXITCODE)." }

# El retiro se publica después del index: al activarse refresca las ventanas de la web anterior.
Write-Host "== Publicando el retiro del service worker anterior" -ForegroundColor Cyan
& pscp -batch -P $puerto -pw $clave (Join-Path $dist 'service-worker.js') "$usuario@${sshHost}:$destino/service-worker.js"
if ($LASTEXITCODE -ne 0) { throw "La subida de service-worker.js falló (exit $LASTEXITCODE)." }

Write-Host "== Verificando" -ForegroundColor Cyan
[Net.ServicePointManager]::SecurityProtocol = 'Tls12'
$worker = Invoke-WebRequest -Uri "https://comerciocity.com/service-worker.js?nocache=$fecha" -UseBasicParsing
if ($worker.Headers['Content-Type'] -notmatch '(application|text)/javascript' -or $worker.Headers['Cache-Control'] -notmatch 'no-cache' -or $worker.Content -notmatch 'self.registration.unregister') {
    throw 'El retiro del service worker no se sirve como JavaScript sin caché. Revisá las cabeceras antes de dar por publicada la web.'
}
$html = (Invoke-WebRequest -Uri "https://comerciocity.com/?nocache=$fecha" -UseBasicParsing).Content
$esperado = Select-String -Path (Join-Path $dist 'index.html') -Pattern 'assets/index-[A-Za-z0-9_-]+\.js' | ForEach-Object { $_.Matches[0].Value } | Select-Object -First 1
if ($html -match [regex]::Escape($esperado)) {
    Write-Host "OK: comerciocity.com sirve $esperado" -ForegroundColor Green
} else {
    Write-Warning "comerciocity.com todavía no sirve $esperado (puede ser caché de Hostinger/LiteSpeed: probá en una ventana privada en un minuto)."
}
Write-Host "Para volver atrás: plink ... 'cd $destino && cp -p index-anterior-$fecha.html index.html'"
