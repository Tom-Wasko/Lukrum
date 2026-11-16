"""Wnioski z rundy (gra z lokalami): co poszło dobrze, co nie wyszło i co zrobić w kolejnej rundzie.

Reguły na wynikach firmy z jednej rundy (`wyniki[r][firma]`, silnik/runda.py) – bez losowania i bez nowych
obliczeń. Ton zachęcający: najpierw to, co się udało, potem konkretna rada z zakładką, w której ją wykonać.
Progi: `dane/zalozenia.yaml: wnioski` (oraz `lista_bledow.przeterminowanie_min_zl`).
"""
from __future__ import annotations

from ..dane import Dane
from ..kuchnia import menu as mn
from ..model import Firma
from ..pieniadze.zaleglosci import zl, zl_pelne

# przyczyna utraconej sprzedaży (silnik/kuchnia/operacje.py) → (tytuł, rada, zakładka)
_PRZYCZYNY = {
    "pracownicy/sprzęt": ("W kuchni zabrakło rąk albo sprzętu",
                          "Dodajcie stanowisko kuchenne, zatrudnijcie kucharza albo kupcie szybszy sprzęt – kuchnia "
                          "przygotuje więcej porcji i nikt nie odejdzie z kolejki.", "stanowiska"),
    "brak stanowiska z pracownikiem i sprzętem": (
        "Danie bez gotowego stanowiska",
        "Każde danie z menu potrzebuje stanowiska kuchennego z kompletem sprzętu i kucharzem – sprawdźcie zakładki "
        "Stanowiska, Sprzęt i Zatrudnienie.", "stanowiska"),
    "kasa": ("Kolejka przy kasie",
             "Dodajcie kasjera albo stanowisko kasowe – jedna kasa obsłuży tylko część chętnych.", "zatrudnienie"),
    "zasoby": ("Zabrakło składników",
               "Zamówcie więcej u dostawców: zamówienie liczcie z prognozy popytu w Menu, a dostawy rozłóżcie na dni "
               "tygodnia.", "dostawcy"),
}
_KOSZTY = {
    "towary": "Najwięcej kosztowały składniki – zamawiajcie według prognozy i sprawdźcie, czy cena dania pokrywa "
              "koszt jego składników.",
    "wynagrodzenia": "Najwięcej kosztowały pensje – sprawdźcie w HR, czy każdy pracownik ma co robić (wykorzystanie "
                     "czasu).",
    "pozostale": "Najwięcej kosztowały pozostałe wydatki (czynsz, utrzymanie, reklama, amortyzacja) – to koszty "
                 "stałe, więc każdy dodatkowy klient rozkłada je na więcej kebabów.",
}


def _rada(tytul: str, co: str, rada: str, zakladka: str) -> dict:
    return {"tytul": tytul, "co": co, "rada": rada, "zakladka": zakladka}


def _lista(nazwy: list[str]) -> str:
    return ", ".join(nazwy)


ROZRUCH = ("Pierwsze tygodnie to rozruch – każda firma potrzebuje kilku tygodni, zanim klienci ją poznają, zespół "
           "nabierze wprawy, a zamówienia zgrają się z popytem. Słabszy start to normalne, liczy się kierunek.")


