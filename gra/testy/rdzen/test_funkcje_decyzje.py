"""Decyzje funkcji gry (seria „funkcje”, raporty/funkcje/plan.md: J3, J5): funkcja wyłączona – decyzje pominięte
z błędem, boty z niej nie korzystają, zaopatrzenie i urzędy robi gra; harmonogram wyłączonej funkcji stoi;
funkcja zakryta – autopilot (decyzje gry, bez błędów), odsłonięcie i ponowne zakrycie, przeliczenie bez zmian."""

import pytest
from pomocnicze import DANE_GRY

from api.prezentacja import funkcje_widok, stan_po_szkicu
from silnik import autopilot as ap
from silnik import boty as bt
from silnik import funkcje as fn
from silnik import harmonogram as hm
from silnik.dane import Dane
from silnik.gra import Gra
from silnik.ksiegowosc import biuro as bo
from silnik.ksiegowosc.finanse import Ksiega
from silnik.model import Ogloszenie
from silnik.nieruchomosci import lokale as lk
from silnik.nieruchomosci import per_lokal as pl
from silnik.rynek import reklama as rk

pytestmark = pytest.mark.dane_gry
# decyzje „drużyny bez pomysłów”: tylko lokal, menu, zatrudnianie (stanowiska i sprzęt – podstawa gry)
PODSTAWA = {"lokal", "oferta", "zatrudnij", "stanowiska", "sprzet_kup"}


def _gra(funkcje=None, ludzie=("A", "B"), boty=("Bot",), rund=6, **opcje) -> Gra:
    firmy = [(n, None) for n in ludzie] + [(n, "zrownowazony") for n in boty]
    return Gra.nowa("t", firmy, rund, 7, dane=Dane(DANE_GRY), funkcje=funkcje, **opcje)


def _stany(**zmiany) -> dict:
    """Wszystko odkryte poza `zmiany`."""
    return {**dict.fromkeys(fn.rejestr(Dane(DANE_GRY)), "odkryta"), **zmiany}


def _podstawa(g: Gra, firma: str, **dodatkowe) -> dict:
    """Decyzje drużyny: z decyzji bota tylko lokal, menu i zatrudnianie (+ `dodatkowe`)."""
    d = bt.decyzje_bota(g.dane, g.stan(g.runda - 1), firma, "zrownowazony", g.runda, g.konfiguracja)
    return {**{k: v for k, v in d.items() if k in PODSTAWA}, **dodatkowe}


def _graj(g: Gra, rund: int, **dodatkowe) -> None:
    """`rund` rund: drużyny na decyzjach podstawowych; dodatkowe – {runda: {firma: decyzje}}."""
    ludzie = [x["nazwa"] for x in g.konfiguracja["firmy"] if not x["bot"]]
    for _ in range(rund):
        for n in ludzie:
            g.ustaw_decyzje(n, _podstawa(g, n, **(dodatkowe.get(f"r{g.runda}", {}).get(n) or {})))
        g.przelicz(wymus=True)


def _sprzedaz(s, r, firma) -> int:
    return sum(v["sprzedaz"] for v in s.wyniki[r][firma]["sprzedaz"].values())


def test_bez_funkcji_decyzje_bez_zmian():
    g = _gra()
    dec = {"A": {"zamowienia": [{"dostawca": "x"}]}}
    assert ap.decyzje_rundy(g.dane, g.stan(0), dec, g.konfiguracja, 1) == (dec, {})
    assert fn.filtruj(g.dane, g.konfiguracja, "A", dec["A"], 1) == (dec["A"], [])
    g = _gra("pelna_gra")   # wszystko odkryte – też bez zmian
    assert ap.decyzje_rundy(g.dane, g.stan(0), dec, g.konfiguracja, 1)[0]["A"] is dec["A"]


def test_mapa_decyzji_w_rejestrze():
    rej = fn.rejestr(Dane(DANE_GRY))
    assert set(fn.DECYZJE) == set(rej)
    assert set(fn.BLEDY_AUTOPILOTA) <= set(rej)
    wszystkie = [k for ks in fn.DECYZJE.values() for k in ks]
    assert len(wszystkie) == len(set(wszystkie))   # każda decyzja – w jednej funkcji
    assert fn.KLUCZE_W_LOKALU <= set(wszystkie)


