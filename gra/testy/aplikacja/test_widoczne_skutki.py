"""Z42: skutki mechanik pokazywane graczowi (03/ukryte) – liczby z silnika, bez zmiany obliczeń."""
import math

import pytest
from pomocnicze import _gra

from api import prezentacja as pr
from silnik.rynek import opinie as op

pytestmark = pytest.mark.dane_gry


@pytest.fixture(scope="module")
def gra():
    g = _gra(("A", "sredni"), ("B", "sredni"), rund=6)
    for _ in range(5):
        g.przelicz(wymus=True)
    return g


def _opinie(g, firma="A"):
    """(gra, runda, {lokal: opinie}) z ostatniej rundy, w której firma miała opinie."""
    st = g.stan()
    for r in sorted(st.wyniki, reverse=True):
        o = st.wyniki[r].get(firma, {}).get("opinie")
        if o:
            return g, r, o
    return g, None, {}


def test_opinie_maja_zaufanie_zanik_rozrzut_i_czekanie(gra):
    g, r, o = _opinie(gra)
    assert o, "boty powinny dostać opinie"
    u = op.ustawienia(g.dane)
    for lok, x in o.items():
        assert 0 <= x["zaufanie"] <= 1
        assert x["zanik"] == u["zanik"]
        assert x["czekanie_grup"] > 0
        if x["nowe"]:
            assert x["rozrzut"] == pytest.approx(u["rozrzut"] / math.sqrt(x["nowe"]), abs=0.006)
            lok_m = next(l for l in g.stan().firmy["A"].lokale if l.id == lok)
            assert x["zaufanie"] == pytest.approx(op.zaufanie(g.dane, lok_m), abs=0.001)


def test_zadowolenie_osob_ma_skladniki_zgodne_z_suma(gra):
    g, r, _ = _opinie(gra)
    osoby = g.stan().wyniki[r]["A"].get("pracownicy") or []
    assert osoby
    stala = g.dane.z["zadowolenie_osoby"]["wspolczynniki"]["stala"]
    for p in osoby:
        assert "udogodnienia" in p["skladniki"] and "przeciazenie" in p["skladniki"]
        assert stala + sum(p["skladniki"].values()) == pytest.approx(p["zadowolenie"], abs=0.01)


def test_widok_ma_efekt_wyposazenia_i_prog_zmeczenia(gra):
    v = pr.widok(gra, "A")
    z = gra.dane.z["pomylki"]["szansa"]["zmeczenie_od"]
    assert v["progi_czasu_pracy"]["zmeczenie"] == z
    for e in v["wyposazenie_efekt"].values():
        assert e["teraz"] <= e["bez_nasycenia"] + 1e-9   # kolejna sztuka działa słabiej, nigdy mocniej
