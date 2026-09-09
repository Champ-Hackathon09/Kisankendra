Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = scriptDir

Function IsServerRunning()
    Dim http
    Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
    On Error Resume Next
    http.Open "GET", "http://localhost:5173", False
    http.setTimeouts 1000, 1000, 1000, 1000
    http.Send
    If Err.Number = 0 And http.Status = 200 Then
        IsServerRunning = True
    Else
        IsServerRunning = False
    End If
End Function

If Not IsServerRunning() Then
    WshShell.Run "cmd /c npm run dev", 0, False
    For i = 1 To 15
        WScript.Sleep 1000
        If IsServerRunning() Then Exit For
    Next
End If

WshShell.Run "http://localhost:5173"
