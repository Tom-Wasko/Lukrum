"""Dźwięki gry (podróż 04, wątek dzwieki): `dane/dzwieki.yaml` → `/dzwieki.json` i strona nagrań.

Dźwięki są tylko dla nastroju: silnik ich nie czyta. Pliki leżą w `panel_gracza/static/dzwieki/`.
Plik „gotowe” ma autora, źródło i licencję z `LICENCJE`; „oczekuje” – czeka na akceptację szefa.
Brak pliku to cisza bez błędu (panel pomija nagranie, którego nie ma).
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

import yaml
from django.conf import settings

PLIK = Path(settings.BASE_DIR) / "dane" / "dzwieki.yaml"
KATALOG_PLIKOW = Path(settings.BASE_DIR) / "panel_gracza" / "static" / "dzwieki"
BUDYNKI = Path(settings.BASE_DIR) / "dane" / "mapa" / "budynki.yaml"
LICENCJE = ("CC0", "domena publiczna")
CISZA = "cisza"


@lru_cache(maxsize=4)
def _wczytaj(zmiana: float) -> dict:
    return yaml.safe_load(PLIK.read_text(encoding="utf-8"))


def dzwieki() -> dict:
    return _wczytaj(PLIK.stat().st_mtime)   # nowa wersja pliku – nowe dane bez restartu serwera


def _budynki() -> dict:
    return yaml.safe_load(BUDYNKI.read_text(encoding="utf-8"))


def odglos_miejsca(d: dict, id_: str, rodzaj: str | None = None) -> str:
    """Odgłos tła miejsca: najpierw id, potem rodzaj, na końcu `domyslne`."""
    m = d["miejsca"]
    return m.get(id_) or (m.get(rodzaj) if rodzaj else None) or d["domyslne"]


def miejsca_rozwiazane(d: dict) -> dict[str, str]:
    """{id budynku albo zespołu: odgłos | „cisza”} dla wszystkich miejsc z `budynki.yaml`,
    plus klucze `mapa` i `lokal` (własny lokal drużyny)."""
    b = _budynki()
    wynik = {x["id"]: odglos_miejsca(d, x["id"], x.get("rodzaj")) for x in b["budynki"]}
    for z in b.get("zespoly", []):
        wynik[z["id"]] = odglos_miejsca(d, z["id"])
    wynik["mapa"] = odglos_miejsca(d, "mapa")
    wynik["lokal"] = odglos_miejsca(d, "lokal")
    return wynik


def glosnosc_miejsc(d: dict) -> dict[str, int]:
    """{id budynku albo zespołu: głośność odgłosu w %} tylko tam, gdzie różni się od 100."""
    g = d.get("glosnosc_miejsc") or {}
    b = _budynki()
    wynik = {x["id"]: g.get(x["id"], g.get(x.get("rodzaj"), 100)) for x in b["budynki"]}
    wynik |= {z["id"]: g.get(z["id"], 100) for z in b.get("zespoly", [])}
    wynik["mapa"] = g.get("mapa", 100)
    wynik["lokal"] = g.get("lokal", 100)
    return {k: v for k, v in wynik.items() if v != 100}


def _dostepny(p: dict) -> bool:
    return p.get("status") == "gotowe" and (KATALOG_PLIKOW / p["plik"]).is_file()


def dla_panelu() -> dict:
    """To, czego potrzebuje dzwiek.js: tylko pliki, które naprawdę są; brak pliku = cisza."""
    d = dzwieki()
    pliki = {k: {"rodzaj": p["rodzaj"], "url": f"/static/dzwieki/{p['plik']}"}
             for k, p in d["pliki"].items() if _dostepny(p)}
    return {"glosnosc": d["glosnosc_domyslna"], "wlaczone": d["wlaczone_domyslnie"],
            "przejscie": d["przejscie_tla_s"], "pliki": pliki, "zdarzenia": d["zdarzenia"],
            "miejsca": miejsca_rozwiazane(d), "miejsca_glosnosc": glosnosc_miejsc(d),
            "domyslne": d["domyslne"]}


def dla_strony() -> dict:
    """Spis dla strony „Nagrania i dźwięki”: pliki gotowe z autorem, źródłem i licencją."""
    d = dzwieki()
    gotowe = [p | {"nazwa": k} for k, p in d["pliki"].items() if p.get("status") == "gotowe"]
    return {"dzwieki": gotowe, "dzwieki_oczekuje": sum(
        1 for p in d["pliki"].values() if p.get("status") != "gotowe")}
