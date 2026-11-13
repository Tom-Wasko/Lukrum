"""Funkcje gry przy przeliczeniu rundy (seria „funkcje”, raporty/funkcje/plan.md: J3, J5).

Przed zastosowaniem decyzji rundy (silnik/runda.py, podgląd decyzji drużyny – api/prezentacja.py: stan_po_szkicu)
decyzje każdej firmy przechodzą przez `decyzje_firmy`:
- decyzje funkcji wyłączonych (silnik/funkcje.py: DECYZJE) są pomijane, drużyna dostaje błąd na liście błędów,
- decyzje funkcji zakrytych (autopilot – drużyna jej jeszcze nie odsłoniła albo znów zakryła) znikają po cichu,
- funkcje, których firma sama nie prowadzi (wyłączone; zakryte – tylko drużyny, boty nigdy nie są na autopilocie),
  gra robi za nią bezpiecznymi decyzjami domyślnymi:
  zaopatrzenie – każdy działający lokal z obsadą kuchni na auto-dostawach z ilościami z prognozy popytu (jak boty;
  K4: prognoza z kampaniami i promocjami drużyny; bez kucharza i właściciela na kuchni – bez dostaw; K5: jakość
  składników jak stanowiska kuchni lokalu),
  urzędy – higiena domyślna i bez polis (kontrole sanepidu: wyłączone – harmonogram, zakryte – jak dotąd),
  księgowość – zamiast samodzielnej księgowości najtańsze biuro (bez kar za KPiR i deklaracje),
  marketing – bez nowych kampanii i bez promocji (promocje nie mają końca, więc się kończą; kampanie biegną do końca),
  właściciel – bez wypłat i wpłat (wolne godziny na puste stanowisko – jak dotąd),
  pozostałe (wyposażenie, rozwój, sieć, handel, Harpagon, giełda, analiza) – bez decyzji, bez kosztu i skutku.
Autopilot działa od pierwszej nieprzeliczonej rundy po zakryciu (historia odsłonięć – silnik/funkcje.py: odslonieta).
K1 (decyzja autora 10.11): znów zakryta funkcja wraca do stanu sprzed odsłonięcia, bez zwrotu pieniędzy (`przepadek`,
na początku rundy, od której gra ją robi): marketing – kampanie z efektem, promocje (decyzja gry: bez promocji)
i narzędzia internetowe; handel – ogłoszenia drużyny; wyposażenie i udogodnienia (rozwój) – wszystkie sztuki we
wszystkich lokalach, jak likwidacja (niezamortyzowana wartość w kosztach, majątek mniejszy); rozwój – trwające
szkolenia; urzędy – polisy wypowiedziane i higiena domyślna (decyzje gry); sieć – lokale zostają, a licytacje,
przejęcia i przewozy rundy się nie odbywają (decyzje pominięte). Drużyna dostaje uwagę z listą utraconych rzeczy.

Event sourcing: zapisane decyzje drużyn się nie zmieniają – decyzje gry liczone są przy każdym przeliczeniu z tego
samego stanu na początku rundy, konfiguracji i decyzji, więc przeliczenie starej rundy daje to samo. Gra bez
`funkcje` w konfiguracji (stare gry, testy, pomiary) – decyzje bez zmian.
"""
from __future__ import annotations

from copy import deepcopy

from . import funkcje as fn
from .dane import KUCHNIA, Dane
from .ksiegowosc import biuro as bo
from .ksiegowosc import srodki_trwale as st_trwale
from .ksiegowosc.finanse import Ksiega, Rachunek, do_zlotego
from .kuchnia import auto_dostawca as ad
from .kuchnia.dostawcy import ceny_rundy
from .kuchnia.jakosc import mnoznik_wyposazenia
from .kuchnia.operacje import jakosc_uslugi
from .kuchnia.planowanie import pozycje_auto_dostaw
from .ludzie import czas_wlasciciela as cw
from .model import Cena, Firma, Pracownik, StanGry
from .nieruchomosci import lokale as lk
from .nieruchomosci import per_lokal as pl
from .rynek import popyt as pp
from .rynek import promocje as pm
from .rynek import reklama as rk
from .swiat import awarie as aw


def ustawienia(dane: Dane) -> dict:
    """Zakupy gry za drużynę (funkcje.yaml: autopilot – pole wymagane) – zapas auto-dostaw i jakość składników, gdy
    lokal nie ma jeszcze jakości stanowisk (K5: `_jakosc_lokalu`)."""
    return dane.funkcje["autopilot"]


