# Agregar Sistema Escolar al inicio de Windows
$WshShell = New-Object -ComObject WScript.Shell
$StartupFolder = [System.Environment]::GetFolderPath("Startup")
$Shortcut = $WshShell.CreateShortcut("$StartupFolder\Sistema Escolar.lnk")
$Shortcut.TargetPath = "C:\Users\anati\Desktop\Proyectos\sistema-gestion-escolar\INICIAR.bat"
$Shortcut.WorkingDirectory = "C:\Users\anati\Desktop\Proyectos\sistema-gestion-escolar"
$Shortcut.Description = "Iniciar Sistema de Gestion Escolar al arrancar Windows"
$Shortcut.IconLocation = "C:\Windows\System32\shell32.dll,23"
$Shortcut.Save()
Write-Host "Sistema Escolar agregado al inicio de Windows correctamente."
Write-Host "Ruta: $StartupFolder"
