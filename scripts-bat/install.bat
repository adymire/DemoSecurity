@echo off
REM ============================================================
REM  DemoSecurity - install.bat
REM  Saari dependencies install karta hai (Docker ki jarurat nahi)
REM  Run:  scripts-bat\install.bat   (double-click bhi chalega)
REM ============================================================
setlocal
title DemoSecurity - Install
pushd "%~dp0.."

echo.
echo  ===== DemoSecurity : dependency install =====
echo  Root: %CD%
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo  [ERROR] Node.js nahi mila. Pehle https://nodejs.org se Node 22 LTS install karo.
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo  [ERROR] npm nahi mila. Node ke saath npm aata hai, Node reinstall karo.
  pause
  exit /b 1
)

echo  Node: & call node --version
echo  npm : & call npm --version
echo.

echo  [1/3] apps\api ki dependencies...
pushd "apps\api"
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo  [ERROR] apps\api me npm install fail hua.
  popd
  pause
  exit /b 1
)
popd

echo.
echo  [2/3] packages\contracts ki dependencies...
pushd "packages\contracts"
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo  [ERROR] packages\contracts me npm install fail hua.
  popd
  pause
  exit /b 1
)
call npm run build
if errorlevel 1 (
  echo  [WARN] contracts build fail hua, aage badh rahe hai...
)
popd

echo.
echo  [3/3] apps\api\.env check...
if not exist "apps\api\.env" (
  copy "apps\api\.env.example" "apps\api\.env" >nul
  echo  .env.example se .env bana diya. Apne secrets baad me bhar lena.
) else (
  echo  .env pehle se hai, kuch nahi badla.
)

echo.
echo  ===== Install complete! Ab chalao: scripts-bat\start.bat =====
echo.
pause
popd
endlocal
