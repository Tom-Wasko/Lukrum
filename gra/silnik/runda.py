"""Przeliczenie jednej rundy dla wszystkich firm.

Runda r = tydzień r gry z lokalami (dane/mapa). Kolejność jak w KPiR i banku gry:
 1. licytacje lokali i budynków, giełda handlu (licytacje ogłoszeń), rynek pracy (wspólna pula kandydatów),
 2. bank: deklaracje za poprzednią rundę, lokaty, kredyty, leasing, Harpagon, portfel właściciela,
 3. decyzje: lokal, stanowiska, sprzęt, kadry, dostawy, udogodnienia, wyposażenie, kampanie, promocje, szkolenia,
    polisy, higiena, eventy w parkach,
 4. od rundy 2: popyt strefowy → obsługa klientów w lokalach → przychody,
 5. koszty rundy: pensje + ZUS, utrzymanie, lokale, amortyzacja, wynajęta chłodnia i sanepid (silnik/kuchnia/magazyn.py),
    bank, biuro rachunkowe,
 6. rozliczenie JDG (składki, zaliczka PIT, VAT), kredyt odnawialny przy braku gotówki,
 7. karta wyników (od rundy 2; w grze widoczna od rundy 3).
"""
from __future__ import annotations

import numpy as np

from . import autopilot as ap
from . import boty as bt
from . import funkcje as fn
from .dane import KUCHNIA, Dane
from .decyzje import lista_bledow, zastosuj
from .ksiegowosc import biuro as bo
from .ksiegowosc import rozliczenie as rz
from .ksiegowosc import urzad as urz
from .ksiegowosc.finanse import (
    Ksiega,
    Rachunek,
    ksieguj,
    uruchom_odnawialny,
    wyrownaj_gotowke,
    zadluzenie,
)
from .ksiegowosc.srodki_trwale import amortyzuj, amortyzuj_majatek, ewidencja, ustaw_niskocenne
from .ksiegowosc.uzgodnienie import uzgodnij
from .kuchnia import magazyn as mag
from .kuchnia import menu
from .kuchnia.dostawcy import ceny_rundy
from .kuchnia.operacje import kasjerzy
from .losowosc import strumien
from .ludzie import czas_wlasciciela as cw
from .ludzie import formy as fz
from .ludzie import rynek_pracy as rp
from .ludzie import zadowolenie as zo
from .ludzie.kandydaci import dodaj_nowych
from .model import Firma, StanGry, do_slownika
from .nieruchomosci import lokale as lk
from .nieruchomosci import per_lokal as pl
from .nieruchomosci import przejecia as pr
from .pieniadze import banki as bk
from .pieniadze import inwestor as inw
from .pieniadze import kasyno as kas
from .pieniadze import lichwiarz as lw
from .pieniadze import wlasciciel as wl
from .rynek import handel as hd
from .rynek import konkurencja as kn
from .rynek import opinie as op
from .rynek import popyt as pp
from .rynek import promocje as pm
from .rynek import reklama as rk
from .swiat import awarie as aw
from .swiat import zdarzenia as zd
from .wyniki import karta as kw
from .wyniki.majatek import majatek_netto

EPS = 1e-9


