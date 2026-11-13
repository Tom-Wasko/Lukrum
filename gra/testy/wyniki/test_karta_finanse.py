"""Kalibracja finansów 7.11.2026: Z1 – nieruchomości w rozwoju firmy z wagą, B12 – mandaty obniżają dochód do karty."""

import copy
import math

import pytest
from pomocnicze import _gra, _lokal, _runda

from balans import warianty as wr
from silnik.boty import decyzje_bota
from silnik.dane import dane_domyslne
from silnik.gra import Gra
from silnik.model import Firma, SrodekTrwaly
from silnik.runda import _netto_karty, mandaty_rundy
from silnik.wyniki import karta as kw


def _dane(**zmiany):
    """Kopia danych zamrożonych ze zmianami w karta_wynikow (klucz → wartość; `waga` – rozwoj_firmy)."""
    d = copy.deepcopy(dane_domyslne())
    if "waga" in zmiany:
        d.z["karta_wynikow"]["rozwoj_firmy"]["waga_nieruchomosci"] = zmiany.pop("waga")
    d.z["karta_wynikow"].update(zmiany)
    return d


# --- Z1: waga nieruchomości w rozwoju firmy ---------------------------------------------------------------------

def test_majatek_karty_liczy_nieruchomosci_z_waga():
    f = Firma(nazwa="A", majatek=20000)
    f.srodki_trwale = [SrodekTrwaly(nazwa="Lokal: a", rodzaj="lokal", wartosc=300000, od_rundy=1, stawka=0.025,
                                    umorzenie=1000),
                       SrodekTrwaly(nazwa="Działka: b", rodzaj="grunt", wartosc=100000, od_rundy=1, stawka=0),
                       SrodekTrwaly(nazwa="Piec", rodzaj="sprzet", wartosc=12000, od_rundy=1, stawka=0.2)]
    assert kw.majatek_karty(f) == 20000 + 299000 + 100000
    assert kw.majatek_karty(f, 0.5) == 20000 + 0.5 * 399000     # sprzęt z ewidencji (w sumie inwestycji) bez wagi
    assert kw.majatek_karty(f, 0) == 20000


def test_waga_nieruchomosci_z_danych():
    assert kw.waga_nieruchomosci(dane_domyslne()) == 1           # dane zamrożone – jak przed 7.11
    assert kw.waga_nieruchomosci(_dane(waga=0.25)) == 0.25


def test_kupiony_lokal_podnosi_rozwoj_mniej_przy_wadze_a_zadluzenie_bez_zmian():
    wyniki = {}
    for waga in (1, 0.5):
        g = _gra(dane=_dane(waga=waga))
        _runda(g, A=_lokal("zygmuntowskie_1", "kupno"))
        s = _runda(g)
        wyniki[waga] = (s.wyniki[2]["A"]["karta"], s.firmy["A"])
    (k1, f), (k05, _) = wyniki[1], wyniki[0.5]
    p = dane_domyslne().z["karta_wynikow"]["rozwoj_firmy"]
    m1, m05 = kw.majatek_karty(f), kw.majatek_karty(f, 0.5)
    assert m1 > m05 > 0
    roznica = p["majatek"] * (math.log1p(m1 / p["majatek_skala"]) - math.log1p(m05 / p["majatek_skala"]))
    assert k1["rozwoj_firmy"] - k05["rozwoj_firmy"] == pytest.approx(roznica, abs=2e-3)
    assert k1["wskaznik_zadluzenia"] == k05["wskaznik_zadluzenia"]


# --- B12: mandaty w dochodzie do karty ----------------------------------------------------------------------------

def test_mandaty_rundy_skarbowe_biuro_bez_oc_i_sanepid():
    info = {"ksiegowosc": {"kara": 500.0}, "biuro": {"blad": {"kara": 200.0, "oc": False}},
            "magazyn": {"sanepid": {"mandat": 300.0}}}
    assert mandaty_rundy(info) == 1000
    info["biuro"]["blad"]["oc"] = True                           # biuro z OC oddaje mandat
    assert mandaty_rundy(info) == 800
    assert mandaty_rundy({"ksiegowosc": None, "biuro": {"blad": None}, "magazyn": {"sanepid": None}}) == 0


def test_netto_karty_odejmuje_mandaty_tylko_przy_wlaczonym_przelaczniku():
    info = {"harpagon_odsetki": {"odsetki": 50.0}, "ksiegowosc": {"kara": 500.0}}
    assert _netto_karty(_dane(mandaty_w_dochodzie=False), 3000, info) == 2950   # jak przed 7.11: tylko Harpagon
    assert _netto_karty(_dane(mandaty_w_dochodzie=True), 3000, info) == 2450


def _karta_z_mandatem(wlaczone: bool):
    """Samodzielna księgowość bez deklaracji – urząd rozlicza z urzędu z mandatem (test_biuro)."""
    g = Gra.nowa("biuro", [("H", None), ("B", "zrownowazony")], 8, 3, lokale=True,
                 dane=_dane(mandaty_w_dochodzie=wlaczone))
    for _ in range(5):
        d = decyzje_bota(g.dane, g.stan(), "H", "zrownowazony", g.runda, g.konfiguracja)
        d["biuro"] = "samodzielnie"
        g.ustaw_decyzje("H", d)
        g.przelicz(wymus=True)
    return g.stan().wyniki[g.runda - 1]["H"]


def test_mandat_za_brak_deklaracji_obniza_wynik_ekonomiczny_karty():
    wl, wyl = _karta_z_mandatem(True), _karta_z_mandatem(False)
    kara = wl["ksiegowosc"]["kara"]
    assert kara > 0 and wl["kpir"]["dochod_netto"] == wyl["kpir"]["dochod_netto"]   # KPiR i podatki bez zmian
    dz = dane_domyslne().z["karta_wynikow"]["wynik_ekonomiczny_dzielnik"]
    assert wyl["karta"]["wynik_ekonomiczny"] - wl["karta"]["wynik_ekonomiczny"] == pytest.approx(kara / dz, abs=2e-3)


@pytest.mark.dane_gry
def test_przelaczniki_w_danych_gry_i_sciezki_dla_wariantow():
    d = dane_domyslne()
    assert d.z["karta_wynikow"]["mandaty_w_dochodzie"] is True
    assert kw.waga_nieruchomosci(d) == 0.5
    w = wr.dane_ze_zmianami("z.karta_wynikow.mandaty_w_dochodzie=false;z.karta_wynikow.rozwoj_firmy.waga_nieruchomosci=1")
    assert w.z["karta_wynikow"]["mandaty_w_dochodzie"] is False and kw.waga_nieruchomosci(w) == 1
