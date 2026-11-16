"""Dania specjalne strefy (sprawa 4, Poprawki 3): odblokowane od rundy z danych (uslugi.yaml: od_rundy, tydzień
przesuwa mistrz gry w harmonogramie), mechanicznie jednakowe w całym mieście, ale z własną nazwą w każdej strefie –
w lokalu widać nazwę jego strefy, w raportach firmy nazwę strefy albo (lokale w kilku strefach) nazwę ogólną."""

import pytest
from pomocnicze import _gra, _lokal, _runda

from api.prezentacja import katalogi, nazwy_dan
from silnik import harmonogram as hm
from silnik.dane import dane_domyslne
from silnik.kuchnia import menu as mn
from silnik.model import Firma, Lokal

pytestmark = pytest.mark.dane_gry   # dań specjalnych nie ma w zamrożonej kopii danych

K1 = "kebab_specjalny_1"


def _firma(*lokale: str) -> Firma:
    return Firma(nazwa="A", gotowka_gr=0, lokale=[Lokal(id=x, forma="najem", od_rundy=1, dziala_od=2) for x in lokale])


def _lokal_w_strefie(dane, strefa: str, pomin: str | None = None) -> str:
    return next(x for x, d in dane.lokale.items() if d["strefa"] == strefa and x != pomin)


def test_nazwy_w_kazdej_strefie_rozne():
    dane = dane_domyslne()
    spec = mn.specjalne(dane)
    assert len(spec) == 4 and all(mn.od_rundy(dane, u) > 1 for u in spec)
    nazwy = [du["nazwy_stref"][z] for u in spec for z in dane.mapa["strefy"] for du in [dane.uslugi[u]]]
    assert len(nazwy) == 40 == len(set(nazwy))
    assert not set(nazwy) & {du["nazwa"] for du in dane.uslugi.values()}
    assert mn.nazwa_dania(dane, K1, "dworzec") == dane.uslugi[K1]["nazwy_stref"]["dworzec"]
    assert mn.nazwa_dania(dane, K1) == dane.uslugi[K1]["nazwa"] == "Kebab specjalny I"
    assert mn.nazwa_dania(dane, "frytki", "dworzec") == dane.uslugi["frytki"]["nazwa"]   # zwykłe danie – zawsze ta sama


def test_nazwa_w_raporcie_firmy_zalezy_od_stref_lokali():
    dane = dane_domyslne()
    a = _lokal_w_strefie(dane, "centrum")
    jedna = _firma(a, _lokal_w_strefie(dane, "centrum", pomin=a))
    dwie = _firma(a, _lokal_w_strefie(dane, "dworzec"))
    centrum = dane.uslugi[K1]["nazwy_stref"]["centrum"]
    assert mn.nazwa_dania(dane, K1, firma=jedna) == centrum
    assert mn.nazwa_dania(dane, K1, firma=dwie) == "Kebab specjalny I"
    # panel dostaje tylko nazwy stref swoich lokali; katalog dań – bez nazw stref
    n = nazwy_dan(dane, dwie)
    assert set(n["strefy"]) == {"centrum", "dworzec"} and n["firma"][K1] == "Kebab specjalny I"
    assert n["strefy"]["dworzec"][K1] == dane.uslugi[K1]["nazwy_stref"]["dworzec"]
    assert all("nazwy_stref" not in du for du in katalogi(dane)["uslugi"].values())


def test_harmonogram_przesuwa_odblokowanie_dania():
    dane = dane_domyslne()
    el = hm.elementy(dane)
    assert el[f"danie_{K1}"]["tydzien"] == dane.uslugi[K1]["od_rundy"] and el[f"danie_{K1}"]["grupa"] == "Kuchnia"
    g = _gra(odblokowanie={f"danie_{K1}": 4})
    assert mn.od_rundy(g.dane, K1) == 4 and mn.od_rundy(dane, K1) == dane.uslugi[K1]["od_rundy"]   # wspólne dane bez zmian


def test_danie_specjalne_dopiero_od_rundy_odblokowania():
    g = _gra(odblokowanie={f"danie_{K1}": 4})
    strefa = g.dane.lokale["centrum_3"]["strefa"]
    nazwa = g.dane.uslugi[K1]["nazwy_stref"][strefa]
    _runda(g, A={**_lokal("centrum_3"), "oferta": {"kebab_w_bulce": 10}})
    _runda(g)
    s = _runda(g, A={"oferta": {"kebab_w_bulce": 10, K1: 5}})   # runda 3: nowe dania już można, to – od 4
    assert K1 not in s.firmy["A"].oferta
    bledy = [b["tekst"] for b in s.wyniki[3]["A"]["lista_bledow"]]
    assert any(t.startswith(f"{nazwa}: to danie można wprowadzić do menu dopiero od rundy 4") for t in bledy)
    assert not any("może wzrosnąć najwyżej" in t for t in bledy)
    s = _runda(g, A={"oferta": {"kebab_w_bulce": 10, K1: 5}})
    assert K1 in s.firmy["A"].oferta and K1 in s.firmy["A"].lokale[0].menu


def test_boty_dokladaja_dania_specjalne_po_odblokowaniu():
    spec = ["kebab_specjalny_1", "kebab_specjalny_2", "przekaska_specjalna", "napoj_specjalny"]
    g = _gra(("Agr", "agresywny"), rund=6, odblokowanie={f"danie_{u}": 5 for u in spec})
    oferty = {}
    for _ in range(5):
        s = g.przelicz(wymus=True)
        oferty[s.runda] = set(s.firmy["Agr"].oferta)
    assert not any(oferty[r] & set(spec) for r in range(1, 5))
    assert oferty[5] & set(g.dane.boty["strategie"]["agresywny"]["dania_specjalne"])


def test_specjalne_bazowo_lepsze_od_zwyklych_w_kazdej_strefie():
    """Sprawa 4 (Poprawki 3): popyt strefy (popyt_roczny × koszyk strefy, bez mnożników wydarzeń i turystów) dania
    specjalnego jest w każdej strefie wyższy niż najlepszego zwykłego dania tej samej kategorii."""
    from silnik.rynek import klienci as kl
    dane = dane_domyslne()
    spec = set(mn.specjalne(dane))
    koszyk = kl.mnozniki_koszyka(dane)
    assert koszyk
    for u in spec:
        zwykle = [v for v, d in dane.uslugi.items() if v not in spec and d["kategoria"] == dane.uslugi[u]["kategoria"]]
        assert zwykle
        for z in dane.mapa["strefy"]:
            def baza(v): return dane.uslugi[v]["popyt_roczny"] * koszyk[z][v]
            assert baza(u) > max(baza(v) for v in zwykle), (u, z)
