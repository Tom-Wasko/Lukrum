"""Zmiana zestawu funkcji w trakcie gry (Z46): tylko odsłania, przeliczone rundy się nie zmieniają."""

import pytest
from pomocnicze import DANE_GRY

from silnik import funkcje as fn
from silnik.dane import Dane
from silnik.gra import Gra

pytestmark = pytest.mark.dane_gry
L1, L2 = "lekcja_1_zakladamy_firme", "lekcja_2_pierwsze_rachunki"


def _gra(zestaw=L1, rund=6):
    return Gra.nowa("t", [("A", "zrownowazony"), ("B", "zrownowazony")], rund, 7, dane=Dane(DANE_GRY), funkcje=zestaw)


def test_przelaczenie_odslania_nowe_i_nie_chowa_odkrytych():
    g = _gra()
    for _ in range(2):
        g.przelicz(wymus=True)
    assert fn.stan(g.konfiguracja, "zaopatrzenie") == "zakryta"
    wynik = g.ustaw_zestaw(L2)
    assert wynik["odsloniete"] == ["zaopatrzenie"] and wynik["zostaja"] == []
    assert fn.stan(g.konfiguracja, "zaopatrzenie") == "odkryta"
    for _ in range(2):
        g.przelicz(wymus=True)
    assert g.runda == 5
    # z powrotem na lekcję 1: zaopatrzenie miałoby wrócić do zakrytej – zostaje odkryte i jest ostrzeżenie
    wynik = g.ustaw_zestaw(L1)
    assert wynik["odsloniete"] == [] and wynik["zostaja"] == ["zaopatrzenie"]
    assert fn.stan(g.konfiguracja, "zaopatrzenie") == "odkryta"


def test_stare_rundy_licza_sie_tak_samo_po_zmianie():
    g = _gra()
    for _ in range(2):
        g.przelicz(wymus=True)
    przed = g.stan(2).firmy["A"].gotowka
    g.ustaw_zestaw(L2)
    g.przelicz(wymus=True)
    assert fn.stan(g.konfiguracja, "zaopatrzenie", 2) == "zakryta"
    g2 = Gra(g.konfiguracja, g.decyzje, Dane(DANE_GRY))   # jak po wczytaniu z bazy: przeliczenie od początku
    assert g2.stan(2).firmy["A"].gotowka == przed


def test_wylaczona_funkcja_zmieniona_na_odkryta_otwiera_elementy_od_rundy_zmiany():
    d = Dane(DANE_GRY)
    g = Gra.nowa("t", [("A", "zrownowazony")], 6, 7, dane=d, funkcje="lekcja_1_zakladamy_firme")
    g.przelicz(wymus=True)
    g.przelicz(wymus=True)
    assert fn.wylaczona(g.konfiguracja, "handel")
    g.ustaw_zestaw("pelna_gra")   # runda 3
    assert fn.stan(g.konfiguracja, "handel") == "odkryta" and fn.od_rundy_dostepna(g.konfiguracja, "handel") == 3
    from silnik import harmonogram as hm
    el = hm.elementy(g.dane)
    otwarte = fn.elementy_otwarte_w_grze(g.dane, g.konfiguracja, el)
    assert otwarte and set(otwarte.values()) == {3}
    assert all(g.dane.nadpisane_rundy[e] >= 3 and g.dane.nadpisane_rundy[e] <= 6 for e in otwarte)
    g.przelicz(wymus=True)
    g.przelicz(wymus=True)


def test_odrzucenia():
    g = _gra(rund=1)
    with pytest.raises(ValueError, match="Nie ma takiego zestawu"):
        g.ustaw_zestaw("nie_ma")
    g.decyzje.setdefault(1, {})["_przeliczona"] = True
    with pytest.raises(ValueError, match="liczona|zakończona"):
        g.ustaw_zestaw(L2)
    g.decyzje[1].pop("_przeliczona")
    g.przelicz(wymus=True)
    with pytest.raises(ValueError, match="zakończona"):
        g.ustaw_zestaw(L2)
