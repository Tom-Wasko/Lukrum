"""Kontrola PIP: umowa zlecenie jako etat „na niby” (art. 22 § 1 i art. 281 Kodeksu pracy).

Osoba na zleceniu (forma z `kara_zlecenia`), która ma stanowisko i pracuje w pełnym wymiarze (godziny rundy × etat formy
≥ `prog_godzin`) przez `tygodni_z_rzedu` tygodni z rzędu, pracuje jak etatowiec. Dopóki jest ktoś taki, co tydzień jest
szansa kontroli PIP: kara dla firmy (poza KPiR, rodzaj „kary”) i wpis do wyników rundy. Parametry – zalozenia.yaml:
pracownicy.kontrola_pip; losowanie – strumień „pip” (jak sanepid w silnik/kuchnia/magazyn.py). Dane bez tej sekcji
(zamrożona kopia testów) – bez kontroli.
"""
from __future__ import annotations

from ..dane import Dane
from ..losowosc import strumien
from ..model import Firma
from . import formy as fz

KARA = "Kara PIP za zlecenie jak etat"


def zasady(dane: Dane) -> dict | None:
    return (dane.z.get("pracownicy") or {}).get("kontrola_pip")


def jak_etat(dane: Dane, f: Firma, p) -> bool:
    """Czy osoba w tym tygodniu pracuje jak etatowiec: zlecenie, stanowisko w grafiku i pełny wymiar godzin."""
    z = zasady(dane)
    if not z or not fz.forma(dane, p.umowa).get("kara_zlecenia"):
        return False
    if not any(s.pracownik == p.id for s in f.stanowiska):
        return False
    return dane.z["operacje"]["godziny_pracownika"] * fz.etat(dane, p) >= z["prog_godzin"]


def koniec_rundy(dane: Dane, f: Firma, runda: int, ziarno, rach) -> dict | None:
    """Liczy tygodnie „jak etat” i losuje kontrolę. None – dane bez kontroli PIP albo nikt nie pracuje jak etatowiec."""
    z = zasady(dane)
    if not z:
        return None
    for p in f.pracownicy.values():
        p.tygodnie_jak_etat = p.tygodnie_jak_etat + 1 if jak_etat(dane, f, p) else 0
    osoby = [p for p in f.pracownicy.values() if p.tygodnie_jak_etat >= z["tygodni_z_rzedu"]]
    if not osoby:
        return None
    wynik = {"szansa": z["szansa"], "osoby": [p.imie_nazwisko for p in osoby], "kontrola": False, "kara": 0.0, "tekst": None}
    if strumien(ziarno, runda, "pip", f.nazwa).random() >= z["szansa"]:
        return wynik
    kara = float(z["kara"])
    rach.zapisz(f, KARA, -kara, "kary")
    wynik.update(kontrola=True, kara=kara, tekst=z["tekst"].format(
        osoby=", ".join(wynik["osoby"]), kara=f"{kara:,.0f} zł".replace(",", " "), tygodni=z["tygodni_z_rzedu"]))
    return wynik
