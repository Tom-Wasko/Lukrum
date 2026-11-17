"""Giełda handlu (gra z lokalami, sprawa 19 autora; dane/zdarzenia/handel.yaml; notatka „Prawidła świata”).

Rynek wspólny dla wszystkich drużyn i botów: każdy może wystawić ogłoszenie, każdy (poza sprzedawcą) licytuje.

Oś czasu (ogłoszenie z rundy r jest licytowane przez całą rundę r+1):
1. Runda r – drużyna wpisuje ogłoszenia w decyzji `handel_wystaw`: [{typ: "towar", zasob, jakosc, ilosc, cena_min}]
   albo [{typ: "sprzet", stanowisko, nr, nazwa, cena_min}] (cena wywoławcza brutto za całość). Inne drużyny widzą
   je od razu jako zapowiedzi (na żywo, silnik/na_zywo.py), licytować jeszcze nie mogą.
2. Koniec przeliczenia r (po tygodniu sprzedaży, `zamknij`): ogłoszenia są sprawdzane – sprzedawca musi mieć towar
   w magazynie albo sprzęt na stanowisku (nie z najmu lokalu, nie w leasingu), najwyżej `maks_ogloszen`, cena
   wywoławcza w widełkach `cena_min`–`cena_maks` × wartość (towar – koszt zakupu, sprzęt – cena katalogowa nowego).
   Wtedy wystawiają też boty (nadwyżki towaru i niepotrzebny sprzęt) i ustalają swoje limity cen.
3. Runda r+1 – licytacja na żywo, decyzja `handel_licytuj`: {id ogłoszenia: kwota}. Licytacja jest jawna: każdy
   widzi prowadzącego i cenę. Kolejna oferta musi przebić prowadzącą cenę co najmniej o `krok_przebicia`
   (kontrola przy zapisie – `kontrola_licytacji`); oferty nie można obniżyć ani wycofać, sprzedawca nie licytuje.
4. Początek przeliczenia r+1 (`rozstrzygnij`, przed zakupami): wygrywa najwyższa oferta – transakcja po jej cenie,
   jeśli sprzedawca nadal ma towar albo sprzęt, a kupujący pieniądze na koncie (gdy nie ma – wygrywa następny).
   Ogłoszenie bez ofert wygasa.

Boty licytują „z limitem” (jak licytacja z automatycznym przebijaniem na portalach aukcyjnych): po wystawieniu
ogłoszeń bot, który używa danej rzeczy, ustala najwyższą cenę – `limit_handlu` poziomu (dane/boty.yaml) × wartość,
razem najwyżej gotówka ponad `rezerwa_gotowki`. Limitu nikt nie widzi; w licytacji bot stoi na najniższej cenie,
która przebija resztę (najwyżej limit), więc drużyna od razu widzi, że bot prowadzi, i może go przebić w tej
samej rundzie. Przy równych kwotach drużyna wygrywa z botem. Wybór limitu zamiast ofert bota przy zamknięciu:
drużyna zna stan licytacji, zanim runda się skończy (bot nie „podbiera” w ostatniej chwili), a limit liczony
raz po rundzie r jest deterministyczny – licytacja na żywo nie potrzebuje przeliczania botów przy każdym zapisie.

Bot kupuje towar, którego używa w swoich daniach, w swojej jakości, z terminem co najmniej `min_dni_terminu` od
początku rundy licytacji i tylko do `zapas_tygodni` tygodni zużycia; sprzęt – potrzebny w daniach, gdy ma
stanowisko kuchni bez niego. Wystawia nadwyżkę towaru ponad `zapas_tygodni` tygodni zużycia (towar, którego nie
używa – cały), o wartości od `min_wartosc`, i sprzęt kuchni, którego nie potrzebuje żadne jego danie (gdy ma już
pełną kartę; bez chłodni i zamrażarek), po cenie wywoławczej `boty.cena_min` × wartość, najwyżej `boty.maks_ogloszen`.

Faktury w KPiR obu stron: towar – u sprzedawcy przychód ze sprzedaży (kol. 7, VAT należny wg stawki składnika),
u kupującego zakup towarów (kol. 10, VAT naliczony); partie przechodzą z terminem przydatności (najkrótszy
pierwszy) i są dostarczane w poniedziałek rundy jak dostawa (miejsce w chłodni – silnik/kuchnia/swiezosc.py). Sprzęt –
u sprzedawcy jak sprzedaż sprzętu (pozostałe przychody, niezamortyzowana wartość w koszty), u kupującego jak zakup
(środek trwały od progu amortyzacji), na pierwsze stanowisko tego typu bez takiego sprzętu.
"""
from __future__ import annotations

import math
from datetime import date, timedelta

