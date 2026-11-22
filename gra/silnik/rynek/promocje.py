"""Promocje w grze z lokalami (notatka „Prawidła świata”): rodzaje z listy (`dane/mapa/promocje.yaml`) z ozdobną
nazwą drużyny, która nie wpływa na wynik.

- Decyzja `promocje: [{"typ", "nazwa", "danie"}]` – pełna lista włączonych promocji (brak klucza – bez zmian).
  Nowa promocja kosztuje `koszt_startu` (plakaty, karty; VAT 23%), trwająca (ten sam rodzaj i danie) zachowuje rundę
  startu – zmiana nazwy nic nie kosztuje. Najwyżej `limit_aktywnych` naraz, każdy rodzaj raz, od rundy `od_rundy`.
- Popyt (`efekty_ofert` → oferta dania `promocje`, popyt.podzial): objęci promocją klienci (dni tygodnia i strefy
  klientów z danych) widzą lokal jako atrakcyjniejszy o `przyciaganie` (z każdą rundą trwania zmienia się o
  `przyrost`). Podział zwraca objętych klientów (`objeci`) – z nich `porcje` (2 za 1: dwie porcje na klienta,
  podwójne składniki i czas kuchni) i `rozlicz`: przychód z rabatem, dopłaty (zestaw) i koszt dodatków.
- Pamięć klientów (decyzja autora 7.11.2026; sekcja `pamiec`): po wyłączeniu promocji część `udzial` jej
  przyciągania z ostatniego tygodnia zostaje w `Firma.pamiec_promocji` i działa dalej (te same dni, strefy i danie,
  bez rabatu – efekt `PAMIEC + typ` w ofercie), co rundę × (1 − zanik). Ponowne zakończenie tej samej promocji
  dodaje się do resztki pamięci; suma pamięci firmy najwyżej `maks`; pamięć trwającej znów promocji czeka (bez
  podwójnego liczenia). Reklama ma własne wygasanie (reklama.py) – pamięć promocji liczy się tylko z promocji.
"""
from __future__ import annotations

import numpy as np

from ..dane import Dane
from ..ksiegowosc.finanse import Ksiega, Rachunek, ksieguj
from ..kuchnia import menu as mn
from ..losowosc import strumien
from ..model import Firma, PamiecPromocji, Promocja

OPIS_STARTU = "Materiały promocyjne"
OPIS_DODATKOW = "Napoje do zestawów"
OPIS_DOPLAT = "Sprzedaż: napoje w zestawach promocyjnych"
ZAKLADKA = "promocje"
PAMIEC = "pamiec:"   # przedrostek typu efektu pamięci w ofercie (osobno od trwającej promocji tego rodzaju)


def zasady(dane: Dane) -> dict | None:
    """mapa/promocje.yaml (od_rundy, limit_aktywnych, typy); None – dane bez promocji."""
    return (dane.mapa or {}).get("promocje")


def przyciaganie(typ: dict, od_rundy: int, runda: int) -> float:
    """Przyciąganie w rundzie: z każdą rundą trwania o `przyrost` (znużenie albo przywiązanie klientów)."""
    p = typ["przyciaganie"] + typ["przyrost"] * (runda - od_rundy)
    return round(min(typ["przyciaganie_max"], max(typ["przyciaganie_min"], p)), 4)


def zasady_pamieci(dane: Dane) -> dict | None:
    """mapa/promocje.yaml → pamiec (udzial, zanik, maks, prog); None – bez pamięci (brak sekcji albo udzial 0)."""
    P = (zasady(dane) or {}).get("pamiec")
    return P if P and P["udzial"] > 0 else None


def sila_pamieci(P: dict, m: PamiecPromocji, runda: int) -> float:
    """Przyciąganie z pamięci w rundzie: sila × (1 − zanik)^(rund od pierwszej rundy po promocji); poniżej progu – 0."""
    if runda < m.od_rundy:
        return 0.0
    s = m.sila * (1 - P["zanik"]) ** (runda - m.od_rundy)
    return round(s, 4) if s >= P["prog"] else 0.0


