# 启动本地服务，用 iPhone 访问（同一 WiFi）
$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

$port = 8080
$ip = (Get-NetIPAddress -AddressFamily IPv4 |
        Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' -and $_.PrefixOrigin -ne 'WellKnown' } |
        Select-Object -First 1).IPAddress

if (-not $ip) { $ip = '127.0.0.1' }

Write-Host ''
Write-Host '==========================================' -ForegroundColor Cyan
Write-Host '  虹光宠物物语 · 本地服务已启动' -ForegroundColor Yellow
Write-Host '==========================================' -ForegroundColor Cyan
Write-Host ''
Write-Host '  手机（同一 WiFi）用 Safari 打开：' -ForegroundColor White
Write-Host "     http://${ip}:${port}" -ForegroundColor Green
Write-Host ''
Write-Host '  电脑本机打开：' -ForegroundColor White
Write-Host "     http://localhost:${port}" -ForegroundColor Green
Write-Host ''
Write-Host '  手机上点「分享 → 添加到主屏幕」可全屏启动' -ForegroundColor Gray
Write-Host '  关闭此窗口即停止服务' -ForegroundColor Gray
Write-Host ''

python -m http.server $port --bind 0.0.0.0