def decyzje_rundy(dane: Dane, stan: StanGry, decyzje: dict[str, dict], konf: dict, runda: int,
                  ) -> tuple[dict[str, dict], dict[str, list[dict]]]:
    """Decyzje wszystkich firm po funkcjach gry i błędy funkcji ({firma: [błąd]}); stan – na początku rundy."""
    if not konf.get("funkcje") or not fn.rejestr(dane):
        return decyzje, {}
    wynik, bledy = dict(decyzje), {}
    for nazwa in sorted(stan.firmy):
        d, b = decyzje_firmy(dane, stan, nazwa, decyzje.get(nazwa, {}), konf, runda)
        if d is not decyzje.get(nazwa, {}) or nazwa in decyzje:
            wynik[nazwa] = d
        if b:
            bledy[nazwa] = b
    return wynik, bledy


def decyzje_firmy(dane: Dane, stan: StanGry, nazwa: str, d: dict, konf: dict, runda: int) -> tuple[dict, list[dict]]:
    """Decyzje jednej firmy po funkcjach gry (kopia, gdy coś się zmieniło) i błędy wyłączonych funkcji."""
    if not konf.get("funkcje") or not fn.rejestr(dane):
        return d, []
    f, wybrane = stan.firmy[nazwa], d or {}
    d, bledy = fn.filtruj(dane, konf, nazwa, wybrane, runda)
    zmiany: dict = {}
    if _robi_gra(dane, konf, nazwa, "zaopatrzenie", runda):
        zmiany |= _zaopatrzenie(dane, stan, f, d, konf, runda)
    if _robi_gra(dane, konf, nazwa, "urzedy", runda):
        zmiany |= _urzedy(dane, f)
    if _robi_gra(dane, konf, nazwa, "ksiegowosc", runda):
        zmiany |= _ksiegowosc(dane, f, d, wybrane)
    if _robi_gra(dane, konf, nazwa, "marketing", runda) and f.promocje:
        zmiany["promocje"] = []   # promocje nie mają końca – na autopilocie się kończą (K1: po ponownym zakryciu)
    if zmiany:
        d = {**d, **zmiany}
    return d, bledy


def _robi_gra(dane: Dane, konf: dict, nazwa: str, klucz: str, runda: int) -> bool:
    """Funkcję robi gra: wyłączona (dla wszystkich) albo zakryta i nieodsłonięta przez drużynę (autopilot)."""
    return klucz in fn.rejestr(dane) and (fn.wylaczona(konf, klucz) or fn.autopilot(konf, nazwa, klucz, runda))


# --- zaopatrzenie: auto-dostawy z prognozy --------------------------------------------------------------------

def _zaopatrzenie(dane: Dane, stan: StanGry, f: Firma, d: dict, konf: dict, runda: int) -> dict:
    """Auto-dostawy każdego działającego lokalu z obsadą kuchni: składniki na prognozowany popyt × zapas, bez tego,
    co już leży w lokalu i u dostawcy (silnik/kuchnia/planowanie.py: pozycje_auto_dostaw). K4: lokal bez nikogo na
    stanowiskach kuchni (pracownika ani właściciela) nic nie sprzeda – nie dostaje dostaw (ani abonamentu)."""
    az = ad.zasady(dane)
    if not az or runda < az["od_rundy"] or "dostawcy" not in dane.odblokowane(runda):
        return {}
    f = _z_nowym_lokalem(dane, stan, f, d, runda)
    obsada = _obsadzone_kuchnie(dane, f, d, runda)
    dzial = [lok for lok in f.lokale if lok.dziala_od <= runda and lok.id in obsada]
    if not dzial:
        return {}
    u = ustawienia(dane)
    klienci = _prognoza(dane, stan, f, d, runda, dzial)
    ceny = ceny_rundy(dane, konf["ziarno"], runda, konf.get("ceny_dostawcow", "dane"))
    gl = pl.glowny(f, runda)
    w_lokalu = {k: dict(v or {}) for k, v in (d.get("w_lokalu") or {}).items()} if isinstance(d.get("w_lokalu"), dict) else {}
    zmiany: dict = {"auto_dostawy": None}
    for lok in dzial:
        v, kl = pl.widok(f, lok.id), klienci.get(lok.id, {})
        poz = {"pozycje": pozycje_auto_dostaw(dane, v, kl, ceny, az["dostawca"],
                                              _jakosc_lokalu(dane, v, kl, u["jakosc_zasobow"]), u["zapas_zasobow"])}
        if gl is not None and lok.id == gl.id:
            zmiany["auto_dostawy"] = poz
        else:
            w_lokalu.setdefault(lok.id, {})["auto_dostawy"] = poz
    if w_lokalu:
        zmiany["w_lokalu"] = w_lokalu
    return zmiany