def _zapamietaj(dane: Dane, f: Firma, p: Promocja, runda: int) -> None:
    """Promocja p wyłączona w rundzie `runda` (ostatni tydzień – runda − 1): klienci pamiętają część przyciągania;
    pamięć tej samej promocji (rodzaj, danie) dodaje się do resztki dawnej, najwyżej `maks`."""
    P, typ = zasady_pamieci(dane), zasady(dane)["typy"].get(p.typ)
    if P is None or typ is None or p.od_rundy >= runda:
        return
    sila = P["udzial"] * przyciaganie(typ, p.od_rundy, runda - 1)
    stara = next((m for m in f.pamiec_promocji if (m.typ, m.danie) == (p.typ, p.danie)), None)
    if stara is not None:
        sila += sila_pamieci(P, stara, runda)
        f.pamiec_promocji.remove(stara)
    if sila >= P["prog"]:
        f.pamiec_promocji.append(PamiecPromocji(typ=p.typ, danie=p.danie, sila=round(min(P["maks"], sila), 4),
                                                od_rundy=runda))


def pamiec(dane: Dane, f: Firma, runda: int) -> list[tuple[PamiecPromocji, float]]:
    """Działająca w rundzie pamięć firmy: [(wpis, przyciąganie)] – bez pamięci trwającej znów promocji (rodzaj,
    danie), suma najwyżej `maks` (proporcjonalnie)."""
    P, R = zasady_pamieci(dane), zasady(dane)
    if P is None or not f.pamiec_promocji:
        return []
    trwa = {(p.typ, p.danie) for p in f.promocje}
    lista = [(m, sila_pamieci(P, m, runda)) for m in f.pamiec_promocji
             if (m.typ, m.danie) not in trwa and m.typ in R["typy"]]
    lista = [(m, s) for m, s in lista if s > 0]
    suma = sum(s for _, s in lista)
    skala = min(1.0, P["maks"] / suma) if suma else 1.0
    return [(m, round(s * skala, 4)) for m, s in lista]


def _nazwa(R: dict, typ: dict, x: dict) -> str:
    return " ".join(str(x.get("nazwa") or "").split())[:R["nazwa_max"]] or typ["nazwa"]


def ustaw(dane: Dane, f: Firma, d: dict, runda: int, ks: Ksiega, rach: Rachunek) -> dict:
    """Promocje z decyzji (po cenach – danie musi być w sprzedaży). Zwraca {"aktywne", "nowe", "wylaczone", "uwagi"}."""
    R = zasady(dane)
    info = {"aktywne": [], "nowe": [], "wylaczone": [], "uwagi": []}
    if not R:
        return info
    P = zasady_pamieci(dane)   # wygasła pamięć znika ze stanu
    f.pamiec_promocji = [m for m in f.pamiec_promocji if P is not None and sila_pamieci(P, m, runda) > 0]
    if "promocje" in d:
        stare = {(p.typ, p.danie): p for p in f.promocje}
        nowe, typy = [], set()
        for x in d.get("promocje") or []:
            t = x.get("typ")
            typ = R["typy"].get(t)
            if typ is None:
                info["uwagi"].append(f"Nieznana promocja: {t}.")
                continue
            danie = x.get("danie") if typ["zakres"] == "danie" else None
            if not f.lokale:
                info["uwagi"].append(f"{typ['nazwa']}: promocje są dla firm z lokalem.")
            elif runda < R["od_rundy"]:
                info["uwagi"].append(f"{typ['nazwa']}: promocje od rundy {R['od_rundy']}.")
            elif typ["zakres"] == "danie" and not danie:
                info["uwagi"].append(f"{typ['nazwa']}: wybierz danie.")
            elif typ["zakres"] == "danie" and danie not in f.ceny:
                info["uwagi"].append(f"{typ['nazwa']}: danie {mn.nazwa_dania(dane, danie, firma=f)} "
                                     "nie jest w sprzedaży.")
            elif t in typy:
                info["uwagi"].append(f"{typ['nazwa']}: ten rodzaj promocji już jest włączony.")
            elif len(nowe) >= R["limit_aktywnych"]:
                info["uwagi"].append(f"{typ['nazwa']} „{_nazwa(R, typ, x)}”: najwyżej {R['limit_aktywnych']} promocje naraz.")
            else:
                typy.add(t)
                p = stare.get((t, danie))
                nowe.append(Promocja(typ=t, nazwa=_nazwa(R, typ, x), danie=danie, od_rundy=p.od_rundy if p else runda))
        f.promocje = nowe
        trwa = {(p.typ, p.danie) for p in nowe}
        info["wylaczone"] = [p.model_dump() for k, p in stare.items() if k not in trwa]
        for k, p in stare.items():
            if k not in trwa:
                _zapamietaj(dane, f, p, runda)
        for p in nowe:
            if p.od_rundy == runda and (p.typ, p.danie) not in stare:
                typ = R["typy"][p.typ]
                opis = f"{OPIS_STARTU}: {typ['nazwa']} „{p.nazwa}”"
                stawka = ks.stawka_vat(opis) if ks.vat is not None else 0.0
                brutto = round(typ["koszt_startu"] * (1 + stawka), 2)
                if brutto:
                    ksieguj(f, ks, rach, opis, brutto, "pozostale")
                info["nowe"].append({**p.model_dump(), "brutto": brutto})
    for p in [p for p in f.promocje if p.danie is not None and p.danie not in f.ceny]:
        f.promocje.remove(p)
        _zapamietaj(dane, f, p, runda)
        info["wylaczone"].append(p.model_dump())
        info["uwagi"].append(f"{R['typy'][p.typ]['nazwa']} „{p.nazwa}”: danie zdjęte ze sprzedaży – promocja wyłączona.")
    info["aktywne"] = [p.model_dump() for p in f.promocje]
    return info


