"""Kontrola PIP przy zleceniu jak etat (silnik/ludzie/kontrola_pip.py, decyzja autora 14.11.2026)."""
from copy import deepcopy

import pytest
from pomocnicze import _gra, _kandydat, _lokal, _runda, _z

from silnik.ksiegowosc.finanse import Rachunek
from silnik.ludzie import kontrola_pip as pip

pytestmark = pytest.mark.dane_gry


def _firma(umowa):
    g = _gra(("A", None), ("B", None))
    s = _runda(g, A={**_lokal("centrum_3"), "stanowiska": {"kuchnia": 2}}, B=_lokal("dworzec_1"))
    k = _kandydat(s, 1)
    s = _runda(g, A={"zatrudnij": [{**_z(k, 1), "umowa": umowa}]})
    f = deepcopy(s.firmy["A"])
    for p in f.pracownicy.values():
        p.tygodnie_jak_etat = 0                                  # liczymy od zera, niezależnie od rund startowych
    return g, f


def test_parametry_kontroli_i_gorsze_zadowolenie_zleceniobiorcy():
    z = _gra().dane.z
    assert z["pracownicy"]["kontrola_pip"]["prog_godzin"] == 30 and z["pracownicy"]["kontrola_pip"]["szansa"] == 0.05
    assert z["zadowolenie_osoby"]["wspolczynniki"]["umowa_zlecenie"] == -0.04


def test_zleceniobiorca_w_pelnym_wymiarze_po_czterech_tygodniach_grozi_kontrola(monkeypatch):
    g, f = _firma("zlecenie")
    z = g.dane.z["pracownicy"]["kontrola_pip"]
    monkeypatch.setitem(z, "szansa", 1.0)                       # pewna kontrola – sprawdzamy kiedy i ile
    rach = Rachunek()
    for tydzien in range(1, z["tygodni_z_rzedu"]):
        assert pip.koniec_rundy(g.dane, f, 10 + tydzien, 1, rach) is None   # za wcześnie
    w = pip.koniec_rundy(g.dane, f, 20, 1, rach)
    assert w["kontrola"] and w["kara"] == z["kara"] and w["tekst"]
    assert rach.operacje[-1]["rodzaj"] == "kary" and rach.operacje[-1]["kwota"] == -z["kara"]


def test_etatowiec_i_osoba_na_mniej_godzin_nie_ryzykuja(monkeypatch):
    g, f = _firma("prace")
    monkeypatch.setitem(g.dane.z["pracownicy"]["kontrola_pip"], "szansa", 1.0)
    for r in range(10, 20):
        assert pip.koniec_rundy(g.dane, f, r, 1, Rachunek()) is None   # umowa o pracę – nic do kontrolowania
    g, f = _firma("zlecenie")
    monkeypatch.setitem(g.dane.z["pracownicy"]["kontrola_pip"], "prog_godzin", 41)   # mniej godzin niż próg
    for r in range(10, 20):
        assert pip.koniec_rundy(g.dane, f, r, 1, Rachunek()) is None
    assert next(iter(f.pracownicy.values())).tygodnie_jak_etat == 0


def test_kontrola_jest_powtarzalna_z_ziarnem(monkeypatch):
    g, f = _firma("zlecenie")
    monkeypatch.setitem(g.dane.z["pracownicy"]["kontrola_pip"], "tygodni_z_rzedu", 1)

    def wyniki():
        ff = deepcopy(f)
        return [bool((pip.koniec_rundy(g.dane, ff, r, 7, Rachunek()) or {}).get("kontrola")) for r in range(1, 80)]
    a = wyniki()
    assert a == wyniki() and 0 < sum(a) < 25                      # ok. 5% z 79 tygodni
