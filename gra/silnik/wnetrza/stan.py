"""Stan wnętrza kebaba z wyników rundy: wskaźniki dla dymków, kontekst rundy (okazje wujka, plotki) i obraz lokalu.

Wszystko liczone ze stanu gry po ostatniej przeliczonej rundzie (`StanGry.wyniki`), bez własnego zapisu, więc ten sam
stan i ta sama runda dają to samo (event sourcing). Wskaźnika, którego nie da się policzyć (np. brak sprzedaży
albo opinii), nie ma w wyniku, a warunek `gdy` na nim jest niespełniony.
"""
from __future__ import annotations

from ..dane import KASA, Dane
from ..model import StanGry
from ..nieruchomosci import per_lokal as pl
from ..rynek import kalendarz as kal
from ..rynek import popyt as pp
from ..swiat import zdarzenia as zd
from ..wyniki import punkty as kw

MINA_NEUTRALNA = "neutralna"
MIEJSCE_LADA, MIEJSCE_KUCHNIA = "lada", "kuchnia"


def wyniki_rundy(stan: StanGry, firma: str, runda: int) -> dict | None:
    """Wyniki firmy w rundzie `runda` (None – brak: runda nieprzeliczona albo firma bez wyników)."""
    return (stan.wyniki.get(runda) or {}).get(firma)


def _srednia(x: list[float]) -> float | None:
    return sum(x) / len(x) if x else None


def nastroj(dane: Dane, zadowolenie: float | None) -> float | None:
    """Zadowolenie osoby (0,8–1,05 w grze) na skalę nastroju 0–100 (dane/wnetrza/silnik.yaml: nastroj)."""
    if zadowolenie is None:
        return None
    n = dane.wnetrza["silnik"]["nastroj"]
    x = (zadowolenie - n["zadowolenie_zero"]) / (n["zadowolenie_sto"] - n["zadowolenie_zero"]) * 100
    return round(min(100.0, max(0.0, x)), 1)


def wskazniki(dane: Dane, stan: StanGry, firma: str, biezaca: int) -> dict[str, float]:
    """Wskaźniki z dymki.yaml → wskazniki, z rundy `biezaca` − 1; `biezaca` to runda, w której drużyna decyduje.
    Brakujące wskaźniki nie ma w wyniku. Dodatkowo pola tekstu: `cena` i `cena_strefy` (zł)."""
    wynik: dict[str, float] = {"runda": biezaca}
    w = wyniki_rundy(stan, firma, biezaca - 1)
    f = stan.firmy.get(firma)
    if f is None:
        return wynik
    oceny = [lok.ocena for lok in f.lokale if lok.ocena is not None]
    if oceny:
        wynik["ocena"] = round(_srednia(oceny), 2)
    if not w:
        return wynik
    sprzedaz = w.get("sprzedaz") or {}
    sprzedane = {u: v for u, v in sprzedaz.items() if v["sprzedaz"] > 0}
    klienci = sum(v["sprzedaz"] for v in sprzedane.values())
    if klienci:
        rel = kw.cena_wzgledem_strefy(dane, sprzedane)
        cena = sum(v["sprzedaz"] * v["cena_po_rabacie"] for v in sprzedane.values()) / klienci
        wynik["cena_wzgledem_strefy"] = round(rel, 4)
        wynik["cena"] = round(cena, 2)
        wynik["cena_strefy"] = round(cena / rel, 2)
    poprzednie = (wyniki_rundy(stan, firma, biezaca - 2) or {}).get("sprzedaz") or {}
    wspolne = [u for u in sprzedaz if u in poprzednie]
    if wspolne:
        teraz = _srednia([sprzedaz[u]["cena_po_rabacie"] for u in wspolne])
        przedtem = _srednia([poprzednie[u]["cena_po_rabacie"] for u in wspolne])
        if przedtem:
            wynik["zmiana_ceny"] = round((teraz / przedtem - 1) * 100, 1)
    popyt = sum(v["popyt"] for v in sprzedaz.values())
    if popyt:
        kolejka = sum(v["utracona"] for v in sprzedaz.values() if v["przyczyna"] in kw.KOLEJKI)
        brak = sum(v["utracona"] for v in sprzedaz.values() if v["utracona"] and v["przyczyna"] not in kw.KOLEJKI)
        wynik["kolejka"] = round(kolejka / popyt, 4)
        wynik["brak_dan"] = round(brak / popyt, 4)
    nastroje = [n for p in w.get("pracownicy") or [] if (n := nastroj(dane, p.get("zadowolenie"))) is not None]
    if nastroje:
        wynik["nastroj_zespolu"] = round(_srednia(nastroje), 1)
    return wynik


