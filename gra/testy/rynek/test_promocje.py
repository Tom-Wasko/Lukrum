"""Promocje w grze z lokalami: dane, przyciąganie ze znużeniem i przywiązaniem, ustawienie z walidacją
i kosztem włączenia, kontynuacja, przyciąganie w popycie (dni, strefy), porcje gratis, rozliczenie rabatów i dopłat,
gra z promocją, boty, widok API i gra bez lokali."""

import copy

import numpy as np
import pytest
from pomocnicze import KEBAB, _gra, _lokal, _oferta, _runda

from silnik import boty
from silnik.dane import dane_domyslne
from silnik.ksiegowosc import rozliczenie as rz
from silnik.ksiegowosc.finanse import Ksiega, Rachunek
from silnik.rynek import popyt as pp
from silnik.rynek import promocje as pm


@pytest.fixture(scope="module")
def firma_botow():
    g = _gra(("A", "nasladowca"), ("B", "nasladowca"))
    g.przelicz(wymus=True)
    s = g.przelicz(wymus=True)
    return g.dane, s.firmy["A"]


def _ustaw(dane, f, lista, runda=3):
    ks, rach = Ksiega(vat=dane.podatki["vat"]), Rachunek()
    return pm.ustaw(dane, f, {"promocje": lista}, runda, ks, rach), ks


def _efekt(dane, t, maska, przyciaganie=None):
    typ = pm.zasady(dane)["typy"][t]
    return {"typ": t, "nazwa": "x", "rabat": typ["rabat"], "porcje": typ["porcje"], "doplata": typ["doplata"],
            "koszt_dodatku": typ["koszt_dodatku"], "strefy": typ["strefy_klientow"], "maska": np.asarray(maska, float),
            "przyciaganie": typ["przyciaganie"] if przyciaganie is None else przyciaganie}


def test_dane_i_przyciaganie_w_czasie():
    dane = dane_domyslne()
    R = pm.zasady(dane)
    assert set(R["typy"]) == {"dwa_za_jeden", "zestaw", "happy_hours", "karta", "studencka"}
    for t, typ in R["typy"].items():
        assert len(typ["teksty"]) >= 2 and all("{nazwa}" in x for x in typ["teksty"]), t
    for st in dane.boty["strategie"].values():
        assert all(p["typ"] in R["typy"] for p in st.get("promocje", []))
    dwa, karta = R["typy"]["dwa_za_jeden"], R["typy"]["karta"]
    assert pm.przyciaganie(dwa, 3, 3) == pytest.approx(dwa["przyciaganie"])
    assert pm.przyciaganie(dwa, 3, 4) == pytest.approx(dwa["przyciaganie"] + dwa["przyrost"])   # znużenie
    assert pm.przyciaganie(dwa, 3, 30) == pytest.approx(dwa["przyciaganie_min"])
    assert pm.przyciaganie(karta, 3, 4) == pytest.approx(karta["przyciaganie"] + karta["przyrost"])   # przywiązanie
    assert pm.przyciaganie(karta, 3, 30) == pytest.approx(karta["przyciaganie_max"])


def test_ustaw_walidacja_koszt_i_kontynuacja(firma_botow):
    dane, f0 = firma_botow
    R = pm.zasady(dane)
    f = copy.deepcopy(f0)
    assert "napoj" in f.ceny and "pizza" not in f.ceny
    info, ks = _ustaw(dane, f, [
        {"typ": "nie_ma"},
        {"typ": "dwa_za_jeden", "nazwa": "Bez dania"},
        {"typ": "zestaw", "nazwa": "Zły", "danie": "pizza"},
        {"typ": "happy_hours", "nazwa": "  Godzina   Szału  "},
        {"typ": "happy_hours", "nazwa": "Drugi raz"},
        {"typ": "karta", "nazwa": "K" * 100},
        {"typ": "studencka", "nazwa": "Ponad limit"},
    ])
    assert [p.typ for p in f.promocje] == ["happy_hours", "karta"] and len(info["uwagi"]) == 5
    assert f.promocje[0].nazwa == "Godzina Szału" and len(f.promocje[1].nazwa) == R["nazwa_max"]
    start = [p for p in ks.pozycje if p["opis"].startswith(pm.OPIS_STARTU)]
    assert sum(p["pozostale"] for p in start) == pytest.approx(R["typy"]["happy_hours"]["koszt_startu"] + R["typy"]["karta"]["koszt_startu"])
    assert all(p["od_rundy"] == 3 for p in info["nowe"]) and len(info["nowe"]) == 2
    # następna runda: nowa nazwa nic nie kosztuje i nie zeruje znużenia, wyłączona karta znika
    info, ks = _ustaw(dane, f, [{"typ": "happy_hours", "nazwa": "Godzina Mocy"}], runda=4)
    assert [(p.typ, p.nazwa, p.od_rundy) for p in f.promocje] == [("happy_hours", "Godzina Mocy", 3)]
    assert not info["nowe"] and [p["typ"] for p in info["wylaczone"]] == ["karta"] and not ks.pozycje
    # bez klucza w decyzji promocje trwają; przed rundą startową – nie wolno
    info, _ = _ustaw(dane, f, [], runda=5)
    assert not f.promocje
    g = copy.deepcopy(f0)
    info, _ = _ustaw(dane, g, [{"typ": "karta", "nazwa": "Za wcześnie"}], runda=R["od_rundy"] - 1)
    assert not g.promocje and info["uwagi"]


