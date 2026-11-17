"""Dane gry w `dane/*.yaml`: schematy, odwołania między plikami, `python -m silnik.dane sprawdz`
i brak liczb gry w kodzie silnika."""

import ast
from pathlib import Path

import pytest
from pomocnicze import _kopia, _zmien

from silnik import dane as modul_danych
from silnik.dane import Dane, sprawdz

pytestmark = pytest.mark.dane_gry

SILNIK = Path(modul_danych.__file__).parent

# Liczby, które mogą być w kodzie silnika, bo opisują budowę modelu, a nie grę: indeksy i kroki, jakość
# 1–3, procent, 12 miesięcy w roku, grosze, dokładność zaokrągleń i porównań, limity pętli numerycznych.
DOZWOLONE_LICZBY = {0, 1, 2, 3, 4, 9, 10, 12, 50, 60, 100, 0.005, 0.01, 1e-9, 1e-7, 1e-6, 1e6,
                    6, 7, 52}  # kalendarz: dni tygodnia, tygodnie w roku


def test_dane_gry_sa_poprawne():
    assert sprawdz() == []


def test_kazdy_plik_ma_opis_i_zrodlo():
    d = Dane()
    assert set(d.pliki) >= {"uslugi.yaml", "katalog.yaml", "zalozenia.yaml", "boty.yaml"}
    for nazwa, tresc in d.pliki.items():
        assert tresc.get("opis"), nazwa
        # katalog i założenia mają źródło przy każdej sekcji / parametrze
        if nazwa not in ("katalog.yaml", "zalozenia.yaml"):
            assert tresc.get("zrodlo"), nazwa
    for sekcja, v in d.katalog_ofert.items():
        if isinstance(v, dict):
            assert v.get("zrodlo"), sekcja


@pytest.mark.parametrize(
    ("plik", "zmiana", "oczekiwany"),
    [
        ("uslugi.yaml", lambda d: d.pop("zrodlo"), "uslugi.yaml: zrodlo"),
        ("sprzet.yaml", lambda d: d["sprzet"]["Rożen"].update(kolor="czerwony"), "kolor"),
        ("uslugi.yaml", lambda d: d["uslugi"]["falafel"]["sprzet"].append("Kasa fiskalna"), "Kasa fiskalna"),
        ("uslugi.yaml", lambda d: d["uslugi"]["falafel"]["zasoby"].update({"Lawasz": 1}), "Lawasz"),
        ("katalog.yaml", lambda d: d["szkolenia"].pop("zrodlo"), "katalog.yaml: szkolenia.zrodlo"),
        ("kandydaci.yaml", lambda d: d["losowanie"]["gwiazdki"].update({"3": 0.5}), "sumować"),
        (
            "boty.yaml",
            lambda d: d["strategie"]["tani"]["dania_specjalne"].append("Gazeta X"),
            "Gazeta X",
        ),
        (
            "zalozenia.yaml",
            lambda d: d["finanse"]["zus_pracodawcy"].update(pewnosc="chyba"),
            "finanse.zus_pracodawcy",
        ),
        ("zalozenia.yaml", lambda d: d["finanse"]["zus_pracodawcy"].pop("zrodlo"), "zus_pracodawcy"),
    ],
)
def test_sprawdz_wykrywa_bledy(tmp_path, plik, zmiana, oczekiwany):
    kat = _kopia(tmp_path)
    _zmien(kat, plik, zmiana)
    bledy = sprawdz(kat)
    assert any(oczekiwany in b for b in bledy), bledy


def test_brak_pliku_i_komenda(tmp_path, capsys):
    assert modul_danych.main(["sprawdz"]) == 0
    assert "Dane w porządku" in capsys.readouterr().out
    kat = _kopia(tmp_path)
    (kat / "boty.yaml").unlink()
    assert sprawdz(kat) == ["brak pliku dane/boty.yaml"]
    assert modul_danych.main(["sprawdz", str(kat)]) == 1
    assert modul_danych.main([]) == 2


