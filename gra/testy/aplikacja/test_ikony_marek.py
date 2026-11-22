"""Poprawki 3 (uwaga autora 8.11.2026): każda marka, rola i sprawa, która w kartach (kartaMarki, wspolne.js) dostawała
dwie litery w kwadracie, ma ikonę w panel_gracza/static/zakladki/ikony_marek.js (prawdziwe marki – LOGA, nasze – WLASNE)."""

import re
from pathlib import Path

import yaml

GRA = Path(__file__).resolve().parents[2]
ZAKLADKI = GRA / "panel_gracza" / "static" / "zakladki"
DANE = GRA / "dane"

# nazwy wpisane w kodzie zakładek (nie w danych): karty bez marki i kategorie bazy składników
Z_KODU = ["Samodzielnie", "Szkolenia dla zespołu", "Higiena lokali", "Instalacje i usługi", "Udogodnienia dla pracowników",
          "Suche", "Chłodnia", "Zamrażarka"]


def _yaml(sciezka: Path):
    return yaml.safe_load(sciezka.read_text(encoding="utf-8"))


def _ikony() -> set[str]:
    kod = (ZAKLADKI / "ikony_marek.js").read_text(encoding="utf-8")
    klucze = set()
    for slownik in ("WLASNE", "LOGA"):
        cialo = re.search(rf"const {slownik} = \{{\n(.*?)\n\}};", kod, re.S).group(1)
        klucze |= {a or b for a, b in re.findall(r'^ {2}(?:"([^"]+)"|([^\s"/:]+)):', cialo, re.M)}
    return klucze


def _historie(x):
    """Historie spraw w lokalu (z tytułem, bez pola park – parki mają własne okna na mapie)."""
    if isinstance(x, dict):
        if "tytul" in x and "sceny" in x and "park" not in x:
            yield x["tytul"]
        for v in x.values():
            yield from _historie(v)
    elif isinstance(x, list):
        for v in x:
            yield from _historie(v)


def _nazwy() -> dict[str, str]:
    """nazwa → skąd (wszystko, co trafia do znakMarki / kartaMarki)."""
    n = {}
    n |= {d: "dostawcy.yaml" for d in _yaml(DANE / "dostawcy.yaml")["dostawcy"]}
    n |= {b["nazwa"]: "mapa/banki.yaml" for b in _yaml(DANE / "mapa" / "banki.yaml")["banki"]}
    n |= {b["nazwa"]: "mapa/biura.yaml" for b in _yaml(DANE / "mapa" / "biura.yaml")["biura"]}
    rek = _yaml(DANE / "mapa" / "reklama.yaml")
    agencje = [*rek["agencje"].values(), *rek.get("internet", {}).get("agencje", {}).values()]
    n |= {a["nazwa"]: "mapa/reklama.yaml" for a in agencje}
    n |= {p["nazwa"]: "mapa/promocje.yaml" for p in _yaml(DANE / "mapa" / "promocje.yaml")["typy"].values()}
    kat = _yaml(DANE / "katalog.yaml")
    for t in kat["stanowiska"]["typy"].values():
        n[t["nazwa"]] = "katalog.yaml: stanowiska"
        n |= {z: "katalog.yaml: zawody" for z in t["zawody"]}
    n |= {k["zawod"]: "kandydaci.yaml" for k in _yaml(DANE / "kandydaci.yaml")["znani"]}
    n |= {p["sklep"]: "katalog.yaml: wyposażenie" for p in kat["wyposazenie"]["pozycje"] if p.get("sklep")}
    n[_yaml(DANE / "zdarzenia" / "losowe.yaml")["ubezpieczyciel"]["nazwa"]] = "zdarzenia/losowe.yaml"
    for plik in sorted((DANE / "zdarzenia").glob("*.yaml")):
        n |= {t: f"zdarzenia/{plik.name}" for t in _historie(_yaml(plik))}
    n |= {z: "kod zakładek" for z in Z_KODU}
    return n


def test_nazwy_z_kodu_sa_w_zakladkach():
    kod = "".join(p.read_text(encoding="utf-8") for p in ZAKLADKI.glob("*.js") if p.name != "ikony_marek.js")
    assert [z for z in Z_KODU if f'"{z}"' not in kod] == []


def test_kazda_marka_ma_ikone():
    nazwy, ikony = _nazwy(), _ikony()
    assert len(nazwy) > 50 and {"Biedronka", "Kasjer", "Kucharz", "Soplicowo", "IKEA", "Pożar w kuchni"} <= set(nazwy)
    brak = sorted(f"{n} ({skad})" for n, skad in nazwy.items() if n not in ikony)
    assert brak == [], "Bez ikony w ikony_marek.js:\n" + "\n".join(brak)
