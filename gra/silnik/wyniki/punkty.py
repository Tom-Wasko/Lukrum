"""Wynik punktowy (0–1000 pkt): pięć działów po 0–200 pkt według jawnych progów z `dane/zalozenia.yaml: wynik`.

Działy: finanse, goście, zespół, rozwój, bezpieczeństwo finansowe. Każdy dział to kilka składników, a każdy składnik
ma tabelę progów `[[miara, punkty], …]`: punkty rosną liniowo między progami, poniżej pierwszego progu składnik
dostaje punkty pierwszego, a powyżej ostatniego – „ponad” (za każde `za` jednostek `pkt` punktów, najwyżej `maks`).
Dzięki temu wyjątkowa gra (np. bardzo hojny socjal) przekracza 200 pkt w dziale, a wynik – 1000 pkt.
Panel pokazuje uczniowi te same tabele (`tabela`), więc nic nie jest ukryte.

Tydzień 1 to „Wielkie otwarcie”: sprzedaży jeszcze nie ma, więc liczy się przygotowanie (lokal, menu, ekipa,
zaopatrzenie, rezerwa w kasie). Ranking = suma punktów z tygodni z wagami: ostatnie tygodnie ważą więcej
(`wynik.ranking`), a „wynik gry” to suma ważona podzielona przez sumę wag (skala 0–1000).

Zadowolenie gości i zespołu liczą proste, własne wzory punktowe (w torze B zastąpią je gwiazdki gości i nastrój zespołu).
"""
from __future__ import annotations

import numpy as np

from ..dane import Dane
from ..kuchnia import menu
from ..ludzie import zadowolenie as zo

ZERO = 0.0
NIERUCHOMOSCI = ("lokal", "budynek", "grunt")   # rodzaje środków trwałych poza sumą inwestycji firmy
KOLEJKI = ("pracownicy/sprzęt", "kasa")   # przyczyny utraconej sprzedaży z operacje.obsluz – za mało rąk lub sprzętu


def ustawienia(dane: Dane) -> dict:
    return dane.z["wynik"]


def majatek_karty(dane: Dane, f) -> float:
    """Majątek do działu „Rozwój”: suma inwestycji po amortyzacji + kupione lokale, budynki i grunt z ewidencji
    środków trwałych (wartość netto) z wagą `wynik.waga_nieruchomosci`."""
    nieruchomosci = sum(s.wartosc - s.umorzenie for s in f.srodki_trwale if s.rodzaj in NIERUCHOMOSCI)
    return round(f.majatek - f.umorzenie_majatku + ustawienia(dane)["waga_nieruchomosci"] * nieruchomosci, 2)


def udzial_kapitalu(dlug: float, majatek: float, skumulowany_dochod: float, gotowka: float) -> float:
    """Udział kapitału własnego: 1 − dług ÷ (majątek + skumulowany dochód netto + dług + gotówka), od 0 do 1.
    Gotówka na koncie w mianowniku: pożyczka, która leży w kasie, karze mniej niż przejedzona."""
    if dlug <= 0:
        return 1.0
    return round(max(0.0, 1 - dlug / (majatek + max(0.0, skumulowany_dochod) + dlug + max(0.0, gotowka))), 3)


def tabela(dane: Dane) -> dict:
    """Jawne progi dla panelu: działy ze składnikami i tabelami, ocena, otwarcie, wagi rankingu."""
    u = ustawienia(dane)
    return {"dzialy": u["dzialy"], "oceny": u["oceny"], "otwarcie": u["otwarcie"], "ranking": u["ranking"]}


def punkty_skladnika(sk: dict, x: float) -> float:
    """Punkty za miarę `x` według tabeli progów składnika (interpolacja liniowa, „ponad” za ostatnim progiem)."""
    xs, ys = zip(*sk["progi"], strict=True)
    p = float(np.interp(x, xs, ys))
    po = sk.get("ponad")
    if po and x > xs[-1]:
        p += min(po["maks"], po["pkt"] * (x - xs[-1]) / po["za"])
    return round(p, 1)


def _licz(skladniki: dict, miary: dict) -> dict:
    wynik = {}
    for k, sk in skladniki.items():
        x = miary[k]
        wynik[k] = {"nazwa": sk["nazwa"], "miara": round(x, 3), "punkty": punkty_skladnika(sk, x)}
    return wynik


