"""Funkcje gry: odkryte, zakryte i wyłączone (seria „funkcje”, raporty/funkcje/plan.md).

Rejestr funkcji – `dane/funkcje.yaml` (brak pliku – gra bez funkcji, wszystko odkryte). Mistrz gry ustawia stany przy
tworzeniu gry (konfiguracja: `funkcje` – {klucz: "odkryta"|"zakryta"|"wylaczona"}, później bez zmian); brak klucza
(stare gry) – „odkryta”. Drużyna odsłania zakrytą funkcję (i może ją znów zakryć) – historia w konfiguracji:
`odsloniete` – {firma: [[runda, klucz, odslonieta], …]}; odsłonięcie w rundzie r działa od przeliczenia rundy r,
więc przeliczenie starszej rundy daje to samo co wtedy (event sourcing).

Jedno miejsce, z którego korzystają decyzje, boty, harmonogram i widok drużyny:
- `wylaczona` – funkcji nie ma dla nikogo (decyzje odrzucane, boty pomijają, elementy harmonogramu wyłączone);
- `aktywna` – drużyna sama decyduje (odkryta albo odsłonięta; bot – każda niewyłączona);
- `autopilot` – zakryta i nieodsłonięta: gra robi ją za drużynę z bezpiecznymi domyślnymi decyzjami.
"""
from __future__ import annotations

from fnmatch import fnmatchcase

STANY = ("odkryta", "zakryta", "wylaczona")
ODKRYTA, ZAKRYTA, WYLACZONA = STANY


def rejestr(dane) -> dict[str, dict]:
    """Funkcje z `dane/funkcje.yaml` ({klucz: {nazwa, krotko, ikona, opis, zakryta, zakladki, elementy}})."""
    return ((getattr(dane, "funkcje", None) or {}).get("funkcje")) or {}


def zestawy(dane) -> dict[str, dict]:
    return ((getattr(dane, "funkcje", None) or {}).get("zestawy")) or {}


def stany_zestawu(dane, zestaw: str) -> dict[str, str]:
    """Pełna lista stanów gotowego zestawu (np. „pierwsza_gra”)."""
    z = zestawy(dane).get(zestaw)
    if z is None:
        raise ValueError(f"Nie ma takiego zestawu funkcji: {zestaw}.")
    return {k: (z.get("stany") or {}).get(k, z["reszta"]) for k in rejestr(dane)}


def sprawdz_stany(dane, funkcje: dict | str | None) -> dict[str, str] | None:
    """Stany funkcji nowej gry – pełna lista. `funkcje` – nazwa zestawu albo {klucz: stan} (brakujące – z zestawu
    domyślnego). None – gra bez funkcji (wszystko odkryte, jak przed serią). Niedozwolone – ValueError z opisem."""
    if funkcje is None or not rejestr(dane):
        return None
    if isinstance(funkcje, str):
        return stany_zestawu(dane, funkcje)
    if not isinstance(funkcje, dict):
        raise ValueError("Funkcje gry: podaj zestaw albo stan każdej funkcji.")
    rej = rejestr(dane)
    for k, s in funkcje.items():
        if k not in rej:
            raise ValueError(f"Nie ma takiej funkcji gry: {k}.")
        if s not in STANY:
            raise ValueError(f"{rej[k]['nazwa']}: stan „{s}” – możliwe: odkryta, zakryta, wyłączona.")
    domyslne = stany_zestawu(dane, dane.funkcje["domyslny_zestaw"])
    return {k: funkcje.get(k, domyslne[k]) for k in rej}


def stan(konfiguracja: dict, klucz: str) -> str:
    """Stan funkcji ustawiony przez mistrza gry (stara gra albo nieznana funkcja – „odkryta”)."""
    return (konfiguracja.get("funkcje") or {}).get(klucz, ODKRYTA)


def wylaczona(konfiguracja: dict, klucz: str) -> bool:
    return stan(konfiguracja, klucz) == WYLACZONA


def _bot(konfiguracja: dict, firma: str) -> bool:
    return any(f["nazwa"] == firma and f["bot"] for f in konfiguracja.get("firmy", []))


