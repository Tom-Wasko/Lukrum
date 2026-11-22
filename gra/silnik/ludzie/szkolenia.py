"""Szkolenia działające kilka tygodni (decyzja autora 7.11.2026; zalozenia.yaml: pracownicy.szkolenia).

Szkolenie kosztuje raz cenę z katalogu (cena miesięczna) i działa od tygodnia zakupu przez `tygodni` tygodni – tyle
rund gry tygodniowej. Działające szkolenia są w stanie firmy (`Firma.szkolenia`); ich procent oczekujących liczy się
do zadowolenia (osoby i karty) w każdej rundzie, w której działają. Szkolenia, które jeszcze trwa, nie kupuje się
drugi raz. Bez danych (albo `wlaczone: false`) – dawne zachowanie: cena miesięczna przeliczona na rundę, płacona
co rundę, a szkolenie działa tylko w tygodniu zakupu.

Poprawki 3 (sprawa 8): 12 szkoleń połączono w 8; pozycja katalogu ma listę `dawne` – nazwy szkoleń, z których powstała.
Decyzja albo trwające szkolenie ze starego zapisu (dawna nazwa) odnosi się do nowej pozycji; nieznaną nazwę się pomija.
"""
from __future__ import annotations

from ..dane import Dane
from ..model import Firma, Szkolenie

TYGODNI_W_ROKU = 52


def rund(dane: Dane) -> int:
    """Ile rund działa kupione szkolenie; 0 – dawne zachowanie (cena na rundę, działa w tygodniu zakupu)."""
    u = (dane.z.get("pracownicy") or {}).get("szkolenia")
    if not u or not u.get("wlaczone") or not u.get("tygodni"):
        return 0
    return max(1, round(u["tygodni"] * dane.rund_w_roku / TYGODNI_W_ROKU))


def aktywne(f: Firma, runda: int) -> list[Szkolenie]:
    return [s for s in f.szkolenia if s.od_rundy <= runda <= s.do_rundy]


def procent(f: Firma, runda: int) -> float:
    """Suma udziałów oczekujących (ułamek) ze szkoleń działających w rundzie."""
    return sum(s.procent / 100 for s in aktywne(f, runda))


def procent_firmy(oferta: dict, p: dict, firma_szkoleniowa: str) -> float:
    """Procent oczekujących szkolenia `p` w danej firmie szkoleniowej: przy `skutecznosc_z_oceny` (katalog.yaml)
    procent × ocena firmy / najwyższa ocena (lepsza szkoła – mocniejszy efekt), bez tego – procent pozycji."""
    if not oferta.get("skutecznosc_z_oceny"):
        return p["procent"]
    oceny = {f["nazwa"]: f["zadowoleni_klienci"] for f in oferta["firmy"]}
    return round(p["procent"] * oceny[firma_szkoleniowa] / max(oceny.values()), 1)


def nazwy(p: dict) -> set[str]:
    """Nazwa pozycji katalogu razem z dawnymi nazwami (sprawa 8 poprawek 3)."""
    return {p["nazwa"], *p.get("dawne", [])}


def pozycja(oferta: dict, nazwa: str | None) -> dict | None:
    """Pozycja katalogu szkoleń po nazwie albo dawnej nazwie; nieznana nazwa – None."""
    return next((p for p in oferta["pozycje"] if nazwa in nazwy(p)), None)


def trwa(f: Firma, nazwa: str, runda: int, dawne=()) -> Szkolenie | None:
    """Działające szkolenie o tej nazwie (albo jednej z dawnych nazw – kupione przed połączeniem szkoleń)."""
    return next((s for s in aktywne(f, runda) if s.szkolenie == nazwa or s.szkolenie in dawne), None)


def kup(dane: Dane, f: Firma, nazwa: str, firma_szkoleniowa: str, procent_oczekujacych: float, runda: int) -> Szkolenie:
    """Dopisuje szkolenie do stanu firmy (zakończone wcześniej – usuwa)."""
    f.szkolenia = [s for s in f.szkolenia if s.do_rundy >= runda]
    s = Szkolenie(szkolenie=nazwa, firma=firma_szkoleniowa, procent=procent_oczekujacych, od_rundy=runda,
                  do_rundy=runda + rund(dane) - 1)
    f.szkolenia.append(s)
    return s
