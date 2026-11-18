"""Powłoka pulpitu (seria pulpit, krok 1): mapa na cały ekran, pasek LUKRUM, portfel i zeszyt wujka.

Pilnuje spójności, której nie sprawdzi przeglądarka w testach: pliki są podpięte do strony gry, każda akcja
pulpitu ma obsługę, ikony i ekran zakupów istnieją, a style biorą kolory tylko ze zmiennych palet.
"""
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

import pytest
from django.contrib.staticfiles import finders

GRA = Path(__file__).resolve().parents[2]
STATIC = GRA / "panel_gracza" / "static"
PULPIT_JS = (STATIC / "pulpit" / "pulpit.js").read_text(encoding="utf-8")
ZESZYT_JS = (STATIC / "pulpit" / "zeszyt.js").read_text(encoding="utf-8")
KARTA_JS = (STATIC / "pulpit" / "karta.js").read_text(encoding="utf-8")
PULPIT_CSS = (STATIC / "pulpit" / "pulpit.css").read_text(encoding="utf-8")
ZMIENNE_CSS = (STATIC / "motywy" / "zmienne.css").read_text(encoding="utf-8")
INDEX_JS = (STATIC / "zakladki" / "index.js").read_text(encoding="utf-8")
IKONY_JS = (STATIC / "zakladki" / "ikony.js").read_text(encoding="utf-8")
APP_JS = (STATIC / "app.js").read_text(encoding="utf-8")
SZABLON = (GRA / "panel_gracza" / "templates" / "panel_gracza" / "gra.html").read_text(encoding="utf-8")


def _bez_komentarzy(css: str) -> str:
    return re.sub(r"/\*.*?\*/", "", css, flags=re.S)


def _ikony_paska() -> str:
    return re.search(r"const IKONY_PASKA = \[(.*?)\];", PULPIT_JS, re.S).group(1)


def test_pliki_pulpitu_sa_podpiete():
    assert finders.find("pulpit/pulpit.js") and finders.find("pulpit/pulpit.css")
    assert "pulpit/pulpit.css" in SZABLON
    assert 'import { AKCJE_PULPITU, odswiezPulpit, PULPIT } from "./pulpit/pulpit.js"' in APP_JS
    assert "odswiezPulpit(" in APP_JS and "AKCJE_PULPITU[a]" in APP_JS


def test_stary_uklad_zostaje_pod_adresem_uklad_stary():
    # klasa `pulpit` na <body> – tylko komputer i bez ?uklad=stary; menu, nagłówek i stopka zostają w szablonie
    assert "uklad=stary" in SZABLON and "min-width: 901px" in SZABLON
    assert 'class="naglowek"' in SZABLON and 'id="menu"' in SZABLON and 'class="stopka"' in SZABLON
    assert 'body.pulpit > .naglowek' in PULPIT_CSS and 'body.pulpit > .menu' in PULPIT_CSS


def test_kazda_akcja_pulpitu_ma_obsluge():
    obslugiwane = set(re.findall(r'^  "(p[pz]-[\w-]+)":', PULPIT_JS, re.M))
    klucze_paska = set(re.findall(r'\["(\w+)", "\w+", "[^"]+"\]', _ikony_paska())) - {"jak"}
    uzyte = {f"pp-{k}" for k in klucze_paska} | set(re.findall(r'data-akcja="(pp-[a-z-]+)"', PULPIT_JS + ZESZYT_JS)) - {"pp-wyglad"}
    assert 'data-akcja="pp-${k}"' in PULPIT_JS
    uzyte |= set(re.findall(r'data-akcja="(pz-[a-z-]+)"', ZESZYT_JS))
    assert uzyte <= obslugiwane | {"pp-wyglad"}
    assert obslugiwane >= {"pp-wyslij", "pp-konto", "pp-koszyk", "pp-mapa", "pp-portfel", "pp-zeszyt", "pp-zeszyt-zamknij", "pp-zeszyt-strona",
                           "pp-wydarzenia", "pp-filtr", "pp-wroc", "pp-pokaz", "pp-wejdz", "pp-kat", "pp-wyglad", "pz-dol"}
    assert 'akcja = "pp-wyglad"' in PULPIT_JS


def test_ikony_paska_istnieja():
    ikony = set(re.findall(r"^  (\w+): '<", IKONY_JS, re.M))
    uzyte = re.findall(r'\["\w+", "(\w+)", "[^"]+"\]', _ikony_paska())
    assert uzyte and set(uzyte) <= ikony, set(uzyte) - ikony