def _jakosc_lokalu(dane: Dane, v: Firma, klienci: dict[str, float], domyslna: int) -> int:
    """K5: jakość składników auto-dostaw jak lokal – składniki nie gorsze od lepszej części stanowiska dania
    (gwiazdki prowadzącego albo sprzętu, silnik/kuchnia/operacje.py: jakosc_uslugi), średnio ważone prognozą porcji
    i zaokrąglone do całych gwiazdek (1–3). Premium (kucharze 2,5–3★) – 3★, zrównoważony – 2★, tani – 1★; bez
    stanowisk dań – `domyslna` (funkcje.yaml). Średnia prowadzącego i sprzętu dawała premium tylko 2★ (sprzęt
    wynajmującego 2★) – automat dalej wygrywał (pomiar K5)."""
    suma = waga = 0.0
    for u, n in klienci.items():
        if n > 0 and (q := jakosc_uslugi(dane, v, u)):
            suma, waga = suma + n * max(q[0], q[1]), waga + n
    return min(3, max(1, do_zlotego(suma / waga))) if waga else domyslna


def _z_nowym_lokalem(dane: Dane, stan: StanGry, f: Firma, d: dict, runda: int) -> Firma:
    """Firma z lokalem wybranym w tej rundzie (kopia; jak boty – silnik/boty.py: _wez_lokal), żeby lokal działający
    od razu dostał dostawy już w pierwszym tygodniu. Spór kilku drużyn o lokal rozstrzyga przeliczenie: przegrana
    firma lokalu nie ma, więc auto-dostawy się nie wykonają."""
    if not isinstance(d.get("lokal"), dict) or not d["lokal"].get("id") or d["lokal"]["id"] not in dane.lokale:
        return f
    g = deepcopy(f)
    g.gotowka += sum(float(k.get("kwota") or 0) for k in d.get("kredyty_wez") or [] if isinstance(k, dict))
    info = lk.wybierz(dane, g, d["lokal"], runda, lk.zajete(stan.firmy), Ksiega(), Rachunek())
    return g if info.get("przyjety") else f


def _obsadzone_kuchnie(dane: Dane, f: Firma, d: dict, runda: int) -> set[str]:
    """K4: lokale, w których w tej rundzie ktoś stanie przy kuchni – pracownik (bez zwolnionych, z zatrudnionymi
    i przeniesionymi w tej rundzie, silnik/decyzje.py) albo właściciel na pustym stanowisku (ta sama kolejność co
    silnik/ludzie/czas_wlasciciela.py, przy wolnych godzinach w puli). Zatrudnienie na stanowisko kupowane w tej
    rundzie (nieznany numer) liczy się w lokalach, które mają na nie miejsce (silnik/decyzje.py: stanowiska)."""
    g = f.model_copy(update={"stanowiska": [s.model_copy() for s in f.stanowiska], "pracownicy": dict(f.pracownicy)})
    zwolnieni = {x for x in d.get("zwolnij") or [] if isinstance(x, str)}
    for s in g.stanowiska:
        if s.pracownik in zwolnieni:
            s.pracownik = None
    w_lokalu = d.get("w_lokalu") if isinstance(d.get("w_lokalu"), dict) else {}
    kupuja = {k for k, v in w_lokalu.items() if isinstance(v, dict) and (v.get("stanowiska") or {}).get(KUCHNIA)}
    if isinstance(d.get("stanowiska"), dict) and d["stanowiska"].get(KUCHNIA):
        kupuja |= set(lk.wolne_miejsca(dane, f, runda)[KUCHNIA])
    wynik: set[str] = set()
    for z in [*(d.get("przenosiny") or []), *(d.get("zatrudnij") or [])]:
        if not isinstance(z, dict) or z.get("typ") not in dane.typy_stanowisk:
            continue
        try:
            st = g.stanowisko(z["typ"], int(z.get("nr")))
        except (TypeError, ValueError):
            st = None
        if st is None:
            wynik |= kupuja if z["typ"] == KUCHNIA else set()
            continue
        if z.get("pracownik"):   # przenosiny: osoba zwalnia swoje dotychczasowe stanowisko
            for s in g.stanowiska:
                if s.pracownik == z["pracownik"]:
                    s.pracownik = None
        st.pracownik = z.get("pracownik") or f"_plan_{z['typ']}_{st.nr}"
        g.pracownicy.setdefault(st.pracownik, Pracownik(
            id=st.pracownik, imie_nazwisko="", zawod=dane.zawody_typu(z["typ"])[0], gwiazdki=1,
            pensja_preferowana_gr=0, koszt_rekrutacji_gr=0, zadowolenie_klientow=0,
            ryzyko_pomylki=0))
    g.wlasciciel_na = None
    wynik |= {s.lokal for s in g.stanowiska if s.typ == KUCHNIA and g.pracownik_stanowiska(s)}
    if dane.z["operacje"]["czas_wlasciciela"] > 0 and (wolne := cw._pusty_stanowisko_kandydaci(dane, g)):
        if wolne[0].typ == KUCHNIA:
            wynik.add(wolne[0].lokal)
    return {x for x in wynik if x}