def odslonieta(konfiguracja: dict, firma: str, klucz: str, runda: int) -> bool:
    """Czy drużyna miała funkcję odsłoniętą przy przeliczeniu rundy `runda` (ostatnia zmiana do tej rundy)."""
    wynik = False
    for r, k, o in (konfiguracja.get("odsloniete") or {}).get(firma, []):
        if k == klucz and r <= runda:
            wynik = bool(o)
    return wynik


def aktywna(konfiguracja: dict, firma: str, klucz: str, runda: int) -> bool:
    """Drużyna (albo bot) sama decyduje w tej funkcji: odkryta, odsłonięta albo – u bota – każda niewyłączona."""
    s = stan(konfiguracja, klucz)
    if s == WYLACZONA:
        return False
    return s == ODKRYTA or _bot(konfiguracja, firma) or odslonieta(konfiguracja, firma, klucz, runda)


def autopilot(konfiguracja: dict, firma: str, klucz: str, runda: int) -> bool:
    """Zakryta i nieodsłonięta – gra robi funkcję za drużynę (boty nigdy)."""
    return stan(konfiguracja, klucz) == ZAKRYTA and not aktywna(konfiguracja, firma, klucz, runda)


def zakryta_ponownie(konfiguracja: dict, firma: str, klucz: str, runda: int) -> bool:
    """K1: drużyna znów zakryła odsłoniętą wcześniej funkcję i od rundy `runda` robi ją gra – w tej rundzie przepada
    to, co drużyna w funkcji kupiła (silnik/autopilot.py: przepadek). Wpis [runda, klucz, False] w historii jest tylko
    po odsłonięciu (`odslon` zapisuje same zmiany)."""
    return autopilot(konfiguracja, firma, klucz, runda) and [runda, klucz, False] in (
        (konfiguracja.get("odsloniete") or {}).get(firma) or [])


BLOKADA_HARPAGONA = "Najpierw spłaćcie pożyczkę u Harpagona."


def blokada_zakrycia(klucz: str, firma) -> str:
    """K2: dlaczego drużyna nie może znów zakryć funkcji `klucz` („” – może). `firma` – stan firmy na początku
    bieżącej rundy (Firma albo None). Harpagona z niespłaconą pożyczką nie da się zakryć – autopilot nic za drużynę
    przy nim nie robi, a dług by został."""
    if klucz == "harpagon" and getattr(firma, "harpagon", None) is not None:
        return BLOKADA_HARPAGONA
    return ""


def odslon(konfiguracja: dict, firma: str, klucz: str, odslonic: bool, runda: int) -> None:
    """Drużyna odsłania (albo znów zakrywa) zakrytą funkcję od rundy `runda` (bieżącej – jeszcze nieprzeliczonej)."""
    if stan(konfiguracja, klucz) != ZAKRYTA:
        raise ValueError("Odsłonić albo zakryć można tylko funkcję, którą mistrz gry zakrył.")
    if not any(f["nazwa"] == firma and not f["bot"] for f in konfiguracja.get("firmy", [])):
        raise ValueError(f"Nie ma takiej drużyny: {firma}.")
    hist = [x for x in (konfiguracja.setdefault("odsloniete", {}).get(firma) or []) if not (x[0] == runda and x[1] == klucz)]
    if odslonieta(konfiguracja, firma, klucz, runda - 1) != bool(odslonic):   # bez zbędnych wpisów
        hist.append([runda, klucz, bool(odslonic)])
    konfiguracja["odsloniete"][firma] = hist


def zakladki_wylaczone(dane, konfiguracja: dict) -> set[str]:
    return {z for k, f in rejestr(dane).items() if wylaczona(konfiguracja, k) for z in f["zakladki"]}


def elementy_wylaczone(dane, konfiguracja: dict, elementy: dict) -> set[str]:
    """Elementy harmonogramu (silnik/harmonogram.py: elementy) wyłączonych funkcji – wzorce `*` z funkcje.yaml."""
    wzorce = [w for k, f in rejestr(dane).items() if wylaczona(konfiguracja, k) for w in f.get("elementy", [])]
    return {e for e in elementy if any(fnmatchcase(e, w) for w in wzorce)}


