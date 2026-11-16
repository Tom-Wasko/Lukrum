"""Dekor lokalu (sklep meblowy, silnik/rynek/dekor.py, dane/mapa/dekor.yaml): zakup, przełączanie, efekt zależny od
dopasowania do klientów strefy, wyłącznik `wlaczony`, stary stan bez pól. Liczby bierzemy z danych – testy nie zależą
od kalibracji efektu."""

import copy

import pytest
from pomocnicze import _gra, _kopia, _zmien

from silnik import dane as modul_danych
from silnik.dane import dane_domyslne, sprawdz
from silnik.decyzje import lista_bledow, zastosuj
from silnik.ksiegowosc import rozliczenie as rz
from silnik.ksiegowosc.finanse import Ksiega, Rachunek
from silnik.kuchnia.dostawcy import ceny_rundy
from silnik.model import Lokal
from silnik.rynek import dekor as dk
from silnik.rynek import opinie as op
from silnik.rynek import popyt as pp

pytestmark = pytest.mark.dane_gry
RUNDA = 5


@pytest.fixture(scope="module")
def stan_bota():
    g = _gra(("Zrown", "zrownowazony"), rund=6)
    for _ in range(RUNDA - 1):
        g.przelicz(wymus=True)
    return g, g.stan(RUNDA - 1)


def _firma(stan_bota):
    g, s = stan_bota
    return g.dane, copy.deepcopy(s.firmy["Zrown"])


def _zastosuj(dane, f, d):
    return zastosuj(dane, f, d, RUNDA, [], ceny_rundy(dane, 1, RUNDA, "dane"), Ksiega(vat=rz.reguly_vat(dane)), Rachunek())


def _decyzja(dane, f, d):
    """Zastosowanie decyzji; zwraca (info, o ile mniej gotówki niż po tej samej rundzie bez decyzji dekoru)."""
    bez = copy.deepcopy(f)
    _zastosuj(dane, bez, {k: v for k, v in d.items() if not k.startswith("dekor") and k != "w_lokalu"})
    info = _zastosuj(dane, f, d)
    return info, round(bez.gotowka - f.gotowka, 2)


def test_dane_dekoru_poprawne_i_odwolania_do_grup_klientow(tmp_path):
    dane = dane_domyslne()
    z = dane.mapa["dekor"]
    assert z["wlaczony"] and set(z["grupy"]) == {"sciany", "szyld", "dodatki", "meble"}
    assert sum(x["cena"]["wartosc"] for x in z["grupy"].values()) == 8300
    assert set(z["style"]) == {"podstawowy", "prl", "nowoczesny", "studencki", "rodzinny"}
    kat = _kopia(tmp_path)
    _zmien(kat, "mapa/dekor.yaml", lambda d: d["style"]["prl"]["klienci"].append("kosmici"))
    assert any("kosmici" in b for b in sprawdz(kat))


def test_zakup_placi_od_razu_i_styl_staje_sie_aktywny(stan_bota):
    dane, f = _firma(stan_bota)
    lok = f.lokale[0]
    cena = dane.mapa["dekor"]["grupy"]["sciany"]["cena"]["wartosc"]
    majatek = f.majatek
    info, koszt = _decyzja(dane, f, {"dekor_kup": [["sciany", "prl"]]})
    assert koszt == pytest.approx(cena)   # płatne od razu z gotówki
    assert f.majatek == pytest.approx(majatek + cena) and info["inwestycje"] == pytest.approx(cena)
    assert lok.dekor_kupiony == {"sciany": ["prl"]} and lok.dekor == {"sciany": "prl"}
    assert not info.get("uwagi_dekoru")


def test_podwojny_zakup_i_zakup_darmowego_stylu_to_blad(stan_bota):
    dane, f = _firma(stan_bota)
    _decyzja(dane, f, {"dekor_kup": [["sciany", "prl"]]})
    info, koszt = _decyzja(dane, f, {"dekor_kup": [["sciany", "prl"], ["sciany", "podstawowy"], ["szyld", "nieznany"]]})
    assert koszt == 0 and f.lokale[0].dekor_kupiony == {"sciany": ["prl"]}
    assert len(info["uwagi_dekoru"]) == 3
    assert "już kupiony" in info["uwagi_dekoru"][0] and "darmowy" in info["uwagi_dekoru"][1]
    bledy = lista_bledow(dane, f, {}, RUNDA, [], lokal={}, info=info)
    assert [b for b in bledy if "już kupiony" in b["tekst"] and b["poziom"] == "czerwony"]


