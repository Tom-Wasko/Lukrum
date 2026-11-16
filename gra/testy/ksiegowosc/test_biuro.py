"""Biura rachunkowe i samodzielna księgowość (F3a.13, silnik/ksiegowosc/biuro.py)."""

import pytest

from api.prezentacja import widok
from silnik.boty import decyzje_bota
from silnik.dane import dane_domyslne
from silnik.gra import Gra
from silnik.ksiegowosc import biuro as bo
from silnik.runda import przelicz_runde


@pytest.fixture(scope="module")
def dane():
    return dane_domyslne()


def _gra(rund=8, ziarno=3):
    return Gra.nowa("biuro", [("H", None), ("B", "zrownowazony")], rund, ziarno, lokale=True)


def _runda(g, biuro="samodzielnie", ksiegowosc=None, **zmiany):
    d = decyzje_bota(g.dane, g.stan(), "H", "zrownowazony", g.runda, g.konfiguracja)
    d["biuro"] = biuro
    if ksiegowosc is not None:
        d["ksiegowosc"] = ksiegowosc
    d.update(zmiany)
    g.ustaw_decyzje("H", d)
    g.przelicz(wymus=True)
    return g.stan().wyniki[g.runda - 1]["H"]


def _poprawna(dk, **zmiany):
    dek = {**dk["poprawne"], **zmiany}
    return {"zapisy": {x["id"]: dict(x["poprawne"]) for x in dk["dokumenty"]}, "deklaracja": dek}


def _do_deklaracji(g, rund=3):
    """Kilka rund samodzielnie z poprawnymi deklaracjami – zostaje deklaracja z dokumentami do złożenia."""
    for _ in range(rund):
        dk = g.stan().firmy["H"].deklaracja
        _runda(g, ksiegowosc=_poprawna(dk) if dk else None)
    dk = g.stan().firmy["H"].deklaracja
    assert dk and dk["dokumenty"]
    return dk


def test_oplata_pakiet_limit_doplata_i_kadry(dane):
    b = bo.biura(dane)
    jks = bo.oplata(dane, b["jks"], 30, 5, 1, "S")   # limit S: 60/mies. → 14/rundę; kadry: 4 w cenie (najpierw etat)
    assert jks["limit"] == 14 and jks["ponad"] == 16 and jks["pakiet"] == "S"
    assert jks["ksiegowanie"] == pytest.approx(dane.na_runde(390) + 16 * 6.15, abs=0.01)
    assert jks["kadry"] == pytest.approx(dane.na_runde(45 + 25), abs=0.01) and jks["osoby_platne"] == 2
    m = bo.oplata(dane, b["jks"], 30, 0, 0, "M")     # limit M: 120/mies. → 28/rundę, dopłata za 2 dokumenty
    assert m["limit"] == 28 and m["ponad"] == 2 and m["ksiegowanie"] == pytest.approx(dane.na_runde(690) + 2 * 5.5, abs=0.01)
    assert bo.oplata(dane, b["jks"], 30, 0, 0, "L")["ponad"] == 0                      # L: 46/rundę – bez dopłaty
    # im więcej dokumentów, tym większy pakiet się opłaca
    assert bo.najlepszy_pakiet(dane, b["scrooge"], 5, 0, 0) == "S"
    assert bo.najlepszy_pakiet(dane, b["scrooge"], 200, 0, 0) == "L"


def test_cztery_biura_o_roznych_cechach(dane):
    b = bo.biura(dane)
    assert list(b) == ["jks", "jozef_k", "scrooge", "asteroida_328"]
    assert {x["nazwa"] for x in b.values()} == {"J.K.Ś.", "Józef K.", "Scrooge", "Asteroida 328"}
    cena = lambda i: b[i]["pakiety"]["M"]["cena"]   # noqa: E731
    assert cena("scrooge") < cena("jozef_k") < cena("jks") < cena("asteroida_328")   # Asteroida – dokładna i droga
    assert b["asteroida_328"]["ryzyko_bledu"] == 0 and b["asteroida_328"]["oc"] and not b["scrooge"]["oc"]
    assert b["scrooge"]["zamkniete_w_swieta"]["doplata"] > 0 and b["jozef_k"]["zmiana_pakietu_po"] == 2


def test_biuro_z_mapy_nalicza_koszt_i_rozlicza_od_razu():
    g = _gra()
    for _ in range(3):
        w = _runda(g, biuro="jozef_k", pakiet="M")
    assert w["biuro"]["nazwa"] == "Józef K." and w["biuro"]["razem"] > 0 and w["biuro"]["pakiet"] == "M"
    assert any(p["opis"].startswith("Koszt biura rachunkowego") for p in w["kpir"]["pozycje"])
    assert w["rozliczenie"]["zaplacone"] and not w["samodzielnie"] and w["uzgodnienie"]["roznica"] == 0


