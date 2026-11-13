"""Pulpit przed wejściem do gry (seria „funkcje”, 9.11.2026): streszczenie gier.

Uczeń dostaje gry swoich drużyn: stan rundy, status decyzji drużyny, termin zamknięcia, skład,
kolor, miejsce w rankingu i to, co jest nowe w tej rundzie (w rundzie 1 – pierwsze kroki).
Mistrz gry dostaje wszystkie gry, a w każdej wszystkie drużyny graczy (bez liczenia stanu gry –
lista ma być szybka także przy wielu grach).
"""

from __future__ import annotations

from gry import harmonogram as hg
from gry import serwisy
from gry.models import Gra
from konta import druzyny
from konta.role import firmy_ucznia, gry_ucznia, jest_mg
from silnik import funkcje as fn
from silnik import harmonogram as hm
from silnik.gra import Gra as GraSilnika

from .prezentacja import karta_skumulowana, miejsca

# runda 1 to przygotowanie lokalu – zamiast listy odblokowań pokazujemy pierwsze kroki
# (zakładki z podstawy gry)
PIERWSZE_KROKI = (
    (
        "Wybierz lokal na mapie",
        "Nowe lokale → Lokale: porównaj ruch i konkurencję w strefach, zanim podpiszesz najem.",
    ),
    ("Nazwij firmę i ustaw menu", "Mój lokal i Kuchnia: nazwa, kolor, slogan i dania na start."),
    ("Zatrudnij ludzi", "Ludzie → Rynek pracy: kucharze i kasjerzy na stanowiska w lokalu."),
    ("Wybierz biuro rachunkowe", "Księgowość → Biuro: kto rozlicza podatki firmy."),
    (
        "Wyślij decyzje",
        "Lista błędów pokaże, czego brakuje. Runda zamknie się, gdy wszystkie drużyny wyślą.",
    ),
)


def status_decyzji(g: GraSilnika, firma: str) -> str:
    """Decyzje drużyny w bieżącej rundzie: „wyslane”, „zapisane” (niewysłane), „brak”, „koniec”."""
    if g.zakonczona:
        return "koniec"
    if firma in g.wyslane():
        return "wyslane"
    return "zapisane" if g.szkic(firma) else "brak"


def nowosci(g: GraSilnika) -> dict:
    """Nowe w bieżącej rundzie: pierwsze kroki (runda 1) albo odblokowania z tego tygodnia."""
    r = g.runda
    if g.zakonczona:
        return {"pierwsze_kroki": False, "pozycje": []}
    if r <= g.runda_startowa:
        return {
            "pierwsze_kroki": True,
            "pozycje": [{"nazwa": n, "opis": o} for n, o in PIERWSZE_KROKI],
        }
    pozycje = [
        {"nazwa": e["nazwa"], "grupa": e["grupa"]} for e in hm.widok(g.dane, r) if e["tydzien"] == r
    ]
    return {"pierwsze_kroki": False, "pozycje": pozycje}


def funkcje_gry(g: GraSilnika, firmy: list[str] | None) -> dict | list | None:
    """Funkcje gry (seria „funkcje”, J8). Gra bez funkcji (stare gry, dane bez rejestru) – None.

    Uczeń (`firmy` – jego drużyny): lista {klucz, nazwa, krotko, ikona, stan, odslonieta};
    odsłonięcie liczy pierwsza z jego drużyn w tej grze.
    Mistrz gry (`firmy` None): {"lista": [{…, "zakryta"}], "liczby": {stan: n},
    "druzyny": [{"firma", "odsloniete": [klucze]}]} – kto co odsłonił (stan do bieżącej rundy)."""
    konf = g.konfiguracja
    rej = fn.rejestr(g.dane)
    if not konf.get("funkcje") or not rej:
        return None
    r = g.runda
    lista = [
        {
            "klucz": k,
            "nazwa": f["nazwa"],
            "krotko": f.get("krotko", ""),
            "ikona": f.get("ikona"),
            "stan": fn.stan(konf, k),
        }
        for k, f in rej.items()
    ]
    if firmy is not None:
        for f in lista:
            f["odslonieta"] = bool(firmy) and fn.odslonieta(konf, firmy[0], f["klucz"], r)
        return lista
    for f in lista:
        f["zakryta"] = rej[f["klucz"]].get("zakryta", "")
    zakryte = [f["klucz"] for f in lista if f["stan"] == fn.ZAKRYTA]
    return {
        "lista": lista,
        "liczby": {s: sum(1 for f in lista if f["stan"] == s) for s in fn.STANY},
        "druzyny": [
            {
                "firma": x["nazwa"],
                "odsloniete": [k for k in zakryte if fn.odslonieta(konf, x["nazwa"], k, r)],
            }
            for x in konf["firmy"]
            if not x["bot"]
        ],
    }


