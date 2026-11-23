"""Pora dnia we wnętrzach (03/pora): te same dane i ta sama godzina co na mapie, progi z dane/mapa/miasto.yaml."""

import json
import shutil
import subprocess

import pytest
import yaml
from pomocnicze import DANE_GRY, KATALOG_GRY

STATIC = KATALOG_GRY / "panel_gracza" / "static"
POMIAR = """
import { wysokoscSlonca } from "./mapa/slonce.mjs";
import { porzeDnia } from "./swiat/pora.mjs";
const ust = JSON.parse(process.argv[2]), d = new Date("2026-11-23T12:00:00Z");
const wynik = {};
for (const g of [3, 6, 7, 12, 15, 16, 17, 18, 22]) {
  const m = g * 60, p = porzeDnia(wysokoscSlonca(m, d), m, ust);
  wynik[g] = { pora: p.pora, ciemnosc: p.ciemnosc, lampy: p.lampy, krycie: p.nakladka.krycie };
}
console.log(JSON.stringify(wynik));
"""


def _pora_yaml():
    return yaml.safe_load((DANE_GRY / "mapa" / "miasto.yaml").read_text(encoding="utf-8"))["pora"]


def test_pora_w_danych_ma_progi_w_kolejnosci():
    pora = _pora_yaml()
    pr = pora["progi"]
    assert pr["pelna_noc"] < pr["noc"] < pr["dzien"]
    wys = [e[0] for e in pora["etapy"]]
    assert wys == sorted(wys) and all(len(e[1]) == 4 for e in pora["etapy"])
    assert 0 < pora["wnetrze"]["przyciemnienie"] <= 1 and 0 < pora["wnetrze"]["poswiata_lamp"] <= 1


@pytest.fixture(scope="module")
def pomiar(tmp_path_factory):
    if not shutil.which("node"):
        pytest.skip("brak node")
    kat = tmp_path_factory.mktemp("pora")
    (kat / "mapa").mkdir()
    (kat / "swiat").mkdir()
    shutil.copy(STATIC / "mapa" / "slonce.js", kat / "mapa" / "slonce.mjs")
    tekst = (STATIC / "swiat" / "pora.js").read_text(encoding="utf-8").replace("../mapa/slonce.js", "../mapa/slonce.mjs")
    (kat / "swiat" / "pora.mjs").write_text(tekst, encoding="utf-8")
    (kat / "pomiar.mjs").write_text(POMIAR, encoding="utf-8")
    wynik = subprocess.run(["node", "pomiar.mjs", json.dumps(_pora_yaml())], cwd=kat, capture_output=True,
                           text=True, check=True, encoding="utf-8")
    return json.loads(wynik.stdout)


def test_pora_dla_kilku_godzin_w_tym_przejscia(pomiar):
    assert pomiar["3"]["pora"] == "noc" and pomiar["3"]["ciemnosc"] > 0.9
    assert pomiar["7"]["pora"] == "swit" and 0 < pomiar["7"]["ciemnosc"] < 1   # przejście: świt rano
    assert pomiar["12"]["pora"] == "dzien" and pomiar["12"]["ciemnosc"] == 0 and pomiar["12"]["lampy"] == 0
    assert pomiar["16"]["pora"] == "zmierzch"   # przejście: zmierzch wieczorem
    assert pomiar["22"]["pora"] == "noc" and pomiar["22"]["lampy"] == 1


def test_noc_jest_ciemniejsza_niz_dzien(pomiar):
    assert pomiar["22"]["ciemnosc"] > pomiar["17"]["ciemnosc"] > pomiar["12"]["ciemnosc"]
    assert pomiar["22"]["krycie"] > pomiar["12"]["krycie"]   # inne przyciemnienie wnętrza o 22:00 i 12:00


def test_pora_nie_zalezy_od_trybu_jasny_ciemny():
    for plik in ("swiat/pora.js", "mapa/slonce.js"):
        assert "dataset.tryb" not in (STATIC / plik).read_text(encoding="utf-8")
    css = (STATIC / "swiat" / "swiat.css").read_text(encoding="utf-8")
    blok = css[css.index("/* podróż 03/pora"):]
    assert 'data-tryb' not in blok   # CSS pory nie rozróżnia trybu


def test_scena_dostaje_pore_przez_wspolny_modul():
    swiat = (STATIC / "swiat" / "swiat.js").read_text(encoding="utf-8")
    assert "poraTeraz(c.kat.mapa.miasto?.pora)" in swiat and "warstwaPory()" in swiat
    assert "stopienLamp" in (STATIC / "mapa" / "lublin.js").read_text(encoding="utf-8")   # lampy mapy z tego samego źródła
