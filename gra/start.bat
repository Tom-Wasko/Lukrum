@echo off
rem LUKRUM - uruchomienie lokalnej gry (podwojne klikniecie). Wymaga Pythona 3.12 lub nowszego (3.12, 3.13, 3.14...).
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
  echo Pierwsze uruchomienie: tworze srodowisko Pythona i instaluje pakiety...
  set "PYEXE="
  for %%V in (3.14 3.13 3.12) do if not defined PYEXE (py -%%V -c "import sys" >nul 2>nul && set "PYEXE=py -%%V")
  if not defined PYEXE (python -c "import sys; sys.exit(0 if sys.version_info >= (3,12) else 1)" >nul 2>nul && set "PYEXE=python")
  if not defined PYEXE (echo Nie znaleziono Pythona 3.12 lub nowszego. Zainstaluj go z python.org i uruchom ponownie. & pause & exit /b 1)
  %PYEXE% -m venv .venv || (echo Nie udalo sie utworzyc srodowiska. & pause & exit /b 1)
  ".venv\Scripts\python.exe" -m pip install --quiet --upgrade pip
  ".venv\Scripts\python.exe" -m pip install --quiet -r requirements.txt
)
echo Gra startuje: http://127.0.0.1:8765  (zamknij to okno, aby zakonczyc)
if not exist ".venv\Lib\site-packages\django" ".venv\Scripts\python.exe" -m pip install --quiet -r requirements.txt
".venv\Scripts\python.exe" manage.py graj
pause