def test_style_pulpitu_maja_kolory_tylko_ze_zmiennych():
    css = _bez_komentarzy(PULPIT_CSS)
    assert not re.search(r"#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(", css), "kolory tylko przez zmienne z motywy/zmienne.css"
    zdefiniowane = set(re.findall(r"(--[\w-]+)\s*:", ZMIENNE_CSS)) | set(re.findall(r"(--font-reka)\s*:", PULPIT_CSS))
    uzyte = set(re.findall(r"var\((--[\w-]+)", css))
    assert uzyte <= zdefiniowane, uzyte - zdefiniowane
    # grafika SVG w skrypcie też używa tylko zmiennych palety
    assert not re.search(r"(?:fill|stroke)=\"#|:#[0-9a-fA-F]{3,6}\b", PULPIT_JS)
    assert set(re.findall(r"var\((--[\w-]+)", PULPIT_JS)) <= zdefiniowane


def test_ruch_wylaczany_i_fokus_klawiatury():
    css = _bez_komentarzy(PULPIT_CSS)
    assert "prefers-reduced-motion: reduce" in css
    for selektor in (".pp-portfel:focus-visible", ".pp-zeszyt:focus-visible", ".pp-ik:focus-visible"):
        assert selektor in css, selektor
    assert 'rys.addEventListener("pointerleave"' in PULPIT_JS and '"Escape"' in PULPIT_JS   # wysunięte elementy da się schować


def test_stan_nie_tylko_kolorem():
    # wysłane / uwaga / debet / następny krok mają znak, a niedostępne zakupy – przerywaną ramkę i napis
    for znak in ('"✓"', '"!"', '"▼ "', '"! "'):
        assert znak in PULPIT_JS, znak
    assert "pp-wyszarzona { border-style: dashed" in PULPIT_CSS and "▶" in PULPIT_CSS


def test_teksty_pulpitu_neutralne_plciowo():
    teksty = re.findall(r'"([^"]*[A-ZĄĆĘŁŃÓŚŹŻa-ząćęłńóśźż]{4,}[^"]*)"', PULPIT_JS)
    for t in teksty:
        assert not re.search(r"\b\w*(?:łeś|łaś|eś|aś)\b", t), t


@pytest.mark.parametrize("plik", ["pulpit/pulpit.js", "pulpit/zeszyt.js", "pulpit/karta.js", "zakladki/wujek.js", "mapa/lublin.js", "zakladki/mapa.js", "app.js"])
def test_skladnia_js(plik):
    node = shutil.which("node")
    if not node:
        pytest.skip("brak node")
    with tempfile.TemporaryDirectory() as tmp:
        kopia = Path(tmp) / "t.mjs"
        shutil.copy(STATIC / plik, kopia)
        wynik = subprocess.run([node, "--check", str(kopia)], capture_output=True, text=True)
    assert wynik.returncode == 0, wynik.stderr


def test_strona_gry_laduje_pulpit(client):
    r = client.post("/api/gry", {"nazwa": "Test pulpitu", "liczba_rund": 4, "ziarno": "2026",
                                 "firmy": [{"nazwa": "Moja firma", "bot": None}, {"nazwa": "Bot 1", "bot": "zrownowazony"}]},
                    content_type="application/json")
    assert r.status_code == 200, r.json()
    strona = client.get(f"/gra/{r.json()['id']}/Moja firma")
    html = strona.content.decode()
    assert strona.status_code == 200 and "pulpit/pulpit.css" in html and "uklad=stary" in html


def test_poprawki_1b():
    # skróty mapy usunięte z widoku, szyld pionowo (writing-mode), zakupy tylko do odczytu, rozpiska funkcji, bez „Kasy” we wnętrzu
    assert "body.pulpit .lm-pasek { display: none; }" in PULPIT_CSS
    assert "writing-mode: vertical-rl" in PULPIT_CSS
    assert "od tyg." not in PULPIT_JS and "zakupyDostepne" not in PULPIT_JS
    assert "Zakupy tygodnia" in PULPIT_JS and "tylko do odczytu" in PULPIT_JS
    assert "Rozpiska funkcji" in ZESZYT_JS and "MIEJSCA" in ZESZYT_JS
    swiat = (STATIC / "swiat" / "swiat.js").read_text(encoding="utf-8")
    assert 'wsk("Kasa"' not in swiat and 'wsk("Tydzień"' in swiat


def test_krok_2_zeszyt_trzy_stany_i_strony():
    # strony zeszytu, zamykanie (Esc, przycisk, klik poza), przewracanie z animacją i bez niej, zachowanie przy prefers-reduced-motion
    for strona in ("Lista wujka", "Rozpiska funkcji", "Gdzie co kupić", "Samouczek"):
        assert strona in ZESZYT_JS, strona
    assert '"Escape"' in ZESZYT_JS and "pp-zeszyt-zamknij" in ZESZYT_JS and "e.target === o" in ZESZYT_JS
    assert "prefers-reduced-motion: reduce" in ZESZYT_JS and "rotateY" in PULPIT_CSS and "perspective" in PULPIT_CSS
    css = _bez_komentarzy(PULPIT_CSS)
    assert ".pz-kartka { display: none; }" in css   # bez ruchu strona się tylko zmienia
    assert ".pp-zeszyt:hover, .pp-zeszyt:focus-visible { translate: 0 0; }" in css   # stan 2
    assert 'role", "dialog"' in ZESZYT_JS and "aria-modal" in ZESZYT_JS


