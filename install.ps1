Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$BootstrapArgs
)

$RepoUrl = 'https://github.com/Hainrixz/tododeia-animaciones.git'
$TargetDir = Join-Path (Get-Location).Path 'tododeia-animaciones'

function Write-Info {
  param([string]$Message)
  Write-Host "[INFO] $Message"
}

function Fail {
  param([string]$Message)
  throw $Message
}

function Test-Command {
  param([Parameter(Mandatory = $true)][string]$Name)
  return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Refresh-ProcessPath {
  $machinePath = [System.Environment]::GetEnvironmentVariable('Path', 'Machine')
  $userPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')
  if ([string]::IsNullOrWhiteSpace($machinePath)) { $machinePath = '' }
  if ([string]::IsNullOrWhiteSpace($userPath)) { $userPath = '' }
  $env:Path = "$machinePath;$userPath"
}

function Ensure-Git {
  if (Test-Command 'git') {
    return
  }

  if (-not (Test-Command 'winget')) {
    Fail 'git is missing and winget is not available. Install git manually and rerun.'
  }

  Write-Info 'git not found. Installing git with winget...'
  winget install --id Git.Git -e --accept-package-agreements --accept-source-agreements | Out-Host
  Refresh-ProcessPath

  if (-not (Test-Command 'git')) {
    Fail 'git is still missing after winget install.'
  }
}

function Assert-TargetRepoOrEmpty {
  if (-not (Test-Path -LiteralPath $TargetDir)) {
    return
  }

  if (-not (Test-Path -LiteralPath $TargetDir -PathType Container)) {
    Fail "$TargetDir exists and is not a directory. Remove it or choose another working directory."
  }

  if (-not (Test-Path -LiteralPath (Join-Path $TargetDir '.git'))) {
    Fail "$TargetDir exists but is not a git repository. Rename/remove it, then rerun installer."
  }

  git -C $TargetDir rev-parse --is-inside-work-tree *> $null
  if ($LASTEXITCODE -ne 0) {
    Fail "$TargetDir is not a valid git repo."
  }
}

function Ensure-CleanRepoBeforePull {
  $dirty = git -C $TargetDir status --porcelain --untracked-files=normal
  if (-not [string]::IsNullOrWhiteSpace(($dirty | Out-String))) {
    Fail "$TargetDir has uncommitted changes. Commit/stash them before rerunning installer."
  }
}

function Clone-OrUpdateRepo {
  Assert-TargetRepoOrEmpty

  if (-not (Test-Path -LiteralPath $TargetDir)) {
    Write-Info "Cloning repository into $TargetDir..."
    git clone $RepoUrl $TargetDir | Out-Host
    return
  }

  Write-Info "Repository already exists at $TargetDir. Updating with git pull --ff-only..."
  Ensure-CleanRepoBeforePull
  git -C $TargetDir pull --ff-only | Out-Host
  if ($LASTEXITCODE -ne 0) {
    Fail 'git pull failed (non fast-forward or network issue).'
  }
}

function Run-Bootstrap {
  $bootstrapPath = Join-Path $TargetDir 'scripts/bootstrap.ps1'
  if (-not (Test-Path -LiteralPath $bootstrapPath)) {
    Fail "Bootstrap script not found at $bootstrapPath"
  }

  Write-Info 'Running bootstrap script...'
  & powershell -ExecutionPolicy Bypass -File $bootstrapPath @BootstrapArgs
}

Ensure-Git
Clone-OrUpdateRepo
Run-Bootstrap
