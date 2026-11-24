"""Zamrożona kopia danych dla testów mechanik: testy bez znacznika czytają `testy/dane_zamrozone/`,
testy zasad ze znacznikiem `dane_gry` – `dane/` (testy/conftest.py)."""

from pathlib import Path

import pytest
from pomocnicze import DANE_GRY, DANE_ZAMROZONE

from silnik.dane import dane_domyslne, sprawdz


def test_testy_mechanik_czytaja_zamrozona_kopie():
    assert dane_domyslne().katalog == DANE_ZAMROZONE


@pytest.mark.dane_gry
def test_testy_zasad_czytaja_dane_gry():
    assert dane_domyslne().katalog == DANE_GRY


def test_zamrozona_kopia_pasuje_do_schematow():
    # nowy klucz w schemacie danych – dopisać go też w kopii (bez zmiany jej liczb)
    assert sprawdz(DANE_ZAMROZONE) == []


def test_zamrozona_kopia_ma_wszystkie_pliki_danych():
    # mapa/klienci.yaml – plik opcjonalny: bez niego grupy klientów i opinie są wyłączone, testy mechanik
    # liczą popyt jak przed wprowadzeniem grup klientów; zdarzenia/falafel.yaml – bez niego nie ma bójki o falafel;
    # mapa/miasto.yaml (M11) – tylko wygląd mapy, silnik go nie czyta; funkcje.yaml (seria „funkcje”) – bez niego
    # wszystkie funkcje odkryte, jak w grach sprzed serii; wnetrza/ (silnik/wnetrza/) – bez folderu gra bez wnętrz,
    # a testy wnętrz mają własne dane (testy/wnetrza/dane_testowe/); mapa/dekor.yaml – bez niego nie ma dekoru lokalu
    # (wymaga też mapa/klienci.yaml), testy dekoru czytają dane gry; zeszyt.yaml – treść zeszytu wujka (api/zeszyt.py), opcjonalna
    # radio.yaml – radio „Fala Koziołka” (panel_gracza/radio.py), silnik go nie czyta
    pliki = {p.relative_to(DANE_GRY) for p in DANE_GRY.rglob("*.yaml")
             if "wnetrza" not in p.relative_to(DANE_GRY).parts} - {Path("mapa/klienci.yaml"),
                                                                           Path("zdarzenia/falafel.yaml"),
                                                                           Path("mapa/miasto.yaml"),
                                                                           Path("funkcje.yaml"),
                                                                           Path("mapa/dekor.yaml"),
                                                                           Path("zeszyt.yaml"),
                                                                           Path("radio.yaml"), Path("zrodla.yaml"),
                                                                           Path("dzwieki.yaml"),
                                                                           Path("zdarzenia/wskazowki.yaml")}   # wskazówki ▲▼: opcjonalny
    assert pliki <= {p.relative_to(DANE_ZAMROZONE) for p in DANE_ZAMROZONE.rglob("*.yaml")}


def test_wyglad_mapy_miasta_m11():
    """M11: miasto.yaml (drogi, rzeki, układ dzielnic) trafia do katalogu mapy dla panelu, bez opisu; punkt
    orientacyjny bez wymiarów zajmuje jedno pole. Bez pliku (kopia zamrożona) – mapa bez wyglądu miasta."""
    from silnik.dane import Dane
    miasto = Dane(DANE_GRY).mapa["miasto"]
    assert {"drogi", "miejsca", "uklad"} <= set(miasto) and "opis" not in miasto
    assert all(m["mapa"]["szer"] >= 1 and m["mapa"]["gl"] >= 1 for m in miasto["miejsca"])
    assert all(i in {b["id"] for b in Dane(DANE_GRY).mapa["budynki"]} | {lo["id"] for lo in Dane(DANE_GRY).mapa["lokale"]}
               for i in miasto["uklad"]["pola"])
    assert Dane(DANE_ZAMROZONE).mapa["miasto"] is None