def elementy_funkcji(dane, konfiguracja: dict, elementy: dict) -> dict[str, str]:
    """{element harmonogramu: nazwa funkcji} – elementy wyłączonych funkcji (do komunikatu dla mistrza gry)."""
    wynik = {}
    for k, f in rejestr(dane).items():
        if wylaczona(konfiguracja, k):
            for e in elementy:
                if e not in wynik and any(fnmatchcase(e, w) for w in f.get("elementy", [])):
                    wynik[e] = f["nazwa"]
    return wynik


# --- decyzje funkcji (J3, J5) ------------------------------------------------------------------------------------
# Mapa decyzja → funkcja w jednym miejscu: to klucze formatu decyzji silnika (silnik/decyzje.py: opis formatu),
# a nie liczby gry, więc nie ma ich w danych; z mapy korzystają przeliczenie rundy (silnik/autopilot.py), boty
# i podgląd decyzji drużyny. Klucze z KLUCZE_W_LOKALU bywają też w `w_lokalu[lokal]`. Szczególne przypadki (w `filtruj`):
# - „lokal” (także kolejny lokal z „Nowych lokali”) to podstawa gry; do sieci lokali należy tylko licytacja – bez
#   sieci „oferta” znika i lokal idzie po cenie wywoławczej (K3, silnik/nieruchomosci/lokale.py: oferta),
# - „biuro”: „samodzielnie” należy do samodzielnej księgowości (wybór biura z mapy – podstawa gry),
# - „harpagon_splac” – na autopilocie drużyna dalej może spłacić dług (pomija się tylko przy wyłączonym Harpagonie).
DECYZJE: dict[str, tuple[str, ...]] = {
    "zaopatrzenie": ("zamowienia", "auto_dostawy"),
    "marketing": ("kampanie", "promocje"),
    "wyposazenie": ("wyposazenie_kup", "wyposazenie_sprzedaj", "dekor_kup", "dekor_ustaw"),
    "rozwoj": ("szkolenia", "udogodnienia_kup", "udogodnienia_sprzedaj"),
    "analiza": ("detektyw",),
    "siec": ("przejecie", "wypowiedz", "przewozy"),
    "handel": ("handel_wystaw", "handel_licytuj"),
    "ksiegowosc": ("ksiegowosc",),
    "urzedy": ("higiena", "polisy"),
    "harpagon": ("harpagon_wez", "harpagon_splac"),
    "wlasciciel": ("wyplata_wlasna", "wplata_wlasna"),
    "gielda": (),   # giełdy nie ma jeszcze w silniku – brak decyzji
}
KLUCZE_W_LOKALU = frozenset({"auto_dostawy", "wyposazenie_kup", "wyposazenie_sprzedaj", "dekor_kup", "dekor_ustaw",
                             "udogodnienia_kup", "udogodnienia_sprzedaj"})
# zakładki listy błędów (także dawne klucze – ALIAS w panelu), których nie pokazuje się drużynie, gdy funkcji sama
# nie prowadzi (autopilot albo funkcja wyłączona): gra robi to za nią, więc „brak dostaw” czy uwagi o higienie
# nie są jej sprawą (błąd „funkcja wyłączona” z `filtruj` – z polem "funkcja" – zostaje)
BLEDY_AUTOPILOTA: dict[str, frozenset[str]] = {
    "zaopatrzenie": frozenset({"dostawcy", "swiezosc", "zaop_dostawy", "zaop_magazyn"}),
    "urzedy": frozenset({"urzad", "sanepid", "ubezpieczenia"}),
    "ksiegowosc": frozenset({"kpir", "vat", "podatki"}),
}
SAMODZIELNIE = "samodzielnie"   # silnik/ksiegowosc/biuro.py: SAMODZIELNIE (bez importu – harmonogram importuje ten moduł)


def _pusta(v) -> bool:
    return v is None or v is False or (isinstance(v, (list, dict, str)) and not v)


