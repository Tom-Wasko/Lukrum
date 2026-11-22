"""Ekran „Wyniki tygodnia” (Mój kebab) i spis pięter w portierni (podróż 03/wyniki, Z36 i Z38)."""
import re
from pathlib import Path

import pytest

from api.prezentacja import widok
from silnik.gra import Gra
from testy.aplikacja.test_swiat import _ekrany

STATIC = Path(__file__).resolve().parents[2] / "panel_gracza" / "static"
pytestmark = pytest.mark.dane_gry


def _tydzien(g):
    g.wyslij("A")
    g.wyslij("B")
    g.przelicz()


def test_runda_1_nie_ma_wynikow_tygodnia():
    g = Gra.nowa("t", [("A", None), ("B", None)], 6, 5)
    assert widok(g, "A").get("wyniki_tygodnia") is None


def test_dane_wynikow_po_pierwszym_i_drugim_tygodniu():
    g = Gra.nowa("t", [("A", None), ("B", None)], 6, 5)
    _tydzien(g)
    v = widok(g, "A")
    W, k = v["wyniki_tygodnia"], v["wyniki"]["kpir"]
    assert set(W["teraz"]) == {"sprzedaz", "koszty", "zysk"} and W["przed"] == {}
    assert (W["teraz"]["sprzedaz"], W["teraz"]["koszty"], W["teraz"]["zysk"]) == (k["przychody"], k["koszty"], k["dochod_netto"])
    assert W["liczba_firm"] == 2 and W["tydzien"] and W["miejsce_przed"] is None
    _tydzien(g)
    W2 = widok(g, "A")["wyniki_tygodnia"]
    assert W2["przed"] == W["teraz"]                      # porównanie ▲▼ z poprzednim tygodniem
    assert W2["miejsce"] in (1, 2) and W2["miejsce_przed"] in (1, 2)


def test_ekran_wynikow_jest_w_rejestrze_menu_i_kebabie():
    assert "wyniki_tygodnia" in _ekrany()
    index = (STATIC / "zakladki" / "index.js").read_text(encoding="utf-8")
    assert re.search(r'miejsce: "kebab",\s*pod: \[[^\]]*"wyniki_tygodnia"', index)
    miejsca = (STATIC / "swiat" / "miejsca.js").read_text(encoding="utf-8")
    assert 'klucz: "wyniki", cel: "wyniki_tygodnia"' in miejsca
    assert 'dodaj("wyniki"' in (STATIC / "swiat" / "sceny.js").read_text(encoding="utf-8")


def test_ekran_pokazuje_cztery_liczby_i_komunikat_z_rundy_1():
    js = (STATIC / "zakladki" / "wyniki.js").read_text(encoding="utf-8")
    for klucz in ("sprzedaz", "koszty", "zysk", "miejsce"):
        assert f'"{klucz}"' in js
    assert "Wyniki pojawią się po pierwszym tygodniu" in js and "▲" in js and "▼" in js


def test_portiernia_to_spis_pieter_z_przejsciem_do_windy():
    js = (STATIC / "swiat" / "sceny" / "zana_portiernia.js").read_text(encoding="utf-8")
    assert "SPIS PIĘTER" in js and 'wejscie: "winda_zana.html"' in js
    for scena in ("zana_drukarnia", "zana_radio", "zana_eventy", "zana_internet"):
        assert f'scena: "{scena}"' in js
