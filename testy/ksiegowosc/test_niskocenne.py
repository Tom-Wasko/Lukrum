"""Decyzja autora 7.11.2026): wybór, czy zakupy poniżej progu amortyzacji idą od razu w koszty, czy do ewidencji
środków trwałych z amortyzacją `finanse.amortyzacja_niskocenna.stawka`."""

import copy

import pytest

from balans import warianty as wr
from silnik.boty import decyzje_bota
from silnik.dane import dane_domyslne
from silnik.gra import Gra
from silnik.ksiegowosc import srodki_trwale as st
from silnik.ksiegowosc.finanse import Ksiega, Rachunek
from silnik.model import Firma


def _dane(wybor=True):
    d = copy.deepcopy(dane_domyslne())
    d.z["finanse"]["amortyzacja_niskocenna"]["wybor"] = wybor
    return d


def _zakup(dane, polityka):
    f, ks, rach = Firma(nazwa="A", gotowka=5000, amortyzacja_niskocenna=polityka), Ksiega(), Rachunek()
    koszt = st.zakup(dane, f, ks, rach, "Koszt zakupu: Krzesło", "Krzesło", "wyposazenie", 300, 3)
    return f, ks, koszt


def test_domyslnie_zakup_ponizej_progu_w_koszty():
    f, ks, koszt = _zakup(dane_domyslne(), st.W_KOSZTY)
    assert koszt == 300 and [p["opis"] for p in ks.pozycje] == ["Koszt zakupu: Krzesło"] and f.srodki_trwale == []


def test_amortyzacja_niskocennych_do_ewidencji_ze_stawka_z_danych():
    dane = dane_domyslne()
    stawka = dane.z["finanse"]["amortyzacja_niskocenna"]["stawka"]
    f, ks, koszt = _zakup(dane, st.AMORTYZACJA)
    assert koszt == 0 and ks.pozycje == [] and f.gotowka == pytest.approx(4700)
    [s] = f.srodki_trwale
    assert s.nazwa == "Krzesło" and s.wartosc == 300 and s.stawka == stawka
    st.amortyzuj(dane, f, 3, ks)
    assert ks.pozycje == []                                            # w rundzie zakupu bez odpisu
    st.amortyzuj(dane, f, 4, ks)
    assert ks.pozycje[-1]["pozostale"] == pytest.approx(round(300 * stawka / dane.rund_w_roku, 2))


def test_wylaczony_wybor_zawsze_w_koszty_i_decyzja_ignorowana():
    dane = _dane(wybor=False)
    _, _, koszt = _zakup(dane, st.AMORTYZACJA)
    assert koszt == 300
    f = Firma(nazwa="A")
    st.ustaw_niskocenne(dane, f, {"amortyzacja_niskocenna": st.AMORTYZACJA})
    assert f.amortyzacja_niskocenna == st.W_KOSZTY
    st.ustaw_niskocenne(dane_domyslne(), f, {"amortyzacja_niskocenna": "byle co"})
    assert f.amortyzacja_niskocenna == st.W_KOSZTY
    st.ustaw_niskocenne(dane_domyslne(), f, {"amortyzacja_niskocenna": st.AMORTYZACJA})
    assert f.amortyzacja_niskocenna == st.AMORTYZACJA
    st.ustaw_niskocenne(dane_domyslne(), f, {})                         # wybór trwa do zmiany
    assert f.amortyzacja_niskocenna == st.AMORTYZACJA


def test_sprzet_w_cenie_lokalu_ponizej_progu_do_ewidencji_przy_amortyzacji():
    dane = dane_domyslne()
    prog = dane.z["finanse"]["amortyzacja_prog"]
    tani = next((n, int(q)) for n, s in dane.sprzet.items() for q, c in s["ceny"].items() if c < prog)
    for polityka, w_ewidencji in ((st.W_KOSZTY, 0), (st.AMORTYZACJA, 1)):
        f, ks = Firma(nazwa="A", amortyzacja_niskocenna=polityka), Ksiega()
        st.sprzet_w_cenie(dane, f, ks, "ul. Testowa 1", [tani], 2)
        assert len(f.srodki_trwale) == w_ewidencji and len(ks.pozycje) == 1 - w_ewidencji


