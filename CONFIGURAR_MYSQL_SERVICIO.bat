@echo off
"C:\xampp\mysql\bin\mysqld.exe" --install mysql --defaults-file="C:\xampp\mysql\bin\my.ini"
sc config mysql start= auto
net start mysql
echo.
echo Listo! MySQL configurado como servicio automatico.
pause
