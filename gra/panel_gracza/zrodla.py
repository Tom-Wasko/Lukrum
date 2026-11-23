"""Strona „Nawiązania i źródła” (`/zrodla`, wątek 03/prawo, decyzja szefa 23.11.2026).

Treść leży w `dane/zrodla.yaml`; silnik jej nie czyta. Strona jest dostępna bez logowania, jak instrukcja.
Liczby gry z podziałem na pewność (potwierdzone, skalibrowane, założenie) liczone są z `dane/zalozenia.yaml`.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

import yaml
from django.conf import settings

KATALOG = Path(settings.BASE_DIR) / "dane"
PEWNOSCI = ("potwierdzone", "skalibrowane", "zalozenie")
NAZWY_PEWNOSCI = {"potwierdzone": "potwierdzone", "skalibrowane": "skalibrowane", "zalozenie": "założenie"}


@lru_cache(maxsize=4)
def _wczytaj(plik: str, zmiana: float) -> dict:
    return yaml.safe_load((KATALOG / plik).read_text(encoding="utf-8"))


def _pewnosci(wezel, licznik: dict[str, int]) -> None:
    if isinstance(wezel, dict):
        if wezel.get("pewnosc") in PEWNOSCI:
            licznik[wezel["pewnosc"]] += 1
        for v in wezel.values():
            _pewnosci(v, licznik)
    elif isinstance(wezel, list):
        for v in wezel:
            _pewnosci(v, licznik)


def liczby_wg_pewnosci() -> list[dict]:
    """Ile parametrów gry ma daną pewność (z zalozenia.yaml) – do akapitu o źródłach liczb."""
    sciezka = KATALOG / "zalozenia.yaml"
    d = _wczytaj("zalozenia.yaml", sciezka.stat().st_mtime)
    licznik = dict.fromkeys(PEWNOSCI, 0)
    _pewnosci(d, licznik)
    return [{"nazwa": NAZWY_PEWNOSCI[k], "ile": licznik[k]} for k in PEWNOSCI]


def dla_strony() -> dict:
    """Kontekst strony: cała treść z `zrodla.yaml` plus podział liczb gry według pewności."""
    sciezka = KATALOG / "zrodla.yaml"
    d = dict(_wczytaj("zrodla.yaml", sciezka.stat().st_mtime))
    d["pewnosci"] = liczby_wg_pewnosci()
    return d
