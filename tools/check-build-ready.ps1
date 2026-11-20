# 推上 GitHub 前的自检：确认构建所需文件都在
$ErrorActionPreference = 'Stop'
Set-Location -Path (Join-Path $PSScriptRoot '..')

$required = @(
  'ios/project.yml',
  'ios/PetKingdom/Info.plist',
  'ios/PetKingdom/PetKingdomApp.swift',
  'ios/PetKingdom/ContentView.swift',
  'ios/PetKingdom/Web/index.html',
  'ios/PetKingdom/Assets.xcassets/Contents.json',
  'ios/PetKingdom/Assets.xcassets/AppIcon.appiconset/Contents.json',
  'ios/PetKingdom/Assets.xcassets/AppIcon.appiconset/icon-1024.png',
  '.github/workflows/build-ios-ipa.yml'
)

$missing = @()
foreach ($p in $required) {
  if (-not (Test-Path $p)) { $missing += $p }
}

if ($missing.Count -gt 0) {
  Write-Host '缺少以下文件，云端构建会失败：' -ForegroundColor Red
  $missing | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
  exit 1
}

$size = (Get-Item 'ios/PetKingdom/Web/index.html').Length
Write-Host "自检通过：iOS 单文件网页 $([math]::Round($size/1KB,1)) KB，构建文件齐全。" -ForegroundColor Green
Write-Host '下一步：把本目录（含 .github 隐藏目录）整体推到 GitHub，然后在 Actions 里 Run workflow。' -ForegroundColor Gray
