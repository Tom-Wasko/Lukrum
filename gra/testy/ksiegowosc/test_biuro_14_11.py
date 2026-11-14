"""Decyzje autora 14.11.2026 dla biur: Scrooge 6 zł i ostatnia runda, Asteroida bez limitu, opłata za zmianę biura,
obejścia opóźnienia zmiany pakietu u Józefa K. (silnik/ksiegowosc/biuro.py)."""
from copy import deepcopy

import pytest

from silnik.boty import decyzje_bota
from silnik.dane import dane_domyslne
from silnik.gra import Gra
from silnik.ksiegowosc import biuro as bo
from silnik.ksiegowosc.finanse import Ksiega, Rachunek

pytestmark = pytest.mark.dane_gry


@pytest.fixture(scope="module")
def dane():
    return dane_domyslne()


def _gra(rund=8, ziarno=3):
    return Gra.nowa("biuro", [("H", None), ("B", "zrownowazony")], rund, ziarno, lokale=True)


def _runda(g, biuro, pakiet="M"):
    d = decyzje_bota(g.dane, g.stan(), "H", "zrownowazony", g.runda, g.konfiguracja)
    d["biuro"], d["pakiet"] = biuro, pakiet
    g.ustaw_decyzje("H", d)
    g.przelicz(wymus=True)
    return g.stan().wyniki[g.runda - 1]["H"]


def _firma(biuro, **pola):
    f = deepcopy(_gra().stan().firmy["H"])
    f.biuro = biuro
    for k, v in pola.items():
        setattr(f, k, v)
    return f


def test_scrooge_doplata_6_zl_a_w_ostatniej_rundzie_przeniesione_dokumenty_sa_rozliczone(dane, monkeypatch):
    assert bo.biura(dane)["scrooge"]["zamkniete_w_swieta"]["doplata"] == 6.0
    monkeypatch.setattr(bo, "swieto_w_rundzie", lambda _d, _r: True)
    f = _firma("scrooge", dokumenty_przeniesione=5)
    o = bo.nalicz(dane, f, Ksiega(), Rachunek(), 0, 0, 12, ostatnia=True)   # ostatnia runda ze świętem
    assert not o["zamkniete"] and f.dokumenty_przeniesione == 0             # nic nie przepada
    assert o["za_swieta"] == round((5 + 1) * 6.0, 2)                         # przeniesione i dokumenty tygodnia, po 6 zł
    f2 = _firma("scrooge", dokumenty_przeniesione=5)
    o2 = bo.nalicz(dane, f2, Ksiega(), Rachunek(), 0, 0, 5)                  # w środku gry biuro jest zamknięte
    assert o2["zamkniete"] and f2.dokumenty_przeniesione == 5 + 1


def test_asteroida_nie_ma_doplat_za_dokumenty_a_jks_ma(dane):
    b = bo.biura(dane)
    for pakiet in bo.PAKIETY:
        o = bo.oplata(dane, b["asteroida_328"], 500, 0, 0, pakiet)
        assert o["ponad"] == 0 and o["za_dokumenty"] == 0 and o["ksiegowanie"] == o["ryczalt"]
        assert bo.oplata(dane, b["jks"], 500, 0, 0, pakiet)["za_dokumenty"] > 0


def test_oplata_za_zmiane_biura_tydzien_pakietu_nowego_biura(dane):
    def tydzien(biuro, pakiet):
        return dane.na_runde(bo.biura(dane)[biuro]["pakiety"][pakiet]["cena"])
    f = _firma("jks")
    o = bo.nalicz(dane, f, Ksiega(), Rachunek(), 0, 0, 2)
    assert o["zmiana_biura"] == 0 and f.ostatnie_biuro == "jks"                       # pierwszy wybór – bez opłaty
    assert bo.nalicz(dane, f, Ksiega(), Rachunek(), 0, 0, 3)["zmiana_biura"] == 0     # to samo biuro
    f.biuro = "jozef_k"
    ks = Ksiega()
    o = bo.nalicz(dane, f, ks, Rachunek(), 0, 0, 4)
    assert o["zmiana_biura"] == tydzien("jozef_k", "M") and f.ostatnie_biuro == "jozef_k"   # tydzień pakietu NOWEGO biura
    assert any("opłata za zmianę biura" in p["opis"] for p in ks.pozycje)             # dokument do KPiR jak inne opłaty
    assert o["razem"] == pytest.approx(o["ksiegowanie"] + o["kadry"] + o["zmiana_biura"], abs=0.01)
    f.biuro = "jks"                                                                   # powrót też płatny
    assert bo.nalicz(dane, f, Ksiega(), Rachunek(), 0, 0, 5)["zmiana_biura"] == tydzien("jks", "M")
    assert bo.nalicz(dane, f, Ksiega(), Rachunek(), 0, 0, 6)["zmiana_biura"] == 0


def test_zmiana_biura_w_grze_kosztuje_raz():
    g = _gra()
    assert _runda(g, "jks")["biuro"]["zmiana_biura"] == 0
    assert _runda(g, "jks")["biuro"]["zmiana_biura"] == 0
    w = _runda(g, "jozef_k")
    assert w["biuro"]["zmiana_biura"] > 0 and any("opłata za zmianę biura" in p["opis"] for p in w["kpir"]["pozycje"])
    assert _runda(g, "jozef_k")["biuro"]["zmiana_biura"] == 0


def test_jozef_k_pierwszy_wybor_rowny_domyslnemu_zapisuje_pakiet_i_zmiana_czeka():
    g = _gra()
    _runda(g, "jozef_k", "M")                                 # M to pakiet domyślny – wybór musi się zapisać
    assert g.stan().firmy["H"].pakiet_biura == "M"
    _runda(g, "jozef_k", "S")                                 # druga decyzja nie jest już „pierwszym wyborem”
    f = g.stan().firmy["H"]
    assert f.pakiet_biura == "M" and f.pakiet_nastepny == {"pakiet": "S", "od_rundy": g.runda - 1 + 2}


def test_wyjscie_do_innego_biura_i_powrot_nie_kasuje_opoznienia(dane):
    f = _firma("jozef_k", pakiet_biura="M")
    bo.ustaw_pakiet(dane, f, "S", 5)
    zapowiedz = dict(f.pakiet_nastepny)
    assert zapowiedz == {"pakiet": "S", "od_rundy": 7}
    f.biuro = "jks"                                            # wyjście do biura bez opóźnienia
    bo.ustaw_pakiet(dane, f, "M", 6)                           # to samo co obecny pakiet – zapowiedź zostaje
    assert f.pakiet_nastepny == zapowiedz and f.pakiet_biura == "M"
    bo.ustaw_pakiet(dane, f, "L", 6)                           # inna decyzja – zmienia cel, ale nie termin
    assert f.pakiet_biura == "M" and f.pakiet_nastepny == {"pakiet": "L", "od_rundy": 7}
    f.biuro = "jozef_k"                                        # powrót
    bo.ustaw_pakiet(dane, f, "L", 7)
    assert f.pakiet_biura == "M" and f.pakiet_nastepny == {"pakiet": "L", "od_rundy": 7}
    bo.wejscie_pakietu(f, 7)
    assert f.pakiet_biura == "L" and f.pakiet_nastepny is None
