"""Sprawy „na żywo” (poprawki 2): decyzje jednej drużyny widoczne dla innych jeszcze w tej samej rundzie.

Szkice decyzji wszystkich drużyn bieżącej rundy leżą w `gra.decyzje[runda]`, więc z nich liczymy:

- `znacznik(szkice, firma)` – skrót pól innych drużyn, które widać na żywo (licytacje lokali, zatrudnienia,
  handel). Panel odpytuje `api/gry/<id>/stan/<firma>` i przeładowuje widok, gdy znacznik się zmieni;
- `sprawdz_zapis(...)` – kontrole przy zapisie decyzji drużyny (np. przebicie oferty w licytacji,
  „kto pierwszy, ten lepszy” przy zatrudnianiu). Zwracają listę błędów; zapis z błędem jest odrzucony.

Moduły spraw rejestrują swoje pola (`POLA`) i kontrole (`kontrola`). Silnik przy przeliczeniu rundy ma
i tak własne zasady rozstrzygania sporów (boty, stare zapisy) – kontrole przy zapisie są pierwszym sitem.
"""
from __future__ import annotations

import hashlib
import json
from collections.abc import Callable

# klucze decyzji, które inne drużyny widzą na żywo (moduły mogą dopisać swoje)
POLA: list[str] = ["lokal", "przejecie", "zatrudnij", "podkup", "handel_wystaw", "handel_licytuj"]

# kontrola(dane, szkice, firma, nowe, stare, runda, opcje) -> lista błędów (tekst dla gracza);
# opcje["_stan"] – stan gry na początku rundy (StanGry), gdy wywołujący go podał (api: zapis decyzji)
Kontrola = Callable[..., list[str]]
KONTROLE: list[Kontrola] = []


def kontrola(f: Kontrola) -> Kontrola:
    """Dekorator: rejestruje kontrolę zapisu decyzji."""
    if f not in KONTROLE:
        KONTROLE.append(f)
    return f


def szkice_innych(szkice: dict, firma: str) -> dict[str, dict]:
    """Szkice decyzji pozostałych drużyn (bez kluczy technicznych `_…`)."""
    return {n: d for n, d in (szkice or {}).items()
            if n != firma and not str(n).startswith("_") and isinstance(d, dict)}


def znacznik(szkice: dict, firma: str) -> str:
    """Skrót pól na żywo innych drużyn – zmienia się, gdy ktoś przebije, zatrudni albo wystawi ogłoszenie."""
    czesci = [[n, {k: d[k] for k in POLA if d.get(k) not in (None, [], {})}]
              for n, d in sorted(szkice_innych(szkice, firma).items())]
    czesci = [c for c in czesci if c[1]]
    return hashlib.md5(json.dumps(czesci, sort_keys=True, default=str).encode()).hexdigest()[:12]


def sprawdz_zapis(dane, szkice: dict, firma: str, nowe: dict, stare: dict, runda: int,
                  opcje: dict | None = None, stan=None) -> list[str]:
    """Błędy zapisu decyzji `nowe` drużyny `firma` (poprzedni szkic: `stare`) względem szkiców innych drużyn.
    `stan` – stan gry na początku rundy; kontrole dostają go w `opcje["_stan"]` (np. ogłoszenia na giełdzie handlu)."""
    _zaladuj()
    if stan is not None:
        opcje = {**(opcje or {}), "_stan": stan}
    bledy: list[str] = []
    for k in KONTROLE:
        bledy += k(dane, szkice or {}, firma, nowe or {}, stare or {}, runda, opcje or {})
    return bledy


def _zaladuj() -> None:
    """Moduły z kontrolami rejestrują się przy imporcie – tu je importujemy (leniwie, bez cykli)."""
    import importlib

    for m in MODULY:
        importlib.import_module(m)


# moduły, które rejestrują kontrole (dopisz swój, gdy dodajesz kontrolę)
MODULY: list[str] = [
    "silnik.nieruchomosci.licytacja_jawna",
    "silnik.rynek.handel",
    "silnik.ludzie.rynek_pracy",
]
