"""Lista modułów JS, do których dochodzi `app.js` zwykłymi (nie leniwymi) importami.

Przeglądarka odkrywa moduły dopiero po pobraniu rodzica, więc ~80 plików ładuje się kolejnymi
„piętrami” żądań. `<link rel="modulepreload">` w szablonie pozwala pobrać wszystkie naraz.
Lista powstaje przy żądaniu strony z samych źródeł (bez kroku budowania), a przy `DEBUG` liczona
jest na nowo, więc edycja pliku JS i odświeżenie działają jak dotąd. Importy `import("…")`
(leniwe: budynki, wnętrza) celowo nie wchodzą na listę.
"""

import posixpath
import re
from pathlib import Path

from django.conf import settings

KORZEN = Path(__file__).parent / "static"
WEJSCIE = "app.js"
_IMPORT = re.compile(r"""(?:^|[;\s}])(?:import|export)\b[^'"`;()]*?\bfrom\s*["']([^"']+)["']"""
                     r"""|(?:^|[;\s}])import\s*["']([^"']+)["']""", re.S)
_pamiec: dict = {}


def importy(sciezka: str) -> list[str]:
    """Statyczne importy względne jednego modułu (ścieżki od `static/`)."""
    tekst = (KORZEN / sciezka).read_text(encoding="utf-8")
    wynik = []
    for m in _IMPORT.finditer(tekst):
        cel = m.group(1) or m.group(2)
        if cel.startswith("."):
            wynik.append(posixpath.normpath(posixpath.join(posixpath.dirname(sciezka), cel)))
    return wynik


def graf(wejscie: str = WEJSCIE) -> list[str]:
    """Wszystkie moduły osiągalne statycznie z `wejscie`, w kolejności odkrycia."""
    odwiedzone, kolejka = [wejscie], [wejscie]
    while kolejka:
        for cel in importy(kolejka.pop(0)):
            if cel not in odwiedzone:
                odwiedzone.append(cel)
                kolejka.append(cel)
    return odwiedzone


def lista() -> list[str]:
    """Lista do `modulepreload`. Poza `DEBUG` liczona raz na proces."""
    if settings.DEBUG:
        return graf()
    if "lista" not in _pamiec:
        _pamiec["lista"] = graf()
    return _pamiec["lista"]
