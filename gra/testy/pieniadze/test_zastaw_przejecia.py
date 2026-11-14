"""B6 (decyzja autora 7.11.2026): budynek z najemcą kupowany w rundzie jest zastawem kredytu inwestycyjnego w tej
samej rundzie (jak kupowany lokal); przełącznik `zastaw_przejecia` w mapa/banki.yaml (w danych zamrożonych wyłączony)."""

import copy

import pytest
from pomocnicze import _gra, _lokal, _runda

from balans import warianty as wr
from silnik import boty
from silnik.dane import dane_domyslne
from silnik.ksiegowosc.finanse import Ksiega, Rachunek
from silnik.nieruchomosci import przejecia as pr
from silnik.pieniadze import banki as bk

LOKAL = "politechnika_1"


def _dane(wlaczony=True):
    d = copy.deepcopy(dane_domyslne())
    d.mapa["banki"]["zastaw_przejecia"] = wlaczony
    return d


def _do_przejec(wlaczony=True, kapital=300000):
    """A wynajmuje LOKAL i stawia w nim stanowisko; rundy bez decyzji aż do rundy przejęć."""
    g = _gra(rund=14, kapital_startowy=kapital, dane=_dane(wlaczony))
    od = g.dane.mapa["zasady"]["przejecia_od_rundy"]
    _runda(g, A=_lokal(LOKAL))
    _runda(g, A={"stanowiska": {"kuchnia": 1}})
    while g.runda < od:
        _runda(g)
    return g, od


def _kredyt(kwota, zastaw=f"lokal:{LOKAL}"):
    return {"bank": "Wokulski i S-ka", "produkt": "inwestycyjny", "kwota": kwota, "rund": 104, "zastaw": zastaw}


def _bledy_banku(s, r, firma):
    return [b["tekst"] for b in s.wyniki[r][firma]["lista_bledow"] if b["zakladka"] == "finanse_bank"]


def _zalegla_runda(dane, f, runda, najemcy=None):
    f.gotowka, f.debet = -1e6, 1e6      # ani gotówki, ani wolnego limitu
    return bk.koniec_rundy(dane, f, runda, Ksiega(), Rachunek(), najemcy)


def test_nowy_lokal_to_kupowany_budynek_przy_wykupie_bez_sprzetu_wynajmujacego():
    g, od = _do_przejec()
    s, cena = g.stan(), g.dane.lokale[LOKAL]["cena"]
    rywal = bk.nowy_lokal(g.dane, {"przejecie": {"id": LOKAL}}, od, s.firmy["B"])
    assert rywal["id"] == f"lokal:{LOKAL}" and rywal["przejecie"] and rywal["wartosc"] == cena
    wykup = bk.nowy_lokal(g.dane, {"przejecie": {"id": LOKAL}}, od, s.firmy["A"])
    sprzet = bk.sprzet_wynajmujacego(g.dane, s.firmy["A"], LOKAL)
    assert sprzet > 0 and wykup["wartosc"] == pytest.approx(cena - sprzet)
    # kupno lokalu w tej rundzie ma pierwszeństwo – zastawem jest kupowany lokal
    oba = {**_lokal("zygmuntowskie_1", "kupno"), "przejecie": {"id": LOKAL}}
    assert bk.nowy_lokal(g.dane, oba, od, s.firmy["B"])["id"] == "lokal:zygmuntowskie_1"
    assert bk.nowy_lokal(_dane(False), {"przejecie": {"id": LOKAL}}, od, s.firmy["B"]) is None


def test_finansowanie_tylko_dla_wlasciwego_zakupu():
    g, od = _do_przejec()
    f, cena = g.stan().firmy["B"], g.dane.lokale[LOKAL]["cena"]
    kwota = round(0.6 * cena, 2)
    d = {"przejecie": {"id": LOKAL}, "kredyty_wez": [_kredyt(kwota)]}
    assert bk.finansowanie_lokalu(g.dane, f, d, od, przejecie=True) == kwota
    assert bk.finansowanie_lokalu(g.dane, f, d, od) == 0               # lokale.wybierz go nie liczy
    za_duzo = {**d, "kredyty_wez": [_kredyt(round(0.8 * cena, 2))]}   # ponad 70% wartości zastawu
    assert bk.finansowanie_lokalu(g.dane, f, za_duzo, od, przejecie=True) == 0
    assert bk.finansowanie_lokalu(_dane(False), f, d, od, przejecie=True) == 0


def test_powod_przejecia_liczy_kredyt_do_gotowki():
    g, od = _do_przejec()
    s, cena = g.stan(), g.dane.lokale[LOKAL]["cena"]
    s.firmy["B"].gotowka = 0.5 * cena
    powod = pr.powod_przejecia(g.dane, s.firmy, "B", {"id": LOKAL}, od)
    assert "Za mało gotówki" in powod
    assert pr.powod_przejecia(g.dane, s.firmy, "B", {"id": LOKAL}, od, 0.6 * cena) is None
    assert "z kredytem pod zastaw" in pr.powod_przejecia(g.dane, s.firmy, "B", {"id": LOKAL}, od, 0.1 * cena)


