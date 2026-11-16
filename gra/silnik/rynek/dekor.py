"""Dekor lokalu (sklep meblowy; dane/mapa/dekor.yaml): styl wnętrza kupowany osobno dla czterech grup elementów.

- Decyzje (silnik/decyzje.py, per lokal jak `wyposazenie_kup`): `dekor_kup: [[grupa, styl], ...]` – płatne od razu
  (księgowane jak zakup wyposażenia), kupiony styl od razu staje się aktywny; `dekor_ustaw: {grupa: styl}` – wybór
  spośród kupionych albo stylu domyślnego (za darmo). Kupione zostaje w lokalu na zawsze: nie starzeje się, nie ma
  kosztu tygodniowego, nie przepada z funkcją (autopilot go nie rusza). Stan: `Lokal.dekor_kupiony`, `Lokal.dekor`.
- Efekt: dopasowanie grupy elementów = suma udziałów w strefie lokalu (mapa/klienci.yaml) tych grup klientów, do których
  trafia aktywny styl. ≥ `prog` – pełny efekt, od `prog_czesciowy` – połowa, niżej – nic. „Punkty dekoru” lokalu to suma
  współczynników (0 / 0,5 / 1) po grupach elementów; dają mnożnik popytu (`1 + efekty.popyt × punkty`, oferta dania:
  `dekor`) i gwiazdki oceny tygodnia (`efekty.ocena × punkty`, opinie.py).
- `wlaczony: false` albo brak pliku – mechanika nie istnieje (decyzje ignorowane, widok pusty).
"""
from __future__ import annotations

from ..dane import Dane
from ..ksiegowosc import srodki_trwale as st_trwale
from ..ksiegowosc.finanse import Ksiega, Rachunek
from ..model import Firma, Lokal
from ..nieruchomosci import per_lokal as pl


def zasady(dane: Dane) -> dict | None:
    """Dane dekoru; None – mechaniki nie ma (brak pliku albo `wlaczony: false`)."""
    d = (dane.mapa or {}).get("dekor")
    return d if d and d["wlaczony"] and (dane.mapa.get("klienci") or None) else None


def aktywny(dane: Dane, lok: Lokal, grupa: str) -> str:
    return lok.dekor.get(grupa) or zasady(dane)["domyslny_styl"]


def udzialy_strefy(dane: Dane, lok_id: str) -> dict[str, float]:
    return dane.mapa["klienci"]["strefy"][dane.lokale[lok_id]["strefa"]]


def dopasowanie(dane: Dane, lok_id: str, styl: str) -> float:
    """Udział klientów strefy lokalu, do których trafia styl (0–1)."""
    udz = udzialy_strefy(dane, lok_id)
    return round(sum(udz.get(g, 0.0) for g in zasady(dane)["style"][styl]["klienci"]), 6)


def wspolczynnik(dane: Dane, dopasowanie_: float) -> float:
    """Pełny efekt (1) od progu, połowa (0,5) od progu częściowego, niżej nic."""
    z = zasady(dane)
    if dopasowanie_ >= z["prog"] - 1e-9:
        return 1.0
    return z["czesc_efektu"] if dopasowanie_ >= z["prog_czesciowy"] - 1e-9 and z["prog_czesciowy"] > 0 else 0.0


def punkty(dane: Dane, lok: Lokal) -> float:
    """Suma współczynników po grupach elementów (0–4) aktywnego dekoru lokalu."""
    if not zasady(dane):
        return 0.0
    return sum(wspolczynnik(dane, dopasowanie(dane, lok.id, aktywny(dane, lok, g))) for g in zasady(dane)["grupy"])


def mnoznik_popytu(dane: Dane, pkt: float) -> float:
    return 1.0 + zasady(dane)["efekty"]["popyt"]["wartosc"] * pkt if pkt else 1.0


def gwiazdki_oceny(dane: Dane, pkt: float) -> float:
    return zasady(dane)["efekty"]["ocena"]["wartosc"] * pkt if pkt else 0.0


