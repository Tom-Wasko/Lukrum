"""Poprawki po przeglądzie 14.11.2026: debet liczony od salda końca tygodnia (za zgodą i bez zgody), pomyłki a opinie,
Scrooge w święto w ostatniej rundzie, firma bezczynna."""
import statistics as st

import pytest
from pomocnicze import _gra

from silnik import dane as sd
from silnik.dane import dane_domyslne
from silnik.gra import Gra
from silnik.ksiegowosc import biuro as bo
from silnik.ksiegowosc.finanse import Ksiega, Rachunek, uruchom_debet, wyrownaj_gotowke
from silnik.model import Firma
from silnik.pieniadze import banki as bk

pytestmark = pytest.mark.dane_gry


def _tydzien(firma, ks, rach, dane, runda=5):
    return bk.koniec_rundy(dane, firma, runda, ks, rach)


def _koszt_debetu(u, bank, kwota, zgoda):
    """Opłata + odsetki tygodniowe (zł) za debet `kwota` (w limicie banku) – ten sam wzór co silnik."""
    if zgoda:
        return bank["debet"]["oplata"] + kwota * bank["debet"]["oprocentowanie"] / 52
    return u["oplata_debet_bez_zgody"] + kwota * u["stopa_karna"] / 52


def test_debet_bez_zgody_zawsze_drozej_niz_za_zgoda_i_w_granicach_prawa():
    d = dane_domyslne()
    u = bk.ustawienia(d)
    ref = u["stopa_referencyjna_nbp"]
    for b in bk.banki(d).values():
        assert b["debet"]["oprocentowanie"] <= 2 * (ref + u["marza_odsetki_maksymalne"]) + 1e-9, b["nazwa"]   # art. 359 § 2¹ KC
        for kwota in (100, 500, 2000, 5000, b["debet"]["limit"]):
            kwota = min(kwota, b["debet"]["limit"])
            assert _koszt_debetu(u, b, kwota, False) > _koszt_debetu(u, b, kwota, True), (b["nazwa"], kwota)
    assert u["stopa_karna"] <= 2 * (ref + u["marza_odsetki_opoznienie"]) + 1e-9                                  # art. 481 § 2¹ KC
    assert sd.sprawdz() == []


def test_chwilowy_minus_w_tygodniu_nic_nie_kosztuje():
    d = dane_domyslne()
    f = Firma(nazwa="A", gotowka=0, bank="Soplicowo", debet_wlaczony=True)
    ks, rach = Ksiega(), Rachunek()
    f.gotowka = -1500.0
    assert uruchom_debet(f, rach) == 1500 and f.debet == 1500        # wydatki przed przychodami: chwilowy debet
    f.gotowka += 4000.0                                                # sprzedaż tygodnia pokrywa wszystko
    wyrownaj_gotowke(f, rach)
    assert f.debet == 0 and f.gotowka == 2500
    assert "debet" not in _tydzien(f, ks, rach, d) or _tydzien(f, ks, rach, d)["debet"] is None
    assert not [o for o in rach.operacje if "minusie" in o["opis"] or "niedozwolone" in o["opis"]]


def test_koniec_tygodnia_na_minusie_za_zgoda_i_bez_zgody():
    d = dane_domyslne()
    u, wyniki = bk.ustawienia(d), {}
    for zgoda in (True, False):
        f = Firma(nazwa="A", gotowka=0, bank="Soplicowo", debet_wlaczony=zgoda)
        f.gotowka = -2000.0
        ks, rach = Ksiega(), Rachunek()
        wyrownaj_gotowke(f, rach)
        assert f.debet == 2000
        _tydzien(f, ks, rach, d)
        wyniki[zgoda] = -sum(o["kwota"] for o in rach.operacje if o["rodzaj"] == "kpir")
        opisy = " ".join(o["opis"] for o in rach.operacje)
        assert ("Opłata za tydzień na minusie" in opisy) == zgoda
        assert ("niedozwolone saldo" in opisy) == (not zgoda)
    assert wyniki[False] > wyniki[True] + 50
    assert u["oplata_debet_bez_zgody"] > 0