def test_wylaczona_decyzja_pominieta_z_bledem_i_bez_skutku():
    g = _gra(_stany(marketing="wylaczona", wlasciciel="wylaczona"))
    _graj(g, 2)
    g.ustaw_decyzje("A", _podstawa(g, "A", wyplata_wlasna=500, promocje=[{"typ": "dwa_za_jeden", "danie": "frytki"}]))
    szkic = stan_po_szkicu(g, "A")[4]
    s = g.przelicz(wymus=True)
    bledy = [b for b in s.wyniki[3]["A"]["lista_bledow"] if b.get("funkcja")]
    assert {b["zakladka"] for b in bledy} == {"promocje", "czas_wlasciciela"}
    for b in bledy:
        tekst = b["tekst"]
        assert b["poziom"] == "czerwony" and tekst.startswith("Mistrz gry wyłączył w tej grze funkcję ")
        assert tekst.endswith("– ta decyzja nie zostanie wykonana.")
    assert [b for b in szkic if b.get("funkcja")] == bledy   # podgląd decyzji – te same błędy
    assert s.firmy["A"].promocje == [] and s.wyniki[3]["A"]["wlasciciel"]["wyplata"] == 0
    assert g.decyzje[3]["A"]["wyplata_wlasna"] == 500   # zapisana decyzja drużyny – bez zmian


def test_bot_nie_korzysta_z_wylaczonej_funkcji():
    g = _gra(_stany(marketing="wylaczona", urzedy="wylaczona", rozwoj="wylaczona", wyposazenie="wylaczona"))
    _graj(g, 4)
    for r in range(1, 5):
        d = g.decyzje[r]["Bot"]
        for k in ("marketing", "urzedy", "rozwoj", "wyposazenie"):
            assert not set(fn.DECYZJE[k]) & set(d), (r, k)
    s = g.stan(4)
    assert all(not x["lista_bledow"] or not any(b.get("funkcja") for b in x["lista_bledow"])
               for x in (s.wyniki[r]["Bot"] for r in range(1, 5)))   # bot nie dostaje błędów funkcji
    assert not s.firmy["Bot"].promocje and not s.firmy["Bot"].polisy and not s.firmy["Bot"].kampanie


def test_wylaczone_zaopatrzenie_wszyscy_na_auto_dostawach():
    g = _gra(_stany(zaopatrzenie="wylaczona"))
    _graj(g, 4)
    s = g.stan(4)
    dostawca = g.dane.z["magazyn"]["auto_dostawca"]["dostawca"]
    for n in ("A", "B", "Bot"):
        assert all(_sprzedaz(s, r, n) > 0 for r in (2, 3, 4)), n   # od rundy auto-dostawcy lokal sprzedaje
        assert {p.dostawca for p in s.firmy[n].partie} <= {dostawca, "Auto-dostawca"}
        assert not any(b.get("zakladka") in ("dostawcy", "swiezosc") for b in s.wyniki[4][n]["lista_bledow"])
    # zamówienie drużyny – odrzucone z błędem
    g.ustaw_decyzje("A", _podstawa(g, "A", zamowienia=[{"dostawca": "Makro", "zasob": "mieso_kebab", "jakosc": 2,
                                                        "ilosc": 50}]))
    s = g.przelicz(wymus=True)
    assert [b["zakladka"] for b in s.wyniki[5]["A"]["lista_bledow"] if b.get("funkcja")] == ["zaop_dostawy"]
    assert not any(p.dostawca == "Makro" for p in s.firmy["A"].partie)


def test_wylaczone_urzedy_bez_polis_kontroli_i_z_higiena_domyslna():
    g = _gra(_stany(urzedy="wylaczona"), rund=8)
    zle = {"polisy": ["lokal"], "higiena": "brak"}
    _graj(g, 8, r3={"A": zle})
    s = g.stan(8)
    domyslna = g.dane.zdarzenia["urzad"]["higiena"]["domyslna"]
    for n in ("A", "B", "Bot"):
        assert not s.firmy[n].polisy
        assert s.firmy[n].higiena in (None, domyslna)
        for r in range(1, 9):
            w = s.wyniki[r][n]
            assert not w["urzad"].get("kontrola"), (n, r)   # sanepid – element harmonogramu wyłączony
            assert w["urzad"]["higiena"] == domyslna
            assert not (w.get("ubezpieczenia") or {}).get("skladki")
    assert [b["zakladka"] for b in s.wyniki[3]["A"]["lista_bledow"] if b.get("funkcja")] == ["urzad"]
    assert all(lok.id in s.firmy["A"].odbiory for lok in s.firmy["A"].lokale)   # odbiór lokalu – jak dotąd


