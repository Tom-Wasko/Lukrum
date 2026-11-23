"""Zeszyt wujka w API: treść bieżącego tygodnia dla panelu (`v["zeszyt"]`) i zapis wizyt drużyny.

Treść jest w `dane/zeszyt.yaml` (schemat: `silnik/schematy.py: PlikZeszytu`). Panel liczy odhaczenie
zadań sam (`panel_gracza/static/pulpit/zeszyt-warunki.js`), a gra podaje mu to, czego z widoku
nie widać: listę wizyt w bieżącej rundzie i liczby do stron „gdzie co najlepiej kupić”
(najtańsi dostawcy, ceny sprzętu, banki, biura z bieżących danych).

Zapis wizyt (POST /api/gry/<id>/zeszyt/<firma>/wizyta): `api/wizyty.py`.
"""
from __future__ import annotations

import re

from silnik import cele
from silnik.dane import Dane
from silnik.harmonogram import PRZYGOTOWAWCZY
from silnik.kuchnia.dostawcy import info as info_dostawcy
from silnik.kuchnia.dostawcy import oferta_rundy
from silnik.kuchnia.menu import specjalne
from silnik.rynek.reklama import agencje, internetowa

SZABLON = re.compile(r"\{(\w+):([^{}]*)\}")
NBSP = " "


def _liczba(x) -> str:
    """Liczba do tekstu: ułamek poniżej 1 to procent, reszta z przecinkiem, tysiące po spacji."""
    if isinstance(x, bool) or not isinstance(x, (int, float)):
        return str(x)
    if isinstance(x, float) and 0 < abs(x) < 1:
        return f"{x * 100:g}".replace(".", ",") + "%"
    x = round(x, 2)
    if abs(x) >= 1000:
        return f"{x:,g}".replace(",", NBSP).replace(".", ",")
    return f"{x:g}".replace(".", ",")


def _cena(x: float) -> str:
    return f"{x:.2f}".replace(".", ",")


def _pole(wezel, sciezka: str):
    """Wartość po ścieżce z kropkami (`pakiety.M.cena`); klucze liczbowe też jako int."""
    for k in sciezka.split("."):
        if isinstance(wezel, list):
            wezel = wezel[int(k)]
        elif isinstance(wezel, dict):
            wezel = wezel[k] if k in wezel else wezel[int(k)]
        else:
            raise KeyError(sciezka)
    return wezel


class _Szablony:
    """Wstawia liczby i nazwy z bieżących danych w zdania stron „gdzie kupić” (składnia: yaml)."""

    def __init__(self, dane: Dane, ceny: dict):
        self.dane, self.ceny = dane, ceny
        mapa = dane.mapa or {}
        self.banki = {b["nazwa"]: b for b in (mapa.get("banki") or {}).get("banki", [])}
        self.biura = {b["id"]: b for b in (mapa.get("biura") or {}).get("biura", [])}

    def _cena_u(self, dostawca: str, zasob: str, jakosc: str) -> float | None:
        return ((self.ceny.get(dostawca) or {}).get(zasob) or {}).get(jakosc)

    def _opakowanie(self, zasob: str) -> str:
        return self.dane.zasoby[zasob]["typ_opakowania"]

    def najtanszy(self, zasob: str, jakosc: str) -> str:
        oferty = [(c, d) for d in self.ceny if (c := self._cena_u(d, zasob, jakosc)) is not None]
        if not oferty:
            return "brak oferty"
        cena, dostawca = min(oferty)
        return f"{dostawca} ({_cena(cena)} zł / {self._opakowanie(zasob)})"

    def cena(self, dostawca: str, zasob: str, jakosc: str) -> str:
        c = self._cena_u(dostawca, zasob, jakosc)
        return "brak oferty" if c is None else _cena(c)

    def roznica(self, a: str, b: str, zasob: str, jakosc: str) -> str:
        ca, cb = self._cena_u(a, zasob, jakosc), self._cena_u(b, zasob, jakosc)
        return "?" if ca is None or cb is None else _cena(abs(ca - cb))

    def dostawca(self, nazwa: str, pole: str) -> str:
        return _liczba(_pole(info_dostawcy(self.dane, nazwa), pole))

    def bank(self, nazwa: str, pole: str) -> str:
        return _liczba(_pole(self.banki[nazwa], pole))

    def biuro(self, id_: str, pole: str) -> str:
        return _liczba(_pole(self.biura[id_], pole))

    def wypelnij(self, tekst: str) -> str:
        def zamien(m: re.Match) -> str:
            try:
                return getattr(self, m.group(1))(*m.group(2).split(":"))
            except (AttributeError, KeyError, IndexError, TypeError, ValueError):
                return "?"
        return SZABLON.sub(zamien, tekst)