def test_danie_zdjete_ze_sprzedazy_wylacza_promocje(firma_botow):
    dane, f0 = firma_botow
    f = copy.deepcopy(f0)
    _ustaw(dane, f, [{"typ": "zestaw", "nazwa": "Z", "danie": "frytki"}])
    del f.ceny["frytki"]
    info = pm.ustaw(dane, f, {}, 4, Ksiega(vat=dane.podatki["vat"]), Rachunek())
    assert not f.promocje and info["wylaczone"][0]["typ"] == "zestaw" and info["uwagi"]


def test_efekty_ofert_tylko_dla_dania_i_dni(firma_botow):
    dane, f0 = firma_botow
    f = copy.deepcopy(f0)
    _ustaw(dane, f, [{"typ": "zestaw", "nazwa": "Z", "danie": "frytki"}, {"typ": "happy_hours", "nazwa": "H"}])
    oferty = {"lok": {u: {"cena": 10.0} for u in f.ceny}}
    dni = pp.dni_rundy(dane, 3)
    pm.efekty_ofert(dane, f, oferty, 3, dni)
    assert [e["typ"] for e in oferty["lok"]["frytki"]["promocje"]] == ["zestaw", "happy_hours"]
    assert [e["typ"] for e in oferty["lok"]["napoj"]["promocje"]] == ["happy_hours"]
    hh = oferty["lok"]["napoj"]["promocje"][0]["maska"]
    assert list(hh) == [1.0 if d.weekday() in pm.zasady(dane)["typy"]["happy_hours"]["dni"] else 0.0 for d in dni]


def test_przyciaganie_w_popycie_dni_i_strefy():
    dane = dane_domyslne()
    pule = pp.pule(dane, 5)
    n = len(pule["centrum"][KEBAB])
    maska = [1.0] + [0.0] * (n - 1)
    oferty = {KEBAB: {("A", "centrum"): _oferta("centrum", promocje=[_efekt(dane, "happy_hours", maska)]),
                      ("B", "centrum"): _oferta("centrum")}}
    pod = pp.podzial(dane, pule, oferty)
    a, b = pod[("A", "centrum")][KEBAB], pod[("B", "centrum")][KEBAB]
    assert a["dni"][0] > 1.1 * b["dni"][0] and a["dni"][1] == pytest.approx(b["dni"][1])
    assert a["objeci"]["happy_hours"][0] == pytest.approx(a["dni"][0]) and a["objeci"]["happy_hours"][1] == 0
    # zniżka studencka – tylko mieszkańcy stref akademickich
    oferty = {KEBAB: {("A", "akademickie"): _oferta("akademickie", promocje=[_efekt(dane, "studencka", [1.0] * n)]),
                      ("B", "akademickie"): _oferta("akademickie")}}
    pod = pp.podzial(dane, pule, oferty)
    a, b = pod[("A", "akademickie")][KEBAB], pod[("B", "akademickie")][KEBAB]
    assert a["strefy"]["akademickie"] > 1.1 * b["strefy"]["akademickie"]
    inne = [z for z in a["strefy"] if z not in ("akademickie", "politechnika") and b["strefy"].get(z)]
    assert inne and all(a["strefy"][z] == pytest.approx(b["strefy"][z]) for z in inne)
    # 2 za 1 – porcje to klienci plus porcje gratis
    oferty = {KEBAB: {("A", "centrum"): _oferta("centrum", promocje=[_efekt(dane, "dwa_za_jeden", [1.0] * n)])}}
    a = pp.podzial(dane, pule, oferty)[("A", "centrum")][KEBAB]
    assert a["porcje"].sum() == pytest.approx(2 * a["dni"].sum())


