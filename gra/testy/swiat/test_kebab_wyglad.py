"""Kebab (Z4 B): punkty jako szyldy nakładki, pusta półka zamiast ramki, ciemne postacie w ciemnych paletach."""

import re

from pomocnicze import KATALOG_GRY

SWIAT = KATALOG_GRY / "panel_gracza" / "static" / "swiat"


def _sceny():
    return (SWIAT / "sceny.js").read_text(encoding="utf-8")


def _css():
    return (SWIAT / "wnetrza.css").read_text(encoding="utf-8")


def test_punkt_kebabu_to_szyld_nakladki_bez_plusa_i_ramki():
    tekst = _sceny()
    m = re.search(r"const hot = .*?\n\};?\n", tekst, re.S) or re.search(r"function hot\(.*?\n\}", tekst, re.S)
    assert m, "brak hot() w sceny.js"
    kod = m.group(0)
    assert "wn-pkt" in kod and "wn-met" in kod and "data-gdzie" in kod
    assert "dashed" not in kod and "plus" not in kod.lower()


def test_pusta_polka_zamiast_napisu_miejsce_na_dodatki():
    tekst = _sceny()
    assert "MIEJSCE NA DODATKI" not in tekst
    assert "polkaPusta(" in tekst and "PÓŁKA PUSTA" in tekst


def test_ciemne_palety_maja_kontur_i_ciemne_wypelnienia_postaci():
    css = _css()
    assert '[data-tryb="ciemny"] .sw-scena svg[data-mina]' in css
    assert "--g-kontur" in css
    assert re.search(r'\[data-paleta="wysoka"\]\[data-tryb="ciemny"\] \.sw-scena svg\[data-mina\] \{ --g-kontur: #ffffff', css)
