"""Odblokowania w liście wujka: każdy element harmonogramu ma tekst, a ogłoszenie pojawia się w tygodniu z harmonogramu
tej gry (z przesunięciem mistrza gry), nie w tygodniu wpisanym w dane."""
import pytest

from api.prezentacja import widok
from silnik import harmonogram as hm
from silnik.dane import Dane
from silnik.gra import Gra

pytestmark = pytest.mark.dane_gry


def _gra(**opcje) -> Gra:
    return Gra.nowa("t", [("A", None), ("B", None)], 10, 5, **opcje)


def _ogloszone(g: Gra) -> dict[int, set[str]]:
    """{runda: klucze ogłoszeń} w całej grze (gra przeliczana do końca)."""
    wynik = {}
    for _ in range(g.konfiguracja["liczba_rund"]):
        wynik[g.runda] = {o["klucz"] for o in widok(g, "A")["zeszyt"]["odblokowania"]}
        if g.runda >= g.konfiguracja["liczba_rund"]:
            break
        g.wyslij("A")
        g.wyslij("B")
        g.przelicz()
    return wynik


def test_kazdy_element_harmonogramu_ma_tekst_i_miejsce():
    d = Dane()
    el, teksty = hm.elementy(d), d.zeszyt["odblokowania"]
    assert set(el) <= set(teksty), sorted(set(el) - set(teksty))
    assert set(teksty) <= set(el), sorted(set(teksty) - set(el))
    assert all(o["tekst"] and o["wnetrze"] for o in teksty.values())


def test_ogloszenie_w_tygodniu_z_harmonogramu():
    r = _ogloszone(_gra())
    assert "handel" in r[6] and not any("handel" in r[t] for t in r if t != 6)
    assert not r[1], "tydzień przygotowawczy bez ogłoszeń"
    assert "sprzedaz" in r[2] and "dostawcy_producent" in r[3]


def test_przesuniecie_mistrza_gry_przesuwa_ogloszenie():
    r = _ogloszone(_gra(odblokowanie={"handel": 3}))
    assert "handel" in r[3] and not any("handel" in r[t] for t in r if t != 3)


def test_ogloszenie_ma_miejsce_na_mapie():
    g = _gra()
    for _ in range(5):
        g.wyslij("A")
        g.wyslij("B")
        g.przelicz()
    o = widok(g, "A")["zeszyt"]["odblokowania"]
    assert o and all("▸" in x["gdzie"] and x["zeton"] and x["tekst"] for x in o)
