"""Tryby rozliczania debetu."""

from silnik import Gra


def _rachunek(tryb):
    # kapitał mniejszy niż kaucja i pierwsze opłaty za lokal – brakującą kwotę pokrywa debet
    g = Gra.nowa("t", [("A", None)], 3, 1, tryb_debetu=tryb, kapital_startowy=1000)
    g.ustaw_decyzje("A", {"lokal": {"id": "centrum_3", "forma": "najem"}})
    return g.przelicz(wymus=True).wyniki[1]["A"]["rachunek"]


def test_tryby_rozliczania_debetu():
    uruch = lambda rach: [o for o in rach if o["opis"] == "Debet na koncie (saldo poniżej zera)"]
    jedn, biez = _rachunek("jednoczesnie"), _rachunek("na_biezaco")
    assert uruch(jedn)[-1] is jedn[-1]    # tylko niedobór na koniec rundy (saldo końca tygodnia, potem opłaty banku)
    assert uruch(biez) and uruch(biez)[0] is not biez[-1]          # na bieżąco: od razu po wydatkach z decyzji
