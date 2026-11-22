"""Banki gry z lokalami: sześć banków z różnymi najlepszymi ofertami, konto i terminal, lokaty w dowolnym
banku, kredyt na start bez historii, inwestycyjny pod zastaw (przejęcie po zaległościach), leasing, limit w koncie."""

from copy import copy, deepcopy

from pomocnicze import _gra, _lokal, _netto, _runda

from silnik.dane import dane_domyslne
from silnik.ksiegowosc.finanse import Ksiega, Rachunek
from silnik.pieniadze import banki as bk


def _kpir(s, r, firma, poczatek):
    return [p for p in s.wyniki[r][firma]["kpir"]["pozycje"] if p["opis"].startswith(poczatek)]


def _bledy(s, r, firma):
    return [b["tekst"] for b in s.wyniki[r][firma]["lista_bledow"] if b["zakladka"] == "finanse_bank"]


def _start():
    g = _gra(("A", None), ("B", None))
    s = _runda(g, A={**_lokal("centrum_3"), "stanowiska": {"kuchnia": 1}, "bank": "Soplicowo"},
               B={**_lokal("zygmuntowskie_1", "kupno"), "bank": "Wokulski i S-ka"})
    return g, s


def test_kazdy_bank_ma_inna_najlepsza_oferte():
    dane = dane_domyslne()
    naj = bk.najlepsze(dane)
    assert naj == {"konto": "Soplicowo", "lokata": "Oszczędności Rzeckiego", "kredyt_bez_historii": "Kmicic",
                   "kredyt_inwestycyjny": "Wokulski i S-ka", "leasing": "Ziemia Obiecana", "debet": "Solaris"}
    assert set(naj.values()) == set(bk.banki(dane))


def test_konto_terminal_i_prowizja_od_kart():
    g, s = _start()
    f = deepcopy(s.firmy["A"])
    ks = Ksiega()
    ks.dodaj("Sprzedaż usług", 10000, "przychod")
    info = bk.koniec_rundy(g.dane, f, 2, ks, Rachunek())
    u = bk.ustawienia(g.dane)
    assert info["oplaty"] == {"konto": 0, "terminal": 0, "prowizja": round(10000 * u["udzial_kart"] * 0.0079, 2)}
    s = _runda(g)
    assert _kpir(s, 2, "B", "Opłata za konto firmowe (Wokulski i S-ka)")[0]["pozostale"] == g.dane.na_runde(25)
    assert _kpir(s, 2, "B", "Abonament terminala")[0]["pozostale"] == _netto(g.dane.na_runde(49))


def test_kredyt_na_start_bez_historii_a_obrotowy_wymaga_historii():
    g = _gra(("A", None), ("B", None))
    s = _runda(g, A={**_lokal("centrum_3"), "bank": "Soplicowo",
                     "kredyty_wez": [{"bank": "Kmicic", "produkt": "start", "kwota": 30000, "rund": 26}]},
               B={**_lokal("dworzec_1"), "bank": "Soplicowo",
                  "kredyty_wez": [{"bank": "Wokulski i S-ka", "produkt": "obrotowy", "kwota": 10000, "rund": 26}]})
    k = s.firmy["A"].kredyty[0]
    assert (k.bank, k.produkt, k.kwota, k.miesiecy) == ("Kmicic", "start", 30000, 26)
    assert _kpir(s, 1, "A", "Prowizja za udzielenie kredytu")[0]["pozostale"] == 300
    assert not s.firmy["B"].kredyty and any("historii" in t for t in _bledy(s, 1, "B"))
    s = _runda(g)   # pierwsza rata od następnej rundy, oprocentowanie Kmicic
    assert s.firmy["A"].kredyty[0].pozostalo == round(30000 - 30000 / 26, 2)
    assert _kpir(s, 2, "A", "Odsetki od kredytu nr")[0]["pozostale"] == round(30000 * 0.149 / 52, 2)


def test_lokata_w_innym_banku_niz_konto():
    g, s = _start()
    s = _runda(g, A={"lokaty_zaloz": [{"bank": "Oszczędności Rzeckiego", "kwota": 20000, "rund": 4}],
                     "kredyty_wez": [{"bank": "Oszczędności Rzeckiego", "produkt": "obrotowy", "kwota": 1000, "rund": 4}]})
    lo = s.firmy["A"].lokaty[0]
    assert (lo.bank, lo.oprocentowanie, lo.miesiecy) == ("Oszczędności Rzeckiego", 0.036, 4)
    assert any("historii" in t for t in _bledy(s, 2, "A"))
    for _ in range(3):
        s = _runda(g)
    assert not s.firmy["A"].lokaty
    odsetki = [p for p in s.wyniki[5]["A"]["kpir"]["pozycje"] if p["opis"].startswith("Odsetki od lokaty")]
    assert odsetki[0]["przychod_pozostaly"] == round(20000 * 0.036 * 4 / 52, 2)


