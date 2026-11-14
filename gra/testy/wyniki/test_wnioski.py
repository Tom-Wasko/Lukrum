"""Wnioski z rundy (silnik/wyniki/wnioski.py): co się udało i rady do kolejnej rundy – reguły na wynikach firmy."""

import pytest
from pomocnicze import _gra, _lokal, _runda

from silnik.dane import dane_domyslne
from silnik.wyniki.wnioski import dlaczego, tydzien, wnioski

D = dane_domyslne()


def _w(**zmiany):
    w = {"kpir": {"dochod_netto": 500.0, "przychody": 3000.0, "koszty": 2500.0, "towary": 1000.0,
                  "wynagrodzenia": 1200.0, "pozostale": 300.0},
         "sprzedaz": {}, "lokale": [{"dziala": True, "dziala_od": 1}], "lista_bledow": [], "debet": 0.0}
    return w | zmiany


def _danie(popyt, sprzedaz, prognoza, przyczyna="", reklamacje=0):
    return {"popyt": popyt, "sprzedaz": sprzedaz, "utracona": popyt - sprzedaz, "prognoza": prognoza,
            "przyczyna": przyczyna, "pomylki": reklamacje}


def test_brak_wynikow_i_dobra_runda():
    assert wnioski(D, None) is None
    w = wnioski(D, _w(sprzedaz={"kebab_box": _danie(100, 100, 100)}))
    assert w["do_poprawy"] == []
    assert any("100 klientów" in t for t in w["dobre"]) and any("na plusie" in t for t in w["dobre"])


def test_rady_wedlug_przyczyny_i_prognozy():
    w = wnioski(D, _w(sprzedaz={
        "kebab_box": _danie(100, 60, 50, "zasoby (Mięso)"),
        "kebab_w_bulce": _danie(80, 40, 80, "kasa", reklamacje=3),
        "talerz_kebab": _danie(20, 20, 40),
    }))
    tytuly = {r["tytul"]: r for r in w["do_poprawy"]}
    assert "brak: Mięso" in tytuly["Zabrakło składników"]["co"] and tytuly["Zabrakło składników"]["zakladka"] == "dostawcy"
    assert tytuly["Kolejka przy kasie"]["zakladka"] == "zatrudnienie"
    assert "Kebab box" in tytuly["Chętnych było więcej, niż zakładała prognoza"]["co"]
    assert "Talerz" in tytuly["Prognoza była wyższa niż popyt"]["co"]
    assert "Pomyłki w szczycie" in tytuly


def test_strata_i_mandaty_z_rada():
    w = wnioski(D, _w(kpir={"dochod_netto": -800.0, "przychody": 1000.0, "koszty": 1800.0, "towary": 300.0,
                            "wynagrodzenia": 1200.0, "pozostale": 300.0},
                      ksiegowosc={"tryb": "deklaracja", "kara": 500.0},
                      magazyn={"sanepid": {"przeterminowane": 150.0, "mandat": 400.0}}))
    tytuly = {r["tytul"]: r for r in w["do_poprawy"]}
    assert "pensje" in tytuly["Runda na minusie"]["rada"] and "normalna" in tytuly["Runda na minusie"]["co"]
    assert {"Mandat za deklaracje", "Mandat z sanepidu", "Część składników się przeterminowała"} <= set(tytuly)
    assert w["dobre"]   # zawsze coś zachęcającego na początek


def test_czerwone_bledy_bez_powtorzen_i_z_limitem():
    bledy = [{"poziom": "czerwony", "zakladka": f"z{i}", "tekst": f"błąd {i}"} for i in range(5)]
    bledy.append({"poziom": "czerwony", "zakladka": "kpir", "tekst": "powtórka"})
    w = wnioski(D, _w(kpir={**_w()["kpir"], "dochod_netto": -1.0}, lista_bledow=bledy))
    sygnaly = [r for r in w["do_poprawy"] if r["tytul"] == "Sygnał z listy błędów"]
    assert len(sygnaly) == D.z["wnioski"]["bledy_max"] and all(r["co"] != "powtórka" for r in sygnaly)


def test_wnioski_po_rundzie_bez_lokalu_i_z_lokalem():
    g = _gra()
    s = _runda(g, A=_lokal("centrum_2"), B={})
    assert wnioski(D, s.wyniki[1]["B"])["do_poprawy"][0]["tytul"] == "Firma nie ma jeszcze lokalu"
    assert "Macie lokal" in " ".join(wnioski(D, s.wyniki[1]["A"])["dobre"])



def _karta(finanse=100.0, goscie=100.0, otwarcie=False):
    """Karta punktowa z dwoma zmiennymi działami (pozostałe po 100 pkt) i po jednym składniku w dziale."""
    dz = {"finanse": finanse, "goscie": goscie, "zespol": 100.0, "rozwoj": 100.0, "bezpieczenstwo": 100.0}
    dzialy = {d: {"nazwa": d.capitalize(), "punkty": p, "skladniki": {"x": {"nazwa": f"składnik {d}", "punkty": p}}}
              for d, p in dz.items()}
    return {"punkty": sum(dz.values()), "dzialy": dzialy, "wskazniki": {}, "otwarcie": otwarcie}


def _kpir(netto, **pozostale):
    return {"dochod_netto": netto, "pozycje": [{"opis": f"{k}: x", "pozostale": v} for k, v in pozostale.items()]
            + [{"opis": "Sprzedaż", "przychod": 3000.0}]}