from .. import na_zywo as nz
from ..dane import KUCHNIA, Dane
from ..ksiegowosc import rozliczenie as rz
from ..ksiegowosc import srodki_trwale as st_trwale
from ..ksiegowosc.finanse import Ksiega, Rachunek, ksieguj, vat_z_brutto
from ..kuchnia import swiezosc as sw
from ..losowosc import strumien
from ..model import Firma, Ogloszenie, Partia, grosze
from ..nieruchomosci import per_lokal as pl
from ..pieniadze.zaleglosci import zl

ZAKLADKA = "handel"
TOWAR, SPRZET = "towar", "sprzet"
SPRZEDAZ_TOWAROW = "Sprzedaż towarów na giełdzie"
KUPUJACY, SPRZEDAWCA = "kupujacy", "sprzedawca"
EPS = 1e-6


def ustawienia(dane: Dane) -> dict | None:
    return (dane.zdarzenia or {}).get("handel")


def otwarty(dane: Dane, runda: int) -> bool:
    u = ustawienia(dane)
    return bool(u) and runda >= u["handel"]["od_rundy"]


def nazwa(f: Firma) -> str:
    return f.nazwa_wyswietlana or f.nazwa


def _sprzet_na_sprzedaz(f: Firma, typ: str, nr: int, nazwa_: str) -> int | None:
    """Jakość sprzętu, który firma może sprzedać (własny, nie z najmu lokalu, nie w leasingu); None – nie może."""
    st = f.stanowisko(typ, nr)
    if not st or nazwa_ not in st.sprzet or nazwa_ in st.sprzet_wynajmujacego:
        return None
    if any(lz.typ == typ and lz.nr == nr and lz.nazwa == nazwa_ for lz in f.leasingi):
        return None
    return st.sprzet[nazwa_]


def _wartosc_towaru(f: Firma, zasob: str, jakosc: int) -> float:
    """Koszt zakupu opakowania (średnia z magazynu, zł)."""
    k = f"{zasob}|{jakosc}"
    ile = f.magazyn.get(k, 0.0)
    return f.wartosc_magazynu_gr.get(k, 0) / 100 / ile if ile > EPS else 0.0


def _partie(f: Firma, zasob: str, jakosc: int) -> list[Partia]:
    """Partie towaru w kolejności wydawania: najkrótszy termin pierwszy (bez terminu – na końcu)."""
    return sorted((p for p in f.partie if p.zasob == zasob and p.jakosc == jakosc and p.ilosc > EPS),
                  key=lambda p: (p.termin is None, p.termin or "", p.dostawa))


def co(o: Ogloszenie) -> str:
    if o.typ == TOWAR:
        return f"{o.zasob} {o.jakosc}★ × {o.ilosc:g} opak."
    return f"{o.nazwa} {o.jakosc}★ ({o.stanowisko} {o.nr})"


def stawka_vat(dane: Dane, o: Ogloszenie) -> float:
    if o.typ == TOWAR:
        return rz.stawka_zasobu(dane, o.zasob) or 0.0
    return dane.podatki["vat"]["srodki_trwale"] if dane.podatki else 0.0


# --- wystawienie ogłoszeń (koniec rundy r) ---------------------------------------------------------------------

def _sprawdz(dane: Dane, f: Firma, o: dict, runda: int, i: int, w_ogloszeniach: dict[str, float],
             sprzet_w_ogloszeniach: set) -> tuple[Ogloszenie | None, str]:
    u = ustawienia(dane)["handel"]
    try:
        cena = round(float(o.get("cena_min") or 0), 2)
    except (TypeError, ValueError):
        cena = 0.0
    if cena <= 0:
        return None, "podaj cenę wywoławczą"
    ogl = Ogloszenie(id=f"{runda}-{f.nazwa}-{i + 1}", typ=o.get("typ") or "", cena_min_gr=grosze(cena),
                     wartosc_gr=0, runda=runda)
    if ogl.typ == TOWAR:
        try:
            ogl.zasob, ogl.jakosc, ogl.ilosc = o.get("zasob"), int(o.get("jakosc")), float(o.get("ilosc") or 0)
        except (TypeError, ValueError):
            return None, "niepoprawny towar"
        if ogl.zasob not in dane.zasoby or ogl.ilosc <= EPS:
            return None, "niepoprawny towar"
        k = f"{ogl.zasob}|{ogl.jakosc}"
        jest = f.magazyn.get(k, 0.0) - w_ogloszeniach.get(k, 0.0)
        if jest < ogl.ilosc - EPS:
            return None, f"na koniec rundy w magazynie było tylko {max(0.0, jest):g} opak."
        wartosc = _wartosc_towaru(f, ogl.zasob, ogl.jakosc) * ogl.ilosc
        ogl.termin = next((p.termin for p in _partie(f, ogl.zasob, ogl.jakosc) if p.termin), None)
    elif ogl.typ == SPRZET:
        try:
            ogl.stanowisko, ogl.nr, ogl.nazwa = o.get("stanowisko"), int(o.get("nr")), o.get("nazwa")
        except (TypeError, ValueError):
            return None, "niepoprawny sprzęt"
        q = _sprzet_na_sprzedaz(f, ogl.stanowisko, ogl.nr, ogl.nazwa)
        klucz = (ogl.stanowisko, ogl.nr, ogl.nazwa)
        if q is None or ogl.nazwa not in dane.sprzet or klucz in sprzet_w_ogloszeniach:
            return None, "tego sprzętu nie ma na stanowisku (sprzętu z najmu lokalu i w leasingu nie można sprzedać)"
        ogl.jakosc = q
        wartosc = dane.sprzet[ogl.nazwa]["ceny"][str(q)]
    else:
        return None, "można sprzedać towar albo sprzęt"
    lo, hi = round(u["cena_min"] * wartosc, 2), round(u["cena_maks"] * wartosc, 2)
    if not lo - EPS <= cena <= hi + EPS:
        return None, f"cena wywoławcza musi być od {zl(lo)} do {zl(hi)} (wartość {zl(round(wartosc, 2))})"
    ogl.wartosc_gr = grosze(wartosc)
    if ogl.typ == TOWAR:   # rezerwacja dopiero po sprawdzeniu ceny – odrzucone ogłoszenie nie zajmuje towaru
        w_ogloszeniach[k] = w_ogloszeniach.get(k, 0.0) + ogl.ilosc
    else:
        sprzet_w_ogloszeniach.add(klucz)
    return ogl, ""


