"""Wynik punktowy 0–1000 pkt (silnik/wyniki/punkty.py): progi, działy, Wielkie otwarcie, ranking z wagami tygodni."""

import copy

import pytest
from pomocnicze import _gra, _lokal, _runda

from balans import warianty as wr
from silnik.boty import decyzje_bota
from silnik.dane import dane_domyslne
from silnik.gra import Gra
from silnik.model import Firma, SrodekTrwaly
from silnik.runda import _netto_karty, mandaty_rundy
from silnik.wyniki import punkty as pk

DZIALY = ("finanse", "goscie", "zespol", "rozwoj", "bezpieczenstwo")


@pytest.fixture(scope="module")
def gra_botow():
    g = _gra(("Tani", "tani"), ("Premium", "premium"), ("Zrown", "zrownowazony"), ("Agr", "agresywny"), rund=5)
    for _ in range(5):
        s = g.przelicz(wymus=True)
    return g, s


def _dane(**zmiany):
    """Kopia danych zamrożonych ze zmianami w sekcji `wynik`."""
    d = copy.deepcopy(dane_domyslne())
    d.z["wynik"].update(zmiany)
    return d


# --- progi ---------------------------------------------------------------------------------------------------------

def test_punkty_skladnika_interpolacja_i_ponad():
    sk = {"progi": [[0, 0], [10, 50], [20, 100]], "ponad": {"za": 5, "pkt": 10, "maks": 25}}
    assert pk.punkty_skladnika(sk, -5) == 0                     # poniżej pierwszego progu – punkty pierwszego
    assert pk.punkty_skladnika(sk, 5) == 25 and pk.punkty_skladnika(sk, 15) == 75
    assert pk.punkty_skladnika(sk, 20) == 100
    assert pk.punkty_skladnika(sk, 25) == 110                   # za każde 5 ponad ostatnim progiem +10
    assert pk.punkty_skladnika(sk, 1000) == 125                 # ale najwyżej `maks`
    assert pk.punkty_skladnika({"progi": [[0, 40], [0.2, 0]]}, 0.1) == 20   # punkty mogą też maleć z miarą


def test_tabela_w_danych_ma_piec_dzialow_po_200_punktow():
    for d in (dane_domyslne(),):
        tab = pk.tabela(d)
        assert tuple(tab["dzialy"]) == DZIALY
        for nazwa, dzial in tab["dzialy"].items():
            maks = sum(max(y for _, y in s["progi"]) for s in dzial["skladniki"].values())
            assert maks == 200, nazwa
            assert all(len(s["progi"]) >= 2 and "nazwa" in s and "podpowiedz" in s for s in dzial["skladniki"].values())
        assert sum(max(y for _, y in s["progi"]) for s in tab["otwarcie"]["skladniki"].values()) == 1000
        assert tab["oceny"][0] < tab["oceny"][1]


def test_dzial_moze_przekroczyc_200_punktow():
    d = dane_domyslne()
    miary = {z: {k: max(s["progi"], key=lambda p: p[1])[0] for k, s in dz["skladniki"].items()}
             for z, dz in pk.ustawienia(d)["dzialy"].items()}
    ok = pk.karta(d, miary, {})
    assert all(ok["dzialy"][z]["punkty"] == 200 for z in DZIALY) and ok["punkty"] == 1000
    hojny = {**miary, "zespol": {**miary["zespol"], "udogodnienia": 5.0}}   # bardzo hojny socjal
    wyjatkowy = pk.karta(d, hojny, {})
    assert wyjatkowy["dzialy"]["zespol"]["punkty"] > 200 and wyjatkowy["punkty"] > 1000


def test_oceny_dzialu():
    d = dane_domyslne()
    assert [pk.ocena(d, p) for p in (50, 100, 150)] == ["niski", "sredni", "dobry"]


# --- zadowolenie gości ---------------------------------------------------------------------------------------------

def test_zadowolenie_gosci_rosnie_z_jakoscia_i_spada_z_kolejkami_i_pomylkami():
    d = dane_domyslne()
    baza = {"jakosc": 0.7, "cena_wzgledem_strefy": 1.0, "kolejki": 0.0, "brakujace_dania": 0.0, "mandat": 0,
            "wypadki": 0, "pomylki": 0.0}
    g = pk.zadowolenie_gosci(d, baza)
    assert 0 <= g <= 100
    assert pk.zadowolenie_gosci(d, {**baza, "jakosc": 0.82}) > g > pk.zadowolenie_gosci(d, {**baza, "jakosc": 0.55})
    assert pk.zadowolenie_gosci(d, {**baza, "cena_wzgledem_strefy": 0.8}) > g > pk.zadowolenie_gosci(
        d, {**baza, "cena_wzgledem_strefy": 1.4})
    assert pk.zadowolenie_gosci(d, {**baza, "kolejki": 0.3}) < g
    assert pk.zadowolenie_gosci(d, {**baza, "brakujace_dania": 0.3}) < g
    assert pk.zadowolenie_gosci(d, {**baza, "mandat": 100.0}) < g
    assert pk.zadowolenie_gosci(d, {**baza, "wypadki": 2}) < g
    assert pk.zadowolenie_gosci(d, {**baza, "pomylki": 0.2}) < g
    assert pk.zadowolenie_gosci(d, {**baza, "jakosc": 5.0, "cena_wzgledem_strefy": 0.1}) == 100