def _tabela_sprzetu(dane: Dane, liczba_rund: int) -> list[dict]:
    """Wiersze tabeli sprzętu: cena, utrzymanie miesięczne, koszt sezonu (z utrzymaniem)."""
    wiersze = []
    for nazwa, s in dane.sprzet.items():
        sezon = {q: round(c + s["utrzymanie"][q] * liczba_rund * 12 / 52)
                 for q, c in s["ceny"].items()}
        wiersze.append({"nazwa": nazwa, "dla": s["dla"], "ceny": s["ceny"],
                        "utrzymanie": s["utrzymanie"], "sezon": sezon})
    return wiersze


def _warunek(w) -> dict:
    nazwa, parametr = next(iter(w.items())) if isinstance(w, dict) else (w, None)
    return {"nazwa": nazwa, "parametr": parametr}


def _miejsca(dane: Dane) -> dict[str, str]:
    """Żeton → nazwa miejsca w mieście (budynki i zespoły z mapy)."""
    mapa = dane.mapa or {}
    wynik = {"lokal": "Mój kebab", "bazar": "Bazar"}
    for b in (mapa.get("budynki") or []) + (mapa.get("zespoly") or []):
        wynik.setdefault(b["id"], b["nazwa"])
    return wynik


def _zadanie(z: dict, v: dict, runda: int, stale: bool, miejsca: dict) -> dict | None:
    """Zadanie dla panelu albo None (funkcja wyłączona; element zablokowany bez zastępstwa)."""
    funkcja = (v.get("funkcje") or {}).get(z.get("funkcja") or "")
    if funkcja and funkcja["stan"] == "wylaczona":
        return None
    tekst, warunek = z["tekst"], z["warunek"]
    if z.get("element") and (v.get("harmonogram") or {}).get(z["element"], 0) > runda:
        if not z.get("zastepstwo"):
            return None
        tekst, warunek = z["zastepstwo"]["tekst"], z["zastepstwo"]["warunek"]
    wyszarzone = bool(funkcja and funkcja["stan"] == "zakryta" and not funkcja["aktywna"])
    return {"id": z["id"], "tekst": tekst, "kartka": z["kartka"], "zeton": z["zeton"],
            "punkt": z["punkt"], "gdzie": miejsca.get(z["zeton"], z["zeton"]),
            "warunek": _warunek(warunek), "czemu": z.get("czemu") or "",
            "stale": stale, "wyszarzone": wyszarzone}


def _strona(dane: Dane, tydzien: int, ostatni: bool) -> tuple[str, dict]:
    tygodnie = dane.zeszyt["tygodnie"]
    if ostatni:
        return "ostatni", tygodnie["ostatni"]
    numerowane = [k for k in tygodnie if isinstance(k, int)]
    klucz = min(max(tydzien, min(numerowane)), max(numerowane))
    return klucz, tygodnie[klucz]


def _odblokowania(dane: Dane, v: dict, runda: int, miejsca: dict) -> list[dict]:
    """Ogłoszenia odblokowań na `runda`: elementy, których tydzień w harmonogramie TEJ gry
    (z nadpisaniami mistrza gry) to właśnie ta runda. Tydzień przygotowawczy bez ogłoszeń.
    Pusta lista – gra bez lokali."""
    harmonogram = v.get("harmonogram") or {}
    if runda <= PRZYGOTOWAWCZY:
        return []
    return [{"klucz": k, "tekst": o["tekst"], "zeton": o["zeton"],
             "gdzie": f"{miejsca.get(o['zeton'], o['zeton'])} ▸ {o['wnetrze']}"}
            for k, o in dane.zeszyt["odblokowania"].items() if harmonogram.get(k) == runda]


