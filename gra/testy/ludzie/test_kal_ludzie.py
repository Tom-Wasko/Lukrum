"""Kalibracja B9/B10 (decyzje autora 7.11.2026): kandydat odrzuca za niską ofertę, pensja poniżej oczekiwanej trwale
obniża zadowolenie, boty płacą co najmniej próg i podkupują niedopłacanych, szkolenie działa 4 tygodnie, a zadowolenie
zmienia tempo pracy. Każda mechanika ma wyłącznik w zalozenia.yaml (pracownicy.*.wlaczone)."""
import math

import pytest
from pomocnicze import _gra, _lokal, _rachunek, _runda, _z

from silnik import boty
from silnik.dane import KUCHNIA
from silnik.gra import Gra
from silnik.ludzie import formy as fz
from silnik.ludzie import rynek_pracy as rp
from silnik.ludzie import szkolenia as szk
from silnik.ludzie import zadowolenie as zo
from silnik.model import Szkolenie

pytestmark = pytest.mark.dane_gry


def _bledy_zakladki(s, r, firma, zakladka):
    return [b["tekst"] for b in s.wyniki[r][firma]["lista_bledow"] if b["zakladka"] == zakladka]


def _wylacz(monkeypatch, dane, mechanika):
    monkeypatch.setitem(dane.z["pracownicy"][mechanika], "wlaczone", False)


def _kucharz(dane, s, pomin=()):
    """Kucharz (nie student), któremu 90% preferowanej to wciąż co najmniej płaca minimalna."""
    minimum = dane.z["finanse"]["placa_minimalna"]
    return next(k for k in s.kandydaci if k["zawod"] == "Kucharz" and not k.get("student") and k["id"] not in pomin
                and k["pensja_preferowana"] * 0.9 >= minimum)


def _start(*firmy):
    g = _gra(*(firmy or (("A", None), ("B", None))))
    s = _runda(g, A={**_lokal("centrum_3"), "stanowiska": {"kuchnia": 3}}, B={**_lokal("dworzec_1")})
    return g, s


# --- B9a: odrzucanie niskich ofert i kara za pensję poniżej oczekiwanej -------------------------------------------

def test_kandydat_odrzuca_oferte_ponizej_progu(monkeypatch):
    g, s = _start()
    d = g.dane
    k = _kucharz(d, s)
    prog = fz.prog_oferty(d, k, fz.PRACE)
    assert prog == pytest.approx(d.z["pracownicy"]["oferta_pracy"]["prog_odrzucenia"] * k["pensja_preferowana"])
    s = _runda(g, A={"zatrudnij": [{**_z(k, 1), "pensja": math.floor(prog) - 1}]})
    assert k["id"] not in s.firmy["A"].pracownicy
    assert any(x["id"] == k["id"] for x in s.kandydaci)   # zostaje w puli
    tekst = _bledy_zakladki(s, 2, "A", "zatrudnienie")
    assert any("odrzuca ofertę" in t and f"{math.ceil(prog)} zł" in t for t in tekst)
    odrz = s.wyniki[2]["A"]["rynek_pracy"]["odrzucone"]
    assert odrz and odrz[0]["kandydat"] == k["id"] and odrz[0]["prog"] == pytest.approx(prog, abs=0.01)


def test_wylaczone_odrzucanie_przyjmuje_niska_oferte(monkeypatch):
    g, s = _start()
    _wylacz(monkeypatch, g.dane, "oferta_pracy")
    k = _kucharz(g.dane, s)
    assert fz.prog_oferty(g.dane, k, fz.PRACE) == 0
    s = _runda(g, A={"zatrudnij": [{**_z(k, 1), "pensja": round(k["pensja_preferowana"] * 0.9)}]})
    assert k["id"] in s.firmy["A"].pracownicy


