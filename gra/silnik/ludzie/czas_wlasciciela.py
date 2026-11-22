"""Czas właściciela (gra z lokalami).

Właściciel ma na rundę pulę godzin na sprawy poza lokalem (`operacje.czas_wlasciciela` w zalozenia.yaml): odbiór
osobisty w dyskontach, a w kolejnych etapach ogłoszenia na pracuj.pl i parki. Decyzje zużywają godziny po kolei;
decyzja, na którą nie starcza godzin, jest odrzucona (czerwony błąd na liście błędów).

Godziny, których nie zjadły sprawy poza lokalem, właściciel spędza sam na pustym stanowisku (`na_pustym_stanowisku`,
zawsze, bez decyzji drużyny): pula − sprawy poza lokalem = godziny na stanowisku (najwyżej etat pracownika), reszta to
wolne. Sprawy poza lokalem mają pierwszeństwo – stanowisko dostaje to, co po nich zostanie.
"""

from __future__ import annotations

from ..dane import Dane
from ..model import Firma, WlascicielNaStanowisku


def godziny(x: float) -> str:
    return f"{x:g}".replace(".", ",")


class Czas:
    def __init__(self, pula: float):
        self.pula = float(pula)
        self.pozycje: list[dict] = []

    @property
    def wykorzystane(self) -> float:
        """Godziny na sprawy poza lokalem (bez pracy na stanowisku)."""
        return round(sum(p["godziny"] for p in self.pozycje if p["przyjete"] and not p.get("stanowisko")), 2)

    @property
    def na_stanowisku(self) -> float:
        return round(sum(p["godziny"] for p in self.pozycje if p["przyjete"] and p.get("stanowisko")), 2)

    @property
    def wolne(self) -> float:
        """Godziny dostępne na sprawy poza lokalem (stanowisko im ustępuje)."""
        return round(self.pula - self.wykorzystane, 2)

    @property
    def wolne_po_stanowisku(self) -> float:
        return round(self.pula - self.wykorzystane - self.na_stanowisku, 2)

    def wez(self, ile: float, opis: str, zakladka: str) -> bool:
        """Rezerwuje `ile` godzin; False (i pozycja odrzucona) – brak wolnych godzin."""
        ok = ile <= self.wolne + 1e-9
        self.pozycje.append({"opis": opis, "godziny": ile, "zakladka": zakladka, "przyjete": ok})
        return ok

    def podsumowanie(self) -> dict:
        return {"pula": self.pula, "wykorzystane": self.wykorzystane, "wolne": self.wolne,
                "na_stanowisku": self.na_stanowisku, "wolne_po_stanowisku": self.wolne_po_stanowisku,
                "pozycje": list(self.pozycje)}


def z_podsumowania(p: dict) -> Czas:
    """Czas odtworzony z `podsumowanie()` – kolejne decyzje rundy zużywają resztę godzin."""
    c = Czas(p["pula"])
    c.pozycje = list(p["pozycje"])
    return c


def nowy(dane: Dane) -> Czas:
    return Czas(dane.z["operacje"]["czas_wlasciciela"])


def _pusty_stanowisko_kandydaci(dane: Dane, firma: Firma) -> list:
    """Puste stanowiska, na których właściciel się przyda: kasa z kompletem sprzętu kasy, kuchnia z jakimkolwiek sprzętem.
    Kolejność: najpierw typ, którego lokal w ogóle nie ma obsadzonego (bez kasjera nie ma sprzedaży, bez kucharza dań),
    potem kasa przed kuchnią, na końcu niższy numer."""
    obsadzone = {(s.lokal, s.typ) for s in firma.stanowiska if firma.pracownik_stanowiska(s)}
    wolne = []
    for s in firma.stanowiska:
        if s.pracownik:
            continue
        if s.typ == "kasa":
            potrzebny = all(n in s.sprzet for n in dane.sprzet_kasy)
        else:
            potrzebny = bool(s.sprzet)
        if potrzebny:
            wolne.append(s)
    return sorted(wolne, key=lambda s: ((s.lokal, s.typ) in obsadzone, s.typ != "kasa", s.lokal or "", s.nr))


def na_pustym_stanowisku(dane: Dane, firma: Firma, czas: Czas) -> dict | None:
    """Właściciel zawsze staje na pustym stanowisku, gdy ma wolne godziny (po sprawach poza lokalem): pracownik 1★ bez
    pensji (jak przeciętny kandydat 1★ z rynek_pracy.yaml), najwyżej `godziny_pracownika` godzin. Jedno stanowisko na
    rundę; ustawia `firma.wlasciciel_na`. Wynik jak dawna decyzja: {"typ", "nr", "godziny", "przyjete", "powod"} albo
    None (brak wolnych godzin albo brak pustego stanowiska z potrzebnym sprzętem)."""
    firma.wlasciciel_na = None
    godziny = round(min(czas.wolne, dane.z["operacje"]["godziny_pracownika"]), 2)
    kandydaci = _pusty_stanowisko_kandydaci(dane, firma)
    if godziny <= 0 or not kandydaci:
        return None
    st = kandydaci[0]
    czas.pozycje.append({"opis": f"Praca na stanowisku: {dane.typy_stanowisk[st.typ]['kto']} nr {st.nr}", "godziny": godziny,
                         "zakladka": "zatrudnienie", "przyjete": True, "stanowisko": True})
    r = dane.rynek_pracy["losowanie"]["wg_gwiazdek"]["1"]
    firma.wlasciciel_na = WlascicielNaStanowisku(
        typ=st.typ, nr=st.nr, godziny=godziny, zawod=dane.zawody_typu(st.typ)[0],
        zadowolenie_klientow=round(sum(r["zk"]) / 2, 2), ryzyko_pomylki=round(sum(r["ryzyko"]) / 2, 2))
    return {"typ": st.typ, "nr": st.nr, "godziny": godziny, "przyjete": True, "powod": None}


def zastosuj(dane: Dane, firma: Firma, info: dict) -> None:
    """Ostatni krok czasu właściciela w rundzie – po wszystkich sprawach poza lokalem (zakupy, rekrutacja, przewozy, eventy
    w parkach, detektyw): wolne godziny idą na puste stanowisko. Uzupełnia `info` (czas_wlasciciela, wlasciciel_stanowisko)."""
    czas = z_podsumowania(info["czas_wlasciciela"])
    czas.pozycje = [p for p in czas.pozycje if not p.get("stanowisko")]
    info.pop("wlasciciel_stanowisko", None)
    if wynik := na_pustym_stanowisku(dane, firma, czas):
        info["wlasciciel_stanowisko"] = wynik
    info["czas_wlasciciela"] = czas.podsumowanie()