def _prognoza(dane: Dane, stan: StanGry, f: Firma, d: dict, runda: int, dzial: list) -> dict[str, dict[str, float]]:
    """Oczekiwany popyt lokali firmy ({lokal: {danie: porcje}}, silnik/rynek/popyt.py: prognoza): menu i ceny
    z decyzji rundy (bez nich – z lokalu, nowe danie po cenie preferowanej), jakość ze stanowisk (bez obsady – 2★),
    konkurencja z danych publicznych poprzedniej rundy. K4: z kampaniami (trwającymi i zamówionymi w tej rundzie –
    także konkurencji, jak zakładka Klienci ▸ Strefy) i promocjami drużyny (silnik/rynek/reklama.py,
    promocje.py)."""
    w_lokalu = d.get("w_lokalu") if isinstance(d.get("w_lokalu"), dict) else {}
    moje: dict = {}
    for lok in dzial:
        wl = w_lokalu.get(lok.id) or {}
        menu = wl.get("oferta", d.get("oferta"))
        dania = [u for u in (menu if isinstance(menu, dict) else pl.menu(f, lok)) if u in dane.uslugi]
        sprz = wl.get("sprzedaz", d.get("sprzedaz"))
        sprz = sprz if isinstance(sprz, dict) else {}
        ceny_l, v = pl.ceny(f, lok), pl.widok(f, lok.id)
        wyp = mnoznik_wyposazenia(dane, pl.lista(f, lok, "wyposazenie"))
        for u in dania:
            if isinstance(sprz.get(u), dict) and sprz[u].get("cena") is not None:
                cena = float(sprz[u]["cena"]) - float(sprz[u].get("rabat") or 0)
            elif u in ceny_l:
                cena = ceny_l[u].cena - ceny_l[u].rabat
            else:
                cena = float(dane.uslugi[u]["cena_preferowana"])   # jak silnik/decyzje.py: _ceny_domyslne
            moje.setdefault(lok.id, {})[u] = {"strefa": dane.lokale[lok.id]["strefa"], "cena": max(0.01, cena),
                                              "jakosc": jakosc_uslugi(dane, v, u) or (2, 2, 2), "wyposazenie": wyp,
                                              "rozruch": pp.rozruch(dane, lok, runda),
                                              "zadowolenie": pp.zadowolenie_lokalu(dane, lok)}
    if not moje:
        return {}
    konkurencja = pp.oferty_konkurencji(dane, stan, runda, f.nazwa)
    g, ef = _marketing_rundy(dane, stan, f, d, runda, moje)
    if ef:
        for n, lokale in konkurencja.items():
            for o in (o for ofl in lokale.values() for o in ofl.values()):
                o["reklama_strefy"] = ef["firmy"].get(n, {})
        for o in (o for ofl in moje.values() for o in ofl.values()):
            o["reklama_strefy"] = ef["firmy"].get(f.nazwa, {})
    pm.efekty_ofert(dane, g, moje, runda, pp.dni_rundy(dane, runda))
    return pp.prognoza(dane, runda, {**konkurencja, f.nazwa: moje}, f.nazwa, (ef or {}).get("pula"))["lokale"]


