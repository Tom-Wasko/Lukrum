"""Poprawki 2 (sprawa 6): zatrudnianie „kto pierwszy, ten lepszy” i opcja MG `podkupywanie`.

- kontrola przy zapisie (silnik/na_zywo.py) odrzuca nowe zatrudnienie kandydata ze szkicu innej drużyny ludzi;
- silnik (stare zapisy, boty): drużyna ludzi wygrywa z botem, między ludźmi – wyższa pensja;
- boty nie biorą kandydatów ze szkiców ludzi;
- przy wyłączonym podkupywaniu: zapis oferty odrzucony, silnik ją pomija, brak ostrzeżeń."""
import pytest
from pomocnicze import _gra, _kandydat, _lokal, _runda, _z

from silnik import boty
from silnik import na_zywo as nz
from silnik.gra import Gra
from silnik.ludzie import rynek_pracy as rp

KONF = {"firmy": [{"nazwa": "A", "bot": None}, {"nazwa": "B", "bot": None}, {"nazwa": "Bot", "bot": "tani"}]}


def test_zajeci_ze_szkicow_innych_druzyn():
    szkice = {"A": {"zatrudnij": [{"kandydat": "k1"}]}, "B": {"zatrudnij": [{"kandydat": "k1"}, {"kandydat": "k2"}]},
              "Bot": {"zatrudnij": [{"kandydat": "k3"}]}, "_wyslane": ["A"]}
    assert rp.zajeci(szkice, "C") == {"k1": "A", "k2": "B", "k3": "Bot"}
    assert rp.zajeci(szkice, "A", rp.boty(KONF)) == {"k1": "B", "k2": "B"}


def test_kontrola_kto_pierwszy_ten_lepszy():
    szkice = {"A": {"nazwa": "Kebab Ali", "zatrudnij": [{"kandydat": "k1", "imie_nazwisko": "Ala Kot"}]},
              "Bot": {"zatrudnij": [{"kandydat": "k2"}]}}
    nowe = {"zatrudnij": [{"kandydat": "k1"}]}
    bledy = nz.sprawdz_zapis(None, szkice, "B", nowe, {}, 2, KONF)
    assert len(bledy) == 1 and "Ala Kot" in bledy[0] and "Kebab Ali" in bledy[0]
    # kandydat już w poprzednim szkicu drużyny (stary zapis) – zapis innych zmian przechodzi
    assert nz.sprawdz_zapis(None, szkice, "B", nowe, nowe, 2, KONF) == []
    # kandydat w szkicu bota – drużyna ludzi i tak go dostanie
    assert nz.sprawdz_zapis(None, szkice, "B", {"zatrudnij": [{"kandydat": "k2"}]}, {}, 2, KONF) == []
    # własny szkic drużyny A nie blokuje jej samej; wycofanie zwalnia kandydata
    assert nz.sprawdz_zapis(None, szkice, "A", szkice["A"], {}, 2, KONF) == []
    assert nz.sprawdz_zapis(None, {**szkice, "A": {}}, "B", nowe, {}, 2, KONF) == []


def test_kontrola_podkupywania_wylaczonego_przez_mg():
    oferta = {"podkup": [{"pracownik": "p1", "firma": "A", "pensja": 6000}]}
    assert nz.sprawdz_zapis(None, {}, "B", oferta, {}, 3, KONF) == []
    assert rp.podkupywanie(KONF) and rp.podkupywanie({}) and not rp.podkupywanie({"podkupywanie": False})
    bledy = nz.sprawdz_zapis(None, {}, "B", oferta, {}, 3, {**KONF, "podkupywanie": False})
    assert bledy and "podkupywanie" in bledy[0]
    assert nz.sprawdz_zapis(None, {}, "B", oferta, oferta, 3, {**KONF, "podkupywanie": False}) == []


def test_druzyna_ludzi_wygrywa_z_botem():
    """Zapasowe rozstrzygnięcie silnika (stare zapisy, boty): drużyna ludzi przed botem, choć bot płaci więcej."""
    g = _gra(("A", None), ("B", "tani"))
    s = _runda(g, A={**_lokal("centrum_3"), "stanowiska": {"kuchnia": 3}},
               B={**_lokal("dworzec_1"), "stanowiska": {"kuchnia": 3}})
    k = _kandydat(s, 3)
    s = _runda(g, A={"zatrudnij": [_z(k, 1, pensja=5000)]}, B={"zatrudnij": [_z(k, 1, pensja=6000)]})
    assert k["id"] in s.firmy["A"].pracownicy and k["id"] not in s.firmy["B"].pracownicy
    lic = s.wyniki[2]["B"]["rynek_pracy"]["licytacje"][0]
    assert lic["wygral"] == "A" and not lic["wygrana"]


@pytest.mark.dane_gry
def test_bot_nie_bierze_kandydata_ze_szkicu_ludzi():
    g = Gra.nowa("t", [("H", None), ("A", "zrownowazony")], 12, 5)
    zwykle = boty.decyzje_bota(g.dane, g.stan(0), "A", "zrownowazony", 1, g.konfiguracja)["zatrudnij"]
    assert zwykle
    zajety = zwykle[0]["kandydat"]
    g.ustaw_decyzje("H", {"zatrudnij": [{"kandydat": zajety, "typ": "kuchnia", "nr": 1}]})
    g.przelicz(wymus=True)
    assert zajety not in {z["kandydat"] for z in g.decyzje[1]["A"]["zatrudnij"]}
    assert len(g.decyzje[1]["A"]["zatrudnij"]) == len(zwykle)   # bot wziął kogoś innego


def test_podkupywanie_wylaczone_silnik_pomija_oferty():
    g = _gra(("A", None), ("B", None), podkupywanie=False)
    _runda(g, A={**_lokal("centrum_3"), "stanowiska": {"kuchnia": 3}},
           B={**_lokal("dworzec_1"), "stanowiska": {"kuchnia": 3}})
    k = _kandydat(g.stan(), 1)
    _runda(g, A={"zatrudnij": [_z(k, 1)]})
    _runda(g)
    oferta = {"pracownik": k["id"], "firma": "A", "pensja": 9000, "umowa": "prace"}
    s = _runda(g, B={"podkup": [oferta]})
    assert s.firmy["A"].pracownicy[k["id"]].odchodzi is None
    rpb = s.wyniki[4]["B"]["rynek_pracy"]
    assert not rpb["oferty_zlozone"] and any("wyłączył podkupywanie" in u for u in rpb["uwagi"])