def zuzycie(w: dict | None) -> dict[str, float]:
    """„zasób|jakość” → zużycie w tygodniu (wyniki rundy: tabela zasobów)."""
    return {f"{x['zasob']}|{x['jakosc']}": x.get("wykorzystane", 0.0) for x in (w or {}).get("zasoby") or []}


def _strategia(dane: Dane, f: Firma) -> dict:
    strategie = dane.boty["strategie"]
    return strategie.get(f.bot) or strategie["zrownowazony"]


def _uzywane(dane: Dane, f: Firma) -> tuple[set[str], set[str]]:
    """Zasoby i sprzęt potrzebne w daniach firmy."""
    zasoby, sprzet = set(), set()
    for u in f.oferta:
        zasoby |= set((dane.uslugi.get(u) or {}).get("zasoby") or {})
        sprzet |= set((dane.uslugi.get(u) or {}).get("sprzet") or [])
    return zasoby, sprzet


def _ogloszenia_bota(dane: Dane, f: Firma, uzycie: dict[str, float]) -> list[dict]:
    """Szkice ogłoszeń bota: nadwyżki towaru (największa wartość pierwsza) i niepotrzebny sprzęt kuchni."""
    b = ustawienia(dane)["boty"]
    zasoby, sprzet = _uzywane(dane, f)
    towar = []
    for k, ile in f.magazyn.items():
        zasob, q = k.split("|")[0], int(k.split("|")[1])
        nadwyzka = ile - (b["zapas_tygodni"] * uzycie.get(k, 0.0) if zasob in zasoby else 0.0)
        ilosc = math.floor(nadwyzka + EPS)
        wartosc = _wartosc_towaru(f, zasob, q) * ilosc
        if ilosc >= 1 and wartosc >= b["min_wartosc"]:
            towar.append((-wartosc, k, {"typ": TOWAR, "zasob": zasob, "jakosc": q, "ilosc": ilosc,
                                        "cena_min": round(b["cena_min"] * wartosc, 2)}))
    szkice = [o for *_, o in sorted(towar)]
    if len(f.oferta) >= _strategia(dane, f)["uslugi"]:   # pełna karta – bot nie dołoży dania do starego sprzętu
        for st in f.stanowiska:
            for n, q in sorted(st.sprzet.items()):
                if st.typ == KUCHNIA and n not in sprzet and n in dane.sprzet \
                        and not dane.sprzet[n].get("przechowywanie") \
                        and _sprzet_na_sprzedaz(f, st.typ, st.nr, n) is not None:   # chłodnia zostaje
                    szkice.append({"typ": SPRZET, "stanowisko": st.typ, "nr": st.nr, "nazwa": n,
                                   "cena_min": round(b["cena_min"] * dane.sprzet[n]["ceny"][str(q)], 2)})
    return szkice[:b["maks_ogloszen"]]


