@echo off
REM ============================================================
REM  DemoSecurity - start.bat
REM  Bina Docker ke API ko dev mode me chalata hai (CMD se)
REM  Run:  scripts-bat\start.bat   (double-click bhi chalega)
REM  API:  http://localhost:3000/health
REM  Docs: http://localhost:3000/api-docs
REM ============================================================
setlocal
title DemoSecurity API - Dev
pushd "%~dp0.."

where node >nul 2>nul
if errorlevel 1 (
  echo  [ERROR] Node.js nahi mila. Pehle scripts-bat\install.bat chalao ^(Node 22 LTS chahiye^).
  pause
  exit /b 1
)

if not exist "apps\api\node_modules" (
  echo  node_modules nahi mila, pehle install chal raha hai...
  call "%~dp0install.bat"
  if errorlevel 1 exit /b 1
)

if not exist "apps\api\.env" (
  echo  .env nahi mila, .env.example se bana rahe hai...
  copy "apps\api\.env.example" "apps\api\.env" >nul
)

echo.
echo  ===== DemoSecurity API start ho rahi hai =====
echo  Health : http://localhost:3000/health
echo  Swagger: http://localhost:3000/api-docs
echo  Band karne ke liye CTRL+C dabao.
echo.

pushd "apps\api"
call npm run dev
if errorlevel 1 (
  echo.
  echo  [ERROR] API ruk gayi ya start nahi hui. Upar error dekho.
  pause
)
popd

popd
endlocal