def test_ustawienie_niekupionego_to_blad_a_przelaczanie_jest_darmowe(stan_bota):
    dane, f = _firma(stan_bota)
    lok = f.lokale[0]
    info, _ = _decyzja(dane, f, {"dekor_ustaw": {"sciany": "studencki"}})
    assert "nie jest kupiony" in info["uwagi_dekoru"][0] and not lok.dekor
    _decyzja(dane, f, {"dekor_kup": [["sciany", "prl"], ["sciany", "studencki"]]})
    assert lok.dekor["sciany"] == "studencki"   # ostatnio kupiony jest aktywny
    info, koszt = _decyzja(dane, f, {"dekor_ustaw": {"sciany": "prl"}})
    assert lok.dekor["sciany"] == "prl" and koszt == 0 and not info.get("uwagi_dekoru")
    _decyzja(dane, f, {"dekor_ustaw": {"sciany": "podstawowy"}})
    assert dk.aktywny(dane, lok, "sciany") == "podstawowy"
    assert lok.dekor_kupiony["sciany"] == ["prl", "studencki"]   # kupione zostaje


def test_dekor_w_lokalu_dotyczy_tylko_tego_lokalu(stan_bota):
    dane, f = _firma(stan_bota)
    drugi = f.lokale[0].model_copy(deep=True, update={"id": "centrum_1", "dekor": {}, "dekor_kupiony": {}})
    f.lokale.append(drugi)
    _decyzja(dane, f, {"w_lokalu": {"centrum_1": {"dekor_kup": [["szyld", "nowoczesny"]]}}})
    assert drugi.dekor_kupiony == {"szyld": ["nowoczesny"]} and not f.lokale[0].dekor_kupiony


def test_wspolczynnik_zalezy_od_progow():
    dane = dane_domyslne()
    z = dane.mapa["dekor"]
    assert dk.wspolczynnik(dane, z["prog"]) == 1.0 and dk.wspolczynnik(dane, 1.0) == 1.0
    assert dk.wspolczynnik(dane, z["prog"] - 0.01) == 0.5 and dk.wspolczynnik(dane, z["prog_czesciowy"]) == 0.5
    assert dk.wspolczynnik(dane, z["prog_czesciowy"] - 0.01) == 0.0 and dk.wspolczynnik(dane, 0.0) == 0.0


def test_efekt_pelny_czesciowy_i_zaden(stan_bota, monkeypatch):
    dane, f = _firma(stan_bota)
    lok = f.lokale[0]
    z = dane.mapa["dekor"]
    assert dk.punkty(dane, lok) == 0 and dk.mnoznik_popytu(dane, 0) == 1.0 and dk.gwiazdki_oceny(dane, 0) == 0.0
    # wymuszone udziały strefy, żeby każdy próg dało się trafić niezależnie od mapy
    udz = {"turysci": 0.5, "biurowi": 0.3, "studenci": 0.1, "rodziny": 0.1}
    monkeypatch.setitem(dane.mapa["klienci"]["strefy"], dane.lokale[lok.id]["strefa"], udz)
    for g in z["grupy"]:
        lok.dekor_kupiony[g] = ["prl", "nowoczesny", "studencki", "rodzinny"]
    lok.dekor = {"sciany": "prl", "szyld": "nowoczesny", "dodatki": "studencki", "meble": "podstawowy"}
    assert dk.dopasowanie(dane, lok.id, "prl") == pytest.approx(0.5)          # pełny efekt
    assert dk.dopasowanie(dane, lok.id, "nowoczesny") == pytest.approx(0.3)   # połowa
    assert dk.dopasowanie(dane, lok.id, "studencki") == pytest.approx(0.1)    # nic
    assert dk.punkty(dane, lok) == pytest.approx(1.5)
    assert dk.mnoznik_popytu(dane, 1.5) == pytest.approx(1 + 1.5 * z["efekty"]["popyt"]["wartosc"])
    assert dk.gwiazdki_oceny(dane, 1.5) == pytest.approx(1.5 * z["efekty"]["ocena"]["wartosc"])
    lok.dekor = {g: "prl" for g in z["grupy"]}   # komplet dopasowany: cztery pełne plusy
    assert dk.punkty(dane, lok) == 4


