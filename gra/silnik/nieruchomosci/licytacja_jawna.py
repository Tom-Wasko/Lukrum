"""Licytacja jawna lokali i budynków (poprawki 2): drużyny widzą na żywo najwyższą ofertę innych drużyn.

Szkice decyzji wszystkich drużyn bieżącej rundy (`gra.decyzje[runda]`, silnik/na_zywo.py) pokazują, kto prowadzi
w licytacji o dany lokal (`lokal`) albo budynek z najemcą (`przejecie`). Zasady:

- nowa albo zmieniona oferta musi być co najmniej o `krok_przebicia` (dane/mapa/lokale.yaml) wyższa od najwyższej
  oferty innych drużyn na ten sam lokal (kwotę zaokrąglamy w górę do pełnego złotego), nie niższa od ceny wywoławczej;
  wycofanie oferty jest zawsze dozwolone, a oferta niezmieniona (stary szkic) nie blokuje innych zapisów;
- oferty porównuje się jak przy rozstrzyganiu (silnik/nieruchomosci/przejecia.py): stosunek kwoty do ceny
  wywoławczej danej formy (czynsz przy najmie, cena przy kupnie);
- boty składają oferty dopiero przy przeliczeniu rundy – ich ofert nie widać na żywo.
"""
from __future__ import annotations

import math

from .. import na_zywo as nz
from .lokale import FORMY, oferta

RODZAJE = ("lokal", "przejecie")


def _zl(kwota: float) -> str:
    return f"{kwota:,.0f} zł".replace(",", " ")


def zasady(dane) -> dict | None:
    return dane.mapa["zasady"] if dane is not None and dane.mapa is not None else None


def oferta_szkicu(dane, d: dict | None, rodzaj: str, runda: int) -> dict | None:
    """Ważna oferta ze szkicu decyzji: {"id", "forma", "kwota", "wywolawcza", "stosunek"} (None – brak albo błędna)."""
    x = (d or {}).get(rodzaj)
    if not isinstance(x, dict) or not x.get("id"):
        return None
    lok = dane.lokale.get(x["id"])
    forma = "kupno" if rodzaj == "przejecie" else x.get("forma")
    if lok is None or forma not in FORMY:
        return None
    wyw = lok.get("czynsz") if forma == "najem" else lok.get("cena")
    if wyw is None:
        return None
    kwota, blad = oferta(dane, x, lok, forma, runda)
    if blad or kwota is None:
        return None
    return {"id": lok["id"], "forma": forma, "kwota": kwota, "wywolawcza": wyw, "stosunek": round(kwota / wyw, 4)}


def najwyzsza_innych(dane, szkice: dict, firma: str, rodzaj: str, lok_id: str, runda: int) -> tuple[str, dict] | None:
    """(drużyna, oferta) – najwyższa oferta innych drużyn na ten lokal; przy równych – pierwsza z nazw."""
    wynik = None
    for n, d in sorted(nz.szkice_innych(szkice, firma).items()):
        o = oferta_szkicu(dane, d, rodzaj, runda)
        if o and o["id"] == lok_id and (wynik is None or o["stosunek"] > wynik[1]["stosunek"]):
            wynik = (n, o)
    return wynik


def minimum(dane, lider: dict | None, wywolawcza: float) -> float:
    """Najmniejsza oferta, która przebija lidera (bez lidera – cena wywoławcza)."""
    if lider is None:
        return wywolawcza
    krok = zasady(dane)["krok_przebicia"]
    return max(wywolawcza, float(math.ceil(round(lider["stosunek"] * (1 + krok) * wywolawcza, 6))))


def nazwa_druzyny(szkice: dict, firmy: dict | None, n: str) -> str:
    return (szkice.get(n) or {}).get("nazwa") or (firmy[n].nazwa_wyswietlana if firmy and n in firmy else "") or n


@nz.kontrola
def przebicie(dane, szkice, firma, nowe, stare, runda, opcje) -> list[str]:
    """Nowa albo zmieniona oferta musi przebić najwyższą ofertę innych drużyn o krok."""
    z = zasady(dane)
    if z is None or "krok_przebicia" not in z or runda < z["licytacje_od_rundy"]:
        return []
    bledy = []
    for rodzaj in RODZAJE:
        nowa = oferta_szkicu(dane, nowe, rodzaj, runda)
        if nowa is None:
            continue   # wycofanie albo błędna oferta (tę odrzuci silnik)
        stara = oferta_szkicu(dane, stare, rodzaj, runda)
        if stara and (stara["id"], stara["forma"], stara["kwota"]) == (nowa["id"], nowa["forma"], nowa["kwota"]):
            continue
        lider = najwyzsza_innych(dane, szkice, firma, rodzaj, nowa["id"], runda)
        if lider is None:
            continue
        potrzeba = minimum(dane, lider[1], nowa["wywolawcza"])
        if nowa["kwota"] < potrzeba:
            lok = dane.lokale[nowa["id"]]
            bledy.append(f"{lok['nazwa']}: prowadzi {nazwa_druzyny(szkice, None, lider[0])} z ofertą {_zl(lider[1]['kwota'])}. "
                         f"Oferta {_zl(nowa['kwota'])} jest za niska – żeby ją przebić, trzeba dać co najmniej "
                         f"{_zl(potrzeba)} (o {z['krok_przebicia'] * 100:g}% więcej).")
    return bledy


def widok(dane, szkice: dict, firma: str, firmy: dict, runda: int) -> dict | None:
    """Widok licytacji na żywo dla panelu: {rodzaj: {lokal: {"lider": {"firma", "kwota", "forma"} | None,
    "prowadzisz": bool, "min": {forma: kwota}}}}. Lokale bez ofert są pominięte (panel: „Brak ofert”)."""
    z = zasady(dane)
    if z is None or "krok_przebicia" not in z or runda < z["licytacje_od_rundy"]:
        return None
    wynik: dict = {"krok": z["krok_przebicia"], "lokal": {}, "przejecie": {}}
    for rodzaj in RODZAJE:
        id_ofert = {o["id"] for n, d in szkice.items() if not str(n).startswith("_") and isinstance(d, dict)
                    if (o := oferta_szkicu(dane, d, rodzaj, runda))}
        for lok_id in sorted(id_ofert):
            lok = dane.lokale[lok_id]
            lider = najwyzsza_innych(dane, szkice, firma, rodzaj, lok_id, runda)
            moja = oferta_szkicu(dane, szkice.get(firma), rodzaj, runda)
            moja = moja if moja and moja["id"] == lok_id else None
            formy = ("kupno",) if rodzaj == "przejecie" else FORMY
            wynik[rodzaj][lok_id] = {
                "lider": {"firma": nazwa_druzyny(szkice, firmy, lider[0]), "kwota": lider[1]["kwota"],
                          "forma": lider[1]["forma"]} if lider else None,
                "prowadzisz": bool(moja and (lider is None or moja["stosunek"] > lider[1]["stosunek"])),
                "min": {f: minimum(dane, lider[1] if lider else None, lok["czynsz"] if f == "najem" else lok["cena"])
                        for f in formy if lok.get("czynsz" if f == "najem" else "cena") is not None}}
    return wynik