def test_harmonogramu_wylaczonej_funkcji_nie_przesuniesz():
    g = _gra("krotka_lekcja")   # handel wyłączony
    with pytest.raises(ValueError, match="Handel.*wyłączono"):
        g.ustaw_odblokowanie({"handel": 3})
    g.ustaw_odblokowanie({"handel": 7})   # liczba_rund + 1 – bez zmian, bez błędu (cały harmonogram z panelu)
    assert g.dane.nadpisane_rundy["handel"] == 7
    with pytest.raises(ValueError, match="wyłączono"):
        _gra("krotka_lekcja", odblokowanie={"przejecia": 5})
    g = _gra("pelna_gra")
    g.ustaw_odblokowanie({"handel": 4})   # funkcja odkryta – jak dotąd
    assert g.dane.nadpisane_rundy["handel"] == 4
    assert hm.sprawdz_zmiany(g.dane, {"handel": 5}, {}, 1, 6) == {"handel": 5}   # bez konfiguracji – jak dotąd


def test_pelna_gra_jak_gra_bez_funkcji():
    """Wszystko odkryte – co do grosza jak gra bez pola `funkcje` (testy, pomiary, stare gry)."""
    wyniki = []
    for funkcje in (None, "pelna_gra"):
        g = _gra(funkcje, rund=4)
        _graj(g, 4, r2={"A": {"biuro": "samodzielnie", "polisy": ["lokal"]}})
        s = g.stan(4)
        wyniki.append({n: (f.gotowka, s.wyniki[4][n]["lista_bledow"], s.wyniki[4][n]["sprzedaz"])
                       for n, f in s.firmy.items()})
    assert wyniki[0] == wyniki[1]


# --- J5: autopilot funkcji zakrytych ---------------------------------------------------------------------------

def _bledy_funkcji_ukrytych(w: dict) -> list[dict]:
    """Uwagi z zakładek funkcji, których drużyna nie widzi, i błędy funkcji (zakryta – bez błędów)."""
    zakladki = set().union(*fn.BLEDY_AUTOPILOTA.values())
    return [b for b in w["lista_bledow"] if b.get("zakladka") in zakladki or b.get("funkcja")]


def _promo(g: Gra, firma: str = "A") -> dict:
    danie = sorted(g.stan(g.runda - 1).firmy[firma].ceny)[0]
    return {"promocje": [{"typ": "dwa_za_jeden", "danie": danie}]}


def test_autopilot_zaopatrzenia_dostawy_i_sprzedaz_przez_kilka_rund():
    g = _gra("pierwsza_gra", rund=6)
    _graj(g, 2)
    makro = [{"dostawca": "Makro", "zasob": "mieso_kebab", "jakosc": 2, "ilosc": 50}]
    _graj(g, 4, r3={"A": {"zamowienia": makro}})   # zamówienie drużyny – pominięte po cichu (funkcja zakryta)
    s = g.stan(6)
    dostawca = g.dane.z["magazyn"]["auto_dostawca"]["dostawca"]
    for n in ("A", "B"):
        assert all(_sprzedaz(s, r, n) > 0 for r in range(2, 7)), n
        assert {p.dostawca for p in s.firmy[n].partie} <= {dostawca, "Auto-dostawca"}
        for r in range(1, 7):
            assert not _bledy_funkcji_ukrytych(s.wyniki[r][n]), (n, r)
        utracona = sum(v["utracona"] for r in range(3, 7) for v in s.wyniki[r][n]["sprzedaz"].values())
        assert utracona < 0.25 * sum(_sprzedaz(s, r, n) for r in range(3, 7)), n   # zapas jak u botów
    assert g.decyzje[3]["A"]["zamowienia"] == makro   # zapisana decyzja drużyny – bez zmian
    # bot – zawsze sam (nigdy na autopilocie): zamawia u dostawców
    assert any(p.dostawca not in (dostawca, "Auto-dostawca") for p in s.firmy["Bot"].partie) or g.decyzje[6]["Bot"].get(
        "zamowienia")