def test_oferta_miedzy_progiem_a_oczekiwana_trwale_obniza_zadowolenie(monkeypatch):
    g, s = _start()
    d = g.dane
    k = _kucharz(d, s)
    s = _runda(g, A={"zatrudnij": [{**_z(k, 1), "pensja": math.ceil(fz.prog_oferty(d, k, fz.PRACE))}]})
    p = s.firmy["A"].pracownicy[k["id"]]
    p.cecha = ""
    pw = zo.placa_wzgledna(d, p)
    assert 0.95 <= pw < 1
    z_kara = zo.skladniki(d, s.firmy["A"], p, 0.5, 0.0)["placa"]
    kara = d.z["pracownicy"]["oferta_pracy"]["kara_ponizej_oczekiwanej"]
    nachylenie = d.z["karta_wynikow"]["zadowolenie_pracownikow"]["placa_wzgledem_preferowanej"]
    assert z_kara == pytest.approx(nachylenie * (pw - 1) - kara * (1 - pw))
    s = _runda(g)   # kilka tygodni później kara wciąż ta sama (zależy od pensji, nie od czasu)
    assert zo.skladniki(d, s.firmy["A"], s.firmy["A"].pracownicy[k["id"]], 0.5, 0.0)["placa"] == pytest.approx(z_kara)
    p.pensja = p.pensja_preferowana * 1.05   # powyżej oczekiwanej – bez dodatkowej kary
    assert zo.skladniki(d, s.firmy["A"], p, 0.5, 0.0)["placa"] == pytest.approx(nachylenie * 0.05)
    p.pensja = math.ceil(fz.prog_oferty(d, k, fz.PRACE))
    _wylacz(monkeypatch, d, "oferta_pracy")
    assert zo.skladniki(d, s.firmy["A"], p, 0.5, 0.0)["placa"] == pytest.approx(nachylenie * (pw - 1))


def test_licytacja_oferta_ponizej_progu_sie_nie_liczy(monkeypatch):
    g = Gra.nowa("t", [("A", None), ("B", "zrownowazony")], 8, 1)
    s = g.stan(0)
    d = g.dane
    k = _kucharz(d, s)
    niska = {"kandydat": k["id"], "pensja": round(k["pensja_preferowana"] * 0.9)}
    bot = {"kandydat": k["id"], "pensja": k["pensja_preferowana"], "zastepca": True}
    decyzje = {"A": {"zatrudnij": [niska]}, "B": {"zatrudnij": [bot]}}
    _, rez, _ = rp.przed_decyzjami(d, s, decyzje, 1, 1, podglad=True)
    assert rez[k["id"]] == "B"   # drużyna wygrywa z botem (sprawa 6) – ale tylko ofertą, którą kandydat przyjmie
    _wylacz(monkeypatch, d, "oferta_pracy")
    _, rez, _ = rp.przed_decyzjami(d, s, decyzje, 1, 1, podglad=True)
    assert rez[k["id"]] == "A"


def test_zastepca_bota_dostaje_co_najmniej_prog():
    g, s = _start()
    d = g.dane
    k = _kucharz(d, s)
    s = _runda(g, A={"zatrudnij": [{**_z(k, 1), "pensja": round(k["pensja_preferowana"] * 0.9), "zastepca": True}]})
    assert s.firmy["A"].pracownicy[k["id"]].pensja == math.ceil(fz.prog_oferty(d, k, fz.PRACE))


def test_bot_oferuje_co_najmniej_prog(monkeypatch):
    g, s = _start()
    d = g.dane
    minimum = d.z["finanse"]["placa_minimalna"]
    k = _kucharz(d, s)
    prog = math.ceil(fz.prog_oferty(d, k, fz.PRACE))
    assert boty._pensja(d, {"pensja": 0.8}, k) == max(minimum, prog)
    assert boty._pensja(d, {"pensja": "minimalna"}, k) == max(minimum, prog)
    assert boty._pensja(d, {"pensja": 1.1}, k) == round(1.1 * k["pensja_preferowana"])
    # pensja minimalna: bot wybiera kandydatów, którym minimalna wystarcza (gdy tacy są)
    tani = boty._dla_minimalnej(d, {"pensja": "minimalna"}, s.kandydaci)
    assert all(fz.prog_oferty(d, x, fz.PRACE) <= minimum for x in tani) and len(tani) < len(s.kandydaci)
    _wylacz(monkeypatch, d, "oferta_pracy")
    assert boty._pensja(d, {"pensja": 0.8}, k) == max(minimum, round(0.8 * k["pensja_preferowana"]))
    assert boty._pensja(d, {"pensja": "minimalna"}, k) == minimum
    assert boty._dla_minimalnej(d, {"pensja": "minimalna"}, s.kandydaci) == s.kandydaci


# --- B9b: przebicie oferty podkupienia i boty podkupujące niedopłacanych -------------------------------------------