def wnioski(dane: Dane, w: dict | None, wp: dict | None = None, runda: int | None = None,
            firma: Firma | None = None) -> dict | None:
    """{"dobre": [tekst], "do_poprawy": [{tytul, co, rada, zakladka}], "rozruch": tekst | None} z wyników firmy;
    None – brak wyników. `wp` – wyniki poprzedniej rundy (UF23: wzrost sprzedaży i dochodu z liczbami); `runda` –
    runda wyników (UF5: do `wnioski.rozruch_do_rundy` zdanie o rozruchu)."""
    if not w:
        return None
    p = dane.z["wnioski"]
    dobre, poprawa = [], []
    sprzedaz = w.get("sprzedaz") or {}
    nazwa = lambda u: mn.nazwa_dania(dane, u, firma=firma)   # noqa: E731   firma – nazwy dań specjalnych strefy
    klienci = round(sum(v["sprzedaz"] for v in sprzedaz.values()))
    utraceni = round(sum(v["utracona"] for v in sprzedaz.values()))
    netto = w["kpir"]["dochod_netto"]

    # co się udało
    if klienci:
        dobre.append(f"Obsłużyliście {klienci} klientów.")
        if not utraceni:
            dobre.append("Nikt nie odszedł z kolejki – kuchnia, kasa i składniki dały radę.")
    if netto > 0:
        dobre.append(f"Runda na plusie: {zl(netto)} dochodu netto.")
    przed = _liczby(wp)
    if przed.get("klienci") and klienci > przed["klienci"] * (1 + dane.z["wnioski"]["wzrost_klientow"]):   # UF23: wzrost względem poprzedniej rundy
        dobre.append(f"Klientów więcej niż tydzień wcześniej: {round(przed['klienci'])} → {klienci} "
                     f"(+{round(100 * (klienci / przed['klienci'] - 1))}%).")
    if przed.get("dochod_netto") is not None and netto > 0 and netto > przed["dochod_netto"] + 1:
        dobre.append(f"Dochód netto lepszy niż tydzień wcześniej o {zl(netto - przed['dochod_netto'])}.")
    ks = w.get("ksiegowosc") or {}
    if ks.get("tryb") == "deklaracja" and not ks.get("kara"):
        dobre.append("Deklaracje złożone samodzielnie i bez błędów.")
    lokale = w.get("lokale")
    if lokale and not klienci:
        dobre.append("Macie lokal – to pierwszy i najważniejszy krok.")

    # brak sprzedaży – zwykle start gry
    if lokale is not None and not klienci:
        if not lokale:
            poprawa.append(_rada("Firma nie ma jeszcze lokalu", "Bez lokalu nie ma sprzedaży.",
                                 "Wybierzcie lokal na mapie albo w Stare Miasto ▸ Do wynajęcia – wynajem ruszy od razu, "
                                 "a lokal do urządzenia albo działkę możecie wyposażać już w ostatniej rundzie prac.",
                                 "lokale"))
        elif not any(lok["dziala"] for lok in lokale):
            od = min(lok["dziala_od"] for lok in lokale)
            poprawa.append(_rada("Lokal jeszcze się szykuje", f"Sprzedaż ruszy w rundzie {od}.",
                                 "Wykorzystajcie ten czas: ułóżcie menu i ceny, kupcie stanowiska i sprzęt, zatrudnijcie "
                                 "ludzi i zamówcie składniki – lokal otworzy się od razu gotowy.", "oferta"))
        else:
            poprawa.append(_rada("Lokal działał, ale nic nie sprzedano",
                                 "Klienci nie mieli czego kupić.",
                                 "Sprawdźcie po kolei: dania w Menu, ceny w Sprzedaży, stanowiska ze sprzętem i ludźmi "
                                 "oraz składniki w magazynie. Lista błędów pokaże, czego brakuje.", "lista_bledow"))

    # utracona sprzedaż – według przyczyny
    grupy: dict[str, list[str]] = {}
    for u, v in sprzedaz.items():
        if v["popyt"] and v["utracona"] / v["popyt"] >= p["utracona"]:
            przyczyna = v.get("przyczyna") or ""
            klucz = "zasoby" if przyczyna.startswith("zasoby") else przyczyna
            opis = f"{nazwa(u)} ({round(v['utracona'])} z {round(v['popyt'])} chętnych"
            grupy.setdefault(klucz, []).append(opis + (f", brak: {przyczyna.removeprefix('zasoby (').rstrip(')')})" if klucz == "zasoby" else ")"))
    for klucz, dania in grupy.items():
        tytul, rada, zakladka = _PRZYCZYNY.get(klucz, ("Część klientów odeszła bez kebaba",
                                                       "Sprawdźcie, czego zabrakło: stanowisk, ludzi czy składników.",
                                                       "stanowiska"))
        poprawa.append(_rada(tytul, f"Odeszli klienci: {_lista(dania)}.", rada, zakladka))

    # prognoza popytu (Menu) a prawdziwy popyt
    za_nisko, za_wysoko = [], []
    for u, v in sprzedaz.items():
        if v["popyt"] <= 0:
            continue
        odch = (v["prognoza"] - v["popyt"]) / v["popyt"]
        opis = f"{nazwa(u)} (prognoza {round(v['prognoza'])}, popyt {round(v['popyt'])})"
        if odch <= -p["prognoza"]:
            za_nisko.append(opis)
        elif odch >= p["prognoza"]:
            za_wysoko.append(opis)
    if za_nisko:
        poprawa.append(_rada("Chętnych było więcej, niż zakładała prognoza", _lista(za_nisko) + ".",
                             "Podnieście prognozę w Kuchni – według niej zamawiacie składniki i planujecie kuchnię. "
                             "Pomogą pule klientów stref i wydarzenia: Miasteczko akademickie ▸ Goście w strefach oraz Kalendarz miasta.", "oferta"))
    if za_wysoko:
        poprawa.append(_rada("Prognoza była wyższa niż popyt", _lista(za_wysoko) + ".",
                             "Obniżcie prognozę w Menu albo przyciągnijcie klientów ceną, promocją lub reklamą – "
                             "nadmiar składników może się przeterminować.", "oferta"))

    # magazyn i sanepid
    sanepid = (w.get("magazyn") or {}).get("sanepid") or {}
    if sanepid.get("przeterminowane", 0) >= dane.z["lista_bledow"]["przeterminowanie_min_zl"]:
        poprawa.append(_rada("Część składników się przeterminowała",
                             f"Wyrzucony towar był wart {zl(sanepid['przeterminowane'])}.",
                             "Zamawiajcie mniejsze partie, częściej i bliżej prognozy – terminy przydatności widać "
                             "w Hurtownie ▸ Zamówienia.", "swiezosc"))
    pip = w.get("pip") or {}
    if pip.get("kontrola"):
        poprawa.append(_rada("Kontrola PIP: zlecenie jak etat", f"Kara {zl(pip['kara'])}: zlecenie w pełnym wymiarze godzin, jak etat "
                             f"(osoby: {', '.join(pip['osoby'])}).",
                             "Zatrudnijcie taką osobę na umowę o pracę albo zmniejszcie jej godziny – o rodzaju umowy "
                             "decyduje sposób pracy, a nie nazwa.", "zatrudnienie"))
    if sanepid.get("mandat"):
        poprawa.append(_rada("Mandat z sanepidu", f"Kontrola zakończyła się mandatem {zl(sanepid['mandat'])}.",
                             "Ryzyko kontroli rośnie z przeterminowanym towarem i wynajętą chłodnią – trzymajcie "
                             "mniejszy zapas i zadbajcie o higienę (Urzędy ▸ Sanepid).", "urzad"))

    # pomyłki w szczycie
    pomylki = round(sum(v["pomylki"] for v in sprzedaz.values()))
    if pomylki:
        poprawa.append(_rada("Pomyłki w szczycie", f"Pomyłek w kuchni: {pomylki} (danie robione drugi raz).",
                             "Pomyłki biorą się z przeciążonej kuchni, zmęczonej obsady i braku szkoleń – dodajcie kucharza "
                             "albo stanowisko, nie przepracowujcie ludzi i kupcie szkolenie.", "zatrudnienie"))

    # księgowość
    if ks.get("kara"):
        poprawa.append(_rada("Mandat za deklaracje", f"Urząd naliczył {zl(ks['kara'])} mandatu.",
                             "W Biurowiec przy Zana ▸ Biuro rachunkowe (wyniki) widać, która deklaracja się nie zgadzała. Nad tabelą "
                             "dokumentów jest instrukcja krok po kroku – albo powierzcie księgowość biuru.", "biuro"))
    blad_biura = (w.get("biuro") or {}).get("blad")
    if blad_biura and not blad_biura.get("oc"):
        poprawa.append(_rada("Biuro rachunkowe pomyliło się w deklaracji",
                             f"Mandat {zl(blad_biura['kara'])} zapłaciła firma, bo biuro nie ma OC.",
                             "Rozważcie biuro z ubezpieczeniem OC – wtedy to ono oddaje mandat.", "biuro"))

    # wynik i pieniądze
    kpir = w["kpir"]
    if netto < 0:
        koszty = {k: kpir.get(k, 0) for k in _KOSZTY}
        najwiekszy = max(koszty, key=koszty.get)
        poprawa.append(_rada("Runda na minusie",
                             f"Przychody {zl(kpir['przychody'])}, koszty {zl(kpir['koszty'])}. Strata na starcie "
                             "jest normalna – dopiero inwestujecie.", _KOSZTY[najwiekszy], "kpir"))
    if w.get("debet", 0) > 0:
        poprawa.append(_rada("Na koncie zabrakło pieniędzy",
                             f"Tydzień zakończył się na minusie: debet {zl(w['debet'])} (opłata i odsetki banku).",
                             "Zostawcie zapas gotówki na pensje i dostawy albo weźcie w banku kredyt z lepszym "
                             "oprocentowaniem, zanim zabraknie.", "bank"))

    # czerwone punkty listy błędów z tej rundy (gdy nie powtarzają rad wyżej)
    zakladki = {r["zakladka"] for r in poprawa}
    czerwone = [b for b in w.get("lista_bledow") or [] if b["poziom"] == "czerwony" and b["zakladka"] not in zakladki]
    for b in czerwone[:p["bledy_max"]]:
        poprawa.append(_rada("Sygnał z listy błędów", b["tekst"],
                             "Ten punkt był na czerwono przed przeliczeniem. Zajrzyjcie do listy błędów przed "
                             "wysłaniem decyzji – podpowiada na bieżąco.", b["zakladka"]))

    if not dobre:
        dobre.append("Każda firma zaczyna od zera – poniżej plan na kolejną rundę.")
    rozruch = p.get("rozruch_do_rundy")
    return {"dobre": dobre, "do_poprawy": poprawa,
            "rozruch": ROZRUCH if runda is not None and rozruch is not None and runda <= rozruch else None}


