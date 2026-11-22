"""Poprawki 2 (sprawy 17/18): godziny pracy każdej osoby w wynikach rundy (Ludzie ▸ Zespół, wskaźniki czasu pracy).

Przepracowane = część pojemności stanowiska zajęta obsługą klientów × dostępne godziny (etat × forma zatrudnienia);
kasa – godziny kas lokalu dzielone wg pojemności kasjerów. Pole `wykorzystanie` (zadowolenie, karta) bez zmian."""
import pytest
from pomocnicze import _gra, _kandydat, _lokal, _runda, _z

from silnik.ludzie import formy as fz
from silnik.model import WlascicielNaStanowisku
from silnik.runda import _czas_pracy


def _kasjer(s, pomin=()):
    return next(k for k in s.kandydaci if k["zawod"] == "Kasjer" and k["id"] not in pomin and not k.get("student"))


@pytest.fixture(scope="module")
def gra():
    g = _gra(("A", None), ("B", None))
    s = _runda(g, A={**_lokal("centrum_3"), "stanowiska": {"kuchnia": 2, "kasa": 2}})
    k1, c1 = _kandydat(s, 2), _kasjer(s)
    s = _runda(g, A={"zatrudnij": [_z(k1, 1), {"kandydat": c1["id"], "typ": "kasa", "nr": 1}]})
    assert {k1["id"], c1["id"]} <= set(s.firmy["A"].pracownicy)
    return g, s, k1["id"], c1["id"]


def _obsluga(kuchnia=None, kasa=0.0):
    return {"godziny_stanowisk": kuchnia or {}, "godziny_kasy": kasa, "liczba_kasjerow": 2}


def test_kuchnia_godziny_z_etatu_i_wydajnosci(gra):
    g, s, k1, _ = gra
    f = s.firmy["A"]
    p = f.pracownicy[k1]
    poj = 40 * p.wydajnosc   # pełny etat, umowa o pracę
    x = _czas_pracy(g.dane, f, _obsluga({p.stanowisko: poj / 2}), 40, p)
    assert x == {"godziny_pracy": 20.0, "godziny_dostepne": 40.0, "obciazenie": 0.5}
    assert _czas_pracy(g.dane, f, _obsluga({p.stanowisko: poj * 3}), 40, p)["obciazenie"] == 1.0   # nie ponad 100%
    assert _czas_pracy(g.dane, f, None, 40, p) == {"godziny_pracy": 0.0, "godziny_dostepne": 40.0, "obciazenie": 0.0}


def test_kasa_dzielona_wg_pojemnosci_kasjerow(gra):
    g, s, _, c1 = gra
    f = s.firmy["A"].model_copy(deep=True)
    kasa1 = f.stanowisko("kasa", 1)   # druga osoba na kasie tego lokalu – na pół etatu
    p1 = f.pracownicy[c1]
    p2 = f.pracownicy["drugi"] = p1.model_copy(update={"id": "drugi", "umowa": "pol_etatu", "stanowisko": 2})
    f.stanowiska.append(kasa1.model_copy(update={"nr": 2, "pracownik": "drugi"}))
    for st in f.stanowiska_typu("kasa"):   # kasa liczy się dopiero z kompletem sprzętu kasy
        st.sprzet = {n: 1 for n in g.dane.sprzet_kasy}
    razem = sum(f.godziny_stanowiska(st, 40, g.dane) for st in f.stanowiska_typu("kasa"))
    x1 = _czas_pracy(g.dane, f, _obsluga(kasa=razem / 4), 40, p1)
    x2 = _czas_pracy(g.dane, f, _obsluga(kasa=razem / 4), 40, p2)
    assert x1["obciazenie"] == x2["obciazenie"] == 0.25          # obie osoby zajęte w tej samej części
    assert x1["godziny_dostepne"] == 40 and x2["godziny_dostepne"] == pytest.approx(40 * fz.etat(g.dane, p2), abs=0.1)
    assert x2["godziny_pracy"] == pytest.approx(x2["godziny_dostepne"] / 4, abs=0.1)
    # w grze z lokalami godziny kas liczą się osobno dla każdego lokalu
    obce = {**_obsluga(kasa=razem), "godziny_kasy_lokali": {"inny_lokal": razem}}
    assert _czas_pracy(g.dane, f, obce, 40, p1)["godziny_pracy"] == 0.0


def test_wlasciciel_na_stanowisku(gra):
    g, s, *_ = gra
    f = s.firmy["A"].model_copy(deep=True)
    f.wlasciciel_na = WlascicielNaStanowisku(typ="kuchnia", nr=2, godziny=10, zawod="Kucharz", zadowolenie_klientow=0.5,
                                             ryzyko_pomylki=0.1)
    assert _czas_pracy(g.dane, f, _obsluga({2: 5.0}), 40) == {"godziny_pracy": 5.0, "godziny_dostepne": 10.0, "obciazenie": 0.5}


def test_wyniki_rundy_maja_godziny_kazdej_osoby(gra):
    _, s, *_ = gra
    for p in s.wyniki[s.runda]["A"]["pracownicy"]:
        assert 0 <= p["godziny_pracy"] <= p["godziny_dostepne"] and 0 <= p["obciazenie"] <= 1
        assert "wykorzystanie" in p


@pytest.mark.dane_gry
def test_pol_etatu_ma_polowe_godzin():
    g = _gra(("A", None), ("B", None))
    s = _runda(g, A={**_lokal("centrum_3"), "stanowiska": {"kuchnia": 1}})
    k = _kandydat(s, 1)
    s = _runda(g, A={"zatrudnij": [{**_z(k, 1), "umowa": "pol_etatu"}]})
    w = next(x for x in s.wyniki[s.runda]["A"]["pracownicy"] if x["id"] == k["id"])
    assert w["umowa"] == "pol_etatu" and w["godziny_dostepne"] == 18.0 and 0 <= w["godziny_pracy"] <= 18.0   # pół etatu, 10% urlopu