def przelicz_runde(dane: Dane, stan: StanGry, decyzje: dict[str, dict], konfiguracja: dict,
                   podglad: bool = False) -> StanGry:
    """Zwraca nowy stan po rundzie stan.runda + 1 (stan wejściowy nie jest zmieniany).
    `podglad` – „Analiza – co jeśli”: deklaracje samodzielnej księgowości nie są sprawdzane (silnik/ksiegowosc/biuro.py)."""
    s = stan.kopia()
    r = stan.runda + 1
    if not lk.tryb_lokali(dane, konfiguracja):
        raise ValueError("Gra bez lokali nie jest obsługiwana – potrzebne dane z mapą miasta.")
    ziarno = konfiguracja["ziarno"]
    decyzje = {n: fz.przytnij(dane, d, konfiguracja) for n, d in decyzje.items()}   # UF21: formy wyłączone przez MG
    ksiegi = {n: Ksiega(vat=rz.reguly_vat(dane)) for n in sorted(s.firmy)}
    # funkcje gry (silnik/autopilot.py): przy ponownym zakryciu przepada to, co drużyna w funkcji kupiła (K1);
    # decyzje wyłączonych funkcji pomijane, zakryte i wyłączone robi gra
    przepadki = ap.przepadki_rundy(dane, s, konfiguracja, r, ksiegi)
    decyzje, bledy_funkcji = ap.decyzje_rundy(dane, s if przepadki else stan, decyzje, konfiguracja, r)
    if r >= 2:
        s.kandydaci = dodaj_nowych(dane, s.kandydaci, ziarno, r)
    ceny_dost = ceny_rundy(dane, ziarno, r, konfiguracja.get("ceny_dostawcow", "dane"))
    nazwy = sorted(s.firmy)
    kolejnosc = list(strumien(ziarno, r, "kolejnosc").permutation(nazwy))

    rachunki, info, bledy, odnawialny = {}, {}, {}, {}
    # domyślnie "na_biezaco" (jak w banku); "jednoczesnie" (jak w oficjalnej grze): przychody i wydatki miesiąca rozliczane razem – kredyt odnawialny tylko
    # na niedobór na koniec miesiąca; "na_biezaco": wydatki z decyzji opłacane przed wpływem przychodów
    tryb_kredytu = konfiguracja.get("kredyt_odnawialny", "na_biezaco")
    start = {n: {"magazyn": dict(f.magazyn), "gotowka": f.gotowka, "pracownicy": len(f.pracownicy), "uslugi": len(f.oferta)}
             for n, f in s.firmy.items()}
    for nazwa in nazwy:
        rachunki[nazwa] = Rachunek()
    # inwestor ratunkowy od mistrza gry, potem blokada inwestycji i kredytów przy debecie ponad limit (Z3) – przed
    # licytacjami lokali i budynków (silnik/pieniadze/inwestor.py)
    decyzje, inwestor, blokady = dict(decyzje), {}, {}
    for nazwa in nazwy:
        f = s.firmy[nazwa]
        inwestor[nazwa] = inw.poczatek_rundy(dane, f, inw.przyznany(konfiguracja, nazwa, r), r, rachunki[nazwa])
        d, blokady[nazwa] = inw.blokada(dane, f, decyzje.get(nazwa, {}))
        blokady[nazwa] = inw.alarm(dane, f) + blokady[nazwa]   # U2: alarm na górze listy błędów
        if blokady[nazwa]:
            decyzje[nazwa] = d
        ustaw_niskocenne(dane, f, decyzje.get(nazwa, {}))   # B6: przed zakupami rundy (giełda, lokale)
    # wyprowadzki po wypowiedzeniu najmu, potem licytacje lokali i budynków (silnik/nieruchomosci/przejecia.py)
    wyprowadzki = pr.koniec_najmu(dane, s, r, ksiegi, rachunki)
    lic = pr.licytacje(dane, s.firmy, decyzje, r, ziarno, lk.zajete(s.firmy))
    przetargi, przegrane = lic["przetargi"], lic["przegrane"]
    # giełda handlu: licytacje ogłoszeń z poprzedniej rundy – przed zakupami (silnik/rynek/handel.py)
    handel = hd.rozstrzygnij(dane, s.firmy, decyzje, r, ksiegi, rachunki, ziarno)
    zajete = lk.zajete(s.firmy)
    # agencja pracy: limit nowych, licytacje kandydatów, podkupienia i kontroferty (silnik/ludzie/rynek_pracy.py)
    decyzje, rezerwacje, rynek_pracy = rp.przed_decyzjami(dane, s, decyzje, r, ziarno,
                                                          podkupywanie=rp.podkupywanie(konfiguracja))
    for nazwa in kolejnosc:
        f = s.firmy[nazwa]
        d = decyzje.get(nazwa, {})
        poprzednia_oferta = list(f.oferta)
        for p in f.pracownicy.values():
            p.premia = 0.0
        # lokaty i kredyty na początku rundy, przed zakupami (saldo w trakcie rundy może być ujemne)
        ksiegowosc = bo.rozlicz_deklaracje(dane, f, d, r, rachunki[nazwa], podglad)   # samodzielna księgowość
        bank_info = bk.poczatek_rundy(dane, f, d, r, ksiegi[nazwa], rachunki[nazwa])   # sześć banków z mapy
        harpagon_info = lw.poczatek_rundy(dane, f, d, r, rachunki[nazwa])   # gotówka poza KPiR
        # wypłata własna → klub (tylko z zaproszeniem) → wpłata własna; prywatny portfel, poza KPiR
        portfel_info = wl.poczatek_rundy(dane, f, d, r, rachunki[nazwa], ziarno, podglad)
        lokal = lk.wybierz(dane, f, d.get("lokal"), r, zajete, ksiegi[nazwa], rachunki[nazwa],
                           przegrane.get((nazwa, "lokal")), bk.finansowanie_lokalu(dane, f, d, r), len(s.firmy))
        bk.kredyty_na_lokal(dane, f, bank_info, r, ksiegi[nazwa], rachunki[nazwa])   # pod zastaw kupionego lokalu
        # kupno budynku z najemcą (B6: kredyt pod jego zastaw liczy się do gotówki), wypowiedzenia najmu
        # (silnik/nieruchomosci/przejecia.py)
        info_przejecia = {"przejecie": pr.przejmij(dane, s.firmy, nazwa, d.get("przejecie"), r,
                                                   przegrane.get((nazwa, "przejecie")), ksiegi[nazwa], rachunki[nazwa],
                                                   bk.finansowanie_lokalu(dane, f, d, r, przejecie=True)),
                          "wypowiedzenia": pr.wypowiedz(dane, s.firmy, nazwa, d.get("wypowiedz"), r)}
        bk.kredyty_na_lokal(dane, f, bank_info, r, ksiegi[nazwa], rachunki[nazwa], przejecie=True)   # B6: budynku
        przed = dict(f.pracownicy)
        pula = rp.pula_dla(s.kandydaci, rezerwacje, nazwa)
        info[nazwa] = zastosuj(dane, f, d, r, pula, ceny_dost, ksiegi[nazwa], rachunki[nazwa])
        if utracony := (przepadki.get(nazwa) or {}).get("majatek"):   # K1: przepadek – jak sprzedaż (rozwój firmy)
            info[nazwa]["sprzedany_majatek"] += utracony
            info[nazwa]["majatek_przed"] += utracony
        info[nazwa]["ksiegowosc"] = ksiegowosc
        info[nazwa]["leasing"] = bk.leasing_wez(dane, f, d, r, ksiegi[nazwa], rachunki[nazwa])   # już od tej rundy
        info[nazwa]["harpagon"] = harpagon_info
        info[nazwa]["wlasciciel"], info[nazwa]["kasyno"] = portfel_info
        info[nazwa]["przejecia"] = info_przejecia
        # higiena i odbiór lokali przez sanepid – po lokalach i inwestycjach (silnik/ksiegowosc/urzad.py)
        info[nazwa]["urzad"] = urz.ustaw(dane, f, d, r, ziarno, ksiegi[nazwa], rachunki[nazwa])
        # wspólna pula: zatrudnieni z niej znikają, zwolnieni wracają
        zatrudnieni = set(info[nazwa]["zatrudnieni"])
        s.kandydaci = [k for k in s.kandydaci if k["id"] not in zatrudnieni] \
            + [rp.jako_kandydat(przed[pid]) for pid in info[nazwa]["zwolnieni"]]
        bledy[nazwa] = blokady[nazwa] + inw.bledy(f, inwestor[nazwa]) + bledy_funkcji.get(nazwa, [])             + (przepadki.get(nazwa) or {}).get("bledy", [])
        bledy[nazwa] += wl.bledy(info[nazwa]["wlasciciel"], info[nazwa]["kasyno"])
        if dane.zdarzenia:   # eventy w parkach: czas, gotówka, porcje, skutki (silnik/swiat/zdarzenia.py)
            czas = cw.z_podsumowania(info[nazwa]["czas_wlasciciela"])
            info[nazwa]["zdarzenia"] = zd.rozegraj(dane, f, d, r, ziarno, ksiegi[nazwa], rachunki[nazwa], czas)
            # detektyw: zlecenie obserwacji rywala – godziny i koszt teraz, raport po wynikach wszystkich firm
            info[nazwa]["konkurencja"] = kn.zlec(dane, f, d, r, ziarno, nazwy, ksiegi[nazwa], rachunki[nazwa], czas, podglad)
            bledy[nazwa] += kn.bledy(info[nazwa]["konkurencja"])
            info[nazwa]["czas_wlasciciela"] = czas.podsumowanie()
            s.kandydaci += info[nazwa]["zdarzenia"].pop("kandydaci")
            bledy[nazwa] += info[nazwa]["zdarzenia"]["bledy"]
        cw.zastosuj(dane, f, info[nazwa])   # wolne godziny właściciela – na puste stanowisko
        bledy[nazwa] += lista_bledow(dane, f, d, r, poprzednia_oferta, tryb_kredytu, lokal, info[nazwa])
        if (info[nazwa]["ksiegowosc"] or {}).get("kara"):
            ksg = info[nazwa]["ksiegowosc"]
            bledy[nazwa].append({"poziom": "czerwony", "zakladka": "finanse_biuro",
                                 "tekst": f"Deklaracje za rundę {ksg['za_runde']}: mandat {ksg['kara']:.0f} zł"
                                          + (" – niezłożone." if ksg["tryb"] == "brak" else " – błędne kwoty, urząd zrobił korektę.")})
        info[nazwa]["lokal"] = lokal
        if bank_info is not None:
            info[nazwa]["bank"] = bank_info
        odnawialny[nazwa] = uruchom_odnawialny(f, rachunki[nazwa]) if tryb_kredytu == "na_biezaco" else 0.0

    # przejścia pracowników po okresie wypowiedzenia, opłaty headhuntera
    rp.po_decyzjach(dane, s, r, rynek_pracy, ksiegi, rachunki)
    for nazwa in nazwy:
        rynek_pracy[nazwa]["zatrudnieni"] = info[nazwa].get("kanaly_zatrudnienia", [])
        rynek_pracy[nazwa]["przeniesieni"] = info[nazwa].get("przenosiny", [])   # UF20: obsada i przenosiny
        rynek_pracy[nazwa]["odrzucone"] = [{k: v for k, v in o.items() if k != "tekst"}   # kalibracja B9
                                           for o in info[nazwa].get("odrzucone_oferty", [])]
        info[nazwa]["rynek_pracy"] = rynek_pracy[nazwa]
        bledy[nazwa] += [{"poziom": "czerwony", "zakladka": "rynek_pracy", "tekst": t} for t in rynek_pracy[nazwa]["uwagi"]]
        bledy[nazwa] += pr.bledy(dane, s.firmy, nazwa, r, info[nazwa]["przejecia"])
        # presja Harpagona na dłużnika: przypomnienia, odsetki karne, wizyty (pracownik, który odszedł – do puli)
        info[nazwa]["harpagon_presja"], odszedl = lw.presja(dane, s.firmy[nazwa], nazwa, r, ziarno, ksiegi[nazwa],
                                                            rachunki[nazwa])
        if odszedl:
            s.kandydaci.append(rp.jako_kandydat(odszedl))

    # --- rynek i sprzedaż ----------------------------------------------------------------------
    popyt, obsluga, oferty = {}, {}, {}
    strefowy = None
    opinie_rundy: dict = {}
    kampanie = rk.efekty_rundy(dane, s.firmy, r, ziarno) if rk.zasady(dane) is not None else None   # agencje reklamowe
    if r >= 2:
        oferty_lok = {}
        for nazwa in nazwy:
            f = s.firmy[nazwa]
            # popyt strefowy: oferty lokali (zadowolenie klientów z karty poprzedniej rundy)
            zk = ((s.wyniki.get(r - 1) or {}).get(nazwa, {}).get("karta") or {}).get("zadowolenie_klientow")
            mn_firmy = f.baza_klientow * (1 - info[nazwa]["harpagon_presja"]["odplyw"])   # Harpagon odstrasza gości
            mn_firmy *= zd.mnoznik_popytu(f, r)   # skutki eventów w parkach
            mn_firmy *= bt.przewaga_popytu(dane, konfiguracja, nazwa)   # bot niemożliwy oszukuje
            oferty_lok[nazwa] = pp.oferty_lokali(dane, f, r, {   # ceny, menu i wyposażenie – każdego lokalu (Z2)
                "reklama": 0.0, "mnoznik_firmy": mn_firmy,
                "zadowolenie": pp.mnoznik_zadowolenia(dane, zk),
                "reklama_strefy": (kampanie or {}).get("firmy", {}).get(nazwa, {})})
            pm.efekty_ofert(dane, f, oferty_lok[nazwa], r, pp.dni_rundy(dane, r))
        strefowy = pp.rynek_lokali(dane, s.firmy, oferty_lok, r, ziarno, (kampanie or {}).get("pula"),
                                   {n: info[n].get("przewozy") or [] for n in nazwy})
        popyt, obsluga, rynek = strefowy["popyt"], strefowy["obsluga"], strefowy["rynek"]
        opinie_rundy = op.po_rundzie(dane, s.firmy, strefowy, oferty_lok, r, ziarno)   # U24: opinie klientów o lokalach
        for nazwa, lokale in oferty_lok.items():  # oferta firmy: jakość lokalu z największym popytem dania
            for u in popyt[nazwa]:
                lok = max((x for x in lokale if u in lokale[x]), key=lambda x: rynek[u][nazwa]["skladniki"]["lokale"][x])
                oferty.setdefault(u, {})[nazwa] = lokale[lok][u]
        for nazwa in nazwy:
            promo = (strefowy or {}).get("promocje", {}).get(nazwa)   # przychód z rabatami promocji
            przych = info[nazwa]["przychod_sprzedazy"] = strefowy["przychod"].get(nazwa, {})   # suma lokali (Z2)
            for u in obsluga[nazwa]["obsluzeni"]:
                ksieguj(s.firmy[nazwa], ksiegi[nazwa], rachunki[nazwa], f"Sprzedaż: {menu.nazwa_dania(dane, u, firma=s.firmy[nazwa])}",
                        przych.get(u, 0.0), "przychod", stawka=rz.stawka_sprzedazy(dane, u))
            if promo:
                pm.ksieguj_sprzedaz(dane, s.firmy[nazwa], ksiegi[nazwa], rachunki[nazwa], promo,
                                    rz.stawka_sprzedazy(dane, "napoj") if "napoj" in dane.uslugi else None)
    else:
        rynek = {}

    # --- koszty rundy, bank, podatek -----------------------------------------------------------
    # pensje, utrzymanie, czynsz i opłaty są w danych miesięczne – dane.na_runde przelicza je na rundę
    wyniki = {}
    for nazwa in nazwy:
        f, ks, rach = s.firmy[nazwa], ksiegi[nazwa], rachunki[nazwa]
        d = decyzje.get(nazwa, {})
        # premia: osobna pozycja na pracownika, w kolumnie wynagrodzeń, bez ZUS (np. 3 × 500 premii nie podnosi
        # ZUS: 9576 = 19% samych pensji 50 400)
        for p in f.pracownicy.values():
            if p.premia > 0:
                ksieguj(f, ks, rach, f"Bonus dla pracownika: {p.imie_nazwisko}", p.premia, "wynagrodzenia")
        # UF21: kontrakt B2B – faktura z VAT zamiast wynagrodzenia; ZUS pracodawcy wg formy (student na zleceniu – 0)
        b2b = [p for p in f.pracownicy.values() if fz.forma(dane, p.umowa).get("faktura")]
        ksieguj(f, ks, rach, "Wynagrodzenia pracowników",
                dane.na_runde(sum(p.pensja for p in f.pracownicy.values() if p not in b2b)), "wynagrodzenia")
        ksieguj(f, ks, rach, "Składki ZUS pracodawcy",
                dane.na_runde(sum(p.pensja * fz.stawka_zus(dane, p.umowa, p.student) for p in f.pracownicy.values())))
        for p in b2b:
            opis, kwota = f"{fz.forma(dane, p.umowa)['faktura']}: {p.imie_nazwisko}", dane.na_runde(p.pensja)
            ksieguj(f, ks, rach, opis, kwota * (1 + ks.stawka_vat(opis)) if ks.vat is not None else kwota)
        utrz_sprzetu = sum(dane.sprzet[n]["utrzymanie"][str(q)] for st in f.stanowiska for n, q in st.sprzet.items())
        ksieguj(f, ks, rach, "Koszty utrzymania sprzętu", dane.na_runde(utrz_sprzetu))
        ud, wy = dane.pozycje("udogodnienia"), dane.pozycje("wyposazenie")
        ksieguj(f, ks, rach, "Koszty utrzymania udogodnień i benefitów",
                dane.na_runde(sum(ud[n]["utrzymanie"] for n in f.udogodnienia)
                              + sum(wy[n]["utrzymanie"] for n in f.wyposazenie)))
        lk.koszty_rundy(dane, f, r, ks, rach, s.firmy)
        amortyzuj(dane, f, r, ks)
        amortyzuj_majatek(dane, f, info[nazwa]["majatek_przed"])
        # wynajęta chłodnia i kontrola sanepidu (silnik/kuchnia/magazyn.py)
        info[nazwa]["magazyn"] = mag.koniec_rundy(dane, f, r, ziarno, (strefowy or {}).get("swiezosc", {}).get(nazwa) or {},
                                                  ks, rach, urz.modyfikatory(dane, f, r))
        bank_koniec = bk.koniec_rundy(dane, f, r, ks, rach, {b.id: n[1] for b in f.budynki if (n := pr.najem(s.firmy, b.id))})
        info[nazwa]["harpagon_odsetki"] = lw.koniec_rundy(dane, f, r)   # doliczone do długu, poza KPiR
        if not podglad:   # zaproszenie do klubu na następną rundę
            info[nazwa]["zaproszenie"] = kas.zaproszenie(dane, f, r, ziarno, konfiguracja["liczba_rund"],
                                                         bool(konfiguracja.get("kasyno_botow")))
        if f.biuro in bo.biura(dane):   # biura z mapy albo samodzielna księgowość (silnik/ksiegowosc/biuro.py)
            info[nazwa]["biuro"] = bo.nalicz(dane, f, ks, rach, *bo._umowy(dane, f))
        # JDG: składki właściciela, zaliczka PIT i VAT (silnik/ksiegowosc/rozliczenie.py)
        samodzielnie = bo.zamknij_samodzielnie(f, r >= konfiguracja["liczba_rund"])
        stan_przed = bo.stan_rozliczen(f)
        info[nazwa]["rozliczenie"] = rz.rozlicz(dane, f, r, ks, rach, zaplac=not samodzielnie)
        podatek = info[nazwa]["rozliczenie"]["zaliczka"] + info[nazwa]["rozliczenie"]["zdrowotna"]
        if not samodzielnie and "biuro" in info[nazwa]:
            info[nazwa]["biuro"]["blad"] = bo.blad_biura(dane, f, nazwa, r, ziarno, rach)
        # udział inwestora ratunkowego w dochodzie netto – przed wyrównaniem gotówki (silnik/pieniadze/inwestor.py)
        udzial_inwestora = inw.koniec_rundy(f, r, round(ks.dochod - podatek, 2), rach)
        wyrownaj_gotowke(f, rach, odnawialny[nazwa])
        if samodzielnie:   # dokumenty rundy – po ostatniej operacji (także kredycie odnawialnym)
            bo.otworz(f, r, ks, rach, info[nazwa]["rozliczenie"], stan_przed)
        bledy[nazwa] += bk.bledy(dane, f, info[nazwa].get("bank"), bank_koniec)
        bledy[nazwa] += lw.bledy(dane, f, info[nazwa].get("harpagon"), r + 1)
        netto = round(ks.dochod - podatek, 2)
        f.skumulowany_dochod_netto = round(f.skumulowany_dochod_netto + netto, 2)
        wyniki[nazwa] = w = _wyniki_firmy(dane, f, r, ks, rach, info[nazwa], popyt.get(nazwa, {}),
                                          obsluga.get(nazwa), oferty, rynek, start[nazwa], bledy[nazwa], netto)
        odejscia = zo.po_rundzie(dane, f, w, r, ziarno, info[nazwa]["szkolenia_procent"])   # U20
        if odejscia is not None:
            w["odejscia_pracownikow"] = odejscia
        w["lokale"] = lk.stan_lokali(dane, f, r)
        w["lokal_decyzja"] = info[nazwa]["lokal"]
        w["przejecia"] = pr.raport(dane, s.firmy, nazwa, r, info[nazwa]["przejecia"], przetargi, wyprowadzki.get(nazwa, []))
        w["dostawy"] = info[nazwa].get("dostawy")
        if info[nazwa].get("auto_dostawy", {}).get("lokale"):   # Z4: zakupy auto-dostawcy
            w["auto_dostawy"] = info[nazwa]["auto_dostawy"]
        w["czas_wlasciciela"] = info[nazwa].get("czas_wlasciciela")
        w["zdarzenia"] = info[nazwa].get("zdarzenia")
        if aw.dane_wypadkow(dane):
            w["ubezpieczenia"] = aw.raport(info[nazwa].get("ubezpieczenia"), info[nazwa].get("zdarzenia"))
        w["magazyn"] = info[nazwa].get("magazyn")
        if urz.dane_urzedu(dane):
            w["urzad"] = urz.raport(info[nazwa].get("urzad"), info[nazwa].get("magazyn"))
        w["biuro"] = info[nazwa].get("biuro")
        if wl.dane_portfela(dane):
            w["wlasciciel"] = {**(info[nazwa].get("wlasciciel") or {}), "portfel": wl.portfel(dane, f)}
        klub = kas.raport(info[nazwa].get("kasyno"), info[nazwa].get("zaproszenie"))
        if klub:
            w["kasyno"] = klub
        w["ksiegowosc"] = info[nazwa].get("ksiegowosc")
        w["samodzielnie"] = f.deklaracja is not None   # deklaracje za tę rundę – w następnej
        w["rynek_pracy"] = info[nazwa].get("rynek_pracy")
        w["srodki_trwale"] = ewidencja(f)
        if kampanie:
            w["reklama_agencje"] = {"zamowione": (info[nazwa].get("kampanie") or {}).get("zamowione", []),
                                    "kampanie": kampanie["kampanie"].get(nazwa, []), "pula_stref": kampanie["pula"],
                                    "laczne": {z: {"suma": x, "dziala": kampanie["firmy"][nazwa][z]}   # P10: sufit
                                               for z, x in kampanie["suma"].get(nazwa, {}).items()}}
        w["bank"] = {"poczatek": info[nazwa].get("bank"), "koniec": bank_koniec, "leasing": info[nazwa].get("leasing"),
                     "historia": bk.historia(f, r), "debet_ponad_limit": bk.debet_ponad_limit(dane, f)}
        w["harpagon"] = {"poczatek": info[nazwa].get("harpagon"), "presja": info[nazwa].get("harpagon_presja"),
                         "odsetki": info[nazwa].get("harpagon_odsetki"), "stan": lw.stan(dane, f, r + 1)}
        w["majatek_netto"] = majatek_netto(f)   # Z2: składniki i razem
        w["alarm"] = bk.debet_ponad_limit(dane, f)   # Z3: alarm u mistrza gry, w następnej rundzie blokada
        w["inwestor"] = inw.raport(f, inwestor[nazwa], udzial_inwestora)
        if pm.zasady(dane):
            promo = (strefowy or {}).get("promocje", {}).get(nazwa)
            w["promocje"] = pm.raport(dane, f, nazwa, r, promo, info[nazwa].get("promocje") or {}, ziarno)
            for u, zl in (promo or {}).get("przychod", {}).items():
                if u in w["sprzedaz"]:
                    w["sprzedaz"][u]["przychod"] = round(zl, 2)
        if strefowy:
            w["klienci"] = strefowy["klienci"][nazwa]
            if nazwa in opinie_rundy:
                w["opinie"] = opinie_rundy[nazwa]
            w["swiezosc"] = strefowy["swiezosc"][nazwa]
            mag.dolicz_oddane(strefowy["swiezosc"][nazwa], (info[nazwa].get("zdarzenia") or {}).get("oddane"))
            _straty_w_zasobach(w["zasoby"], strefowy["swiezosc"][nazwa]["straty"])
        if "karta" in w and f.lokale:   # składniki kebabowe karty – po zebraniu wyników tygodnia
            w["karta_kebab"] = kw.kebab(dane, f, w, _netto_karty(dane, netto, info[nazwa]), zadluzenie(f))
            f.rozwoj_poprzedni = w["karta"]["rozwoj_firmy"]

    # giełda handlu: nowe ogłoszenia (drużyny i boty) po tygodniu sprzedaży, licytowane w następnej rundzie
    ogloszenia = hd.zamknij(dane, s.firmy, decyzje, r, wyniki, konfiguracja)
    for nazwa, w in wyniki.items():
        raport_handlu = hd.raport(handel.get(nazwa), ogloszenia.get(nazwa))
        if raport_handlu:
            w["handel"] = raport_handlu
            w["lista_bledow"].extend(hd.bledy(raport_handlu))
        w["lista_bledow"] = fn.bez_ukrytych(dane, konfiguracja, nazwa, r, w["lista_bledow"])
    for f in s.firmy.values():   # właściciel na stanowisku – tylko w tej rundzie
        f.wlasciciel_na = None
    s.runda = r
    s.wyniki[r] = wyniki
    s.rynek[r] = _rynek_publiczny(dane, s, r, oferty, wyniki, rynek)
    s.rynek[r]["lokale"] = lk.zajete(s.firmy)   # kto zajmuje który lokal (mapa miasta, zakładka Lokale – wyniki)
    s.rynek[r]["przejecia"] = pr.publiczne(dane, s.firmy, przetargi)
    if strefowy:
        s.rynek[r]["strefy"] = strefowy["strefy"]
    if op.ustawienia(dane):   # oceny i komentarze klientów widać na mapie
        s.rynek[r]["opinie"] = op.publiczne(s.firmy)
    if kampanie:   # reklamy widać na mieście: kto, gdzie i za ile
        s.rynek[r]["kampanie"] = rk.publiczne(dane, kampanie)
    if pm.zasady(dane):   # promocje widać na drzwiach lokali
        s.rynek[r]["promocje"] = pm.publiczne(dane, s.firmy)
    kn.raporty(dane, wyniki, {n: info[n].get("konkurencja") for n in nazwy}, r, ziarno)   # raporty detektywa i wpadki
    return s


