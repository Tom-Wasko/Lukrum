"""Środki trwałe i amortyzacja (gra z lokalami, F3a.6).

Kupiony lokal i wybudowany budynek oraz inwestycje od progu `amortyzacja_prog` (sprzęt, wyposażenie, stanowiska)
trafiają do ewidencji środków trwałych: zakup to ruch na rachunku, a koszt w KPiR rozkłada się liniowo – co rundę
odpis amortyzacyjny według rocznej stawki (`amortyzacja_roczna`). Tańsze zakupy od razu w koszty.
Grunt (działka) jest w ewidencji, ale się nie amortyzuje. Przy sprzedaży niezamortyzowana wartość idzie w koszty.
Z VAT (F3a.11): zakup sprzętu, wyposażenia i stanowisk daje VAT naliczony, a do ewidencji trafia wartość netto.
B6 (decyzja autora 7.11.2026): firma wybiera w Księgowości, czy tańsze zakupy idą od razu w koszty (domyślnie), czy też do ewidencji z amortyzacją `finanse.amortyzacja_niskocenna.stawka` – jak środki trwałe od progu.
Wybór działa od rundy decyzji (bez przeksięgowania wcześniejszych zakupów); `wybor: false` – zawsze w koszty.
"""

from __future__ import annotations

from ..dane import Dane
from ..model import Firma, SrodekTrwaly
from .finanse import Ksiega, Rachunek, ksieguj


def stawka(dane: Dane, rodzaj: str) -> float:
    return dane.z["finanse"]["amortyzacja_roczna"][rodzaj]


W_KOSZTY, AMORTYZACJA = "koszty", "amortyzacja"   # B6: zakupy poniżej progu (Firma.amortyzacja_niskocenna)
NISKOCENNE = (W_KOSZTY, AMORTYZACJA)


def przyjmij(dane: Dane, firma: Firma, nazwa: str, rodzaj: str, wartosc: float, runda: int,
             stawka_roczna: float | None = None) -> None:
    """Nowy środek trwały w ewidencji (amortyzacja od następnej rundy); stawka_roczna – B6, zakup poniżej progu."""
    firma.srodki_trwale.append(SrodekTrwaly(nazwa=nazwa, rodzaj=rodzaj, wartosc=wartosc, od_rundy=runda,
                                            stawka=stawka(dane, rodzaj) if stawka_roczna is None else stawka_roczna))


def wybor_niskocennych(dane: Dane) -> dict | None:
    """B6: {"wybor", "stawka"} z finanse.amortyzacja_niskocenna; None – gracz nie wybiera (zawsze w koszty)."""
    p = dane.z["finanse"].get("amortyzacja_niskocenna")
    return p if p and p["wybor"] else None


def stawka_niskocennych(dane: Dane, firma: Firma) -> float | None:
    """Stawka roczna amortyzacji zakupu poniżej progu, gdy firma wybrała amortyzację; None – od razu w koszty."""
    p = wybor_niskocennych(dane)
    return p["stawka"] if p and firma.amortyzacja_niskocenna == AMORTYZACJA else None


def ustaw_niskocenne(dane: Dane, firma: Firma, d: dict) -> None:
    """B6: wybór z decyzji `amortyzacja_niskocenna` – na początku przeliczenia, przed wszystkimi zakupami rundy
    (giełda, lokal, budynek z najemcą, sprzęt); trwa do zmiany."""
    if d.get("amortyzacja_niskocenna") in NISKOCENNE and wybor_niskocennych(dane):
        firma.amortyzacja_niskocenna = d["amortyzacja_niskocenna"]


def zakup(dane: Dane, firma: Firma, ksiega: Ksiega, rachunek: Rachunek, opis: str, nazwa: str, rodzaj: str,
          cena: float, runda: int) -> float:
    """Zakup inwestycji: od progu – środek trwały (amortyzacja), poniżej progu – koszt od razu albo (B6, wybór
    firmy) środek trwały ze stawką `amortyzacja_niskocenna`. Zwraca koszt wpisany do KPiR w tej rundzie
    (bez VAT; 0 – środek trwały)."""
    nisko = stawka_niskocennych(dane, firma) if 0 < cena < dane.z["finanse"]["amortyzacja_prog"] else None
    if cena >= dane.z["finanse"]["amortyzacja_prog"] or nisko is not None:
        rachunek.zapisz(firma, opis, -cena, "inwestycje")
        vat = ksiega.zarejestruj(opis, {dane.podatki["vat"]["srodki_trwale"]: cena}, False, inwestycja=True) if ksiega.vat is not None else 0.0
        przyjmij(dane, firma, nazwa, rodzaj, round(cena - vat, 2), runda, nisko)
        return 0.0
    return ksieguj(firma, ksiega, rachunek, opis, cena)