def test_krok_2_interfejs_pulpitu():
    # szuflada Wydarzenia zamiast „W parkach…”, warstwy pod ikoną, filtr kategorii z etykietami, „Tydzień N” u góry, karta miejsca
    assert "Wydarzenia tygodnia" in PULPIT_JS and "kalendarz_miasta" in PULPIT_JS
    assert "body.pulpit.na-mapie .tresc > .zd-parki { display: none; }" in PULPIT_CSS
    assert "pp-warstwy" not in PULPIT_JS and "body.pulpit .lm-ustawienia { display: none !important;" in PULPIT_CSS
    assert 'aria-pressed="${filtr === k}"' in PULPIT_JS and ".pp-f.aktywny" in PULPIT_CSS and 'id="pp-kat-btn"' in PULPIT_JS
    assert re.search(r"\.pp-tydzien \{ position: fixed; left: 50%; top: 10px;", PULPIT_CSS)
    assert "pokazKarte" in KARTA_JS and "pk-wejdz" in KARTA_JS and "aria-modal" in KARTA_JS
    assert "pokazKarte" in (STATIC / "zakladki" / "mapa.js").read_text(encoding="utf-8")
    assert "pokazKarte" in (STATIC / "mapa" / "lublin.js").read_text(encoding="utf-8")


def test_krok_3_ustawienia_wroc_wydarzenia_zeszyt():
    # panel ustawień w sekcjach (Wygląd, Mapa, Dźwięk, Konto), warstwy mapy w ⚙, przycisk „Wróć” + Esc, wskaźnik przewijania zeszytu,
    # klik w nazwę miejsca pokazuje je na mapie, kroki wchodzą od razu do celu, wydarzenia z kalendarza i parków
    for sekcja in ("<h3>Wygląd</h3>", "<h3>Mapa</h3>", "<h3>Dźwięk</h3>", "<h3>Konto</h3>", "Rozmiar pisma", "Radio: wkrótce"):
        assert sekcja in PULPIT_JS, sekcja
    assert '"mapa-warstwa"' in PULPIT_JS and 'data-akcja="mapa-opinie"' in PULPIT_JS
    assert 'data-rozmiar="duzy"' in PULPIT_CSS or ':root[data-rozmiar="duzy"]' in PULPIT_CSS
    nawigacja = (STATIC / "pulpit" / "nawigacja.js").read_text(encoding="utf-8")
    assert "export function wroc" in nawigacja and "export function zapamietajWidok" in nawigacja and 'id="pp-wroc"' in PULPIT_JS
    assert "mozeWrocic(ostatniC)" in PULPIT_JS and '"Escape"' in PULPIT_JS
    assert 'id="pz-wiecej"' in ZESZYT_JS and "scrollHeight - s.scrollTop" in ZESZYT_JS and ".pz-wiecej" in PULPIT_CSS
    assert 'data-akcja="pp-pokaz"' in ZESZYT_JS and 'data-akcja="pp-wejdz"' in ZESZYT_JS and "data-akcja=\"pp-pokaz\"" in PULPIT_JS or 'data-akcja="pp-pokaz"' in PULPIT_JS
    assert "otworzBudynek" in nawigacja and "BUDYNEK_KROKU" in nawigacja and "pokazZnak" in nawigacja
    lublin = (STATIC / "mapa" / "lublin.js").read_text(encoding="utf-8")
    assert "pokazZnak(" in lublin and "pokazDzielnice(" in lublin
    assert "menuUstawien" in APP_JS and "pp-sek-gra" in APP_JS


def test_rozpiska_i_kupowanie_uzywaja_istniejacych_budynkow():
    # zeszyt odwołuje się do żetonów budynków i scen, które istnieją (inaczej „pokaż na mapie” nic by nie pokazało)
    import yaml
    mapa = yaml.safe_load((GRA / "dane" / "mapa" / "budynki.yaml").read_text(encoding="utf-8"))
    zetony = {b["id"] for b in mapa["budynki"]} | {z["id"] for z in mapa.get("zespoly", [])}
    blok = re.search(r"const ZAKUPY = \[(.*?)\];\nfunction stronaKupic", ZESZYT_JS, re.S).group(1)
    uzyte = {x for lista in re.findall(r"\[((?:\"[a-z_]+\",? ?)+)\]", blok) for x in re.findall(r"\"([a-z_]+)\"", lista)}
    assert uzyte, "brak żetonów w ZAKUPY"
    assert {"makro", "sprzet_gastro", "kamienica_bankowa", "ubezpieczyciel"} <= uzyte
    nieznane = {x for x in uzyte if x not in zetony and x not in {"zaop_dostawy", "wnetrze_sprzet", "wnetrze_wyposazenie", "rynek_pracy", "szkolenia",
                                                                    "agencje", "ubezpieczenia", "bank"}}
    assert not nieznane, nieznane
