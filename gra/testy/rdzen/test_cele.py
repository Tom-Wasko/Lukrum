"""Cel tygodnia od wujka (silnik/cele.py, dane/zeszyt.yaml: cele)."""
import pytest

from silnik import cele
from silnik.dane import Dane
from silnik.model import Firma

pytestmark = pytest.mark.dane_gry
LICZBA = 12


def _dane() -> Dane:
    return Dane()


def _w(dania=100, popyt=100, przychod=1000, dochod=50):
    return {"sprzedaz": {"kebab": {"sprzedaz": dania, "popyt": popyt, "przychod": przychod}},
            "kpir": {"dochod_netto": dochod}}


def test_brak_celu_w_tygodniu_1_i_cel_od_tygodnia_2():
    d = _dane()
    assert cele.cel_na_runde(d, 1, LICZBA) is None
    assert cele.cel_na_runde(d, 2, LICZBA)["id"] == "dania_2"
    assert cele.cel_na_runde(d, LICZBA, LICZBA)["id"] == "realiz_ostatni"   # ostatnia runda gry
    assert cele.cel_na_runde(d, 5, LICZBA, runda_startowa=4)["id"] == "dania_2"   # tydzień liczony od startu


def test_kazdy_tydzien_od_2_do_17_ma_cel_z_dopasowanym_progiem():
    d = _dane()
    for r in range(2, 18):
        c = cele.cel_na_runde(d, r, 30)
        assert c is not None and "{prog}" not in cele.tekst(c)
    assert cele.tekst(cele.cel_na_runde(d, 2, 30)) == "Sprzedajcie 150 dań"
    assert "80%" in cele.tekst(cele.cel_na_runde(d, 4, 30))


@pytest.mark.parametrize("cel, w, poprzednie, oczekiwane", [
    ({"typ": "dania", "prog": {"wartosc": 100}}, _w(dania=100), None, True),
    ({"typ": "dania", "prog": {"wartosc": 100}}, _w(dania=99), None, False),
    ({"typ": "realizacja", "prog": {"wartosc": 0.8}}, _w(dania=80, popyt=100), None, True),
    ({"typ": "realizacja", "prog": {"wartosc": 0.8}}, _w(dania=79, popyt=100), None, False),
    ({"typ": "realizacja", "prog": {"wartosc": 0.8}}, _w(dania=0, popyt=0), None, False),
    ({"typ": "dochod_plus"}, _w(dochod=1), None, True),
    ({"typ": "dochod_plus"}, _w(dochod=0), None, False),
    ({"typ": "wiecej_dan"}, _w(dania=101), _w(dania=100), True),
    ({"typ": "wiecej_dan"}, _w(dania=100), _w(dania=100), False),
    ({"typ": "wiecej_dan"}, _w(dania=500), None, False),
    ({"typ": "przychod_wiecej"}, _w(przychod=1001), _w(przychod=1000), True),
    ({"typ": "przychod_wiecej"}, _w(przychod=999), _w(przychod=1000), False),
])
def test_spelniony_dla_kazdego_typu(cel, w, poprzednie, oczekiwane):
    assert cele.spelniony(cel, w, poprzednie) is oczekiwane


def test_rozlicz_zapisuje_wynik_i_daje_nagrode_tylko_za_sukces():
    d = _dane()
    sukces, porazka = Firma(nazwa="A"), Firma(nazwa="B")
    w1, w2 = _w(dania=500), _w(dania=10)
    assert cele.rozlicz(d, sukces, 2, LICZBA, w1, None)["osiagniety"] is True
    assert cele.rozlicz(d, porazka, 2, LICZBA, w2, None)["osiagniety"] is False
    assert w1["cel"]["nagroda"] and w2["cel"]["nagroda"] is None
    assert len(sukces.efekty) == 1 and porazka.efekty == []
    e = sukces.efekty[0]
    n = d.zeszyt["cele"]["nagroda"]
    assert (e.typ, e.od_rundy, e.do_rundy) == ("popyt", 3, 3)
    assert e.wartosc == n["mnoznik_popytu"]["wartosc"] and 1 < e.wartosc <= 1.05   # mała nagroda
    assert cele.rozlicz(d, Firma(nazwa="C"), 1, LICZBA, _w(), None) is None   # tydzień 1: bez celu
