"""Wskazówki ▲▼ przy opcjach wydarzeń: kierunek i siła wynikają z danych opcji i progów z wskazowki.yaml."""

import pytest
from pomocnicze import DANE_GRY

from api.prezentacja import wskazowki_opcji, wskazowki_zdarzen
from silnik.dane import Dane
from silnik.swiat import zdarzenia as zd

pytestmark = pytest.mark.dane_gry


@pytest.fixture(scope="module")
def dane():
    return Dane(DANE_GRY)


def _opcje(dane, historia, scena):
    return {o["id"]: o for o in zd.historie_parkow(dane)[historia]["sceny"][scena]["opcje"]}


def test_sila_wynika_z_danych_przykladu(dane):
    wsk, kp = dane.zdarzenia["wskazowki"], zd.zasady(dane)["koszt_porcji"]
    lawka = _opcje(dane, "pan_zbyszek", "lawka")
    z = {w["klucz"]: w for w in wskazowki_opcji(lawka["pieniadze"], wsk, kp)}   # 50 zł wydane
    assert set(z) == {"kasa"} and z["kasa"]["znak"] == "▼"
    z = {w["klucz"]: w for w in wskazowki_opcji(lawka["kebab"], wsk, kp)}       # 2 h i porcja (9 zł < próg)
    assert set(z) == {"czas"} and z["czas"]["znak"] == "▼"
    assert wskazowki_opcji(lawka["idz_dalej"], wsk, kp) == []
    przepis = _opcje(dane, "pan_zbyszek", "wizyta")["przepis"]                  # popyt ×1,03 przez 3 rundy
    z = {w["klucz"]: w for w in wskazowki_opcji(przepis, wsk, kp)}
    assert z["goscie"]["znak"] == "▲▲" and z["goscie"]["kierunek"] == 1


def test_progi_z_danych_zmieniaja_sile(dane):
    """Ta sama opcja przy innych progach daje inną siłę – kod nie ma własnych liczb."""
    kp = zd.zasady(dane)["koszt_porcji"]
    opcja = {"koszt": {"czas": 0, "gotowka": 50, "porcje": 0}, "skutki": []}
    wsk = {k: dict(v) for k, v in dane.zdarzenia["wskazowki"].items()}
    assert wskazowki_opcji(opcja, wsk, kp)[0]["znak"] == "▼"
    wsk["kasa"]["progi"] = (10, 40)
    assert wskazowki_opcji(opcja, wsk, kp)[0]["znak"] == "▼▼"


def test_widok_ma_wskazowki_i_ciag_przy_kazdej_opcji(dane):
    h = _opcje(dane, "pan_zbyszek", "lawka")
    z = {"koszt_porcji": zd.zasady(dane)["koszt_porcji"], "aktywne": [
        {"historia": "pan_zbyszek", "scena": "lawka", "opcje": [{"id": i} for i in h]}]}
    wskazowki_zdarzen(dane, z)
    assert all("wskazowki" in o and "ciag" in o for o in z["aktywne"][0]["opcje"])
    assert {o["id"]: o["ciag"] for o in z["aktywne"][0]["opcje"]} == {"kebab": True, "pieniadze": False, "idz_dalej": False}
