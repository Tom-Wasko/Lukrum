"""Propozycje klientów: częstotliwość, raz w grze, `gdy`, odpowiedź domyślna, rzut `szansa`, skutki do rundy."""
import pytest
from pomocnicze import _gra

from silnik.losowosc import strumien
from silnik.wnetrza import propozycje as pr
from silnik.wnetrza import ustawienia as us
from silnik.wnetrza import widok as wd


def wsk(ocena):
    return lambda r: {"runda": r, "ocena": ocena}


def wybory(dane, firma="A", ziarno=1, ocena=4.0, rund=12):
    return [(p or {}).get("id") for p in (pr.propozycja_rundy(dane, ziarno, firma, r, wsk(ocena))
                                          for r in range(1, rund + 1))]


def test_najwyzej_jedna_co_ile_rund_od_rundy_zasad(dane_w):
    w = wybory(dane_w)
    # zasady testowe: od rundy 2, co 2 rundy; propozycje „trzecia” dopiero od rundy 4
    assert w[0] is None and [i for i, x in enumerate(w, 1) if x] == [2, 4, 6]
    assert all(w[i - 1] is None for i in (1, 3, 5, 7, 8, 9, 10, 11, 12))


def test_kazda_propozycja_najwyzej_raz_w_grze(dane_w):
    for firma in ("A", "B", "Ala", "Ola", "X"):
        w = [x for x in wybory(dane_w, firma=firma, ziarno=7) if x]
        assert len(w) == len(set(w)) == 3 and "warunkowa" not in w   # „warunkowa” wymaga oceny 99


def test_wybor_deterministyczny_i_zalezy_od_firmy(dane_w):
    assert wybory(dane_w) == wybory(dane_w)
    pierwsze = {wybory(dane_w, firma=f)[1] for f in "ABCDEFGHIJKLMNOP"}
    assert pierwsze == {"pierwsza", "druga"}
    assert {wybory(dane_w, ziarno=z)[1] for z in range(30)} == {"pierwsza", "druga"}


def test_warunek_gdy_na_wskaznikach(dane_w):
    assert not any("warunkowa" in (wybory(dane_w, firma=f, ocena=4.0)) for f in "ABCDEFGH")
    assert any("warunkowa" in wybory(dane_w, firma=f, ocena=100.0) for f in "ABCDEFGHIJKLMNOPQRST")
    # brak wskaźnika: warunek niespełniony, a wskaźniki liczone są tylko, gdy jakaś propozycja ma `gdy`
    assert "warunkowa" not in [(pr.propozycja_rundy(dane_w, 1, "A", r, lambda r: {"runda": r}) or {}).get("id")
                               for r in range(1, 12)]


def test_zapis_i_odczyt_odpowiedzi(dane_w):
    p = pr.propozycje(dane_w)["pierwsza"]
    konf = {}
    assert pr.wybrana(konf, "A", 2) is None
    pr.zapisz_odpowiedz(konf, "A", 2, p, "tak")
    assert pr.wybrana(konf, "A", 2) == {"propozycja": "pierwsza", "odpowiedz": "tak"}
    pr.zapisz_odpowiedz(konf, "A", 2, p, "odmowa")   # zmiana zdania do końca rundy
    assert pr.wybrana(konf, "A", 2)["odpowiedz"] == "odmowa" and pr.wybrana(konf, "B", 2) is None
    with pytest.raises(ValueError, match="Nie ma takiej odpowiedzi"):
        pr.zapisz_odpowiedz(konf, "A", 2, p, "kawa")


def test_bez_odpowiedzi_liczy_sie_odpowiedz_z_danych(dane_w):
    p = pr.propozycje(dane_w)["pierwsza"]
    assert pr.obowiazujaca(dane_w, p, None)["id"] == "odmowa"
    assert pr.obowiazujaca(dane_w, p, "tak")["id"] == "tak"


def test_skutki_bez_rzutu(dane_w):
    p = pr.propozycje(dane_w)["pierwsza"]
    los = strumien(1, 2, "wnetrza", "A", "skutki")
    assert pr.skutki_propozycji(dane_w, p, "tak", los) == {"porcje": 10, "opinia": 0.1}
    assert pr.skutki_propozycji(dane_w, p, "odmowa", los) == {}
    assert pr.skutki_propozycji(dane_w, p, p["odpowiedzi"][0], los) == {"porcje": 10, "opinia": 0.1}