def _klucze(klucz: str, autopilot_: bool) -> tuple[str, ...]:
    k = DECYZJE.get(klucz, ())
    return tuple(x for x in k if x != "harpagon_splac") if autopilot_ else k


def filtruj(dane, konfiguracja: dict, firma: str, d: dict, runda: int) -> tuple[dict, list[dict]]:
    """Decyzje firmy bez decyzji funkcji, których drużyna sama nie prowadzi w tej rundzie (wyłączonych i na autopilocie).
    Zwraca (decyzje – kopia, gdy coś usunięto; błędy). Błąd – tylko przy wyłączonej funkcji, gdy drużyna (nie bot)
    coś w niej postanowiła; na autopilocie decyzje znikają po cichu (robi je gra – silnik/autopilot.py)."""
    if not d or not konfiguracja.get("funkcje") or not rejestr(dane):
        return d, []
    wynik, bledy, bot = d, [], _bot(konfiguracja, firma)
    for k, f in rejestr(dane).items():
        wyl = wylaczona(konfiguracja, k)
        if not wyl and aktywna(konfiguracja, firma, k, runda):
            continue
        usuniete: list = []

        def usun(klucz: str, w: dict | None = None) -> None:
            nonlocal wynik
            zrodlo = wynik if w is None else (wynik.get("w_lokalu") or {}).get(w) or {}
            if klucz not in zrodlo:
                return
            if wynik is d:
                wynik = dict(d)
            if w is None:
                usuniete.append(wynik.pop(klucz))
                return
            wynik["w_lokalu"] = {**wynik["w_lokalu"]}
            wynik["w_lokalu"][w] = {x: v for x, v in wynik["w_lokalu"][w].items() if x != klucz}
            usuniete.append(zrodlo[klucz])

        for klucz in _klucze(k, not wyl):
            usun(klucz)
            if klucz in KLUCZE_W_LOKALU and isinstance(wynik.get("w_lokalu"), dict):
                for w in list(wynik["w_lokalu"]):
                    usun(klucz, w)
        if k == "siec" and isinstance(wynik.get("lokal"), dict) and "oferta" in wynik["lokal"]:
            # K3: licytacja (oferta ponad cenę wywoławczą) – sieć lokali; bez niej lokal po cenie wywoławczej
            # (bez błędu: sam lokal – podstawa gry – zostaje)
            if wynik is d:
                wynik = dict(d)
            wynik["lokal"] = {x: v for x, v in wynik["lokal"].items() if x != "oferta"}
        if k == "ksiegowosc" and wynik.get("biuro") == SAMODZIELNIE:
            usun("biuro")
        if k == "urzedy" and wyl:   # higiena domyślna / bez polis – tak samo jak bez decyzji
            usuniete = [v for v in usuniete if v != _higiena_domyslna(dane)]
        if wyl and not bot and any(not _pusta(v) for v in usuniete):
            bledy.append({"poziom": "czerwony", "zakladka": f["zakladki"][0], "funkcja": k,
                          "tekst": f"Mistrz gry wyłączył w tej grze funkcję {f['nazwa']} – ta decyzja nie zostanie "
                                   "wykonana."})
    return wynik, bledy


def _higiena_domyslna(dane) -> str | None:
    return (((getattr(dane, "zdarzenia", None) or {}).get("urzad") or {}).get("higiena") or {}).get("domyslna")


def bez_ukrytych(dane, konfiguracja: dict, firma: str, runda: int, bledy: list[dict]) -> list[dict]:
    """Lista błędów bez uwag funkcji, których drużyna sama nie prowadzi (BLEDY_AUTOPILOTA: autopilot albo funkcja
    wyłączona) – nie ma ich zakładek ani wpływu na nie."""
    if not konfiguracja.get("funkcje"):
        return bledy
    ukryte = {z for k, zs in BLEDY_AUTOPILOTA.items()
              if k in rejestr(dane) and not aktywna(konfiguracja, firma, k, runda) for z in zs}
    return [b for b in bledy if b.get("zakladka") not in ukryte or "funkcja" in b or "zakrycie" in b] if ukryte else bledy
