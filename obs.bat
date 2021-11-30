COPY Untitled.json "%USERPROFILE%\AppData\Roaming\obs-studio\basic\scenes"
COPY service.json "%USERPROFILE%\AppData\Roaming\obs-studio\basic\profiles\Untitled"
cd C:\Program Files\obs-studio\bin\64bit\
start obs64.exe --minimize-to-tray --startrecording