def _straty_w_zasobach(zasoby: list[dict], straty: list[dict]) -> None:
    """Kolumna „straty” (przeterminowane i bez miejsca w chłodni) – przeniesiona z „wykorzystane”."""
    for row in zasoby:
        row["straty"] = 0.0
    for s in straty:
        row = next((x for x in zasoby if x["zasob"] == s["zasob"] and x["jakosc"] == s["jakosc"]), None)
        if row:
            przenies = min(s["ilosc"], row["wykorzystane"])
            row["straty"] = round(row["straty"] + przenies, 3)
            row["wykorzystane"] = round(row["wykorzystane"] - przenies, 3)


def _wyniki_firmy(dane, f: Firma, r, ks: Ksiega, rach: Rachunek, info, popyt, obsluga, oferty, rynek, start,
                  bledy, netto) -> dict:
    z = dane.z
    w = {"runda": r, "miesiac": dane.nazwa_rundy(r), "kpir": ks.do_slownika(),
         "rachunek": rach.operacje, "gotowka": f.gotowka, "kredyt_odnawialny": f.kredyt_odnawialny,
         "zadluzenie": zadluzenie(f), "lokaty": sum(l.kwota for l in f.lokaty), "lista_bledow": bledy,
         "uzgodnienie": uzgodnij(start["gotowka"], f.gotowka, ks, rach)}   # kasa = KPiR ± VAT ± poza KPiR
    # JDG: zaliczka PIT i składka zdrowotna; rejestr VAT
    w["kpir"].update(podatek=round(ks.dochod - netto, 2), dochod_netto=netto)
    w["rozliczenie"], w["vat"] = info["rozliczenie"], rz.rejestr(ks)

    # sprzedaż
    sprzedaz = {}
    if obsluga:
        for u, d in popyt.items():
            o = oferty[u][f.nazwa]
            sprzedaz[u] = {"popyt": d, "prognoza": f.oferta.get(u, 0), "sprzedaz": obsluga["obsluzeni"][u],
                           "utracona": obsluga["utracona"][u], "przyczyna": obsluga["przyczyna"].get(u, ""),
                           "cena": f.ceny[u].cena, "rabat": f.ceny[u].rabat, "cena_po_rabacie": o["cena"],
                           "przychod": round((info.get("przychod_sprzedazy") or {}).get(
                               u, obsluga["obsluzeni"][u] * o["cena"]), 2), "reklamacje": obsluga["reklamacje"][u],
                           "jakosc": o["jakosc"], "skladniki_popytu": rynek[u][f.nazwa]["skladniki"]}
    w["sprzedaz"] = sprzedaz

    # HR – czas pracy i wynagrodzenia. Jedna miara (decyzja autora 8.11.2026): `wykorzystanie` (tabela, zadowolenie,
    # przepracowanie w karcie) = `obciazenie` z _czas_pracy (półkola) – część pojemności stanowiska w lokalu
    godz = z["operacje"]["godziny_pracownika"]
    prac = []
    for p in f.pracownicy.values():
        cz = _czas_pracy(dane, f, obsluga, godz, p)
        prac.append({**do_slownika(p), "wykorzystanie": cz["obciazenie"], **cz,
                     **_obciazenie_dni(dane, f, obsluga, next((x for x in f.stanowiska if x.pracownik == p.id), None))})
    w["pracownicy"] = prac
    if f.wlasciciel_na:   # właściciel na stanowisku (P5): ta sama miara jego godzin
        cz = _czas_pracy(dane, f, obsluga, godz)
        w["wlasciciel_stanowisko"] = {**info["wlasciciel_stanowisko"], "wykorzystanie": cz["obciazenie"], **cz,
                                      **_obciazenie_dni(dane, f, obsluga, f.stanowisko(f.wlasciciel_na.typ, f.wlasciciel_na.nr))}
    elif info.get("wlasciciel_stanowisko"):
        w["wlasciciel_stanowisko"] = info["wlasciciel_stanowisko"]

    # sprzęt – obłożenie
    sprzet = []
    for st in f.stanowiska:
        for n, q in st.sprzet.items():
            if st.typ == KUCHNIA:
                h = obsluga["godziny_sprzetu"].get(f"{st.nr}|{n}", 0.0) if obsluga else 0.0
            else:
                rec = obsluga and st.pracownik and st.nr in [x.nr for x in kasjerzy(dane, f)]
                h = obsluga["godziny_kasy"] / max(1, obsluga["liczba_kasjerow"]) if rec else 0.0
            sprzet.append({"stanowisko": st.nr, "typ": st.typ, "nazwa": n, "jakosc": q,
                           "oblozenie": round(min(1.0, h / z["operacje"]["godziny_sprzetu"]), 4)})
    w["sprzet"] = sprzet

    # zasoby
    zasoby = []
    zamowione = {}
    for zakupy in info["zakupy_zasobow"].values():
        for zk in zakupy:
            k = f"{zk['zasob']}|{int(zk['jakosc'])}"
            zamowione[k] = zamowione.get(k, 0.0) + float(zk["ilosc"])
    kolejnosc_zasobow = list(dane.zasoby)
    klucze = sorted(set(start["magazyn"]) | set(f.magazyn) | set(zamowione),
                    key=lambda k: (kolejnosc_zasobow.index(k.split("|")[0]), k))
    zuzyte = obsluga["zuzyte_zasoby"] if obsluga else {}
    for k in klucze:
        nazwa, q = k.split("|")
        pocz, kon = start["magazyn"].get(k, 0.0), f.magazyn.get(k, 0.0)
        zam = zamowione.get(k, 0.0)
        wykorzystane = max(0.0, pocz + zam - kon)
        if pocz + zam + kon < 1e-9:
            continue
        zasoby.append({"zasob": nazwa, "jakosc": int(q), "poczatek": round(pocz, 3), "zamowione": round(zam, 3),
                       "wykorzystane": round(wykorzystane, 3), "koniec": round(kon, 3),
                       "wartosc": f.wartosc_magazynu(k)})
    w["zasoby"] = zasoby
    w["zuzyte_zasoby"] = zuzyte
    w["szkolenia"] = info.get("szkolenia", [])   # zakładka Ludzie ▸ Szkolenia (wyniki)
    if "szkolenia_aktywne" in info:   # kalibracja B9: szkolenia działające w tej rundzie (do której rundy)
        w["szkolenia_aktywne"] = info["szkolenia_aktywne"]

    # karta wyników
    if r >= 2:
        w["karta"] = _karta(dane, f, r, sprzedaz, info, start, _netto_karty(dane, netto, info))
    f.szczyt_majatku = max(f.szczyt_majatku, f.majatek)
    f.poprzednio_uslug = len(f.oferta)
    f.poprzednio_pracownikow = len(f.pracownicy)
    return w