def test_zmiana_pakietu_u_jozefa_k_trwa_dwie_rundy_a_gdzie_indziej_jest_od_razu():
    g = _gra()
    _runda(g, biuro="jozef_k", pakiet="S")                    # pierwszy wybór – od razu
    f = g.stan().firmy["H"]
    assert f.pakiet_biura == "S"
    _runda(g, biuro="jozef_k", pakiet="L")                     # zmiana „wszystko trwa”: dopiero za 2 rundy
    f = g.stan().firmy["H"]
    assert f.pakiet_biura == "S" and f.pakiet_nastepny == {"pakiet": "L", "od_rundy": g.runda - 1 + 2}
    _runda(g, biuro="jozef_k", pakiet="L")                     # ponowna decyzja nie przesuwa terminu
    assert g.stan().firmy["H"].pakiet_nastepny["od_rundy"] == f.pakiet_nastepny["od_rundy"]
    _runda(g, biuro="jozef_k", pakiet="L")
    _runda(g, biuro="jozef_k", pakiet="L")
    f = g.stan().firmy["H"]
    assert f.pakiet_biura == "L" and f.pakiet_nastepny is None
    g2 = _gra()
    _runda(g2, biuro="jks", pakiet="S")
    _runda(g2, biuro="jks", pakiet="L")
    assert g2.stan().firmy["H"].pakiet_biura == "L"            # J.K.Ś. – od razu


def test_scrooge_w_swieta_zamkniety_dokumenty_czekaja_z_doplata(dane):
    swieto = [r for r in range(2, 20) if bo.swieto_w_rundzie(dane, r)]
    assert swieto and [r for r in range(2, 20) if not bo.swieto_w_rundzie(dane, r)]
    r = swieto[0]
    g = _gra(rund=r + 3)
    while g.runda < r:
        w = _runda(g, biuro="scrooge", pakiet="M")
    # w tygodniu r-1 zdarzył się ostatni tydzień bez święta; następny przeliczany to r
    w = _runda(g, biuro="scrooge", pakiet="M")
    assert g.runda - 1 == r and w["biuro"]["zamkniete"] and w["biuro"]["dokumenty"] == 0 and w["biuro"]["przeniesione"] > 0
    f = g.stan().firmy["H"]
    ile = f.dokumenty_przeniesione
    if not bo.swieto_w_rundzie(dane, r + 1):
        w2 = _runda(g, biuro="scrooge", pakiet="M")
        assert not w2["biuro"]["zamkniete"] and w2["biuro"]["przeniesione"] == ile
        assert w2["biuro"]["za_swieta"] == round(ile * dane_domyslne().mapa["biura"]["biura"][2]["zamkniete_w_swieta"]["doplata"], 2)
        assert g.stan().firmy["H"].dokumenty_przeniesione == 0
    assert bo.biura(dane)["jks"].get("zamkniete_w_swieta") is None


def test_blad_biura_bez_oc_kosztuje_mandat(dane, monkeypatch):
    oferty = bo.biura(dane)
    monkeypatch.setitem(oferty["scrooge"], "ryzyko_bledu", 1.0)
    monkeypatch.setattr(bo, "biura", lambda _d: oferty)
    g = _gra()
    w = _runda(g, biuro="scrooge")
    assert w["biuro"]["blad"]["kara"] == 200 and not w["biuro"]["blad"]["oc"]
    assert any(o["opis"].startswith("Mandat karny") for o in w["rachunek"]) and w["uzgodnienie"]["roznica"] == 0


def test_poprawna_deklaracja_bez_kary_i_kasa_sie_zgadza():
    g = _gra()
    dk = _do_deklaracji(g)
    w = _runda(g, ksiegowosc=_poprawna(dk))
    k = w["ksiegowosc"]
    assert k["tryb"] == "deklaracja" and k["kara"] == 0 and all(not p["blad"] for p in k["pozycje"])
    assert k["zapisy"]["dobre"] == k["zapisy"]["liczba"] == len(dk["dokumenty"])
    assert w["uzgodnienie"]["roznica"] == 0 and w["uzgodnienie"]["roznica_kpir"] == 0


