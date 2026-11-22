"""Wybór dymków: determinizm, warunki, filtry rodzajów, WOS, wujek, przerwy bywalców, plotki, tematy bywalców."""
import copy
from collections import Counter

from silnik.wnetrza import dymki as dy

BOGATE = {"runda": 3, "cena_wzgledem_strefy": 1.3, "cena": 20.0, "cena_strefy": 15.0, "ocena": 4.5, "kolejka": 0.2,
          "brak_dan": 0.0, "zmiana_ceny": 8.0, "nastroj_zespolu": 60.0}


def ctx(runda=3, firma="A", ziarno=1, okazje=(), park=(), kalendarz=(), konkurencja=()):
    return {"runda": runda, "firma": firma, "ziarno": ziarno, "okazje": list(okazje), "park": list(park),
            "kalendarz": list(kalendarz), "konkurencja": list(konkurencja)}


def teksty(dane, wsk=BOGATE, historia=None, wlaczone=None, **kw):
    return [x["tekst"] for x in dy.dymki_rundy(dane, wsk, ctx(**kw), wlaczone, historia or {})]


def test_determinizm(dane_w):
    a = dy.wylosowane(dane_w, BOGATE, ctx(), {})
    assert a == dy.wylosowane(dane_w, BOGATE, ctx(), {})
    assert a and all({"rodzaj", "kto", "imie", "tekst"} <= set(x) for x in a)
    inne = {tuple(x["tekst"] for x in dy.wylosowane(dane_w, BOGATE, ctx(ziarno=z), {})) for z in range(30)}
    assert len(inne) > 5
    assert dy.wylosowane(dane_w, BOGATE, ctx(firma="A"), {}) != dy.wylosowane(dane_w, BOGATE, ctx(firma="B", ziarno=2), {})


def test_liczba_dymkow_z_zasad(dane_w):
    for z in range(40):
        assert len(dy.wylosowane(dane_w, BOGATE, ctx(ziarno=z), {})) == 3


def test_warunki_gdy_i_brak_wskaznika(dane_w):
    # tylko numer rundy: nie ma warunków spełnionych dla dymków ze wskaźnikami
    bez = Counter(t for z in range(80) for t in teksty(dane_w, {"runda": 3}, ziarno=z))
    assert set(bez) <= {"GOSC-ZAWSZE", "WOS-OK-1", "WOS-OK-2"} and bez["GOSC-ZAWSZE"]
    wszystkie = Counter(t.split(" ")[0] for z in range(120) for t in teksty(dane_w, ziarno=z))
    assert {"RZ-DROGO", "RZ-OCENA", "DU-KOLEJKA", "GOSC-DROZEJE", "GOSC-ZAWSZE"} <= set(wszystkie)
    assert "KAZDY-ZIMNE" not in wszystkie   # ocena 4,5 – nie „do 3”
    zimne = Counter(t for z in range(120) for t in teksty(dane_w, {**BOGATE, "ocena": 2.0}, ziarno=z))
    assert zimne["KAZDY-ZIMNE"] and not zimne["RZ-OCENA 4,5"]


def test_granice_zakresu_od_wlacznie_do_wylacznie(dane_w):
    wsk = {"runda": 3, "ocena": 3.0}
    t = Counter(x for z in range(120) for x in teksty(dane_w, wsk, ziarno=z))
    assert not t["KAZDY-ZIMNE"]   # „do 3.0” – wyłącznie
    wsk = {"runda": 3, "ocena": 4.0}
    assert any("RZ-OCENA" in x for z in range(120) for x in teksty(dane_w, wsk, ziarno=z))   # „od 4.0” – włącznie


def test_pola_tekstu_sa_wstawiane(dane_w):
    t = {x for z in range(150) for x in teksty(dane_w, ziarno=z)}
    assert "RZ-DROGO 20,00 zł, strefa 15,00 zł" in t and "RZ-OCENA 4,5" in t and "GOSC-DROZEJE o 8%" in t
    ujemna = {x for z in range(150) for x in teksty(dane_w, {**BOGATE, "zmiana_ceny": -12.4}, ziarno=z)}
    assert not any("DROZEJE" in x for x in ujemna)


