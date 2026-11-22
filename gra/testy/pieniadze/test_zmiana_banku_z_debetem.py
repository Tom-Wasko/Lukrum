"""Zmiana banku z otwartym debetem (decyzja autora 14.11.2026, silnik/pieniadze/banki.py)."""
from copy import deepcopy

import pytest
from pomocnicze import _gra, _lokal, _runda

from silnik.dane import dane_domyslne
from silnik.ksiegowosc.finanse import Ksiega, Rachunek
from silnik.pieniadze import banki as bk

pytestmark = pytest.mark.dane_gry


def _firma_z_debetem(gotowka, debet, bank="Kmicic"):
    g = _gra(("A", None), ("B", None))
    s = _runda(g, A={**_lokal("centrum_3"), "stanowiska": {"kuchnia": 1}, "bank": "Soplicowo"}, B=_lokal("dworzec_1"))
    f = deepcopy(s.firmy["A"])
    f.bank, f.debet_wlaczony, f.gotowka, f.debet = bank, True, gotowka, debet
    return f


def test_gotowka_wystarcza_debet_jest_splacony_ze_starego_banku():
    dane = dane_domyslne()
    f = _firma_z_debetem(gotowka=3000.0, debet=1000.0)
    ks, rach = Ksiega(), Rachunek()
    info = bk.poczatek_rundy(dane, f, {"bank": "Soplicowo"}, 5, ks, rach)
    assert f.bank == "Soplicowo" and f.debet == 0 and f.gotowka == 2000.0
    assert info["debet_przy_zmianie"]["tryb"] == "splata" and info["debet_przy_zmianie"]["oplata"] == 0
    assert not ks.pozycje                                                # spłata debetu to nie koszt


def test_brak_gotowki_nowy_bank_przejmuje_debet_za_oplate():
    dane = dane_domyslne()
    minimum = min(b["debet"]["oplata"] for b in bk.banki(dane).values())
    assert dane.mapa["banki"]["przejecie_debetu"]["procent"] == 0.02
    f = _firma_z_debetem(gotowka=0.0, debet=1000.0)
    ks = Ksiega()
    info = bk.poczatek_rundy(dane, f, {"bank": "Soplicowo"}, 5, ks, Rachunek())["debet_przy_zmianie"]
    assert info["tryb"] == "przejecie" and f.bank == "Soplicowo" and f.debet == 1000.0   # dług idzie z firmą
    assert info["oplata"] == minimum == 40.0                             # 2% z 1000 zł = 20 zł – stosuje się minimum
    assert any(p["opis"].startswith("Opłata za przejęcie debetu") for p in ks.pozycje) and f.gotowka == -40.0
    f = _firma_z_debetem(gotowka=100.0, debet=5000.0)
    info = bk.poczatek_rundy(dane, f, {"bank": "Soplicowo"}, 5, Ksiega(), Rachunek())["debet_przy_zmianie"]
    assert info["tryb"] == "przejecie" and info["oplata"] == 100.0       # 2% z 5000 zł
    assert not any(x in info["komunikat"] for x in ("zapłaciłeś", "zapłaciłaś", "Zapłaciłeś", "Zapłaciłaś"))


def test_bez_debetu_albo_przy_pierwszym_wyborze_banku_nie_ma_oplaty():
    dane = dane_domyslne()
    f = _firma_z_debetem(gotowka=500.0, debet=0.0)
    assert "debet_przy_zmianie" not in bk.poczatek_rundy(dane, f, {"bank": "Soplicowo"}, 5, Ksiega(), Rachunek())
    f = _firma_z_debetem(gotowka=0.0, debet=0.0)
    f.bank = None
    assert "debet_przy_zmianie" not in bk.poczatek_rundy(dane, f, {"bank": "Soplicowo"}, 5, Ksiega(), Rachunek())
