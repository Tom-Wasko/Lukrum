"""Radio „Fala Koziołka” (seria radio, decyzje 19.11.2026): dane/radio.yaml, pliki MP3, /radio.json i strona nagrań.

Pilnuje zasad szefa: każde nagranie ma autora, wykonawcę, źródło i dozwoloną licencję, plik leży w paczce (gra bez
internetu), w paczce nie ma plików spoza spisu, a stare nagrania „z mocy prawa” są sprzed 1926 r.
"""
import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

import pytest
import yaml

GRA = Path(__file__).resolve().parents[2]
DANE = yaml.safe_load((GRA / "dane" / "radio.yaml").read_text(encoding="utf-8"))
KATALOG = GRA / "panel_gracza" / "static" / "radio"
RADIO_JS = (GRA / "panel_gracza" / "static" / "pulpit" / "radio.js").read_text(encoding="utf-8")
PULPIT_CSS = (GRA / "panel_gracza" / "static" / "pulpit" / "pulpit.css").read_text(encoding="utf-8")
PULPIT_JS = (GRA / "panel_gracza" / "static" / "pulpit" / "pulpit.js").read_text(encoding="utf-8")
NAGRANIA = [(s["id"], n) for s in DANE["stacje"] for n in s.get("nagrania", [])]
POLA = ("tytul", "autor", "wykonawca", "zrodlo", "licencja", "plik", "sekundy")
LIMIT_MB = 80   # paczka w repozytorium (decyzja 19.11: ~68 MB)


def test_stacje():
    ids = [s["id"] for s in DANE["stacje"]]
    assert len(ids) == len(set(ids)) and {"polska", "jazz", "klasyczna", "lalka", "szum"} <= set(ids)
    for s in DANE["stacje"]:
        assert s["rodzaj"] in ("muzyka", "sluchowisko", "szum") and s["nazwa"] and s["opis"]
        assert re.fullmatch(r"\d{2},\d", s["fala"]), s["fala"]
        assert bool(s.get("nagrania")) == (s["rodzaj"] != "szum"), s["id"]   # szum robi przeglądarka, bez plików


@pytest.mark.parametrize("stacja,n", NAGRANIA, ids=[n["plik"] for _, n in NAGRANIA])
def test_nagranie_ma_opis_licencje_i_plik(stacja, n):
    from panel_gracza.radio import licencja_dozwolona

    for p in POLA:
        assert n.get(p), f"{n['plik']}: brak {p}"
    assert licencja_dozwolona(n["licencja"]), n["licencja"]
    assert n["zrodlo"].startswith("https://")
    assert n["plik"].startswith(f"{stacja}/") and n["plik"].endswith(".mp3")
    plik = KATALOG / n["plik"]
    assert plik.is_file() and plik.stat().st_size > 10_000
    if "z mocy prawa" in n["licencja"]:   # nagrania bez znaku PD: tylko sprzed 1926 r. (decyzja 19.11)
        assert n["rok"] and n["rok"] <= 1925
        assert int(re.search(r"zm\. (\d{4})", n["licencja"])[1]) <= 1955


def test_paczka_bez_plikow_spoza_spisu_i_mala():
    w_spisie = {n["plik"] for _, n in NAGRANIA}
    w_paczce = {p.relative_to(KATALOG).as_posix() for p in KATALOG.rglob("*") if p.is_file()}
    assert w_paczce == w_spisie
    assert sum(p.stat().st_size for p in KATALOG.rglob("*.mp3")) < LIMIT_MB * 2**20


def test_teksty_prowadzacego():
    p = DANE["prowadzacy"]
    assert p["co_ile"] >= 1 and p["powitania"] and p["wtracenia"] and p["zapowiedzi"]
    for t in p["powitania"] + p["wtracenia"] + p["zapowiedzi"]:
        assert set(re.findall(r"\{(\w+)\}", t)) <= {"stacja", "fala", "tytul", "wykonawca"}, t
        assert not re.search(r"\b\w*(?:łeś|łaś|eś|aś)\b", t), t   # neutralnie płciowo


@pytest.mark.django_db
def test_radio_json_i_strona_bez_logowania(client):
    from django.test import Client

    c = Client()   # bez logowania i nie z tego komputera
    r = c.get("/radio.json", REMOTE_ADDR="10.0.0.5")
    assert r.status_code == 200
    d = r.json()
    assert [s["id"] for s in d["stacje"]] == [s["id"] for s in DANE["stacje"]]
    n = d["stacje"][0]["nagrania"][0]
    assert n["url"].startswith("/static/radio/") and "licencja" not in n
    s = c.get("/nagrania-w-radiu", REMOTE_ADDR="10.0.0.5")
    assert s.status_code == 200
    html = s.content.decode()
    for _, n in NAGRANIA:
        assert n["zrodlo"] in html
    assert "Licencja Wolnej Sztuki 1.3" in html and "art. 36 pkt 2" in html