def _kupno_na_kredyt(wlaczony=True):
    """B ma za mało gotówki na budynek A – kupuje go z kredytem pod jego zastaw."""
    g, od = _do_przejec(wlaczony, kapital=100000)
    cena = g.dane.lokale[LOKAL]["cena"]
    gotowka = g.stan().firmy["B"].gotowka
    kwota = round(0.7 * cena - 1, 2)
    assert gotowka < cena <= gotowka + kwota
    s = _runda(g, B={"przejecie": {"id": LOKAL}, "bank": "Wokulski i S-ka", "kredyty_wez": [_kredyt(kwota)]})
    return g, s, od, kwota


def test_kupno_budynku_rywala_na_kredyt_pod_jego_zastaw():
    g, s, od, kwota = _kupno_na_kredyt()
    f = s.firmy["B"]
    assert s.wyniki[od]["B"]["przejecia"]["przejecie"]["przyjety"]
    assert [b.id for b in f.budynki] == [LOKAL] and s.firmy["A"].lokale[0].wlasciciel == "B"
    (k,) = f.kredyty
    assert (k.produkt, k.kwota, k.zastaw) == ("inwestycyjny", kwota, f"lokal:{LOKAL}")
    assert not [z for z in bk.zastawy(g.dane, f) if z["id"] == f"lokal:{LOKAL}"]   # już zastawiony
    assert not s.wyniki[od]["B"]["bank"]["poczatek"]["odrzucone"]
    assert s.wyniki[od]["B"]["bank"]["debet_ponad_limit"] == 0


def test_bez_przelacznika_kupno_na_kredyt_odrzucone():
    g, s, od, _ = _kupno_na_kredyt(wlaczony=False)
    f = s.firmy["B"]
    assert not s.wyniki[od]["B"]["przejecia"]["przejecie"]["przyjety"] and not f.budynki and not f.kredyty
    assert any(t.startswith("Kredyt inwestycyjny") for t in _bledy_banku(s, od, "B"))


def test_kupiony_wczesniej_budynek_jest_zastawem():
    g, od = _do_przejec()
    s = _runda(g, B={"przejecie": {"id": LOKAL}})
    (z,) = [z for z in bk.zastawy(g.dane, s.firmy["B"]) if z["id"] == f"lokal:{LOKAL}"]
    assert z["nazwa"].startswith("Budynek z najemcą") and 0 < z["wartosc"] <= g.dane.lokale[LOKAL]["cena"]
    assert not [z for z in bk.zastawy(_dane(False), s.firmy["B"]) if z["id"] == f"lokal:{LOKAL}"]


def test_budynek_niekupiony_kredyt_przepada_z_komunikatem():
    """Przed rundą przejęć budynku nie można kupić – kredyt pod jego zastaw nie wchodzi."""
    g = _gra(rund=14, kapital_startowy=300000, dane=_dane())
    _runda(g, A=_lokal(LOKAL))
    s = _runda(g, B={**_lokal("centrum_3"), "przejecie": {"id": LOKAL}, "bank": "Wokulski i S-ka",
                     "kredyty_wez": [_kredyt(10000)]})
    assert not s.firmy["B"].kredyty and not s.firmy["B"].budynki
    assert any("budynek pod zastaw nie został kupiony" in t and "Przejęcia" in t for t in _bledy_banku(s, 2, "B"))


def test_bank_przejmuje_budynek_najemca_zostaje_bez_wlasciciela():
    g, s, od, _ = _kupno_na_kredyt()
    f, najemca = copy.deepcopy(s.firmy["B"]), copy.deepcopy(s.firmy["A"])
    umowa = najemca.lokale[0]
    przejecia = []
    for r in range(od + 1, od + 1 + bk.ustawienia(g.dane)["przejecie_po"]):
        przejecia += _zalegla_runda(g.dane, f, r, {LOKAL: umowa})["przejecia"]
    (p,) = przejecia
    assert p["zastaw"].startswith("budynek z najemcą") and not f.kredyty and not f.budynki
    assert not [x for x in f.srodki_trwale if x.rodzaj == "lokal"]
    assert umowa.wlasciciel is None and umowa.forma == "najem"


def test_bot_z_kredytem_kupuje_budynek_za_mniejsza_gotowke():
    g, od = _do_przejec()
    s, cena = g.stan(), g.dane.lokale[LOKAL]["cena"]
    f = copy.deepcopy(s.firmy["B"])
    f.gotowka = 0.5 * cena + 30000
    st = {"przejecie": {"rezerwa": 30000}}
    assert boty._przejecie(g.dane, s, f, "B", st, od) is None             # bez kredytu – za mało gotówki
    dec, k = boty._przejecie(g.dane, s, f, "B", {"przejecie": {"rezerwa": 30000, "kredyt": True}}, od)
    assert dec == {"id": LOKAL} and k["zastaw"] == f"lokal:{LOKAL}" and k["kwota"] >= 0.5 * cena
    assert boty._przejecie(_dane(False), s, f, "B", {"przejecie": {"rezerwa": 30000, "kredyt": True}}, od) is None


def test_warianty_z_kredytem_w_katalogu():
    nazwy = set(wr.katalog_wariantow(dane_domyslne()))
    assert {"lokale:wykup_kredyt", "lokale:przejecie_kredyt"} <= nazwy


@pytest.mark.dane_gry
def test_przelacznik_w_danych_gry_i_sciezka_dla_wariantow():
    assert bk.ustawienia(dane_domyslne())["zastaw_przejecia"] is True
    assert bk.ustawienia(wr.dane_ze_zmianami("mapa.banki.zastaw_przejecia=false"))["zastaw_przejecia"] is False
