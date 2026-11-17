"""Funkcje gry (seria „funkcje”): rejestr dane/funkcje.yaml, stany w konfiguracji gry,
odsłonięcia drużyn (historia – przeliczenie starej rundy daje to samo) i wyłączone elementy harmonogramu."""

import re

import pytest
from pomocnicze import DANE_GRY

from silnik import funkcje as fn
from silnik import harmonogram as hm
from silnik.dane import Dane, sprawdz
from silnik.gra import Gra

pytestmark = pytest.mark.dane_gry
ZAKLADKI = DANE_GRY.parent / "panel_gracza" / "static" / "zakladki"


def _dane() -> Dane:
    return Dane(DANE_GRY)


def _gra(funkcje=None, **opcje) -> Gra:
    return Gra.nowa("t", [("A", None), ("B", None), ("Bot", "zrownowazony")], 6, 7, dane=_dane(), funkcje=funkcje,
                    **opcje)


def test_rejestr_funkcji_i_zestawy():
    d = _dane()
    rej = fn.rejestr(d)
    assert len(rej) == 12 and {"zaopatrzenie", "marketing", "ksiegowosc", "urzedy", "gielda"} <= set(rej)
    assert set(fn.stany_zestawu(d, "pierwsza_gra").values()) == {"zakryta"}
    assert set(fn.stany_zestawu(d, "pelna_gra").values()) == {"odkryta"}
    kl = fn.stany_zestawu(d, "krotka_lekcja")   # decyzja autora 10.11
    assert {k for k, s in kl.items() if s == "wylaczona"} == {"handel", "harpagon", "gielda", "siec"}
    assert set(kl.values()) == {"zakryta", "wylaczona"}
    # K1: co przepada przy ponownym zakryciu – tylko w funkcjach, w których można coś kupić na dłużej
    assert {k for k, f in rej.items() if f.get("zakrycie")} == {"marketing", "wyposazenie", "rozwoj", "siec", "handel", "urzedy"}


def test_zakladki_funkcji_sa_w_menu_panelu():
    """Klucze zakładek funkcji istnieją w MENU panelu gracza (zakladki/index.js)."""
    menu = (ZAKLADKI / "index.js").read_text(encoding="utf-8")
    w_menu = set(re.findall(r'"([a-z_]+)"', menu[menu.index("export const MENU"):]))
    for k, f in fn.rejestr(_dane()).items():
        assert set(f["zakladki"]) <= w_menu, k


def test_sprawdz_wykrywa_zly_element(tmp_path):
    import shutil
    shutil.copytree(DANE_GRY, tmp_path / "dane")
    p = tmp_path / "dane" / "funkcje.yaml"
    p.write_text(p.read_text(encoding="utf-8").replace("elementy: [handel]", "elementy: [nie_ma_takiego]"),
                 encoding="utf-8")
    assert any("nie_ma_takiego" in b for b in sprawdz(tmp_path / "dane"))
    assert not sprawdz(DANE_GRY)


def test_stany_w_konfiguracji_nowej_gry():
    assert "funkcje" not in _gra().konfiguracja   # bez pola – wszystko odkryte (testy, pomiary)
    g = _gra("krotka_lekcja")
    assert g.konfiguracja["funkcje"]["handel"] == "wylaczona" and len(g.konfiguracja["funkcje"]) == 12
    g = _gra({"marketing": "odkryta"})   # brakujące – z zestawu domyślnego (pierwsza gra: zakryte)
    assert g.konfiguracja["funkcje"]["marketing"] == "odkryta" and g.konfiguracja["funkcje"]["handel"] == "zakryta"
    for zle in ({"nie_ma": "odkryta"}, {"handel": "ukryta"}, "nie_ma_zestawu", ["handel"]):
        with pytest.raises(ValueError):
            _gra(zle)


def test_stara_gra_bez_funkcji_wszystko_odkryte():
    konf = _gra().konfiguracja
    assert all(fn.stan(konf, k) == "odkryta" and fn.aktywna(konf, "A", k, 3) for k in fn.rejestr(_dane()))
    assert not fn.autopilot(konf, "A", "zaopatrzenie", 3)


def test_odslanianie_od_biezacej_rundy_z_historia():
    g = _gra("pierwsza_gra")
    k = g.konfiguracja
    assert fn.autopilot(k, "A", "zaopatrzenie", 1) and not fn.autopilot(k, "Bot", "zaopatrzenie", 1)   # bot: wszystko
    g.przelicz(wymus=True)   # runda 1
    g.odslon("A", "zaopatrzenie")
    assert fn.aktywna(k, "A", "zaopatrzenie", 2) and not fn.aktywna(k, "A", "zaopatrzenie", 1)   # historia
    assert fn.autopilot(k, "B", "zaopatrzenie", 2)   # inna drużyna – bez zmian
    g.odslon("A", "zaopatrzenie", False)   # zmiana zdania w tej samej rundzie – bez wpisu
    assert k["odsloniete"]["A"] == []
    g.odslon("A", "zaopatrzenie")
    g.przelicz(wymus=True)
    g.odslon("A", "zaopatrzenie", False)   # znów zakryta od rundy 3
    assert k["odsloniete"]["A"] == [[2, "zaopatrzenie", True], [3, "zaopatrzenie", False]]
    assert fn.aktywna(k, "A", "zaopatrzenie", 2) and fn.autopilot(k, "A", "zaopatrzenie", 3)


def test_odslonic_mozna_tylko_zakryta_funkcje_druzyny():
    g = _gra("krotka_lekcja")
    for firma, f in (("A", "handel"), ("Bot", "marketing"), ("Nikt", "marketing"), ("A", "nie_ma")):
        with pytest.raises(ValueError):
            g.odslon(firma, f)
    g = _gra({"marketing": "odkryta"})
    with pytest.raises(ValueError, match="zakrył"):
        g.odslon("A", "marketing")


def test_wylaczona_funkcja_wylacza_elementy_harmonogramu():
    g = _gra("krotka_lekcja")   # handel i sieć lokali wyłączone
    el = hm.elementy(g.dane)
    wyl = fn.elementy_wylaczone(g.dane, g.konfiguracja, el)
    assert {"handel", "licytacje", "przejecia"} <= wyl and "promocje" not in wyl
    assert all(g.dane.nadpisane_rundy[e] == 7 for e in wyl)   # liczba_rund + 1 – „wyłączone”
    g = _gra({**fn.stany_zestawu(_dane(), "pelna_gra"), "marketing": "wylaczona"})
    wyl = fn.elementy_wylaczone(g.dane, g.konfiguracja, el)
    assert {"promocje", "internet"} <= wyl and any(e.startswith("reklama_") for e in wyl)
    assert all(e in wyl for e in el if e.startswith("reklama_"))