def _zalegla_runda(dane, f, runda):
    f.gotowka, f.debet = -1e6, 1e6      # ani gotówki, ani wolnego limitu
    return bk.koniec_rundy(dane, f, runda, Ksiega(), Rachunek())


def test_kredyt_inwestycyjny_pod_zastaw_lokalu_i_przejecie():
    g, s = _start()
    for _ in range(4):
        s = _runda(g)
    assert bk.historia(s.firmy["B"], 6) == 5
    zastaw = bk.zastawy(g.dane, s.firmy["B"])[0]
    assert zastaw["id"] == "lokal:zygmuntowskie_1"
    za_duzo = {"bank": "Wokulski i S-ka", "produkt": "inwestycyjny", "kwota": zastaw["wartosc"], "rund": 52, "zastaw": zastaw["id"]}
    s = _runda(g, B={"kredyty_wez": [za_duzo]})
    assert not s.firmy["B"].kredyty and any("pod ten zastaw" in t for t in _bledy(s, 6, "B"))
    kwota = round(0.5 * zastaw["wartosc"], 2)
    s = _runda(g, B={"kredyty_wez": [{**za_duzo, "kwota": kwota}]})
    f = deepcopy(s.firmy["B"])
    k = f.kredyty[0]
    assert (k.produkt, k.oprocentowanie, k.zastaw) == ("inwestycyjny", 0.069, "lokal:zygmuntowskie_1")
    assert not bk.zastawy(g.dane, f)                 # lokal już zastawiony
    for r in (8, 9):
        info = _zalegla_runda(g.dane, f, r)
        assert not info["przejecia"] and info["zaleglosci"]
    assert f.kredyty[0].zalegle == 2 and f.kredyty[0].pozostalo > kwota      # odsetki doliczone do długu
    info = _zalegla_runda(g.dane, f, 10)
    p = info["przejecia"][0]
    assert p["zastaw"].startswith("lokal") and p["wycena"] > p["dlug"] and p["nadwyzka"] > 0
    assert not f.kredyty and f.lokale[0].forma == "najem" and f.lokale[0].czynsz > 0
    assert not [x for x in f.srodki_trwale if x.rodzaj == "lokal"]


def test_kredyt_pod_zastaw_kupowanej_dzialki_liczy_budowany_lokal():
    """Zastaw działki to budowany lokal – wartość = cena + koszt budowy, więc kredyt pokrywa też budowę."""
    g = _gra(("A", None), ("B", None))
    dz = g.dane.lokale["czechow_3"]
    nowy = bk.nowy_lokal(g.dane, _lokal("czechow_3", "kupno"), 1)
    assert nowy["wartosc"] == dz["cena"] + dz["koszt_budowy"]
    kwota = round(0.7 * nowy["wartosc"], 2)   # więcej niż cena działki – na start i budowę
    assert kwota > dz["cena"]
    s = _runda(g, A={**_lokal("czechow_3", "kupno"), "bank": "Wokulski i S-ka",
                     "kredyty_wez": [{"bank": "Wokulski i S-ka", "produkt": "inwestycyjny", "kwota": kwota, "rund": 104,
                                      "zastaw": nowy["id"]}]},
               B={**_lokal("centrum_3"), "bank": "Soplicowo"})
    f = s.firmy["A"]
    assert [(x.id, x.forma) for x in f.lokale] == [("czechow_3", "kupno")]
    assert [(k.kwota, k.zastaw) for k in f.kredyty] == [(kwota, "lokal:czechow_3")]


def test_spozniona_rata_splacana_razem_z_biezaca():
    g, s = _start()
    s = _runda(g, A={"kredyty_wez": [{"bank": "Kmicic", "produkt": "start", "kwota": 26000, "rund": 26}]})
    f = deepcopy(s.firmy["A"])
    _zalegla_runda(g.dane, f, 3)
    k = f.kredyty[0]
    assert (k.zalegle, k.zaleglosc) == (1, 1000)
    f.gotowka, f.debet = 50000, 0
    info = bk.koniec_rundy(g.dane, f, 4, Ksiega(), Rachunek())
    assert info["raty"][0]["zaplacona"] and (k.zalegle, k.zaleglosc) == (0, 0)
    assert k.pozostalo == round(26000 + 26000 * 0.149 / 52 - 2000, 2)


