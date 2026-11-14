"""Wybór dymków przy ladzie (dane/wnetrza/dymki.yaml, bywalcy.yaml). Funkcje czyste i deterministyczne.

Losowanie: strumień (ziarno gry, runda, „wnetrza”, firma) – ten sam stan daje te same dymki. Silnik losuje `dymkow_na_runde`
dymków spośród tych, których warunki `gdy` są spełnione (wskaźnik, którego nie ma w wyniku, nie spełnia warunku), z zasadami
z pliku: bywalec mówi najwyżej raz na rundę i raz na `bywalec_co_rund` rund (nie przed swoim `od_rundy`), zaczepek WOS jest
najwyżej `wos_na_runde` i tylko zatwierdzonych (`sprawdzone: true`). Dymek bywalca z `dba_o` pasującym do tematu dymka
(wskaźniki z `gdy`, bez `gdy` – „runda”) ma większą wagę (`waga_dba_o`). Dymek „kazdy” mówi bywalec z szansą
`udzial_bywalcow`, inaczej anonimowy gość. Wujek wchodzi dodatkowo, tylko przy swojej okazji (kontekst: `okazje`).

Gdy w rundzie jest zdarzenie w parku (kontekst `park`), pierwszy dymek jest plotką o nim (o ile jest taka plotka
i bywalec może ją powiedzieć), więc plotka przychodzi razem ze zdarzeniem na mapie.

Rodzaje wyłączone przez mistrza gry odpadają dopiero po losowaniu (`dymki_rundy`), więc przełączenie rodzaju
nie zmienia tego, kto i kiedy przychodzi (historia bywalców – `wylosowane`). Wujek nie podlega filtrom rodzajów.
"""
from __future__ import annotations

import re

from ..dane import Dane
from ..losowosc import Strumien, strumien
from .schematy import KTO_OGOLNIE, WUJEK

# pierwszeństwo okazji, gdy kilka naraz (wujek mówi najwyżej raz na rundę)
PIERWSZENSTWO_OKAZJI = ("ostatnia_runda", "pierwsza_strata", "rekord", "start")
TEMAT_BEZ_WARUNKU = "runda"


def _spelnia(gdy: dict, wskazniki: dict) -> bool:
    for w, z in gdy.items():
        x = wskazniki.get(w)
        if x is None or (z["od"] is not None and x < z["od"]) or (z["do"] is not None and x >= z["do"]):
            return False
    return True


def _liczba(x: float, miejsca: int) -> str:
    return f"{x:.{miejsca}f}".replace(".", ",")


def pola_tekstu(wskazniki: dict) -> dict[str, str]:
    """Pola `{cena}`, `{cena_strefy}`, `{ocena}`, `{zmiana_ceny}` (kwoty po przecinku, zmiana ceny bez znaku)."""
    p = {}
    for k in ("cena", "cena_strefy"):
        if k in wskazniki:
            p[k] = _liczba(wskazniki[k], 2)
    if "ocena" in wskazniki:
        p["ocena"] = _liczba(wskazniki["ocena"], 1)
    if "zmiana_ceny" in wskazniki:
        p["zmiana_ceny"] = str(round(abs(wskazniki["zmiana_ceny"])))
    return p


def _pola_dymka(d: dict) -> set[str]:
    return set(re.findall(r"\{(\w+)\}", d["tekst"]))


def _kandydaci(dane: Dane, wskazniki: dict, kontekst: dict) -> list[tuple[int, dict]]:
    """Dymki, które mogą paść w tej rundzie: warunki spełnione, dane do pól tekstu są, WOS zatwierdzony."""
    pola = pola_tekstu(wskazniki)
    wynik = []
    for i, d in enumerate(dane.wnetrza["dymki"]["dymki"]):
        if d["okazja"] or d["kto"] == WUJEK:
            continue
        if d["rodzaj"] == "wos" and d["sprawdzone"] is not True:
            continue
        if not _spelnia(d["gdy"], wskazniki):
            continue
        dozwolone = set(pola)
        if d["zrodlo"]:
            lista = kontekst.get(d["zrodlo"]) or []
            if not lista:   # plotka bez danych z miasta odpada
                continue
            dozwolone |= set(lista[0])
        if not _pola_dymka(d) <= dozwolone:
            continue
        wynik.append((i, d))
    return wynik


def _wazyj(los: Strumien, wagi: list[float]) -> int:
    """Indeks wybrany z prawdopodobieństwem proporcjonalnym do wag."""
    x = float(los.random()) * sum(wagi)
    for i, w in enumerate(wagi):
        x -= w
        if x < 0:
            return i
    return len(wagi) - 1


def _tematy(d: dict) -> set[str]:
    return set(d["gdy"]) or {TEMAT_BEZ_WARUNKU}


def _wypowiedz(dane: Dane, d: dict, kto: str, imie: str, pola: dict, kontekst: dict, los: Strumien) -> dict:
    wartosci = dict(pola)
    if d["zrodlo"]:
        lista = kontekst[d["zrodlo"]]
        wartosci |= lista[int(los.integers(len(lista)))]
    wynik = {"rodzaj": d["rodzaj"], "kto": kto, "imie": imie, "tekst": d["tekst"].format_map(wartosci)}
    for k in ("wyjasnienie", "zrodlo_prawne", "sprawdzil"):
        if d.get(k):
            wynik[k] = d[k]
    if d.get("cytat"):   # informacja o cytacie tylko, gdy to dosłowny cytat z lektury
        wynik["cytat"] = True
        if d.get("cytat_zrodlo"):
            wynik["cytat_zrodlo"] = d["cytat_zrodlo"]
    return wynik