def _nowe_kredyty(w: dict | None) -> list:
    return (((w or {}).get("bank") or {}).get("poczatek") or {}).get("nowe_kredyty") or []


def _okazje_ze_stanu(dane: Dane, stan: StanGry, firma: str, biezaca: int, ostatnia: dict,
                     wczesniejsze: list[dict]) -> set[str]:
    """Okazje wujka z ostatniej przeliczonej rundy (biezaca − 1) na tle wcześniejszych (`wczesniejsze`)."""
    okazje = set()
    if (ostatnia.get("debet") or 0) > 0 and not (wczesniejsze and (wczesniejsze[-1].get("debet") or 0) > 0):
        okazje.add("debet")
    if _nowe_kredyty(ostatnia) and not any(_nowe_kredyty(x) for x in wczesniejsze):
        okazje.add("pierwszy_kredyt")
    if ((ostatnia.get("urzad") or {}).get("kontrola") or {}).get("kontrola"):
        okazje.add("kontrola_sanepidu")
    f = stan.firmy.get(firma)
    lokale = sorted(f.lokale, key=lambda lok: lok.od_rundy) if f else []
    if len(lokale) >= 2 and lokale[1].od_rundy == biezaca - 1:
        okazje.add("pierwsza_filia")
    teraz = wskazniki(dane, stan, firma, biezaca).get("nastroj_zespolu")
    przedtem = wskazniki(dane, stan, firma, biezaca - 1).get("nastroj_zespolu")
    if teraz is not None and przedtem is not None and przedtem - teraz >= dane.wnetrza["silnik"]["okazje"]["spadek_nastroju"]:
        okazje.add("spadek_nastroju")
    return okazje


def _historia_okazji(dane: Dane, stan: StanGry, firma: str, biezaca: int) -> set[str]:
    okazje = set()
    if biezaca == 1:
        okazje.add("start")
    ostatnia = wyniki_rundy(stan, firma, biezaca - 1)
    if ostatnia:
        kpir = ostatnia["kpir"]
        wczesniejsze = [wyniki_rundy(stan, firma, r) for r in range(1, biezaca - 1)]
        wczesniejsze = [x for x in wczesniejsze if x]
        if kpir["dochod_netto"] < 0 and all(x["kpir"]["dochod_netto"] >= 0 for x in wczesniejsze):
            okazje.add("pierwsza_strata")
        if wczesniejsze and kpir["przychody"] > max(x["kpir"]["przychody"] for x in wczesniejsze):
            okazje.add("rekord")
        okazje |= _okazje_ze_stanu(dane, stan, firma, biezaca, ostatnia, wczesniejsze)
    return okazje