def sprzet_w_cenie(dane: Dane, firma: Firma, ksiega: Ksiega, adres: str, sprzet: list[tuple[str, int]],
                   runda: int) -> float:
    """B6: sprzęt kupiony razem z lokalem (kupno gotowego, wykup najmowanego) – część ceny lokalu, nie dodatek:
    poniżej progu amortyzacji koszt w KPiR od razu (bez wydatku – zapłacony w cenie lokalu), od progu środek
    trwały (B6: poniżej progu też, gdy firma amortyzuje tańsze zakupy); majątek firmy (rozwój) jak przy zakupie
    osobno. Zwraca wartość sprzętu – o tyle mniej wart jest lokal w ewidencji (wcześniej sprzęt liczył się drugi
    raz ponad cenę)."""
    razem = 0.0
    nisko = stawka_niskocennych(dane, firma)
    for n, q in sprzet:
        c = dane.sprzet[n]["ceny"][str(q)]
        if c >= dane.z["finanse"]["amortyzacja_prog"]:
            przyjmij(dane, firma, f"{n} ({adres})", "sprzet", c, runda)
        elif nisko is not None:
            przyjmij(dane, firma, f"{n} ({adres})", "sprzet", c, runda, nisko)
        else:
            ksiega.dodaj(f"Sprzęt w cenie lokalu: {n} ({adres})", c, bez_gotowki=True)
        firma.majatek += c
        razem += c
    return round(razem, 2)


def sprzedaj(firma: Firma, nazwa: str, ksiega: Ksiega, opis: str = "sprzedanego") -> bool:
    """Usuwa środek trwały z ewidencji; niezamortyzowana wartość – koszt w KPiR. False – nie było go w ewidencji.
    `opis` – sprzedanego albo zlikwidowanego (K1: przepadek przy ponownym zakryciu funkcji)."""
    st = next((s for s in firma.srodki_trwale if s.nazwa == nazwa), None)
    if st is None:
        return False
    firma.srodki_trwale.remove(st)
    ksiega.dodaj(f"Niezamortyzowana wartość {opis} środka trwałego: {nazwa}", st.wartosc - st.umorzenie,
                 bez_gotowki=True)
    return True


def amortyzuj(dane: Dane, firma: Firma, runda: int, ksiega: Ksiega) -> None:
    """Odpisy amortyzacyjne rundy (koszt w KPiR bez ruchu na rachunku)."""
    for st in firma.srodki_trwale:
        if st.od_rundy >= runda or st.stawka <= 0:
            continue
        odpis = min(round(st.wartosc * st.stawka / dane.rund_w_roku, 2), round(st.wartosc - st.umorzenie, 2))
        if odpis > 0:
            ksiega.dodaj(f"Amortyzacja: {st.nazwa}", odpis, bez_gotowki=True)
            st.umorzenie = round(st.umorzenie + odpis, 2)


def amortyzuj_majatek(dane: Dane, firma: Firma, majatek_przed: float) -> None:
    """Amortyzacja sumy inwestycji do karty (Z1): tańsze zakupy są od razu w kosztach, więc do rozwoju firmy
    majątek traci na wartości jak sprzęt – liniowo od sumy sprzed rundy (zakupy rundy od następnej)."""
    odpis = round(min(firma.majatek, majatek_przed) * stawka(dane, "sprzet") / dane.rund_w_roku, 2)
    firma.umorzenie_majatku = round(min(firma.majatek, firma.umorzenie_majatku + odpis), 2)


def zmniejsz_majatek(firma: Firma, wartosc: float) -> None:
    """Sprzedaż (albo utrata) części majątku po cenie zakupu: umorzenie maleje w tej samej proporcji."""
    if firma.majatek > 0:
        firma.umorzenie_majatku = round(firma.umorzenie_majatku * max(0.0, 1 - wartosc / firma.majatek), 2)
    firma.majatek -= wartosc


def ewidencja(firma: Firma) -> list[dict]:
    """Tabela ewidencji środków trwałych (Biurowiec przy Zana ▸ KPiR, od UF12)."""
    return [{"nazwa": s.nazwa, "rodzaj": s.rodzaj, "od_rundy": s.od_rundy, "stawka": s.stawka, "wartosc": s.wartosc,
             "umorzenie": s.umorzenie, "netto": round(s.wartosc - s.umorzenie, 2)} for s in firma.srodki_trwale]