def ocena(dane: Dane, punkty_dzialu: float) -> str:
    sredni, dobry = ustawienia(dane)["oceny"]
    return "dobry" if punkty_dzialu >= dobry * ustawienia(dane)["maks_dzialu"] else "sredni" if punkty_dzialu >= sredni * ustawienia(dane)["maks_dzialu"] else "niski"


def aktywnosc(dane: Dane, klienci: float) -> float:
    """Udział realnej działalności 0–1: obsłużeni goście ÷ `wynik.aktywnosc.pelna_od_klientow`. Firma, która nic nie
    sprzedaje, nie dostaje punktów za zadowolenie gości, zespół i bezpieczeństwo (nie ma czego oceniać)."""
    u = ustawienia(dane).get("aktywnosc")
    return min(1.0, klienci / u["pelna_od_klientow"]) if u else 1.0


def karta(dane: Dane, miary: dict[str, dict[str, float]], wskazniki: dict, klienci: float | None = None) -> dict:
    """Karta tygodnia z miar (`{dział: {składnik: wartość}}`): punkty działów i suma.
    `wskazniki` (zadowolenie gości i zespołu, mnożnik dla popytu) dochodzi do karty bez zmian.
    `klienci` – obsłużeni goście tygodnia: punkty działów z `wynik.aktywnosc.dzialy` rosną proporcjonalnie do nich."""
    dzialy = {}
    u = ustawienia(dane).get("aktywnosc")
    a = 1.0 if klienci is None else aktywnosc(dane, klienci)
    for d, opis in ustawienia(dane)["dzialy"].items():
        sk = _licz(opis["skladniki"], miary[d])
        if u and d in u["dzialy"] and a < 1.0:
            for x in sk.values():
                x["punkty"] = round(x["punkty"] * a, 1)
        suma = round(sum(x["punkty"] for x in sk.values()), 1)
        dzialy[d] = {"nazwa": opis["nazwa"], "punkty": suma, "ocena": ocena(dane, suma), "skladniki": sk}
    return {"punkty": round(sum(x["punkty"] for x in dzialy.values()), 1), "dzialy": dzialy, "wskazniki": wskazniki}


def karta_otwarcia(dane: Dane, miary: dict[str, float]) -> dict:
    """Karta tygodnia 1 („Wielkie otwarcie”): punkty za przygotowanie."""
    o = ustawienia(dane)["otwarcie"]
    sk = _licz(o["skladniki"], miary)
    return {"punkty": round(sum(x["punkty"] for x in sk.values()), 1), "otwarcie": True,
            "dzialy": {}, "przygotowanie": sk, "wskazniki": {}}


# --- miary tygodnia ---------------------------------------------------------------------------------------------


def _udzial(x: float, od: float, do: float) -> float:
    return min(1.0, max(0.0, (x - od) / (do - od)))


def zadowolenie_gosci(dane: Dane, m: dict) -> float:
    """Zadowolenie gości 0–100 z miar tygodnia `m` (zob. `wynik.goscie`):
    jakość dania (mnożnik jakości 0…1 w zakresie jakosc_od…jakosc_do), cena względem ceny strefy, kolejki, braki dań,
    kary za mandat, wypadki i pomyłki w szczycie."""
    g = ustawienia(dane)["goscie"]
    p = g["baza"] + g["jakosc"] * _udzial(m["jakosc"], g["jakosc_od"], g["jakosc_do"])
    p += g["cena"] * (1 - _udzial(m["cena_wzgledem_strefy"], g["cena_tania"], g["cena_droga"]))
    p += g["czekanie"] * (1 - min(1.0, m["kolejki"] / g["czekanie_zero_przy"]))
    p += g["braki"] * (1 - min(1.0, m["brakujace_dania"] / g["braki_zero_przy"]))
    p += g["mandat"] * (m["mandat"] > 0) + g["wypadek"] * m["wypadki"] + g["pomylki"] * m.get("pomylki", ZERO)
    return round(min(100.0, max(ZERO, p)), 1)