def test_rozliczenie_rabatow_porcji_i_doplat():
    dane = dane_domyslne()
    dwa = pm.rozlicz(10, 20.0, 5.0, {"dwa_za_jeden": 5.0}, [_efekt(dane, "dwa_za_jeden", [1])])
    assert dwa["przychod"] == pytest.approx(100) and dwa["typy"]["dwa_za_jeden"]["gratis"] == pytest.approx(5)
    z = dane.mapa["promocje"]["typy"]["zestaw"]
    zes = pm.rozlicz(10, 20.0, 10.0, {"zestaw": 10.0}, [_efekt(dane, "zestaw", [1])])
    assert zes["przychod"] == pytest.approx(200) and zes["doplaty"] == pytest.approx(10 * z["doplata"])
    assert zes["koszt_dodatkow"] == pytest.approx(10 * z["koszt_dodatku"])
    hh = dane.mapa["promocje"]["typy"]["happy_hours"]["rabat"]
    pol = pm.rozlicz(10, 20.0, 10.0, {"happy_hours": 5.0}, [_efekt(dane, "happy_hours", [1])])   # połowa objęta
    assert pol["przychod"] == pytest.approx(200 * (1 - hh / 2)) and pol["typy"]["happy_hours"]["rabat"] == pytest.approx(5 * 20 * hh)
    assert pm.rozlicz(10, 20.0, 10.0, {}, [])["przychod"] == pytest.approx(200)


def test_gra_zestaw_i_2za1_wyniki_kpir_rynek(monkeypatch):
    dodatki = {}
    bot = boty.decyzje_bota
    monkeypatch.setattr(boty, "decyzje_bota", lambda dane, stan, nazwa, *a, **kw: {**bot(dane, stan, nazwa, *a, **kw), **dodatki.get((nazwa, a[1]), {})})
    monkeypatch.setattr(boty, "_wybierz_lokal", lambda dane, stan, nazwa, *a: (_lokal({"A": "akademickie_1", "B": "akademickie_2"}[nazwa])["lokal"], None))
    g = _gra(("A", "nasladowca"), ("B", "nasladowca"))
    g.przelicz(wymus=True)
    g.przelicz(wymus=True)
    s0 = copy.deepcopy(g).przelicz(wymus=True)
    dodatki[("A", 3)] = {"promocje": [{"typ": "zestaw", "nazwa": "Zestaw Obiadowy", "danie": KEBAB}, {"typ": "nie_ma"}]}
    s = copy.deepcopy(g).przelicz(wymus=True)
    w = s.wyniki[3]["A"]
    p = w["promocje"]["promocje"][0]
    assert p["typ"] == "zestaw" and p["objeci"] > 0 and p["doplaty"] > 0 and "Zestaw Obiadowy" in p["tekst"] and "{" not in p["tekst"]
    kp = {x["opis"]: x for x in w["kpir"]["pozycje"]}
    stawka = rz.stawka_sprzedazy(g.dane, "napoj")
    assert kp[pm.OPIS_DOPLAT]["przychod"] == pytest.approx(p["doplaty"] / (1 + stawka), abs=0.05)
    assert kp[pm.OPIS_DODATKOW]["towary"] == pytest.approx(p["koszt_dodatkow"], abs=0.05)
    assert any(o.startswith(pm.OPIS_STARTU) for o in kp)
    assert [b["tekst"] for b in w["lista_bledow"] if b["zakladka"] == pm.ZAKLADKA] == ["Nieznana promocja: nie_ma."]
    assert s.rynek[3]["promocje"] == {"A": [{"typ": "zestaw", "rodzaj": "Zestaw z napojem", "nazwa": "Zestaw Obiadowy",
                                             "danie": KEBAB, "od_rundy": 3}]}
    # 2 za 1 – więcej chętnych, a przychód z porcji niższy niż bez promocji
    dodatki[("A", 3)] = {"promocje": [{"typ": "dwa_za_jeden", "nazwa": "Podwójnie", "danie": KEBAB}]}
    s = copy.deepcopy(g).przelicz(wymus=True)
    przed, po = s0.wyniki[3]["A"]["sprzedaz"][KEBAB], s.wyniki[3]["A"]["sprzedaz"][KEBAB]
    assert po["popyt"] > przed["popyt"]
    assert po["przychod"] < po["sprzedaz"] * g.dane.uslugi[KEBAB]["cena_preferowana"] * 2
    assert s.wyniki[3]["A"]["promocje"]["promocje"][0]["gratis"] > 0