@pytest.mark.django_db
def test_mp3_kawalkami(client):
    plik = NAGRANIA[0][1]["plik"]
    cale = client.get(f"/static/radio/{plik}")
    assert cale.status_code == 200 and cale["Accept-Ranges"] == "bytes"
    rozmiar = (KATALOG / plik).stat().st_size
    r = client.get(f"/static/radio/{plik}", HTTP_RANGE="bytes=100-199")
    assert r.status_code == 206 and r["Content-Range"] == f"bytes 100-199/{rozmiar}" and len(r.content) == 100
    assert r.content == (KATALOG / plik).read_bytes()[100:200]
    assert client.get(f"/static/radio/{plik}", HTTP_RANGE=f"bytes={rozmiar + 5}-").status_code == 416


def test_ikona_radia_obok_portfela_a_nie_w_lewym_pasku():
    # decyzja szefa 23.11: ikona obok kaski (portfela), pozycji radia w lewym pasku nie ma, odbiornik wysuwa się sam
    assert '["radio", "radio", "Radio"]' not in PULPIT_JS
    assert 'id="pp-radio"' in PULPIT_JS and 'class="pp-radio-ik"' in PULPIT_JS and 'data-akcja="pp-radio"' in PULPIT_JS
    assert PULPIT_JS.index('id="pp-portfel"') < PULPIT_JS.index('id="pp-radio"')
    assert 'id="pp-radio-panel"' in PULPIT_JS and 'class="odb"' in PULPIT_JS
    assert "pp-szuflada pp-radio" not in PULPIT_JS   # to już nie szuflada ani okno
    assert "...AKCJE_RADIA" in PULPIT_JS and "Radio: wkrótce" not in PULPIT_JS
    assert "otwórz odbiornik" in PULPIT_JS   # pozycja w ⚙ zostaje


def test_odbiornik_ma_wszystkie_elementy_i_akcje():
    for a in re.findall(r'data-akcja="([\w-]+)"', RADIO_JS):
        assert f'"{a}"' in RADIO_JS.split("export const AKCJE_RADIA")[1] or a == "pp-radio", a
    for el in ("odb-skala", "odb-wskazowka", "odb-strojenie", "odb-glosnosc", "odb-wl", "odb-antena"):
        assert el in RADIO_JS, el   # skala, wskazówka, gałka strojenia, gałka głośności, włącznik, antena
    assert "okno(" not in RADIO_JS   # bez okna z wspolne.js
    assert "speechSynthesis" in RADIO_JS and "createBiquadFilter" in RADIO_JS   # prowadzący i szum bez plików
    assert "autoplay" not in RADIO_JS   # nic nie gra samo
    assert "przycisz?.(" in RADIO_JS


def test_odbiornik_css_ruch_kolory_i_telefon():
    css = re.sub(r"/\*.*?\*/", "", PULPIT_CSS, flags=re.S)
    assert not re.search(r"#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(", css)
    redukcja = css.split("prefers-reduced-motion: reduce", 1)[1]
    assert ".odb:not([hidden])" in redukcja and "animation: none" in redukcja   # wysunięcie bez ruchu
    assert re.search(r"@media \(max-width: 760px\)[^@]*\.odb \{", css)   # telefon: odbiornik na całą szerokość
    assert 'data-paleta="wysoka"] .odb' in css
    for znak in ('content: "▼ "', "▶ Włącz", "■ Wyłącz", "♪"):
        assert znak in css or znak in RADIO_JS, znak   # stan nie samym kolorem


@pytest.mark.skipif(shutil.which("node") is None, reason="brak node")
def test_odbiornik_zachowanie_pod_node():
    # prawdziwy moduł radia ze stubem DOM: ikona otwiera odbiornik, stacje zmienia się na nim (skala, gałka), gwar cichnie
    wynik = subprocess.run([shutil.which("node"), str(Path(__file__).with_name("radio_zachowanie.mjs")),
                            str(GRA / "panel_gracza" / "static")], capture_output=True, text=True, encoding="utf-8")
    assert wynik.returncode == 0, wynik.stderr
    d = json.loads(wynik.stdout.strip().splitlines()[-1])
    assert d["bledy"] == [], d["bledy"]
    w = d["wynik"]
    assert w["otwarcie"] == {"przed": False, "po": True, "stacje": 3, "ikona_aria": "true", "wl": "▶ Włącz"}
    z = w["zmiana_stacji_na_odbiorniku"]
    assert z["klik"] == ["b"] and z["gałka_dalej"] == ["c"] and z["zawiniecie"] == ["a"] and z["wstecz"] == ["c"]
    assert z["zapisana"] == "c" and z["wskazowka"] == "2"
    g = w["przyciszanie_gwaru"]   # radio zaczyna grać → przycisz(true); stop → przycisz(false); start → znowu true
    assert g["po_starcie"][-1] is True and g["po_stopie"][-1] is False and g["na_koncu"] is True
    assert g["znak_ukryty"] is False   # ♪ przy ikonie, gdy gra
    assert w["schowanie"]["po_kliku"] is False and w["schowanie"]["po_esc"] is False
    assert w["schowanie"]["gra_dalej"] is True   # schowanie nie wyłącza radia


def test_skladnia_radio_js():
    node = shutil.which("node")
    if not node:
        pytest.skip("brak node")
    with tempfile.TemporaryDirectory() as tmp:
        kopia = Path(tmp) / "t.mjs"
        kopia.write_text(RADIO_JS, encoding="utf-8")
        wynik = subprocess.run([node, "--check", str(kopia)], capture_output=True, text=True)
    assert wynik.returncode == 0, wynik.stderr