def _druzyna(
    g: GraSilnika, firma: str, sklad: list[dict], stan=None, miejsce: dict | None = None
) -> dict:
    d = {
        "firma": firma,
        "sklad": sklad,
        "status": status_decyzji(g, firma),
        "indeks": next(i for i, f in enumerate(g.konfiguracja["firmy"]) if f["nazwa"] == firma),
    }
    if stan is not None:
        d["kolor"] = stan.firmy[firma].kolor or None
    if miejsce is not None:
        d["miejsce"] = miejsce.get(firma)
    return d


def karta_gry(id_: str, g: GraSilnika, firmy: list[str] | None) -> dict:
    """Karta gry na pulpicie. `firmy` – drużyny ucznia (pełne dane: kolor, miejsce);
    None – mistrz gry (wszystkie drużyny graczy, tylko status decyzji i skład)."""
    konf = g.konfiguracja
    ludzie = [f["nazwa"] for f in konf["firmy"] if not f["bot"]]
    sklad = druzyny.sklad(id_)
    r = g.runda
    karta = {
        "id": id_,
        "nazwa": konf["nazwa"],
        "runda": r,
        "liczba_rund": konf["liczba_rund"],
        "zakonczona": g.zakonczona,
        "tydzien": g.dane.nazwa_rundy(min(r, konf["liczba_rund"])),
        "ludzie": len(ludzie),
        "boty": len(konf["firmy"]) - len(ludzie),
        "wyslane": len([f for f in g.wyslane() if f in ludzie]),
        "prowadzenie": hg.prowadzenie(id_),
        "nowe": nowosci(g),
        "funkcje": funkcje_gry(g, firmy),   # J8: stany i odsłonięcia (None – bez funkcji)
    }
    if firmy is None:
        karta["druzyny"] = [_druzyna(g, f, sklad.get(f, [])) for f in ludzie]
        return karta
    ostatnia = min(r, konf["liczba_rund"] + 1) - 1
    stan = g.stan(ostatnia)
    miejsce = miejsca(karta_skumulowana(g, ostatnia))
    karta["firm_w_rankingu"] = len(miejsce)
    karta["druzyny"] = [
        _druzyna(g, f, sklad.get(f, []), stan, miejsce) for f in ludzie if f in firmy
    ]
    return karta


def pulpit(user) -> dict:
    """GET /api/pulpit: {"mg": bool, "gry": [karta_gry]}.

    Uczeń dostaje gry swoich drużyn, mistrz gry – wszystkie gry."""
    mg = jest_mg(user)
    moje = None if mg else gry_ucznia(user)
    karty = []
    for x in serwisy.lista():
        if moje is not None and x["id"] not in moje:
            continue
        try:
            g = serwisy.wczytaj(x["id"])
        except Gra.DoesNotExist:  # usunięta w międzyczasie
            continue
        karty.append(karta_gry(x["id"], g, None if mg else sorted(firmy_ucznia(user, x["id"]))))
    return {"mg": mg, "gry": karty}