def efekty_ofert(dane: Dane, f: Firma, oferty_firmy: dict[str, dict[str, dict]], runda: int, dni: list,
                 z_pamiecia: bool = True) -> None:
    """Dopisuje do ofert dań firmy ({lokal: {danie: oferta}}) trwające promocje: oferta["promocje"] – lista efektów
    z maską dni rundy (`dni` – daty rundy, z popyt.dni_rundy). z_pamiecia – także pamięć klientów po promocjach (
    bez niej – prognozy z danych publicznych: pamięci konkurencji nie widać na mieście)."""
    R = zasady(dane)
    if not R or not (f.promocje or f.pamiec_promocji):
        return

    def maska(typ: dict) -> np.ndarray:
        return np.array([1.0 if typ["dni"] is None or d.weekday() in typ["dni"] else 0.0 for d in dni])

    def dopisz(e: dict, danie: str | None) -> None:
        for dania in oferty_firmy.values():
            for u, o in dania.items():
                if danie is None or danie == u:
                    o.setdefault("promocje", []).append(e)

    for p in f.promocje:
        typ = R["typy"].get(p.typ)
        if typ is None:
            continue
        dopisz({"typ": p.typ, "nazwa": p.nazwa, "rabat": typ["rabat"], "porcje": typ["porcje"], "doplata": typ["doplata"],
                "koszt_dodatku": typ["koszt_dodatku"], "strefy": typ["strefy_klientow"], "maska": maska(typ),
                "przyciaganie": przyciaganie(typ, p.od_rundy, runda)}, p.danie)
    for m, s in pamiec(dane, f, runda) if z_pamiecia else []:   # tylko przyciąganie – bez rabatu i dopłat
        typ = R["typy"][m.typ]
        dopisz({"typ": PAMIEC + m.typ, "nazwa": typ["nazwa"], "rabat": 0.0, "porcje": 1, "doplata": 0.0,
                "koszt_dodatku": 0.0, "strefy": typ["strefy_klientow"], "maska": maska(typ), "przyciaganie": s}, m.danie)


def porcje(klienci: float, objeci: dict[str, float], efekty: list[dict]) -> float:
    """Porcje do przygotowania: objęci promocją z `porcje` > 1 biorą więcej."""
    return klienci + sum(objeci.get(e["typ"], 0.0) * (e["porcje"] - 1) for e in efekty)