def _zatrudniony(pensja_wzgledna=None, bot_b=None):
    """A zatrudnia kucharza (pensja × preferowana) w rundzie 2; zwraca (gra, stan po rundzie 3, pracownik)."""
    g, s = _start(("A", None), ("B", bot_b))
    k = _kucharz(g.dane, s)
    pensja = math.ceil(k["pensja_preferowana"] * pensja_wzgledna) if pensja_wzgledna else k["pensja_preferowana"]
    _runda(g, A={"zatrudnij": [{**_z(k, 1), "pensja": pensja}]})
    s = _runda(g)
    return g, s, s.firmy["A"].pracownicy[k["id"]]


@pytest.mark.parametrize("wlaczone, o_ile, odchodzi", [(True, 1.03, False), (True, 1.06, True), (False, 1.03, True)])
def test_oferta_podkupienia_musi_przebic_pensje(monkeypatch, wlaczone, o_ile, odchodzi):
    g, s, p = _zatrudniony()
    if not wlaczone:
        _wylacz(monkeypatch, g.dane, "podkupywanie_botow")
    assert rp.przebicie(g.dane) == (0.05 if wlaczone else 0)
    s = _runda(g, B={"podkup": [{"pracownik": p.id, "firma": "A", "pensja": round(p.pensja * o_ile)}]})
    assert bool(s.firmy["A"].pracownicy[p.id].odchodzi) == odchodzi
    uwagi = s.wyniki[4]["A"]["rynek_pracy"]["uwagi"]
    assert any(f"{p.imie_nazwisko} przyjmuje ofertę firmy B" in t for t in uwagi) == odchodzi   # gracz wie, kto


def test_kontroferta_wygrywa_gdy_oferta_nie_przebija_jej_o_prog():
    g, s, p = _zatrudniony()
    oferta = round(p.pensja * 1.08)
    kontra = round(oferta / 1.04)   # oferta wyższa od kontroferty o mniej niż przebicie (5%)
    s = _runda(g, B={"podkup": [{"pracownik": p.id, "firma": "A", "pensja": oferta}]},
               A={"kontroferty": {p.id: kontra}})
    q = s.firmy["A"].pracownicy[p.id]
    assert q.odchodzi is None and q.pensja == kontra


def _oferta_bota(g, s, runda=4, nazwa="B"):
    cele = [(KUCHNIA, 1, "Kucharz")]
    return boty._podkup(g.dane, s, nazwa, cele, boty.poziom(g.dane, g.konfiguracja, nazwa), g.konfiguracja, runda)


def test_bot_podkupuje_niedoplacona_osobe_druzyny(monkeypatch):
    g, s, p = _zatrudniony(0.96, bot_b="zrownowazony")
    p.odchodzi = None   # przy 96% oczekiwanej (kara 1,0, poprawki 3) osoba sama wypowiada – tu liczy się sama oferta bota
    u = g.dane.z["pracownicy"]["podkupywanie_botow"]
    assert zo.placa_wzgledna(g.dane, p) < u["placa_ponizej"]
    oferty, reszta = _oferta_bota(g, s)
    minimum = g.dane.z["finanse"]["placa_minimalna"]
    assert oferty == [{"pracownik": p.id, "firma": "A", "pensja": max(minimum, math.ceil(p.pensja * u["oferta"])),
                       "umowa": fz.PRACE}]
    assert reszta == []   # stanowisko czeka na podkupioną osobę – bot nie zatrudnia na nie z puli
    assert oferty[0]["pensja"] > p.pensja * (1 + u["przebicie"])   # oferta przebija pensję, więc osoba odejdzie
    # przed rundą headhuntera, bez opcji MG, na poziomie bez podkupywania i po wyłączeniu – nic
    assert _oferta_bota(g, s, runda=rp.kanaly(g.dane, 1)[rp.HEADHUNTER]["od_rundy"] - 1)[0] == []
    monkeypatch.setitem(g.konfiguracja, "podkupywanie", False)
    assert _oferta_bota(g, s)[0] == []
    monkeypatch.delitem(g.konfiguracja, "podkupywanie")
    latwy = boty.poziom(g.dane, {"firmy": [{"nazwa": "B", "poziom": "latwy"}]}, "B")
    assert boty._podkup(g.dane, s, "B", [(KUCHNIA, 1, "Kucharz")], latwy, g.konfiguracja, 4)[0] == []
    _wylacz(monkeypatch, g.dane, "podkupywanie_botow")
    assert _oferta_bota(g, s)[0] == []


