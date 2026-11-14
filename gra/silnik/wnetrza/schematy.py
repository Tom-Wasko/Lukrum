"""Schematy plików `dane/wnetrza/` (pydantic, `extra="forbid"`): bywalcy.yaml, dymki.yaml, silnik.yaml.

Kontrole między plikami (kto mówi, wskaźniki w `dba_o`) robi `sprawdz`; sprawdza je też `python -m silnik.dane sprawdz`.
"""
from __future__ import annotations

import re
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator, model_validator

ZRODLA_PLOTEK = ("park", "kalendarz", "konkurencja")
OKAZJE = ("start", "pierwsza_strata", "rekord", "ostatnia_runda")
KTO_OGOLNIE = ("gosc", "kazdy")
WUJEK = "wujek"
# pola wstawiane do tekstu dymka: wskaźniki liczone z wyników (stan.py) i dane plotek (kontekst)
POLA_TEKSTU = {"cena", "cena_strefy", "ocena", "zmiana_ceny"}
POLA_PLOTEK = {"park": {"park", "tytul"}, "kalendarz": {"wydarzenie"}, "konkurencja": {"konkurent", "dzielnica"}}
# klucze `skutki` propozycji (opis w dymki.yaml nad `propozycje_zasady`)
KLUCZE_SKUTKOW = ("porcje", "rabat", "darmowe_porcje", "koszt", "opinia", "ryzyko_kontroli", "kandydat")


