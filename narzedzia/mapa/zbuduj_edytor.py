"""Buduje samodzielny plik HTML edytora rozmieszczenia żetonów na mapie Lublina.

Czyta dane/mapa/budynki.yaml (budynki i zespoły), dane/mapa/lokale.yaml (lokale gracza) oraz
panel_gracza/static/mapa/lublin.json (granice dzielnic, woda, zieleń, drogi), wkleja je jako JSON do
szablonu edytor_szablon.html i zapisuje jeden plik bez zewnętrznych zasobów (do publikacji jako artefakt).
Pozycje po przeciąganiu wraca się do gry skryptem zastosuj_pozycje.py.

    .venv/Scripts/python -X utf8 narzedzia/mapa/zbuduj_edytor.py [wynik.html]
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import yaml

REPO = Path(__file__).resolve().parents[2]
DANE = REPO / "dane" / "mapa"
MAPA = REPO / "panel_gracza" / "static" / "mapa" / "lublin.json"
SZABLON = Path(__file__).with_name("edytor_szablon.html")
DOMYSLNY = REPO.parent / "edytor-mapy" / "index.html"

# Swobodne (bez ostrzeżenia): lokale gracza oraz te trzy budynki zbiorcze/tymczasowe.
SWOBODNE = {"kamienica_rachmistrzow", "park_handlowy", "biurowiec_zana"}
# Rodzaje bez adresu, ale stojące w realnym miejscu Lublina (park, zalew).
REALNE_BEZ_ADRESU = {"park", "woda"}


def zbierz(dane: Path = DANE) -> list[dict]:
    """Lista żetonów: id, nazwa, rodzaj, typ, adres, lat, lon, zablokowany (tylko wpisy z geo)."""
    wynik: list[dict] = []
    bud = yaml.safe_load((dane / "budynki.yaml").read_text(encoding="utf8"))
    for typ, klucz in (("budynek", "budynki"), ("zespol", "zespoly")):
        for b in bud[klucz]:
            if not b.get("geo"):
                continue
            adres = b.get("adres") or ""
            rodzaj = b.get("rodzaj") or "zespol"
            realny = bool(adres) or rodzaj in REALNE_BEZ_ADRESU
            wynik.append({
                "id": b["id"], "nazwa": b["nazwa"], "rodzaj": rodzaj, "typ": typ,
                "adres": adres or b.get("miejsce", ""), "strefa": b.get("strefa", ""),
                "lat": b["geo"]["lat"], "lon": b["geo"]["lon"],
                "zablokowany": realny and b["id"] not in SWOBODNE,
            })
    lok = yaml.safe_load((dane / "lokale.yaml").read_text(encoding="utf8"))
    for lk in lok["lokale"]:
        if not lk.get("geo"):
            continue
        wynik.append({
            "id": lk["id"], "nazwa": lk["nazwa"], "rodzaj": "lokal", "typ": "lokal",
            "adres": lk.get("adres", ""), "strefa": lk.get("strefa", ""),
            "lat": lk["geo"]["lat"], "lon": lk["geo"]["lon"], "zablokowany": False,
        })
    return wynik


def mapa() -> dict:
    d = json.loads(MAPA.read_text(encoding="utf8"))
    return {
        "rzut": d["rzut"], "zasieg": d["zasieg"],
        "dzielnice": [{"nazwa": x["nazwa"], "d": x["d"], "srodek": x["srodek"]} for x in d["dzielnice"]],
        "woda": [{"d": x["d"]} for x in d["woda"]] + [{"d": x["d"], "rzeka": 1} for x in d["rzeki"]],
        "zielen": [{"d": x["d"], "rodzaj": x["rodzaj"]} for x in d["zielen"]],
        "drogi": [{"d": x["d"], "klasa": x["klasa"]} for x in d["drogi"]],
    }


def buduj(cel: Path) -> int:
    dane = {"zetony": zbierz(), "mapa": mapa()}
    js = json.dumps(dane, ensure_ascii=False, separators=(",", ":")).replace("</", "<" + chr(92) + "/")
    html = SZABLON.read_text(encoding="utf8").replace("/*DANE*/null", js)
    cel.parent.mkdir(parents=True, exist_ok=True)
    cel.write_text(html, encoding="utf8")
    return len(dane["zetony"])


if __name__ == "__main__":
    cel = Path(sys.argv[1]) if len(sys.argv) > 1 else DOMYSLNY
    n = buduj(cel)
    print(f"Zapisano {cel} ({cel.stat().st_size // 1024} KB, {n} żetonów)")