# U16: „Dlaczego mój wynik się zmienił?” – 1–3 zdania z porównania wyniku punktowego dwóch kolejnych tygodni
def _liczba(x: float) -> str:
    return f"{x:.0f}".replace("-", "−")


def _pozycje(kpir: dict) -> dict[str, float]:
    """Saldo pozycji KPiR (przychód − koszt) pogrupowane po opisie przed dwukropkiem („Czynsz najmu: ul. …”)."""
    wynik: dict[str, float] = {}
    for p in kpir.get("pozycje") or []:
        klucz = p["opis"].split(":")[0].strip()
        wynik[klucz] = wynik.get(klucz, 0.0) + p.get("przychod", 0) + p.get("przychod_pozostaly", 0)             - p.get("towary", 0) - p.get("wynagrodzenia", 0) - p.get("pozostale", 0)
    return wynik


def dlaczego(dane: Dane, w: dict | None, wp: dict | None) -> list[str] | None:
    """Zdania o zmianie wyniku punktowego między tygodniem poprzednim (wp) a ostatnim (w); None – brak karty w.
    Przyczyna: dział, którego punkty zmieniły się najbardziej (w tę samą stronę co wynik); w nim składnik z największą
    zmianą. Tydzień 1 („Wielkie otwarcie”) i pierwszy tydzień sprzedaży – bez porównania działów."""
    k, kp = (w or {}).get("karta"), (wp or {}).get("karta")
    if not k:
        return None
    if k.get("otwarcie"):
        return [f"Wielkie otwarcie: {_liczba(k['punkty'])} pkt za przygotowanie (lokal, menu, ekipa, zaopatrzenie, rezerwa)."]
    if not kp or kp.get("otwarcie"):
        naj = max(k["dzialy"], key=lambda d: k["dzialy"][d]["punkty"])
        return [f"Pierwszy tydzień sprzedaży: {_liczba(k['punkty'])} pkt. Najwięcej dał dział „{k['dzialy'][naj]['nazwa']}” "
                f"({_liczba(k['dzialy'][naj]['punkty'])} z 200)."]
    a, b = kp["punkty"], k["punkty"]
    if abs(b - a) < dane.z["wnioski"]["dlaczego_min"]:
        return [f"Wynik prawie się nie zmienił ({_liczba(a)} → {_liczba(b)} pkt)."]
    zdania = [f"Wynik {'wzrósł' if b > a else 'spadł'} z {_liczba(a)} do {_liczba(b)} pkt."]
    zmiany = {d: k["dzialy"][d]["punkty"] - kp["dzialy"][d]["punkty"] for d in k["dzialy"]}
    zgodne = [d for d in zmiany if zmiany[d] * (b - a) > 0] or list(zmiany)
    glowny = max(zgodne, key=lambda d: abs(zmiany[d]))
    sk = {s: k["dzialy"][glowny]["skladniki"][s]["punkty"] - kp["dzialy"][glowny]["skladniki"][s]["punkty"]
          for s in k["dzialy"][glowny]["skladniki"]}
    s = max(sk, key=lambda x: abs(sk[x]))
    zdania.append(f"Najwięcej zmienił dział „{k['dzialy'][glowny]['nazwa']}” ({_liczba(kp['dzialy'][glowny]['punkty'])} → "
                  f"{_liczba(k['dzialy'][glowny]['punkty'])} pkt), głównie „{k['dzialy'][glowny]['skladniki'][s]['nazwa']}”.")
    if glowny == "finanse":
        dn, dnp = w["kpir"]["dochod_netto"], wp["kpir"]["dochod_netto"]
        teraz, przed = _pozycje(w["kpir"]), _pozycje(wp["kpir"])
        roznice = {p: teraz.get(p, 0.0) - przed.get(p, 0.0) for p in set(teraz) | set(przed)}
        kierunek = [p for p in roznice if roznice[p] * (dn - dnp) > 0]
        if kierunek:
            p = max(kierunek, key=lambda x: abs(roznice[x]))
            zdania.append(f"Dochód netto: {zl_pelne(dnp)} → {zl_pelne(dn)}; najbardziej zaważyła pozycja „{p}”.")
    return zdania