def test_boty_wlaczaja_promocje_gdy_nadazaja():
    g = _gra(("Tani", "tani"), ("Prem", "premium"))
    g.dane.boty["ustawienia"]["min_obsluga_promocji"] = 0.0
    for _ in range(4):
        s = g.przelicz(wymus=True)
    assert [(p.typ, p.nazwa) for p in s.firmy["Tani"].promocje] == [("happy_hours", "Tanie Godziny Nocnego"), ("studencka", "Indeks Głodomora")]
    assert [p.typ for p in s.firmy["Prem"].promocje] == ["karta"] and s.firmy["Prem"].promocje[0].od_rundy == 3
    g.dane.boty["ustawienia"]["min_obsluga_promocji"] = 1.0   # kuchnia nie nadąża – bot wyłącza promocje
    s = g.przelicz(wymus=True)
    if any(sum(v["sprzedaz"] for v in s.wyniki[4][n]["sprzedaz"].values()) < sum(v["popyt"] for v in s.wyniki[4][n]["sprzedaz"].values())
           for n in ("Tani",)):
        assert not s.firmy["Tani"].promocje


def test_widok_api_i_gra_bez_lokali():
    from api.prezentacja import widok
    g = _gra()
    _runda(g, A=_lokal("centrum_3"))
    _runda(g)
    g.ustaw_decyzje("A", {"promocje": [{"typ": "happy_hours", "nazwa": "Wtorek Cudów"}]})
    v = widok(g, "A")
    r = v["promocje"]
    assert {t["id"] for t in r["rodzaje"]} == set(g.dane.mapa["promocje"]["typy"]) and r["limit"] == 2
    assert [(x["typ"], x["nazwa"], x["nowa"]) for x in r["aktywne"]] == [("happy_hours", "Wtorek Cudów", True)]
    assert r["nowe"][0]["typ"] == "happy_hours"
    assert any(p["opis"].startswith(pm.OPIS_STARTU) for p in v["koszty_decyzji"])


# --- pamięć klientów po promocji (decyzja autora 7.11.2026) ---

PAMIEC = {"udzial": 0.4, "zanik": 0.2, "maks": 0.25, "prog": 0.01, "pewnosc": "zalozenie", "zrodlo": "test B7"}


def _z_pamiecia(dane, **zmiany):
    d = copy.deepcopy(dane)
    d.mapa["promocje"]["pamiec"] = {**PAMIEC, **zmiany}
    return d


def test_pamiec_po_promocji_zanika_i_daje_sie_wylaczyc(firma_botow):
    dane0, f0 = firma_botow
    dane = _z_pamiecia(dane0)
    hh = pm.zasady(dane)["typy"]["happy_hours"]
    f = copy.deepcopy(f0)
    _ustaw(dane, f, [{"typ": "happy_hours", "nazwa": "H"}], runda=3)
    _ustaw(dane, f, [], runda=6)   # ostatni tydzień promocji – runda 5
    [m] = f.pamiec_promocji
    sila = PAMIEC["udzial"] * pm.przyciaganie(hh, 3, 5)
    assert (m.typ, m.danie, m.od_rundy) == ("happy_hours", None, 6) and m.sila == pytest.approx(sila)
    P = pm.zasady_pamieci(dane)
    assert pm.sila_pamieci(P, m, 6) == pytest.approx(sila, abs=1e-4)
    assert pm.sila_pamieci(P, m, 8) == pytest.approx(sila * 0.8 ** 2, abs=1e-4)   # −20% na tydzień
    assert pm.sila_pamieci(P, m, 40) == 0   # poniżej progu – koniec
    pm.ustaw(dane, f, {}, 40, Ksiega(vat=dane.podatki["vat"]), Rachunek())
    assert not f.pamiec_promocji   # wygasła pamięć znika ze stanu
    # zapis stanu: pamięć przechodzi przez model_dump / model_validate jak inne liczniki firmy
    _ustaw(dane, f, [{"typ": "karta", "nazwa": "K"}], runda=3)
    _ustaw(dane, f, [], runda=7)
    assert type(f).model_validate(f.model_dump()).pamiec_promocji == f.pamiec_promocji != []
    # wyłączenie: udzial 0 albo brak sekcji (dane zamrożone) – promocja bez trwałego skutku
    for d in (_z_pamiecia(dane0, udzial=0), dane0):
        g = copy.deepcopy(f0)
        _ustaw(d, g, [{"typ": "happy_hours", "nazwa": "H"}], runda=3)
        _ustaw(d, g, [], runda=6)
        assert not g.pamiec_promocji and pm.zasady_pamieci(d) is None
    # promocja włączona i wyłączona w tej samej rundzie nie działała – nie ma czego pamiętać
    g = copy.deepcopy(f0)
    _ustaw(dane, g, [{"typ": "zestaw", "nazwa": "Z", "danie": "frytki"}], runda=4)
    pm._zapamietaj(dane, g, g.promocje[0], 4)
    assert not g.pamiec_promocji


