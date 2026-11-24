"""Okazje wujka (podróż 04, Z13): każda wykrywana w swojej rundzie, progi z danych, pierwszeństwo, 3 kwestie na okazję,
najwyżej jeden dymek wujka na rundę, postać przy ladzie tylko w rundzie okazji."""
import copy

import pytest
from pomocnicze import _gra

from silnik.wnetrza import dymki as dy
from silnik.wnetrza import stan as st
from silnik.wnetrza.schematy import OKAZJE

BOGATE = {"runda": 3, "cena_wzgledem_strefy": 1.3, "cena": 20.0, "cena_strefy": 15.0, "ocena": 4.5, "kolejka": 0.2,
          "brak_dan": 0.0, "zmiana_ceny": 8.0, "nastroj_zespolu": 60.0}


TEKSTY_TESTOWE = {"ostatnia_runda": "WUJ-KONIEC", "koniec_polrocza": "WUJ-POLROCZE", "pierwsza_strata": "WUJ-STRATA",
                  "debet": "WUJ-DEBET", "kontrola_sanepidu": "WUJ-SANEPID", "pierwszy_kredyt": "WUJ-KREDYT",
                  "pierwsza_filia": "WUJ-FILIA", "spadek_nastroju": "WUJ-NASTROJ", "rekord": "WUJ-REKORD",
                  "start": "WUJ-START"}


@pytest.fixture(scope="session")
def dane_gry():
    from pomocnicze import DANE_GRY

    from silnik.dane import Dane
    return Dane(DANE_GRY)


@pytest.fixture(scope="module")
def gra_po_rundach(dane_w):
    g = _gra(("A", "zrownowazony"), ("B", "tani"), rund=6, dane=dane_w)
    for _ in range(4):
        g.przelicz()
    return g


def _stan4(g):
    return copy.deepcopy(g.stan(4))


def _okazje(g, s, biezaca=5, liczba_rund=6):
    return set(st.kontekst(g.dane, s, "A", biezaca, 1, liczba_rund)["okazje"])


def test_okazja_debet_tylko_przy_wejsciu_w_debet(gra_po_rundach):
    g = gra_po_rundach
    s = _stan4(g)
    s.wyniki[3]["A"]["debet"] = 0.0
    s.wyniki[4]["A"]["debet"] = 150.0
    assert "debet" in _okazje(g, s)
    s.wyniki[3]["A"]["debet"] = 50.0   # już był na minusie: wujek nie powtarza
    assert "debet" not in _okazje(g, s)
    s.wyniki[3]["A"]["debet"] = 0.0
    s.wyniki[4]["A"]["debet"] = 0.0
    assert "debet" not in _okazje(g, s)


def test_okazja_kontrola_sanepidu(gra_po_rundach):
    g = gra_po_rundach
    s = _stan4(g)
    s.wyniki[4]["A"]["urzad"] = {"kontrola": {"kontrola": False}}
    assert "kontrola_sanepidu" not in _okazje(g, s)
    s.wyniki[4]["A"]["urzad"] = {"kontrola": {"kontrola": True, "mandat": 0.0}}
    assert "kontrola_sanepidu" in _okazje(g, s)
    s.wyniki[4]["A"]["urzad"] = None
    assert "kontrola_sanepidu" not in _okazje(g, s)


def test_okazja_pierwszy_kredyt(gra_po_rundach):
    g = gra_po_rundach
    s = _stan4(g)
    for r in (1, 2, 3, 4):
        s.wyniki[r]["A"]["bank"]["poczatek"]["nowe_kredyty"] = []
    assert "pierwszy_kredyt" not in _okazje(g, s)
    s.wyniki[4]["A"]["bank"]["poczatek"]["nowe_kredyty"] = [7]
    assert "pierwszy_kredyt" in _okazje(g, s)
    s.wyniki[2]["A"]["bank"]["poczatek"]["nowe_kredyty"] = [3]   # wcześniej już był kredyt
    assert "pierwszy_kredyt" not in _okazje(g, s)


def test_okazja_pierwsza_filia(gra_po_rundach):
    g = gra_po_rundach
    s = _stan4(g)
    assert "pierwsza_filia" not in _okazje(g, s)
    pierwszy = s.firmy["A"].lokale[0]
    s.firmy["A"].lokale.append(pierwszy.model_copy(update={"id": "filia_x", "od_rundy": 4, "dziala_od": 5}))
    assert "pierwsza_filia" in _okazje(g, s)
    assert "pierwsza_filia" not in _okazje(g, s, biezaca=6)   # w następnej rundzie to już nie nowość


