"""znaczki zakrytych funkcji w widoku drużyny (api/prezentacja.py: znaczki_funkcji)
i handel innych drużyn ukryty, dopóki drużyna nie odsłoni Handlu."""

import copy

import pytest
from pomocnicze import _gra, _lokal, _runda

from api.prezentacja import widok, znaczki_funkcji

pytestmark = pytest.mark.dane_gry

TOWAR = {"typ": "towar", "zasob": "Hummus", "jakosc": 2, "ilosc": 20, "cena_min": 900}
HUMMUS = {"dostawca": "Makro", "zasob": "Hummus", "jakosc": 2, "ilosc": 80, "dzien": 3}


def _funkcja(stan="zakryta", aktywna=False):
    return {"stan": stan, "aktywna": aktywna, "odslonieta": aktywna, "znaczek": None}


def _v(**funkcje):
    """Widok z danymi, z których biorą się znaczki (kształt jak z api/prezentacja.py: widok)."""
    return {"runda": 5, "funkcje": funkcje, "marki": {"Ola": {"nazwa": "Ola Kebab"}, "Bot": {"nazwa": "Tani Bot"}},
            "reklama": {"moje_strefy": ["centrum"], "konkurencja": {"ulotki": {"centrum": ["Ola"], "felin": ["Bot"]},
                                                                     "radio": {"miasto": ["Bot"]}}},
            "ubezpieczenia": {"szkody": [{"runda": 4, "ubezpieczona": False, "tytul": "Zalana kuchnia", "kwota": 1250.0},
                                         {"runda": 4, "ubezpieczona": True, "tytul": "Pożar", "kwota": 900.0},
                                         {"runda": 2, "ubezpieczona": False, "tytul": "Stara awaria", "kwota": 10.0}]},
            "urzad": {"kontrole": [{"runda": 4, "kontrola": True, "mandat": 500.0}]},
            "handel": {"ogloszenia": [{"co": "moje", "moje": True}, {"co": "cudze", "moje": False}],
                       "zapowiedzi": [{"od": "Ola", "co": "Hummus"}]},
            "wyniki": {"swiezosc": {"wylaczone": [{"danie": "falafel", "skladnik": "Hummus"},
                                                  {"danie": "falafel", "skladnik": "Hummus"}]}}}


def test_znaczki_zakrytych_funkcji():
    v = _v(marketing=_funkcja(), urzedy=_funkcja(), handel=_funkcja(), zaopatrzenie=_funkcja())
    znaczki_funkcji(v)
    f = v["funkcje"]
    # marketing: kampanie konkurencji w strefach lokali drużyny i w całym mieście (Felin – nie jej strefa)
    assert f["marketing"]["znaczek"] == "Kampanie konkurencji w Waszej strefie: Ola Kebab, Tani Bot"
    # urzędy: zeszła runda – szkoda bez ubezpieczenia i kontrola sanepidu; stara awaria i szkoda z polisą – nie
    assert "Zalana kuchnia" in f["urzedy"]["znaczek"] and "kontrola sanepidu – mandat 500 zł" in f["urzedy"]["znaczek"]
    assert "Pożar" not in f["urzedy"]["znaczek"] and "Stara" not in f["urzedy"]["znaczek"]
    # handel: liczba cudzych ogłoszeń i zapowiedzi (panel pokazuje liczbę), a same ogłoszenia znikają
    assert f["handel"]["znaczek"].startswith("2 – ")
    assert [o["co"] for o in v["handel"]["ogloszenia"]] == ["moje"] and v["handel"]["zapowiedzi"] == []
    # zaopatrzenie: braki towaru na auto-dostawach
    assert f["zaopatrzenie"]["znaczek"].startswith("2 – ") and "Hummus" in f["zaopatrzenie"]["znaczek"]


def test_bez_znaczkow_dla_odslonietych_i_gry_bez_funkcji():
    v = _v(marketing=_funkcja(aktywna=True), handel=_funkcja(stan="odkryta", aktywna=True), urzedy=_funkcja())
    v["urzad"]["kontrole"], v["ubezpieczenia"]["szkody"] = [], []
    przed = copy.deepcopy(v)
    znaczki_funkcji(v)
    assert v == przed   # nic do pokazania w zakrytych urzędach, odsłonięte – bez znaczka, handel widoczny
    bez = _v()   # gra bez funkcje.yaml albo bez pola funkcje – widok bez zmian
    przed = copy.deepcopy(bez)
    znaczki_funkcji(bez)
    assert bez == przed


def test_handel_innych_druzyn_dopiero_po_odslonieciu():
    g = _gra(("A", None), ("B", None), odblokowanie={"handel": 2}, funkcje="pierwsza_gra")
    g.odslon("A", "handel")
    g.odslon("A", "zaopatrzenie")   # zamówienie hummusu na sprzedaż – samodzielne
    _runda(g, A=_lokal("centrum_3"), B=_lokal("centrum_2"))
    _runda(g, A={"zamowienia": [HUMMUS], "handel_wystaw": [TOWAR]})
    g.ustaw_decyzje("A", {"handel_wystaw": [{**TOWAR, "ilosc": 10}]})   # zapowiedź na następną rundę
    assert widok(g, "A")["funkcje"]["handel"]["znaczek"] is None
    v = widok(g, "B")
    assert v["handel"]["ogloszenia"] == [] and v["handel"]["zapowiedzi"] == []
    assert v["funkcje"]["handel"]["znaczek"].startswith("2 – ")
    g.odslon("B", "handel")
    v = widok(g, "B")
    assert [o["moje"] for o in v["handel"]["ogloszenia"]] == [False] and len(v["handel"]["zapowiedzi"]) == 1
    assert v["funkcje"]["handel"]["znaczek"] is None


def test_gra_bez_funkcji_widzi_handel_jak_dotad():
    g = _gra(("A", None), ("B", None), odblokowanie={"handel": 2})
    _runda(g, A=_lokal("centrum_3"), B=_lokal("centrum_2"))
    _runda(g, A={"zamowienia": [HUMMUS], "handel_wystaw": [TOWAR]})
    v = widok(g, "B")
    assert len(v["handel"]["ogloszenia"]) == 1 and all(f["znaczek"] is None for f in v["funkcje"].values())