def test_leasing_sprzetu_raty_w_koszty_bez_sprzedazy_i_wykup():
    g, s = _start()
    leasing = {"bank": "Ziemia Obiecana", "typ": "kuchnia", "nr": 2, "nazwa": "Rożen", "jakosc": 3, "rund": 26}
    s = _runda(g, A={"leasing_wez": [leasing]})
    f = s.firmy["A"]
    lea = f.leasingi[0]
    assert f.stanowisko("kuchnia", 2).sprzet["Rożen"] == 3 and not f.srodki_trwale
    assert lea.rata == bk.rata_annuitetowa(7000 * 0.95, 0.075, 26, 52)
    assert _kpir(s, 2, "A", "Opłata wstępna leasingu")[0]["pozostale"] == _netto(350)
    s = _runda(g, A={"sprzet_sprzedaj": [{"typ": "kuchnia", "nr": 2, "nazwa": "Rożen"}]})
    assert "Rożen" in s.firmy["A"].stanowisko("kuchnia", 2).sprzet
    assert _kpir(s, 3, "A", "Rata leasingowa")[0]["pozostale"] == _netto(lea.rata)
    f = deepcopy(s.firmy["A"])
    f.leasingi[0].pozostalo_rat = 1
    info = bk.koniec_rundy(g.dane, f, 4, Ksiega(), Rachunek())
    assert info["wykupy"] and not f.leasingi and "Rożen" not in f.stanowisko("kuchnia", 2).sprzet_wynajmujacego


def test_leasing_zalegly_bank_zabiera_sprzet():
    g, s = _start()
    s = _runda(g, A={"leasing_wez": [{"bank": "Ziemia Obiecana", "typ": "kuchnia", "nr": 2, "nazwa": "Rożen", "jakosc": 1, "rund": 52}]})
    f = deepcopy(s.firmy["A"])
    for r in (3, 4, 5):
        info = _zalegla_runda(g.dane, f, r)
    assert info["przejecia"] and not f.leasingi and "Rożen" not in f.stanowisko("kuchnia", 2).sprzet


def test_debet_za_zgoda_ma_limit_oplate_i_odsetki():
    g, s = _start()
    f = deepcopy(s.firmy["A"])
    f.bank, f.debet, f.gotowka, f.debet_wlaczony = "Solaris", 50000, 0, True
    ks = Ksiega()
    bk.koniec_rundy(g.dane, f, 2, ks, Rachunek())
    poz = {p["opis"]: p["pozostale"] for p in ks.pozycje}
    assert poz["Odsetki od debetu"] == round(40000 * 0.17 / 52, 2)
    assert poz["Opłata za tydzień na minusie (Solaris)"] == 90
    assert poz["Odsetki karne od debetu ponad limit"] == round(10000 * 0.19 / 52, 2)
    assert bk.debet_ponad_limit(g.dane, f) == 10000 and bk.wolny_limit(g.dane, f) == 0
    assert any("ponad limit" in b["tekst"] for b in bk.bledy(g.dane, f, None, None))


def test_debet_bez_zgody_to_alarm_i_odsetki_karne():
    g, s = _start()
    f = deepcopy(s.firmy["A"])
    f.bank, f.debet, f.gotowka, f.debet_wlaczony = "Solaris", 5000, 0, False
    assert bk.limit_debetu(g.dane, f) == 0 and bk.debet_ponad_limit(g.dane, f) == 5000
    ks = Ksiega()
    bk.koniec_rundy(g.dane, f, 2, ks, Rachunek())
    poz = {p["opis"]: p["pozostale"] for p in ks.pozycje}
    assert poz["Odsetki karne od debetu bez zgody banku"] == round(5000 * 0.19 / 52, 2)
    assert not any(o.startswith("Opłata za tydzień na minusie") for o in poz)
    assert any("nie jest włączony" in b["tekst"] for b in bk.bledy(g.dane, f, None, None))


def test_decyzja_debet_wlacza_i_wylacza_zgode():
    g, s = _start()
    assert s.firmy["A"].debet_wlaczony is False
    s = _runda(g, A={"debet": True})
    assert s.firmy["A"].debet_wlaczony is True and bk.limit_debetu(g.dane, s.firmy["A"]) == 6000
    s = _runda(g, A={"debet": False})
    assert s.firmy["A"].debet_wlaczony is False
    f = s.firmy["A"]
    f.debet, f.debet_wlaczony = 100, True   # na minusie zgody nie można cofnąć
    info = bk.poczatek_rundy(g.dane, f, {"debet": False}, 5, Ksiega(), Rachunek())
    assert f.debet_wlaczony and any("Wyłączenie debetu" in o["co"] for o in info["odrzucone"])


