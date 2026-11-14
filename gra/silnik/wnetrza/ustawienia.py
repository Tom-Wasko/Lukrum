"""Ustawienia wnętrz w konfiguracji gry: `wnetrza: {dymki: {rodzaj: bool}, odpowiedzi: {firma: {runda: {…}}}}`.

Mistrz gry włącza i wyłącza rodzaje dymków (domyślnie wszystkie włączone, brak klucza – tak samo w starych grach)
i może to zmieniać w trakcie gry: ustawienie czyta się przy każdym wyliczeniu dymków, więc działa od następnego.
Własny filtr gracza to tylko widok (parametr zapytania API), niczego nie zapisuje.
"""
from __future__ import annotations

from ..dane import Dane


def rodzaje(dane: Dane) -> dict[str, str]:
    """Rodzaje dymków z dymki.yaml: {id: nazwa}."""
    return {k: v["nazwa"] for k, v in dane.wnetrza["dymki"]["rodzaje"].items()} if dane.wnetrza else {}


def ustawione(dane: Dane, konfiguracja: dict) -> dict[str, bool]:
    """Co mistrz gry włączył: {rodzaj: bool}; brak klucza – włączony."""
    zapis = (konfiguracja.get("wnetrza") or {}).get("dymki") or {}
    return {r: bool(zapis.get(r, True)) for r in rodzaje(dane)}


def wlaczone(dane: Dane, konfiguracja: dict) -> set[str]:
    return {r for r, w in ustawione(dane, konfiguracja).items() if w}


def ustaw(dane: Dane, konfiguracja: dict, zmiany: dict) -> dict[str, bool]:
    """Mistrz gry zmienia rodzaje dymków ({rodzaj: bool}, część rodzajów wystarczy). Nieznany rodzaj – ValueError."""
    znane = rodzaje(dane)
    if not znane:
        raise ValueError("Ta gra nie ma wnętrz.")
    for r, w in zmiany.items():
        if r not in znane:
            raise ValueError(f"Nie ma takiego rodzaju dymków: {r}.")
        if not isinstance(w, bool):
            raise ValueError(f"Rodzaj {r}: oczekiwano true albo false.")
    nowe = ustawione(dane, konfiguracja) | zmiany
    konfiguracja.setdefault("wnetrza", {})["dymki"] = nowe
    return nowe


def filtr_gracza(dane: Dane, parametr: str | None) -> set[str] | None:
    """Własny filtr gracza: lista rodzajów po przecinku („cena_smak,wos”; pusty tekst – żadnych); None – bez filtra.
    Nieznane rodzaje – ValueError."""
    if parametr is None:
        return None
    wybrane = {x.strip() for x in parametr.split(",") if x.strip()}
    nieznane = wybrane - set(rodzaje(dane))
    if nieznane:
        raise ValueError(f"Nie ma takiego rodzaju dymków: {', '.join(sorted(nieznane))}.")
    return wybrane
