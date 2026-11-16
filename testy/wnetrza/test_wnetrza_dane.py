"""Walidacja plików `dane/wnetrza/` (schematy, odwołania między plikami) i ładowanie do `Dane`."""
import shutil

import pytest
from pomocnicze import DANE_GRY, DANE_ZAMROZONE

from silnik.dane import Dane, sprawdz
from silnik.wnetrza.schematy import sprawdz as sprawdz_wnetrza


def _bledy(pliki):
    return sprawdz_wnetrza(*pliki)


def test_dane_testowe_sa_poprawne(pliki):
    assert _bledy(pliki) == []


@pytest.mark.dane_gry
def test_prawdziwe_dane_wnetrz_sa_poprawne():
    assert sprawdz(DANE_GRY) == []
    d = Dane(DANE_GRY)
    assert d.wnetrza and len(d.wnetrza["bywalcy"]["bywalcy"]) >= 7 and d.wnetrza["dymki"]["dymki"]


def test_brak_folderu_wnetrza_to_gra_bez_wnetrz():
    assert Dane(DANE_ZAMROZONE).wnetrza is None
    assert sprawdz(DANE_ZAMROZONE) == []


def test_folder_wnetrza_laduje_sie_do_danych(dane_w, kat_wnetrza):
    assert [b["id"] for b in dane_w.wnetrza["bywalcy"]["bywalcy"]] == ["rzecki", "dulska", "wujek"]
    assert sprawdz(kat_wnetrza) == []


def test_brak_pliku_we_wnetrzach(kat_wnetrza, tmp_path):
    kat = tmp_path / "dane"
    shutil.copytree(kat_wnetrza, kat)
    (kat / "wnetrza" / "silnik.yaml").unlink()
    assert "brak pliku dane/wnetrza/silnik.yaml" in sprawdz(kat)


def _psuj(pliki, plik, zmiana):
    zmiana(pliki[plik])
    return "\n".join(_bledy(pliki))


@pytest.mark.parametrize(("plik", "zmiana", "oczekiwany"), [
    (1, lambda d: d["dymki"][0].update(kto="nikt"), "kto „nikt”"),
    (1, lambda d: d["propozycje"][0].update(kto="nikt"), "kto „nikt”"),
    (1, lambda d: d["dymki"][0]["gdy"].update(glod={"od": 1}), "nieznany wskaźnik „glod”"),
    (1, lambda d: d["propozycje"][3]["gdy"].update(glod={"od": 1}), "nieznany wskaźnik „glod”"),
    (1, lambda d: d["dymki"][6].update(zrodlo="gazeta"), "zrodlo"),
    (1, lambda d: d["dymki"][3].update(zrodlo="park"), "`zrodlo` mają tylko plotki"),
    (1, lambda d: d["dymki"][12].update(okazja="urodziny"), "okazja"),
    (1, lambda d: d["dymki"][12].update(kto="gosc"), "`okazja` ma tylko wujek"),
    (1, lambda d: d["dymki"][3].update(okazja="start"), "`okazja` ma tylko wujek"),
    (1, lambda d: d["dymki"][12].pop("okazja"), "wujek mówi tylko przy swojej `okazji`"),
    (1, lambda d: d["dymki"].__delitem__(15), "wujek nie ma dymku na okazję „ostatnia_runda”"),
    (1, lambda d: d["dymki"][0].update(tekst="Cena {cena} {nie_ma}"), "nieznane pola w tekście: nie_ma"),
    (1, lambda d: d["dymki"][3].update(tekst="W parku {park}"), "nieznane pola w tekście: park"),
    (1, lambda d: d["dymki"][9].pop("zrodlo_prawne"), "wymaga `wyjasnienie`, `zrodlo_prawne` i `sprawdzone`"),
    (1, lambda d: d["dymki"][9].pop("sprawdzone"), "wymaga `wyjasnienie`"),
    (1, lambda d: d["dymki"][3].update(sprawdzone=True), "mają tylko zaczepki WOS"),
    (1, lambda d: d["dymki"][0].update(rodzaj="kawa"), "nieznany rodzaj „kawa”"),
    (1, lambda d: d["dymki"][0]["gdy"]["cena_wzgledem_strefy"].update(do=0.5), "`od` musi być mniejsze niż `do`"),
    (1, lambda d: d["propozycje"][0]["odpowiedzi"][1].update(id="tak"), "powtórzone id odpowiedzi tak"),
    (1, lambda d: d["propozycje"][0]["odpowiedzi"][1].update(id="rezygnacja"), "brak odpowiedzi „odmowa”"),
    (1, lambda d: d["propozycje"][0]["odpowiedzi"].pop(), "at least 2 items"),
    (1, lambda d: d["propozycje"][0]["odpowiedzi"][0]["skutki"].update(premia=5), "premia"),
    (1, lambda d: d["propozycje"][1]["odpowiedzi"][0].pop("skutki_porazka"), "`szansa` i `skutki_porazka` idą parą"),
    (1, lambda d: d["propozycje"][0]["odpowiedzi"][0].update(szansa=1.5), "szansa"),
    (1, lambda d: d["propozycje"][2].update(id="pierwsza"), "powtórzone id pierwsza"),
    (1, lambda d: d["zasady"].update(dymkow_na_runde=[5, 2]), "najmniej ≤ najwięcej"),
    (0, lambda d: d["bywalcy"][1].update(id="rzecki"), "powtórzone id rzecki"),
    (0, lambda d: d["bywalcy"][0].update(id="gosc"), "zarezerwowane"),
    (0, lambda d: d["bywalcy"][0].update(dba_o=["glod"]), "nieznany wskaźnik „glod”"),
    (2, lambda d: d["nastroj"].update(zadowolenie_zero=2), "zadowolenie_zero musi być mniejsze"),
])
def test_bledy_danych(pliki, plik, zmiana, oczekiwany):
    assert oczekiwany in _psuj(pliki, plik, zmiana)


def test_pola_dodatkowe_dymkow_sa_opcjonalne(pliki):
    d = pliki[1]["dymki"]
    d[9].update(sprawdzil="Claude 14.11: źródło")
    d[0].update(cytat=True, cytat_zrodlo="Lalka")
    d[1].update(cytat=False)
    assert _bledy(pliki) == []


def test_nieznane_pole_w_pliku_jest_bledem(pliki):
    assert "dymki.0.kolor" in _psuj(pliki, 1, lambda d: d["dymki"][0].update(kolor="red"))


@pytest.mark.dane_gry
def test_kazda_odpowiedz_ma_wskazowke_bez_liczb():
    """Gracz przed wyborem widzi kierunek skutków, ale bez liczb, procentów i szansy powodzenia."""
    for p in Dane(DANE_GRY).wnetrza["dymki"]["propozycje"]:
        for o in p["odpowiedzi"]:
            w = o.get("wskazowka") or ""
            assert w.strip(), f"{p['id']}/{o['id']}: brak wskazówki"
            assert not any(c.isdigit() for c in w) and "%" not in w, f"{p['id']}/{o['id']}: liczby we wskazówce"


def test_schemat_odrzuca_wskazowke_z_liczba():
    from silnik.wnetrza.schematy import Odpowiedz
    ok = {"id": "x", "tekst": "T", "reakcja": "R", "skutki": {}}
    assert Odpowiedz(**ok, wskazowka="Więcej gości, mniej zysku").wskazowka
    for zla in ("Zysk spada o 15%", "120 porcji więcej", "Szansa połowa 50"):
        with pytest.raises(ValueError):
            Odpowiedz(**ok, wskazowka=zla)
    with pytest.raises(ValueError):
        Odpowiedz(**ok)
