"""Kreator gry: losowanie uczniów po drużynach, skład przy tworzeniu gry, kartki z hasłami."""

import json
import shutil
import subprocess
from pathlib import Path

import pytest
from django.contrib.auth import get_user_model
from django.test import Client

from konta import druzyny
from konta.druzyny import rozlosuj

pytestmark = pytest.mark.django_db

JSON = "application/json"
DRUZYNY = ["Kebab Ali", "Pita Pan", "Rożen 3B", "Sos i Spółka"]
STATIC = Path(__file__).resolve().parents[2] / "panel_gracza" / "static"


def zaloz(client, sklad=None, firmy=DRUZYNY):
    d = {"nazwa": "Klasa 3B", "ziarno": "7", "liczba_rund": 3,
         "firmy": [{"nazwa": n, "bot": None} for n in firmy] + [{"nazwa": "Bot tani", "bot": "tani"}]}
    if sklad is not None:
        d["sklad"] = sklad
    return client.post("/api/gry", d, content_type=JSON)


def test_losowanie_po_rowno_kazdy_raz():
    for osoby, k in [(13, 4), (12, 4), (5, 4), (1, 3), (0, 3), (7, 2)]:
        podzial = rozlosuj(osoby, k)
        rozmiary = [len(g) for g in podzial]
        assert len(podzial) == k
        assert max(rozmiary) - min(rozmiary) <= 1
        assert sorted(i for g in podzial for i in g) == list(range(osoby))
    assert sorted(len(g) for g in rozlosuj(13, 4)) == [3, 3, 3, 4]


def test_losowanie_nie_za_duzo_w_druzynie():
    with pytest.raises(Exception, match="Za dużo uczniów"):
        rozlosuj(17, 4)
    assert max(len(g) for g in rozlosuj(16, 4)) == druzyny.MAKS_CZLONKOW == 4


def test_losowanie_jest_losowe():
    wyniki = {tuple(map(tuple, rozlosuj(12, 4))) for _ in range(30)}
    assert len(wyniki) > 1


def test_api_losowanie(client):
    r = client.post("/api/losowanie", {"osoby": 13, "druzyny": 4}, content_type=JSON)
    assert r.status_code == 200
    podzial = r.json()["podzial"]
    assert sorted(len(g) for g in podzial) == [3, 3, 3, 4]
    assert sorted(i for g in podzial for i in g) == list(range(13))
    assert client.post("/api/losowanie", {"osoby": 40, "druzyny": 4}, content_type=JSON).status_code == 400
    assert client.post("/api/losowanie", {"osoby": "x", "druzyny": 4}, content_type=JSON).status_code == 400


def test_losowanie_tylko_mistrz_gry(client):
    get_user_model().objects.create_user("uczen1", password="x")
    c = Client()
    c.force_login(get_user_model().objects.get(username="uczen1"))
    assert c.post("/api/losowanie", {"osoby": 4, "druzyny": 2}, content_type=JSON).status_code == 403


def test_utworzenie_gry_ze_skladem_zaklada_konta_i_zapisuje_sklad(client):
    istniejace = get_user_model().objects.create_user("ola.stara", password="stare-haslo")
    istniejace.first_name = "Ola"
    istniejace.save()
    sklad = {
        "Kebab Ali": [{"imie": "Ala Nowak"}, {"imie": "Jan Kowalski"}],
        "Pita Pan": [{"login": "ola.stara"}, {"imie": "Ewa Żak"}],
    }
    r = zaloz(client, sklad)
    assert r.status_code == 200
    j = r.json()
    zapisany = druzyny.sklad(j["id"])
    assert {f: sorted(o["login"] for o in os) for f, os in zapisany.items()} == {
        "Kebab Ali": ["ala.nowak", "jan.kowalski"],
        "Pita Pan": ["ewa.zak", "ola.stara"],
    }
    # hasła nowych kont przychodzą tylko w odpowiedzi; istniejące konto zostaje bez zmian
    haslo = {o["login"]: o["haslo"] for os in j["sklad"].values() for o in os}
    assert haslo["ola.stara"] is None
    assert len(haslo["ala.nowak"]) == druzyny.DLUGOSC_HASLA
    assert Client().login(username="ala.nowak", password=haslo["ala.nowak"])
    assert Client().login(username="ola.stara", password="stare-haslo")


