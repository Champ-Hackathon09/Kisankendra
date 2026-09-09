Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = scriptDir

' Wait 5 seconds after Windows boot so network is ready
WScript.Sleep 5000

Dim http
Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
On Error Resume Next
http.Open "GET", "http://localhost:5173", False
http.setTimeouts 1000, 1000, 1000, 1000
http.Send

' If port 5173 is not running, start server silently
If Err.Number <> 0 Or http.Status <> 200 Then
    WshShell.Run "cmd /c npm run dev", 0, False
End If