def test_zaczepki_wos_tylko_sprawdzone_i_nie_wiecej_niz_limit(dane_w):
    wszystkie = [x for z in range(150) for x in dy.wylosowane(dane_w, BOGATE, ctx(ziarno=z), {})]
    wos = [x for x in wszystkie if x["rodzaj"] == "wos"]
    assert wos and all(x["tekst"] != "WOS-NIE" for x in wos)
    assert all(x["wyjasnienie"] == "w" and x["zrodlo_prawne"] == "z" for x in wos)
    for z in range(150):
        assert sum(x["rodzaj"] == "wos" for x in dy.wylosowane(dane_w, BOGATE, ctx(ziarno=z), {})) <= 1


def test_niezatwierdzony_wos_nie_wychodzi_nigdy(dane_w):
    d = copy.copy(dane_w)
    d.wnetrza = copy.deepcopy(dane_w.wnetrza)
    for x in d.wnetrza["dymki"]["dymki"]:
        x["sprawdzone"] = False if x["rodzaj"] == "wos" else x["sprawdzone"]
    assert not any(x["rodzaj"] == "wos" for z in range(100) for x in dy.wylosowane(d, BOGATE, ctx(ziarno=z), {}))


def test_filtry_rodzajow(dane_w):
    for z in range(60):
        wszystkie = dy.dymki_rundy(dane_w, BOGATE, ctx(ziarno=z), None, {})
        assert wszystkie == dy.dymki_rundy(dane_w, BOGATE, ctx(ziarno=z), {"cena_smak", "plotki", "propozycje", "wos"}, {})
        tylko_cena = dy.dymki_rundy(dane_w, BOGATE, ctx(ziarno=z), {"cena_smak"}, {})
        assert {x["rodzaj"] for x in tylko_cena} <= {"cena_smak"}
        assert tylko_cena == [x for x in wszystkie if x["rodzaj"] == "cena_smak"]   # filtr nie zmienia losowania
        assert dy.dymki_rundy(dane_w, BOGATE, ctx(ziarno=z), set(), {}) == []


def test_wujek_tylko_przy_okazji_i_poza_filtrami(dane_w):
    assert not any(x["kto"] == "wujek" for z in range(50) for x in dy.wylosowane(dane_w, BOGATE, ctx(ziarno=z), {}))
    for okazja, tekst in {"start": "WUJ-START", "pierwsza_strata": "WUJ-STRATA", "rekord": "WUJ-REKORD",
                          "ostatnia_runda": "WUJ-KONIEC"}.items():
        d = dy.dymki_rundy(dane_w, BOGATE, ctx(okazje=[okazja]), set(), {})
        assert [(x["kto"], x["tekst"], x["rodzaj"]) for x in d] == [("wujek", tekst, "cena_smak")]
        pelne = dy.wylosowane(dane_w, BOGATE, ctx(okazje=[okazja]), {})
        assert pelne[0]["tekst"] == tekst and len(pelne) == 4   # wujek nie zmniejsza liczby dymków
    d = dy.wylosowane(dane_w, BOGATE, ctx(okazje=["start", "rekord", "pierwsza_strata"]), {})
    assert [x["tekst"] for x in d if x["kto"] == "wujek"] == ["WUJ-STRATA"]   # jedna okazja naraz


def test_wujek_nie_podlega_przerwom_bywalcow(dane_w):
    d = dy.wylosowane(dane_w, BOGATE, ctx(okazje=["rekord"]), {"wujek": 2})
    assert d[0]["kto"] == "wujek"


def test_przerwy_bywalcow(dane_w):
    # rzecki był w poprzedniej rundzie: przerwa 2 rundy – teraz nie mówi
    assert not any(x["kto"] == "rzecki" for z in range(80)
                   for x in dy.wylosowane(dane_w, BOGATE, ctx(ziarno=z), {"rzecki": 2}))
    assert any(x["kto"] == "rzecki" for z in range(80)
               for x in dy.wylosowane(dane_w, BOGATE, ctx(ziarno=z), {"rzecki": 1}))
    assert any(x["kto"] == "rzecki" for z in range(80) for x in dy.wylosowane(dane_w, BOGATE, ctx(ziarno=z), {}))


def test_bywalec_najwyzej_raz_na_runde_i_od_swojej_rundy(dane_w):
    for z in range(120):
        bywalcy = [x["kto"] for x in dy.wylosowane(dane_w, BOGATE, ctx(ziarno=z), {}) if x["kto"] != "gosc"]
        assert len(bywalcy) == len(set(bywalcy))
    wczesnie = [x["kto"] for z in range(120) for x in dy.wylosowane(dane_w, BOGATE, ctx(runda=2, ziarno=z), {})]
    assert "dulska" not in wczesnie and "rzecki" in wczesnie        # dulska od rundy 3
    pozniej = [x["kto"] for z in range(120) for x in dy.wylosowane(dane_w, BOGATE, ctx(runda=3, ziarno=z), {})]
    assert "dulska" in pozniej


