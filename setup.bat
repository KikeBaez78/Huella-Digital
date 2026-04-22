@echo off
:: Runs npx commands via cmd.exe, bypassing PowerShell execution policy restrictions.

echo [setup] Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [setup] ERROR: npm install failed.
    exit /b %ERRORLEVEL%
)

echo [setup] Done. Run "npm run dev" to start the dev server.
