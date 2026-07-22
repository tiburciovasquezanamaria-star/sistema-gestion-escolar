@echo off
title Sistema de Gestion Escolar - Iniciando...
color 0A
cls

echo.
echo  =====================================================
echo    SISTEMA DE GESTION ESCOLAR
echo    Iniciando todos los servicios...
echo  =====================================================
echo.

:: ─── Verificar si MySQL de XAMPP ya esta corriendo ────────────────────────
echo  [1/3] Verificando MySQL (XAMPP)...

:: Comprobar si mysqld.exe ya esta en ejecucion
tasklist /fi "imagename eq mysqld.exe" 2>nul | find /i "mysqld.exe" >nul 2>&1
if %errorlevel%==0 (
    echo         MySQL ya esta corriendo.
    goto :mysql_ok
)

:: Intentar servicio de Windows si existe
sc query mysql >nul 2>&1
if %errorlevel%==0 (
    net start mysql >nul 2>&1
    echo         Servicio MySQL iniciado.
    goto :mysql_ok
)

:: Iniciar mysqld.exe de XAMPP directamente
if exist "C:\xampp\mysql\bin\mysqld.exe" (
    echo         Iniciando MySQL desde XAMPP...
    start "" /B "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini"
    echo         Esperando que MySQL arranque...
    timeout /t 5 /nobreak >nul
    goto :mysql_ok
)

:: Si no se encontro nada
echo.
echo  [!] ATENCION: No se encontro MySQL.
echo      Abre XAMPP Control Panel y presiona [Start] en MySQL.
echo.
pause

:mysql_ok
echo         OK - MySQL listo.
echo.

:: ─── Iniciar Backend (Node.js) ────────────────────────────────────────────
echo  [2/3] Iniciando servidor backend (puerto 3001)...
start "BACKEND - Sistema Escolar" cmd /k "color 0B && title BACKEND - Sistema Escolar && echo. && echo  Servidor API corriendo... && echo. && cd /d "%~dp0server" && node server.js"
echo         OK - Backend iniciando en http://localhost:3001
echo.

:: Esperar que el backend conecte a la DB
timeout /t 4 /nobreak >nul

:: ─── Iniciar Frontend (Vite) ──────────────────────────────────────────────
echo  [3/3] Iniciando aplicacion web (puerto 5173)...
start "FRONTEND - Sistema Escolar" cmd /k "color 0D && title FRONTEND - Sistema Escolar && echo. && echo  Frontend Vite corriendo... && echo. && cd /d "%~dp0" && npx vite"
echo         OK - Frontend iniciando en http://localhost:5173
echo.

:: Esperar que Vite arranque
timeout /t 5 /nobreak >nul

:: ─── Abrir navegador automáticamente ─────────────────────────────────────
echo  Abriendo el sistema en el navegador...
start "" "http://localhost:5173"

echo.
echo  =====================================================
echo    SISTEMA INICIADO CORRECTAMENTE
echo    Aplicacion: http://localhost:5173
echo    API:        http://localhost:3001/api/health
echo  =====================================================
echo.
echo  Esta ventana puede cerrarse. Para detener el sistema
echo  usa el archivo DETENER.bat o cierra las ventanas
echo  de BACKEND y FRONTEND.
echo.
pause