def wystaw(dane: Dane, firmy: dict[str, Firma], sprzedawca: str, d: dict, runda: int,
           uzycie: dict[str, float] | None = None) -> dict | None:
    """Ogłoszenia firmy po tygodniu sprzedaży (drużyna – z decyzji `handel_wystaw`, bot – nadwyżki); zastępują
    ogłoszenia z poprzedniej rundy (już rozstrzygnięte). `uzycie` – zużycie towaru w tygodniu (dla bota)."""
    u = ustawienia(dane)
    f = firmy[sprzedawca]
    f.ogloszenia = []
    if not u:
        return None
    info = {"wystawione": [], "odrzucone": []}
    szkice = _ogloszenia_bota(dane, f, uzycie or {}) if f.bot else list(d.get("handel_wystaw") or [])
    if runda < u["handel"]["od_rundy"]:
        if szkice and not f.bot:
            info["odrzucone"].append({"co": "Ogłoszenia na giełdzie",
                                      "powod": f"giełda handlu działa od rundy {u['handel']['od_rundy']}"})
        return info
    w_ogloszeniach, sprzet_w_ogloszeniach = {}, set()
    for i, o in enumerate(szkice):
        o = o if isinstance(o, dict) else {}
        if len(f.ogloszenia) >= u["handel"]["maks_ogloszen"]:
            info["odrzucone"].append({"co": _opis_szkicu(o),
                                      "powod": f"najwyżej {u['handel']['maks_ogloszen']} ogłoszeń w rundzie"})
            continue
        ogl, powod = _sprawdz(dane, f, o, runda, i, w_ogloszeniach, sprzet_w_ogloszeniach)
        if ogl is None:
            info["odrzucone"].append({"co": _opis_szkicu(o), "powod": powod})
            continue
        f.ogloszenia.append(ogl)
        info["wystawione"].append(publiczna(dane, firmy, sprzedawca, ogl))
    return info


def _poziom_bota(dane: Dane, konf: dict, n: str) -> dict:
    from .. import boty  # leniwie: boty importują księgowość, a ta – ten moduł

    return boty.poziom(dane, konf, n)


def _chce(dane: Dane, k: Firma, o: Ogloszenie, uzycie: dict[str, float], runda: int) -> bool:
    """Czy bot `k` kupiłby rzecz z ogłoszenia (używa jej, w swojej jakości, świeżą, w granicach zapasu)."""
    b = ustawienia(dane)["boty"]
    zasoby, sprzet = _uzywane(dane, k)
    st = _strategia(dane, k)
    if o.typ == TOWAR:
        klucz = f"{o.zasob}|{o.jakosc}"
        if o.zasob not in zasoby or o.jakosc != (st.get("jakosc_zasobow") or st["jakosc"]):
            return False
        if o.termin and date.fromisoformat(o.termin) < dane.data_rundy(runda + 1) + timedelta(b["min_dni_terminu"]):
            return False
        return k.magazyn.get(klucz, 0.0) + o.ilosc <= b["zapas_tygodni"] * uzycie.get(klucz, 0.0) + EPS
    return o.nazwa in sprzet and o.jakosc >= st["jakosc"] and \
        any(x.typ == o.stanowisko and o.nazwa not in x.sprzet for x in k.stanowiska)


def _limity_botow(dane: Dane, firmy: dict[str, Firma], runda: int, konf: dict,
                  uzycia: dict[str, dict[str, float]]) -> None:
    """Licytacja z limitem: każdy bot ustala najwyższą cenę na ogłoszenia z rundy `runda`, które mu się przydadzą
    (kolejno wg id), razem najwyżej gotówka ponad rezerwę."""
    b = ustawienia(dane)["boty"]
    ogloszenia = sorted(((n, o) for n, f in firmy.items() for o in f.ogloszenia if o.runda == runda),
                        key=lambda x: x[1].id)
    for n, k in sorted(firmy.items()):
        if not k.bot:
            continue
        frakcja = _poziom_bota(dane, konf, n).get("limit_handlu") or b["limit_handlu"]
        wolne = k.gotowka_gr - grosze(b["rezerwa_gotowki"])
        for sprzedawca, o in ogloszenia:
            limit = round(frakcja * o.wartosc_gr)
            if sprzedawca == n or limit < o.cena_min_gr or limit > wolne or \
                    not _chce(dane, k, o, uzycia.get(n) or {}, runda):
                continue
            o.limity[n] = limit
            wolne -= limit


def zamknij(dane: Dane, firmy: dict[str, Firma], decyzje: dict[str, dict], runda: int, wyniki: dict[str, dict],
            konf: dict) -> dict[str, dict]:
    """Koniec rundy: ogłoszenia wszystkich firm (drużyny – z decyzji, boty – nadwyżki) i limity botów.
    Zwraca firma → {wystawione, odrzucone}."""
    if not ustawienia(dane):
        return {}
    uzycia = {n: zuzycie(wyniki.get(n)) for n in firmy}
    info = {n: wystaw(dane, firmy, n, decyzje.get(n) or {}, runda, uzycia[n]) for n in sorted(firmy)}
    if runda >= ustawienia(dane)["handel"]["od_rundy"]:
        _limity_botow(dane, firmy, runda, konf, uzycia)
    return info