def cena_wzgledem_strefy(dane: Dane, sprzedane: dict) -> float:
    """Średnia (ważona klientami) cena po rabacie ÷ cena preferowana dania w strefie lokalu (lokale ważone popytem)."""
    klienci = sum(v["sprzedaz"] for v in sprzedane.values())
    if not klienci:
        return 1.0
    strefy = dane.mapa["popyt"]["strefy"]
    suma = 0.0
    for u, v in sprzedane.items():
        lok = v["skladniki_popytu"].get("lokale") or {}
        waga = sum(lok.values())
        mn = sum(n * strefy[dane.lokale[x]["strefa"]]["cena"] for x, n in lok.items()) / waga if waga else 1.0
        suma += v["sprzedaz"] * v["cena_po_rabacie"] / (dane.uslugi[u]["cena_preferowana"] * mn)
    return suma / klienci


def miary_gosci(dane: Dane, f, w: dict, sprzedaz: dict) -> dict:
    """Miary gości z wyników tygodnia: jakość, cena, kolejki, braki dań, mandat, wypadki, pomyłki w szczycie."""
    sprzedane = {u: v for u, v in sprzedaz.items() if v["sprzedaz"] > 0}
    klienci = sum(v["sprzedaz"] for v in sprzedane.values())
    popyt = sum(v["popyt"] for v in sprzedaz.values())
    dni = len((w.get("klienci") or {}).get("dni") or [])
    dania_dni = sum(len(lok.menu if lok.menu is not None else f.oferta) for lok in f.lokale) * dni
    wylaczone = (w.get("swiezosc") or {}).get("wylaczone") or []
    return {
        "jakosc": sum(v["sprzedaz"] * menu.jakosc_dania(dane, v["jakosc"]) for v in sprzedane.values()) / klienci
        if klienci else ZERO,
        "cena_wzgledem_strefy": cena_wzgledem_strefy(dane, sprzedane),
        "kolejki": sum(v["utracona"] for v in sprzedaz.values() if v["przyczyna"] in KOLEJKI) / popyt
        if popyt else ZERO,
        "brakujace_dania": min(1.0, len(wylaczone) / dania_dni) if dania_dni else ZERO,
        "mandat": float(((w.get("urzad") or {}).get("kontrola") or {}).get("mandat") or 0),
        "wypadki": len((w.get("zdarzenia") or {}).get("szkody") or []),
        "pomylki": sum(v.get("pomylki", 0) for v in sprzedaz.values()) / klienci if klienci else ZERO,
        "klienci": klienci,
        "popyt": popyt,
    }


def zadowolenie_zespolu(dane: Dane, f, prac: list[dict], szkolenia_procent: float) -> dict:
    """Średnie zadowolenie osób (silnik/ludzie/zadowolenie.py) i średnie przepracowanie (ponad próg obciążenia)."""
    if not prac:
        return {"nastroj": ZERO, "przepracowanie": ZERO}
    prog = dane.z["zadowolenie_osoby"]["wspolczynniki"]["prog_przepracowania"]
    nastroje = [zo.zadowolenie(dane, zo.skladniki(dane, f, f.pracownicy[x["id"]], x["wykorzystanie"], szkolenia_procent))
                for x in prac]
    return {"nastroj": float(np.mean(nastroje)),
            "przepracowanie": float(np.mean([max(ZERO, x["wykorzystanie"] - prog) for x in prac]))}


# --- ranking ----------------------------------------------------------------------------------------------------


def waga_tygodnia(dane: Dane, r: int, liczba_rund: int) -> float:
    """Waga tygodnia r w rankingu: 1 – „Wielkie otwarcie”, 2…ostatni – liniowo od pierwszej do ostatniej wagi."""
    if r <= 1:
        return ustawienia(dane)["otwarcie"]["waga_tygodnia"]
    u = ustawienia(dane)["ranking"]
    ile = max(1, liczba_rund - 2)
    return u["waga_pierwszego_pelnego"] + (u["waga_ostatniego"] - u["waga_pierwszego_pelnego"]) * min(1.0, (r - 2) / ile)


def ranking(dane: Dane, punkty_tygodni: dict[int, float], liczba_rund: int) -> dict:
    """Ranking firmy z punktów tygodni `{r: punkty}`: suma ważona i wynik gry (0–1000) = suma ważona ÷ suma wag."""
    wagi = {r: waga_tygodnia(dane, r, liczba_rund) for r in punkty_tygodni}
    suma_wag = sum(wagi.values())
    suma = sum(wagi[r] * p for r, p in punkty_tygodni.items())
    return {"suma_wazona": round(suma, 1), "wynik": round(suma / suma_wag, 1) if suma_wag else ZERO}
