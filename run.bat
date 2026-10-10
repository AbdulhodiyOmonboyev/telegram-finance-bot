@echo off
title Moliya Telegram Boti
cd /d "%~dp0"

echo ====================================================
echo        MOLIYA BOTINI ISHGA TUSHIRISH
echo ====================================================
echo.

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [XATOLIK] Node.js topilmadi!
    echo Iltimos, Node.js ni o'rnating: https://nodejs.org/
    pause
    exit /b
)

echo Bot ishga tushirilmoqda...
echo.
node index.js

if %errorlevel% neq 0 (
    echo.
    echo Bot to'xtadi yoki xatolik yuz berdi.
    pause
)
