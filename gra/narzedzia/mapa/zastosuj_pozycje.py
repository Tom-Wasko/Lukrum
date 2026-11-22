"""Zapisuje pozycje żetonów z edytora (narzedzia/mapa/zbuduj_edytor.py) w dane/mapa/*.yaml.

Wejście: JSON `{id: {"lat": ..., "lon": ...}}` z przycisku „Kopiuj zmiany” (plik albo stdin).
Zmienia tylko wiersze `geo: {lat: …, lon: …}` właściwych id w budynki.yaml (budynki i zespoły) oraz
lokale.yaml (lokale gracza). Reszta pliku, razem z komentarzami i formatowaniem, zostaje bez zmian.
Id spoza plików są odrzucane. Żetony z realnym adresem (kłódka w edytorze) dostają ostrzeżenie.

    .venv/Scripts/python -X utf8 narzedzia/mapa/zastosuj_pozycje.py zmiany.json [--sucho] [--pomin-zablokowane]
    type zmiany.json | .venv/Scripts/python -X utf8 narzedzia/mapa/zastosuj_pozycje.py -
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent))
import zbuduj_edytor as edytor  # noqa: E402

PLIKI = ("budynki.yaml", "lokale.yaml")
WIERSZ_ID = re.compile(r"^- id: (\S+)\s*$")
WIERSZ_GEO = re.compile(r"^(\s+geo: \{lat: )[-0-9.]+(, lon: )[-0-9.]+(\}.*)$")


def _liczba(w: object) -> float | None:
    return float(w) if isinstance(w, (int, float)) and not isinstance(w, bool) else None


def zastosuj(zmiany: dict, dane: Path, sucho: bool = False, pomin_zablokowane: bool = False) -> dict:
    """Zwraca {"zmiany": [(id, plik, stare, nowe)], "odrzucone": [(id, powod)], "ostrzezenia": [str]}."""
    wynik: dict = {"zmiany": [], "odrzucone": [], "ostrzezenia": []}
    zablokowane = {z["id"] for z in edytor.zbierz(dane) if z["zablokowany"]}
    teksty = {p: (dane / p).read_bytes().decode("utf8").split("\n") for p in PLIKI}
    gdzie: dict[str, tuple[str, int]] = {}   # id → (plik, indeks wiersza geo)
    for plik, wiersze in teksty.items():
        biezace = None
        for i, w in enumerate(wiersze):
            m = WIERSZ_ID.match(w)
            if m:
                biezace = m.group(1)
            elif w and not w[0].isspace() and w[0] != "-":
                biezace = None   # nowy klucz najwyższego poziomu kończy listę
            elif biezace and WIERSZ_GEO.match(w):
                gdzie.setdefault(biezace, (plik, i))
    for id_, poz in zmiany.items():
        lat = _liczba(poz.get("lat")) if isinstance(poz, dict) else None
        lon = _liczba(poz.get("lon")) if isinstance(poz, dict) else None
        if id_ not in gdzie:
            wynik["odrzucone"].append((id_, "id spoza plików albo wpis bez wiersza geo"))
            continue
        if lat is None or lon is None or not (-90 <= lat <= 90 and -180 <= lon <= 180):
            wynik["odrzucone"].append((id_, "niepoprawne lat/lon"))
            continue
        if id_ in zablokowane:
            if pomin_zablokowane:
                wynik["odrzucone"].append((id_, "zablokowany (realny adres), pominięto"))
                continue
            wynik["ostrzezenia"].append(f"{id_}: ten budynek ma realny adres, a jego pozycja się zmienia")
        plik, i = gdzie[id_]
        stare = teksty[plik][i]
        m = WIERSZ_GEO.match(stare)
        nowy = f"{m.group(1)}{lat:g}{m.group(2)}{lon:g}{m.group(3)}"
        stare_poz = re.findall(r"[-0-9.]+", stare.split("geo:")[1])[:2]
        teksty[plik][i] = nowy
        wynik["zmiany"].append((id_, plik, tuple(stare_poz), (f"{lat:g}", f"{lon:g}")))
    if not sucho:
        for plik in {p for _, p, _, _ in wynik["zmiany"]}:
            (dane / plik).write_bytes("\n".join(teksty[plik]).encode("utf8"))
            yaml.safe_load((dane / plik).read_text(encoding="utf8"))   # musi nadal się wczytać
    return wynik


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("wejscie", help="plik JSON z edytora albo - (stdin)")
    ap.add_argument("--dane", type=Path, default=edytor.DANE, help="folder z budynki.yaml i lokale.yaml")
    ap.add_argument("--sucho", action="store_true", help="tylko pokaż zmiany, nic nie zapisuj")
    ap.add_argument("--pomin-zablokowane", action="store_true", help="nie ruszaj żetonów z realnym adresem")
    a = ap.parse_args()
    surowe = sys.stdin.read() if a.wejscie == "-" else Path(a.wejscie).read_text(encoding="utf8")
    try:
        zmiany = json.loads(surowe)
        assert isinstance(zmiany, dict)
    except (ValueError, AssertionError):
        print("Błąd: wejście musi być JSON-em {id: {lat, lon}}.", file=sys.stderr)
        return 2
    w = zastosuj(zmiany, a.dane, a.sucho, a.pomin_zablokowane)
    for id_, plik, st, no in w["zmiany"]:
        print(f"{plik}: {id_}: ({st[0]}, {st[1]}) -> ({no[0]}, {no[1]})")
    for t in w["ostrzezenia"]:
        print("UWAGA:", t)
    for id_, p in w["odrzucone"]:
        print(f"ODRZUCONO {id_}: {p}")
    print(f"{'Podgląd' if a.sucho else 'Zapisano'}: {len(w['zmiany'])} zmian, {len(w['odrzucone'])} odrzuconych.")
    return 0 if w["zmiany"] or not w["odrzucone"] else 1


if __name__ == "__main__":
    sys.exit(main())