def publiczna(dane: Dane, firmy: dict[str, Firma], sprzedawca: str, o: Ogloszenie) -> dict:
    """Ogłoszenie do widoku wszystkich (bez limitów botów)."""
    return {"id": o.id, "od": sprzedawca, "od_nazwa": nazwa(firmy[sprzedawca]), "od_bota": bool(firmy[sprzedawca].bot),
            "typ": o.typ, "co": co(o), "cena_min": o.cena_min, "wartosc": o.wartosc, "stawka": stawka_vat(dane, o),
            "zasob": o.zasob, "jakosc": o.jakosc, "ilosc": o.ilosc, "nazwa": o.nazwa, "stanowisko": o.stanowisko,
            "nr": o.nr, "termin": o.termin, "runda": o.runda}


# --- licytacja (runda r+1) -----------------------------------------------------------------------------------

def krok(dane: Dane) -> float:
    return ustawienia(dane)["handel"]["krok_przebicia"]


def _przebicie(gr: int, k: float) -> int:
    """Najniższa kwota (gr), która przebija `gr` o krok."""
    return math.ceil(gr * (1 + k) - EPS)


def licytacje(d: dict | None) -> dict[str, int]:
    """Oferty drużyny z decyzji `handel_licytuj`: id ogłoszenia → kwota w groszach (niepoprawne pominięte)."""
    wynik = {}
    for k, v in ((d or {}).get("handel_licytuj") or {}).items() if isinstance((d or {}).get("handel_licytuj"),
                                                                                dict) else []:
        try:
            gr = grosze(float(v))
        except (TypeError, ValueError):
            continue
        if gr > 0:
            wynik[str(k)] = gr
    return wynik


def oferty_na(o: Ogloszenie, sprzedawca: str, decyzje: dict, firmy: dict[str, Firma]) -> dict[str, int]:
    """Oferty drużyn (nie botów, nie sprzedawcy) na ogłoszenie z ich decyzji."""
    wynik = {}
    for n, d in (decyzje or {}).items():
        if n in firmy and not firmy[n].bot and n != sprzedawca and isinstance(d, dict):
            gr = licytacje(d).get(o.id)
            if gr:
                wynik[n] = gr
    return wynik


def licytacja(o: Ogloszenie, oferty: dict[str, int], k: float, bez: frozenset | set = frozenset()) -> dict | None:
    """Stan licytacji: {kto, bot, cena_gr} – prowadzący i cena, którą zapłaci; None – nikt nie licytuje.
    Drużyna płaci swoją ofertę; bot – najmniej, ile przebija drugą ofertę (najwyżej swój limit). Przy równych
    kwotach drużyna przed botem, potem kolejność nazw. `bez` – z pominięciem tych firm."""
    kandydaci = sorted([(-gr, 0, n) for n, gr in oferty.items() if n not in bez and gr >= o.cena_min_gr]
                       + [(-gr, 1, n) for n, gr in o.limity.items() if n not in bez and gr >= o.cena_min_gr])
    if not kandydaci:
        return None
    gr, bot, kto = -kandydaci[0][0], kandydaci[0][1] == 1, kandydaci[0][2]
    if bot:
        drugi = -kandydaci[1][0] if len(kandydaci) > 1 else None
        gr = o.cena_min_gr if drugi is None else min(gr, max(o.cena_min_gr, _przebicie(drugi, k)))
    return {"kto": kto, "bot": bot, "cena_gr": gr}


def minimum(o: Ogloszenie, oferty: dict[str, int], k: float, firma: str) -> int:
    """Najniższa oferta (gr), jaką `firma` może teraz złożyć: cena wywoławcza albo przebicie prowadzącego."""
    s = licytacja(o, oferty, k, {firma})
    return o.cena_min_gr if s is None else max(o.cena_min_gr, _przebicie(s["cena_gr"], k))


def otwarte(firmy: dict[str, Firma], runda: int) -> dict[str, tuple[str, Ogloszenie]]:
    """Ogłoszenia licytowane w rundzie `runda` (wystawione po poprzedniej): id → (sprzedawca, ogłoszenie)."""
    return {o.id: (n, o) for n, f in firmy.items() for o in f.ogloszenia if o.runda == runda - 1}


