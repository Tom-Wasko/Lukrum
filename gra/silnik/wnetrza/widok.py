"""Wnętrze kebaba dla jednej drużyny: stan, dymki rundy i propozycja z odpowiedziami (dla API i, po scaleniu, rundy).

Wszystko liczone ze stanu gry po rundzie `biezaca` − 1 (`stan`), konfiguracji gry i danych, bez własnego zapisu poza
odpowiedziami drużyn (`propozycje.py`) i ustawieniami mistrza gry (`ustawienia.py`).
"""
from __future__ import annotations

from ..dane import Dane
from ..losowosc import strumien
from ..model import StanGry
from . import dymki as dy
from . import propozycje as pr
from . import stan as st
from . import ustawienia as us


def _kontekst(dane: Dane, stan: StanGry, konfiguracja: dict, firma: str, runda: int) -> dict:
    return st.kontekst(dane, stan, firma, runda, konfiguracja["ziarno"], konfiguracja["liczba_rund"])


def historia_bywalcow(dane: Dane, stan: StanGry, konfiguracja: dict, firma: str, biezaca: int) -> dict[str, int]:
    """Kiedy ostatnio mówił każdy bywalec: odtworzenie losowania rund 1…`biezaca` − 1 (bez filtrów rodzajów)."""
    wizyty, historia = [], {}
    for r in range(1, biezaca):
        wylosowane = dy.wylosowane(dane, st.wskazniki(dane, stan, firma, r), _kontekst(dane, stan, konfiguracja, firma, r),
                                   historia)
        wizyty.append((r, wylosowane))
        historia = dy.historia_bywalcow(wizyty)
    return historia


def dymki(dane: Dane, stan: StanGry, konfiguracja: dict, firma: str, biezaca: int) -> list[dict]:
    """Dymki rundy: bez rodzajów wyłączonych przez mistrza gry (gracz nie ma własnego filtra). Wujek zostaje zawsze."""
    return dy.dymki_rundy(dane, st.wskazniki(dane, stan, firma, biezaca), _kontekst(dane, stan, konfiguracja, firma, biezaca),
                          us.wlaczone(dane, konfiguracja), historia_bywalcow(dane, stan, konfiguracja, firma, biezaca))


def propozycja(dane: Dane, stan: StanGry, konfiguracja: dict, firma: str, biezaca: int) -> dict | None:
    """Propozycja rundy (cały opis z danych) albo None: brak, albo rodzaj „propozycje” wyłączony przez mistrza gry."""
    if "propozycje" not in us.wlaczone(dane, konfiguracja):
        return None
    return pr.propozycja_rundy(dane, konfiguracja["ziarno"], firma, biezaca,
                               lambda r: st.wskazniki(dane, stan, firma, r))


def propozycja_dla_gracza(dane: Dane, konfiguracja: dict, p: dict, firma: str, biezaca: int) -> dict:
    """Propozycja do pokazania: klient, treść, odpowiedzi (ze wskazówką kierunku skutków bez liczb; same skutki poznaje się po rundzie) i wybór drużyny;
    po odpowiedzi także reakcja klienta."""
    kto, imie = pr.nadawca(dane, p)
    zapis = pr.wybrana(konfiguracja, firma, biezaca)
    wybrana = zapis["odpowiedz"] if zapis and zapis["propozycja"] == p["id"] else None
    reakcja = next((o["reakcja"] for o in p["odpowiedzi"] if o["id"] == wybrana), None)
    return {"id": p["id"], "kto": kto, "imie": imie, "tekst": p["tekst"],
            "odpowiedzi": [{"id": o["id"], "tekst": o["tekst"], "wskazowka": o["wskazowka"]} for o in p["odpowiedzi"]],
            "wybrana": wybrana, "reakcja": reakcja, "domyslna": pr.zasady(dane)["bez_odpowiedzi"]}


def widok(dane: Dane, stan: StanGry, konfiguracja: dict, firma: str, biezaca: int,
          lokal: str | None = None) -> dict | None:
    """Wnętrze firmy w rundzie `biezaca` (None – gra bez wnętrz): {runda, rodzaje, wlaczone, stan, wskazniki, dymki,
    propozycja}."""
    if not dane.wnetrza:
        return None
    p = propozycja(dane, stan, konfiguracja, firma, biezaca)
    wsk = st.wskazniki(dane, stan, firma, biezaca)
    return {"runda": biezaca, "rodzaje": us.rodzaje(dane), "wlaczone": us.ustawione(dane, konfiguracja),
            "stan": st.stan_wnetrza(dane, stan, firma, lokal), "wskazniki": wsk,
            "dymki": dymki(dane, stan, konfiguracja, firma, biezaca),
            "propozycja": propozycja_dla_gracza(dane, konfiguracja, p, firma, biezaca) if p else None}


def skutki_rundy(dane: Dane, stan: StanGry, konfiguracja: dict, firma: str, runda: int) -> dict | None:
    """Skutki propozycji firmy w rundzie `runda`, do zastosowania przy przeliczeniu tej rundy: `stan` – stan po rundzie
    `runda` − 1 (jak w `przelicz_runde`). None – bez propozycji (albo rodzaj wyłączony). Wynik: {"propozycja",
    "odpowiedz", "udane", "skutki": {porcje, rabat, darmowe_porcje, koszt, opinia, ryzyko_kontroli, kandydat}}.
    Odpowiedź to wybór drużyny albo `bez_odpowiedzi`; rzut `szansa` ma własny strumień (deterministyczny)."""
    p = propozycja(dane, stan, konfiguracja, firma, runda) if dane.wnetrza else None
    if p is None:
        return None
    zapis = pr.wybrana(konfiguracja, firma, runda)
    o = pr.obowiazujaca(dane, p, zapis["odpowiedz"] if zapis and zapis["propozycja"] == p["id"] else None)
    los = strumien(konfiguracja["ziarno"], runda, "wnetrza", firma, "skutki", p["id"])
    skutki, udane = pr.rozstrzygnij(p, o, los)
    return {"propozycja": p["id"], "odpowiedz": o["id"], "udane": udane, "skutki": skutki}