def test_bledna_deklaracja_korekta_i_mandat_bledny_zapis_opisany():
    g = _gra()
    dk = _do_deklaracji(g)
    ks = _poprawna(dk, vat=dk["poprawne"]["vat"] + 50)
    sprzedaz = next(x for x in dk["dokumenty"] if x["poprawne"]["kolumna"] == "przychod")
    ks["zapisy"][sprzedaz["id"]] = {"kolumna": "towary", "stawka": 0.23}
    w = _runda(g, ksiegowosc=ks)
    k = w["ksiegowosc"]
    vat = next(p for p in k["pozycje"] if p["pole"] == "vat")
    assert vat["blad"] and vat["korekta"] == -50 and k["kara"] == 200
    zly = next(x for x in k["zapisy"]["dokumenty"] if x["id"] == sprzedaz["id"])
    assert not zly["ok"] and "przychód ze sprzedaży" in zly["bledy"][0].lower() and any("stawka VAT" in b for b in zly["bledy"])
    assert any("mandat 200" in b["tekst"] for b in w["lista_bledow"])
    assert w["uzgodnienie"]["roznica"] == 0


def test_brak_deklaracji_rozliczenie_z_urzedu_i_mandat():
    g = _gra()
    dk = _do_deklaracji(g)
    k = _runda(g)["ksiegowosc"]
    assert k["tryb"] == "brak" and k["kara"] == 500
    assert [p["zadeklarowano"] for p in k["pozycje"]] == [dk["poprawne"][p] for p in ("vat", "pit", "zdrowotna")]


def test_zmiana_na_biuro_skladka_deklaracje_bez_kary():
    g = _gra()
    _do_deklaracji(g)
    w = _runda(g, biuro="jks")
    assert w["ksiegowosc"]["tryb"] == "biuro" and w["ksiegowosc"]["kara"] == 0 and not w["samodzielnie"]
    assert g.stan().firmy["H"].deklaracja is None


def test_ostatnia_runda_rozlicza_urzad():
    g = _gra(rund=3)
    for _ in range(3):
        dk = g.stan().firmy["H"].deklaracja
        w = _runda(g, ksiegowosc=_poprawna(dk) if dk else None)
    assert g.stan().firmy["H"].deklaracja is None and w["rozliczenie"]["zaplacone"]


def test_widok_ukrywa_poprawne_odpowiedzi():
    g = _gra()
    _do_deklaracji(g)
    v = widok(g, "H")
    K = v["ksiegowosc"]
    assert K["ukryte"] and K["deklaracja"]["dokumenty"]
    assert all("poprawne" not in x and "vat" not in x for x in K["deklaracja"]["dokumenty"])
    assert v["wyniki"]["kpir"]["ukryte"] and v["wyniki"]["rozliczenie"] is None and v["wyniki"]["vat"] is None
    assert v["dashboard"]["dochod_netto"] is None and v["historia"][-1]["dochod_netto"] is None
    assert v["podatki"]["stan_przed_deklaracja"]
    assert any(b["zakladka"] == "finanse_biuro" for b in v["lista_bledow"])   # niezłożona deklaracja


def test_podglad_nie_sprawdza_deklaracji():
    g = _gra()
    _do_deklaracji(g)
    d = {"H": decyzje_bota(g.dane, g.stan(), "H", "zrownowazony", g.runda, g.konfiguracja),
         "B": decyzje_bota(g.dane, g.stan(), "B", "zrownowazony", g.runda, g.konfiguracja)}
    d["H"]["biuro"] = "samodzielnie"
    s = przelicz_runde(g.dane, g.stan(), d, g.konfiguracja, podglad=True)
    assert s.wyniki[g.runda]["H"]["ksiegowosc"] == {"za_runde": g.runda - 1, "tryb": "podglad"}
    w = bo.ukryj(s.wyniki[g.runda]["H"], podglad=True)
    assert w["kpir"]["dochod_netto"] is None and w["kpir"]["przychody"] is not None and w["rozliczenie"] is None


def test_brak_deklaracji_na_liscie_bledow_mowi_co_zrobic_i_ile_kosztuje_biuro():
    """U6: komunikat o mandacie podpowiada tabelę deklaracji i najtańsze biuro z kwotą za rundę."""
    g = _gra()
    dk = _do_deklaracji(g)
    f = g.stan().firmy["H"]
    b = [x for x in bo.bledy(g.dane, f, {"biuro": "samodzielnie"}) if x["poziom"] == "czerwony"]
    nazwa, zl = bo.najnizsza_oplata(g.dane, f, len(dk["dokumenty"]))
    etat, zlecenie = bo._umowy(g.dane, f)
    assert zl == min(bo.oplata(g.dane, x, len(dk["dokumenty"]), etat, zlecenie,
                               bo.najlepszy_pakiet(g.dane, x, len(dk["dokumenty"]), etat, zlecenie))["razem"]
                     for x in bo.biura(g.dane).values())
    assert len(b) == 1 and "Biurowiec przy Zana ▸ Biuro rachunkowe" in b[0]["tekst"] and f"({nazwa}) kosztuje ok. {zl:.0f} zł" in b[0]["tekst"]
    assert zl < bo.ustawienia(g.dane)["samodzielna"]["kara_brak"]