@nz.kontrola
def kontrola_licytacji(dane, szkice: dict, firma: str, nowe: dict, stare: dict, runda: int, opcje: dict) -> list[str]:
    """Przy zapisie: zmieniona oferta musi przebić prowadzącą o krok, na otwarte cudze ogłoszenie; złożonej oferty
    nie można obniżyć ani wycofać. `opcje["_stan"]` – stan gry na początku rundy (bez niego – bez kontroli)."""
    stan = (opcje or {}).get("_stan")
    if stan is None or not ustawienia(dane):
        return []
    nowe_l, stare_l = licytacje(nowe), licytacje(stare)
    if nowe_l == stare_l:
        return []
    ogl = otwarte(stan.firmy, runda)
    k = krok(dane)
    bledy = []
    for oid, gr in sorted(nowe_l.items()):
        if stare_l.get(oid) == gr:
            continue
        if oid not in ogl:
            bledy.append("To ogłoszenie nie jest już licytowane.")
            continue
        sprzedawca, o = ogl[oid]
        if sprzedawca == firma:
            bledy.append("Nie można licytować własnego ogłoszenia.")
        elif gr < stare_l.get(oid, 0):
            bledy.append(f"{co(o)}: złożonej oferty nie można obniżyć (była {zl(stare_l[oid] / 100)}).")
        else:
            oferty = oferty_na(o, sprzedawca, {**szkice, firma: nowe}, stan.firmy)
            m = minimum(o, oferty, k, firma)
            if gr < m:
                s = licytacja(o, oferty, k, {firma})
                kto = f" – {nazwa(stan.firmy[s['kto']])} prowadzi: {zl(s['cena_gr'] / 100)}" if s else ""
                bledy.append(f"{co(o)}: oferta musi wynosić co najmniej {zl(m / 100)}{kto}.")
    for oid in sorted(set(stare_l) - set(nowe_l)):
        if oid in ogl:
            bledy.append(f"{co(ogl[oid][1])}: złożonej oferty nie można wycofać.")
    return bledy


# --- rozstrzygnięcie (początek rundy r+1) ---------------------------------------------------------------------

def _ksiegi(dane: Dane, ksiegi: dict, rachunki: dict, n: str) -> tuple[Ksiega, Rachunek]:
    if n not in ksiegi:   # podgląd jednej drużyny: zapisy drugiej strony idą do pustej księgi
        ksiegi[n], rachunki[n] = Ksiega(vat=rz.reguly_vat(dane)), Rachunek()
    return ksiegi[n], rachunki[n]


def _przenies_towar(dane: Dane, s: Firma, k: Firma, o: Ogloszenie, cena_gr: int, runda: int) -> None:
    zostalo, wziete = o.ilosc, []
    for p in _partie(s, o.zasob, o.jakosc):
        ile = min(zostalo, p.ilosc)
        sw._uszczknij(p, ile)
        wziete.append((p, ile))
        zostalo -= ile
        if zostalo <= EPS:
            break
    reszta = cena_gr   # u kupującego wartość partii = cena z faktury, rozdzielona wg ilości
    lok = pl.glowny(k, runda)   # towar trafia do lokalu głównego kupującego
    for j, (p, ile) in enumerate(wziete):
        w = reszta if j == len(wziete) - 1 else round(cena_gr * ile / o.ilosc)
        reszta -= w
        k.partie.append(Partia(zasob=p.zasob, jakosc=p.jakosc, ilosc=ile, wartosc_gr=w,
                               dostawa=dane.data_rundy(runda).isoformat(), termin=p.termin,
                               dostawca=f"Giełda: {nazwa(s)}", runda=runda, lokal=lok.id if lok else None))
    sw.uzgodnij(s)
    sw.uzgodnij(k)


def _wykonaj(dane: Dane, firmy: dict[str, Firma], sprzedawca: str, kupujacy: str, o: Ogloszenie, cena_gr: int,
             runda: int, ksiegi: dict, rachunki: dict) -> tuple[str, str, int | None]:
    """Transakcja; zwraca (powód odmowy albo "", czyja wina, stanowisko kupującego na sprzęt)."""
    s, k = firmy[sprzedawca], firmy[kupujacy]
    cena = cena_gr / 100
    if k.gotowka_gr < cena_gr:
        return f"{nazwa(k)}: na koncie zabrakło {zl(cena)}", KUPUJACY, None
    stawka = stawka_vat(dane, o)
    if o.typ == TOWAR:
        if s.magazyn.get(f"{o.zasob}|{o.jakosc}", 0.0) < o.ilosc - EPS:
            return f"{nazwa(s)}: nie ma już tyle towaru", SPRZEDAWCA, None
        ks_s, rach_s = _ksiegi(dane, ksiegi, rachunki, sprzedawca)
        ks_k, rach_k = _ksiegi(dane, ksiegi, rachunki, kupujacy)
        _przenies_towar(dane, s, k, o, cena_gr, runda)
        ksieguj(s, ks_s, rach_s, f"{SPRZEDAZ_TOWAROW} – {nazwa(k)}: {o.zasob}", cena, "przychod", stawka=stawka)
        ksieguj(k, ks_k, rach_k, f"Zakup towarów na giełdzie od {nazwa(s)}: {o.zasob}", cena, "towary",
                stawka=stawka)
        return "", "", None
    q = _sprzet_na_sprzedaz(s, o.stanowisko, o.nr, o.nazwa)
    if q is None:
        return f"{nazwa(s)}: nie ma już tego sprzętu na stanowisku", SPRZEDAWCA, None
    cel = next((x for x in k.stanowiska if x.typ == o.stanowisko and o.nazwa not in x.sprzet), None)
    if cel is None:
        return f"{nazwa(k)}: nie ma wolnego stanowiska ({o.stanowisko}) na {o.nazwa}", KUPUJACY, None
    ks_s, rach_s = _ksiegi(dane, ksiegi, rachunki, sprzedawca)
    ks_k, rach_k = _ksiegi(dane, ksiegi, rachunki, kupujacy)
    s.stanowisko(o.stanowisko, o.nr).sprzet.pop(o.nazwa)
    st_trwale.sprzedaj(s, f"{o.nazwa} ({o.stanowisko} {o.nr})", ks_s)
    ksieguj(s, ks_s, rach_s, f"Sprzedaż sprzętu na giełdzie: {o.nazwa} – {nazwa(k)}", cena, "przychod_pozostaly",
            stawka=stawka)
    st_trwale.zmniejsz_majatek(s, dane.sprzet[o.nazwa]["ceny"][str(q)])   # po cenie zakupu, jak sprzedaż sprzętu
    cel.sprzet[o.nazwa] = q
    st_trwale.zakup(dane, k, ks_k, rach_k, f"Koszt zakupu na giełdzie: {o.nazwa} od {nazwa(s)}",
                    f"{o.nazwa} ({cel.typ} {cel.nr})", "sprzet", cena, runda)
    k.majatek += cena
    o.jakosc = q
    return "", "", cel.nr