def test_autopilot_ksiegowosci_to_biuro():
    g = _gra("pierwsza_gra", rund=5)
    _graj(g, 1, r1={"A": {"biuro": "samodzielnie"}})
    g.odslon("B", "ksiegowosc")
    _graj(g, 4, r2={"B": {"biuro": "samodzielnie"}})
    s = g.stan(5)
    assert s.firmy["A"].biuro in bo.biura(g.dane)   # samodzielnie – zamiast tego najtańsze biuro
    for r in range(2, 6):
        k = s.wyniki[r]["A"].get("ksiegowosc") or {}
        assert k.get("tryb") in (None, "biuro") and not k.get("kara"), r
        assert not _bledy_funkcji_ukrytych(s.wyniki[r]["A"]), r
    assert s.firmy["B"].biuro == bo.SAMODZIELNIE   # odsłonięta – drużyna prowadzi księgowość sama
    assert g.decyzje[1]["A"]["biuro"] == bo.SAMODZIELNIE


def test_odsloniecie_w_rundzie_decyzje_dzialaja_od_niej_i_ponowne_zakrycie():
    g = _gra("pierwsza_gra", rund=6)
    _graj(g, 2)
    _graj(g, 1, r3={"A": _promo(g)})
    assert g.stan(3).firmy["A"].promocje == []   # zakryta – pominięta po cichu
    assert not _bledy_funkcji_ukrytych(g.stan(3).wyniki[3]["A"])
    g.odslon("A", "marketing")   # od rundy 4
    _graj(g, 1, r4={"A": _promo(g)})
    assert [p.typ for p in g.stan(4).firmy["A"].promocje] == ["dwa_za_jeden"]
    _graj(g, 1)   # runda 5 bez decyzji o promocjach – promocja trwa
    assert [p.typ for p in g.stan(5).firmy["A"].promocje] == ["dwa_za_jeden"]
    g.odslon("A", "marketing", False)   # znów zakryta od rundy 6: promocja się kończy, nowe decyzje – pominięte
    _graj(g, 1, r6={"A": _promo(g)})
    s = g.stan(6)
    assert s.firmy["A"].promocje == [] and not _bledy_funkcji_ukrytych(s.wyniki[6]["A"])
    assert [p.typ for p in s.firmy["A"].promocje + g.stan(5).firmy["A"].promocje] == ["dwa_za_jeden"]


def _przepadki(w: dict) -> dict[str, str]:
    """K1: uwagi o tym, co przepadło przy ponownym zakryciu – {funkcja: tekst}."""
    return {b["zakrycie"]: b["tekst"] for b in w["lista_bledow"] if b.get("zakrycie")}


def test_ponowne_zakrycie_kampanie_przepadaja():
    g = _gra("pierwsza_gra", rund=8)
    g.odslon("A", "marketing")
    for _ in range(7):
        d = bt.decyzje_bota(g.dane, g.stan(g.runda - 1), "A", "zrownowazony", g.runda, g.konfiguracja)
        if d.get("kampanie"):
            break
        _graj(g, 1)
    else:
        pytest.fail("bot nie zamówił kampanii")
    r = g.runda
    _graj(g, 1, **{f"r{r}": {"A": {"kampanie": d["kampanie"]}}})
    zamowione = list(g.stan(r).firmy["A"].kampanie)
    assert zamowione and all(rk.dziala(g.dane, k, r + 1) for k in zamowione)   # wygasają dopiero po kilku rundach
    gotowka = g.stan(r).firmy["A"].gotowka
    g.odslon("A", "marketing", False)
    _graj(g, 1, **{f"r{r + 1}": {"A": {"kampanie": d["kampanie"]}}})
    s = g.stan(r + 1)
    assert s.firmy["A"].kampanie == []   # przepadły, nowe – pominięte (autopilot)
    tekst = _przepadki(s.wyniki[r + 1]["A"])["marketing"]
    assert "kampanie reklamowe" in tekst and tekst.endswith("Zapłacone pieniądze nie wracają.")
    assert not any("Kampania" in p["opis"] and p["przychod"] for p in s.wyniki[r + 1]["A"]["kpir"]["pozycje"])
    assert s.wyniki[r + 1]["A"]["uzgodnienie"]["roznica"] == 0 and s.firmy["A"].gotowka != gotowka
    assert not _przepadki(g.stan(r).wyniki[r]["A"])   # przepada tylko w rundzie ponownego zakrycia