def test_dlaczego_wynik_sie_zmienil():
    """U16: 1–3 zdania z największej zmiany działu – w finansach z pozycją KPiR, która zaważyła."""
    assert dlaczego(D, None, None) is None and dlaczego(D, {"kpir": {}}, None) is None
    wp = {"karta": _karta(finanse=140.0), "kpir": _kpir(2000.0, Czynsz=900.0)}
    w = {"karta": _karta(finanse=20.0), "kpir": _kpir(-11000.0, Czynsz=900.0, **{"Zakup sprzętu": 11448.0})}
    z = dlaczego(D, w, wp)
    assert z[0] == "Wynik spadł z 540 do 420 pkt."
    assert "dział „Finanse” (140 → 20 pkt), głównie „składnik finanse”" in z[1]
    assert "najbardziej zaważyła pozycja „Zakup sprzętu”" in z[2] and len(z) == 3
    # finanse bez zmian, spadło zadowolenie gości
    z = dlaczego(D, {"karta": _karta(goscie=40.0), "kpir": _kpir(4615.0)}, {"karta": _karta(), "kpir": _kpir(4615.0)})
    assert z[0] == "Wynik spadł z 500 do 440 pkt." and "dział „Goscie”" in z[1] and len(z) == 2
    assert dlaczego(D, {"karta": _karta(finanse=150.0), "kpir": _kpir(1.0)}, wp)[0].startswith("Wynik wzrósł")
    assert "prawie się nie zmienił" in dlaczego(D, wp, wp)[0]
    # tydzień 1 i pierwszy tydzień sprzedaży – bez porównania działów
    otwarcie = {"karta": {"punkty": 400.0, "otwarcie": True, "dzialy": {}}, "kpir": _kpir(0.0)}
    assert dlaczego(D, otwarcie, None)[0].startswith("Wielkie otwarcie: 400 pkt")
    assert dlaczego(D, w, otwarcie)[0].startswith("Pierwszy tydzień sprzedaży: 420 pkt")


def test_dlaczego_w_widoku_druzyny():
    from api.prezentacja import widok
    g = _gra()
    _runda(g, A=_lokal("centrum_3"), B=_lokal("dworzec_1"))
    assert widok(g, "A")["dlaczego"][0].startswith("Wielkie otwarcie")
    _runda(g)
    assert widok(g, "A")["dlaczego"][0].startswith("Pierwszy tydzień sprzedaży")
    _runda(g)
    assert widok(g, "A")["dlaczego"][0].startswith("Wynik ")


def test_tydzien_w_liczbach_uf23():
    assert tydzien(D, None, None) is None
    dni = [{"dzien": "pn", "sprzedaz": 40, "utracona": 5}, {"dzien": "pt", "sprzedaz": 90, "utracona": 12},
           {"dzien": "nd", "sprzedaz": 0, "utracona": 0}]
    kpir = {**_w()["kpir"], "pozycje": [{"opis": "Czynsz najmu: ul. Lipowa", "pozostale": 280.0},
                                         {"opis": "Wynagrodzenia: kucharz", "wynagrodzenia": 1200.0},
                                         {"opis": "Sprzedaż", "przychod": 3000.0}]}
    w = _w(sprzedaz={"kebab_box": _danie(100, 90, 90), "talerz_kebab": _danie(50, 40, 40)}, kpir=kpir,
           klienci={"dni": dni}, gotowka=9000.0)
    wp = _w(sprzedaz={"kebab_box": _danie(100, 100, 100)}, gotowka=8000.0)
    t = tydzien(D, w, wp)
    liczby = {x["klucz"]: x for x in t["liczby"]}
    assert liczby["klienci"]["wartosc"] == 130 and liczby["klienci"]["poprzednia"] == 100
    assert liczby["utracona"]["lepiej"] == -1 and liczby["utracona"]["wartosc"] == 20
    assert liczby["gotowka"]["poprzednia"] == 8000.0 and liczby["dochod_netto"]["format"] == "zl"
    zdania = " ".join(t["zdania"])
    assert "Najlepszy dzień: piątek – 90 klientów, 12 odeszło" in zdania
    assert "Kebab box – 90 porcji (69% sprzedaży)" in zdania
    assert "Zysk najbardziej zjadły pensje" in zdania and "„Wynagrodzenia”" in zdania and "40 gr" in zdania
    assert all(x["poprzednia"] is None for x in tydzien(D, w, None)["liczby"])   # pierwsza runda – bez strzałek
    dobre = " ".join(wnioski(D, w, wp)["dobre"])
    assert "100 → 130 (+30%)" in dobre


@pytest.mark.dane_gry   # próg rozruchu jest w dane/ (UF5)
def test_rozruch_w_pierwszych_rundach():
    """UF5: wnioski z rund 1–3 mówią, że firma potrzebuje kilku tygodni na rozruch; później – nie."""
    dane = dane_domyslne()
    do = dane.z["wnioski"]["rozruch_do_rundy"]
    assert do == 3
    assert "kilku tygodni" in wnioski(dane, _w(), None, 1)["rozruch"]
    assert wnioski(dane, _w(), None, do)["rozruch"]
    assert wnioski(dane, _w(), None, do + 1)["rozruch"] is None
    assert wnioski(dane, _w())["rozruch"] is None   # bez numeru rundy – bez zdania
