"""Schematy plików danych `dane/*.yaml` (pydantic, `extra="forbid"`).

Każdy plik ma `opis` i `zrodlo` (skąd są liczby); katalog i założenia mają `zrodlo` przy każdej sekcji
lub parametrze. Schematy tylko sprawdzają dane – silnik dostaje zwykłe słowniki (`Dane`), więc sprawdzenie
nie zmienia wyników gry. Uruchomienie: `python -m silnik.dane sprawdz`.
"""

from __future__ import annotations

import re
from datetime import date
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

Jakosc = Literal["1", "2", "3"]
Zrodlo = Field(min_length=3)


class Schemat(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Plik(Schemat):
    opis: str = Field(min_length=3)
    zrodlo: str = Zrodlo


# --- uslugi.yaml ---


class Pensje(Schemat):
    niska: float
    srednia: float
    wysoka: float


class Usluga(Schemat):
    nazwa: str
    kategoria: str
    popyt_roczny: int = Field(gt=0)
    cena_preferowana: float = Field(gt=0)
    sezonowosc: list[float] = Field(min_length=12, max_length=12)
    godziny_prowadzacego: float = Field(gt=0)
    godziny_kasy: float = Field(ge=0)
    grupa: int = Field(gt=0)
    prowadzacy: str
    pensje_rynkowe: Pensje
    sprzet: list[str]
    zasoby: dict[str, float]
    opis: str | None = None
    od_rundy: int = Field(default=1, ge=1)   # sprawa 4 (Poprawki 3): danie w menu dopiero od tej rundy
    nazwy_stref: dict[str, str] | None = None   # danie specjalne strefy: {strefa: nazwa w lokalach tej strefy}


class PlikUslug(Plik):
    uslugi: dict[str, Usluga]
    pensje_rynkowe_kasy: Pensje


# --- sprzet.yaml, zasoby.yaml ---


class Sprzet(Schemat):
    dla: Literal["kuchnia", "kasa"]
    ceny: dict[Jakosc, float]
    utrzymanie: dict[Jakosc, float]
    przechowywanie: Literal["chlodnia", "zamrazarka"] | None = None   # miejsce na składniki (gra z lokalami)
    pojemnosc_l: dict[Jakosc, float] | None = None

    @model_validator(mode="after")
    def _pojemnosc(self):
        if (self.przechowywanie is None) != (self.pojemnosc_l is None):
            raise ValueError("przechowywanie i pojemnosc_l podaje się razem")
        return self


class PlikSprzetu(Plik):
    sprzet: dict[str, Sprzet]


class Zasob(Schemat):
    przechowywanie: Literal["chlodnia", "zamrazarka", "suche"] = "suche"
    termin_dni: int | None = Field(default=None, ge=1)   # razem z dniem dostawy; brak = bez terminu
    miejsce_l: float = Field(default=0, ge=0)              # litry opakowania w chłodni / zamrażarce
    zamiennik_dla: str | None = None
    kara_jakosci: float = Field(default=0, ge=0, le=2)    # gwiazdki mniej, gdy zastępuje składnik podstawowy
    opakowanie: float = Field(gt=0)
    jednostka: str
    typ_opakowania: str
    srednie_ceny: dict[Jakosc, float]


class PlikZasobow(Plik):
    zasoby: dict[str, Zasob]


# --- dostawcy.yaml ---


class Gazetka(Schemat):
    pozycji: int = Field(ge=1)                 # ile składników co tydzień w promocji
    rabat_min: float = Field(gt=0, lt=1)
    rabat_max: float = Field(gt=0, lt=1)


class CenyZRynku(Schemat):
    narzut: float = Field(ge=0, lt=1)          # hipermarket: średnia cen pozostałych × (1 + narzut)


class Dostawca(Schemat):
    rodzaj: Literal["dyskont", "hurtownia", "producent", "piekarnia", "hipermarket"]
    opis: str
    dni_dostaw: list[int] = Field(min_length=1)   # 0 = poniedziałek … 6 = niedziela
    koszt_dostawy: float = Field(default=0, ge=0)  # za każdą dostawę (dzień) poniżej progu
    darmowa_od: float | None = Field(default=None, gt=0)
    minimalne_zamowienie: float = Field(default=0, ge=0)   # wartość jednej dostawy
    odbior_osobisty: bool = False                 # dyskont: właściciel jedzie sam (czas właściciela)
    godziny_odbioru: float = Field(default=0, ge=0)
    limit_opakowan: int | None = Field(default=None, ge=1)  # na składnik na dzień
    od_rundy: int = Field(default=0, ge=0)
    gazetka: Gazetka | None = None
    ceny_z_rynku: CenyZRynku | None = None   # bez własnych cen w `ceny`

    @field_validator("dni_dostaw")
    @classmethod
    def _dni(cls, v):
        if sorted(set(v)) != v or v[0] < 0 or v[-1] > 6:
            raise ValueError("dni dostaw: rosnące, bez powtórzeń, 0–6")
        return v


class PlikDostawcow(Plik):
    pierwsi: list[str]
    wszyscy_od_miesiaca: str
    dostawcy: dict[str, Dostawca] = Field(default_factory=dict)   # bez sekcji (dane bez dostawców): dostawa każdego dnia, bez opłat
    ceny: dict[
        str, dict[str, dict[str, dict[Jakosc, float]]]
    ]  # miesiąc → dostawca → zasób → jakość → cena


# --- kandydaci.yaml ---


class ZnanyKandydat(Schemat):
    imie_nazwisko: str
    gwiazdki: int = Field(ge=1, le=3)
    zawod: str
    pensja_preferowana: float = Field(gt=0)
    koszt_rekrutacji: float = Field(ge=0)
    zadowolenie_klientow: float = Field(ge=0, le=1)
    ryzyko_pomylki: float = Field(ge=0, le=1)


class Przedzialy(Schemat):
    pensja: tuple[float, float]
    zk: tuple[float, float]
    ryzyko: tuple[float, float]


class Losowanie(Schemat):
    zrodlo: str = Zrodlo
    na_start: int = Field(ge=0)
    co_runde: int = Field(ge=0)
    wiek: tuple[int, int]
    udzial_kobiet: float = Field(ge=0, le=1)
    gwiazdki: dict[Jakosc, float]
    krok_pensji: int = Field(gt=0)
    wg_gwiazdek: dict[Jakosc, Przedzialy]
    koszt_rekrutacji_czesc_pensji: tuple[float, float]   # koszt rekrutacji kandydata = pensja × wartość z przedziału

    @field_validator("gwiazdki")
    @classmethod
    def _suma_jeden(cls, v: dict[str, float]) -> dict[str, float]:
        if abs(sum(v.values()) - 1) > 1e-9:
            raise ValueError("prawdopodobieństwa gwiazdek muszą sumować się do 1")
        return v


class Nazwisko(Schemat):
    m: str
    k: str


class KanalRekrutacji(Schemat):
    nazwa: str
    od_rundy: int = Field(ge=1)
    gwiazdki: list[int] = Field(min_length=1)
    oplata: float = Field(ge=0)                 # zł za zatrudnienie
    mnoznik_rekrutacji: float = Field(ge=0)     # × koszt rekrutacji kandydata
    czas_wlasciciela: float = Field(ge=0)       # godziny na zatrudnienie
    podkupienie_czesc_pensji: float | None = Field(None, ge=0)   # headhunter: opłata za podkupienie (× pensja)


class Wypowiedzenie(Schemat):
    staz_od: int = Field(ge=0)                  # staż u obecnego pracodawcy w rundach
    rund: int = Field(ge=0)


class Agencja(Schemat):
    zrodlo: str = Zrodlo
    limit_nowych: int = Field(ge=1)
    kanaly: dict[str, KanalRekrutacji]
    wypowiedzenie: list[Wypowiedzenie] = Field(min_length=1)

    @field_validator("kanaly")
    @classmethod
    def _headhunter(cls, v: dict[str, KanalRekrutacji]) -> dict[str, KanalRekrutacji]:
        if "headhunter" not in v or v["headhunter"].podkupienie_czesc_pensji is None:
            raise ValueError("kanał headhunter z podkupienie_czesc_pensji jest wymagany (podkupienia)")
        return v


class Cecha(Schemat):
    """Cecha osoby – mnożniki składników zadowolenia; panel pokazuje nazwę i skutki (charakter jawny)."""
    nazwa: str = ""   # rzeczownik do pigułki w panelu (np. „optymizm”); pusty – nazwa z klucza
    waga: float = Field(gt=0)
    placa: float = Field(1.0, ge=0)
    warunki: float = Field(1.0, ge=0)
    przeciazenie: float = Field(1.0, ge=0)
    odejscie: float = Field(1.0, ge=0)
    zadowolenie: float = 0.0
    wydajnosc: float = Field(1.0, gt=0)
    opisy: list[str] = Field(min_length=1)


class Cechy(Schemat):
    zrodlo: str = Zrodlo
    lista: dict[str, Cecha] = Field(min_length=1)


class PlikKandydatow(Plik):
    znani: list[ZnanyKandydat]
    losowanie: Losowanie
    agencja: Agencja | None = None  # kanały rekrutacji gry z lokalami; katalog bazowy ich nie ma
    cechy: Cechy | None = None      # ukryte cechy osób; bez nich – wszyscy zwyczajni
    imiona_kobiet: list[str] = Field(min_length=1)
    imiona_mezczyzn: list[str] = Field(min_length=1)
    nazwiska: list[Nazwisko] = Field(min_length=1)


# --- katalog.yaml ---


class Sekcja(Schemat):
    zrodlo: str = Zrodlo


class Kalendarz(Sekcja):
    """Długość rundy: tydzień (52 rundy w roku) albo miesiąc (12); start = pierwszy dzień rundy 1."""
    okres: Literal["tydzien", "miesiac"]
    rund_w_roku: int
    start: date

    @model_validator(mode="after")
    def _okres(self) -> Kalendarz:
        if self.rund_w_roku != {"tydzien": 52, "miesiac": 12}[self.okres]:
            raise ValueError("rund_w_roku: tydzień → 52, miesiąc → 12")
        if self.okres == "miesiac" and self.start.day != 1:
            raise ValueError("runda miesięczna zaczyna się pierwszego dnia miesiąca")
        return self


class ZakladkaHarmonogramu(Schemat):
    nazwa: str
    tydzien: int = Field(ge=1)


class HarmonogramLokali(Sekcja):
    zakladki: dict[str, ZakladkaHarmonogramu]


class Rundy(Sekcja):
    kalendarz: Kalendarz
    domyslna_liczba: int = Field(gt=0)
    odblokowanie: dict[str, list[str]]
    harmonogram_lokali: HarmonogramLokali | None = None   # gra z lokalami – zamiast `odblokowanie`
    uslugi_w_rundzie_1: int = Field(ge=0)
    uslugi_startowe: list[str]
    uslugi_startowe_zrodlo: str
    nowe_uslugi_na_runde: int = Field(ge=0)
    nowe_uslugi_od_rundy: int = Field(ge=1)


class TypStanowiska(Schemat):
    nazwa: str  # nagłówek w zakładkach, np. „Stanowiska kuchenne”
    kto: str  # krótka nazwa, np. „Kuchnia”
    zawody: list[str] = Field(min_length=1)


class StanowiskoStartowe(Schemat):
    typ: Literal["kuchnia", "kasa"]
    sprzet: dict[str, int] = Field(default_factory=dict)  # nazwa → jakość 1–3


class Stanowiska(Sekcja):
    pakiety: dict[str, float]  # liczba nowych stanowisk → cena pakietu
    typy: dict[Literal["kuchnia", "kasa"], TypStanowiska]
    startowe: list[StanowiskoStartowe] = Field(default_factory=list)  # gotowy lokal: stanowiska na start, za darmo

    @model_validator(mode="after")
    def _typy(self) -> Stanowiska:
        if set(self.typy) != {"kuchnia", "kasa"}:
            raise ValueError("potrzebne są oba typy stanowisk: kuchnia i kasa")
        zawody = [z for t in self.typy.values() for z in t.zawody]
        if len(zawody) != len(set(zawody)):
            raise ValueError("zawód może należeć tylko do jednego typu stanowiska")
        return self


class Udogodnienie(Schemat):
    nazwa: str
    procent: float
    cena: float
    utrzymanie: float
    od_rundy: int = 1
    sklep: str | None = None      # gra z lokalami: sklep budowlany / meblowy na mapie
    opis: str | None = None       # krótki opis w kafelku (panel)


class FirmaSzkoleniowa(Schemat):
    nazwa: str
    zadowoleni_klienci: float


class Szkolenie(Schemat):
    nazwa: str
    procent: float
    ceny: list[float]
    dawne: list[str] = []   # poprawki 3 (sprawa 8): dawne nazwy połączonych szkoleń – stare zapisy gier


class SekcjaUdogodnien(Sekcja):
    pozycje: list[Udogodnienie]


class SekcjaSzkolen(Sekcja):
    firmy: list[FirmaSzkoleniowa]
    pozycje: list[Szkolenie]

    @model_validator(mode="after")
    def _ceny_firm(self) -> SekcjaSzkolen:
        for p in self.pozycje:
            if len(p.ceny) != len(self.firmy):
                raise ValueError(
                    f"szkolenie {p.nazwa}: {len(p.ceny)} cen, a firm jest {len(self.firmy)}"
                )
        return self


class PlikKatalogu(Schemat):
    opis: str
    rundy: Rundy
    stanowiska: Stanowiska
    udogodnienia: SekcjaUdogodnien
    wyposazenie: SekcjaUdogodnien
    szkolenia: SekcjaSzkolen


# --- boty.yaml ---


class PromocjaBota(Schemat):
    typ: str
    nazwa: str


class LokalBota(Schemat):
    """Wybór lokalu przez bota – opis pól w silnik/boty.py: _wybierz_lokal."""
    typy: list[Literal["gotowy", "niewyposazony", "dzialka"]] = ["gotowy"]
    forma: Literal["najem", "kupno"] = "najem"
    przebicie: float = Field(1.0, ge=1)
    rezerwa: float = Field(0, ge=0)


class LeasingBota(Schemat):
    """Nowy sprzęt w leasingu, gdy gotówki (po decyzji o lokalu) jest mniej niż `gotowka`."""
    gotowka: float = Field(ge=0)
    rund: int = Field(gt=0)


class PrzejecieBota(Schemat):
    """Kupno budynku z najemcą, gdy po zakupie zostaje `rezerwa` gotówki: przy `wykup` – własnego lokalu
    w najmie, przy `przejecie` – budynku rywala; `wypowiedz` – potem wypowiada rywalowi najem; `kredyt` – z kredytem
    inwestycyjnym pod zastaw kupowanego budynku (banki.yaml: zastaw_przejecia)."""
    rezerwa: float = Field(0, ge=0)
    kredyt: bool = False
    wypowiedz: bool = False
    ulepszenia: Literal["zatrzymaj", "przywroc"] = "zatrzymaj"


class LokatyBota(Schemat):
    """Nadwyżka gotówki ponad `bufor` na lokatę na `rund` rund (bank z najlepszą lokatą), najwyżej jedna
    lokata w rundzie i nie mniej niż `min_kwota`; gdy gotówki jest mniej niż `zerwij_ponizej` – zrywa najnowszą."""
    bufor: float = Field(ge=0)
    rund: int = Field(gt=0)
    min_kwota: float = Field(0, ge=0)
    zerwij_ponizej: float = Field(0, ge=0)


class KredytBota(Schemat):
    """Jeden kredyt `produkt` (najtańszy bank z tym produktem) w rundzie `od_rundy` na `kwota` i `rund` rund."""
    produkt: str
    kwota: float = Field(gt=0)
    rund: int = Field(gt=0)
    od_rundy: int = Field(1, ge=1)


class HarpagonBota(Schemat):
    """Pożyczka `kwota` od Harpagona, gdy gotówki jest mniej niż `prog`; spłata z nadwyżki ponad `prog`
    (także częściowa)."""
    prog: float
    kwota: float = Field(gt=0)


class KsiegowoscBota(Schemat):
    """Samodzielna księgowość (gdy firma wybrała `biuro: samodzielnie`) – bot księguje dokumenty i składa
    deklaracje; każda deklaracja z szansą `bledy` jest błędna o `odchylenie` (część poprawnej kwoty, w dół)."""
    bledy: float = Field(default=0, ge=0, le=1)
    odchylenie: float = Field(default=0, ge=0, le=1)


class KasynoBota(Schemat):
    """Po zaproszeniu `zakladow` zakładów po `stawka` zł (gra, zakład ruletki) – stawki wypłatą własną z firmy,
    w następnej rundzie wygrana ponad oszczędności właściciela wraca do firmy wpłatą własną."""
    gra: str
    zaklad: str | None = None
    stawka: float = Field(gt=0)
    zakladow: int = Field(1, ge=1)


class Strategia(Schemat):
    nazwa: str
    # finanse (bez – bot ich nie używa)
    lokaty: LokatyBota | None = None
    kredyt: KredytBota | None = None
    harpagon: HarpagonBota | None = None
    kasyno: KasynoBota | None = None
    ksiegowosc: KsiegowoscBota | None = None   # deklaracje przy samodzielnej księgowości (bez – nie składa)
    # zakupy poniżej progu amortyzacji – od razu w koszty (domyślnie) albo do ewidencji z amortyzacją
    amortyzacja_niskocenna: Literal["koszty", "amortyzacja"] = "koszty"
    leasing: LeasingBota | None = None   # gra z lokalami: sprzęt w leasingu przy małej gotówce (bez – zawsze zakup)
    wykup: PrzejecieBota | None = None       # wykup własnego lokalu w najmie (bez – nie wykupuje)
    przejecie: PrzejecieBota | None = None   # kupno budynku wynajmowanego przez rywala (bez – nie kupuje)
    lokal: LokalBota | None = None   # gra z lokalami: typ, forma i oferta lokalu (bez – gotowy w najmie, cena wywoławcza)
    min_kuchnia: int = Field(0, ge=0)   # gra z lokalami, bot planujący: najmniej miejsc w kuchni wybieranego lokalu
    cena: float | None  # ułamek ceny preferowanej; None = średnia rynku z poprzedniej rundy
    jakosc: int = Field(ge=1, le=3)
    jakosc_zasobow: int | None = Field(None, ge=1, le=3)   # gwiazdki składników (bez – jak jakosc)
    zapas_zasobow: float | None = Field(None, ge=1)   # zapas w zamówieniach (bez – ustawienia botów)
    dostawcy: list[str] | None = None   # dostawcy, u których bot zamawia (bez – wszyscy poza hipermarketem)
    dyskonty: bool = False   # zakupy w dyskoncie (odbiór osobisty, czas właściciela)
    auto_dostawy: bool = False   # lokal główny na auto-dostawach (silnik/kuchnia/auto_dostawca.py)
    # ludzie – pensja (ułamek preferowanej albo „minimalna”), gwiazdki zatrudnianych (bez – jak jakosc),
    # kanał rekrutacji (bez – najtańszy), premia na osobę co rundę, godziny właściciela na pustym stanowisku kasy
    pensja: float | Literal["minimalna"] = 1.0
    jakosc_ludzi: int | None = Field(None, ge=1, le=3)
    kanal: str | None = None
    premia: float = Field(0, ge=0)
    umowa: Literal["prace", "zlecenie"] = "prace"   # forma zatrudnienia nowych osób (zlecenie: bez urlopu i wypowiedzenia)
    wlasciciel_godziny: float = Field(0, ge=0)
    uslugi: int = Field(gt=0)
    dania_specjalne: list[str] = Field(default_factory=list)   # sprawa 4 (Poprawki 3): po odblokowaniu, ponad uslugi
    pokrycie: float = Field(gt=0)
    wyposazenie: int = Field(ge=0)
    udogodnienia: int = Field(ge=0)
    szkolenia: int = Field(ge=0)
    kampanie: list[str] = Field(default_factory=list)   # gra z lokalami: "agencja/kanał" z mapa/reklama.yaml
    # emisje w kampanii i rundy przerwy po kampanii w tym kanale i strefie (bez – ustawienia botów)
    emisje_kampanii: int | None = Field(None, ge=1)
    przerwa_kampanii: int | None = Field(None, ge=0)
    promocje: list[PromocjaBota] = Field(default_factory=list)   # gra z lokalami: typy z mapa/promocje.yaml
    polisy: list[str] = Field(default_factory=list)   # gra z lokalami: rodzaje polis z zdarzenia/losowe.yaml
    higiena: str | None = None   # gra z lokalami: poziom higieny z zdarzenia/urzad.yaml (None – domyślny)
    higiena_po_odbiorze: str | None = None   # poziom, gdy wszystkie lokale już odebrane (None – jak `higiena`)


class UstawieniaBotow(Schemat):
    bufor_gotowki: float
    rezerwa_po_sprzecie: float = Field(0, ge=0)   # gotówka po zakupie sprzętu; resztę bot bierze kredytem bez historii
    bufor_kampanii: float = Field(0, ge=0)   # gra z lokalami: gotówka, która musi zostać po kampaniach reklamowych
    emisje_kampanii: int = Field(6, ge=1)     # tyle emisji bot zamawia w kampanii (najwyżej maks_emisji kanału)
    przerwa_kampanii: int = Field(1, ge=0)    # rund przerwy po kampanii w tym samym kanale i strefie
    min_obsluga_promocji: float = Field(1, ge=0, le=1)   # promocje tylko, gdy w poprzedniej rundzie obsłużył taką
                                                          # część popytu (kuchnia nie nadąża – promocja tylko ucina cenę)
    maks_obciazenie_kuchni_porcji: float = Field(1, ge=0, le=1)   # „2 za 1” tylko przy takim średnim obciążeniu kuchni
    cena_nasladowcy_bez_danych: float = Field(gt=0)
    krok_ceny: float = Field(gt=0)
    losuj_z_najlepszych_kandydatow: int = Field(gt=0)
    zapas_zasobow: float = Field(ge=1)


class KolejnyLokalBota(Schemat):
    obsluga: float = Field(gt=0, le=1)
    gotowka: float = Field(ge=0)
    maks_lokali: int = Field(ge=1)
    lokal: LokalBota | None = None   # kolejny lokal inaczej niż pierwszy (pola nadpisują `lokal` strategii)


class PrognozaCzlowieka(Schemat):
    """Bot „jak człowiek”: prognoza z raportów poprzednich rund – opis pól w dane/boty.yaml."""
    rund: int = Field(1, ge=1)
    pule: bool = False


class DbaOLudzi(Schemat):
    podwyzka_maks: float = Field(ge=1)   # najwyżej tyle × pensja preferowana
    zapas: float = Field(ge=0)           # podwyżka do progu zadowolenia + zapas


class PoziomBota(Schemat):
    """Zachowanie bota na poziomie (gra z lokalami) – opis pól w dane/boty.yaml."""
    nazwa: str
    opis: str
    planowanie: Literal["proste", "przepustowosc"] = "przepustowosc"
    cel_obslugi: float = Field(1.0, gt=0, le=1)
    blad_prognozy: float = Field(0, ge=0, lt=1)
    losowy_kandydat: bool = False
    kampanie: bool = True
    promocje: bool = True
    korekta_prognozy: list[float] | None = Field(None, min_length=2, max_length=2)
    mnozniki_ceny: list[float] = Field(default_factory=list)
    narzut_pracy: float = Field(1.0, ge=1)
    obsluga_kampanii: float | None = Field(None, ge=0, le=1)
    kolejny_lokal: KolejnyLokalBota | None = None
    przewaga_popytu: float = Field(1.0, ge=1)   # niemożliwy: mnożnik atrakcyjności lokali bota (oszustwo)
    prognoza_czlowieka: PrognozaCzlowieka | None = None
    zamowienia_ze_sprzedazy: float | None = Field(None, ge=1)   # limit zamówień po kolejce w kuchni
    zapas_zasobow: float | None = Field(None, ge=1)   # zapas zamówień poziomu (bez – ustawienia botów)
    tylko_pomiar: bool = False   # poziom do pomiarów (balans/), bez wyboru w panelu mistrza gry
    dba_o_ludzi: DbaOLudzi | None = None   # podwyżka dla niezadowolonych (łatwy ich ignoruje)
    limit_handlu: float | None = Field(None, gt=0, le=1)   # giełda handlu: najwyższa cena w licytacji × wartość
    debet: bool = False   # tor A: włącza debet w banku konta (bez – saldo poniżej zera to alarm i odsetki karne)
    podkupuje_ludzi: bool = False   # podkupuje niedopłacanych (zalozenia.yaml: pracownicy.podkupywanie_botow)

    @model_validator(mode="after")
    def _czlowiek_bez_modelu(self) -> PoziomBota:
        # bot „jak człowiek” nie zna modelu popytu: bez korekty o prognozę modelu, wyboru ceny i oszustwa
        if self.prognoza_czlowieka and (self.korekta_prognozy or self.mnozniki_ceny or self.przewaga_popytu != 1):
            raise ValueError("prognoza_czlowieka wyklucza korekta_prognozy, mnozniki_ceny i przewaga_popytu")
        return self


class PlikBotow(Plik):
    ustawienia: UstawieniaBotow
    strategie: dict[str, Strategia]
    poziomy: dict[str, PoziomBota] | None = None


# --- zalozenia.yaml ---


class Zalozenie(Schemat):
    wartosc: Any
    pewnosc: Literal["potwierdzone", "skalibrowane", "zalozenie"]
    zrodlo: str = Zrodlo


def sprawdz_zalozenia(drzewo: dict, sciezka: str = "") -> list[str]:
    """Każdy liść drzewa założeń to {wartosc, pewnosc, zrodlo}; zwraca listę błędów."""
    bledy = []
    for k, v in drzewo.items():
        if k == "opis" and not sciezka:
            continue
        miejsce = sciezka + k
        if isinstance(v, dict) and "wartosc" in v:
            try:
                Zalozenie.model_validate(v)
            except ValueError as e:
                bledy.append(f"zalozenia.yaml: {miejsce}: {e}")
        elif isinstance(v, dict) and v:
            bledy += sprawdz_zalozenia(v, miejsce + ".")
        else:
            bledy.append(f"zalozenia.yaml: {miejsce}: brak wartosc/pewnosc/zrodlo")
    return bledy


# --- mapa/*.yaml (strefy, lokale, budynki; katalog opcjonalny – bez niego gra działa bez lokali) ---


class Prostokat(Schemat):
    x: int = Field(ge=0)
    y: int = Field(ge=0)
    szer: int = Field(default=1, ge=1)
    gl: int = Field(default=1, ge=1)


class Siatka(Schemat):
    szer: int = Field(gt=0)
    gl: int = Field(gt=0)


class Strefa(Schemat):
    nazwa: str
    opis: str
    klienci: str
    kolor: str = Field(pattern=r"^#[0-9a-fA-F]{6}$")
    mapa: Prostokat
    czynsz_m2: float = Field(gt=0)
    # nowa mapa Lublina: prawdziwe dzielnice (nazwy z OSM), z których składa się strefa popytu, i jej „serce”
    dzielnice: list[str] = []
    serce: str | None = None


class PlikStref(Plik):
    siatka: Siatka
    strefy: dict[str, Strefa]


class StanowiskoZestawu(Schemat):
    typ: Literal["kuchnia", "kasa"]
    sprzet: dict[str, int]


class Zestaw(Schemat):
    nazwa: str
    opis: str
    stanowiska: list[StanowiskoZestawu] = Field(min_length=1)


class ZasadyLokali(Schemat):
    nowy_lokal_co_rund: int = Field(ge=1)
    kaucja_miesiecy: float = Field(ge=0)
    urzadzanie_rund: int = Field(ge=0)
    # licytacje i przejęcia (silnik/nieruchomosci/przejecia.py)
    licytacje_od_rundy: int = Field(ge=1)      # od tej rundy można przebić cenę wywoławczą (wcześniej remis)
    oferta_max: float = Field(ge=1)            # najwyżej tyle × cena wywoławcza (chroni przed literówką)
    krok_przebicia: float = Field(ge=0, le=1)   # o ile (ułamek) oferta musi przebić najwyższą ofertę innej drużyny
    przejecia_od_rundy: int = Field(ge=1)
    wypowiedzenie_rund: int = Field(ge=1)      # KC art. 673, 678
    ulepszenia_zwrot: float = Field(ge=0, le=1)     # część nakładów najemcy, którą płaci zatrzymujący je właściciel
    przywrocenie_koszt: float = Field(ge=0, le=1)   # część nakładów, którą płaci najemca za przywrócenie stanu


class Miejsca(Schemat):
    kuchnia: int = Field(ge=1)
    kasa: int = Field(ge=1)


class Pole(Schemat):
    x: int = Field(ge=0)
    y: int = Field(ge=0)


class Geo(Schemat):
    lat: float   # stopnie WGS84 z OSM (Lublin ok. 51,2)
    lon: float   # (Lublin ok. 22,6)


class Lokal(Schemat):
    id: str = Field(pattern=r"^[a-z0-9_]+$")
    nazwa: str
    strefa: str
    typ: Literal["gotowy", "niewyposazony", "dzialka"]
    adres: str
    geo: Geo | None = None   # położenie na nowej mapie (strona [mapa], z adresu: narzedzia/mapa/pobierz_osm.py)
    opis: str
    metraz: int = Field(gt=0)
    miejsca: Miejsca
    zestaw: str | None = None
    czynsz: float | None = Field(default=None, gt=0)
    cena: float | None = Field(default=None, gt=0)
    adaptacja: float | None = Field(default=None, ge=0)
    budowa_rund: int | None = Field(default=None, ge=1)
    koszt_budowy: float | None = Field(default=None, ge=0)
    utrzymanie: float = Field(ge=0)
    tylko_kupno: bool = False
    wlasciciel: str | None = None
    od_rundy: int = Field(default=1, ge=1)
    od_firm: int = Field(default=1, ge=1)   # na mapie w grze z co najmniej tyloma firmami
    mapa: Pole

    @model_validator(mode="after")
    def _typ(self):
        if self.czynsz is None and self.cena is None:
            raise ValueError("lokal musi mieć czynsz (najem) albo cenę (kupno)")
        if self.typ == "gotowy" and not self.zestaw:
            raise ValueError("lokal gotowy musi mieć zestaw sprzętu")
        if self.typ != "gotowy" and self.zestaw:
            raise ValueError("zestaw sprzętu ma tylko lokal gotowy")
        if self.typ == "niewyposazony" and self.adaptacja is None:
            raise ValueError("lokal niewyposażony musi mieć koszt adaptacji")
        if self.typ == "dzialka" and (self.cena is None or self.czynsz is not None or not self.budowa_rund
                                      or self.koszt_budowy is None):
            raise ValueError("działka: tylko kupno (cena, bez czynszu), budowa_rund i koszt_budowy")
        if self.tylko_kupno and (self.cena is None or self.czynsz is not None):
            raise ValueError("tylko_kupno: cena bez czynszu")
        return self


class PlikLokali(Plik):
    zasady: ZasadyLokali
    zestawy: dict[str, Zestaw]
    lokale: list[Lokal] = Field(min_length=1)


class Budynek(Schemat):
    id: str = Field(pattern=r"^[a-z0-9_]+$")
    nazwa: str
    rodzaj: str
    strefa: str
    opis: str
    zakladka: str | None
    mapa: Prostokat
    # nowa mapa Lublina (OSM, strona [mapa]): prawdziwe miejsce z planu, adres i współrzędne; wnętrze budynku
    miejsce: str | None = None
    adres: str | None = None
    geo: Geo | None = None
    wnetrze: str | None = None
    zespol: str | None = None   # id budynku zbiorczego (kamienica, biurowiec): na nowej mapie rysuje się tylko zespół


class Zespol(Schemat):
    """Budynek zbiorczy na nowej mapie: po kliknięciu hol z szyldami, potem wybór firmy (decyzja autora 14.11)."""
    id: str = Field(pattern=r"^[a-z0-9_]+$")
    nazwa: str
    opis: str
    miejsce: str
    adres: str | None = None
    geo: Geo | None = None
    wnetrze: str | None = None


class PlikBudynkow(Plik):
    budynki: list[Budynek]
    zespoly: list[Zespol] = []


class Rozruch(Schemat):
    start: float = Field(gt=0, le=1)   # mnożnik popytu w pierwszym tygodniu sprzedaży lokalu
    przyrost: float = Field(gt=0)      # o tyle więcej co tydzień, do 1


class ModelPopytu(Schemat):
    opcja_zewnetrzna: float = Field(gt=0)
    elastycznosc_ceny: float = Field(ge=0)
    zasieg: float = Field(gt=0)
    szum_proc: float = Field(ge=0)
    zadowolenie_odniesienie: float = Field(gt=0)
    zadowolenie_wykladnik: float = Field(ge=0)
    rozruch: Rozruch | None = None


class DniTygodnia(Schemat):
    nazwy: list[str] = Field(min_length=7, max_length=7)
    wagi: list[float] = Field(min_length=7, max_length=7)


class PopytStrefy(Schemat):
    pula: float = Field(ge=0)
    cena: float = Field(gt=0)
    wrazliwosc_ceny: float = Field(ge=0)
    konkurencja: float = Field(default=1.0, gt=0)   # dzielnik atrakcyjności lokali gry w strefie (lokale miasta spoza gry)
    dni: list[float] | None = Field(default=None, min_length=7, max_length=7)
    miesiace: list[float] | None = Field(default=None, min_length=12, max_length=12)


class WagiJakosciDania(Schemat):
    skladniki: float = Field(ge=0)
    kucharze: float = Field(ge=0)
    sprzet: float = Field(ge=0)


class WidelkiCen(Schemat):
    min: float = Field(gt=0)
    max: float = Field(gt=0)

    @model_validator(mode="after")
    def _kolejnosc(self):
        if self.min >= self.max:
            raise ValueError("ceny: min musi być mniejsze od max")
        return self


class PlikMenu(Plik):
    jakosc: WagiJakosciDania
    zmiana_dania: float = Field(ge=0, le=1)
    ceny: WidelkiCen


class PlikPopytu(Plik):
    model: ModelPopytu
    dni_tygodnia: DniTygodnia
    strefy: dict[str, PopytStrefy]


# --- mapa/banki.yaml ---


class Terminal(Schemat):
    abonament: float = Field(ge=0)       # miesięczny
    prowizja: float = Field(ge=0, lt=1)  # od płatności kartą


class Debet(Schemat):
    limit: float = Field(ge=0)             # najwyżej tyle może wynieść debet za zgodą banku
    oplata: float = Field(ge=0)            # za każdy tydzień na minusie (brutto, zł)
    oprocentowanie: float = Field(ge=0, lt=1)   # roczne, od debetu w limicie


class ProduktKredytowy(Schemat):
    produkt: Literal["start", "inwestycyjny", "obrotowy"]
    nazwa: str
    oprocentowanie: float = Field(gt=0, lt=1)
    prowizja: float = Field(ge=0, lt=1)
    maks_kwota: float = Field(gt=0)
    maks_rund: int = Field(gt=0)
    historia: bool = False               # wymaga historii firmy (banki.yaml: historia_rund)
    od_lokalu: bool = False              # dla firmy z lokalem (także kupowanym w tej rundzie – może być zastawem)
    zastaw: float | None = Field(default=None, gt=0, le=1)  # część wartości zastawu, którą bank pożycza


class OfertaLeasingu(Schemat):
    wplata: float = Field(ge=0, lt=1)    # wpłata własna – część ceny sprzętu
    oprocentowanie: float = Field(gt=0, lt=1)
    rund: list[int] = Field(min_length=1)
    wykup: float = Field(ge=0, lt=1)


class BankMapy(Schemat):
    nazwa: str
    specjalizacja: str
    opis: str
    konto: float = Field(ge=0)           # miesięczna opłata
    terminal: Terminal
    lokaty: dict[int, float] = Field(min_length=1)   # okres w rundach → oprocentowanie roczne
    debet: Debet
    kredyty: list[ProduktKredytowy] = Field(default_factory=list)
    leasing: OfertaLeasingu | None = None


class PrzejecieDebetu(Schemat):
    """Zmiana banku z debetem, na który nie starcza gotówki: nowy bank przejmuje debet za opłatę (procent kwoty,
    nie mniej niż najmniejsza opłata za debet w bankach)."""
    procent: float = Field(ge=0, lt=1)
    pewnosc: Literal["potwierdzone", "skalibrowane", "zalozenie"]
    zrodlo: str = Zrodlo


class PlikBankow(Plik):
    przejecie_debetu: PrzejecieDebetu | None = None   # brak – debet przechodzi do nowego banku bez opłaty
    udzial_kart: float = Field(ge=0, le=1)
    historia_rund: int = Field(ge=0)
    stopa_referencyjna_nbp: float | None = Field(default=None, gt=0, lt=1)   # podstawa limitów prawnych (silnik.dane sprawdz)
    stopa_karna: float = Field(gt=0, lt=1)
    marza_odsetki_maksymalne: float = Field(default=0, ge=0, lt=1)   # art. 359 § 2¹ KC: 2 × (ref. + 3,5 pp)
    marza_odsetki_opoznienie: float = Field(default=0, ge=0, lt=1)   # art. 481 § 2¹ KC: 2 × (ref. + 5,5 pp)
    oplata_debet_bez_zgody: float = Field(default=0, ge=0)   # stała opłata za tydzień na minusie bez zgody banku (zł)
    przejecie_po: int = Field(gt=0)
    wycena_zastawu: float = Field(gt=0, le=1)
    czynsz_po_przejeciu: float = Field(gt=0, lt=1)
    zastaw_przejecia: bool = False   # budynek z najemcą jako zastaw kredytu (silnik/pieniadze/banki.py)
    tylko_bank_konta: bool = False   # lokaty, kredyty i leasing tylko w banku konta firmowego (sprawa 21)
    banki: list[BankMapy] = Field(min_length=1)

    @model_validator(mode="after")
    def _nazwy(self):
        nazwy = [b.nazwa for b in self.banki]
        if len(set(nazwy)) != len(nazwy):
            raise ValueError("nazwy banków muszą być różne")
        return self


# --- mapa/harpagon.yaml ---


class Wizyta(Schemat):
    rodzaj: Literal["szkody", "klienci", "pracownik"]
    waga: float = Field(gt=0)
    koszt: tuple[float, float] | None = None      # szkody: naprawa od–do
    odplyw: float | None = Field(default=None, gt=0, lt=1)   # klienci: tyle mniej gości w tej rundzie
    historie: list[str] = Field(min_length=1)

    @model_validator(mode="after")
    def _parametry(self):
        if self.rodzaj == "szkody" and not (self.koszt and 0 < self.koszt[0] <= self.koszt[1]):
            raise ValueError("wizyta „szkody” wymaga kosztu [od, do]")
        if self.rodzaj == "klienci" and self.odplyw is None:
            raise ValueError("wizyta „klienci” wymaga odpływu")
        return self


class PlikHarpagona(Plik):
    maks_kwota: float = Field(gt=0)
    min_kwota: float = Field(gt=0)
    oprocentowanie_rundy: float = Field(gt=0, lt=1)
    termin_rund: int = Field(gt=0)
    odsetki_karne_rundy: float = Field(gt=0, lt=1)
    karne_od: int = Field(gt=0)
    wizyty_od: int = Field(gt=0)
    przed_terminem: str
    karne: str
    przypomnienia: list[str] = Field(min_length=1)
    wizyty: list[Wizyta] = Field(min_length=1)


# --- mapa/biura.yaml ---

class KadryBiura(Schemat):
    w_cenie: int = Field(ge=0)
    etat: float = Field(ge=0)
    zlecenie: float = Field(ge=0)


class PakietBiura(Schemat):
    cena: float = Field(ge=0)            # miesięcznie, brutto
    dokumenty: int = Field(gt=0)         # limit dokumentów w miesiącu
    doplata: float = Field(ge=0)         # za każdy dokument ponad limit (brutto)


class ZamknieteWSwieta(Schemat):
    doplata: float = Field(ge=0)         # za każdy dokument przeniesiony na następny tydzień (brutto, zł)
    zrodlo: str = Zrodlo


class BiuroMapy(Schemat):
    id: str
    nazwa: str
    wlasciciel: str | None = None
    opis: str
    cecha: str
    pakiety: dict[Literal["S", "M", "L"], PakietBiura]
    kadry: KadryBiura
    ryzyko_bledu: float = Field(ge=0, lt=1)
    oc: bool
    zamkniete_w_swieta: ZamknieteWSwieta | None = None   # w tygodniu ze świętem dokumenty czekają do następnego
    zmiana_pakietu_po: int = Field(default=0, ge=0)   # rund do wejścia nowego pakietu
    bez_limitu: bool = False   # pakiety bez limitu dokumentów – żadnej dopłaty za dokument (Asteroida 328)

    @model_validator(mode="after")
    def _trzy_pakiety(self):
        if set(self.pakiety) != {"S", "M", "L"}:
            raise ValueError("biuro ma pakiety S, M i L")
        return self


class Samodzielna(Schemat):
    kara_blad: float = Field(gt=0)
    kara_brak: float = Field(gt=0)
    opis: str


class ZmianaBiura(Schemat):
    """Jednorazowa opłata za zmianę biura: tyle tygodni pakietu NOWEGO biura (pierwszy wybór – bez opłaty)."""
    tygodni_pakietu: float = Field(gt=0)
    pewnosc: Literal["potwierdzone", "skalibrowane", "zalozenie"]
    zrodlo: str = Zrodlo


class PlikBiur(Plik):
    zmiana_biura: ZmianaBiura | None = None   # brak – zmiana biura bez opłaty
    szacunek_dokumentow: int = Field(gt=0)
    pakiet_domyslny: Literal["S", "M", "L"] = "M"
    biura: list[BiuroMapy] = Field(min_length=1)
    bledy: list[str] = Field(min_length=1)
    samodzielna: Samodzielna
    kara_bledu_biura: float | None = Field(default=None, gt=0)   # brak – jak samodzielna.kara_blad

    @model_validator(mode="after")
    def _unikalne(self):
        ids = [b.id for b in self.biura]
        if len(ids) != len(set(ids)) or "samodzielnie" in ids:
            raise ValueError("id biur muszą być unikalne (i różne od „samodzielnie”)")
        return self


# --- mapa/reklama.yaml (agencje reklamowe) ---


class KanalReklamy(Schemat):
    nazwa: str
    od_rundy: int = Field(ge=1)
    zasieg: Literal["strefa", "miasto"]
    strefy: list[str] | None = None      # tylko te strefy (brak – każda)
    emisja: str = Field(min_length=3)    # jednostka kanału (paczka ulotek, post, spot…)
    cena_emisji: float = Field(gt=0)     # netto; zasięg „strefa” – × pula strefy
    znizki: list[tuple[int, float]] = Field(default_factory=list)   # [od ilu emisji, rabat] – rosnąco
    maks_emisji: int = Field(ge=1)       # najwięcej emisji w jednej rundzie
    pula: float = Field(ge=0, lt=1)      # przy pełnym nasyceniu (dużo emisji)
    przyciaganie: float = Field(ge=0, lt=2)
    teksty: list[str] = Field(min_length=1)

    @field_validator("znizki")
    @classmethod
    def _progi(cls, v: list[tuple[int, float]]) -> list[tuple[int, float]]:
        if any(od < 2 or not 0 < r < 1 for od, r in v):
            raise ValueError("próg zniżki: od co najmniej 2 emisji, rabat w (0, 1)")
        if any(a[0] >= b[0] or a[1] >= b[1] for a, b in zip(v, v[1:])):
            raise ValueError("progi zniżek rosnąco: więcej emisji – większy rabat")
        return v


class AgencjaReklamowa(Schemat):
    nazwa: str
    budynek: str
    rodzaj: str
    opis: str
    kanaly: dict[str, KanalReklamy] = Field(min_length=1)


class ModelReklamy(Schemat):
    zagluszanie: float = Field(ge=0)
    tempo_emisji: float = Field(gt=0)    # efekt kampanii × (1 − e^(−tempo × emisje))
    wygasanie: float = Field(ge=0, lt=1)
    prog_wygasania: float = Field(gt=0, le=1)
    maks_przyciagania: float = Field(default=10.0, gt=0)   # sufit sumy kampanii firmy w strefie (nasycenie)
    maks_puli: float = Field(default=10.0, gt=0)           # sufit poszerzenia puli strefy przez wszystkie kampanie


class ModelInternetu(Schemat):
    """Efekt kampanii internetowej w kolejnych rundach – narastanie (od rundy emisji), potem × trwalosc."""
    narastanie: list[float] = Field(min_length=1)
    trwalosc: float = Field(gt=0, lt=1)
    prog_wygasania: float = Field(gt=0, le=1)

    @field_validator("narastanie")
    @classmethod
    def _udzialy(cls, v: list[float]) -> list[float]:
        if any(not 0 < x <= 1 for x in v):
            raise ValueError("narastanie: części efektu w (0, 1]")
        return v


class ReklamaInternetowa(Schemat):
    model: ModelInternetu
    agencje: dict[str, AgencjaReklamowa] = Field(min_length=1)


class PlikReklamy(Plik):
    model: ModelReklamy
    agencje: dict[str, AgencjaReklamowa] = Field(min_length=1)
    internet: ReklamaInternetowa | None = None   # marketing internetowy (zakładka Biurowiec przy Zana → Internet)

    @model_validator(mode="after")
    def _rozne_agencje(self):
        if self.internet and set(self.agencje) & set(self.internet.agencje):
            raise ValueError("agencja nie może być jednocześnie tradycyjna i internetowa")
        return self


class TypPromocji(Schemat):
    nazwa: str
    opis: str
    zakres: Literal["danie", "wszystkie"]
    dni: list[int] | None = None                 # dni tygodnia (0 = poniedziałek); brak – wszystkie
    strefy_klientow: list[str] | None = None     # klienci z tych stref; brak – wszyscy
    rabat: float = Field(0, ge=0, lt=1)
    porcje: int = Field(1, ge=1)
    doplata: float = Field(0, ge=0)              # zł brutto ponad cenę dania
    koszt_dodatku: float = Field(0, ge=0)        # zł netto za objętego klienta
    przyciaganie: float = Field(ge=0, lt=2)
    przyrost: float = 0                          # zmiana przyciągania z każdą rundą trwania
    przyciaganie_min: float = Field(ge=0)
    przyciaganie_max: float = Field(ge=0, lt=2)
    koszt_startu: float = Field(ge=0)            # netto
    teksty: list[str] = Field(min_length=1)

    @field_validator("dni")
    @classmethod
    def _dni(cls, v):
        if v is not None and (not v or any(not 0 <= d <= 6 for d in v) or len(set(v)) != len(v)):
            raise ValueError("dni: różne liczby 0–6 (0 = poniedziałek)")
        return v

    @model_validator(mode="after")
    def _przedzial(self):
        if not self.przyciaganie_min <= self.przyciaganie <= self.przyciaganie_max:
            raise ValueError("przyciaganie poza przyciaganie_min–przyciaganie_max")
        return self


class PamiecPromocjiDane(Schemat):
    """Trwały skutek promocji – udzial 0 wyłącza."""
    udzial: float = Field(ge=0, le=1)            # część przyciągania z ostatniego tygodnia promocji
    zanik: float = Field(ge=0, le=1)             # o tyle mniej co tydzień
    maks: float = Field(ge=0, lt=2)              # suma pamięci firmy najwyżej tyle
    prog: float = Field(gt=0)                    # poniżej – pamięć znika
    pewnosc: Literal["potwierdzone", "skalibrowane", "zalozenie"]
    zrodlo: str = Zrodlo


class PlikPromocji(Plik):
    od_rundy: int = Field(ge=1)
    limit_aktywnych: int = Field(ge=1)
    nazwa_max: int = Field(ge=1)
    typy: dict[str, TypPromocji] = Field(min_length=1)
    pamiec: PamiecPromocjiDane | None = None     # brak – promocja bez trwałego skutku


class GrupaKlientow(Schemat):
    nazwa: str
    opis: str
    podpisy: list[str] = Field(min_length=1)
    cena: float = Field(gt=0)            # mnożnik wrażliwości cenowej strefy (w strefie uśredniany do 1)
    czekanie: float = Field(ge=0)        # waga kolejki w ocenie lokalu
    jakosc: float = Field(ge=0)          # waga jakości w ocenie lokalu
    wegetarianie: float = Field(ge=0, lt=1)
    koszyk: dict[str, float] = Field(min_length=1)


class Zastepstwo(Schemat):
    udzial: float = Field(ge=0, le=1)
    grupy_dan: list[list[str]] = Field(default_factory=list)


class UstawieniaOpinii(Schemat):
    start: float = Field(ge=1)
    jakosc: float = Field(ge=0)
    cena: float = Field(ge=0)
    cena_limit: float = Field(ge=0)
    kolejka: float = Field(ge=0)
    brak: float = Field(ge=0)
    pomylki: float = Field(ge=0)
    wyposazenie: float = Field(ge=0)
    udzial_opinii: float = Field(gt=0, le=1)
    rozrzut: float = Field(ge=0)
    zanik: float = Field(ge=0, lt=1)
    n0: float = Field(gt=0)
    odniesienie: float = Field(ge=1)
    wykladnik: float = Field(ge=0)
    komentarze: int = Field(ge=0)
    prog_komentarza: float = Field(ge=0)
    ocena_dobra: float = Field(ge=1)
    skala: float = Field(gt=1)

    @model_validator(mode="after")
    def _w_skali(self):
        for pole in ("start", "odniesienie", "ocena_dobra"):
            if getattr(self, pole) > self.skala:
                raise ValueError(f"opinie.{pole} ponad skalę ocen ({self.skala})")
        return self


class PlikKlientow(Plik):
    """dane/mapa/klienci.yaml: grupy klientów z koszykiem i opinie o lokalach."""
    mieso: list[str]
    wege: list[str]
    zastepstwo: Zastepstwo
    wydarzenia: str
    grupy: dict[str, GrupaKlientow] = Field(min_length=1)
    strefy: dict[str, dict[str, float]] = Field(min_length=1)
    opinie: UstawieniaOpinii
    komentarze: dict[str, list[str]]

    @model_validator(mode="after")
    def _spojnosc(self):
        if self.wydarzenia not in self.grupy:
            raise ValueError(f"wydarzenia: nieznana grupa {self.wydarzenia}")
        for z, udzialy in self.strefy.items():
            if set(udzialy) - set(self.grupy):
                raise ValueError(f"strefy.{z}: nieznane grupy {sorted(set(udzialy) - set(self.grupy))}")
            if abs(sum(udzialy.values()) - 1) > 1e-6:
                raise ValueError(f"strefy.{z}: udziały grup sumują się do {sum(udzialy.values()):.3f}, a nie do 1")
        return self


class ParametrDekoru(Schemat):
    wartosc: float = Field(ge=0)
    pewnosc: Literal["potwierdzone", "skalibrowane", "zalozenie"]
    zrodlo: str = Zrodlo


class GrupaDekoru(Schemat):
    nazwa: str
    cena: ParametrDekoru
    opis: str


class StylDekoru(Schemat):
    nazwa: str
    opis: str
    klienci: list[str]   # id grup klientów z mapa/klienci.yaml, do których trafia styl


class EfektyDekoru(Schemat):
    popyt: ParametrDekoru
    ocena: ParametrDekoru


class PlikDekoru(Plik):
    """dane/mapa/dekor.yaml: dekor lokalu kupowany w sklepie meblowym (silnik/rynek/dekor.py)."""
    wlaczony: bool
    prog: float = Field(gt=0, le=1)
    prog_czesciowy: float = Field(ge=0, le=1)
    czesc_efektu: float = Field(ge=0, le=1)
    efekty: EfektyDekoru
    domyslny_styl: str
    grupy: dict[str, GrupaDekoru] = Field(min_length=1)
    style: dict[str, StylDekoru] = Field(min_length=1)

    @model_validator(mode="after")
    def _spojnosc(self):
        if self.prog_czesciowy > self.prog:
            raise ValueError("prog_czesciowy nie może być wyższy niż prog")
        if self.domyslny_styl not in self.style or self.style[self.domyslny_styl].klienci:
            raise ValueError("domyslny_styl: styl bez klientów (bez efektu) z listy style")
        return self


SCHEMATY_MAPY: dict[str, type[BaseModel]] = {
    "strefy.yaml": PlikStref,
    "lokale.yaml": PlikLokali,
    "budynki.yaml": PlikBudynkow,
    "popyt.yaml": PlikPopytu,
    "menu.yaml": PlikMenu,
    "banki.yaml": PlikBankow,
    "harpagon.yaml": PlikHarpagona,
    "biura.yaml": PlikBiur,
    "reklama.yaml": PlikReklamy,
    "promocje.yaml": PlikPromocji,
    "klienci.yaml": PlikKlientow,   # opcjonalny w danych gry (bez niego: bez grup i opinii)
    "dekor.yaml": PlikDekoru,       # dekor lokalu – opcjonalny (bez niego: mechanika nie istnieje)
}

# --- podatki_2026.yaml (gra z lokalami) ---

Stawka = Field(ge=0, lt=1)


class Zdrowotna(Schemat):
    stawka: float = Stawka
    minimalna_miesieczna: float = Field(ge=0)
    limit_odliczenia_roczny: float = Field(ge=0)


class ZusWlasciciela(Schemat):
    ulga_na_start_rund: int = Field(ge=0)
    spoleczne_miesieczne: float = Field(ge=0)


class VatSprzedazy(Schemat):
    domyslna: float = Stawka
    uslugi: dict[str, float] = {}


class VatZasobow(Schemat):
    domyslna: float = Stawka
    zasoby: dict[str, float] = {}


class RegulaVat(Schemat):
    zawiera: str = Field(min_length=3)
    stawka: float = Stawka


class Vat(Schemat):
    sprzedaz: VatSprzedazy
    zasoby: VatZasobow
    koszty: list[RegulaVat]
    srodki_trwale: float = Stawka


class PlikPodatkow(Plik):
    pit_liniowy: float = Stawka
    zdrowotna: Zdrowotna
    zus_wlasciciela: ZusWlasciciela
    vat: Vat
    zus_pracodawcy: float = Stawka
    zus_pracodawcy_zlecenie: float = Field(0.0, ge=0, le=1)   # składki przy umowie zlecenie


# --- zdarzenia/*.yaml (eventy w parkach; katalog opcjonalny – bez niego gra bez eventów) ---


class KosztOpcji(Schemat):
    czas: float = Field(default=0, ge=0)       # godziny właściciela
    gotowka: float = Field(default=0, ge=0)    # zł
    porcje: int = Field(default=0, ge=0)       # porcje jedzenia (zasady.koszt_porcji zł)


SKUTKI_POLA = {"kwota": ("gotowka", "szkoda"), "mnoznik": ("popyt",), "godziny": ("czas",), "kandydat": ("kandydat",),
               "szansa": ("kontrola",)}


class Skutek(Schemat):
    # oddaj_zapas – tylko bank żywności; szkoda – tylko wypadki w lokalu (losowe.yaml, silnik/swiat/awarie.py);
    # kontrola – skarga do sanepidu: większa szansa kontroli (silnik/ksiegowosc/urzad.py)
    typ: Literal["gotowka", "popyt", "czas", "kandydat", "oddaj_zapas", "szkoda", "kontrola"]
    opis: str = Field(min_length=3)
    kwota: float | None = None                          # gotowka: + przychód, − koszt; szkoda: koszt (> 0)
    polisa: str | None = None                           # szkoda: rodzaj polisy, która ją pokrywa (None – żadna)
    mnoznik: float | None = Field(default=None, gt=0)    # popyt: mnożnik atrakcyjności lokali
    godziny: float | None = Field(default=None, gt=0)    # czas: o tyle mniej godzin właściciela
    szansa: float | None = Field(default=None, gt=0, le=1)   # kontrola: dodatek do szansy kontroli sanepidu
    rund: int = Field(default=1, ge=1)
    kandydat: ZnanyKandydat | None = None               # kandydat: osoba tylko dla tej drużyny

    @model_validator(mode="after")
    def _pola(self):
        for pole, typy in SKUTKI_POLA.items():
            if (getattr(self, pole) is not None) != (self.typ in typy):
                raise ValueError(f"skutek typu {self.typ}: pole {pole} " + ("wymagane" if self.typ in typy else "zbędne"))
        if self.typ == "szkoda" and self.kwota <= 0:
            raise ValueError("szkoda: kwota musi być dodatnia")
        if self.polisa is not None and self.typ != "szkoda":
            raise ValueError(f"skutek typu {self.typ}: pole polisa zbędne")
        return self


class Nastepna(Schemat):
    scena: str
    za_ile_rund: int = Field(default=1, ge=1)
    szansa: float = Field(default=1, gt=0, le=1)


def _szanse(nastepne: list[Nastepna]):
    if sum(n.szansa for n in nastepne) > 1 + 1e-9:
        raise ValueError("szanse kolejnych scen sumują się do więcej niż 1")


class Opcja(Schemat):
    id: str = Field(pattern=r"^[a-z0-9_]+$")
    tekst: str = Field(min_length=3)
    koszt: KosztOpcji = Field(default_factory=KosztOpcji)
    wynik: str = Field(min_length=3)
    skutki: list[Skutek] = []
    nastepna: list[Nastepna] = []

    @model_validator(mode="after")
    def _sprawdz(self):
        _szanse(self.nastepna)
        return self


class Scena(Schemat):
    """Scena z opcjami (skutki i ciąg dalszy przy opcjach) albo scena końcowa / przejściowa bez wyboru."""
    tekst: str = Field(min_length=3)
    opcje: list[Opcja] = []
    domyslna: str | None = None
    skutki: list[Skutek] = []
    nastepna: list[Nastepna] = []

    @model_validator(mode="after")
    def _sprawdz(self):
        _szanse(self.nastepna)
        if not self.opcje:
            if self.domyslna is not None:
                raise ValueError("scena bez opcji nie ma opcji domyślnej")
            return self
        ids = [o.id for o in self.opcje]
        if len(ids) != len(set(ids)):
            raise ValueError("id opcji muszą być unikalne")
        if self.skutki or self.nastepna:
            raise ValueError("w scenie z opcjami skutki i ciąg dalszy są przy opcjach")
        dom = next((o for o in self.opcje if o.id == self.domyslna), None)
        if dom is None:
            raise ValueError(f"opcja domyślna {self.domyslna!r} nie jest jedną z opcji")
        if dom.koszt.czas:
            raise ValueError("opcja domyślna nie może wymagać czasu właściciela")
        return self


class Historia(Schemat):
    id: str = Field(pattern=r"^[a-z0-9_]+$")
    park: str | None = None  # id budynku z mapa/budynki.yaml (park albo woda); w parkach wymagany
    tytul: str = Field(min_length=3)
    powazna: bool = False    # ok. 80% historii ma być komicznych (notatka „Zdarzenia i historie”)
    start: str
    sceny: dict[str, Scena]

    @model_validator(mode="after")
    def _graf(self):
        def dalej(s: Scena) -> list[str]:
            return [n.scena for n in [*s.nastepna, *(x for o in s.opcje for x in o.nastepna)]]

        for nazwa, s in self.sceny.items():
            for n in dalej(s):
                if n not in self.sceny:
                    raise ValueError(f"scena {nazwa}: nie ma sceny {n!r}")
        if self.start not in self.sceny:
            raise ValueError(f"nie ma sceny startowej {self.start!r}")
        stan: dict[str, int] = {}   # 1 – w trakcie, 2 – sprawdzona

        def odwiedz(n: str):
            if stan.get(n) == 1:
                raise ValueError(f"historia zapętla się na scenie {n!r} – każda ścieżka musi się kończyć")
            if stan.get(n) == 2:
                return
            stan[n] = 1
            for m in dalej(self.sceny[n]):
                odwiedz(m)
            stan[n] = 2

        odwiedz(self.start)
        if nieosiagalne := sorted(set(self.sceny) - set(stan)):
            raise ValueError(f"sceny nieosiągalne ze startu: {', '.join(nieosiagalne)}")
        return self


class ZasadyZdarzen(Schemat):
    od_rundy: int = Field(ge=1)
    koszt_porcji: float = Field(gt=0)
    eventow_na_runde: tuple[int, int] = (1, 1)   # [min, max] – ile historii zaczyna się w parkach w jednej rundzie

    @model_validator(mode="after")
    def _zakres(self):
        if not 1 <= self.eventow_na_runde[0] <= self.eventow_na_runde[1]:
            raise ValueError("eventow_na_runde: [min, max], 1 <= min <= max")
        return self


def skutki_historii(h: Historia) -> list[Skutek]:
    return [sk for s in h.sceny.values() for sk in [*s.skutki, *(x for o in s.opcje for x in o.skutki)]]


def _bez_skutku(historie: list[Historia], typ: str, gdzie: str):
    if inne := sorted({h.id for h in historie for sk in skutki_historii(h) if sk.typ == typ}):
        raise ValueError(f"skutek {typ} jest tylko w {gdzie}: {', '.join(inne)}")


def _unikalne_id(historie: list[Historia]):
    ids = [h.id for h in historie]
    if len(ids) != len(set(ids)):
        raise ValueError("id historii muszą być unikalne")


class PlikParkow(Plik):
    zasady: ZasadyZdarzen
    historie: list[Historia] = Field(min_length=1)

    @model_validator(mode="after")
    def _unikalne(self):
        _unikalne_id(self.historie)
        if bez := [h.id for h in self.historie if not h.park]:
            raise ValueError(f"historie w parkach muszą mieć park: {', '.join(bez)}")
        _bez_skutku(self.historie, "oddaj_zapas", "historii banku żywności")
        _bez_skutku(self.historie, "szkoda", "wypadkach w lokalu (losowe.yaml)")
        return self


class ZasadyWypadkow(Schemat):
    od_rundy: int = Field(ge=1)
    szansa: float = Field(gt=0, le=1)      # na rundę i drużynę z działającym lokalem
    max_strata: float = Field(gt=0)        # zł – górna granica jednej szkody
    przyrost: float = Field(default=0, ge=0)     # + za każdą rundę bez wypadku (reset po wypadku)
    szansa_max: float = Field(default=1, gt=0, le=1)


class Polisa(Schemat):
    nazwa: str
    opis: str
    stala: float = Field(ge=0)             # zł miesięcznie
    za_lokal: float = Field(ge=0)          # zł miesięcznie za każdy lokal
    od_majatku: float = Field(ge=0, lt=1)  # miesięcznie, ułamek majątku (ceny zakupu inwestycji)
    pokrycie: float = Field(gt=0, le=1)    # część szkody ponad franszyzę, którą zwraca ubezpieczyciel
    franszyza: float = Field(ge=0)         # zł – tę część szkody firma zawsze pokrywa sama


class Ubezpieczyciel(Schemat):
    nazwa: str
    budynek: str | None                    # id z mapa/budynki.yaml
    karencja_rund: int = Field(ge=0)
    od_rundy: int | None = Field(default=None, ge=1)   # od której rundy można kupić polisę (None – od 1)
    polisy: dict[str, Polisa] = Field(min_length=1)

    @model_validator(mode="after")
    def _skladki(self):
        if bez := [k for k, p in self.polisy.items() if not (p.stala or p.za_lokal or p.od_majatku)]:
            raise ValueError(f"polisy bez składki: {', '.join(bez)}")
        return self


class PlikWypadkow(Plik):
    """dane/zdarzenia/losowe.yaml: wypadki w lokalu jednej drużyny i polisy ubezpieczyciela (silnik/swiat/awarie.py)."""
    zasady: ZasadyWypadkow
    ubezpieczyciel: Ubezpieczyciel
    historie: list[Historia] = Field(min_length=1)

    @model_validator(mode="after")
    def _sprawdz(self):
        _unikalne_id(self.historie)
        if w_parku := [h.id for h in self.historie if h.park]:
            raise ValueError(f"wypadki dzieją się w lokalu (bez pola park): {', '.join(w_parku)}")
        _bez_skutku(self.historie, "oddaj_zapas", "historii banku żywności")
        for h in self.historie:
            for sk in skutki_historii(h):
                if sk.polisa is not None and sk.polisa not in self.ubezpieczyciel.polisy:
                    raise ValueError(f"{h.id}: nieznana polisa {sk.polisa!r} (ubezpieczyciel.polisy)")
        return self


class TekstySanepidu(Schemat):
    kontrole_ok: list[str] = Field(min_length=1)
    kontrole_mandat: list[str] = Field(min_length=1)


class ZasadyBanku(Schemat):
    prog_zl: float = Field(gt=0)
    dni_do_terminu: int = Field(ge=0)
    szansa: float = Field(gt=0, le=1)


class BankZywnosci(Schemat):
    zasady: ZasadyBanku
    historia: Historia

    @model_validator(mode="after")
    def _bez_parku(self):
        if self.historia.park:
            raise ValueError("historia banku żywności nie dzieje się w parku (bez pola park)")
        _bez_skutku([self.historia], "szkoda", "wypadkach w lokalu (losowe.yaml)")
        return self


class ZasadyFalafela(Schemat):
    usluga: str                         # id dania z uslugi.yaml
    od_rundy: int = Field(ge=2)          # „następnego dnia” – po tygodniu z falafelem w ofercie
    szansa: float = Field(gt=0, le=1)


class PlikFalafela(Plik):
    """dane/zdarzenia/falafel.yaml (plik opcjonalny): bójka o falafel w tygodniu po falafelu w ofercie
    (silnik/swiat/falafel.py) – najwyżej raz na grę, w lokalu jednej drużyny."""
    zasady: ZasadyFalafela
    historia: Historia

    @model_validator(mode="after")
    def _bez_parku(self):
        if self.historia.park:
            raise ValueError("bójka o falafel dzieje się w lokalu (bez pola park)")
        _bez_skutku([self.historia], "szkoda", "wypadkach w lokalu (losowe.yaml)")
        _bez_skutku([self.historia], "oddaj_zapas", "historii banku żywności")
        return self


class PlikMagazynu(Plik):
    """dane/zdarzenia/magazyn.yaml: teksty kontroli sanepidu i historia „bank żywności” (silnik/kuchnia/magazyn.py)."""
    sanepid: TekstySanepidu
    bank_zywnosci: BankZywnosci


class Rejestracja(Schemat):
    pkd: str
    opis_pkd: str
    tekst: str = Field(min_length=3)


class Urzad(Schemat):
    nazwa: str
    budynek: str | None                    # id z mapa/budynki.yaml
    rejestracja: Rejestracja


class Odbior(Schemat):
    odroczenie_rund: int = Field(ge=1)
    teksty_ok: list[str] = Field(min_length=1)
    teksty_odmowa: list[str] = Field(min_length=1)


class PoziomHigieny(Schemat):
    nazwa: str
    opis: str
    koszt: float = Field(ge=0)             # zł miesięcznie (brutto) za działający lokal
    dodatek: float = Field(ge=0, le=1)     # do części szansy kontroli z problemów
    mnoznik: float = Field(gt=0)           # mnoży część szansy z problemów (z dodatkami)
    mandat: float = Field(ge=0)            # zł – doliczane do mandatu
    odbior: bool                           # czy sanepid odbierze lokal przy tym poziomie


class Higiena(Schemat):
    domyslna: str
    poziomy: dict[str, PoziomHigieny] = Field(min_length=1)

    @model_validator(mode="after")
    def _domyslna(self):
        if self.domyslna not in self.poziomy:
            raise ValueError(f"higiena.domyslna {self.domyslna!r} nie jest poziomem")
        if not self.poziomy[self.domyslna].odbior:
            raise ValueError("higiena.domyslna musi pozwalać na odbiór lokalu")
        return self


class PlikUrzedu(Plik):
    """dane/zdarzenia/urzad.yaml: rejestracja firmy, odbiór lokalu i higiena (silnik/ksiegowosc/urzad.py)."""
    urzad: Urzad
    odbior: Odbior
    higiena: Higiena


class Portfel(Schemat):
    oszczednosci: float = Field(ge=0)      # zł prywatnych oszczędności właściciela na start


class PlikWlasciciela(Plik):
    """dane/zdarzenia/wlasciciel.yaml: prywatny portfel właściciela – wpłaty i wypłaty własne (silnik/pieniadze/wlasciciel.py)."""
    portfel: Portfel


class Klub(Schemat):
    nazwa: str
    adres: str
    tekst: str = Field(min_length=3)
    kod_od_rundy: int | None = Field(default=None, ge=1)   # wejście z hasłem
    rekopis_znaleziony_w_jsonie: str | None = None   # wskazówka dla tego, kto zajrzy w surowe dane (hasło „saragossa”)



class Zaproszenie(Schemat):
    od_rundy: int = Field(ge=1)
    szansa: float = Field(ge=0, le=1)
    maks: int = Field(ge=0)
    teksty: list[str] = Field(min_length=1)


class LimitZakladow(Schemat):
    maks: int = Field(ge=1)
    min_stawka: float = Field(gt=0)
    maks_stawka: float = Field(gt=0)

    @model_validator(mode="after")
    def _zakres(self):
        if self.min_stawka > self.maks_stawka:
            raise ValueError("zaklady.min_stawka większa niż maks_stawka")
        return self


class ZakladRuletki(Schemat):
    nazwa: str
    mnoznik: float = Field(gt=0)           # wypłata = stawka × mnożnik (razem ze stawką)
    wygrywa: list[int] = Field(min_length=1)


class WynikAutomatu(Schemat):
    szansa: float = Field(gt=0, le=1)
    mnoznik: float = Field(ge=0)
    tekst: str = Field(min_length=3)


class GraKasyna(Schemat):
    typ: Literal["ruletka", "automat"]
    nazwa: str
    opis: str
    pola: int | None = None                # ruletka: liczba pól koła (0 … pola−1)
    zaklady: dict[str, ZakladRuletki] | None = None
    teksty_wygrana: list[str] | None = None
    teksty_przegrana: list[str] | None = None
    wyniki: list[WynikAutomatu] | None = None

    @model_validator(mode="after")
    def _typ(self):
        if self.typ == "ruletka":
            if not (self.pola and self.zaklady and self.teksty_wygrana and self.teksty_przegrana) or self.wyniki:
                raise ValueError(f"ruletka {self.nazwa!r}: potrzebne pola, zaklady i teksty (bez wyniki)")
            for k, z in self.zaklady.items():
                if any(not 0 <= n < self.pola for n in z.wygrywa) or len(set(z.wygrywa)) != len(z.wygrywa):
                    raise ValueError(f"ruletka {self.nazwa!r}, zakład {k!r}: liczby spoza koła albo powtórzone")
        else:
            if not self.wyniki or self.zaklady or self.pola:
                raise ValueError(f"automat {self.nazwa!r}: potrzebne wyniki (bez pola i zaklady)")
            if abs(sum(w.szansa for w in self.wyniki) - 1) > 1e-6:
                raise ValueError(f"automat {self.nazwa!r}: szanse wyników nie sumują się do 1")
        return self


class PlikKasyna(Plik):
    """dane/zdarzenia/kasyno.yaml: tajny klub, zaproszenia i gry (silnik/pieniadze/kasyno.py)."""
    kasyno: Klub
    zaproszenie: Zaproszenie
    zaklady: LimitZakladow
    gry: dict[str, GraKasyna] = Field(min_length=1)


class ZasadyHandlu(Schemat):
    od_rundy: int = Field(ge=1)
    maks_ogloszen: int = Field(ge=1)       # ogłoszeń wystawionych przez drużynę w jednej rundzie
    cena_min: float = Field(gt=0)          # widełki ceny wywoławczej jako część wartości (towar – koszt zakupu,
    cena_maks: float = Field(gt=0)         # sprzęt – cena katalogowa nowego)
    krok_przebicia: float = Field(gt=0, lt=1)   # kolejna oferta – co najmniej o tyle ponad prowadzącą


class HandelBotow(Schemat):
    """Boty na giełdzie handlu – opis pól w dane/zdarzenia/handel.yaml."""
    zapas_tygodni: float = Field(gt=0)
    min_wartosc: float = Field(ge=0)
    cena_min: float = Field(gt=0)
    maks_ogloszen: int = Field(ge=0)
    min_dni_terminu: int = Field(ge=0)
    rezerwa_gotowki: float = Field(ge=0)
    limit_handlu: float = Field(gt=0, le=1)


class PlikHandlu(Plik):
    """dane/zdarzenia/handel.yaml: giełda handlu – ogłoszenia, licytacja, faktury (silnik/rynek/handel.py)."""
    handel: ZasadyHandlu
    boty: HandelBotow
    teksty: list[str] = Field(min_length=1)   # przekazanie: {sprzedawca}, {kupujacy}, {co}

    @model_validator(mode="after")
    def _widelki(self):
        if self.handel.cena_min > self.handel.cena_maks:
            raise ValueError("handel: cena_min większa niż cena_maks")
        if not self.handel.cena_min <= self.boty.cena_min <= self.handel.cena_maks:
            raise ValueError("handel: boty.cena_min poza widełkami cena_min–cena_maks")
        return self


class ZasadyDetektywa(Schemat):
    nazwa: str
    budynek: str | None = None              # budynek na mapie (mapa/budynki.yaml)
    od_rundy: int = Field(ge=2)             # tydzień 1 jest przygotowawczy
    koszt_min: float = Field(gt=0)          # zł brutto za zlecenie, losowane co rundę
    koszt_maks: float = Field(gt=0)
    krok: float = Field(gt=0)
    godziny: float = Field(ge=0)            # godziny właściciela
    szansa_wpadki: float = Field(ge=0, le=1)


class PlikDetektywa(Plik):
    """dane/zdarzenia/detektyw.yaml: przegląd konkurencji i detektyw (silnik/rynek/konkurencja.py)."""
    detektyw: ZasadyDetektywa
    powitania: list[str] = Field(min_length=1)
    raporty: list[str] = Field(min_length=1)    # {rywal}
    wpadki: list[str] = Field(min_length=1)     # zleceniodawca: {rywal}
    ofiary: list[str] = Field(min_length=1)     # śledzony: {kto}

    @model_validator(mode="after")
    def _widelki(self):
        if self.detektyw.koszt_min > self.detektyw.koszt_maks:
            raise ValueError("detektyw: koszt_min większy niż koszt_maks")
        return self


SCHEMATY_ZDARZEN: dict[str, type[BaseModel]] = {
    "parki.yaml": PlikParkow,
    "magazyn.yaml": PlikMagazynu,
    "losowe.yaml": PlikWypadkow,
    "urzad.yaml": PlikUrzedu,
    "wlasciciel.yaml": PlikWlasciciela,
    "kasyno.yaml": PlikKasyna,
    "handel.yaml": PlikHandlu,
    "detektyw.yaml": PlikDetektywa,
    "falafel.yaml": PlikFalafela,
}
ZDARZENIA_OPCJONALNE = {"falafel.yaml"}   # bez pliku – bez tej historii (np. zamrożona kopia danych testów)


# --- kalendarz/kalendarz.yaml ---

DATA_MD = r"^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$"   # 'MM-DD'


class WydarzenieKalendarza(Schemat):
    nazwa: str
    rodzaj: str
    opis: str = Field(min_length=3)
    od: str | int                 # 'MM-DD' albo – z `wzgledem` – dni od daty ruchomej
    do: str | int
    wzgledem: str | None = None   # klucz z `ruchome` (np. wielkanoc)
    strefy: dict[str, float] = Field(min_length=1)
    dania: dict[str, float] = Field(default_factory=dict)   # mnożnik popytu na danie w strefach wydarzenia
    rok: int | None = None        # wydarzenie jednego roku (np. mecz z terminarza); None – co roku

    @model_validator(mode="after")
    def _daty(self):
        if self.wzgledem is None:
            if not all(isinstance(x, str) and re.match(DATA_MD, x) for x in (self.od, self.do)):
                raise ValueError("od i do: data 'MM-DD' (albo `wzgledem` i przesunięcie w dniach)")
        elif not (isinstance(self.od, int) and isinstance(self.do, int) and self.od <= self.do):
            raise ValueError("z `wzgledem` od i do to liczby dni, od ≤ do")
        if any(m < 0 for m in self.strefy.values()):
            raise ValueError("mnożniki stref nie mogą być ujemne")
        if any(m < 0 for m in self.dania.values()):
            raise ValueError("mnożniki dań nie mogą być ujemne")
        return self


class PlikKalendarza(Plik):
    rodzaje: dict[str, str] = Field(min_length=1)
    ruchome: dict[str, dict[int, str]]
    wydarzenia: list[WydarzenieKalendarza]

    @model_validator(mode="after")
    def _odwolania(self):
        for n, lata in self.ruchome.items():
            if any(not re.match(DATA_MD, d) for d in lata.values()):
                raise ValueError(f"ruchome.{n}: daty 'MM-DD'")
        for w in self.wydarzenia:
            if w.rodzaj not in self.rodzaje:
                raise ValueError(f"{w.nazwa}: rodzaj {w.rodzaj!r} – nie ma w `rodzaje`")
            if w.wzgledem is not None and w.wzgledem not in self.ruchome:
                raise ValueError(f"{w.nazwa}: wzgledem {w.wzgledem!r} – nie ma w `ruchome`")
        return self


SCHEMATY_KALENDARZA: dict[str, type[BaseModel]] = {"kalendarz.yaml": PlikKalendarza}


# --- funkcje.yaml (seria „funkcje”, 10.11.2026) ---

StanFunkcji = Literal["odkryta", "zakryta", "wylaczona"]


class FunkcjaGry(Schemat):
    nazwa: str = Field(min_length=3)
    krotko: str = Field(min_length=3)        # podpis w kreatorze i oknie „Odsłoń”
    ikona: str = Field(min_length=2)         # panel_gracza/static/zakladki/ikony.js
    opis: str = Field(min_length=10)         # dla drużyny: co to i po co
    zakryta: str = Field(min_length=10)      # co gra robi za drużynę, gdy funkcja jest zakryta
    zakladki: list[str] = Field(min_length=1)
    elementy: list[str] = []                 # elementy harmonogramu (wzorce `*`), które wyłączona funkcja wyłącza
    zakrycie: str = ""                       # co przepada przy ponownym zakryciu (puste – nic)


class ZestawFunkcji(Schemat):
    nazwa: str = Field(min_length=3)
    opis: str = Field(min_length=3)
    reszta: StanFunkcji
    stany: dict[str, StanFunkcji] = {}


class AutopilotFunkcji(Schemat):
    jakosc_zasobow: int = Field(ge=1, le=3)
    zapas_zasobow: float = Field(ge=1.0, le=2.0)
    zrodlo: str = Zrodlo


class PlikFunkcji(Plik):
    domyslny_zestaw: str
    autopilot: AutopilotFunkcji
    funkcje: dict[str, FunkcjaGry]
    zestawy: dict[str, ZestawFunkcji]

    @model_validator(mode="after")
    def _odwolania(self) -> PlikFunkcji:
        if self.domyslny_zestaw not in self.zestawy:
            raise ValueError(f"domyslny_zestaw {self.domyslny_zestaw!r} – nie ma w `zestawy`")
        for z, zs in self.zestawy.items():
            if obce := set(zs.stany) - set(self.funkcje):
                raise ValueError(f"zestaw {z}: nie ma takich funkcji: {', '.join(sorted(obce))}")
        widziane: dict[str, str] = {}
        for k, f in self.funkcje.items():
            for z in f.zakladki:
                if z in widziane:
                    raise ValueError(f"zakładka {z} jest w dwóch funkcjach: {widziane[z]} i {k}")
                widziane[z] = k
        return self


SCHEMATY: dict[str, type[BaseModel]] = {
    "uslugi.yaml": PlikUslug,
    "sprzet.yaml": PlikSprzetu,
    "zasoby.yaml": PlikZasobow,
    "dostawcy.yaml": PlikDostawcow,
    "kandydaci.yaml": PlikKandydatow,
    "katalog.yaml": PlikKatalogu,
    "boty.yaml": PlikBotow,
    "podatki_2026.yaml": PlikPodatkow,
    "funkcje.yaml": PlikFunkcji,
}
# dane bez lokali nie mają podatków JDG; bez funkcje.yaml – gra bez funkcji (wszystko odkryte)
OPCJONALNE = {"podatki_2026.yaml", "funkcje.yaml"}