def kontekst(dane: Dane, stan: StanGry, firma: str, biezaca: int, ziarno, liczba_rund: int) -> dict:
    """Kontekst rundy do wyboru dymków: okazje wujka i dane plotek (najbliższe zdarzenia, wydarzenie z kalendarza,
    konkurenci). Puste listy = plotki z tego źródła odpadają."""
    okazje = _historia_okazji(dane, stan, firma, biezaca)
    if biezaca == liczba_rund:
        okazje.add("ostatnia_runda")
    elif liczba_rund >= dane.wnetrza["silnik"]["okazje"]["polrocze_min_rund"] and biezaca == liczba_rund // 2 + 1:
        okazje.add("koniec_polrocza")   # połowa rund za drużyną
    parki = []
    if dane.zdarzenia:   # zdarzenia parkowe z tej rundy (te same widać na mapie): najbliższe, o jakich mówi miasto
        historie = zd.historie_parkow(dane)
        budynki = {b["id"]: b["nazwa"] for b in (dane.mapa or {}).get("budynki", [])}
        for h in zd.eventy_parku(dane, ziarno, biezaca):
            parki.append({"park": budynki.get(historie[h]["park"], historie[h]["park"]),
                          "tytul": historie[h]["tytul"]})
    kalendarz = []
    if kal.dane_kalendarza(dane) and biezaca < liczba_rund:   # co zacznie się w następnej rundzie („za tydzień”)
        teraz = {w["nazwa"] for w in kal.wydarzenia(dane, pp.dni_rundy(dane, biezaca))}
        kalendarz = [{"wydarzenie": w["nazwa"]} for w in kal.wydarzenia(dane, pp.dni_rundy(dane, biezaca + 1))
                     if w["nazwa"] not in teraz]
    konkurencja = []
    for nazwa, k in sorted(stan.firmy.items()):
        dzialajace = [lok for lok in k.lokale if lok.dziala_od <= biezaca]
        if nazwa != firma and dzialajace:
            strefa = dane.lokale[dzialajace[0].id]["strefa"]
            konkurencja.append({"konkurent": k.nazwa_wyswietlana or nazwa,
                                "dzielnica": dane.mapa["strefy"][strefa]["nazwa"]})
    return {"runda": biezaca, "firma": firma, "ziarno": ziarno, "okazje": sorted(okazje),
            "park": parki, "kalendarz": kalendarz, "konkurencja": konkurencja}


def mina(dane: Dane, nastroj_osoby: float | None, wykorzystanie: float) -> str:
    """Mina pracownika z nastroju i zmęczenia (progi: dane/wnetrza/silnik.yaml: miny; pierwsza pasująca)."""
    for nazwa, m in dane.wnetrza["silnik"]["miny"].items():
        if nastroj_osoby is not None:
            if m["nastroj_do"] is not None and nastroj_osoby < m["nastroj_do"]:
                return nazwa
            if m["nastroj_od"] is not None and nastroj_osoby >= m["nastroj_od"]:
                return nazwa
        if m["wykorzystanie_od"] is not None and wykorzystanie >= m["wykorzystanie_od"]:
            return nazwa
    return MINA_NEUTRALNA


def stan_wnetrza(dane: Dane, stan: StanGry, firma: str, lokal: str | None = None) -> dict:
    """Obraz wnętrza do rysowania: pracownicy z miejscem (lada/kuchnia) i miną, kupione wyposażenie i udogodnienia
    (nazwy z katalogu), tłok 0–1 (średnie wykorzystanie załogi). `lokal` – id lokalu (domyślnie główny)."""
    f = stan.firmy[firma]
    runda = stan.runda
    lok = next((x for x in f.lokale if x.id == lokal), None) if lokal else pl.glowny(f, runda)
    pracownicy = []
    for p in f.pracownicy.values():
        st = next((s for s in f.stanowiska if s.pracownik == p.id), None)
        if lokal and (st is None or st.lokal != lokal):
            continue
        n = nastroj(dane, p.zadowolenie)
        typ = st.typ if st else dane.typ_zawodu(p.zawod)
        pracownicy.append({"id": p.id, "imie_nazwisko": p.imie_nazwisko, "zawod": p.zawod, "gwiazdki": p.gwiazdki,
                           "miejsce": MIEJSCE_LADA if typ == KASA else MIEJSCE_KUCHNIA,
                           "lokal": st.lokal if st else None, "nastroj": n, "wykorzystanie": round(p.wykorzystanie, 3),
                           "mina": mina(dane, n, p.wykorzystanie)})
    tlok = _srednia([p["wykorzystanie"] for p in pracownicy])
    return {"runda": runda, "lokal": lok.id if lok else None, "pracownicy": pracownicy,
            "wyposazenie": list(pl.lista(f, lok, "wyposazenie")) if lok else [],
            "udogodnienia": list(pl.lista(f, lok, "udogodnienia")) if lok else [],
            "tlok": round(min(1.0, max(0.0, tlok or 0.0)), 3)}