def test_efekt_dociera_do_popytu_i_oceny(stan_bota, monkeypatch):
    dane, f = _firma(stan_bota)
    lok = f.lokale[0]
    strefa = dane.lokale[lok.id]["strefa"]
    monkeypatch.setitem(dane.mapa["klienci"]["strefy"], strefa, {"turysci": 0.6, "biurowi": 0.4})
    bez = pp.oferty_lokali(dane, f, RUNDA, {})[lok.id]
    for g in dane.mapa["dekor"]["grupy"]:
        lok.dekor_kupiony[g], lok.dekor[g] = ["prl"], "prl"
    z = pp.oferty_lokali(dane, f, RUNDA, {})[lok.id]
    u = next(iter(z))
    assert bez[u]["dekor"] == 1.0 and z[u]["dekor"] > 1.0 and z[u]["dekor_punkty"] == 4
    assert pp.atrakcyjnosc(dane, strefa, u, z[u]) > pp.atrakcyjnosc(dane, strefa, u, bez[u])
    wynik = {"obsluga": {"obsluzeni": {u: 50}, "kolejka": 0, "brak": 0, "pomylki": 0}, "popyt": 50, "grupy": {}}
    o_bez, _ = op.ocena_tygodnia(dane, lok.id, wynik, {u: bez[u]})
    o_z, _ = op.ocena_tygodnia(dane, lok.id, wynik, {u: z[u]})
    assert o_z - o_bez == pytest.approx(4 * dane.mapa["dekor"]["efekty"]["ocena"]["wartosc"])


def test_wylacznik_wlaczony_false(tmp_path, monkeypatch):
    kat = _kopia(tmp_path)
    _zmien(kat, "mapa/dekor.yaml", lambda d: d.update(wlaczony=False))
    monkeypatch.setattr(modul_danych, "KATALOG_DANYCH", kat)
    g = _gra(("Zrown", "zrownowazony"), rund=6)
    for _ in range(RUNDA - 1):
        g.przelicz(wymus=True)
    dane, f = g.dane, copy.deepcopy(g.stan(RUNDA - 1).firmy["Zrown"])
    assert dk.zasady(dane) is None and dk.widok(dane, f) == {}
    info, koszt = _decyzja(dane, f, {"dekor_kup": [["sciany", "prl"]]})
    assert koszt == 0 and not f.lokale[0].dekor_kupiony and not info.get("uwagi_dekoru")
    f.lokale[0].dekor = {"sciany": "prl"}
    assert dk.punkty(dane, f.lokale[0]) == 0


def test_stary_stan_bez_pol_wczytuje_sie(stan_bota):
    dane, f = _firma(stan_bota)
    zapis = f.lokale[0].model_dump()
    zapis.pop("dekor")
    zapis.pop("dekor_kupiony")
    lok = Lokal.model_validate(zapis)
    assert lok.dekor == {} and lok.dekor_kupiony == {}
    assert dk.aktywny(dane, lok, "meble") == "podstawowy" and dk.punkty(dane, lok) == 0


def test_widok_katalog_i_dopasowanie_stylow(stan_bota):
    dane, f = _firma(stan_bota)
    w = dk.widok(dane, f)
    assert set(w["katalog"]["grupy"]) == {"sciany", "szyld", "dodatki", "meble"} and w["katalog"]["prog"] == 0.4
    lok = w["lokale"][f.lokale[0].id]
    assert lok["aktywne"] == {g: "podstawowy" for g in w["katalog"]["grupy"]} and lok["kupione"]["sciany"] == []
    assert set(lok["dopasowanie"]) == set(w["katalog"]["style"]) and lok["dopasowanie"]["podstawowy"] == 0
    assert all(0 <= x <= 1 for x in lok["dopasowanie"].values()) and sum(lok["udzialy"].values()) == pytest.approx(1)
