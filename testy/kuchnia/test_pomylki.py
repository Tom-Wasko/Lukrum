"""Pomyłki w szczycie zamiast reklamacji: rosną z obciążeniem kuchni, zmęczeniem i brakiem szkoleń."""
import pytest

from silnik.dane import dane_domyslne

pytestmark = pytest.mark.dane_gry


def test_dane_pomylek_i_brak_dawnego_mnoznika():
    d = dane_domyslne()
    z = d.z["pomylki"]["szansa"]
    assert 0 < z["prog_szczytu"] < 1 and 0 < z["zmeczenie_od"] < 1 and z["maks"] <= 0.5
    assert "reklamacje_mnoznik_ryzyka" not in d.z["losowosc"]


def test_pomylki_w_grze_botow_rosna_z_przeciazeniem():
    from silnik.gra import Gra
    g = Gra.nowa("p", [("A", "agresywny"), ("B", "zrownowazony")], 6, 7)
    for _ in range(6):
        s = g.przelicz(wymus=True)
    for r in range(2, 7):
        for w in s.wyniki[r].values():
            assert all(v["pomylki"] >= 0 for v in w["sprzedaz"].values())
    assert any(v["pomylki"] > 0 for r in range(2, 7) for w in s.wyniki[r].values() for v in w["sprzedaz"].values())
