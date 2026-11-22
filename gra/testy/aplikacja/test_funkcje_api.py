"""Funkcje gry w API (seria „funkcje”): POST /api/gry z polem `funkcje`, v.funkcje w widoku drużyny,
POST /api/gry/<id>/funkcje/<firma> – odsłonięcie przez drużynę (albo mistrza gry)."""

import pytest

pytestmark = [pytest.mark.django_db, pytest.mark.dane_gry]
JSON = "application/json"


def _nowa(client, funkcje) -> str:
    d = {"nazwa": "F", "ziarno": "7", "liczba_rund": 4, "funkcje": funkcje,
         "firmy": [{"nazwa": "Ala", "bot": None}, {"nazwa": "Ola", "bot": None}, {"nazwa": "Bot", "bot": "tani"}]}
    r = client.post("/api/gry", d, content_type=JSON)
    assert r.status_code == 200, r.json()
    return r.json()["id"]


def test_nowa_gra_z_funkcjami_i_widok(client):
    id_ = _nowa(client, "krotka_lekcja")
    f = client.get(f"/api/gry/{id_}/widok/Ala").json()["funkcje"]
    assert f["handel"]["stan"] == "wylaczona" and not f["handel"]["aktywna"]
    assert f["marketing"] | {"stan": "zakryta", "odslonieta": False, "aktywna": False} == f["marketing"]
    assert f["marketing"]["nazwa"] == "Marketing" and f["marketing"]["opis"] and f["marketing"]["od_rundy"]
    assert "kampanie reklamowe" in f["marketing"]["zakrycie"] and f["zaopatrzenie"]["zakrycie"] == ""   # K1
    assert client.get(f"/api/gry/{id_}/widok/Bot").json()["funkcje"]["marketing"]["aktywna"]   # bot – wszystko
    r = client.post("/api/gry", {"firmy": [{"nazwa": "A"}], "funkcje": {"handel": "ukryta"}}, content_type=JSON)
    assert r.status_code == 400 and "ukryta" in r.json()["blad"]


def test_gra_bez_pola_funkcje_ma_wszystko_odkryte(client):
    id_ = _nowa(client, None)
    assert all(x["stan"] == "odkryta" and x["aktywna"] for x in client.get(f"/api/gry/{id_}/widok/Ala").json()["funkcje"].values())


def test_druzyna_odslania_i_zakrywa(client, uczen):
    id_ = _nowa(client, "pierwsza_gra")
    ala = uczen("ala")
    assert client.post(f"/api/gry/{id_}/druzyny/Ala", {"dodaj": "ala"}, content_type=JSON).status_code == 200
    url = f"/api/gry/{id_}/funkcje/Ala"
    r = ala.post(url, {"funkcja": "marketing", "odslonieta": True}, content_type=JSON)
    assert r.status_code == 200 and r.json()["funkcje"]["marketing"]["aktywna"]
    assert not client.get(f"/api/gry/{id_}/widok/Ola").json()["funkcje"]["marketing"]["aktywna"]
    assert ala.post(f"/api/gry/{id_}/funkcje/Ola", {"funkcja": "marketing"}, content_type=JSON).status_code == 403
    r = ala.post(url, {"funkcja": "marketing", "odslonieta": False}, content_type=JSON)
    assert not r.json()["funkcje"]["marketing"]["odslonieta"]
    assert ala.post(url, {"funkcja": "nie_ma"}, content_type=JSON).status_code == 400
    # mistrz gry też może (np. na prośbę drużyny), mimo że ogląda drużynę tylko do odczytu
    assert client.post(url, {"funkcja": "handel"}, content_type=JSON).json()["funkcje"]["handel"]["odslonieta"]
