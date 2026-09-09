$WshShell = New-Object -comObject WScript.Shell

# 1. Windows Startup Shortcut (Laptop on hote hi background me start karega)
$StartupFolder = [Environment]::GetFolderPath('Startup')
$StartupLnk = Join-Path $StartupFolder "KisanKendra-AutoStart.lnk"
$Shortcut = $WshShell.CreateShortcut($StartupLnk)
$Shortcut.TargetPath = "wscript.exe"
$Shortcut.Arguments = "`"c:\Amit folder\Kisankendra\AutoStart-Background.vbs`""
$Shortcut.WorkingDirectory = "c:\Amit folder\Kisankendra"
$Shortcut.Description = "KisanKendra Background Server AutoStart"
$Shortcut.Save()
Write-Host "Created Startup Shortcut at: $StartupLnk"

# 2. Desktop Shortcut (Desktop se 1-click open karne ke liye)
$DesktopFolder = [Environment]::GetFolderPath('Desktop')
$DesktopLnk = Join-Path $DesktopFolder "Kisan Kendra.lnk"
$DeskShortcut = $WshShell.CreateShortcut($DesktopLnk)
$DeskShortcut.TargetPath = "wscript.exe"
$DeskShortcut.Arguments = "`"c:\Amit folder\Kisankendra\Open-KisanKendra.vbs`""
$DeskShortcut.WorkingDirectory = "c:\Amit folder\Kisankendra"
$DeskShortcut.IconLocation = "shell32.dll,14"
$DeskShortcut.Description = "Launch KisanKendra Portal"
$DeskShortcut.Save()
Write-Host "Created Desktop Shortcut at: $DesktopLnk"