def test_ponowne_zakrycie_wyposazenie_udogodnienia_i_szkolenia_przepadaja():
    g = _gra("pierwsza_gra", rund=9)
    g.odslon("A", "wyposazenie")
    g.odslon("A", "rozwoj")
    firma_szk = g.dane.katalog_ofert["szkolenia"]["firmy"][0]["nazwa"]
    szkolenie = g.dane.katalog_ofert["szkolenia"]["pozycje"][0]["nazwa"]
    wyp, udog = ["Stoły i ławy z jasnego drewna", "WiFi dla gości (światłowód)"], ["Klimatyzatory split w kuchni i na zapleczu"]
    _graj(g, 7, r7={"A": {"wyposazenie_kup": wyp, "udogodnienia_kup": udog,
                          "szkolenia": [{"firma": firma_szk, "szkolenie": szkolenie}]}})
    f7 = g.stan(7).firmy["A"]
    assert pl.lista(f7, f7.lokale[0], "wyposazenie") == wyp and f7.udogodnienia == udog
    assert f7.szkolenia and f7.szkolenia[0].do_rundy > 8
    g.odslon("A", "wyposazenie", False)
    g.odslon("A", "rozwoj", False)
    g.ustaw_decyzje("A", _podstawa(g, "A", wyposazenie_kup=wyp))
    podglad = _przepadki({"lista_bledow": stan_po_szkicu(g, "A")[4]})   # podgląd decyzji – ta sama uwaga
    _graj(g, 1, r8={"A": {"wyposazenie_kup": wyp}})   # zakup – pominięty (autopilot)
    s = g.stan(8)
    f, w = s.firmy["A"], s.wyniki[8]["A"]
    assert all(not lok.wyposazenie and not lok.udogodnienia for lok in f.lokale)
    assert f.wyposazenie == [] and f.udogodnienia == [] and f.szkolenia == []
    ceny = sum(g.dane.pozycje("wyposazenie")[n]["cena"] for n in wyp) + g.dane.pozycje("udogodnienia")["Klimatyzatory split w kuchni i na zapleczu"]["cena"]
    assert f.majatek == pytest.approx(f7.majatek - ceny)
    przep = _przepadki(w)
    assert przep == podglad and set(przep) == {"wyposazenie", "rozwoj"}
    assert all(n in przep["wyposazenie"] for n in wyp) and "Klimatyzatory split w kuchni i na zapleczu" in przep["rozwoj"] and szkolenie in przep["rozwoj"]
    assert not any(p["opis"].startswith(("Sprzedaż wyposażenia", "Sprzedaż udogodnień")) for p in w["kpir"]["pozycje"])
    assert w["uzgodnienie"]["roznica"] == 0 and w["uzgodnienie"]["roznica_kpir"] == 0
    assert w["sprzedaz"] and not any(b.get("funkcja") for b in w["lista_bledow"])


def test_przepadek_ogloszen_handlu_tylko_w_rundzie_zakrycia():
    g = _gra("pierwsza_gra", rund=5)
    _graj(g, 1)
    g.odslon("A", "handel")
    _graj(g, 1)
    g.odslon("A", "handel", False)   # od rundy 3
    ogl = Ogloszenie(id="A-2-1", typ="towar", cena_min_gr=1000, wartosc_gr=1000, runda=2)
    f = g.stan(2).kopia().firmy["A"]
    f.ogloszenia = [ogl]
    assert ap.przepadek(g.dane, f, g.konfiguracja, 4, Ksiega())["bledy"] == [] and f.ogloszenia == [ogl]
    w = ap.przepadek(g.dane, f, g.konfiguracja, 3, Ksiega())
    assert f.ogloszenia == [] and [b["zakrycie"] for b in w["bledy"]] == ["handel"] and w["majatek"] == 0
    g2 = _gra(_stany(handel="zakryta"))   # zakryta od początku (nigdy nieodsłonięta) – nic nie przepada
    f2 = g2.stan(0).kopia().firmy["A"]
    f2.ogloszenia = [ogl]
    assert ap.przepadek(g2.dane, f2, g2.konfiguracja, 1, Ksiega())["bledy"] == [] and f2.ogloszenia == [ogl]


