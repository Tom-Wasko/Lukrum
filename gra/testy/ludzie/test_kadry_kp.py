"""Kadry według Kodeksu pracy (tor A): płace z rynku Lublina 2026, okres wypowiedzenia zależny od stażu
(art. 34 i 36 KP, w tygodniach gry), brak odprawy, urlop na umowie o pracę, koszt rekrutacji jako część pensji."""

import pytest
from pomocnicze import _gra, _kandydat, _lokal, _runda, _z

from silnik.dane import dane_domyslne
from silnik.ludzie import formy as fz
from silnik.ludzie import kandydaci as kd
from silnik.ludzie import rynek_pracy as rp
from silnik.model import Pracownik

pytestmark = pytest.mark.dane_gry


def _osoba(umowa="prace", od_rundy=1):
    return Pracownik(id="x", imie_nazwisko="Jan Kowalski", zawod="Kucharz", gwiazdki=2, pensja_preferowana_gr=500000,
                     koszt_rekrutacji_gr=0, zadowolenie_klientow=0.9, ryzyko_pomylki=0.05, pensja=5400,
                     umowa=umowa, od_rundy=od_rundy)


def test_okres_wypowiedzenia_zalezy_od_stazu():
    d = dane_domyslne()
    # art. 34 (okres próbny do 3 mies. – tydzień), art. 36 §1: <6 mies. – 2 tyg., ≥6 mies. – miesiąc, ≥3 lat – 3 mies.
    wynik = {staz: rp.okres_wypowiedzenia(d, _osoba(od_rundy=1), 1 + staz) for staz in (0, 12, 13, 25, 26, 155, 156)}
    assert wynik == {0: 1, 12: 1, 13: 2, 25: 2, 26: 4, 155: 4, 156: 13}
    for umowa in ("zlecenie", "student", "b2b", "staz"):
        assert rp.okres_wypowiedzenia(d, _osoba(umowa), 30) == 0   # bez wypowiedzenia


def test_zwolnienie_bez_odprawy_pracuje_do_konca_wypowiedzenia():
    g = _gra(("A", None), ("B", None))
    s = _runda(g, A={**_lokal("centrum_3"), "stanowiska": {"kuchnia": 2}}, B=_lokal("dworzec_1"))
    k = _kandydat(s, 1)
    s = _runda(g, A={"zatrudnij": [_z(k, 1)]})
    r = s.runda + 1
    s = _runda(g, A={"zwolnij": [k["id"]]})
    assert not [p for p in s.wyniki[r]["A"]["kpir"]["pozycje"] if p["opis"].startswith("Koszt zwolnienia")]
    o = s.firmy["A"].pracownicy[k["id"]].odchodzi
    assert o and o.runda == r + 1   # okres próbny: tydzień wypowiedzenia


def test_kandydat_nie_ma_odprawy_a_koszt_rekrutacji_to_czesc_pensji():
    d = dane_domyslne()
    los = d.rynek_pracy["losowanie"]
    od, do = los["koszt_rekrutacji_czesc_pensji"]
    assert "odprawa_czesc_pensji" not in los and 0 < od < do < 0.2
    pula = kd.pula_startowa(d, 11)
    assert pula and all("koszt_odprawy" not in k for k in pula)
    for k in pula:
        assert od * k["pensja_preferowana"] - 10 <= k["koszt_rekrutacji"] <= do * k["pensja_preferowana"] + 10, k


def test_pensje_kandydatow_z_ofert_lublina_2026():
    d = dane_domyslne()
    minimalna = d.z["finanse"]["placa_minimalna"]
    wg = d.rynek_pracy["losowanie"]["wg_gwiazdek"]
    assert wg["1"]["pensja"][0] == minimalna   # najsłabsi zaczynają od płacy minimalnej (4 806 zł w 2026)
    assert wg["1"]["pensja"][1] <= wg["2"]["pensja"][0] and wg["2"]["pensja"][1] <= wg["3"]["pensja"][0]
    assert 5400 <= wg["2"]["pensja"][0] and wg["3"]["pensja"][1] <= 6900   # kucharz w Lublinie: 5 400–6 800 zł brutto
    assert all(k["pensja_preferowana"] >= minimalna for k in d.rynek_pracy["znani"])


def test_umowa_o_prace_ma_urlop_a_zlecenie_nie():
    d = dane_domyslne()
    assert fz.forma(d, "prace")["urlop"] == 0.1 and fz.forma(d, "zlecenie").get("urlop", 0) == 0
    assert fz.etat(d, _osoba("prace")) == pytest.approx(0.9)
    assert fz.etat(d, _osoba("zlecenie")) == 1.0
    assert fz.forma(d, "zlecenie")["wypowiedzenie"] is False and fz.forma(d, "prace")["wypowiedzenie"] is True


def test_cennik_stanowisk_i_ogloszenia():
    d = dane_domyslne()
    pak = d.katalog_ofert["stanowiska"]["pakiety"]
    assert pak["1"] == 1200 and all(pak[str(i + 1)] > pak[str(i)] for i in range(1, 5))
    assert all(pak[str(i)] / i < pak["1"] for i in range(2, 6))   # kolejne stanowiska są tańsze od pierwszego
    assert rp.ustawienia(d)["kanaly"]["pracuj"]["oplata"] == 400