def test_bot_nie_podkupuje_dobrze_oplaconych_ani_innych_botow(monkeypatch):
    g, s, p = _zatrudniony(bot_b="zrownowazony")
    assert zo.placa_wzgledna(g.dane, p) == pytest.approx(1.0)
    p.zadowolenie = 0.95
    assert _oferta_bota(g, s)[0] == []
    p.zadowolenie = 0.85   # przepracowana albo źle traktowana – też otwarta na oferty
    assert _oferta_bota(g, s)[0]
    p.zadowolenie, p.pensja = 0.95, math.ceil(p.pensja_preferowana * 0.96)
    s.firmy["A"].bot = "tani"   # osoba u bota – domyślnie (od_botow: false) bot jej nie podkupuje
    assert _oferta_bota(g, s)[0] == []
    monkeypatch.setitem(g.dane.z["pracownicy"]["podkupywanie_botow"], "od_botow", True)
    assert _oferta_bota(g, s)[0]


def test_stanowisko_czeka_na_podkupiona_osobe():
    g, s, p = _zatrudniony(bot_b="zrownowazony")
    cele = [(KUCHNIA, 1, "Kucharz"), (KUCHNIA, 2, "Kucharz"), ("kasa", 1, "Kasjer")]
    assert boty._bez_czekajacych(cele, boty._w_drodze(s, "B")) == cele
    from silnik.model import Odejscie
    p.odchodzi = Odejscie(do="B", runda=6, pensja=p.pensja, umowa=fz.PRACE, od_rundy=4)
    assert boty._w_drodze(s, "B") == {"Kucharz": 1}
    assert boty._bez_czekajacych(cele, {"Kucharz": 1}) == [(KUCHNIA, 1, "Kucharz"), ("kasa", 1, "Kasjer")]


# --- szkolenia na 4 tygodnie ------------------------------------------------------------------------------------

def _szkolenie(g):
    oferta = g.dane.katalog_ofert["szkolenia"]
    return oferta["firmy"][0]["nazwa"], oferta["pozycje"][0]


def test_szkolenie_cena_raz_dziala_cztery_tygodnie():
    g = _gra(("A", None), ("B", None), odblokowanie={"hr_szkolenia": 2})
    firma, poz = _szkolenie(g)
    rund = szk.rund(g.dane)
    assert rund == g.dane.z["pracownicy"]["szkolenia"]["tygodni"] == 4
    _runda(g, A={**_lokal("centrum_3")}, B={**_lokal("dworzec_1")})
    kup = {"szkolenia": [{"firma": firma, "szkolenie": poz["nazwa"]}]}
    s = _runda(g, A=kup)
    assert -sum(_rachunek(s, 2, "A", f"Szkolenie w firmie: {firma}")) == pytest.approx(poz["ceny"][0])
    assert s.wyniki[2]["A"]["szkolenia"][0]["do_rundy"] == 2 + rund - 1
    for r in range(3, 2 + rund):   # trwa: ponowny zakup odrzucony (bez opłaty, z ostrzeżeniem)
        s = _runda(g, A=kup)
        assert not _rachunek(s, r, "A", "Szkolenie w firmie")
        assert [x["szkolenie"] for x in s.wyniki[r]["A"]["szkolenia_aktywne"]] == [poz["nazwa"]]
        assert any("jeszcze trwa" in t for t in _bledy_zakladki(s, r, "A", "szkolenia"))
    s = _runda(g)   # po czterech tygodniach – już nie działa
    assert s.wyniki[2 + rund]["A"]["szkolenia_aktywne"] == []
    s = _runda(g, A=kup)
    assert -sum(_rachunek(s, 3 + rund, "A", "Szkolenie w firmie")) == pytest.approx(poz["ceny"][0])


def test_szkolenie_dziala_na_zadowolenie_przez_cztery_tygodnie(monkeypatch):
    g = _gra(("A", None), ("B", None), odblokowanie={"hr_szkolenia": 2})
    firma, poz = _szkolenie(g)
    procenty = []
    monkeypatch.setattr(zo, "po_rundzie", lambda dane, f, w, r, ziarno, sp: procenty.append((f.nazwa, r, sp)) or None)
    _runda(g, A={**_lokal("centrum_3")}, B={**_lokal("dworzec_1")})
    _runda(g, A={"szkolenia": [{"firma": firma, "szkolenie": poz["nazwa"]}]})
    for _ in range(4):
        _runda(g)
    a = {r: sp for n, r, sp in procenty if n == "A"}
    assert [a[r] for r in range(2, 7)] == pytest.approx([poz["procent"] / 100] * 4 + [0.0])