def _marketing_rundy(dane: Dane, stan: StanGry, f: Firma, d: dict, runda: int, moje: dict) -> tuple[Firma, dict | None]:
    """K4: firma (kopia) z kampaniami i promocjami z decyzji rundy (bez kosztów – księga na brudno) i efekty kampanii
    wszystkich firm w rundzie (rk.efekty_rundy; None – gra bez agencji). Dania z prognozy liczą się jako
    w sprzedaży (promocja na nowe danie)."""
    g = f.model_copy(update={"kampanie": list(f.kampanie), "promocje": list(f.promocje),
                             "pamiec_promocji": list(f.pamiec_promocji), "ceny": dict(f.ceny)})
    if d.get("kampanie") and rk.zasady(dane):
        rk.zamow(dane, g, d, runda, Ksiega(), Rachunek())
    if "promocje" in d:
        for u in {u for ofl in moje.values() for u in ofl} - set(g.ceny):
            g.ceny[u] = Cena(cena_gr=1)
        pm.ustaw(dane, g, d, runda, Ksiega(), Rachunek())
    ef = rk.efekty_rundy(dane, {**stan.firmy, f.nazwa: g}, runda) if rk.zasady(dane) else None
    return g, ef


# --- księgowość: biuro zamiast samodzielnej księgowości ---------------------------------------------------------

def _ksiegowosc(dane: Dane, f: Firma, d: dict, wybrane: dict) -> dict:
    """Firma na samodzielnej księgowości (albo drużyna ją wybrała – wybór pominięty w `d`) – najtańsze biuro przy
    jej dokumentach i umowach (jak bot: silnik/boty.py); deklaracja za poprzednią rundę rozlicza się wtedy jak przy
    biurze (bez kary – silnik/ksiegowosc/biuro.py). Bez biura w ogóle (podstawa gry – wybór biura z mapy) – bez zmian."""
    wybor = d.get("biuro") or (bo.SAMODZIELNIE if wybrane.get("biuro") == bo.SAMODZIELNIE else None) or f.biuro
    if not bo.biura(dane) or wybor != bo.SAMODZIELNIE:
        return {}
    dok, umowy = bo.ustawienia(dane)["szacunek_dokumentow"], bo._umowy(dane, f)
    biuro = bo.najtansze(dane, dok, *umowy)
    return {"biuro": biuro, "pakiet": bo.najlepszy_pakiet(dane, bo.biura(dane)[biuro], dok, *umowy)}


# --- urzędy: higiena domyślna, bez polis ------------------------------------------------------------------------

def _urzedy(dane: Dane, f: Firma) -> dict:
    zmiany: dict = {}
    if (h := fn._higiena_domyslna(dane)) and f.higiena not in (None, h):
        zmiany["higiena"] = h
    if aw.dane_wypadkow(dane) and f.polisy:
        zmiany["polisy"] = []   # trwające polisy wypowiedziane (awaria albo wypadek – cała kwota)
    return zmiany


# --- K1: ponowne zakrycie – co przepada ---------------------------------------------------------------------------

def przepadki_rundy(dane: Dane, stan: StanGry, konf: dict, runda: int, ksiegi: dict[str, Ksiega]) -> dict[str, dict]:
    """`przepadek` każdej firmy (stan zmieniany w miejscu – kopia w przeliczeniu rundy); {firma: wynik} tylko firm,
    którym coś przepadło. Gra bez `funkcje` – pusto, bez zmian w stanie."""
    if not konf.get("funkcje") or not fn.rejestr(dane):
        return {}
    wynik = {}
    for nazwa in sorted(stan.firmy):
        if (p := przepadek(dane, stan.firmy[nazwa], konf, runda, ksiegi[nazwa]))["bledy"]:
            wynik[nazwa] = p
    return wynik


def przepadek(dane: Dane, f: Firma, konf: dict, runda: int, ksiega: Ksiega) -> dict:
    """Funkcje, które drużyna znów zakryła i od tej rundy robi je gra: firma traci to, co w nich kupiła (bez zwrotu
    pieniędzy). Zwraca {"bledy": [uwaga na każdą funkcję, w której coś przepadło], "majatek": wartość utraconego
    majątku po cenach zakupu (do rozwoju firmy – jak sprzedaż)}."""
    wynik: dict = {"bledy": [], "majatek": 0.0}
    if not konf.get("funkcje"):
        return wynik
    for k, opis in fn.rejestr(dane).items():
        if k not in _PRZEPADA or not fn.zakryta_ponownie(konf, f.nazwa, k, runda):
            continue
        utracone = _PRZEPADA[k](dane, f, runda, ksiega, wynik)
        if utracone:
            wynik["bledy"].append({
                "poziom": "pomaranczowy", "zakladka": opis["zakladki"][0], "zakrycie": k,
                "tekst": f"Funkcja {opis['nazwa']} znów zakryta. Przepadło – {'; '.join(utracone)}. "
                         "Zapłacone pieniądze nie wracają."})
    return wynik