def _nazwa(z: dict, grupa: str, styl: str) -> str:
    return f"{z['grupy'][grupa]['nazwa']} – {z['style'][styl]['nazwa']}"


def zastosuj(dane: Dane, firma: Firma, lok: Lokal, kup, ustaw, runda: int, ksiega: Ksiega, rachunek: Rachunek,
             info: dict) -> None:
    """Zakupy (od razu z gotówki, jak wyposażenie) i ustawienia dekoru jednego lokalu; błędy – po polsku do
    `info["uwagi_dekoru"]`. Bez mechaniki – nic."""
    z = zasady(dane)
    if not z:
        return
    uwagi = info.setdefault("uwagi_dekoru", [])
    domyslny = z["domyslny_styl"]
    for para in kup or []:
        if not isinstance(para, (list, tuple)) or len(para) != 2:
            uwagi.append("Dekor: zakup wymaga pary [grupa elementów, styl] – pominięto.")
            continue
        grupa, styl = para
        if grupa not in z["grupy"] or styl not in z["style"]:
            uwagi.append("Dekor: nie ma takiego elementu albo stylu – zakup pominięto.")
        elif styl == domyslny:
            uwagi.append(f"Dekor: styl {z['style'][styl]['nazwa']} jest darmowy – nie trzeba go kupować.")
        elif styl in lok.dekor_kupiony.get(grupa, []):
            uwagi.append(f"Dekor: {_nazwa(z, grupa, styl)} jest już kupiony – drugi raz nie kupisz.")
        else:
            cena = z["grupy"][grupa]["cena"]["wartosc"]
            lok.dekor_kupiony.setdefault(grupa, []).append(styl)
            lok.dekor[grupa] = styl
            # księgowanie jak zakup wyposażenia (środek trwały od progu amortyzacji, poniżej – koszt od razu)
            info["inwestycje_w_koszty"] += st_trwale.zakup(
                dane, firma, ksiega, rachunek, f"Koszt zakupu: dekor {_nazwa(z, grupa, styl)}",
                pl.nazwa_srodka(firma, lok, f"Dekor: {_nazwa(z, grupa, styl)}"), "wyposazenie", cena, runda)
            firma.majatek += cena
            info["inwestycje"] += cena
    for grupa, styl in (ustaw or {}).items():
        if grupa not in z["grupy"] or styl not in z["style"]:
            uwagi.append("Dekor: nie ma takiego elementu albo stylu – ustawienie pominięto.")
        elif styl != domyslny and styl not in lok.dekor_kupiony.get(grupa, []):
            uwagi.append(f"Dekor: {_nazwa(z, grupa, styl)} nie jest kupiony – najpierw kup go w sklepie meblowym.")
        else:
            lok.dekor[grupa] = styl


def widok(dane: Dane, firma: Firma) -> dict:
    """Widok dla gracza: katalog (grupy, style, ceny, progi) i dekor każdego lokalu drużyny; pusty, gdy mechaniki nie ma."""
    z = zasady(dane)
    if not z:
        return {}
    katalog = {"prog": z["prog"], "prog_czesciowy": z["prog_czesciowy"], "domyslny_styl": z["domyslny_styl"],
               "grupy": {g: {"nazwa": x["nazwa"], "cena": x["cena"]["wartosc"], "opis": x["opis"]}
                         for g, x in z["grupy"].items()},
               "style": {s: {"nazwa": x["nazwa"], "opis": x["opis"], "klienci": list(x["klienci"])}
                         for s, x in z["style"].items()}}
    lokale = {}
    for lok in firma.lokale:
        lokale[lok.id] = {
            "kupione": {g: list(lok.dekor_kupiony.get(g, [])) for g in z["grupy"]},
            "aktywne": {g: aktywny(dane, lok, g) for g in z["grupy"]},
            "udzialy": {g: round(x, 4) for g, x in udzialy_strefy(dane, lok.id).items()},
            "dopasowanie": {s: dopasowanie(dane, lok.id, s) for s in z["style"]},
            "punkty": punkty(dane, lok)}
    return {"katalog": katalog, "lokale": lokale}
