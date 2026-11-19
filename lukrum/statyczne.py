"""Pliki statyczne bez starych wersji w pamięci przeglądarki.

Strony wczytują pliki z `/static/v<wersja>/…`, gdzie wersja to skrót czasów zmian wszystkich plików
statycznych. Po zmianie zakładki adres jest nowy, więc przeglądarka (i Cloudflare przy `hostuj`) nie
może podać starego modułu – a moduły importowane względnie (`./zakladki/…`) dziedziczą tę wersję.
Odpowiedzi mają dodatkowo `no-cache`. `graj` i `hostuj` uruchamiają serwer bez wbudowanej obsługi
/static/, żeby szła tędy. Nagrania radia (`radio/*.mp3`) idą też kawałkami (nagłówek Range), żeby
odtwarzacz mógł wrócić do miejsca, w którym przerwano słuchowisko.
"""

import hashlib
import re

from django.contrib.staticfiles import finders
from django.contrib.staticfiles.views import serve
from django.http import HttpResponse
from django.utils.cache import patch_cache_control


def wersja() -> str:
    skrot = hashlib.sha1()
    for finder in finders.get_finders():
        for sciezka, magazyn in finder.list([]):
            skrot.update(f"{sciezka}:{magazyn.get_modified_time(sciezka).timestamp()}".encode())
    return skrot.hexdigest()[:10]


def kontekst(request):
    """`{{ statyczne }}` w szablonach: początek adresu plików statycznych z bieżącą wersją."""
    return {"statyczne": f"/static/v{wersja()}/"}


def _kawalek(request, path):
    """Odpowiedź 206 na `Range: bytes=od-do` dla pliku MP3 albo None (wtedy cały plik)."""
    m = re.fullmatch(r"bytes=(\d*)-(\d*)", request.headers.get("Range", "").strip())
    sciezka = finders.find(path) if m and path.endswith(".mp3") else None
    if not sciezka:
        return None
    with open(sciezka, "rb") as f:
        dane = f.read()
    rozmiar = len(dane)
    if m[1]:
        od, do = int(m[1]), min(int(m[2]) if m[2] else rozmiar - 1, rozmiar - 1)
    else:   # „bytes=-N”: ostatnie N bajtów
        od, do = max(rozmiar - int(m[2] or 0), 0), rozmiar - 1
    if od > do:
        odp = HttpResponse(status=416)
        odp["Content-Range"] = f"bytes */{rozmiar}"
        return odp
    odp = HttpResponse(dane[od:do + 1], status=206, content_type="audio/mpeg")
    odp["Content-Range"] = f"bytes {od}-{do}/{rozmiar}"
    odp["Accept-Ranges"] = "bytes"
    return odp


def widok(request, path):
    odp = _kawalek(request, path) or serve(request, path, insecure=True)
    if path.endswith(".mp3"):
        odp["Accept-Ranges"] = "bytes"
    patch_cache_control(odp, no_cache=True)
    return odp
