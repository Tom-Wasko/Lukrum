"""Tryb lekcyjny prowadzenia gry (decyzja autora 14.11.2026).

Pierwsze rundy klasa gra na żywo na lekcji (nauczyciel zamyka rundę, bez terminu), kolejne toczą się
między lekcjami: runda ma termin = moment jej otwarcia (`Gra.termin_od`) + N dni. Ustawienie leży w
`konfiguracja["lekcje"]` = {"rundy_na_zywo", "termin_dni"}; brak klucza = gra „na żywo” jak dotąd.
Domyślne wartości i zakresy – `settings.LUKRUM_TRYB_LEKCYJNY` (ustawienie aplikacji, nie silnika).
"""

from __future__ import annotations

from datetime import datetime, timedelta

from django.conf import settings


def zakresy() -> dict:
    """{"rundy_na_zywo": {domyslnie, min, max}, "termin_dni": {...}} z ustawień aplikacji."""
    t = settings.LUKRUM_TRYB_LEKCYJNY
    return {k: dict(t[k]) for k in ("rundy_na_zywo", "termin_dni")}


def popraw(wartosc) -> dict | None:
    """Ustawienie z panelu → {"rundy_na_zywo", "termin_dni"} albo None (None / False = na żywo).
    Brakujące liczby – domyślne z danych; błąd: `ValueError`."""
    if wartosc in (None, False):
        return None
    if not isinstance(wartosc, dict):
        raise ValueError("Tryb lekcyjny: liczba rund na żywo i termin w dniach.")
    z = zakresy()
    wynik = {}
    nazwy = {"rundy_na_zywo": "Liczba rund na żywo", "termin_dni": "Termin rundy w dniach"}
    for klucz, zakres in z.items():
        v = wartosc.get(klucz, zakres["domyslnie"])
        calkowita = (isinstance(v, int) and not isinstance(v, bool)) or (
            isinstance(v, str) and v.strip().lstrip("-").isdigit())
        if not calkowita:
            raise ValueError(f"{nazwy[klucz]} to liczba całkowita.")
        v = int(v)
        if not zakres["min"] <= v <= zakres["max"]:
            raise ValueError(f"{nazwy[klucz]}: od {zakres['min']} do {zakres['max']}.")
        wynik[klucz] = v
    return wynik


def ustawienie(konfiguracja: dict) -> dict | None:
    """Tryb lekcyjny gry (stare gry bez klucza – None)."""
    u = konfiguracja.get("lekcje")
    return u if isinstance(u, dict) and "rundy_na_zywo" in u and "termin_dni" in u else None


def na_zywo(u: dict, runda: int) -> bool:
    """Czy runda jest jeszcze „na żywo” (rundy liczone od początku gry, nie od importu)."""
    return runda <= u["rundy_na_zywo"]


def termin(u: dict | None, runda: int, od: datetime) -> datetime | None:
    """Termin zamknięcia rundy między lekcjami (None: bez trybu albo runda na żywo)."""
    if u is None or na_zywo(u, runda):
        return None
    return od + timedelta(days=u["termin_dni"])


def opis(u: dict | None, runda: int) -> dict | None:
    """Do widoków: tryb i etap. {"tryb": "lekcyjny", "etap": "na_zywo" | "miedzy", "rundy_na_zywo",
    "termin_dni", "tekst"}; None – gra prowadzona na żywo."""
    if u is None:
        return None
    zywo = na_zywo(u, runda)
    return {**u, "tryb": "lekcyjny", "etap": "na_zywo" if zywo else "miedzy",
            "tekst": f"na żywo: runda {runda} z {u['rundy_na_zywo']}" if zywo
            else f"między lekcjami: {u['termin_dni']} dni na rundę"}
