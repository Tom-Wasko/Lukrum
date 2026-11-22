"""Seria balans-katalogi (decyzje autora 18.11.2026): gwiazdki kasy, lady i tablicy przyspieszają obsługę,
szafa chłodnicza ★★★ wydłuża termin, ocena firmy szkoleniowej zmienia siłę szkolenia, sprzęt i dostawcy od tygodnia 1,
pięć banków (bez Solarisa, debet w Soplicowie)."""
import copy

import pytest

from silnik.dane import dane_domyslne
from silnik.kuchnia.operacje import tempo_kasy
from silnik.kuchnia.swiezosc import dluzszy_termin
from silnik.ludzie import szkolenia as szk
from silnik.model import Firma, Stanowisko
from silnik.pieniadze import banki as bk

pytestmark = pytest.mark.dane_gry


def _kasa(**sprzet) -> Stanowisko:
    return Stanowisko(nr=1, typ="kasa", sprzet=sprzet)


def test_gwiazdki_kasy_zmieniaja_tempo():
    d = dane_domyslne()
    k = {q: _kasa(**{"Kasa fiskalna": q, "Lada z witryną": q, "Tablica menu": q}) for q in (1, 2, 3)}
    assert tempo_kasy(d, k[1]) < tempo_kasy(d, k[2]) == 1.0 < tempo_kasy(d, k[3])
    assert tempo_kasy(d, _kasa()) == 1.0   # bez sprzętu z tempem – bez zmian
    # dane bez pola (stare zapisy) – gwiazdki nie zmieniają tempa
    d2 = copy.copy(d)
    d2.sprzet = {n: {k: v for k, v in s.items() if k != "tempo_obslugi"} for n, s in d.sprzet.items()}
    assert tempo_kasy(d2, k[3]) == 1.0


def test_szafa_trzy_gwiazdki_wydluza_termin():
    d = dane_domyslne()
    szafa = "Szafa chłodnicza"
    t = d.sprzet[szafa]["przechowywanie"]
    f = Firma(nazwa="A", gotowka=0, stanowiska=[Stanowisko(nr=1, typ="kuchnia", sprzet={szafa: 3})])
    assert dluzszy_termin(d, f)[t] == 1
    f.stanowiska.append(Stanowisko(nr=2, typ="kuchnia", sprzet={szafa: 2}))   # liczy się najsłabsza sztuka
    assert dluzszy_termin(d, f)[t] == 0


def test_ocena_firmy_szkoleniowej_zmienia_procent():
    oferta = dane_domyslne().katalog_ofert["szkolenia"]
    assert oferta["skutecznosc_z_oceny"]
    p = oferta["pozycje"][0]
    oceny = sorted(oferta["firmy"], key=lambda f: f["zadowoleni_klienci"])
    najslabsza, najlepsza = (szk.procent_firmy(oferta, p, f["nazwa"]) for f in (oceny[0], oceny[-1]))
    assert najlepsza == p["procent"] and najslabsza < najlepsza
    assert szk.procent_firmy({**oferta, "skutecznosc_z_oceny": False}, p, oceny[0]["nazwa"]) == p["procent"]


def test_sprzet_i_dostawcy_od_tygodnia_1():
    d = dane_domyslne()
    R = d.katalog_ofert["rundy"]
    assert {"inwestycje_sprzet", "dostawcy"} <= set(R["odblokowanie"]["1"])
    for k in ("inwestycje_sprzet", "dostawcy"):
        assert R["harmonogram_lokali"]["zakladki"][k]["tydzien"] == 1


def test_piec_bankow_debet_w_soplicowie():
    d = dane_domyslne()
    b = bk.banki(d)
    assert len(b) == 5 and "Solaris" not in b
    assert bk.najlepsze(d)["debet"] == "Soplicowo"