def _gra_bota(polityka: str | None, rund: int):
    """Firma H gra jak zrównoważony bot w niewyposażonym lokalu (stanowiska i sprzęt poniżej progu kupowane od
    zera), opcjonalnie z amortyzacją tańszych zakupów (parametr strategii jak w wariancie)."""
    g = Gra.nowa("niskocenne", [("H", None), ("B", "zrownowazony")], 8, 3, lokale=True)
    nad = {"lokal": {"typy": ["niewyposazony"]}} | ({"amortyzacja_niskocenna": polityka} if polityka else {})
    db = wr._dane_badanej(g.dane, "zrownowazony", "sredni", nad, {})
    for _ in range(rund):
        g.ustaw_decyzje("H", decyzje_bota(db, g.stan(), "H", "zrownowazony", g.runda, g.konfiguracja))
        s = g.przelicz(wymus=True)
    return g, s


def test_wybor_w_grze_zakupy_rundy_bez_kosztu_a_odpisy_od_nastepnej():
    (_, sz), (ga, sa) = _gra_bota(None, 3), _gra_bota(st.AMORTYZACJA, 3)
    assert sa.firmy["H"].amortyzacja_niskocenna == st.AMORTYZACJA and sz.firmy["H"].amortyzacja_niskocenna == st.W_KOSZTY
    wz, wa = sz.wyniki[1]["H"], sa.wyniki[1]["H"]
    assert wz["srodki_trwale"] == [] and wa["srodki_trwale"]               # stanowiska rundy 1 w ewidencji
    stawka = ga.dane.z["finanse"]["amortyzacja_niskocenna"]["stawka"]
    assert all(e["stawka"] == stawka for e in wa["srodki_trwale"])
    w_ewidencji = sum(e["wartosc"] for e in wa["srodki_trwale"])
    # w kosztach rundy zakupu było co najmniej tyle (stanowiska w koszty – brutto: bez reguły VAT w podatki_2026)
    assert wa["kpir"]["dochod_netto"] - wz["kpir"]["dochod_netto"] >= w_ewidencji - 1
    assert [b for b in wz["lista_bledow"] if "od razu idą w koszty" in b["tekst"]]
    assert not [b for b in wa["lista_bledow"] if "od razu idą w koszty" in b["tekst"]]   # bez ostrzeżenia
    odpisy = {p["opis"] for p in sa.wyniki[2]["H"]["kpir"]["pozycje"] if p["opis"].startswith("Amortyzacja: ")}
    assert {f"Amortyzacja: {e['nazwa']}" for e in wa["srodki_trwale"]} <= odpisy
    assert not [p for p in sz.wyniki[2]["H"]["kpir"]["pozycje"] if p["opis"].startswith("Amortyzacja: ")]


def test_bot_wybiera_amortyzacje_tylko_z_parametrem_strategii():
    g = Gra.nowa("niskocenne", [("A", "zrownowazony"), ("B", "zrownowazony")], 8, 3, lokale=True)
    assert "amortyzacja_niskocenna" not in decyzje_bota(g.dane, g.stan(), "A", "zrownowazony", 1, g.konfiguracja)
    dane = wr._dane_badanej(g.dane, "zrownowazony", "sredni", {"amortyzacja_niskocenna": st.AMORTYZACJA}, {})
    d = decyzje_bota(dane, g.stan(), "A", "zrownowazony", 1, g.konfiguracja)
    assert d["amortyzacja_niskocenna"] == st.AMORTYZACJA


def test_warianty_b6_z_amortyzacja():
    k = wr.katalog_wariantow(dane_domyslne())
    for n in ("amortyzacja:niskocenne", "lokale:niewyposazony_amort", "lokale:niewyposazony_q3_amort",
              "lokale:drugi_niewyposazony_amort"):
        assert ("amortyzacja_niskocenna", st.AMORTYZACJA) in k[n].strategia
