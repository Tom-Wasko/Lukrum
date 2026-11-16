"""Propozycje klientów przy ladzie (dane/wnetrza/dymki.yaml: propozycje) i skutki odpowiedzi drużyny.

Wybór: od rundy `propozycje_zasady.od_rundy` najwyżej jedna propozycja co `co_ile_rund` rund, każda najwyżej raz w grze
(dla firmy), deterministycznie (strumień: ziarno, runda, „wnetrza”, firma). Rundę z propozycją ustala odtworzenie rund
od początku – bez własnego zapisu poza odpowiedzią drużyny.

Odpowiedź drużyny: `konfiguracja["wnetrza"]["odpowiedzi"][firma][str(runda)] = {"propozycja", "odpowiedz"}` (zapisuje
gra, jak `odsloniete` w funkcjach). Bez odpowiedzi do końca rundy liczy się `bez_odpowiedzi`.

Skutki NIE są podpięte do przeliczenia rundy (`silnik/runda.py` zmienia inna gałąź). Opis podpięcia – raport wnętrz.
"""
from __future__ import annotations

from collections.abc import Callable

from ..dane import Dane
from ..losowosc import Strumien, strumien
from .dymki import _spelnia
from .schematy import WUJEK


def zasady(dane: Dane) -> dict:
    z = dane.wnetrza["dymki"]["propozycje_zasady"]
    return {"co_ile_rund": z["co_ile_rund"]["wartosc"], "od_rundy": z["od_rundy"]["wartosc"],
            "bez_odpowiedzi": z["bez_odpowiedzi"]}


def propozycje(dane: Dane) -> dict[str, dict]:
    return {p["id"]: p for p in dane.wnetrza["dymki"]["propozycje"]} if dane.wnetrza else {}


def propozycja_rundy(dane: Dane, ziarno, firma: str, runda: int,
                     wskazniki_rundy: Callable[[int], dict]) -> dict | None:
    """Propozycja dla firmy w rundzie `runda` (None – brak). `wskazniki_rundy(r)` – wskaźniki rundy r do warunków `gdy`
    (wołane tylko dla propozycji z `gdy`). Odtwarza rundy od pierwszej, żeby znać już użyte propozycje i odstęp."""
    if not dane.wnetrza:
        return None
    z = zasady(dane)
    wszystkie = propozycje(dane)
    uzyte: set[str] = set()
    ostatnia: int | None = None
    for r in range(z["od_rundy"], runda + 1):
        if ostatnia is not None and r - ostatnia < z["co_ile_rund"]:
            continue
        wsk = None
        mozliwe = []
        for p in wszystkie.values():
            if p["id"] in uzyte or p["od_rundy"] > r:
                continue
            if p["gdy"]:
                wsk = wskazniki_rundy(r) if wsk is None else wsk
                if not _spelnia(p["gdy"], wsk):
                    continue
            mozliwe.append(p)
        if not mozliwe:
            continue
        wybrana = mozliwe[int(strumien(ziarno, r, "wnetrza", firma, "propozycja").integers(len(mozliwe)))]
        uzyte.add(wybrana["id"])
        ostatnia = r
        if r == runda:
            return wybrana
    return None


def odpowiedzi(konfiguracja: dict) -> dict:
    return (konfiguracja.get("wnetrza") or {}).get("odpowiedzi") or {}


def wybrana(konfiguracja: dict, firma: str, runda: int) -> dict | None:
    """Zapisana odpowiedź drużyny w rundzie: {"propozycja", "odpowiedz"} albo None."""
    return (odpowiedzi(konfiguracja).get(firma) or {}).get(str(runda))


def zapisz_odpowiedz(konfiguracja: dict, firma: str, runda: int, propozycja: dict, odpowiedz: str) -> None:
    """Zapisuje odpowiedź drużyny na propozycję rundy (zmiana do końca rundy dozwolona). Nieznana – ValueError."""
    if odpowiedz not in {o["id"] for o in propozycja["odpowiedzi"]}:
        raise ValueError("Nie ma takiej odpowiedzi na tę propozycję.")
    konfiguracja.setdefault("wnetrza", {}).setdefault("odpowiedzi", {}).setdefault(firma, {})[str(runda)] = {
        "propozycja": propozycja["id"], "odpowiedz": odpowiedz}


def obowiazujaca(dane: Dane, propozycja: dict, wybrana_odpowiedz: str | None) -> dict:
    """Odpowiedź, która obowiązuje: wybrana przez drużynę albo `bez_odpowiedzi`."""
    id_ = wybrana_odpowiedz or zasady(dane)["bez_odpowiedzi"]
    return next(o for o in propozycja["odpowiedzi"] if o["id"] == id_)


def rozstrzygnij(propozycja: dict, odpowiedz: dict, los: Strumien) -> tuple[dict, bool]:
    """(skutki, udane): przy `szansa` rzut decyduje, czy wychodzą `skutki`, czy `skutki_porazka`; bez `szansa` zawsze
    `skutki`. Zwracane są tylko ustawione klucze skutków."""
    udane = odpowiedz["szansa"] is None or float(los.random()) < odpowiedz["szansa"]
    wybrane = odpowiedz["skutki"] if udane else odpowiedz["skutki_porazka"]
    return {k: v for k, v in wybrane.items() if v is not None}, udane


def skutki_propozycji(dane: Dane, propozycja: dict, odpowiedz: dict | str, los: Strumien) -> dict:
    """Skutki odpowiedzi na propozycję (klucze: porcje, rabat, darmowe_porcje, koszt, opinia, ryzyko_kontroli,
    kandydat – bez nieustawionych). `odpowiedz` – obiekt albo id; `los` – strumień do rzutu `szansa`."""
    if isinstance(odpowiedz, str):
        odpowiedz = obowiazujaca(dane, propozycja, odpowiedz)
    return rozstrzygnij(propozycja, odpowiedz, los)[0]


def nadawca(dane: Dane, propozycja: dict) -> tuple[str, str]:
    """(kto, imię) mówiącego: bywalec albo anonimowy gość."""
    bywalcy = {b["id"]: b["imie"] for b in dane.wnetrza["bywalcy"]["bywalcy"]}
    if propozycja["kto"] in bywalcy and propozycja["kto"] != WUJEK:
        return propozycja["kto"], bywalcy[propozycja["kto"]]
    return "gosc", dane.wnetrza["silnik"]["dymki"]["gosc"]
