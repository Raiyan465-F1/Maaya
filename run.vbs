Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd.exe /c pnpm dev", 0, false
