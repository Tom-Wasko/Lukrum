"""Każdy park z mapy ma własny wygląd tablicy wydarzeń, a przycisk parku otwiera wydarzenia (nie kalendarz)."""

import re

import yaml
from pomocnicze import DANE_GRY, KATALOG_GRY

STATIC = KATALOG_GRY / "panel_gracza" / "static"


def _parki():
    budynki = yaml.safe_load((DANE_GRY / "mapa" / "budynki.yaml").read_text(encoding="utf-8"))["budynki"]
    return [b["id"] for b in budynki if b["rodzaj"] in ("park", "woda")]


def _wyglad():
    tekst = (STATIC / "swiat" / "parki_wyglad.js").read_text(encoding="utf-8")
    return {m.group(1): m.group(2) for m in re.finditer(r'^\s{2}(\w+): \{ wzor: "(\w+)", haslo: "([^"]+)"', tekst, re.M)}, tekst


def test_kazdy_park_ma_wlasny_wyglad():
    wpisy, tekst = _wyglad()
    parki = _parki()
    assert len(parki) >= 7
    assert set(parki) <= set(wpisy), f"brak wyglądu: {set(parki) - set(wpisy)}"
    godla = re.findall(r"godlo: godlo\(`([^`]+)`\)", tekst)
    hasla = re.findall(r'haslo: "([^"]+)"', tekst)
    assert len(set(godla)) == len(godla) and len(set(hasla)) == len(hasla)   # godło i hasło różne w każdym parku
    css = (STATIC / "styl.css").read_text(encoding="utf-8")
    for wzor in set(wpisy.values()):
        assert f".zd-wz-{wzor} " in css, f"brak stylu wzoru {wzor}"
    assert len(set(wpisy[p] for p in parki)) >= 7   # też wzór tła różny


def test_przycisk_parku_otwiera_wydarzenia():
    park = (STATIC / "swiat" / "sceny" / "park.js").read_text(encoding="utf-8")
    assert "parkId: id" in park and 'ekran: "kalendarz' not in park
    assert "oknoParku(c, p.parkId)" in (STATIC / "swiat" / "wnetrze.js").read_text(encoding="utf-8")
