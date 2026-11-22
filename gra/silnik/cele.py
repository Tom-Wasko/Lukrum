"""Cel tygodnia od wujka (dane/zeszyt.yaml: cele): co rundę (od tygodnia 2) jeden cel z małą nagrodą.

Cel sprawdza się po zamknięciu tygodnia, na wynikach tej rundy (`rozlicz`). Wynik trafia do wyników
firmy (`w["cel"]`), a zeszyt pokazuje go w następnej rundzie. Nagroda: krótki mnożnik popytu
w następnej rundzie (ten sam `Efekt` co skutki eventów), czyli „więcej gości po poleceniu wujka”.
Cele, progi i nagroda siedzą w danych. Cel nie ma losowości.
"""
from __future__ import annotations

from .dane import Dane
from .model import Efekt, Firma


def _cele(dane: Dane) -> dict | None:
    return (dane.zeszyt or {}).get("cele")


def cel_na_runde(dane: Dane, runda: int, liczba_rund: int, runda_startowa: int = 1) -> dict | None:
    """Cel z danych na `runda` (None: za wcześnie albo gra bez zeszytu)."""
    c = _cele(dane)
    t = runda - runda_startowa + 1
    if not c or t < c["od_tygodnia"]["wartosc"]:
        return None
    if runda == liczba_rund:
        return c["tygodnie"]["ostatni"]
    numery = [k for k in c["tygodnie"] if isinstance(k, int)]
    return c["tygodnie"][min(max(t, min(numery)), max(numery))]


def prog(cel: dict) -> float | None:
    return cel["prog"]["wartosc"] if cel.get("prog") else None


def tekst(cel: dict) -> str:
    """Tekst celu z wstawionym progiem (dla realizacji próg to procent)."""
    p = prog(cel)
    if p is None:
        return cel["tekst"]
    z = f"{p * 100:g}%" if cel["typ"] == "realizacja" else f"{p:g}"
    return cel["tekst"].replace("{prog}", z)


def _sprzedaz(w: dict | None) -> tuple[float, float, float]:
    """(sprzedane dania, popyt, przychód) z wyników rundy."""
    sp = ((w or {}).get("sprzedaz") or {}).values()
    return (sum(x["sprzedaz"] for x in sp), sum(x["popyt"] for x in sp),
            sum(x["przychod"] for x in sp))


def spelniony(cel: dict, w: dict, poprzednie: dict | None) -> bool:
    """Czy wynik rundy `w` (wyniki firmy) spełnia cel; `poprzednie` – wyniki poprzedniej rundy."""
    dania, popyt, przychod = _sprzedaz(w)
    typ = cel["typ"]
    if typ == "dania":
        return dania >= prog(cel)
    if typ == "realizacja":
        return popyt > 0 and dania / popyt >= prog(cel)
    if typ == "dochod_plus":
        return (w.get("kpir") or {}).get("dochod_netto", 0) > 0
    if not poprzednie or not poprzednie.get("sprzedaz"):
        return False   # nie ma z czym porównać
    pd, _, pp = _sprzedaz(poprzednie)
    return dania > pd if typ == "wiecej_dan" else przychod > pp


def rozlicz(dane: Dane, f: Firma, runda: int, liczba_rund: int, w: dict, poprzednie: dict | None,
            runda_startowa: int = 1) -> dict | None:
    """Sprawdza cel rundy, zapisuje wynik w `w["cel"]` i przy sukcesie dopisuje firmie nagrodę."""
    cel = cel_na_runde(dane, runda, liczba_rund, runda_startowa)
    if cel is None or not w.get("sprzedaz"):
        return None
    ok = spelniony(cel, w, poprzednie)
    nagroda = _cele(dane)["nagroda"]
    w["cel"] = {"id": cel["id"], "tekst": tekst(cel), "osiagniety": ok,
                "nagroda": nagroda["tekst"] if ok else None}
    if ok:
        f.efekty.append(Efekt(typ="popyt", wartosc=nagroda["mnoznik_popytu"]["wartosc"],
                              od_rundy=runda + 1, do_rundy=runda + int(nagroda["rund"]["wartosc"]),
                              opis="Cel tygodnia od wujka"))
    return w["cel"]
