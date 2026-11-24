"""Dźwięki gry (podróż 04, wątek dzwieki): dane/dzwieki.yaml, /dzwieki.json, spis licencji i wyciszenie przez MG.

Pilnuje zasad szefa: każdy gotowy plik ma autora, źródło i licencję CC0 albo domena publiczna, każde miejsce
z budynki.yaml ma odgłos albo „cisza”, brak pliku to cisza (pusty spis), a prowadzący może wyciszyć klasę.
"""
from pathlib import Path

import pytest
import yaml

from panel_gracza import dzwieki as dz

GRA = Path(__file__).resolve().parents[2]
DANE = yaml.safe_load((GRA / "dane" / "dzwieki.yaml").read_text(encoding="utf-8"))
BUDYNKI = yaml.safe_load((GRA / "dane" / "mapa" / "budynki.yaml").read_text(encoding="utf-8"))
KATALOG = GRA / "panel_gracza" / "static" / "dzwieki"
JS = (GRA / "panel_gracza" / "static" / "pulpit" / "dzwiek.js").read_text(encoding="utf-8")


def test_pliki_gotowe_maja_zrodlo_autora_i_licencje():
    for nazwa, p in DANE["pliki"].items():
        assert p["rodzaj"] in ("krotki", "tlo"), nazwa
        assert p["status"] in ("gotowe", "oczekuje"), nazwa
        if p["status"] == "gotowe":
            assert p["zrodlo"].startswith("http"), nazwa
            assert p["autor"].strip(), nazwa
            assert p["licencja"] in dz.LICENCJE, nazwa
            assert (KATALOG / p["plik"]).is_file(), nazwa


def test_w_paczce_nie_ma_plikow_spoza_spisu():
    spis = {p["plik"] for p in DANE["pliki"].values()}
    obce = [f.name for f in KATALOG.glob("*") if f.is_file() and f.name not in spis and f.name != ".gitkeep"]
    assert not obce, f"pliki bez wpisu w dzwieki.yaml: {obce}"


def test_kazde_miejsce_ma_odglos_albo_cisze():
    odglosy = {k for k, p in DANE["pliki"].items() if p["rodzaj"] == "tlo"} | {dz.CISZA}
    for b in BUDYNKI["budynki"]:
        klucz = b["id"] if b["id"] in DANE["miejsca"] else b["rodzaj"]
        assert klucz in DANE["miejsca"], f"{b['id']} ({b['rodzaj']}) bez odgłosu w dzwieki.yaml"
        assert DANE["miejsca"][klucz] in odglosy, b["id"]
    for z in BUDYNKI["zespoly"]:
        assert DANE["miejsca"].get(z["id"]) in odglosy, z["id"]
    assert DANE["miejsca"]["mapa"] in odglosy and DANE["miejsca"]["lokal"] in odglosy
    assert DANE["domyslne"] in odglosy


def test_glosnosc_miejsc_dla_kasyna_i_parku():
    g = dz.glosnosc_miejsc(DANE)
    assert g["harpagon"] == 50 and g["park_ludowy"] == 50   # kasyno i parki ciszej
    assert "bank_1" not in g and all(0 < v < 100 for v in g.values())


def test_zdarzenia_wskazuja_krotkie_dzwieki():
    for zd, nazwa in DANE["zdarzenia"].items():
        assert DANE["pliki"][nazwa]["rodzaj"] == "krotki", zd


def test_domyslnie_krotkie_wlaczone_a_tlo_wylaczone():
    assert DANE["wlaczone_domyslnie"] == {"krotkie": True, "tlo": False}


def test_endpoint_zwraca_dane_bez_logowania(client):
    d = client.get("/dzwieki.json").json()
    assert set(d) >= {"glosnosc", "wlaczone", "pliki", "zdarzenia", "miejsca", "przejscie"}
    assert d["miejsca"]["bank_1"] == "cisza" and d["miejsca"]["mapa"] == "ulica"
    assert set(d["pliki"]) <= set(DANE["pliki"])   # tylko pliki, które są (brak pliku = cisza)


def test_brak_pliku_to_pusty_spis(monkeypatch):
    monkeypatch.setattr(dz, "KATALOG_PLIKOW", KATALOG / "nie-ma-takiego-katalogu")
    assert dz.dla_panelu()["pliki"] == {}


def test_strona_nagran_pokazuje_dzwieki(client):
    r = client.get("/nagrania-w-radiu")
    assert r.status_code == 200 and "Dźwięki gry" in r.content.decode()


@pytest.mark.django_db
def test_mg_wycisza_dzwiek_klasy(client):
    d = {"nazwa": "Klasa", "ziarno": "7", "kapital_startowy": "50000",
         "firmy": [{"nazwa": "Drużyna 1", "bot": None}, {"nazwa": "Bot", "bot": "tani"}]}
    id_ = client.post("/api/gry", d, content_type="application/json").json()["id"]
    widok = lambda: client.get(f"/api/gry/{id_}/widok/Drużyna 1").json()["gra"]  # noqa: E731
    assert client.get(f"/api/gry/{id_}/mg").json()["gra"]["dzwiek_wyciszony"] is False
    assert widok()["dzwiek_wyciszony"] is False
    r = client.post(f"/api/gry/{id_}/prowadzenie", {"dzwiek_wyciszony": True}, content_type="application/json")
    assert r.json()["gra"]["dzwiek_wyciszony"] is True
    assert widok()["dzwiek_wyciszony"] is True   # gracz widzi „Dźwięk wyciszony przez prowadzącego”
    client.post(f"/api/gry/{id_}/prowadzenie", {"dzwiek_wyciszony": False}, content_type="application/json")
    assert widok()["dzwiek_wyciszony"] is False


def test_dzwiek_js_szanuje_zasady():
    assert "odblokowany" in JS and "ustawMG" in JS and "przycisz" in JS
    assert '"lukrum:wnetrze"' in JS and '"lukrum:mapa"' in JS
