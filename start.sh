#!/usr/bin/env sh
# LUKRUM - uruchomienie lokalnej gry na macOS i Linuksie. Wymaga Pythona 3.12 lub nowszego.
cd "$(dirname "$0")" || exit 1
if [ ! -x .venv/bin/python ]; then
  PYEXE=""
  for c in python3.14 python3.13 python3.12 python3 python; do
    if command -v "$c" >/dev/null 2>&1 && "$c" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 12) else 1)'; then PYEXE="$c"; break; fi
  done
  [ -n "$PYEXE" ] || { echo "Nie znaleziono Pythona 3.12 lub nowszego."; exit 1; }
  echo "Pierwsze uruchomienie: tworze srodowisko Pythona i instaluje pakiety..."
  "$PYEXE" -m venv .venv && .venv/bin/python -m pip install --quiet --upgrade pip && .venv/bin/python -m pip install --quiet -r requirements.txt || exit 1
fi
echo "Gra startuje: http://127.0.0.1:8765  (Ctrl+C konczy)"
exec .venv/bin/python manage.py graj