def test_pamiec_sumuje_kolejne_promocje_z_sufitem(firma_botow):
    dane0, f0 = firma_botow
    dane = _z_pamiecia(dane0, maks=0.3)
    P, typy = pm.zasady_pamieci(dane), pm.zasady(dane)["typy"]
    f = copy.deepcopy(f0)
    _ustaw(dane, f, [{"typ": "happy_hours", "nazwa": "H"}], runda=3)
    _ustaw(dane, f, [], runda=5)
    pierwsza = f.pamiec_promocji[0].sila
    # ta sama promocja znów trwa: jej pamięć czeka (bez podwójnego liczenia), po końcu dodaje się do resztki
    _ustaw(dane, f, [{"typ": "happy_hours", "nazwa": "H"}], runda=6)
    assert pm.pamiec(dane, f, 6) == []
    _ustaw(dane, f, [], runda=8)
    [m] = f.pamiec_promocji
    nowa = PAMIEC["udzial"] * pm.przyciaganie(typy["happy_hours"], 6, 7)
    assert m.od_rundy == 8 and m.sila == pytest.approx(min(P["maks"], nowa + pierwsza * 0.8 ** 3), abs=1e-4)
    # różne promocje: każda ma swoją pamięć, a suma działającej pamięci firmy – najwyżej maks
    _ustaw(dane, f, [{"typ": "dwa_za_jeden", "nazwa": "D", "danie": "frytki"}, {"typ": "studencka", "nazwa": "S"}],
           runda=8)
    _ustaw(dane, f, [], runda=9)
    assert {x.typ for x in f.pamiec_promocji} == {"happy_hours", "dwa_za_jeden", "studencka"}
    surowa = sum(pm.sila_pamieci(P, x, 9) for x in f.pamiec_promocji)
    dziala = pm.pamiec(dane, f, 9)
    assert surowa > P["maks"] and sum(s for _, s in dziala) == pytest.approx(P["maks"], abs=1e-3)
    # sufit przy łączeniu tej samej promocji
    g = copy.deepcopy(f0)
    d2 = _z_pamiecia(dane0, maks=0.1)
    for r in (3, 5, 7):
        _ustaw(d2, g, [{"typ": "happy_hours", "nazwa": "H"}], runda=r)
        _ustaw(d2, g, [], runda=r + 1)
    assert g.pamiec_promocji[0].sila == pytest.approx(0.1)