def _transakcja(dane: Dane, firmy: dict[str, Firma], n: str, o: Ogloszenie, oferty: dict[str, int], runda: int,
                ksiegi: dict, rachunki: dict, ziarno: int | str, wynik: dict) -> None:
    """Licytacja jednego ogłoszenia: najwyższa oferta kupuje; gdy kupującego nie stać – następny w kolejce."""
    k, odpadli = krok(dane), set()
    while (s := licytacja(o, oferty, k, odpadli)) is not None:
        kupujacy, cena_gr = s["kto"], s["cena_gr"]
        powod, wina, nr = _wykonaj(dane, firmy, n, kupujacy, o, cena_gr, runda, ksiegi, rachunki)
        if not powod:
            break
        for strona in (n, kupujacy):
            wynik[strona]["nieudane"].append({"co": f"{co(o)} za {zl(cena_gr / 100)}", "powod": powod, "id": o.id})
        if wina == SPRZEDAWCA:
            s = None
            break
        odpadli.add(kupujacy)
    if s is None:
        for x in oferty:
            if x not in odpadli:
                wynik[x]["przegrane"].append({"id": o.id, "co": co(o), "cena": None, "zwyciezca": None})
        wynik[n]["wygasle"].append({"id": o.id, "co": co(o), "cena_min": o.cena_min})
        return
    cena = cena_gr / 100
    for x, gr in oferty.items():
        if x != kupujacy and x not in odpadli:
            wynik[x]["przegrane"].append({"id": o.id, "co": co(o), "oferta": gr / 100, "cena": cena,
                                          "zwyciezca": nazwa(firmy[kupujacy])})
    T = ustawienia(dane)["teksty"]
    rng = strumien(ziarno, runda, "handel", o.id)
    tekst = T[int(rng.integers(len(T)))].format(sprzedawca=nazwa(firmy[n]), kupujacy=nazwa(firmy[kupujacy]), co=co(o))
    stawka = stawka_vat(dane, o)
    vat = vat_z_brutto(cena, stawka) if stawka else 0.0
    wspolne = {"id": o.id, "co": co(o), "cena": cena, "cena_min": o.cena_min, "vat": vat,
               "netto": round(cena - vat, 2), "typ": o.typ, "tekst": tekst, "runda": runda}
    wynik[n]["transakcje"].append({**wspolne, "strona": "sprzedaz", "z_kim": nazwa(firmy[kupujacy])})
    wynik[kupujacy]["transakcje"].append({**wspolne, "strona": "zakup", "z_kim": nazwa(firmy[n]),
                                          **({"nr": nr} if nr is not None else {})})


def rozstrzygnij(dane: Dane, firmy: dict[str, Firma], decyzje: dict[str, dict], runda: int, ksiegi: dict,
                 rachunki: dict, ziarno: int | str, tylko: str | None = None) -> dict[str, dict]:
    """Początek rundy (przed decyzjami): licytacje ogłoszeń z poprzedniej rundy – transakcje po cenach
    zwycięzców (oferty drużyn z `decyzje`, limity botów z ogłoszeń). `tylko` – podgląd jednej drużyny: tylko
    ogłoszenia, w których bierze udział. Zwraca firma → {transakcje, nieudane, przegrane, wygasle}."""
    wynik = {n: {"transakcje": [], "nieudane": [], "przegrane": [], "wygasle": []} for n in firmy}
    if not ustawienia(dane):
        return wynik
    for _oid, (n, o) in sorted(otwarte(firmy, runda).items()):
        oferty = oferty_na(o, n, decyzje, firmy)
        if tylko is None or tylko == n or tylko in oferty or tylko in o.limity:
            _transakcja(dane, firmy, n, o, oferty, runda, ksiegi, rachunki, ziarno, wynik)
    return wynik