def test_wersja_zalezy_od_danych(tmp_path):
    kat = _kopia(tmp_path)
    przed = Dane(kat).wersja
    assert przed == Dane().wersja
    _zmien(kat, "boty.yaml", lambda d: d["ustawienia"].update(bufor_gotowki=1))
    assert Dane(kat).wersja != przed


def test_w_kodzie_silnika_nie_ma_liczb_gry():
    """Parametry gry są w `dane/*.yaml` – w kodzie silnika zostają tylko liczby budowy modelu."""
    obce = []
    for plik in sorted(SILNIK.rglob("*.py")):
        for wezel in ast.walk(ast.parse(plik.read_text(encoding="utf-8"))):
            if isinstance(wezel, ast.Constant) and type(wezel.value) in (int, float):
                if wezel.value not in DOZWOLONE_LICZBY:
                    obce.append(f"{plik.name}:{wezel.lineno}: {wezel.value}")
    assert obce == []


def test_nowe_udogodnienia_nie_zmieniaja_wyboru_botow_uf9():
    """Nowe udogodnienia (z opisem, rundy 5–14) mają gorszą cenę za punkt niż klimatyzacja, a przed rundą 9
    (zanim boty skompletują swoje 2–3 sztuki) są drogie – boty (silnik/boty.py: cena/procent) wybierają jak dotąd."""
    from silnik.dane import dane_domyslne
    poz = dane_domyslne().katalog_ofert["udogodnienia"]["pozycje"]
    nowe = [p for p in poz if p.get("opis")]
    assert len(nowe) >= 10 and any("Kot" in p["nazwa"] for p in nowe)
    for p in nowe:
        assert 5 <= p["od_rundy"] <= 14, p["nazwa"]
        assert p["cena"] / p["procent"] > 37.5, p["nazwa"]
        assert p["od_rundy"] >= 9 or p["cena"] >= 1500, p["nazwa"]


def test_kazdy_lokal_ma_polozenie_w_lublinie():
    """Nowa mapa rysuje lokal w miejscu z pola geo (lokale.yaml), a nie z siatki – bez geo lokalu nie widać."""
    for lok in Dane().mapa["lokale"]:
        geo = lok.get("geo")
        assert geo, lok["id"]
        assert 51.10 < geo["lat"] < 51.35 and 22.40 < geo["lon"] < 22.75, lok["id"]


def test_budynek_w_zespole_wskazuje_istniejacy_zespol(tmp_path):
    """Kamienica bankowa (sześć banków) i biurowiec przy Zana (biura rachunkowe i trzy firmy od reklamy): zespół musi być na liście zespoly.
    Ubezpieczyciel i parkiet maklerski są osobnymi budynkami (zmiana strony [mapa] 15.11)."""
    d = Dane()
    zespoly = {z["id"] for z in d.mapa["zespoly"]}
    assert zespoly == {"kamienica_bankowa", "biurowiec_zana"}
    w_zespole = {b["id"]: b["zespol"] for b in d.mapa["budynki"] if b.get("zespol")}
    assert {b for b, z in w_zespole.items() if z == "kamienica_bankowa"} == {f"bank_{i}" for i in range(1, 7)}
    assert {b for b, z in w_zespole.items() if z == "biurowiec_zana"} == {"biura", "agencja_lajk", "fala_koziolka", "kozi_grod_events"}
    osobne = {b["id"]: b for b in d.mapa["budynki"] if b["id"] in ("ubezpieczyciel", "gielda")}
    assert len(osobne) == 2 and all(b.get("geo") and b.get("adres") for b in osobne.values())
    kat = _kopia(tmp_path)
    _zmien(kat, "mapa/budynki.yaml", lambda p: p["budynki"][0].update(zespol="nie_ma"))
    assert any("nie_ma" in b and "zespoly" in b for b in sprawdz(kat))