def _czas_pracy(dane: Dane, f: Firma, obsluga: dict | None, godz: float, p=None) -> dict:
    """Ludzie ▸ Zespół (wyniki, poprawki 2): godziny pracy osoby w rundzie – przepracowane z dostępnych.
    Dostępne: pełny etat × mnożnik formy zatrudnienia i studenta (formy.etat); właściciel (p=None) – jego godziny
    na stanowisku. Przepracowane: ta część pojemności stanowiska (godziny × wydajność × etat), którą zajęła obsługa
    klientów – kuchnia: godziny tego stanowiska; kasa: godziny kas lokalu dzielone wg pojemności kasjerów.
    `obciazenie` jest też polem `wykorzystanie` (zadowolenie, karta wyników) – jedna miara (decyzja autora 8.11.2026)."""
    if p is None:
        w = f.wlasciciel_na
        s, dostepne = f.stanowisko(w.typ, w.nr), min(godz, w.godziny)
    else:
        s, dostepne = next((x for x in f.stanowiska if x.pracownik == p.id), None), godz * fz.etat(dane, p)
    obc = 0.0
    if obsluga and s is not None:
        poj = f.godziny_stanowiska(s, godz, dane)
        if s.typ == KUCHNIA:
            zajete = obsluga["godziny_stanowisk"].get(s.nr, 0.0)
        else:
            kasa = [x for x in kasjerzy(dane, f) if x.lokal == s.lokal]
            razem = sum(f.godziny_stanowiska(x, godz, dane) for x in kasa)
            gkl = obsluga.get("godziny_kasy_lokali")
            w_lokalu = gkl.get(s.lokal, 0.0) if gkl is not None else obsluga["godziny_kasy"]
            zajete = w_lokalu * poj / razem if razem and s.nr in {x.nr for x in kasa} else 0.0
        obc = min(1.0, zajete / poj) if poj > 0 else 0.0
    return {"godziny_pracy": round(obc * dostepne, 1), "godziny_dostepne": round(dostepne, 1), "obciazenie": round(obc, 4)}


