"""Skrypt narzedzia/mapa/zastosuj_pozycje.py: przenosi jeden żeton, resztę pliku zostawia bez zmian."""
import json
import shutil
import sys
from pathlib import Path

import yaml

REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO / "narzedzia" / "mapa"))
import zastosuj_pozycje as zp  # noqa: E402


def _kopia(tmp_path: Path) -> Path:
    for p in zp.PLIKI:
        shutil.copy(REPO / "dane" / "mapa" / p, tmp_path / p)
    return tmp_path


def _wiersze(p: Path) -> list[str]:
    return p.read_bytes().decode("utf8").split("\n")


def test_przenosi_jeden_zeton_i_nic_wiecej(tmp_path):
    dane = _kopia(tmp_path)
    przed = _wiersze(dane / "budynki.yaml")
    # biurowiec przy Zana ma adres tymczasowy, więc przesuwa się bez ostrzeżenia (park handlowy ma od 19.11 realny adres)
    w = zp.zastosuj({"biurowiec_zana": {"lat": 51.2301, "lon": 22.4801}}, dane)
    assert len(w["zmiany"]) == 1 and not w["odrzucone"] and not w["ostrzezenia"]
    po = _wiersze(dane / "budynki.yaml")
    zmienione = [(a, b) for a, b in zip(przed, po, strict=True) if a != b]
    assert len(przed) == len(po) and len(zmienione) == 1
    assert zmienione[0][1].strip() == "geo: {lat: 51.2301, lon: 22.4801}"
    assert zmienione[0][0].startswith("  geo: {lat: 51.23807")   # wcięcie i reszta wiersza zachowane
    assert _wiersze(dane / "lokale.yaml") == _wiersze(REPO / "dane" / "mapa" / "lokale.yaml")
    wczytane = yaml.safe_load((dane / "budynki.yaml").read_text(encoding="utf8"))
    geo = {b["id"]: b.get("geo") for b in wczytane["zespoly"]}
    assert geo["biurowiec_zana"] == {"lat": 51.2301, "lon": 22.4801}
    assert geo["park_handlowy"] == {"lat": 51.23079, "lon": 22.48355}


def test_lokal_z_lokale_yaml(tmp_path):
    dane = _kopia(tmp_path)
    w = zp.zastosuj({"stare_miasto_1": {"lat": 51.2488, "lon": 22.5690}}, dane)
    assert [z[1] for z in w["zmiany"]] == ["lokale.yaml"]
    assert _wiersze(dane / "budynki.yaml") == _wiersze(REPO / "dane" / "mapa" / "budynki.yaml")


def test_obce_id_odrzucone_a_zablokowane_ostrzezenie(tmp_path):
    dane = _kopia(tmp_path)
    w = zp.zastosuj({"nie_ma_takiego": {"lat": 51.2, "lon": 22.5}, "poczta": {"lat": 51.2, "lon": 22.5}}, dane)
    assert [o[0] for o in w["odrzucone"]] == ["nie_ma_takiego"]
    assert len(w["ostrzezenia"]) == 1 and "poczta" in w["ostrzezenia"][0]
    assert len(w["zmiany"]) == 1


def test_pomin_zablokowane_i_sucho(tmp_path):
    dane = _kopia(tmp_path)
    przed = (dane / "budynki.yaml").read_bytes()
    w = zp.zastosuj({"poczta": {"lat": 51.2, "lon": 22.5}}, dane, pomin_zablokowane=True)
    assert not w["zmiany"] and len(w["odrzucone"]) == 1
    zp.zastosuj({"park_handlowy": {"lat": 51.2, "lon": 22.5}}, dane, sucho=True)
    assert (dane / "budynki.yaml").read_bytes() == przed


def test_wejscie_z_edytora_json(tmp_path):
    dane = _kopia(tmp_path)
    plik = tmp_path / "z.json"
    plik.write_text(json.dumps({"biurowiec_zana": {"lat": 51.2381, "lon": 22.5274}}), encoding="utf8")
    assert zp.main.__name__ == "main"
    w = zp.zastosuj(json.loads(plik.read_text(encoding="utf8")), dane)
    assert w["zmiany"][0][0] == "biurowiec_zana"