def test_debet_w_rozegranej_grze_oplata_tylko_przy_minusie_na_koniec_tygodnia():
    strategie = list(dane_domyslne().boty["strategie"])
    g = Gra.nowa("deb", [(n, n) for n in strategie], 10, 7, poziomy={n: "latwy" for n in strategie})
    for _ in range(10):
        s = g.przelicz(wymus=True)
    z_debetem = 0
    for r in range(1, 11):
        for n, w in s.wyniki[r].items():
            opisy = " ".join(p["opis"] for p in w["kpir"]["pozycje"])
            if w["debet"] <= 0:
                assert "tydzień na minusie" not in opisy and "niedozwolone" not in opisy and "od debetu" not in opisy, (r, n)
            else:
                z_debetem += 1
                assert ("tydzień na minusie" in opisy or "niedozwolone saldo" in opisy), (r, n)
    assert z_debetem > 0   # w tej grze (agresywny na łatwym) debet na koniec tygodnia naprawdę się zdarza


def test_pomylki_bolą_mniej_niz_kolejka_i_firmy_nie_schodza_ponizej_2_5_gwiazdki():
    d = dane_domyslne()
    o = d.mapa["klienci"]["opinie"]
    assert o["pomylki"] < o["kolejka"]
    strategie = ["zrownowazony", "premium"]
    g = Gra.nowa("pom", [(n, n) for n in strategie], 8, 7, poziomy={n: "sredni" for n in strategie})
    for _ in range(8):
        s = g.przelicz(wymus=True)
    udzialy, oceny, powody = {n: [] for n in strategie}, [], []
    for r in range(2, 9):
        for n in strategie:
            w = s.wyniki[r][n]
            sp = w["sprzedaz"].values()
            k = sum(v["sprzedaz"] for v in sp)
            if k > 50:
                udzialy[n].append(sum(v["pomylki"] for v in sp) / k)
            for ocena in (w.get("opinie") or {}).values():
                oceny.append(ocena["ocena"])
                powody.append(ocena["powody"]["pomylki"])
    assert st.mean(udzialy["premium"]) < 0.06          # dobrze obsadzona firma: kilka procent
    assert max(max(v) for v in udzialy.values()) < 0.2
    assert min(powody) > -0.6 and st.mean(oceny) >= 2.5   # same pomyłki nie zbijają oceny lokalu


def test_scrooge_swieto_w_ostatniej_rundzie_rozlicza_przeniesione(monkeypatch):
    d = dane_domyslne()
    monkeypatch.setattr(bo, "swieto_w_rundzie", lambda dane, runda: True)
    doplata = bo.biura(d)["scrooge"]["zamkniete_w_swieta"]["doplata"]

    zwykla = Firma(nazwa="A", biuro="scrooge", dokumenty_przeniesione=20)   # nie ostatnia: dokumenty czekają dalej
    o = bo.nalicz(d, zwykla, Ksiega(), Rachunek(), 2, 0, 5)
    assert o["zamkniete"] and zwykla.dokumenty_przeniesione > 20

    ostatnia = Firma(nazwa="A", biuro="scrooge", dokumenty_przeniesione=20)
    ks = Ksiega()
    o = bo.nalicz(d, ostatnia, ks, Rachunek(), 2, 0, 12, ostatnia=True)
    assert not o["zamkniete"] and ostatnia.dokumenty_przeniesione == 0       # nic nie przepada
    assert o["za_swieta"] >= 20 * doplata and o["dokumenty"] >= 20


def test_firma_bezczynna_ma_najwyzej_100_punktow_w_tygodniu():
    g = _gra(("Bez", None), ("Bot", "zrownowazony"), rund=6)
    for _ in range(6):
        s = g.przelicz(wymus=True)
    for r in range(2, 7):
        assert s.wyniki[r]["Bez"]["karta"]["punkty"] <= 100, r
        assert s.wyniki[r]["Bot"]["karta"]["punkty"] > 200 or r == 2
    assert s.wyniki[6]["Bez"]["karta"]["dzialy"]["bezpieczenstwo"]["punkty"] == pytest.approx(0)