def _ile(tekst: str, n: int) -> list[str]:
    return [f"{tekst} ({n})"] if n else []


def _marketing(dane: Dane, f: Firma, runda: int, ksiega: Ksiega, wynik: dict) -> list[str]:
    """Kampanie z efektem w tej rundzie (emisja, narastanie, wygasanie) znikają; promocje kończy decyzja gry
    (`decyzje_firmy` – bez promocji); narzędzia internetowe – wyłączone."""
    trwaja = [k for k in f.kampanie if rk.dziala(dane, k, runda)]
    f.kampanie = [k for k in f.kampanie if k not in trwaja]
    narzedzia, f.internet = len(f.internet), {}
    return (_ile("kampanie reklamowe", len(trwaja)) + _ile("promocje", len(f.promocje))
            + _ile("narzędzia internetowe", narzedzia))


def _handel(dane: Dane, f: Firma, runda: int, ksiega: Ksiega, wynik: dict) -> list[str]:
    """Ogłoszenia drużyny na giełdzie handlu znikają przed licytacją (towar i sprzęt zostają w firmie)."""
    n, f.ogloszenia = len(f.ogloszenia), []
    return _ile("ogłoszenia na giełdzie handlu", n)


def _likwiduj(dane: Dane, f: Firma, rodzaj: str, ksiega: Ksiega, wynik: dict) -> list[str]:
    """Wszystkie sztuki wyposażenia / udogodnień we wszystkich lokalach – jak likwidacja: bez przychodu,
    niezamortyzowana wartość środka trwałego w kosztach (KPiR, bez ruchu na rachunku), majątek mniejszy o cenę."""
    if not (any(pl.lista(f, lok, rodzaj) for lok in f.lokale) or getattr(f, rodzaj)):
        return []
    pozycje, nazwy = dane.pozycje(rodzaj), []
    pl.utrwal(f)
    for lok, lista in ([(lok, getattr(lok, rodzaj)) for lok in f.lokale] or [(None, getattr(f, rodzaj))]):
        for n in list(lista):
            lista.remove(n)
            if lok is None or not st_trwale.sprzedaj(f, pl.nazwa_srodka(f, lok, n), ksiega, "zlikwidowanego"):
                st_trwale.sprzedaj(f, n, ksiega, "zlikwidowanego")
            cena = (pozycje.get(n) or {}).get("cena", 0.0)
            st_trwale.zmniejsz_majatek(f, cena)
            wynik["majatek"] += cena
            nazwy.append(n)
    if f.lokale:
        pl.synchronizuj(f)
    else:
        setattr(f, rodzaj, [])
    return nazwy


def _wyposazenie(dane: Dane, f: Firma, runda: int, ksiega: Ksiega, wynik: dict) -> list[str]:
    nazwy = _likwiduj(dane, f, "wyposazenie", ksiega, wynik)
    return [f"wyposażenie lokali: {', '.join(nazwy)}"] if nazwy else []


def _rozwoj(dane: Dane, f: Firma, runda: int, ksiega: Ksiega, wynik: dict) -> list[str]:
    """Trwające szkolenia się urywają, udogodnienia – jak wyposażenie."""
    przerwane = [s for s in f.szkolenia if s.do_rundy >= runda]
    f.szkolenia = [s for s in f.szkolenia if s.do_rundy < runda]
    nazwy = _likwiduj(dane, f, "udogodnienia", ksiega, wynik)
    return ([f"szkolenia: {', '.join(s.szkolenie for s in przerwane)}"] if przerwane else []) + (
        [f"udogodnienia: {', '.join(nazwy)}"] if nazwy else [])


def _urzedy_przepadek(dane: Dane, f: Firma, runda: int, ksiega: Ksiega, wynik: dict) -> list[str]:
    """Polisy wypowiada i higienę domyślną ustawia decyzja gry (`_urzedy`) – tu tylko uwaga dla drużyny."""
    h = fn._higiena_domyslna(dane)
    return (_ile("polisy ubezpieczeniowe", len(f.polisy) if aw.dane_wypadkow(dane) else 0)
            + (["własny poziom higieny (wraca domyślny)"] if h and f.higiena not in (None, h) else []))


_PRZEPADA = {"marketing": _marketing, "handel": _handel, "wyposazenie": _wyposazenie, "rozwoj": _rozwoj,
             "urzedy": _urzedy_przepadek}