# --- raport, błędy i widok ----------------------------------------------------------------------------------

def raport(info_rozstrzygniecia: dict | None, info_wystawienia: dict | None) -> dict | None:
    if info_wystawienia is None:
        return None
    pusty = {"transakcje": [], "nieudane": [], "przegrane": [], "wygasle": []}
    return {**(info_rozstrzygniecia or pusty), **info_wystawienia}


def bledy(info: dict | None) -> list[dict]:
    if not info:
        return []
    return [{"poziom": "czerwony", "zakladka": ZAKLADKA, "tekst": f"{o['co']}: {o['powod']}."}
            for o in info.get("odrzucone", []) + info.get("nieudane", [])]


def _opis_szkicu(o: dict) -> str:
    if o.get("typ") == TOWAR:
        return f"{o.get('zasob')} {o.get('jakosc')}★ × {o.get('ilosc')} opak."
    if o.get("typ") == SPRZET:
        return f"{o.get('nazwa')} ({o.get('stanowisko')} {o.get('nr')})"
    return "Ogłoszenie"


def widok(dane: Dane, firmy_przed: dict[str, Firma], firma: str, runda: int, decyzja: dict | None,
          szkice: dict | None = None, historia: list[dict] | None = None) -> dict | None:
    """Zakładka Handel: ogłoszenia licytowane w tej rundzie ze stanem licytacji (z decyzji drużyn `szkice`),
    zapowiedzi innych drużyn (szkice ogłoszeń, licytacja w następnej rundzie), towar i sprzęt do wystawienia
    (stan na początku rundy), historia transakcji, `decyzja` – raport rundy (podgląd albo wyniki)."""
    u = ustawienia(dane)
    if not u or firma not in firmy_przed:
        return None
    fp, k, szkice = firmy_przed[firma], u["handel"]["krok_przebicia"], szkice or {}
    moje = licytacje(szkice.get(firma))
    ogloszenia = []
    for oid, (n, o) in sorted(otwarte(firmy_przed, runda).items()):
        oferty = oferty_na(o, n, szkice, firmy_przed)
        s = licytacja(o, oferty, k)
        ogloszenia.append({**publiczna(dane, firmy_przed, n, o), "moje": n == firma,
                           "prowadzi": s["kto"] if s else None,
                           "prowadzi_nazwa": nazwa(firmy_przed[s["kto"]]) if s else None,
                           "cena": s["cena_gr"] / 100 if s else None, "ja_prowadze": bool(s) and s["kto"] == firma,
                           "moja_oferta": moje[oid] / 100 if oid in moje else None,
                           "minimum": minimum(o, oferty, k, firma) / 100,
                           "licytujacych": len(oferty) + sum(1 for g in o.limity.values() if g >= o.cena_min_gr)})
    zapowiedzi = [{"od": n, "od_nazwa": nazwa(firmy_przed[n]), "co": _opis_szkicu(o), "cena_min": o.get("cena_min")}
                  for n, d in sorted(nz.szkice_innych(szkice, firma).items())
                  if n in firmy_przed and not firmy_przed[n].bot
                  for o in d.get("handel_wystaw") or [] if isinstance(o, dict)]
    towary = []
    for kl, ile in sorted(fp.magazyn.items()):
        zasob, q = kl.split("|")[0], int(kl.split("|")[1])
        if ile > EPS:
            towary.append({"zasob": zasob, "jakosc": q, "ilosc": round(ile, 3),
                           "wartosc": round(_wartosc_towaru(fp, zasob, q), 2),
                           "termin": next((p.termin for p in _partie(fp, zasob, q) if p.termin), None)})
    sprzet = [{"stanowisko": st.typ, "nr": st.nr, "nazwa": n, "jakosc": q, "katalog": dane.sprzet[n]["ceny"][str(q)]}
              for st in fp.stanowiska for n, q in st.sprzet.items()
              if n in dane.sprzet and _sprzet_na_sprzedaz(fp, st.typ, st.nr, n) is not None]
    return {"otwarty": runda >= u["handel"]["od_rundy"], "od_rundy": u["handel"]["od_rundy"],
            "limity": {x: u["handel"][x] for x in ("maks_ogloszen", "cena_min", "cena_maks", "krok_przebicia")},
            "ogloszenia": ogloszenia, "zapowiedzi": zapowiedzi, "towary": towary, "sprzet": sprzet,
            "gotowka": fp.gotowka, "historia": historia or [], "decyzja": decyzja}