def test_kredyt_inwestycyjny_od_wziecia_lokalu_bez_historii():
    inw = {"bank": "Wokulski i S-ka", "produkt": "inwestycyjny", "kwota": 20000, "rund": 52}
    g = _gra(("A", None), ("B", None))
    s = _runda(g, A={**_lokal("centrum_3"), "bank": "Soplicowo", "kredyty_wez": [{**inw, "zastaw": "lokal:centrum_3"}]},
               B={"bank": "Soplicowo", "kredyty_wez": [{**inw, "zastaw": "lokal:centrum_3"}]})
    assert not s.firmy["B"].kredyty and any("firmie z lokalem" in t for t in _bledy(s, 1, "B"))
    assert not s.firmy["A"].kredyty     # wynajęty lokal nie jest zastawem
    g, s = _start()
    zastaw = bk.zastawy(g.dane, s.firmy["B"])[0]
    s = _runda(g, B={"kredyty_wez": [{**inw, "zastaw": zastaw["id"]}]})   # runda 2 – bez 4 rund historii
    assert [(k.produkt, k.zastaw) for k in s.firmy["B"].kredyty] == [("inwestycyjny", "lokal:zygmuntowskie_1")]


def test_kredyt_inwestycyjny_na_zakup_lokalu_w_tej_samej_rundzie():
    g = _gra(("A", None), ("B", None))
    cena = g.dane.lokale["politechnika_3"]["cena"]       # więcej niż kapitał startowy
    kred = {"bank": "Wokulski i S-ka", "produkt": "inwestycyjny", "kwota": 60000, "rund": 104, "zastaw": "lokal:politechnika_3"}
    assert cena > 100000
    oferta_a = {"lokal": {"id": "politechnika_3", "forma": "kupno", "oferta": cena + 5000}}
    s = _runda(g, A={**oferta_a, "bank": "Soplicowo", "kredyty_wez": [kred]},
               B={**_lokal("politechnika_3", "kupno"), "bank": "Soplicowo", "kredyty_wez": [kred]})
    a = s.firmy["A"]
    assert [lok.id for lok in a.lokale] == ["politechnika_3"]
    assert [(k.kwota, k.zastaw) for k in a.kredyty] == [(60000, "lokal:politechnika_3")]
    assert not bk.zastawy(g.dane, a)                 # kupiony lokal już zastawiony
    b = s.firmy["B"]   # przegrał licytację – nie ma lokalu pod zastaw, kredyt przepada
    assert not b.lokale and not b.kredyty
    assert any("nie został kupiony" in t for t in _bledy(s, 1, "B"))
    g = _gra(("A", None), ("B", None))
    s = _runda(g, A={**_lokal("politechnika_3", "kupno"), "bank": "Soplicowo", "kredyty_wez": [{**kred, "kwota": 30000}]})
    assert not s.firmy["A"].lokale and not s.firmy["A"].kredyty     # za mały kredyt – brak gotówki na zakup


def _tylko_bank_konta(g):
    """Sprawa 21 (poprawki 2): włącza `tylko_bank_konta` w danych tej gry (kopia – bez zmiany danych innych testów)."""
    g.dane = copy(g.dane)
    g.dane.mapa = {**g.dane.mapa, "banki": {**g.dane.mapa["banki"], "tylko_bank_konta": True}}


def test_tylko_bank_konta_odrzuca_produkty_innych_bankow():
    g, s = _start()
    _tylko_bank_konta(g)
    s = _runda(g, A={"lokaty_zaloz": [{"bank": "Oszczędności Rzeckiego", "kwota": 1000, "rund": 4},
                                      {"bank": "Soplicowo", "kwota": 1000, "rund": 4}],
                     "kredyty_wez": [{"bank": "Kmicic", "produkt": "start", "kwota": 5000, "rund": 26}],
                     "leasing_wez": [{"bank": "Ziemia Obiecana", "typ": "kuchnia", "nr": 1, "nazwa": "Rożen", "jakosc": 1,
                                      "rund": 26}]})
    f = s.firmy["A"]
    assert [lo.bank for lo in f.lokaty] == ["Soplicowo"] and not f.kredyty and not f.leasingi
    assert sum("kontem firmowym w tym banku" in t for t in _bledy(s, 2, "A")) >= 2
    # zmiana konta działa od razu – w tej samej rundzie kredyt w nowym banku
    s = _runda(g, A={"bank": "Kmicic",
                     "kredyty_wez": [{"bank": "Kmicic", "produkt": "start", "kwota": 5000, "rund": 26}]})
    assert [k.bank for k in s.firmy["A"].kredyty] == ["Kmicic"]
    assert [lo.bank for lo in s.firmy["A"].lokaty] == ["Soplicowo"]   # stare produkty biegną dalej
    assert set(bk.dostepne(g.dane, "Wokulski i S-ka")) == {"Wokulski i S-ka"}