def test_przeliczenie_starej_rundy_z_autopilotem_daje_to_samo():
    g = _gra("pierwsza_gra", rund=6)
    _graj(g, 2, r1={"A": {"biuro": "samodzielnie"}})
    g.odslon("A", "zaopatrzenie")
    _graj(g, 2)
    g.odslon("A", "zaopatrzenie", False)
    _graj(g, 2)
    s = g.stan(6)
    zapis = g.do_slownika()
    s2 = Gra(zapis["konfiguracja"], zapis["decyzje"], Dane(DANE_GRY)).stan(6)
    for n in s.firmy:
        assert s2.firmy[n].gotowka == s.firmy[n].gotowka, n
        for r in range(1, 7):
            assert s2.wyniki[r][n]["sprzedaz"] == s.wyniki[r][n]["sprzedaz"], (n, r)
            assert s2.wyniki[r][n]["lista_bledow"] == s.wyniki[r][n]["lista_bledow"], (n, r)
    assert "auto_dostawy" not in g.decyzje[5]["A"]   # decyzje gry nie trafiają do zapisu


def test_harpagona_z_niesplacona_pozyczka_nie_da_sie_zakryc():
    g = _gra("pierwsza_gra", rund=5)
    g.odslon("A", "harpagon")
    _graj(g, 1, r1={"A": {"harpagon_wez": 1000}})
    assert g.stan(1).firmy["A"].harpagon is not None
    with pytest.raises(ValueError, match="Najpierw spłaćcie pożyczkę u Harpagona."):
        g.odslon("A", "harpagon", False)
    assert fn.aktywna(g.konfiguracja, "A", "harpagon", g.runda)
    assert funkcje_widok(g, "A", g.runda, {})["harpagon"]["zakrycie_zablokowane"] == fn.BLOKADA_HARPAGONA
    assert funkcje_widok(g, "B", g.runda, {})["harpagon"]["zakrycie_zablokowane"] == ""   # nieodsłonięta
    dlug = g.stan(1).firmy["A"].harpagon.dlug
    _graj(g, 1, r2={"A": {"harpagon_splac": dlug}})
    assert g.stan(2).firmy["A"].harpagon is None and funkcje_widok(g, "A", g.runda, {})["harpagon"]["zakrycie_zablokowane"] == ""
    g.odslon("A", "harpagon", False)   # po spłacie – można
    assert not fn.aktywna(g.konfiguracja, "A", "harpagon", g.runda)


@pytest.mark.parametrize("siec", ["zakryta", "odkryta"])
def test_kolejny_lokal_to_podstawa_gry_licytacja_to_siec(siec):
    """K3: kolejny lokal z „Nowych lokali” można wziąć bez sieci lokali – ale po cenie wywoławczej (oferta
    ponad nią, czyli licytacja, należy do sieci)."""
    g = _gra(_stany(siec=siec))
    _graj(g, 1)
    _graj(g, lk.runda_nowego_lokalu(g.dane, g.stan(1).firmy["A"]) - 2)
    r = g.runda
    lok = next(x for x in lk.dostepne(g.dane, r, lk.zajete(g.stan(r - 1).firmy), 3) if x.get("czynsz"))
    _graj(g, 1, **{f"r{r}": {"A": {"lokal": {"id": lok["id"], "forma": "najem", "oferta": lok["czynsz"] * 1.5}}}})
    s = g.stan(r)
    assert s.wyniki[r]["A"]["lokal_decyzja"]["przyjety"] and len(s.firmy["A"].lokale) == 2
    assert s.wyniki[r]["A"]["lokal_decyzja"]["oferta"] == (lok["czynsz"] if siec == "zakryta" else lok["czynsz"] * 1.5)
    assert not [b for b in s.wyniki[r]["A"].get("bledy", []) if b.get("funkcja") == "siec"]


def _auto_dostawy(g: Gra, d: dict, firma: str = "A") -> float:
    """Suma ilości auto-dostaw głównego lokalu z decyzji gry (autopilot zaopatrzenia) na bieżącą rundę."""
    w, _ = ap.decyzje_rundy(g.dane, g.stan(g.runda - 1), {firma: d}, g.konfiguracja, g.runda)
    return sum(p["ilosc"] for p in (w[firma].get("auto_dostawy") or {}).get("pozycje", []))


