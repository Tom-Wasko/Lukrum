"""Sprawy na żywo (poprawki 2): znacznik zmian innych drużyn i kontrole przy zapisie decyzji."""
from silnik import na_zywo as nz


def test_znacznik_zmienia_sie_tylko_od_pol_innych_druzyn():
    szkice = {"A": {"lokal": {"id": "L1", "oferta": 100000}}, "B": {"cena": 20}}
    z = nz.znacznik(szkice, "B")
    assert len(z) == 12
    assert nz.znacznik({**szkice, "B": {"cena": 25}}, "B") == z          # własne decyzje – bez zmiany
    assert nz.znacznik({**szkice, "A": {"lokal": {"id": "L1", "oferta": 120000}}}, "B") != z   # przebicie
    assert nz.znacznik({**szkice, "_refleksje": {"A": "x"}}, "B") == z   # klucze techniczne pomijane
    assert nz.znacznik({**szkice, "A": {**szkice["A"], "cena": 30}}, "B") == z   # pola spoza POLA – bez zmiany


def test_kontrola_zapisu_odrzuca_i_przepuszcza(monkeypatch):
    monkeypatch.setattr(nz, "KONTROLE", [])

    @nz.kontrola
    def tylko_jeden(dane, szkice, firma, nowe, stare, runda, opcje):
        inni = nz.szkice_innych(szkice, firma)
        return ["Zajęte."] if nowe.get("x") and any(d.get("x") == nowe["x"] for d in inni.values()) else []

    szkice = {"A": {"x": 1}}
    assert nz.sprawdz_zapis(None, szkice, "B", {"x": 1}, {}, 3) == ["Zajęte."]
    assert nz.sprawdz_zapis(None, szkice, "B", {"x": 2}, {}, 3) == []
    assert nz.sprawdz_zapis(None, szkice, "A", {"x": 1}, {"x": 1}, 3) == []


def test_kontrole_dostaja_stan_gry(monkeypatch):
    """Stan gry na początku rundy trafia do kontroli w opcje["_stan"] (np. ogłoszenia giełdy handlu)."""
    monkeypatch.setattr(nz, "KONTROLE", [])
    widziane = []

    @nz.kontrola
    def zapamietaj(dane, szkice, firma, nowe, stare, runda, opcje):
        widziane.append((opcje.get("_stan"), opcje.get("x")))
        return []

    nz.sprawdz_zapis(None, {}, "A", {}, {}, 3, {"x": 1}, stan="stan")
    nz.sprawdz_zapis(None, {}, "A", {}, {}, 3, {"x": 2})
    assert widziane == [("stan", 1), (None, 2)]
    assert "silnik.rynek.handel" in nz.MODULY and {"handel_wystaw", "handel_licytuj"} <= set(nz.POLA)