def test_okazja_spadek_nastroju_prog_z_danych(gra_po_rundach):
    g = gra_po_rundach
    sil = g.dane.wnetrza["silnik"]
    prog = sil["okazje"]["spadek_nastroju"]
    s = _stan4(g)

    def ustaw(r, zadowolenie):
        for p in s.wyniki[r]["A"]["pracownicy"]:
            p["zadowolenie"] = zadowolenie
    ustaw(3, 1.0)
    ustaw(4, 1.0)
    assert "spadek_nastroju" not in _okazje(g, s)
    prog_zad = prog / 100 * (sil["nastroj"]["zadowolenie_sto"] - sil["nastroj"]["zadowolenie_zero"])
    ustaw(4, 1.0 - prog_zad - 0.01)   # spadek odrobinę ponad próg
    assert "spadek_nastroju" in _okazje(g, s)
    ustaw(4, 1.0 - prog_zad + 0.01)   # odrobinę poniżej progu
    assert "spadek_nastroju" not in _okazje(g, s)


def test_okazja_koniec_polrocza_w_polowie_rund(gra_po_rundach):
    g = gra_po_rundach
    s = g.stan(4)
    assert "koniec_polrocza" in _okazje(g, s, biezaca=4, liczba_rund=6)   # 3 rundy za drużyną
    assert "koniec_polrocza" not in _okazje(g, s, biezaca=3, liczba_rund=6)
    assert "koniec_polrocza" in _okazje(g, s, biezaca=6, liczba_rund=10)
    assert "koniec_polrocza" not in _okazje(g, s, biezaca=2, liczba_rund=3)   # za krótka gra (próg w danych)
    assert "koniec_polrocza" not in _okazje(g, s, biezaca=6, liczba_rund=6)   # tu jest ostatnia runda


# ── dymki wujka: pierwszeństwo, po 3 kwestie, najwyżej jeden na rundę ─────────────────────────────────────────────

def _ctx(okazje, ziarno=1, runda=3):
    return {"runda": runda, "firma": "A", "ziarno": ziarno, "okazje": list(okazje), "park": [], "kalendarz": [],
            "konkurencja": []}


def test_pierwszenstwo_obejmuje_wszystkie_okazje_bez_powtorzen():
    assert len(set(OKAZJE)) == len(OKAZJE) == 10
    assert dy.PIERWSZENSTWO_OKAZJI == OKAZJE
    assert OKAZJE[0] == "ostatnia_runda" and OKAZJE[-1] == "start"


def test_przy_kilku_okazjach_wujek_mowi_raz_i_wygrywa_pierwsza(kat_wnetrza):
    from silnik.dane import Dane
    d = Dane(kat_wnetrza)
    for i, o in enumerate(OKAZJE):
        pozostale = OKAZJE[i:]
        w = [x for x in dy.wylosowane(d, BOGATE, _ctx(pozostale), {}) if x["kto"] == "wujek"]
        assert len(w) == 1, o
        assert w[0]["tekst"] == TEKSTY_TESTOWE[o], o


def test_dane_gry_maja_po_3_kwestie_na_okazje(dane_gry):
    for o in OKAZJE:
        kwestie = [d for d in dane_gry.wnetrza["dymki"]["dymki"] if d["kto"] == "wujek" and d["okazja"] == o]
        assert len(kwestie) == 3, o
        assert len({d["tekst"] for d in kwestie}) == 3, o


def test_kwestie_losowane_sa_rozne_ale_deterministyczne(dane_gry):
    for o in OKAZJE:
        teksty = {[x for x in dy.wylosowane(dane_gry, BOGATE, _ctx([o], ziarno=z), {}) if x["kto"] == "wujek"][0]["tekst"]
                  for z in range(60)}
        assert len(teksty) == 3, o   # wszystkie 3 kwestie wypadają
    a = dy.wylosowane(dane_gry, BOGATE, _ctx(["debet"], ziarno=5), {})
    assert a == dy.wylosowane(dane_gry, BOGATE, _ctx(["debet"], ziarno=5), {})


def test_wujek_najwyzej_raz_na_runde_w_danych_gry(dane_gry):
    for z in range(30):
        d = dy.wylosowane(dane_gry, BOGATE, _ctx(OKAZJE, ziarno=z), {})
        assert sum(x["kto"] == "wujek" for x in d) == 1
        assert d[0]["kto"] == "wujek"
