"""Zeszyt wujka: treść w danych (dane/zeszyt.yaml), widok v.zeszyt, warunki w JS i zapis wizyt (api/wizyty.py)."""
import copy
import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

import pytest

from api import zeszyt as budowniczy
from api.prezentacja import widok
from silnik.dane import Dane, _sprawdz_zeszyt
from silnik.gra import Gra
from testy.aplikacja.test_swiat import _ekrany
from testy.aplikacja.test_wnetrza_sceny import _sceny

GRA = Path(__file__).resolve().parents[2]
STATIC = GRA / "panel_gracza" / "static"
WARUNKI_JS = STATIC / "pulpit" / "zeszyt-warunki.js"
JSON = "application/json"
pytestmark = pytest.mark.dane_gry


def _dane() -> Dane:
    return Dane()


def _zadania(z):
    return [x for w in z["tygodnie"].values() for x in w["zadania"]] + z["stale"]["zadania"]


def _warunki(x):
    """Wszystkie warunki zadania (zwykły i zastępczy) jako pary (nazwa, parametr)."""
    wynik = []
    for w in [x["warunek"]] + ([x["zastepstwo"]["warunek"]] if x.get("zastepstwo") else []):
        wynik.append(next(iter(w.items())) if isinstance(w, dict) else (w, None))
    return wynik


def test_dane_zeszytu_sa_kompletne():
    z = _dane().zeszyt
    assert sorted(k for k in z["tygodnie"] if isinstance(k, int)) == list(range(1, 18)) and "ostatni" in z["tygodnie"]
    assert len(z["warunki"]) == 23 and len(_zadania(z)) >= 40
    assert not any("pojecie" in x for x in _zadania(z)), "pojęcia z WOS usunięte decyzją szefa"


def test_zeszyt_odwoluje_sie_do_istniejacych_zetonow_elementow_i_funkcji():
    assert _sprawdz_zeszyt(_dane()) == []


@pytest.mark.parametrize("pole, wartosc, fragment", [
    ("zeton", "nie_ma_takiego", "nie ma w mapa/budynki.yaml"),
    ("element", "nie_ma_takiego", "harmonogramu"),
    ("funkcja", "nie_ma_takiej", "nie ma w funkcje.yaml"),
])
def test_walidacja_zeszytu_lapie_bledy(pole, wartosc, fragment):
    d = _dane()
    d.zeszyt = copy.deepcopy(d.zeszyt)
    d.zeszyt["tygodnie"][1]["zadania"][0][pole] = wartosc
    bledy = _sprawdz_zeszyt(d)
    assert any(fragment in b for b in bledy), bledy


def test_kazdy_warunek_z_danych_ma_implementacje_w_js():
    z = _dane().zeszyt
    wdrozone = set(re.findall(r"^  (\w+): \(v", WARUNKI_JS.read_text(encoding="utf-8"), re.M))
    assert set(z["warunki"]) == wdrozone, set(z["warunki"]) ^ wdrozone
    uzyte = {n for x in _zadania(z) for n, _ in _warunki(x)}
    assert uzyte <= set(z["warunki"]), uzyte - set(z["warunki"])


def test_punkty_zadan_to_istniejace_ekrany_a_wizyty_to_sceny():
    z = _dane().zeszyt
    punkty = {x["punkt"] for x in _zadania(z)} - {"wyslij"}
    assert punkty <= _ekrany(), punkty - _ekrany()
    wizyty = {p for x in _zadania(z) for n, p in _warunki(x) if n == "wizyta"}
    assert wizyty <= _sceny() | {"bazar", "kebab"}, wizyty - _sceny()


def test_widok_zeszytu_tydzien_1():
    g = Gra.nowa("t", [("A", None), ("B", None)], 12, 5)
    z = widok(g, "A")["zeszyt"]
    assert z["tydzien"] == 1 and not z["ostatni"] and z["wizyty"] == [] and z["list"] and z["dopisek"]
    ids = [x["id"] for x in z["zadania"]]
    assert "lokal" in ids and ids[-1] == "wyslij" and len(ids) == len(set(ids))
    assert all(x["gdzie"] and x["warunek"]["nazwa"] for x in z["zadania"])
    assert z["gdzie_kupic"] and all("{" not in s["tekst"] for s in z["gdzie_kupic"])
    tabela = next(s for s in z["gdzie_kupic"] if s["tabela"])["tabela"]
    assert tabela[0]["sezon"]["1"] > tabela[0]["ceny"]["1"]
    assert z["specjalne"] and "agencje_internetowe" in z


def test_szablony_wstawiaja_liczby_z_danych():
    g = Gra.nowa("t", [("A", None), ("B", None)], 12, 5)
    teksty = " ".join(s["tekst"] for s in widok(g, "A")["zeszyt"]["gdzie_kupic"])
    assert not re.search(r"\{\w+:", teksty) and "brak oferty" not in teksty and "?" not in teksty.replace("?!", "")
    assert budowniczy._liczba(0.149) == "14,9%" and budowniczy._liczba(1500) == "1 500"


def test_kazdy_tydzien_ma_zadania_i_nie_psuje_widoku():
    for rundy in (3, 12, 18):
        g = Gra.nowa("t", [("A", None), ("B", None)], rundy, 5)
        for _ in range(rundy):
            z = widok(g, "A")["zeszyt"]
            assert z["zadania"], z["tydzien"]
            if g.runda >= g.konfiguracja["liczba_rund"]:
                break
            g.wyslij("A")
            g.wyslij("B")
            g.przelicz()