# UF23: „Tydzień w liczbach” – nagłówek karty wyników i wniosków: najważniejsze liczby rundy z poprzednią rundą
# (strzałki w panelu) i 1–3 zdania-historie tygodnia (najlepszy dzień, najchętniej brane danie, co zjadło zysk)
DNI = {"pn": "poniedziałek", "wt": "wtorek", "śr": "środa", "czw": "czwartek", "pt": "piątek", "sob": "sobota",
       "nd": "niedziela"}
KOSZTY = {"towary": "składniki", "wynagrodzenia": "pensje", "pozostale": "pozostałe koszty (czynsz, utrzymanie, reklama)"}


def _liczby(w: dict | None) -> dict[str, float | None]:
    if not w:
        return {}
    sp = (w.get("sprzedaz") or {}).values()
    kpir = w.get("kpir") or {}
    return {"klienci": sum(v["sprzedaz"] for v in sp), "utracona": sum(v["utracona"] for v in sp),
            "przychody": kpir.get("przychody"), "koszty": kpir.get("koszty"),
            "dochod_netto": kpir.get("dochod_netto"), "gotowka": w.get("gotowka")}


def tydzien(dane: Dane, w: dict | None, wp: dict | None, firma: Firma | None = None) -> dict | None:
    """{"liczby": [{klucz, etykieta, wartosc, poprzednia, format, lepiej}], "zdania": [tekst]}; None – brak wyników.
    `lepiej` 1 – więcej znaczy lepiej, −1 – mniej (utracona sprzedaż, koszty); `poprzednia` None w pierwszej rundzie."""
    if not w:
        return None
    teraz, przed = _liczby(w), _liczby(wp)
    opis = [("klienci", "Obsłużeni klienci", "liczba", 1), ("utracona", "Odeszli bez kebaba", "liczba", -1),
            ("przychody", "Przychody", "zl", 1), ("koszty", "Koszty", "zl", -1),
            ("dochod_netto", "Dochód netto", "zl", 1), ("gotowka", "Saldo konta", "zl", 1)]
    liczby = [{"klucz": k, "etykieta": e, "wartosc": teraz[k], "poprzednia": przed.get(k), "format": f, "lepiej": lp}
              for k, e, f, lp in opis if teraz.get(k) is not None]
    zdania = []
    dni = [d for d in ((w.get("klienci") or {}).get("dni") or []) if d.get("sprzedaz")]
    if dni:
        naj = max(dni, key=lambda d: d["sprzedaz"])
        zdania.append(f"Najlepszy dzień: {DNI.get(naj['dzien'], naj['dzien'])} – {round(naj['sprzedaz'])} klientów"
                      + (f", {round(naj['utracona'])} odeszło bez kebaba." if naj.get("utracona", 0) >= 1 else "."))
    sprzedaz = {u: v for u, v in (w.get("sprzedaz") or {}).items() if v["sprzedaz"] > 0}
    if sprzedaz:
        u = max(sprzedaz, key=lambda x: sprzedaz[x]["sprzedaz"])
        razem = sum(v["sprzedaz"] for v in sprzedaz.values())
        zdania.append(f"Najchętniej brane: {mn.nazwa_dania(dane, u, firma=firma)} – {round(sprzedaz[u]['sprzedaz'])} porcji "
                      f"({round(100 * sprzedaz[u]['sprzedaz'] / razem)}% sprzedaży).")
    kpir = w.get("kpir") or {}
    koszty = {k: kpir.get(k, 0) for k in KOSZTY}
    if any(koszty.values()):
        k = max(koszty, key=koszty.get)
        przych = kpir.get("przychody") or 0
        # największa pozycja KPiR – tylko gdy mówi coś więcej niż grupa („Zakup zasobu” przy składnikach nie mówi)
        pozycje = {p: -x for p, x in _pozycje(kpir).items() if x < 0} if k != "towary" else {}
        poz = max(pozycje, key=pozycje.get) if pozycje else None
        zdania.append((f"Zysk najbardziej zjadły {KOSZTY[k]}: " if przych > 0 else f"Najwięcej kosztowały {KOSZTY[k]}: ")
                      + zl(koszty[k])
                      + (f" ({round(100 * koszty[k] / przych)} gr z każdej złotówki przychodu)" if przych > 0 else "")
                      + (f"; największa pozycja – „{poz}”: {zl(pozycje[poz])}." if poz else "."))
    return {"liczby": liczby, "zdania": zdania}