def _poprzednie_zamowienia(gra, firma: str, runda: int) -> float:
    """Suma zamówionych opakowań w poprzedniej rundzie (do zadań „więcej / mniej towaru”)."""
    z = gra.decyzje.get(runda - 1, {}).get(firma, {}).get("zamowienia") or []
    return sum(x.get("ilosc") or 0 for x in z if isinstance(x, dict))


def _cel(gra, dane, firma: str, runda: int) -> dict | None:
    """Cel tygodnia na `runda` i wynik celu z poprzedniej rundy (silnik/cele.py), jeśli już jest."""
    liczba, start = gra.konfiguracja["liczba_rund"], gra.runda_startowa
    cel = cele.cel_na_runde(dane, runda, liczba, start)
    if cel is None:
        return None
    nagroda = dane.zeszyt["cele"]["nagroda"]["tekst"]
    wynik = None
    if runda > start:
        wynik = (gra.stan(runda - 1).wyniki.get(runda - 1) or {}).get(firma, {}).get("cel")
    return {"tekst": cele.tekst(cel), "nagroda": nagroda, "poprzedni": wynik}


def widok(gra, firma: str, runda: int, v: dict) -> dict | None:
    """Zeszyt wujka na `runda` (`v` z `funkcje` i `harmonogram`). None – dane bez zeszytu."""
    dane = gra.dane
    if not dane.zeszyt or not dane.mapa:
        return None
    z = dane.zeszyt
    liczba_rund = gra.konfiguracja["liczba_rund"]
    tydzien = runda - gra.runda_startowa + 1
    ostatni = runda == liczba_rund
    _, strona = _strona(dane, tydzien, ostatni)
    miejsca = _miejsca(dane)
    zadania = [x for t in strona["zadania"] if (x := _zadanie(t, v, runda, False, miejsca))]
    ids = {x["id"] for x in zadania}
    if tydzien >= z["stale"]["od_tygodnia"]["wartosc"]:
        for t in z["stale"]["zadania"]:
            od = (t.get("od_tygodnia") or {}).get("wartosc", 1)
            if t["id"] not in ids and tydzien >= od and (x := _zadanie(t, v, runda, True, miejsca)):
                zadania.append(x)
    konf = gra.konfiguracja
    ceny = oferta_rundy(dane, konf["ziarno"], max(runda, 2), konf.get("ceny_dostawcow", "dane"))[0]
    sz = _Szablony(dane, ceny)
    kupic = []
    for s in z["gdzie_kupic"]:
        tekst = s["tekst"]
        if s.get("od_tygodnia") and tydzien < s["od_tygodnia"]["wartosc"]:
            tekst = s.get("wczesniej") or tekst
        tabela = _tabela_sprzetu(dane, liczba_rund) if s.get("tabela") == "sprzet" else None
        kupic.append({"tytul": s["tytul"], "tekst": sz.wypelnij(tekst), "zeton": s["zeton"],
                      "gdzie": miejsca.get(s["zeton"], s["zeton"]), "tabela": tabela})
    wizyty = gra.decyzje.get(runda, {}).get("_zeszyt", {}).get(firma, [])
    dopisek = z["dopiski"][(max(tydzien, 1) - 1) % len(z["dopiski"])]
    return {"tydzien": tydzien, "ostatni": ostatni, "tytul": strona["tytul"],
            "list": strona.get("list") or "",
            "odblokowania": _odblokowania(dane, v, runda, miejsca),
            "zadania": zadania, "dopisek": dopisek,
            "gdzie_kupic": kupic, "wizyty": list(wizyty),
            "cel": _cel(gra, dane, firma, runda),
            "poprzednie_zamowienia": _poprzednie_zamowienia(gra, firma, runda),
            "specjalne": sorted(specjalne(dane)),
            "agencje_internetowe": sorted(a for a in agencje(dane) if internetowa(dane, a))}