def _nowa(client) -> str:
    d = {"nazwa": "Z", "ziarno": "7", "liczba_rund": 4,
         "firmy": [{"nazwa": "Ala", "bot": None}, {"nazwa": "Ola", "bot": None}]}
    r = client.post("/api/gry", d, content_type=JSON)
    assert r.status_code == 200, r.json()
    return r.json()["id"]


@pytest.mark.django_db
def test_endpoint_wizyt_zapisuje_i_wraca_w_widoku(client):
    id_ = _nowa(client)
    url = f"/api/gry/{id_}/zeszyt/Ala/wizyta"
    assert client.get(f"/api/gry/{id_}/widok/Ala").json()["zeszyt"]["wizyty"] == []
    r = client.post(url, {"miejsce": "kebab"}, content_type=JSON)
    assert r.status_code == 200 and r.json()["wizyty"] == ["kebab"]
    assert client.post(url, {"miejsce": "kebab"}, content_type=JSON).json()["wizyty"] == ["kebab"]   # duplikat
    assert client.post(url, {"miejsce": "stolarnia"}, content_type=JSON).json()["wizyty"] == ["kebab", "stolarnia"]
    assert client.get(f"/api/gry/{id_}/widok/Ala").json()["zeszyt"]["wizyty"] == ["kebab", "stolarnia"]
    assert client.get(f"/api/gry/{id_}/widok/Ola").json()["zeszyt"]["wizyty"] == []   # drużyny osobno


@pytest.mark.django_db
@pytest.mark.parametrize("miejsce", ["", "Kebab", "../x", "a" * 41, 5, None])
def test_endpoint_wizyt_odrzuca_zle_id(client, miejsce):
    id_ = _nowa(client)
    r = client.post(f"/api/gry/{id_}/zeszyt/Ala/wizyta", {"miejsce": miejsce}, content_type=JSON)
    assert r.status_code == 400
    assert client.get(f"/api/gry/{id_}/zeszyt/Ala/wizyta").status_code == 405


@pytest.mark.django_db
def test_wizyty_przezywaja_ponowne_wczytanie_gry(client):
    from gry import serwisy
    id_ = _nowa(client)
    client.post(f"/api/gry/{id_}/zeszyt/Ala/wizyta", {"miejsce": "kebab"}, content_type=JSON)
    g = serwisy.wczytaj(id_)
    assert g.decyzje[g.runda]["_zeszyt"]["Ala"] == ["kebab"]


SKRYPT_NODE = """
import { WARUNKI, spelniony } from "%s";
const v = { runda: 1, wyslane: false, decyzje: { zamowienia: [{ dostawca: "Piekarnia" }] },
  zeszyt: { wizyty: ["kebab"], specjalne: ["kebab_specjalny_1"], agencje_internetowe: ["lajk"] },
  stan: { lokale: [{ id: "x" }], bank: "Soplicowo", biuro: null, oferta: { kebab_specjalny_1: 10 },
    stanowiska: [{ typ: "kuchnia" }, { typ: "kasa" }], pracownicy: [],
    gotowe_uslugi: { kebab_specjalny_1: ["nie jest włączone do sprzedaży (brak ceny)"] }, polisy: {}, wyposazenie: [],
    udogodnienia: [], kampanie: [{ agencja: "lajk" }], lokaty: [], szkolenia: [], harpagon: null, debet: 0, higiena: null, promocje: [] } };
const w = (nazwa, parametr) => spelniony(v, { warunek: { nazwa, parametr } });
console.log(JSON.stringify({ lokal: w("ma_lokal"), bank: w("ma_bank"), biuro: w("ma_biuro"), stan: w("ma_stanowiska"),
  ceny: w("ceny_ustawione"), spec: w("danie_specjalne"), net: w("kampania_trwa", "internet"), pap: w("kampania_trwa", "papier_przyjmie"),
  zam: w("zamowienie_u", "Piekarnia"), zam2: w("zamowienie_u", "Inny"), wiz: w("wizyta", "kebab"), wiz2: w("wizyta", "park"),
  dlug: w("bez_drogiego_dlugu"), nieznany: spelniony(v, { warunek: { nazwa: "xx" } }), wyslane: w("wyslane"),
  n: Object.keys(WARUNKI).length }));
"""


@pytest.mark.skipif(shutil.which("node") is None, reason="brak Node.js")
def test_warunki_js_licza_odhaczenie_ze_stanu_i_wizyt():
    with tempfile.TemporaryDirectory() as tmp:
        kopia = Path(tmp) / "warunki.mjs"
        kopia.write_text(WARUNKI_JS.read_text(encoding="utf-8"), encoding="utf-8")
        glowny = Path(tmp) / "test.mjs"
        glowny.write_text(SKRYPT_NODE % kopia.as_uri(), encoding="utf-8")
        wynik = subprocess.run(["node", str(glowny)], capture_output=True, text=True, encoding="utf-8", check=True).stdout
    assert json.loads(wynik) == {
        "lokal": True, "bank": True, "biuro": False, "stan": True, "ceny": False, "spec": True, "net": True, "pap": False,
        "zam": True, "zam2": False, "wiz": True, "wiz2": False, "dlug": True, "nieznany": False, "wyslane": False, "n": 23}
