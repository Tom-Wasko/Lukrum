"""Katalogi toru A: wyposażenie i udogodnienia dla kebaba, szkolenia z własnych firm, media z lektur."""
import pytest

from silnik.dane import dane_domyslne

pytestmark = pytest.mark.dane_gry


def test_wyposazenie_dla_kebaba_ma_ceny_i_sklepy():
    poz = {p["nazwa"]: p for p in dane_domyslne().katalog_ofert["wyposazenie"]["pozycje"]}
    for n in ("Ogródek z parasolami", "Ładowarki do telefonów przy stolikach", "Płatności BLIK i kodem QR", "Kiosk do zamówień",
              "Muzyka w lokalu (licencja)", "Toaleta dla gości", "Dostawa przez aplikację"):
        assert n in poz and 0 < poz[n]["procent"] <= 100, n
    assert poz["Płatności BLIK i kodem QR"]["cena"] == 0 and poz["Dostawa przez aplikację"]["utrzymanie"] > 0
    assert all(p.get("sklep") in (None, "IKEA", "Leroy Merlin") for p in poz.values())


def test_szkolenia_maja_wlasne_firmy_i_ceny():
    s = dane_domyslne().katalog_ofert["szkolenia"]
    assert [f["nazwa"] for f in s["firmy"]] == ["Lubelska Szkoła Kebabu", "Rożen i Rozum", "HACCP w Pięć Minut"]
    assert all(len(p["ceny"]) == 3 and 600 <= min(p["ceny"]) and max(p["ceny"]) <= 2500 for p in s["pozycje"])


def test_media_z_lektur_w_reklamie():
    ag = dane_domyslne().mapa["reklama"]["agencje"]
    assert "Gazecie Pana Cogito" in ag["papier_przyjmie"]["kanaly"]["gazeta"]["nazwa"]
    assert "Radiu Tichy" in ag["fala_koziolka"]["kanaly"]["radio"]["nazwa"]
