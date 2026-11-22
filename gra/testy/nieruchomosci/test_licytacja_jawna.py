"""Licytacja jawna lokali (poprawki 2): kontrola przebicia przy zapisie, widok najwyższej oferty, rozstrzygnięcie."""
from pomocnicze import _gra, _runda

from silnik import na_zywo as nz
from silnik.nieruchomosci import licytacja_jawna as lj

ID = "centrum_3"   # najem: cena wywoławcza (czynsz) 5000


def _lok(oferta=None, forma="najem", **inne):
    return {"lokal": {"id": ID, "forma": forma, **({"oferta": oferta} if oferta is not None else {}), **inne}}


def _zapis(g, firma, nowe, stare=None):
    return nz.sprawdz_zapis(g.dane, {"A": {}, "B": {}, **g.decyzje.get(g.runda, {})}, firma, nowe, stare or {}, g.runda)


def test_krok_w_danych():
    assert _gra().dane.mapa["zasady"]["krok_przebicia"] == 0.02


def test_za_malo_i_rowno_progu():
    g = _gra()
    g.ustaw_decyzje("A", _lok(6000))
    bledy = _zapis(g, "B", _lok(6100))
    assert len(bledy) == 1 and "prowadzi A" in bledy[0] and "6 000 zł" in bledy[0] and "6 120 zł" in bledy[0]
    assert _zapis(g, "B", _lok(6119)) != []
    assert _zapis(g, "B", _lok(6120)) == []          # równo próg: 6000 × 1,02
    assert _zapis(g, "B", _lok()) != []              # bez oferty = cena wywoławcza, za mało


def test_pierwsza_oferta_bez_konkurencji_i_nie_nizej_niz_wywolawcza():
    g = _gra()
    assert _zapis(g, "A", _lok(5000)) == []
    g.ustaw_decyzje("A", _lok(5000))
    assert _zapis(g, "B", _lok(5100)) == []
    assert _zapis(g, "B", _lok(5099)) != []


def test_wycofanie_dozwolone_a_stary_szkic_nie_blokuje():
    g = _gra()
    g.ustaw_decyzje("A", _lok(6000))
    g.ustaw_decyzje("B", _lok(5000))        # zalegly szkic poniżej progu
    assert _zapis(g, "B", {}, stare=_lok(5000)) == []                         # wycofanie
    assert _zapis(g, "B", {"cena": 20}, stare=_lok(5000)) == []               # inny zapis
    assert _zapis(g, "B", {**_lok(5000), "cena": 20}, stare=_lok(5000)) == []  # oferta niezmieniona


def test_zmiana_wlasnej_oferty_gdy_prowadzi():
    g = _gra()
    g.ustaw_decyzje("A", _lok(6000))
    g.ustaw_decyzje("B", _lok(7000))
    assert _zapis(g, "B", _lok(8000), stare=_lok(7000)) == []   # prowadzi i podnosi
    assert _zapis(g, "B", _lok(6500), stare=_lok(7000)) == []   # obniża, ale wciąż ≥ 6120
    assert _zapis(g, "B", _lok(6050), stare=_lok(7000)) != []   # obniżka poniżej progu wobec A


def test_przejecia_tez_licytacja():
    g = _gra()
    cena = g.dane.lokale["politechnika_1"]["cena"]
    g.ustaw_decyzje("A", {"przejecie": {"id": "politechnika_1", "oferta": cena * 1.5}})
    assert _zapis(g, "B", {"przejecie": {"id": "politechnika_1", "oferta": cena * 1.5}}) != []
    assert _zapis(g, "B", {"przejecie": {"id": "politechnika_1", "oferta": cena * 1.53}}) == []


def test_widok_najwyzszej_oferty_z_nazwa_i_prowadzeniem():
    g = _gra()
    g.ustaw_decyzje("A", {**_lok(6000), "nazwa": "Kebab u Antka"})
    g.ustaw_decyzje("B", _lok(5000))
    s = g.stan()
    v = lj.widok(g.dane, g.decyzje[g.runda], "B", s.firmy, g.runda)
    w = v["lokal"][ID]
    assert w["lider"] == {"firma": "Kebab u Antka", "kwota": 6000, "forma": "najem"} and not w["prowadzisz"]
    assert w["min"]["najem"] == 6120
    v = lj.widok(g.dane, g.decyzje[g.runda], "A", s.firmy, g.runda)
    assert v["lokal"][ID]["prowadzisz"] and v["lokal"][ID]["lider"]["kwota"] == 5000
    assert lj.widok(g.dane, {}, "A", s.firmy, g.runda)["lokal"] == {}


def test_rozstrzygniecie_wygrywa_najwyzsza_oferta():
    g = _gra()
    s = _runda(g, A=_lok(6000), B=_lok(6120))
    (p,) = s.rynek[1]["przejecia"]["przetargi"]
    assert p["zwyciezca"] == "B" and not p["remis"]
    assert s.firmy["B"].lokale[0].czynsz == 6120 and s.firmy["A"].lokale == []
