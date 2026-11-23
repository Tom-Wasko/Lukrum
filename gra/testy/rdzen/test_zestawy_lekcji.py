"""Zestawy funkcji pod 5 lekcji (dane/funkcje.yaml: zestawy): istnieją w kreatorze mistrza gry i dają grę,
którą bot przechodzi 3 rundy bez błędu."""

import pytest
from pomocnicze import DANE_GRY

from silnik import funkcje as fn
from silnik.dane import Dane
from silnik.gra import Gra

pytestmark = pytest.mark.dane_gry

LEKCJE = ["lekcja_1_zakladamy_firme", "lekcja_2_pierwsze_rachunki", "lekcja_3_klient_i_opinia",
          "lekcja_4_praca_i_prawo", "lekcja_5_bilans_sezonu"]


def test_zestawy_lekcji_sa_w_rejestrze_z_nazwa_i_opisem():
    d = Dane(DANE_GRY)
    for k in LEKCJE:
        z = fn.zestawy(d)[k]
        assert z["nazwa"] and z["opis"]
        assert set(fn.stany_zestawu(d, k)) == set(fn.rejestr(d))


def test_zestawy_lekcji_sa_w_kreatorze_mg():
    from panel_mg.widoki import _funkcje_kreatora
    w_kreatorze = {z["klucz"] for z in _funkcje_kreatora(Dane(DANE_GRY))["zestawy"]}
    assert set(LEKCJE) <= w_kreatorze


@pytest.mark.parametrize("zestaw", LEKCJE)
def test_bot_przechodzi_3_rundy_w_zestawie_lekcji(zestaw):
    g = Gra.nowa("t", [("A", "zrownowazony"), ("B", "zrownowazony")], 3, 7, dane=Dane(DANE_GRY), funkcje=zestaw)
    for _ in range(3):
        g.przelicz(wymus=True)
    assert g.konfiguracja["funkcje"] == fn.stany_zestawu(Dane(DANE_GRY), zestaw)