def test_autopilot_zaopatrzenia_bez_obsady_kuchni_bez_dostaw():
    """K4: lokal bez nikogo przy kuchni nic nie sprzeda – bez auto-dostaw (i abonamentu); bez kucharzy, ale
    z kasjerem – na kuchni staje właściciel, więc dostawy są."""
    g = _gra("pierwsza_gra")
    _graj(g, 2)
    f, d = g.stan(2).firmy["A"], _podstawa(g, "A")
    kucharze = [s.pracownik for s in f.stanowiska if s.typ == "kuchnia" and s.pracownik]
    assert kucharze and _auto_dostawy(g, d) > 0
    assert _auto_dostawy(g, {**d, "zwolnij": kucharze}) > 0   # właściciel przy kuchni
    assert _auto_dostawy(g, {**d, "zwolnij": [s.pracownik for s in f.stanowiska if s.pracownik]}) == 0
    _graj(g, 1, r3={"A": {"zwolnij": [s.pracownik for s in f.stanowiska if s.pracownik]}})
    assert not g.stan(3).wyniki[3]["A"].get("auto_dostawy", {}).get("lokale")


def test_autopilot_zaopatrzenia_prognoza_z_kampaniami_i_promocjami():
    """K4: kampania i promocje drużyny podnoszą prognozę – auto-dostawy większe."""
    g = _gra(_stany(zaopatrzenie="zakryta"), rund=7)
    _graj(g, 4)
    d = _podstawa(g, "A")
    strefa = g.dane.lokale[g.stan(4).firmy["A"].lokale[0].id]["strefa"]
    bez = _auto_dostawy(g, d)
    kampania = [{"agencja": "papier_przyjmie", "kanal": "ulotki", "strefa": strefa, "emisje": 20}]
    assert _auto_dostawy(g, {**d, "kampanie": kampania}) > bez
    assert _auto_dostawy(g, {**d, "promocje": [{"typ": "happy_hours"}]}) > bez


def test_autopilot_jakosc_skladnikow_jak_stanowiska_lokalu(monkeypatch):
    """K5: auto-dostawy w jakości lokalu – lepsze z gwiazdek prowadzącego i sprzętu, ważone porcjami; lokal bez
    stanowisk dań – jakość domyślna (funkcje.yaml: autopilot.jakosc_zasobow)."""
    dane = Dane(DANE_GRY)
    gw = {"a": (3.0, 2.0, 1.0), "b": (2.0, 2.0, 3.0), "c": None}
    monkeypatch.setattr(ap, "jakosc_uslugi", lambda _d, _v, u: gw[u])
    assert ap._jakosc_lokalu(dane, None, {"a": 10, "b": 10}, 2) == 3     # (3 + 2) / 2 = 2,5 → 3★
    assert ap._jakosc_lokalu(dane, None, {"a": 10, "b": 30}, 2) == 2     # 2,25 → 2★
    assert ap._jakosc_lokalu(dane, None, {"a": 0, "b": 5, "c": 50}, 1) == 2
    assert ap._jakosc_lokalu(dane, None, {"c": 50}, 1) == 1              # bez stanowisk – domyślna
    assert ap._jakosc_lokalu(dane, None, {}, 2) == 2


def test_autopilot_tani_lokal_dostaje_skladniki_1_gwiazdki():
    """K5: lokal z kucharzami i sprzętem 1★ (strategia tania) – auto-dostawy 1★, nie stałe 2★."""
    g = _gra(_stany(zaopatrzenie="zakryta"), rund=4)
    for _ in range(3):   # zakupy bota odfiltruje gra (zaopatrzenie zakryte) – zostaje lokal, ludzie i sprzęt
        g.ustaw_decyzje("A", bt.decyzje_bota(g.dane, g.stan(g.runda - 1), "A", "tani", g.runda, g.konfiguracja))
        g.ustaw_decyzje("B", _podstawa(g, "B"))
        g.przelicz(wymus=True)
    ad = g.stan(3).wyniki[3]["A"]["auto_dostawy"]["lokale"]
    assert ad and {p["jakosc"] for x in ad.values() for p in x["pozycje"]} == {1}