def rozlicz(sprzedane: int, cena: float, klienci: float, objeci: dict[str, float], efekty: list[dict]) -> dict:
    """Sprzedane porcje (lokal, dzień, danie) → {"przychod" (brutto, bez dopłat), "doplaty", "koszt_dodatkow" (netto),
    "typy": {typ: {"objeci", "rabat", "gratis", "doplaty"}}}. Udział objętych – jak w popycie dnia."""
    c = {e["typ"]: (objeci.get(e["typ"], 0.0) / klienci if klienci else 0.0) for e in efekty}
    q = 1 + sum(c[e["typ"]] * (e["porcje"] - 1) for e in efekty)
    mnoznik = 1.0
    for e in efekty:
        mnoznik *= 1 - c[e["typ"]] + c[e["typ"]] * e["porcje"] * (1 - e["rabat"])
    obsluzeni = sprzedane / q
    typy = {}
    for e in efekty:
        n = obsluzeni * c[e["typ"]]
        typy[e["typ"]] = {"objeci": n, "rabat": n * cena * (1 - e["porcje"] * (1 - e["rabat"])),
                          "gratis": n * (e["porcje"] - 1), "doplaty": n * e["doplata"], "koszt_dodatkow": n * e["koszt_dodatku"]}
    return {"przychod": obsluzeni * cena * mnoznik, "doplaty": sum(t["doplaty"] for t in typy.values()),
            "koszt_dodatkow": sum(t["koszt_dodatkow"] for t in typy.values()), "typy": typy}


def ksieguj_sprzedaz(dane: Dane, f: Firma, ks: Ksiega, rach: Rachunek, wynik: dict, stawka_dodatkow: float | None) -> None:
    """Dopłaty do zestawów (sprzedaż napojów) i zakup napojów do zestawów (towary, VAT wg reguł)."""
    if wynik["doplaty"] >= 0.005:
        ksieguj(f, ks, rach, OPIS_DOPLAT, wynik["doplaty"], "przychod", stawka=stawka_dodatkow)
    if wynik["koszt_dodatkow"] >= 0.005:
        stawka = ks.stawka_vat(OPIS_DODATKOW) if ks.vat is not None else 0.0
        ksieguj(f, ks, rach, OPIS_DODATKOW, round(wynik["koszt_dodatkow"] * (1 + stawka), 2), "towary")


def raport(dane: Dane, f: Firma, nazwa_firmy: str, runda: int, wynik: dict | None, info: dict, ziarno=None) -> dict:
    """Wyniki promocji firmy w rundzie: trwające z liczbami (objęci, rabat, porcje gratis, dopłaty), komiczny tekst
    z pierwszej rundy promocji (z ziarnem), wyłączone."""
    R = zasady(dane)
    typy = (wynik or {}).get("typy", {})
    lista = []
    for p in f.promocje:
        typ = R["typy"].get(p.typ)
        if typ is None:
            continue
        t = typy.get(p.typ, {})
        x = {**p.model_dump(), "rodzaj": typ["nazwa"], "przyciaganie": przyciaganie(typ, p.od_rundy, runda),
             "rund": runda - p.od_rundy + 1, **{k: round(t.get(k, 0.0), 2) for k in ("rabat", "doplaty", "koszt_dodatkow")},
             "objeci": int(round(t.get("objeci", 0.0))), "gratis": int(round(t.get("gratis", 0.0)))}
        if p.od_rundy == runda and ziarno is not None:
            rng = strumien(ziarno, runda, "promocje", nazwa_firmy, p.typ)
            danie = dane.uslugi[p.danie]["nazwa"] if p.danie else ""   # tekst widzą rywale – nazwa ogólna dania
            x["tekst"] = typ["teksty"][int(rng.integers(len(typ["teksty"])))].format(nazwa=p.nazwa, danie=danie)
        lista.append(x)
    return {"promocje": lista, "nowe": info.get("nowe", []), "wylaczone": info.get("wylaczone", []),
            "pamiec": _pamiec_widok(dane, f, runda, typy),
            "przychod": round(sum((wynik or {}).get("przychod", {}).values()), 2) if wynik else 0.0}