def test_bot_nie_kupuje_trwajacego_szkolenia():
    g = Gra.nowa("t", [("A", "zrownowazony"), ("B", "tani")], 14, 5)
    for _ in range(14):
        s = g.przelicz(wymus=True)
    zakupy = [r for r in range(1, 15) if s.wyniki[r]["A"]["szkolenia"]]
    assert zakupy and all(b - a >= szk.rund(g.dane) for a, b in zip(zakupy, zakupy[1:]))


# --- poprawki 3 (sprawa 8): 12 → 8 szkoleń; dawne nazwy ze starych zapisów -------------------------------------------

def _polaczone(g):
    oferta = g.dane.katalog_ofert["szkolenia"]
    p = next(p for p in oferta["pozycje"] if len(p.get("dawne", [])) >= 2)
    return oferta["firmy"][0]["nazwa"], p


def test_dawna_nazwa_szkolenia_to_polaczone_szkolenie_a_nieznana_jest_pomijana():
    g = _gra(("A", None), ("B", None), odblokowanie={"hr_szkolenia": 2})
    firma, p = _polaczone(g)
    _runda(g, A={**_lokal("centrum_3")}, B={**_lokal("dworzec_1")})
    s = _runda(g, A={"szkolenia": [{"firma": firma, "szkolenie": p["dawne"][0]},
                                   {"firma": firma, "szkolenie": p["dawne"][1]},   # to samo połączone – drugi raz nie
                                   {"firma": firma, "szkolenie": "Szkolenie, którego nie ma"}]})
    assert [x["szkolenie"] for x in s.wyniki[2]["A"]["szkolenia"]] == [p["nazwa"]]
    assert -sum(_rachunek(s, 2, "A", f"Szkolenie w firmie: {firma}")) == pytest.approx(p["ceny"][0])


def test_trwajace_szkolenie_o_dawnej_nazwie_to_trwajace_polaczone():
    g = _gra(("A", None), ("B", None), odblokowanie={"hr_szkolenia": 2})
    firma, p = _polaczone(g)
    f = _runda(g, A={**_lokal("centrum_3")}, B={**_lokal("dworzec_1")}).firmy["A"]
    f.szkolenia = [Szkolenie(szkolenie=p["dawne"][1], firma=firma, procent=60, od_rundy=1, do_rundy=3)]   # stary zapis
    assert szk.trwa(f, p["nazwa"], 2, p["dawne"]) is f.szkolenia[0]
    assert szk.trwa(f, p["nazwa"], 2) is None and szk.trwa(f, p["nazwa"], 4, p["dawne"]) is None
    assert szk.procent(f, 2) == pytest.approx(0.6)   # dawne szkolenie nadal liczy się do zadowolenia
    assert szk.pozycja(g.dane.katalog_ofert["szkolenia"], p["dawne"][1]) is p
    assert szk.pozycja(g.dane.katalog_ofert["szkolenia"], "Szkolenie, którego nie ma") is None


# --- B10: tempo pracy z zadowolenia -----------------------------------------------------------------------------

@pytest.mark.parametrize("zadowolenie, mnoznik", [(None, 1.0), (0.97, 1.05), (0.95, 1.0), (0.92, 1.0), (0.9, 1.0),
                                                  (0.85, 0.95)])
def test_tempo_z_zadowolenia(zadowolenie, mnoznik):
    g, s = _start()
    k = _kucharz(g.dane, s)
    s = _runda(g, A={"zatrudnij": [_z(k, 1)]})
    f = s.firmy["A"]
    p = f.pracownicy[k["id"]]
    p.zadowolenie = zadowolenie
    assert zo.tempo(g.dane, p) == pytest.approx(mnoznik)
    st = f.stanowisko(KUCHNIA, 1)
    godz = g.dane.z["operacje"]["godziny_pracownika"]
    p.zadowolenie = None
    baza = f.godziny_stanowiska(st, godz, g.dane)
    p.zadowolenie = zadowolenie
    assert f.godziny_stanowiska(st, godz, g.dane) == pytest.approx(baza * mnoznik)


def test_tempo_wylaczone(monkeypatch):
    g, s = _start()
    k = _kucharz(g.dane, s)
    p = _runda(g, A={"zatrudnij": [_z(k, 1)]}).firmy["A"].pracownicy[k["id"]]
    _wylacz(monkeypatch, g.dane, "wydajnosc_z_zadowolenia")
    p.zadowolenie = 0.99
    assert zo.tempo(g.dane, p) == 1.0
