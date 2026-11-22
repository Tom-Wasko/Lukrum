"""Jednolite szablony kart (seria pulpit, krok 6): 4 style okien, mapowanie ekranów w jednym miejscu, układ bez powtórzeń.

Pilnuje: każdy ekran z NAZWY (zakladki/index.js) ma styl albo jawne „własny styl”; karty.css bierze kolory tylko ze zmiennych
palet i ma style s1–s4, ruch wyłączany, fokus; okna z listą opcji mają przypisany układ a/b/c; skład JS.
"""
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

import pytest

GRA = Path(__file__).resolve().parents[2]
STATIC = GRA / "panel_gracza" / "static"
STYLE_JS = (STATIC / "pulpit" / "karty-style.js").read_text(encoding="utf-8")
KARTY_CSS = (STATIC / "pulpit" / "karty.css").read_text(encoding="utf-8")
INDEX_JS = (STATIC / "zakladki" / "index.js").read_text(encoding="utf-8")
WSPOLNE_JS = (STATIC / "zakladki" / "wspolne.js").read_text(encoding="utf-8")
APP_JS = (STATIC / "app.js").read_text(encoding="utf-8")
ZMIENNE_CSS = (STATIC / "motywy" / "zmienne.css").read_text(encoding="utf-8")
SZABLON = (GRA / "panel_gracza" / "templates" / "panel_gracza" / "gra.html").read_text(encoding="utf-8")


def _bez_komentarzy(css: str) -> str:
    return re.sub(r"/\*.*?\*/", "", css, flags=re.S)


def _mapa_stylow() -> dict[str, str]:
    blok = re.search(r"export const STYL_EKRANU = \{(.*?)\n\};", STYLE_JS, re.S).group(1)
    blok = re.sub(r"//[^\n]*", "", blok)
    return {k: v.strip('"') for k, v in re.findall(r"(\w+):\s*(\"?\w+\"?)", blok)}


def _klucze_nazwy() -> set[str]:
    blok = INDEX_JS[INDEX_JS.index("const NAZWY = {"):INDEX_JS.index("for (const [k, nazwy] of Object.entries(NAZWY))")]
    return set(re.findall(r"^  (\w+): \{ tytul:", blok, re.M))


def test_mapowanie_obejmuje_wszystkie_ekrany_z_nazw():
    mapa, nazwy = _mapa_stylow(), _klucze_nazwy()
    assert len(nazwy) > 30
    assert nazwy <= set(mapa), f"brak stylu dla: {sorted(nazwy - set(mapa))}"
    for k, v in mapa.items():
        assert v in {"1", "2", "3", "4", "wlasny"}, (k, v)


def test_wlasne_style_to_paragon_list_tablica_zeszyt_dymki():
    wlasne = {k for k, v in _mapa_stylow().items() if v == "wlasny"}
    assert wlasne == {"wyslij", "zakupy", "wydarzenia", "zeszyt", "dymki"}


def test_przypisania_z_tabeli_okien():
    mapa = _mapa_stylow()
    oczekiwane = {"oferta": "1", "zespol": "4", "sprzet": "1", "dostawcy": "1", "bank": "2", "biuro": "2", "klienci": "3", "konkurencja": "2",
                  "gielda": "2", "ubezpieczenia": "2", "wlasciciel": "4", "vat": "2", "sanepid": "2", "raport": "3", "karta_wynikow": "3",
                  "wnioski": "4", "ranking": "3", "kalendarz": "4", "karta_miejsca": "4", "ustawienia": "3", "jak_grac": "4", "potwierdzenie": "2"}
    for k, s in oczekiwane.items():
        assert mapa[k] == s, k


def test_uklady_bez_powtorzen_z_tabeli():
    blok = STYLE_JS[STYLE_JS.index("export const UKLAD_EKRANU"):]
    uklady = dict(re.findall(r"(\w+): \{ uklad: \"([abc])\"", blok))
    assert {k: uklady[k] for k in ("sprzet", "dostawcy", "handel", "bank", "biuro", "ubezpieczenia", "agencje")} == {
        "sprzet": "b", "dostawcy": "b", "handel": "b", "bank": "a", "biuro": "c", "ubezpieczenia": "c", "agencje": "a"}


def test_karty_css_ma_4_style_i_wspolna_budowe():
    css = _bez_komentarzy(KARTY_CSS)
    for s in ("karta--s1", "karta--s2", "karta--s3", "karta--s4"):
        assert f".szk.{s}" in css, s
    for czesc in (".og", ".ot", ".ost", ".k-ok", ".k-tyt", ".teczka-tryb", ".x"):
        assert czesc in css, czesc
    assert "styl.css" in KARTY_CSS and "pulpit/karty.css" in SZABLON


def test_karty_css_kolory_tylko_ze_zmiennych_palet():
    css = _bez_komentarzy(KARTY_CSS)
    assert not re.search(r"#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(", css), "kolory tylko przez zmienne z motywy/zmienne.css"
    zdefiniowane = set(re.findall(r"(--[\w-]+)\s*:", ZMIENNE_CSS)) | set(re.findall(r"(--[\w-]+)\s*:", css))
    uzyte = set(re.findall(r"var\((--[\w-]+)", css))
    assert uzyte <= zdefiniowane, uzyte - zdefiniowane
    assert "--font-masz" in css and "--font-reka" in css and "--siatka" in css


def test_karty_css_ruch_fokus_i_stan_nie_kolorem():
    css = _bez_komentarzy(KARTY_CSS)
    assert "prefers-reduced-motion: reduce" in css
    assert ":focus-visible" in css and "var(--ognisko)" in css
    assert 'content: "✓ "' in css                           # aktywny przełącznik ma znak
    assert "border-style: dashed" in css                      # niedostępny/wyłączony: przerywana ramka
    assert '[data-paleta="wysoka"]' in css                    # wysoka widoczność ma własne ustawienia


def test_okno_i_teczka_przyjmuja_styl_i_uklad():
    assert "styl" in WSPOLNE_JS and "szk karta--s" in WSPOLNE_JS and "og-t" in WSPOLNE_JS and "k-ok" in WSPOLNE_JS
    assert "zastosujUklad" in WSPOLNE_JS and "STYL_DOMYSLNY" in WSPOLNE_JS
    teczka = APP_JS[APP_JS.index("function rysujTeczke"):APP_JS.index("// --- rysowanie")]
    assert "stylEkranu(" in teczka and "ukladEkranu(" in teczka and "okruszek" in teczka


def test_okna_systemowe_maja_wlasny_styl_albo_styl_z_mapy():
    pulpit = (STATIC / "pulpit" / "pulpit.js").read_text(encoding="utf-8")
    assert pulpit.count("styl: 0") == 2                         # list i paragon zostają jak są
    assert 'stylEkranu("raport")' in pulpit
    assert "karta--s${stylEkranu(" in (STATIC / "pulpit" / "karta.js").read_text(encoding="utf-8")


@pytest.mark.parametrize("plik", ["pulpit/karty-style.js", "pulpit/uklady.js", "pulpit/karta.js", "zakladki/wspolne.js", "swiat/wnetrze.js", "app.js"])
def test_skladnia_js_krok_6(plik):
    node = shutil.which("node")
    if not node:
        pytest.skip("brak node")
    with tempfile.TemporaryDirectory() as tmp:
        kopia = Path(tmp) / "t.mjs"
        shutil.copy(STATIC / plik, kopia)
        wynik = subprocess.run([node, "--check", str(kopia)], capture_output=True, text=True)
    assert wynik.returncode == 0, wynik.stderr