def test_szansa_rzut_daje_skutki_albo_porazke(dane_w):
    p = pr.propozycje(dane_w)["druga"]
    wyniki = [pr.rozstrzygnij(p, pr.obowiazujaca(dane_w, p, "ryzyko"), strumien(z, 2, "wnetrza", "A", "skutki"))
              for z in range(400)]
    assert {(tuple(s.items()), u) for s, u in wyniki} == {((("porcje", 40),), True), ((("darmowe_porcje", 8),), False)}
    assert 0.4 < sum(u for _, u in wyniki) / 400 < 0.6
    a = pr.skutki_propozycji(dane_w, p, "ryzyko", strumien(5, 2, "wnetrza", "A", "skutki"))
    assert a == pr.skutki_propozycji(dane_w, p, "ryzyko", strumien(5, 2, "wnetrza", "A", "skutki"))


@pytest.fixture
def gra(dane_w):
    g = _gra(("A", None), ("B", "tani"), rund=8, dane=dane_w)
    for _ in range(3):
        g.przelicz(wymus=True)
    return g


def test_skutki_rundy_z_odpowiedzia_i_bez(gra):
    g = gra
    r = 2
    stan = g.stan(r - 1)
    p = wd.propozycja(g.dane, stan, g.konfiguracja, "A", r)
    assert p and p["id"] in {"pierwsza", "druga"}
    bez = wd.skutki_rundy(g.dane, stan, g.konfiguracja, "A", r)
    assert bez["odpowiedz"] == "odmowa" and bez["skutki"] == {} and bez["propozycja"] == p["id"]
    odp = next(o["id"] for o in p["odpowiedzi"] if o["id"] != "odmowa")
    pr.zapisz_odpowiedz(g.konfiguracja, "A", r, p, odp)
    z = wd.skutki_rundy(g.dane, stan, g.konfiguracja, "A", r)
    assert z["odpowiedz"] == odp and z["skutki"] and z == wd.skutki_rundy(g.dane, stan, g.konfiguracja, "A", r)
    assert wd.skutki_rundy(g.dane, stan, g.konfiguracja, "A", 1) is None   # rundy bez propozycji
    assert wd.skutki_rundy(g.dane, g.stan(2), g.konfiguracja, "A", 3) is None


def test_wylaczone_propozycje_nie_daja_skutkow(gra):
    g = gra
    assert wd.skutki_rundy(g.dane, g.stan(1), g.konfiguracja, "A", 2) is not None
    us.ustaw(g.dane, g.konfiguracja, {"propozycje": False})
    assert wd.skutki_rundy(g.dane, g.stan(1), g.konfiguracja, "A", 2) is None
    assert wd.propozycja(g.dane, g.stan(1), g.konfiguracja, "A", 2) is None
    us.ustaw(g.dane, g.konfiguracja, {"propozycje": True})
    assert wd.skutki_rundy(g.dane, g.stan(1), g.konfiguracja, "A", 2) is not None


def test_ustawienia_mistrza_gry(gra):
    g = gra
    assert us.ustawione(g.dane, g.konfiguracja) == dict.fromkeys(("cena_smak", "plotki", "propozycje", "wos"), True)
    assert us.ustaw(g.dane, g.konfiguracja, {"wos": False})["wos"] is False
    assert us.wlaczone(g.dane, g.konfiguracja) == {"cena_smak", "plotki", "propozycje"}
    assert g.konfiguracja["wnetrza"]["dymki"]["wos"] is False
    for zle in ({"kawa": True}, {"wos": "nie"}):
        with pytest.raises(ValueError):
            us.ustaw(g.dane, g.konfiguracja, zle)
    assert not hasattr(us, "filtr_gracza")   # gracz nie wyłącza dymków, robi to tylko mistrz gry


def test_zmiana_ustawien_dziala_od_nastepnego_wyliczenia(gra):
    g = gra
    s = g.stan(2)
    przed = wd.dymki(g.dane, s, g.konfiguracja, "A", 3)
    us.ustaw(g.dane, g.konfiguracja, {"cena_smak": False, "plotki": False, "wos": False})
    po = wd.dymki(g.dane, s, g.konfiguracja, "A", 3)
    assert all(x["kto"] == "wujek" for x in po)
    us.ustaw(g.dane, g.konfiguracja, {"cena_smak": True, "plotki": True, "wos": True})
    assert wd.dymki(g.dane, s, g.konfiguracja, "A", 3) == przed   # filtr nie zmienia losowania