def _obciazenie_dni(dane: Dane, f: Firma, obsluga: dict | None, s) -> dict:
    """P6 (poprawki 4, tylko raport – wyniki gry się nie zmieniają): {"obciazenie_dni": [7 wartości]} – obciążenie
    osoby na stanowisku `s` w każdym dniu rundy = godziny potrzebne na obsłużenie klientów, którzy doszli do
    stanowiska (zajęte + zajęcia klientów utraconych przez brak godzin tego etapu: kuchnia – brak godzin stanowisk
    albo sprzętu, kasa – kolejka do kasy), przez pojemność stanowiska tego dnia; ponad 1 = tyle pracy zabrakło.
    Kasa: obciążenie kas lokalu (wszyscy kasjerzy lokalu tak samo, jak w _czas_pracy). None – dzień bez zmiany
    (lokal nie działa, osoba bez stanowiska, pojemność 0). Bez danych dziennych (runda 1) albo działającego lokalu – {}."""
    if not obsluga or not obsluga.get("dni_kasy_lokali"):   # bez działającego lokalu – bez tabeli
        return {}
    dni_kasy = obsluga["dni_kasy_lokali"]
    n = len(next(iter(dni_kasy.values())))
    if s is None or s.lokal not in dni_kasy:
        return {"obciazenie_dni": [None] * n}
    if s.typ == KUCHNIA:
        dzienne = obsluga["dni_stanowisk"].get(s.nr) or [None] * n
    elif s.nr in {x.nr for x in kasjerzy(dane, f) if x.lokal == s.lokal}:
        dzienne = dni_kasy[s.lokal]
    else:   # kasa bez kompletu sprzętu – nie obsługuje (jak _czas_pracy: 0)
        dzienne = [(0.0, 1.0)] * n
    # dzień bez klientów w działającym lokalu: 0 (pojemność ze stanowiska), pojemność 0 – brak zmiany
    poj = f.godziny_stanowiska(s, dane.z["operacje"]["godziny_pracownika"], dane) / n if n else 0.0
    wynik = []
    for x in dzienne:
        potrzebne, pojemnosc = x if x is not None else (0.0, poj)
        wynik.append(round(potrzebne / pojemnosc, 4) if pojemnosc > 0 else None)
    return {"obciazenie_dni": wynik}


