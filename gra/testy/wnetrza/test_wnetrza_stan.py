"""Wskaźniki i stan wnętrza z wyników rundy firmy."""
import pytest
from pomocnicze import _gra

from silnik.wnetrza import stan as st


@pytest.fixture(scope="module")
def gra_po_rundach(dane_w):
    g = _gra(("A", "zrownowazony"), ("B", "tani"), rund=6, dane=dane_w)
    for _ in range(4):
        g.przelicz()
    return g


def test_przed_pierwsza_runda_jest_tylko_numer_rundy(dane_w):
    g = _gra(("A", "zrownowazony"), ("B", "tani"), rund=6, dane=dane_w)
    assert st.wskazniki(g.dane, g.stan(0), "A", 1) == {"runda": 1}


def test_wskazniki_z_ostatniej_rundy(gra_po_rundach):
    g = gra_po_rundach
    w = st.wskazniki(g.dane, g.stan(4), "A", 5)
    assert w["runda"] == 5
    assert {"cena_wzgledem_strefy", "cena", "cena_strefy", "ocena", "kolejka", "brak_dan", "nastroj_zespolu"} <= set(w)
    assert 0 <= w["kolejka"] <= 1 and 0 <= w["brak_dan"] <= 1 and 0 <= w["nastroj_zespolu"] <= 100
    assert 1 <= w["ocena"] <= 5
    assert w["cena"] == pytest.approx(w["cena_strefy"] * w["cena_wzgledem_strefy"], rel=0.01)
    sp = g.stan(4).wyniki[4]["A"]["sprzedaz"]
    pop = sum(v["popyt"] for v in sp.values())
    utracone = sum(v["utracona"] for v in sp.values())
    assert w["kolejka"] + w["brak_dan"] == pytest.approx(utracone / pop, abs=1e-3)


def test_zmiana_ceny_porownuje_te_same_dania(gra_po_rundach):
    g = gra_po_rundach
    s = g.stan(4)
    w = st.wskazniki(g.dane, s, "A", 5)
    wsp = [u for u in s.wyniki[4]["A"]["sprzedaz"] if u in s.wyniki[3]["A"]["sprzedaz"]]
    a = sum(s.wyniki[4]["A"]["sprzedaz"][u]["cena_po_rabacie"] for u in wsp)
    b = sum(s.wyniki[3]["A"]["sprzedaz"][u]["cena_po_rabacie"] for u in wsp)
    assert w["zmiana_ceny"] == pytest.approx((a / b - 1) * 100, abs=0.1)


def test_brak_wskaznika_gdy_nie_da_sie_policzyc(gra_po_rundach):
    g = gra_po_rundach
    s = g.stan(4).kopia()
    s.wyniki = {4: {"A": {**s.wyniki[4]["A"], "sprzedaz": {}, "pracownicy": []}}}   # zero sprzedaży i ludzi
    for lok in s.firmy["A"].lokale:
        lok.ocena = None
    w = st.wskazniki(g.dane, s, "A", 5)
    assert w == {"runda": 5}


def test_nastroj_ze_skali_zadowolenia(dane_w):
    assert st.nastroj(dane_w, 0.75) == 0 and st.nastroj(dane_w, 1.05) == 100 and st.nastroj(dane_w, 0.9) == 50
    assert st.nastroj(dane_w, 0.5) == 0 and st.nastroj(dane_w, 2.0) == 100 and st.nastroj(dane_w, None) is None


@pytest.mark.parametrize(("nastroj", "wykorzystanie", "mina"), [
    (30, 0.1, "smutna"), (30, 0.95, "smutna"), (60, 0.9, "zmeczona"), (80, 0.9, "zmeczona"),
    (80, 0.3, "wesola"), (60, 0.3, "neutralna"), (None, 0.3, "neutralna"), (None, 0.9, "zmeczona")])
def test_mina_z_nastroju_i_zmeczenia(dane_w, nastroj, wykorzystanie, mina):
    assert st.mina(dane_w, nastroj, wykorzystanie) == mina


def test_stan_wnetrza(gra_po_rundach):
    g = gra_po_rundach
    s = g.stan(4)
    w = st.stan_wnetrza(g.dane, s, "A")
    assert w["runda"] == 4 and w["lokal"] == s.firmy["A"].lokale[0].id
    assert {p["miejsce"] for p in w["pracownicy"]} <= {"lada", "kuchnia"} and w["pracownicy"]
    assert {p["miejsce"] for p in w["pracownicy"]} == {"lada", "kuchnia"}
    assert all(p["mina"] in {"smutna", "zmeczona", "wesola", "neutralna"} for p in w["pracownicy"])
    assert w["wyposazenie"] == list(s.firmy["A"].lokale[0].wyposazenie or s.firmy["A"].wyposazenie)
    assert isinstance(w["udogodnienia"], list) and 0 <= w["tlok"] <= 1
    assert w["tlok"] == pytest.approx(sum(p["wykorzystanie"] for p in w["pracownicy"]) / len(w["pracownicy"]), abs=1e-3)
    assert st.stan_wnetrza(g.dane, s, "A", "nie_ma_takiego")["pracownicy"] == []


def test_okazje_wujka(gra_po_rundach):
    g = gra_po_rundach
    k = st.kontekst(g.dane, g.stan(0), "A", 1, g.konfiguracja["ziarno"], 6)
    assert k["okazje"] == ["start"]
    k = st.kontekst(g.dane, g.stan(4), "A", 6, g.konfiguracja["ziarno"], 6)
    assert "ostatnia_runda" in k["okazje"] and "start" not in k["okazje"]


def test_pierwsza_strata_i_rekord(gra_po_rundach):
    g = gra_po_rundach
    s = g.stan(4).kopia()
    kpir = {r: s.wyniki[r]["A"]["kpir"] for r in (1, 2, 3, 4)}
    for r, (netto, przychody) in {1: (10, 100), 2: (10, 200), 3: (10, 300), 4: (-5, 400)}.items():
        kpir[r].update(dochod_netto=netto, przychody=przychody)
    k = st.kontekst(g.dane, s, "A", 5, 1, 6)
    assert {"pierwsza_strata", "rekord"} <= set(k["okazje"])
    kpir[2]["dochod_netto"] = -1   # strata była już wcześniej
    kpir[4]["przychody"] = 250     # nie rekord
    assert not {"pierwsza_strata", "rekord"} & set(st.kontekst(g.dane, s, "A", 5, 1, 6)["okazje"])


def test_kontekst_plotek_z_konkurencji_i_parkow(gra_po_rundach):
    g = gra_po_rundach
    k = st.kontekst(g.dane, g.stan(4), "A", 5, g.konfiguracja["ziarno"], 6)
    assert [x["konkurent"] for x in k["konkurencja"]] == ["B"]
    assert k["konkurencja"][0]["dzielnica"] in {s["nazwa"] for s in g.dane.mapa["strefy"].values()}
    assert all({"park", "tytul"} == set(x) for x in k["park"])
    assert all({"wydarzenie"} == set(x) for x in k["kalendarz"])
