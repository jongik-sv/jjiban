@echo off
REM node-pty installation script for Windows

echo Installing node-pty with Visual Studio Build Tools...
echo.

REM Set Visual Studio environment
call "C:\Program Files (x86)\Microsoft Visual Studio\18\BuildTools\VC\Auxiliary\Build\vcvarsall.bat" x64

REM Clean previous installation attempts
if exist node_modules\node-pty (
    echo Cleaning previous installation...
    rmdir /s /q node_modules\node-pty
)

REM Install node-pty with proper environment
echo.
echo Installing node-pty...
npm install node-pty --msvs_version=2026

echo.
echo Installation completed!
pause
