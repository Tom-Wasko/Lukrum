"""Tłok obniża opinię, wyposażenie ją podnosi – bez podwójnego liczenia (silnik/rynek/opinie.py)."""
from __future__ import annotations

import pytest

from silnik.dane import dane_domyslne
from silnik.rynek import opinie as op

dane_gry = pytest.mark.dane_gry
BULKA = "kebab_w_bulce"


def _ocena(dane, obciazenie=None, **oferta):
    lok = next(i for i, x in dane.lokale.items() if x["strefa"] == "centrum")
    cena = dane.uslugi[BULKA]["cena_preferowana"] * dane.mapa["popyt"]["strefy"]["centrum"]["cena"]
    o = {"strefa": "centrum", "cena": cena, "jakosc": (2, 2, 2), **oferta}
    ob = {"obsluzeni": {BULKA: 100}, "kolejka": 0, "brak": 0, "pomylki": 0}
    if obciazenie is not None:
        ob["obciazenie"] = obciazenie
    wynik = {"popyt": 100, "grupy": {"studenci": 100}, "obsluga": ob}
    return op.ocena_tygodnia(dane, lok, wynik, {BULKA: o})


@dane_gry
def test_tlok_obniza_ocene_dopiero_ponad_progiem():
    dane = dane_domyslne()
    u = op.ustawienia(dane)
    baza = _ocena(dane)[0]
    assert _ocena(dane, [u["tlok_prog"]] * 7)[0] == pytest.approx(baza)   # na progu bez kary
    assert _ocena(dane, [0.5] * 7)[0] == pytest.approx(baza)
    lekko, pelny = _ocena(dane, [0.95] * 7), _ocena(dane, [1.0] * 7)
    assert baza > lekko[0] > pelny[0]
    assert baza - pelny[0] < 0.5   # kara łagodna: „lekko spada”


@dane_gry
def test_wyposazenie_podnosi_ocene_a_tlok_jest_osobnym_skladnikiem():
    dane = dane_domyslne()
    bez, z = _ocena(dane, [1.0] * 7), _ocena(dane, [1.0] * 7, wyposazenie=1.1)
    assert z[0] > bez[0]
    assert z[1]["wyposazenie"] > bez[1]["wyposazenie"] == 0
    assert z[1]["tlok"] == bez[1]["tlok"]   # wyposażenie nie zmienia kary za tłok
    # udogodnienia (benefity załogi) nie wchodzą do oceny wprost: liczą się raz, przez nastrój i pracę załogi
    assert set(z[1]) == {"jakosc", "cena", "kolejka", "tlok", "brak", "pomylki", "wyposazenie"}


@dane_gry
def test_obciazenie_dnia_to_najbardziej_zajete_stanowisko_ucięte_do_1():
    o = {"potrzebne_kasy": 3.0, "pojemnosc_kasy": 4.0, "potrzebne_stanowisk": {1: 5.0, 2: 9.0},
         "pojemnosc_stanowisk": {1: 10.0, 2: 6.0}}
    assert op.obciazenie_dnia(o) == 1.0
    assert op.obciazenie_dnia({**o, "potrzebne_stanowisk": {1: 5.0}}) == 0.75