def mandaty_rundy(info: dict) -> float:
    """B12: mandaty rundy (poza KPiR): skarbowe za deklaracje, z błędu biura bez OC (z OC biuro je oddaje), sanepidu."""
    blad = (info.get("biuro") or {}).get("blad") or {}
    return round(((info.get("ksiegowosc") or {}).get("kara") or 0.0)
                 + (0.0 if blad.get("oc") else blad.get("kara") or 0.0)
                 + (((info.get("magazyn") or {}).get("sanepid") or {}).get("mandat") or 0.0), 2)


def _netto_karty(dane: Dane, netto: float, info: dict) -> float:
    """Dochód netto do karty: odsetki Harpagona (poza KPiR) obniżają wynik jak koszty (Z1), a przy
    karta_wynikow.mandaty_w_dochodzie także mandaty rundy (B12). KPiR i podatki bez zmian."""
    odsetki = (info.get("harpagon_odsetki") or {}).get("odsetki") or 0.0
    mandaty = mandaty_rundy(info) if dane.z["karta_wynikow"].get("mandaty_w_dochodzie") else 0.0
    return round(netto - odsetki - mandaty, 2)


def _procent_lokali(dane: Dane, f: Firma, rodzaj: str, wagi: bool = False) -> float:
    """Premia z wyposażenia / udogodnień do karty: średnia lokali (Z2 – każdy lokal ma swoje), przy wagi=True ważona
    liczbą stanowisk lokalu (tam pracują ludzie). Gra bez lokali – suma firmy jak dawniej."""
    poz = dane.pozycje(rodzaj)
    if not f.lokale:
        return sum(poz[n]["procent"] / 100 for n in getattr(f, rodzaj))
    w = {lok.id: (sum(st.lokal == lok.id for st in f.stanowiska) if wagi else 1) for lok in f.lokale}
    if not sum(w.values()):
        w = {k: 1 for k in w}
    return sum(w[lok.id] * sum(poz[n]["procent"] / 100 for n in pl.lista(f, lok, rodzaj))
               for lok in f.lokale) / sum(w.values())