def test_pamiec_w_popycie_bez_rabatu(firma_botow):
    dane0, f0 = firma_botow
    dane = _z_pamiecia(dane0)
    f = copy.deepcopy(f0)
    _ustaw(dane, f, [{"typ": "zestaw", "nazwa": "Z", "danie": "frytki"}, {"typ": "happy_hours", "nazwa": "H"}])
    _ustaw(dane, f, [], runda=5)
    dni = pp.dni_rundy(dane, 5)
    oferty = {"lok": {u: {"cena": 10.0} for u in f.ceny}}
    pm.efekty_ofert(dane, f, oferty, 5, dni)
    e = {x["typ"]: x for x in oferty["lok"]["frytki"]["promocje"]}
    assert set(e) == {pm.PAMIEC + "zestaw", pm.PAMIEC + "happy_hours"}
    assert [x["typ"] for x in oferty["lok"]["napoj"]["promocje"]] == [pm.PAMIEC + "happy_hours"]   # danie z pamięci
    hh = e[pm.PAMIEC + "happy_hours"]
    assert hh["rabat"] == 0 and hh["porcje"] == 1 and hh["doplata"] == 0 and hh["koszt_dodatku"] == 0
    assert list(hh["maska"]) == [1.0 if d.weekday() in pm.zasady(dane)["typy"]["happy_hours"]["dni"] else 0.0 for d in dni]
    assert hh["przyciaganie"] == pytest.approx(dict((m.typ, s) for m, s in pm.pamiec(dane, f, 5))["happy_hours"])
    # zakładka: bieżąca pamięć i zasady (udział, zanik, sufit); bez sekcji pamięci – None
    v = pm.widok(dane, f, 5, None, None)
    assert v["pamiec_zasady"] == {k: PAMIEC[k] for k in ("udzial", "zanik", "maks")}
    assert sorted(x["typ"] for x in v["pamiec"]) == ["happy_hours", "zestaw"] and v["pamiec"][0]["po_rundzie"] == 4
    assert pm.widok(dane0, f0, 5, None, None)["pamiec_zasady"] is None
    # przychód bez rabatu – pamięć tylko przyciąga
    assert pm.rozlicz(10, 20.0, 10.0, {hh["typ"]: 6.0}, [hh])["przychod"] == pytest.approx(200)
    # prognozy z danych publicznych – bez pamięci konkurencji
    oferty = {"lok": {u: {"cena": 10.0} for u in f.ceny}}
    pm.efekty_ofert(dane, f, oferty, 5, dni, z_pamiecia=False)
    assert not any(o.get("promocje") for o in oferty["lok"].values())
    # w podziale pul pamięć przyciąga klientów jak promocja
    pule = pp.pule(dane, 5)
    n = len(pule["centrum"][KEBAB])
    ef = {**hh, "maska": np.ones(n)}
    pod = pp.podzial(dane, pule, {KEBAB: {("A", "centrum"): _oferta("centrum", promocje=[ef]),
                                          ("B", "centrum"): _oferta("centrum")}})
    assert pod[("A", "centrum")][KEBAB]["dni"].sum() > pod[("B", "centrum")][KEBAB]["dni"].sum()


def test_gra_pamiec_po_promocji_zwieksza_popyt(monkeypatch):
    dodatki = {}
    bot = boty.decyzje_bota
    monkeypatch.setattr(boty, "decyzje_bota", lambda dane, stan, nazwa, *a, **kw: {**bot(dane, stan, nazwa, *a, **kw), **dodatki.get((nazwa, a[1]), {})})
    monkeypatch.setattr(boty, "_wybierz_lokal", lambda dane, stan, nazwa, *a: (_lokal({"A": "akademickie_1", "B": "akademickie_2"}[nazwa])["lokal"], None))
    dodatki[("A", 3)] = {"promocje": [{"typ": "studencka", "nazwa": "Indeks"}]}
    dodatki[("A", 4)] = {"promocje": []}
    wyniki = {}
    for udzial in (0.0, 0.4):
        g = _gra(("A", "nasladowca"), ("B", "nasladowca"), dane=_z_pamiecia(dane_domyslne(), udzial=udzial))
        for _ in range(4):
            s = g.przelicz(wymus=True)
        wyniki[udzial] = s
    bez, z = wyniki[0.0], wyniki[0.4]
    popyt = lambda s, r: sum(v["popyt"] for v in s.wyniki[r]["A"]["sprzedaz"].values())   # noqa: E731
    assert popyt(z, 3) == popyt(bez, 3) and popyt(z, 4) > popyt(bez, 4)
    assert not bez.firmy["A"].pamiec_promocji and [m.typ for m in z.firmy["A"].pamiec_promocji] == ["studencka"]
    [p] = z.wyniki[4]["A"]["promocje"]["pamiec"]
    assert p["typ"] == "studencka" and p["po_rundzie"] == 3 and p["przyciaganie"] > 0 and p["objeci"] > 0
    assert z.wyniki[4]["A"]["promocje"]["promocje"] == []
