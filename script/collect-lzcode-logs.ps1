# ============================================================
# 日志收集脚本
# 从命令行和桌面版分别收集日志，压缩为 ZIP 文件
# ============================================================

# ---------- 配置 ----------
$timestamp  = Get-Date -Format "yyyyMMdd-HHmmss"
$username   = $env:USERNAME
$zipName    = "$timestamp-$username.zip"
$outputPath = Join-Path ([Environment]::GetFolderPath("Desktop")) $zipName

$sources = @(
    @{
        Label = "命令行日志"
        Path  = Join-Path $env:USERPROFILE ".local\share\opencode\log"
    },
    @{
        Label = "桌面版日志"
        Path  = Join-Path $env:LOCALAPPDATA "ai.lzcode.desktop\logs"
    }
)

# ---------- 辅助函数 ----------
function Write-Step {
    param([string]$Message)
    Write-Host "`n>>> $Message" -ForegroundColor Cyan
}

function Write-OK {
    param([string]$Message)
    Write-Host "    [OK] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "    [--] $Message" -ForegroundColor Yellow
}

function Write-Fail {
    param([string]$Message)
    Write-Host "    [!!] $Message" -ForegroundColor Red
}

# ---------- 主流程 ----------
Write-Step "开始收集日志"
Write-Host "    输出文件: $outputPath"

# 创建临时工作目录
$tempDir = Join-Path $env:TEMP ("log-collect-" + [System.IO.Path]::GetRandomFileName())
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

$anyFile = $false

foreach ($src in $sources) {
    Write-Step $src.Label

    if (-not (Test-Path $src.Path)) {
        Write-Warn "目录不存在，跳过: $($src.Path)"
        continue
    }

    # 统计日志文件（含子目录）
    $files = Get-ChildItem -Path $src.Path -File -Recurse -ErrorAction SilentlyContinue

    if ($files.Count -eq 0) {
        Write-Warn "目录为空，跳过: $($src.Path)"
        continue
    }

    # 在临时目录中建立对应子目录
    $destRoot = Join-Path $tempDir $src.Label
    New-Item -ItemType Directory -Path $destRoot -Force | Out-Null

    foreach ($file in $files) {
        # 保留相对路径结构
        $relative = $file.FullName.Substring($src.Path.Length).TrimStart('\', '/')
        $destFile  = Join-Path $destRoot $relative
        $destDir   = Split-Path $destFile -Parent

        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }

        Copy-Item -Path $file.FullName -Destination $destFile -Force
    }

    Write-OK "已复制 $($files.Count) 个文件  ← $($src.Path)"
    $anyFile = $true
}

# ---------- 压缩 ----------
if (-not $anyFile) {
    Write-Fail "未找到任何日志文件，退出。"
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Step "正在压缩..."

try {
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $outputPath)
    Write-OK "压缩完成: $outputPath"
} catch {
    Write-Fail "压缩失败: $_"
    exit 1
} finally {
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}

# ---------- 完成 ----------
$size = (Get-Item $outputPath).Length / 1KB
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  完成！文件已保存到桌面" -ForegroundColor Green
Write-Host "  文件名: $zipName" -ForegroundColor White
Write-Host ("  大小  : {0:F1} KB" -f $size) -ForegroundColor White
Write-Host "============================================" -ForegroundColor Cyan

# 询问是否打开所在文件夹
$open = Read-Host "`n是否打开输出目录？(Y/N)"
if ($open -match '^[Yy]') {
    Start-Process explorer.exe -ArgumentList "/select,`"$outputPath`""
}