def _karta(dane: Dane, f: Firma, r: int, sprzedaz: dict, info: dict, start: dict, netto: float) -> dict:
    sprzedane = {u: v for u, v in sprzedaz.items() if v["sprzedaz"] > 0}
    klienci = sum(v["sprzedaz"] for v in sprzedane.values())
    popyt = sum(v["popyt"] for v in sprzedaz.values())
    utracona = sum(v["utracona"] for v in sprzedaz.values()) / popyt if popyt else 0.0
    if klienci:
        r_rynek = kw.cena_wzgledem_strefy(dane, sprzedane)   # cena względem ceny preferowanej strefy lokalu (F4.1)
        q_sr = sum(v["sprzedaz"] * menu.jakosc_dania(dane, v["jakosc"]) for v in sprzedane.values()) / klienci
        reklamacje = sum(v["reklamacje"] for v in sprzedane.values()) / klienci
    else:
        r_rynek, q_sr, reklamacje = 1.0, 0.0, 0.0
    wyp = _procent_lokali(dane, f, "wyposazenie")
    zk = kw.zadowolenie_klientow(dane, len(sprzedane), r_rynek, f.utracona_poprzednio, q_sr, wyp, reklamacje)
    f.utracona_poprzednio = utracona
    f.baza_klientow *= 1 - dane.z["popyt"]["utrata_klientow"] * utracona   # klienci nieobsłużeni częściowo nie wracają

    prac = list(f.pracownicy.values())
    if prac:
        placa = float(np.mean([zo.placa_wzgledna(dane, p) for p in prac]))
        zlecenia = sum(bool(fz.forma(dane, p.umowa)["kara_zlecenia"]) for p in prac) / len(prac)
    else:
        placa, zlecenia = 1.0, 0.0
    jakosci = [q for st in f.stanowiska for q in st.sprzet.values()]
    sprzet_gw = float(np.mean(jakosci)) if jakosci else 2.0
    udog = _procent_lokali(dane, f, "udogodnienia", wagi=True)
    zmiany = (len(info["zatrudnieni"]) + len(info["zwolnieni"]) + len(info.get("wypowiedzenia", []))) / max(1, len(prac))
    zp = kw.zadowolenie_pracownikow(dane, placa, sprzet_gw, udog, info["szkolenia_procent"], zlecenia,
                                    zmiany if r > 2 else 0.0) if prac else 0.0

    przyrost = max(0, len(f.oferta) - f.poprzednio_uslug) + max(0, len(f.pracownicy) - f.poprzednio_pracownikow)
    maj = kw.majatek_karty(f)
    roz = kw.rozwoj_firmy(dane, kw.majatek_karty(f, kw.waga_nieruchomosci(dane)), info["inwestycje"], przyrost, len(f.oferta) + len(f.pracownicy),
                          f.rozwoj_poprzedni, info.get("sprzedany_majatek", 0.0), info.get("majatek_przed"),
                          f.szczyt_majatku)
    f.rozwoj_poprzedni = roz
    zad = kw.wskaznik_zadluzenia(zadluzenie(f), maj, f.skumulowany_dochod_netto, f.gotowka)
    return kw.karta(dane, netto, zk, zp, roz, zad)