# --- karta w grze --------------------------------------------------------------------------------------------------

def test_karta_tygodnia_w_grze(gra_botow):
    g, s = gra_botow
    assert s.wyniki[1]["Zrown"]["karta"]["otwarcie"] is True        # tydzień 1 – Wielkie otwarcie
    for r in range(2, 6):
        for n, w in s.wyniki[r].items():
            k = w["karta"]
            assert tuple(k["dzialy"]) == DZIALY and "otwarcie" not in k
            assert k["punkty"] == pytest.approx(sum(x["punkty"] for x in k["dzialy"].values()), abs=0.2), (r, n)
            for x in k["dzialy"].values():
                assert x["punkty"] == pytest.approx(sum(y["punkty"] for y in x["skladniki"].values()), abs=0.2)
            assert 0 <= k["wskazniki"]["zadowolenie_gosci"] <= 100
    # boty różnią się wynikiem: strategia zrównoważona nie jest najgorsza, a agresywna nie jest najlepsza
    wynik = {n: s.wyniki[5][n]["karta"]["punkty"] for n in s.firmy}
    assert wynik["Zrown"] > wynik["Agr"]


def test_wielkie_otwarcie_nagradza_przygotowanie():
    g = _gra()
    s = _runda(g, A={**_lokal("centrum_3")}, B={})
    a, b = s.wyniki[1]["A"]["karta"], s.wyniki[1]["B"]["karta"]
    assert a["otwarcie"] and set(a["przygotowanie"]) == {"lokal", "menu", "ekipa", "zaopatrzenie", "rezerwa"}
    assert a["przygotowanie"]["lokal"]["punkty"] == 250 and b["przygotowanie"]["lokal"]["punkty"] == 0
    assert a["punkty"] > b["punkty"]


def test_karta_skumulowana_i_widok(gra_botow):
    from api.prezentacja import karta_skumulowana, widok
    g, s = gra_botow
    skum = karta_skumulowana(g, 5)
    d = g.dane
    for n in s.firmy:
        oczekiwane = pk.ranking(d, {r: s.wyniki[r][n]["karta"]["punkty"] for r in range(1, 6)}, 5)
        assert skum[n]["punkty"] == oczekiwane["wynik"] and skum[n]["suma_wazona"] == oczekiwane["suma_wazona"]
        assert set(skum[n]["dzialy"]) == set(DZIALY)
    v = widok(g, "Tani")
    assert v["tabela_punktow"]["dzialy"].keys() == pk.tabela(d)["dzialy"].keys()
    assert v["ranking"]["miejsca"][5] == {n: i + 1 for i, n in enumerate(sorted(skum, key=lambda x: -skum[x]["punkty"]))}


# --- ranking z wagami ----------------------------------------------------------------------------------------------

def test_ostatnie_tygodnie_waza_wiecej():
    d = dane_domyslne()
    w = [pk.waga_tygodnia(d, r, 12) for r in range(1, 13)]
    assert w[0] < w[1] and w[1:] == sorted(w[1:]) and w[-1] > w[1]    # otwarcie lekkie, potem coraz więcej
    wzrost = {r: 500.0 for r in range(1, 12)} | {12: 900.0}
    spadek = {r: 500.0 for r in range(1, 12)} | {1: 900.0}
    assert pk.ranking(d, wzrost, 12)["wynik"] > pk.ranking(d, spadek, 12)["wynik"]
    assert pk.ranking(d, {r: 600.0 for r in range(1, 13)}, 12)["wynik"] == 600   # średnia ważona stałego wyniku


# --- majątek, dochód, mandaty --------------------------------------------------------------------------------------

def test_majatek_karty_liczy_nieruchomosci_z_waga():
    f = Firma(nazwa="A", majatek=20000)
    f.srodki_trwale = [SrodekTrwaly(nazwa="Lokal: a", rodzaj="lokal", wartosc=300000, od_rundy=1, stawka=0.025,
                                    umorzenie=1000),
                       SrodekTrwaly(nazwa="Działka: b", rodzaj="grunt", wartosc=100000, od_rundy=1, stawka=0),
                       SrodekTrwaly(nazwa="Piec", rodzaj="sprzet", wartosc=12000, od_rundy=1, stawka=0.2)]
    assert pk.majatek_karty(_dane(waga_nieruchomosci=1), f) == 20000 + 299000 + 100000
    assert pk.majatek_karty(_dane(waga_nieruchomosci=0.5), f) == 20000 + 0.5 * 399000   # sprzęt z ewidencji bez wagi
    assert pk.majatek_karty(_dane(waga_nieruchomosci=0), f) == 20000


