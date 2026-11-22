"""Radio „Fala Koziołka” (seria radio, 19.11.2026): `dane/radio.yaml` → `/radio.json`
i strona `/nagrania-w-radiu`.

Radio jest tylko dla nastroju: silnik go nie czyta. Pliki MP3 leżą
w `panel_gracza/static/radio/<stacja>/`.
Każde nagranie ma autora, wykonawcę, źródło i licencję. Dopuszczone są tylko licencje z `LICENCJE`
(decyzje szefa 19.11.2026: domena publiczna, CC0, CC BY, CC BY-SA, Licencja Wolnej Sztuki 1.3).
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

import yaml
from django.conf import settings

PLIK = Path(settings.BASE_DIR) / "dane" / "radio.yaml"
KATALOG_PLIKOW = Path(settings.BASE_DIR) / "panel_gracza" / "static" / "radio"
LICENCJE = ("domena publiczna", "CC0", "CC BY ", "CC BY-SA", "Licencja Wolnej Sztuki 1.3")
RODZAJE = ("muzyka", "sluchowisko", "szum")


def licencja_dozwolona(licencja: str) -> bool:
    return any(licencja.startswith(x) for x in LICENCJE)


@lru_cache(maxsize=4)
def _wczytaj(zmiana: float) -> dict:
    return yaml.safe_load(PLIK.read_text(encoding="utf-8"))


def radio() -> dict:
    """Całe dane radia: nadawca, stacje z nagraniami, teksty prowadzącego."""
    return _wczytaj(PLIK.stat().st_mtime)   # nowa wersja pliku – nowe dane bez restartu serwera


def dla_odbiornika() -> dict:
    """To, czego potrzebuje odbiornik (radio.js): bez opisów licencji, z adresami plików."""
    d = radio()
    stacje = [{"id": s["id"], "nazwa": s["nazwa"], "fala": s["fala"], "opis": s["opis"],
               "rodzaj": s["rodzaj"],
               "nagrania": [{"tytul": n["tytul"], "wykonawca": n["wykonawca"], "rok": n.get("rok"),
                             "url": f"/static/radio/{n['plik']}"} for n in s.get("nagrania", [])]}
              for s in d["stacje"]]
    return {"nadawca": d["nadawca"], "stacje": stacje, "prowadzacy": d["prowadzacy"]}


def _czas(sekundy: int) -> str:
    return f"{sekundy // 60}:{sekundy % 60:02d}"


def dla_strony() -> dict:
    """Kontekst strony „Nagrania w radiu”: stacje z nagraniami (czas w min:s) i suma czasu."""
    d = radio()
    stacje, suma = [], 0
    for s in d["stacje"]:
        nagrania = [n | {"czas": _czas(n.get("sekundy", 0))} for n in s.get("nagrania", [])]
        suma += sum(n.get("sekundy", 0) for n in nagrania)
        stacje.append(s | {"nagrania": nagrania})
    return {"nadawca": d["nadawca"], "stacje": stacje, "podstawa": d.get("podstawa", []),
            "liczba": sum(len(s["nagrania"]) for s in stacje),
            "godziny": f"{suma / 3600:.1f}".replace(".", ",")}