def wylosowane(dane: Dane, wskazniki: dict, kontekst: dict, historia: dict[str, int]) -> list[dict]:
    """Dymki rundy przed filtrami rodzajów (z wujkiem na początku, gdy ma okazję). `historia` – {id bywalca: ostatnia
    runda, w której mówił} (bez wujka). Każdy dymek: rodzaj, kto (id bywalca albo „gosc”), imie, tekst, a dla WOS
    wyjasnienie i zrodlo_prawne."""
    if not dane.wnetrza:
        return []
    zasady = dane.wnetrza["dymki"]["zasady"]
    ust = dane.wnetrza["silnik"]["dymki"]
    runda = kontekst["runda"]
    bywalcy = {b["id"]: b for b in dane.wnetrza["bywalcy"]["bywalcy"]}
    los = strumien(kontekst["ziarno"], runda, "wnetrza", kontekst["firma"], "dymki")
    pola = pola_tekstu(wskazniki)
    wynik = []

    okazja = next((o for o in PIERWSZENSTWO_OKAZJI if o in kontekst.get("okazje", [])), None)
    if okazja and WUJEK in bywalcy:
        wujek = [d for d in dane.wnetrza["dymki"]["dymki"] if d["kto"] == WUJEK and d["okazja"] == okazja]
        if wujek:
            d = wujek[int(los.integers(len(wujek)))]
            wynik.append(_wypowiedz(dane, d, WUJEK, bywalcy[WUJEK]["imie"], pola, kontekst, los))

    kandydaci = _kandydaci(dane, wskazniki, kontekst)
    mowili: set[str] = set()
    wos = 0
    ile = int(los.integers(zasady["dymkow_na_runde"][0], zasady["dymkow_na_runde"][1] + 1))

    def moze(id_: str) -> bool:
        b = bywalcy.get(id_)
        return bool(b and not b["specjalny"] and b["od_rundy"] <= runda and id_ not in mowili
                    and runda - historia.get(id_, runda - zasady["bywalec_co_rund"]) >= zasady["bywalec_co_rund"])

    for n in range(ile):
        mozliwe = [(i, d) for i, d in kandydaci
                   if not (d["rodzaj"] == "wos" and wos >= zasady["wos_na_runde"])
                   and (d["kto"] in KTO_OGOLNIE or moze(d["kto"]))]
        if not mozliwe:
            break
        if n == 0:   # plotka o parku pada w tej samej rundzie co zdarzenie na mapie, nie dopiero przy innym losowaniu
            parkowe = [(i, d) for i, d in mozliwe if d["zrodlo"] == "park"]
            mozliwe = parkowe or mozliwe
        wagi = [ust["waga_dba_o"] if d["kto"] in bywalcy and _tematy(d) & set(bywalcy[d["kto"]]["dba_o"]) else 1.0
                for _, d in mozliwe]
        i, d = mozliwe[_wazyj(los, wagi)]
        kandydaci = [(j, x) for j, x in kandydaci if j != i]
        kto = d["kto"]
        if kto == "kazdy":
            wolni = [b for b in bywalcy if moze(b)]
            if wolni and float(los.random()) < zasady["udzial_bywalcow"]:
                w = [ust["waga_dba_o"] if _tematy(d) & set(bywalcy[b]["dba_o"]) else 1.0 for b in wolni]
                kto = wolni[_wazyj(los, w)]
            else:
                kto = "gosc"
        imie = ust["gosc"] if kto == "gosc" else bywalcy[kto]["imie"]
        if kto != "gosc":
            mowili.add(kto)
        wos += d["rodzaj"] == "wos"
        wynik.append(_wypowiedz(dane, d, kto, imie, pola, kontekst, los))
    return wynik


def dymki_rundy(dane: Dane, wskazniki: dict, kontekst: dict, wlaczone: set[str] | None,
                historia: dict[str, int]) -> list[dict]:
    """Dymki do pokazania: `wylosowane` bez rodzajów wyłączonych (`wlaczone` – zbiór rodzajów; None – wszystkie).
    Dymki wujka zostają zawsze."""
    return [x for x in wylosowane(dane, wskazniki, kontekst, historia)
            if wlaczone is None or x["kto"] == WUJEK or x["rodzaj"] in wlaczone]


def historia_bywalcow(wizyty: list[tuple[int, list[dict]]]) -> dict[str, int]:
    """Ostatnia runda wizyty każdego bywalca (bez wujka i gości) z wylosowanych dymków kolejnych rund:
    [(runda, dymki), …]."""
    h: dict[str, int] = {}
    for runda, dymki in wizyty:
        for x in dymki:
            if x["kto"] not in (WUJEK, "gosc"):
                h[x["kto"]] = runda
    return h


__all__ = ["dymki_rundy", "historia_bywalcow", "pola_tekstu", "wylosowane"]