def test_udzial_kapitalu():
    assert pk.udzial_kapitalu(0, 100, 0, 0) == 1
    assert pk.udzial_kapitalu(50_000, 50_000, 0, 0) == pytest.approx(0.5)
    assert pk.udzial_kapitalu(50_000, 50_000, 0, 50_000) == pytest.approx(0.667, abs=0.001)   # kasa osłabia dług
    assert pk.udzial_kapitalu(50_000, 50_000, 0, -5_000) == pytest.approx(0.5)               # debet nie pomaga


def test_mandaty_rundy_skarbowe_biuro_bez_oc_i_sanepid():
    info = {"ksiegowosc": {"kara": 500.0}, "biuro": {"blad": {"kara": 200.0, "oc": False}},
            "magazyn": {"sanepid": {"mandat": 300.0}}}
    assert mandaty_rundy(info) == 1000
    info["biuro"]["blad"]["oc"] = True                           # biuro z OC oddaje mandat
    assert mandaty_rundy(info) == 800
    assert mandaty_rundy({"ksiegowosc": None, "biuro": {"blad": None}, "magazyn": {"sanepid": None}}) == 0


def test_netto_karty_odejmuje_mandaty_tylko_przy_wlaczonym_przelaczniku():
    info = {"harpagon_odsetki": {"odsetki": 50.0}, "ksiegowosc": {"kara": 500.0}}
    assert _netto_karty(_dane(mandaty_w_dochodzie=False), 3000, info) == 2950   # tylko odsetki Harpagona
    assert _netto_karty(_dane(mandaty_w_dochodzie=True), 3000, info) == 2450


def _karta_z_mandatem(wlaczone: bool):
    """Samodzielna księgowość bez deklaracji – urząd rozlicza z urzędu z mandatem."""
    g = Gra.nowa("biuro", [("H", None), ("B", "zrownowazony")], 8, 3, lokale=True,
                 dane=_dane(mandaty_w_dochodzie=wlaczone))
    for _ in range(5):
        d = decyzje_bota(g.dane, g.stan(), "H", "zrownowazony", g.runda, g.konfiguracja)
        d["biuro"] = "samodzielnie"
        g.ustaw_decyzje("H", d)
        g.przelicz(wymus=True)
    return g.stan().wyniki[g.runda - 1]["H"]


def test_mandat_za_brak_deklaracji_obniza_dochod_w_dziale_finanse():
    wl, wyl = _karta_z_mandatem(True), _karta_z_mandatem(False)
    kara = wl["ksiegowosc"]["kara"]
    assert kara > 0 and wl["kpir"]["dochod_netto"] == wyl["kpir"]["dochod_netto"]   # KPiR i podatki bez zmian
    dochod = lambda w: w["karta"]["dzialy"]["finanse"]["skladniki"]["dochod"]["miara"]   # noqa: E731
    assert dochod(wyl) - dochod(wl) == pytest.approx(kara, abs=1)


def test_odsetki_harpagona_obnizaja_dochod_w_punktach():
    g = _gra(("A", None), ("B", None))
    _runda(g, A={**_lokal("centrum_3"), "harpagon_wez": 10000}, B=_lokal("dworzec_1"))
    s = _runda(g)
    w = s.wyniki[2]["A"]
    odsetki = w["harpagon"]["odsetki"]["odsetki"]
    assert odsetki > 0
    miara = w["karta"]["dzialy"]["finanse"]["skladniki"]["dochod"]["miara"]
    assert miara == pytest.approx(w["kpir"]["dochod_netto"] - odsetki, abs=1)


@pytest.mark.dane_gry
def test_przelaczniki_w_danych_gry_i_sciezki_dla_wariantow():
    d = dane_domyslne()
    assert d.z["wynik"]["mandaty_w_dochodzie"] is True and d.z["wynik"]["waga_nieruchomosci"] == 0.5
    w = wr.dane_ze_zmianami("z.wynik.mandaty_w_dochodzie=false;z.wynik.waga_nieruchomosci=1")
    assert w.z["wynik"]["mandaty_w_dochodzie"] is False and w.z["wynik"]["waga_nieruchomosci"] == 1


def test_ranking_ucznia_z_majatkiem_netto():
    """U13: w rankingu drużyna widzi majątek netto wszystkich firm z ostatniej przeliczonej rundy."""
    from api.prezentacja import widok
    g = _gra()
    s = _runda(g, A=_lokal("centrum_3"), B=_lokal("dworzec_1"))
    m = widok(g, "A")["majatek_firm"]
    assert set(m) == set(s.wyniki[1]) and m["B"] == s.wyniki[1]["B"]["majatek_netto"]["razem"]
