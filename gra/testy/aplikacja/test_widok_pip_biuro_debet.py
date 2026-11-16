"""Widok panelu: kontrola PIP, opłata za zmianę biura i przejęcie debetu (decyzje autora 14.11.2026)."""
from copy import deepcopy

import pytest
from pomocnicze import _gra, _kandydat, _lokal, _runda, _z

from api import prezentacja as pr
from silnik.dane import dane_domyslne
from silnik.ksiegowosc import biuro as bo
from silnik.pieniadze import banki as bk

pytestmark = pytest.mark.dane_gry


def _firma_zlecenie():
    g = _gra(("A", None), ("B", None))
    s = _runda(g, A={**_lokal("centrum_3"), "stanowiska": {"kuchnia": 2}}, B=_lokal("dworzec_1"))
    k = _kandydat(s, 1)
    s = _runda(g, A={"zatrudnij": [{**_z(k, 1), "umowa": "zlecenie"}]})
    return g, deepcopy(s.firmy["A"])


def test_widok_pip_pokazuje_osobe_na_zleceniu_jak_etat_z_liczbami_z_danych():
    g, f = _firma_zlecenie()
    z = g.dane.z["pracownicy"]["kontrola_pip"]
    p = next(iter(f.pracownicy.values()))
    p.tygodnie_jak_etat = z["tygodni_z_rzedu"] - 1               # ta runda dopełni serię
    w = pr._pip(g.dane, f)
    assert (w["prog_godzin"], w["tygodni_z_rzedu"], w["szansa"], w["kara"]) == (
        z["prog_godzin"], z["tygodni_z_rzedu"], z["szansa"], z["kara"])
    o = w["osoby"][p.id]
    assert o["tygodnie"] == z["tygodni_z_rzedu"] and o["ryzyko"] and o["godziny"] >= z["prog_godzin"]
    p.tygodnie_jak_etat = 0
    assert not pr._pip(g.dane, f)["osoby"][p.id]["ryzyko"]       # dopiero zbliża się do progu


def test_widok_pip_pomija_etat_i_dane_bez_kontroli(monkeypatch):
    g, f = _firma_zlecenie()
    p = next(iter(f.pracownicy.values()))
    p.umowa = "prace"
    assert pr._pip(g.dane, f)["osoby"] == {}
    monkeypatch.delitem(g.dane.z["pracownicy"], "kontrola_pip")
    assert pr._pip(g.dane, f) is None


def test_widok_biur_zawiera_oplate_zmiany_jak_silnik():
    g = _gra(("A", None), ("B", None))
    _runda(g, A={**_lokal("centrum_3"), "biuro": "jks"}, B=_lokal("dworzec_1"))
    _runda(g, A={"biuro": "jks"})
    K = pr.widok(g, "A")["ksiegowosc"]
    assert K["ostatnie_biuro"] == "jks"
    for b in K["oferty"]:
        for pakiet in bo.PAKIETY:
            oczekiwana = 0.0 if b["id"] == "jks" else round(g.dane.na_runde(b["pakiety"][pakiet]["cena"])
                                                            * g.dane.mapa["biura"]["zmiana_biura"]["tygodni_pakietu"], 2)
            assert b["oplata_zmiany"][pakiet] == oczekiwana


def test_widok_biur_bez_wyboru_nie_ma_oplat():
    g = _gra(("A", None), ("B", None))
    K = pr.widok(g, "A")["ksiegowosc"]
    assert K["ostatnie_biuro"] is None
    assert all(x == 0 for b in K["oferty"] for x in b["oplata_zmiany"].values())


def test_widok_banku_przejecie_debetu_z_oplata_z_silnika():
    dane = dane_domyslne()
    g = _gra(("A", None), ("B", None))
    _runda(g, A={**_lokal("centrum_3"), "bank": "Kmicic"}, B=_lokal("dworzec_1"))
    assert pr.widok(g, "A")["banki"]["przejecie_debetu"] is None   # bez debetu – brak informacji
    f = g.stan(g.runda - 1).firmy["A"]                             # stan na początku rundy (zapamiętany w grze)
    f.debet, f.gotowka = 1000.0, 0.0
    d = pr.widok(g, "A")["banki"]["przejecie_debetu"]
    assert d == {"debet": 1000.0, "gotowka": 0.0, "oplata": bk.oplata_przejecia_debetu(dane, 1000.0)}
    assert d["oplata"] > 0
