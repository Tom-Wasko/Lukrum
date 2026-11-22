"""Podróż 02, wątek „drobne”: pilnuje poprawek z gier testowych, których nie sprawdzi przeglądarka w testach."""
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

import pytest

STATIC = Path(__file__).resolve().parents[2] / "panel_gracza" / "static"


def _tekst(*sciezka) -> str:
    return STATIC.joinpath(*sciezka).read_text(encoding="utf-8")


def test_menu_przed_startem_sprzedazy_pokazuje_cene_preferowana():
    assert "c.kat.uslugi?.[k]?.cena_preferowana" in _tekst("swiat", "swiat.js")


def test_poczta_bierze_dane_z_widoku_gry_a_nie_z_makiety():
    poczta = _tekst("swiat", "sceny", "poczta.js")
    assert "window.lukrum?.widok" in poczta
    for stare in ("Brak mięsa na piątek", "DECYZJE TYG. 6", "Tydzień 5"):
        assert stare not in poczta
    assert "punkty: () =>" in poczta   # scena jest w pamięci podręcznej, punkty liczą się przy każdym rysowaniu
    assert "window.lukrum.widok" in _tekst("pulpit", "pulpit.js")


def test_tablica_wydarzen_liczy_parki_a_nie_pojedyncze_sprawy():
    pulpit = _tekst("pulpit", "pulpit.js")
    assert "const wParkach = new Map()" in pulpit
    assert "n: parki.length + miasto.length" in pulpit


def test_sprawy_w_lokalu_nie_sa_zadaniem_w_zeszycie():
    zadania = _tekst("zakladki", "zadania.js")
    assert "Zareaguj:" not in zadania
    assert "if (!s.park) continue;" in zadania


def test_zeszyt_przewija_kolkiem_i_klawiatura():
    zeszyt = _tekst("pulpit", "zeszyt.js")
    assert 'roz.addEventListener("wheel"' in zeszyt
    assert "PageDown" in zeszyt and "ArrowDown" in zeszyt


def test_blok_czytelnosci_zatrudniania_jest_na_koncu_stylu():
    css = _tekst("styl.css")
    i = css.index("/* podróż 02/drobne")
    blok = css[i:]
    assert "var(--tusz)" in blok and "opacity: 1" in blok
    assert not re.search(r"#[0-9a-fA-F]{3,6}\b", blok)   # kolory tylko ze zmiennych palet


@pytest.mark.skipif(shutil.which("node") is None, reason="brak node")
@pytest.mark.parametrize("plik", [("pulpit", "zeszyt.js"), ("pulpit", "pulpit.js"), ("swiat", "sceny", "poczta.js"),
                                  ("swiat", "swiat.js")])
def test_zmienione_moduly_maja_poprawna_skladnie(plik):
    with tempfile.TemporaryDirectory() as tmp:
        cel = Path(tmp) / "t.mjs"
        cel.write_text(STATIC.joinpath(*plik).read_text(encoding="utf-8"), encoding="utf-8")
        wynik = subprocess.run(["node", "--check", str(cel)], capture_output=True, text=True)
    assert wynik.returncode == 0, wynik.stderr