class Schemat(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Bywalec(Schemat):
    id: str = Field(pattern=r"^[a-z_]+$")
    imie: str = Field(min_length=1)
    lektura: str
    autor: str
    wyglad: str = Field(min_length=3)
    rys: str = Field(min_length=3)
    dba_o: list[str]
    od_rundy: int = Field(ge=1)
    specjalny: bool = False


class PlikBywalcow(Schemat):
    opis: str = Field(min_length=3)
    bywalcy: list[Bywalec] = Field(min_length=1)

    @model_validator(mode="after")
    def _unikalne(self):
        ids = [b.id for b in self.bywalcy]
        for i in sorted({x for x in ids if ids.count(x) > 1}):
            raise ValueError(f"bywalcy: powtórzone id {i}")
        if any(i in KTO_OGOLNIE for i in ids):
            raise ValueError("bywalcy: id „gosc” i „kazdy” są zarezerwowane")
        return self


class Zakres(Schemat):
    od: float | None = None   # włącznie
    do: float | None = None   # wyłącznie

    @model_validator(mode="after")
    def _niepusty(self):
        if self.od is None and self.do is None:
            raise ValueError("zakres bez `od` i `do`")
        if self.od is not None and self.do is not None and self.od >= self.do:
            raise ValueError("zakres: `od` musi być mniejsze niż `do`")
        return self


class Rodzaj(Schemat):
    nazwa: str = Field(min_length=1)


class Zasady(Schemat):
    dymkow_na_runde: tuple[int, int]
    udzial_bywalcow: float = Field(ge=0, le=1)
    bywalec_co_rund: int = Field(ge=1)
    wos_na_runde: int = Field(ge=0)

    @field_validator("dymkow_na_runde")
    @classmethod
    def _przedzial(cls, v):
        if not 0 <= v[0] <= v[1]:
            raise ValueError("dymkow_na_runde: [najmniej, najwięcej], najmniej ≤ najwięcej")
        return v


class Dymek(Schemat):
    rodzaj: str
    kto: str
    gdy: dict[str, Zakres] = Field(default_factory=dict)
    zrodlo: Literal["park", "kalendarz", "konkurencja"] | None = None
    okazja: Literal["start", "pierwsza_strata", "rekord", "ostatnia_runda"] | None = None
    tekst: str = Field(min_length=3)
    wyjasnienie: str | None = None
    zrodlo_prawne: str | None = None
    sprawdzone: bool | None = None
    sprawdzil: str | None = None
    cytat: bool | None = None
    cytat_zrodlo: str | None = None

    @model_validator(mode="after")
    def _spojny(self):
        if self.rodzaj == "plotki" and self.zrodlo is None and any(
                p in self.pola for p in set().union(*POLA_PLOTEK.values())):
            raise ValueError(f"plotka z polami z miasta bez `zrodlo`: {self.tekst!r}")
        if self.zrodlo and self.rodzaj != "plotki":
            raise ValueError("`zrodlo` mają tylko plotki")
        if self.okazja and self.kto != WUJEK:
            raise ValueError("`okazja` ma tylko wujek")
        if self.kto == WUJEK and not self.okazja:
            raise ValueError("wujek mówi tylko przy swojej `okazji`")
        if self.rodzaj == "wos":
            if not (self.wyjasnienie and self.zrodlo_prawne) or self.sprawdzone is None:
                raise ValueError(f"zaczepka WOS wymaga `wyjasnienie`, `zrodlo_prawne` i `sprawdzone`: {self.tekst!r}")
        elif self.sprawdzone is not None or self.wyjasnienie or self.zrodlo_prawne:
            raise ValueError("`wyjasnienie`, `zrodlo_prawne` i `sprawdzone` mają tylko zaczepki WOS")
        dozwolone = POLA_TEKSTU | (POLA_PLOTEK[self.zrodlo] if self.zrodlo else set())
        obce = self.pola - dozwolone
        if obce:
            raise ValueError(f"nieznane pola w tekście: {', '.join(sorted(obce))}")
        return self

    @property
    def pola(self) -> set[str]:
        return set(re.findall(r"\{(\w+)\}", self.tekst))


class Skutki(Schemat):
    porcje: int | None = Field(default=None, ge=0)
    rabat: float | None = Field(default=None, ge=0, le=1)
    darmowe_porcje: int | None = Field(default=None, ge=0)
    koszt: float | None = Field(default=None, ge=0)
    opinia: float | None = None
    ryzyko_kontroli: float | None = None
    kandydat: bool | None = None


class Odpowiedz(Schemat):
    id: str = Field(pattern=r"^[a-z_0-9]+$")
    tekst: str = Field(min_length=1)
    reakcja: str = Field(min_length=1)
    skutki: Skutki
    szansa: float | None = Field(default=None, gt=0, lt=1)
    skutki_porazka: Skutki | None = None

    @model_validator(mode="after")
    def _szansa(self):
        if (self.szansa is None) != (self.skutki_porazka is None):
            raise ValueError(f"odpowiedź {self.id}: `szansa` i `skutki_porazka` idą parą")
        return self


class Propozycja(Schemat):
    id: str = Field(pattern=r"^[a-z_0-9]+$")
    kto: str
    od_rundy: int = Field(ge=1)
    gdy: dict[str, Zakres] = Field(default_factory=dict)
    tekst: str = Field(min_length=3)
    odpowiedzi: list[Odpowiedz] = Field(min_length=2)

    @model_validator(mode="after")
    def _unikalne(self):
        ids = [o.id for o in self.odpowiedzi]
        for i in sorted({x for x in ids if ids.count(x) > 1}):
            raise ValueError(f"propozycja {self.id}: powtórzone id odpowiedzi {i}")
        return self


class Parametr(Schemat):
    wartosc: int
    pewnosc: Literal["potwierdzone", "skalibrowane", "zalozenie"]
    zrodlo: str = Field(min_length=3)


class ZasadyPropozycji(Schemat):
    co_ile_rund: Parametr
    od_rundy: Parametr
    bez_odpowiedzi: str


class PlikDymkow(Schemat):
    opis: str = Field(min_length=3)
    zasady: Zasady
    rodzaje: dict[str, Rodzaj]
    wskazniki: dict[str, str]
    dymki: list[Dymek]
    propozycje_zasady: ZasadyPropozycji
    propozycje: list[Propozycja]

    @model_validator(mode="after")
    def _spojny(self):
        if set(self.rodzaje) != {"cena_smak", "plotki", "propozycje", "wos"}:
            raise ValueError("rodzaje: oczekiwano cena_smak, plotki, propozycje, wos")
        for d in self.dymki:
            if d.rodzaj not in self.rodzaje or d.rodzaj == "propozycje":
                raise ValueError(f"dymek ma nieznany rodzaj „{d.rodzaj}” (propozycje są na osobnej liście)")
            for w in d.gdy:
                if w not in self.wskazniki:
                    raise ValueError(f"dymek „{d.tekst}”: nieznany wskaźnik „{w}” w `gdy`")
        ids = [p.id for p in self.propozycje]
        for i in sorted({x for x in ids if ids.count(x) > 1}):
            raise ValueError(f"propozycje: powtórzone id {i}")
        for p in self.propozycje:
            for w in p.gdy:
                if w not in self.wskazniki:
                    raise ValueError(f"propozycja {p.id}: nieznany wskaźnik „{w}” w `gdy`")
            if self.propozycje_zasady.bez_odpowiedzi not in {o.id for o in p.odpowiedzi}:
                raise ValueError(f"propozycja {p.id}: brak odpowiedzi „{self.propozycje_zasady.bez_odpowiedzi}” "
                                 "(`bez_odpowiedzi`)")
        return self


class Nastroj(Schemat):
    zadowolenie_zero: float
    zadowolenie_sto: float

    @model_validator(mode="after")
    def _skala(self):
        if self.zadowolenie_zero >= self.zadowolenie_sto:
            raise ValueError("nastroj: zadowolenie_zero musi być mniejsze niż zadowolenie_sto")
        return self


class Mina(Schemat):
    nastroj_do: float | None = None
    nastroj_od: float | None = None
    wykorzystanie_od: float | None = None


class UstawieniaDymkow(Schemat):
    waga_dba_o: float = Field(ge=1)
    gosc: str = Field(min_length=1)


class PlikSilnika(Schemat):
    opis: str = Field(min_length=3)
    zrodlo: str = Field(min_length=3)
    nastroj: Nastroj
    miny: dict[str, Mina]
    dymki: UstawieniaDymkow


def sprawdz(bywalcy: dict, dymki: dict, silnik: dict | None = None) -> list[str]:
    """Błędy plików wnętrz (schematy i odwołania między nimi); pusta lista = dobre."""
    bledy: list[str] = []
    wczytane = {}
    for nazwa, schemat, dane in (("bywalcy.yaml", PlikBywalcow, bywalcy), ("dymki.yaml", PlikDymkow, dymki),
                                 ("silnik.yaml", PlikSilnika, silnik)):
        if dane is None:
            bledy.append(f"brak pliku dane/wnetrza/{nazwa}")
            continue
        try:
            wczytane[nazwa] = schemat.model_validate(dane)
        except ValidationError as e:
            for b in e.errors():
                bledy.append(f"wnetrza/{nazwa}: {'.'.join(map(str, b['loc']))}: {b['msg']}")
    if bledy or len(wczytane) < 3:
        return bledy
    b, d = wczytane["bywalcy.yaml"], wczytane["dymki.yaml"]
    ids = {x.id for x in b.bywalcy}
    for x in b.bywalcy:
        for w in x.dba_o:
            if w not in d.wskazniki:
                bledy.append(f"wnetrza/bywalcy.yaml: {x.id}.dba_o: nieznany wskaźnik „{w}”")
    for x in [*d.dymki, *d.propozycje]:
        if x.kto not in ids | set(KTO_OGOLNIE):
            bledy.append(f"wnetrza/dymki.yaml: kto „{x.kto}” – nie ma takiego bywalca (ani gosc/kazdy)")
    if WUJEK in ids and not any(x.kto == WUJEK for x in d.dymki):
        bledy.append("wnetrza/dymki.yaml: wujek nie ma żadnego dymku")
    if "wujek" in ids:
        brak = set(OKAZJE) - {x.okazja for x in d.dymki if x.kto == WUJEK}
        for o in sorted(brak):
            bledy.append(f"wnetrza/dymki.yaml: wujek nie ma dymku na okazję „{o}”")
    return bledy