def test_dymek_kazdy_mowi_bywalec_albo_gosc(dane_w):
    wsk = {"runda": 3, "ocena": 2.0}
    kto = {x["kto"] for z in range(200) for x in dy.wylosowane(dane_w, wsk, ctx(ziarno=z), {})
           if x["tekst"] == "KAZDY-ZIMNE"}
    assert kto == {"gosc", "rzecki", "dulska"}
    gosc = next(x for z in range(200) for x in dy.wylosowane(dane_w, wsk, ctx(ziarno=z), {}) if x["kto"] == "gosc")
    assert gosc["imie"] == "Gość"
    d = copy.copy(dane_w)
    d.wnetrza = copy.deepcopy(dane_w.wnetrza)
    d.wnetrza["dymki"]["zasady"]["udzial_bywalcow"] = 0
    assert {x["kto"] for z in range(100) for x in dy.wylosowane(d, wsk, ctx(ziarno=z), {})
            if x["tekst"] == "KAZDY-ZIMNE"} == {"gosc"}


def test_plotki_potrzebuja_danych_z_miasta(dane_w):
    bez = {x for z in range(100) for x in teksty(dane_w, ziarno=z)}
    assert not any(x.startswith(("PARK", "KONK", "KAL")) for x in bez)
    k = {"park": [{"park": "Ogród Saski", "tytul": "Pan Zbyszek"}], "kalendarz": [{"wydarzenie": "Juwenalia"}],
         "konkurencja": [{"konkurent": "Kebab Max", "dzielnica": "Bronowice"}]}
    z_danymi = {x["tekst"] for z in range(150)
                for x in dy.dymki_rundy(dane_w, BOGATE, {**ctx(ziarno=z), **k}, None, {})}
    assert {"PARK Ogród Saski: Pan Zbyszek", "KONK Kebab Max na Bronowice", "KAL Juwenalia"} <= z_danymi
    tylko_park = {x["tekst"] for z in range(150)
                  for x in dy.wylosowane(dane_w, BOGATE, {**ctx(ziarno=z), "park": k["park"]}, {})}
    assert "PARK Ogród Saski: Pan Zbyszek" in tylko_park and not any(x.startswith(("KONK", "KAL")) for x in tylko_park)


def test_plotka_o_parku_w_tej_samej_rundzie_co_zdarzenie(dane_w):
    park = [{"park": "Ogród Saski", "tytul": "Pan Zbyszek"}]
    for z in range(60):
        t = teksty(dane_w, ziarno=z, park=park)
        assert "PARK Ogród Saski: Pan Zbyszek" in t   # zawsze, nie tylko przy szczęśliwym losowaniu
    assert not any(x.startswith("PARK") for z in range(60) for x in teksty(dane_w, ziarno=z))   # bez zdarzenia – brak plotki
    # wyłączone plotki (ustawienie mistrza gry) nie wymuszają niczego
    assert not any(x.startswith("PARK") for z in range(20)
                   for x in teksty(dane_w, ziarno=z, park=park, wlaczone={"cena_smak", "wos"}))


def test_bywalcy_czesciej_mowia_o_swoich_tematach(dane_w):
    # rzecki dba o cenę, nie o ocenę: oba jego dymki spełnione, ale cena wypada ok. 3 razy częściej
    wsk = {"runda": 3, "cena_wzgledem_strefy": 1.3, "cena": 20.0, "cena_strefy": 15.0, "ocena": 4.5}
    t = Counter(x["tekst"].split(" ")[0] for z in range(1500)
                for x in dy.wylosowane(dane_w, wsk, ctx(ziarno=z), {}))
    assert t["RZ-DROGO"] > 1.5 * t["RZ-OCENA"] > 0


def test_historia_bywalcow_z_wylosowanych_rund():
    w = [(1, [{"kto": "rzecki"}, {"kto": "gosc"}, {"kto": "wujek"}]), (2, [{"kto": "dulska"}]), (3, [{"kto": "rzecki"}])]
    assert dy.historia_bywalcow(w) == {"rzecki": 3, "dulska": 2}
    assert dy.historia_bywalcow([]) == {}


def test_gra_bez_wnetrz_nie_ma_dymkow(dane_w):
    d = copy.copy(dane_w)
    d.wnetrza = None
    assert dy.wylosowane(d, BOGATE, ctx(), {}) == []