def _rynek_publiczny(dane: Dane, s: StanGry, r: int, oferty, wyniki, rynek) -> dict:
    """Dane widoczne dla wszystkich firm w zakładkach „Wyniki” (zestawienia konkurencji)."""
    firmy = sorted(s.firmy)
    pub = {"firmy": {n: s.firmy[n].nazwa_wyswietlana or n for n in firmy},
           "popyt": {u: {n: v["popyt"] for n, v in rynek_u.items()} for u, rynek_u in rynek.items()},
           "ceny": {u: {n: round(o["cena"], 2) for n, o in v.items()} for u, v in oferty.items()},
           "pracownicy": {}, "wynagrodzenia": {}, "wykorzystanie": {}, "sprzet": {}, "stanowiska": {}, "jakosc_zasobow": {},
           "udogodnienia": {}, "wyposazenie": {}, "karta": {}}
    for n in firmy:
        f, w = s.firmy[n], wyniki[n]
        for zawod in dane.zawody:
            ps = [p for p in w["pracownicy"] if p["zawod"] == zawod]
            pub["pracownicy"].setdefault(n, {})[zawod] = {g: sum(p["gwiazdki"] == g for p in ps) for g in (1, 2, 3)}
            pub["wynagrodzenia"].setdefault(n, {})[zawod] = round(float(np.mean([p["pensja"] for p in ps])), 0) if ps else None
            pub["wykorzystanie"].setdefault(n, {})[zawod] = round(float(np.mean([p["wykorzystanie"] for p in ps])), 4) if ps else None
        pub["sprzet"][n] = {g: sum(x["jakosc"] == g for x in w["sprzet"]) for g in (1, 2, 3)}
        pub["stanowiska"][n] = {t: len(f.stanowiska_typu(t)) for t in sorted({st.typ for st in f.stanowiska})}
        pub["jakosc_zasobow"][n] = {g: round(sum(x["zamowione"] for x in w["zasoby"] if x["jakosc"] == g), 3) for g in (1, 2, 3)}
        pub["udogodnienia"][n] = len(f.udogodnienia)
        pub["wyposazenie"][n] = len(f.wyposazenie)
        if "karta" in w:
            pub["karta"][n] = w["karta"]
    return pub