def test_utworzenie_gry_bez_skladu_dziala_jak_dawniej(client):
    r = zaloz(client)
    assert r.status_code == 200
    assert r.json()["sklad"] == {}
    assert druzyny.sklad(r.json()["id"]) == {}


@pytest.mark.parametrize("sklad, fragment", [
    ({"Nie ma mnie": [{"imie": "Ala Nowak"}]}, "nie jest drużyną uczniów"),
    ({"Bot tani": [{"imie": "Ala Nowak"}]}, "nie jest drużyną uczniów"),
    ({"Kebab Ali": [{"imie": f"Osoba{i} Test"} for i in range(5)]}, "najwyżej"),
    ({"Kebab Ali": [{"login": "nikt"}]}, "Nie ma konta ucznia"),
    ({"Kebab Ali": "Ala"}, "zły format"),
])
def test_zly_sklad_nie_tworzy_gry(client, sklad, fragment):
    r = zaloz(client, sklad)
    assert r.status_code == 400
    assert fragment in r.json()["blad"]
    assert not get_user_model().objects.filter(username__startswith="osoba").exists()
    assert client.get("/api/gry").json() == []


def test_uczen_w_dwoch_druzynach_odrzucony(client):
    get_user_model().objects.create_user("jeden", password="x")
    sklad = {"Kebab Ali": [{"login": "jeden"}], "Pita Pan": [{"login": "jeden"}]}
    r = zaloz(client, sklad)
    assert r.status_code == 400
    assert "dwóch drużynach" in r.json()["blad"]


def test_konto_mistrza_gry_nie_jest_uczniem(client, mistrz):
    r = zaloz(client, {"Kebab Ali": [{"login": mistrz.username}]})
    assert r.status_code == 400


def test_ustawienia_kreatora_maja_konta_uczniow(client):
    get_user_model().objects.create_user("ola.stara", password="x")
    html = client.get("/mg/").content.decode()
    assert "ola.stara" in html
    assert "uczniowie-wklej" in html and "kartki.css" in html


@pytest.mark.skipif(shutil.which("node") is None, reason="brak node")
def test_widok_kartek_ma_kazda_druzyne_i_kazdego_ucznia():
    grupy = [
        {"tytul": "Kebab Ali", "osoby": [{"nazwa": "Ala Nowak", "login": "ala.nowak", "haslo": "abc23456"},
                                          {"nazwa": "Jan <b>", "login": "jan.k", "haslo": "xyz98765"}]},
        {"tytul": "Pita Pan", "osoby": [{"nazwa": "Ola Stara", "login": "ola.stara", "haslo": None}]},
        {"tytul": "Pusta", "osoby": []},
    ]
    skrypt = Path(__file__).with_name("kartki_wydruk.mjs")
    wynik = subprocess.run(["node", str(skrypt), str(STATIC.parent.parent / "panel_mg" / "static"),
                            json.dumps(grupy)], capture_output=True, text=True, encoding="utf8")
    assert wynik.returncode == 0, wynik.stderr
    html = json.loads(wynik.stdout)["html"]
    for tekst in ["Kebab Ali", "Pita Pan", "Ala Nowak", "ala.nowak", "abc23456", "xyz98765", "ola.stara",
                  "dotychczasowe", "https://lukrum.test/konta/login/"]:
        assert tekst in html
    assert html.count('class="kartka"') == 3
    assert html.count("<h3>") == 2   # drużyna bez uczniów nie ma strony
    assert "Jan &lt;b&gt;" in html   # imię jest zabezpieczone przed znacznikami
