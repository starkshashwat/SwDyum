@echo off
title Swadyum - Shiprocket Edge Function Deployer
echo ==========================================================
echo Swadyum - Shiprocket Edge Function Deployment Helper
echo ==========================================================
echo.
echo [1/5] Installing Supabase CLI globally...
call npm install -g supabase
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Supabase CLI. Please ensure Node.js is installed.
    pause
    exit /b %errorlevel%
)
echo.
echo [2/5] Logging into your Supabase account...
echo (A browser tab will open. Authenticate and paste the access token below.)
call supabase login
if %errorlevel% neq 0 (
    echo [ERROR] Supabase login failed.
    pause
    exit /b %errorlevel%
)
echo.
echo [3/5] Linking your project (dligrptvajjsbzlcpjsk)...
call supabase link --project-ref dligrptvajjsbzlcpjsk
if %errorlevel% neq 0 (
    echo [ERROR] Failed to link Supabase project.
    pause
    exit /b %errorlevel%
)
echo.
echo [4/5] Configuring Shiprocket secrets...
set /p SR_EMAIL="Enter your Shiprocket API User Email address: "
:: Use the password provided by the user
set SR_PASS=1idsnZ4z6us^^CgrG^&kAXejEwfQkw7G3^^
echo Setting secrets in your Supabase project...
call supabase secrets set SHIPROCKET_EMAIL="%SR_EMAIL%" SHIPROCKET_PASSWORD="%SR_PASS%"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to set Supabase secrets.
    pause
    exit /b %errorlevel%
)
echo.
echo [5/5] Deploying shiprocket-sync Edge Function...
call supabase functions deploy shiprocket-sync
if %errorlevel% neq 0 (
    echo [ERROR] Failed to deploy Edge Function.
    pause
    exit /b %errorlevel%
)
echo.
echo ==========================================================
echo [SUCCESS] Edge Function deployed and secrets configured!
echo ==========================================================
pause
