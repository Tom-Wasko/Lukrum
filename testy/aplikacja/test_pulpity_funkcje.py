"""Funkcje gry na pulpitach (seria „funkcje”): kreator mistrza gry (dane do kroku 3, POST z funkcjami),
GET /api/pulpit (uczeń, mistrz gry, gra bez funkcji) i panel prowadzenia gry (/api/gry/<id>/mg)."""

import pytest

pytestmark = [pytest.mark.django_db, pytest.mark.dane_gry]
JSON = "application/json"


def _nowa(client, funkcje, nazwa="F") -> str:
    d = {"nazwa": nazwa, "ziarno": "7", "liczba_rund": 4, "firmy": [
        {"nazwa": "Ala", "bot": None}, {"nazwa": "Ola", "bot": None}, {"nazwa": "Bot", "bot": "tani"}]}
    if funkcje is not None:
        d["funkcje"] = funkcje
    r = client.post("/api/gry", d, content_type=JSON)
    assert r.status_code == 200, r.json()
    return r.json()["id"]


def _karta(client, id_) -> dict:
    return next(g for g in client.get("/api/pulpit").json()["gry"] if g["id"] == id_)


def test_kreator_dostaje_funkcje_i_zestawy_z_yaml(client):
    html = client.get("/mg/").content.decode()
    assert 'id="ustawienia"' in html and "krotka_lekcja" in html and "Marketing" in html


def test_kreator_wysyla_pelna_liste_stanow(client):
    """Tak jak pulpit.js: pełna lista {klucz: stan} (po kliknięciu zestawu i zmianie jednej funkcji)."""
    from silnik.dane import dane_domyslne
    from silnik.funkcje import rejestr, stany_zestawu

    stany = stany_zestawu(dane_domyslne(), "krotka_lekcja") | {"marketing": "odkryta"}
    assert set(stany) == set(rejestr(dane_domyslne()))
    id_ = _nowa(client, stany)
    f = client.get(f"/api/gry/{id_}/widok/Ala").json()["funkcje"]
    assert f["marketing"]["stan"] == "odkryta" and f["handel"]["stan"] == "wylaczona" and f["analiza"]["stan"] == "zakryta"


def test_pulpit_ucznia_z_funkcjami(client, uczen):
    id_ = _nowa(client, "krotka_lekcja")
    ala = uczen("ala")
    assert client.post(f"/api/gry/{id_}/druzyny/Ala", {"dodaj": "ala"}, content_type=JSON).status_code == 200
    f = {x["klucz"]: x for x in _karta(ala, id_)["funkcje"]}
    assert f["handel"]["stan"] == "wylaczona" and f["marketing"]["stan"] == "zakryta" and not f["marketing"]["odslonieta"]
    assert f["marketing"]["nazwa"] == "Marketing" and f["marketing"]["krotko"] and f["marketing"]["ikona"]
    assert ala.post(f"/api/gry/{id_}/funkcje/Ala", {"funkcja": "marketing", "odslonieta": True}, content_type=JSON).status_code == 200
    f = {x["klucz"]: x for x in _karta(ala, id_)["funkcje"]}
    assert f["marketing"]["odslonieta"] and not f["analiza"]["odslonieta"]


def test_pulpit_mistrza_gry_stany_i_odslonienia(client):
    id_ = _nowa(client, "krotka_lekcja")
    assert client.post(f"/api/gry/{id_}/funkcje/Ala", {"funkcja": "marketing", "odslonieta": True}, content_type=JSON).status_code == 200
    fn = _karta(client, id_)["funkcje"]
    assert fn["liczby"] == {"odkryta": 0, "zakryta": 8, "wylaczona": 4}
    assert {d["firma"]: d["odsloniete"] for d in fn["druzyny"]} == {"Ala": ["marketing"], "Ola": []}   # bez botów
    assert next(f for f in fn["lista"] if f["klucz"] == "marketing")["zakryta"]
    # panel prowadzenia gry dostaje to samo
    assert client.get(f"/api/gry/{id_}/mg").json()["funkcje"] == fn


def test_gra_bez_funkcji_ma_none(client, uczen):
    id_ = _nowa(client, None)
    assert _karta(client, id_)["funkcje"] is None
    assert client.get(f"/api/gry/{id_}/mg").json()["funkcje"] is None
    ala = uczen("ala")
    client.post(f"/api/gry/{id_}/druzyny/Ala", {"dodaj": "ala"}, content_type=JSON)
    assert _karta(ala, id_)["funkcje"] is None
