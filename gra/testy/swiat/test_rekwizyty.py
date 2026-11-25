"""Paczka rekwizytów (swiat/rekwizyty.js, wątek „charakter”): helpery zwracają SVG, banki i biura mają różny układ,
a każda scena ma coś w dolnej części płótna. Test uruchamia prawdziwy rysunek.js w Node (bez przeglądarki)."""
import json
import shutil
import subprocess
from functools import lru_cache
from pathlib import Path

import pytest

GRA = Path(__file__).resolve().parents[2]
SWIAT = GRA / "panel_gracza" / "static" / "swiat"

pytestmark = pytest.mark.skipif(shutil.which("node") is None, reason="brak Node.js")


@lru_cache(maxsize=1)
def _wynik() -> dict:
    wyjscie = subprocess.run(["node", str(Path(__file__).with_name("rekwizyty_pomoc.mjs")), str(SWIAT)],
                             capture_output=True, text=True, encoding="utf-8", timeout=120)
    assert wyjscie.returncode == 0, wyjscie.stderr[-600:]
    return json.loads(wyjscie.stdout)


def test_kazdy_helper_zwraca_svg():
    zle = [n for n, ok in _wynik()["helpery"].items() if not ok]
    assert not zle, zle
    assert len(_wynik()["helpery"]) >= 18


def test_banki_roznia_sie_ukladem():
    banki = _wynik()["banki"]
    assert len(banki) == 5
    assert len(set(banki.values())) == len(banki)


def test_biura_roznia_sie_ukladem():
    biura = _wynik()["biura"]
    assert len(biura) == 3
    assert len(set(biura.values())) == len(biura)


def test_kazda_scena_ma_cos_w_dolnej_czesci():
    sceny = _wynik()["sceny"]
    assert len(sceny) >= 40
    bledy = {k: v["blad"] for k, v in sceny.items() if "blad" in v}
    assert not bledy, bledy
    pusto = {k: v["dol"] for k, v in sceny.items() if v["dol"] < 3}
    assert not pusto, pusto
