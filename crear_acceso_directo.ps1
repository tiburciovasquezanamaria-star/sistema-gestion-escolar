$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("C:\Users\anati\Desktop\Sistema Escolar.lnk")
$Shortcut.TargetPath = "C:\Users\anati\Desktop\Proyectos\sistema-gestion-escolar\INICIAR.bat"
$Shortcut.WorkingDirectory = "C:\Users\anati\Desktop\Proyectos\sistema-gestion-escolar"
$Shortcut.Description = "Iniciar Sistema de Gestion Escolar"
$Shortcut.IconLocation = "C:\Windows\System32\shell32.dll,23"
$Shortcut.Save()
Write-Host "Acceso directo creado en el Escritorio correctamente."