def _pamiec_widok(dane: Dane, f: Firma, runda: int, typy: dict | None = None) -> list[dict]:
    """Pamięć klientów do zakładki: rodzaj, danie, przyciąganie w rundzie, ostatnia runda promocji, objęci
    (z wyników rundy)."""
    R = zasady(dane)
    return [{"typ": m.typ, "rodzaj": R["typy"][m.typ]["nazwa"], "danie": m.danie, "przyciaganie": s,
             "po_rundzie": m.od_rundy - 1, "objeci": int(round((typy or {}).get(PAMIEC + m.typ, {}).get("objeci", 0.0)))}
            for m, s in pamiec(dane, f, runda)]


def publiczne(dane: Dane, firmy: dict[str, Firma]) -> dict:
    """Promocje na mieście (dane rynku): {firma: [{"typ", "rodzaj", "nazwa", "danie", "od_rundy"}]}."""
    R = zasady(dane)
    if not R:
        return {}
    return {n: [{"typ": p.typ, "rodzaj": R["typy"][p.typ]["nazwa"], "nazwa": p.nazwa, "danie": p.danie,
                 "od_rundy": p.od_rundy} for p in f.promocje if p.typ in R["typy"]]
            for n, f in sorted(firmy.items()) if f.promocje}


def widok(dane: Dane, f: Firma, runda: int, rynek_poprzedni: dict | None, info: dict | None) -> dict:
    """Zakładka Promocje: rodzaje z liczbami, włączone (z decyzji), dania w sprzedaży, promocje konkurencji."""
    R = zasady(dane)
    nazwy_dni = dane.mapa["popyt"]["dni_tygodnia"]["nazwy"]
    rodzaje = []
    for t, typ in R["typy"].items():
        rodzaje.append({"id": t, "nazwa": typ["nazwa"], "opis": typ["opis"], "zakres": typ["zakres"],
                        "dni": [nazwy_dni[d] for d in typ["dni"]] if typ["dni"] is not None else None,
                        "strefy": [dane.mapa["strefy"][s]["nazwa"] for s in typ["strefy_klientow"] or []] or None,
                        **{k: typ[k] for k in ("rabat", "porcje", "doplata", "koszt_dodatku", "przyciaganie", "przyrost",
                                               "przyciaganie_min", "przyciaganie_max", "koszt_startu")}})
    aktywne = []
    for p in f.promocje:
        typ = R["typy"].get(p.typ)
        if typ:
            aktywne.append({**p.model_dump(), "rodzaj": typ["nazwa"], "przyciaganie": przyciaganie(typ, p.od_rundy, runda),
                            "nowa": p.od_rundy == runda})
    konk = {n: x for n, x in ((rynek_poprzedni or {}).get("promocje") or {}).items() if n != f.nazwa}
    P = zasady_pamieci(dane)
    return {"od_rundy": R["od_rundy"], "limit": R["limit_aktywnych"], "nazwa_max": R["nazwa_max"], "rodzaje": rodzaje,
            "aktywne": aktywne, "pamiec": _pamiec_widok(dane, f, runda),
            "pamiec_zasady": {k: P[k] for k in ("udzial", "zanik", "maks")} if P else None, "dania": [{"id": u, "nazwa": mn.nazwa_dania(dane, u, firma=f)} for u in f.ceny if u in dane.uslugi],
            "nowe": (info or {}).get("nowe", []), "konkurencja": konk}


__all__ = ["OPIS_DODATKOW", "OPIS_DOPLAT", "OPIS_STARTU", "PAMIEC", "ZAKLADKA", "efekty_ofert", "ksieguj_sprzedaz",
           "pamiec", "porcje", "przyciaganie", "publiczne", "raport", "rozlicz", "sila_pamieci", "ustaw", "widok",
           "zasady", "zasady_pamieci"]
