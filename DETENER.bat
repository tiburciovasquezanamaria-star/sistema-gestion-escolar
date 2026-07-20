@echo off
title Deteniendo Sistema Escolar...
color 0C
cls

echo.
echo  =====================================================
echo    SISTEMA DE GESTION ESCOLAR
echo    Deteniendo todos los servicios...
echo  =====================================================
echo.

echo  Cerrando servidores Node.js...
taskkill /f /im node.exe >nul 2>&1
echo  OK - Servidores detenidos.
echo.

echo  =====================================================
echo    Sistema detenido correctamente.
echo  =====================================================
echo.
timeout /t 2 /nobreak >nul
