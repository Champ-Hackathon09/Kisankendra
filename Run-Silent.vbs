Set WshShell = CreateObject("WScript.Shell")
' Check if port 5173 is already running
Dim http
Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
On Error Resume Next
http.Open "GET", "http://localhost:5173", False
http.setTimeouts 1000, 1000, 1000, 1000
http.Send

If Err.Number = 0 And http.Status = 200 Then
    ' Already running, just open browser
    WshShell.Run "http://localhost:5173"
Else
    ' Start server silently
    WshShell.Run "cmd /c npm run dev", 0, False
    WScript.Sleep 4000
    WshShell.Run "http://localhost:5173"
End If
