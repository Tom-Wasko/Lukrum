"""Prowadzenie gry przez mistrza gry: harmonogram zamykania rund, pauza, wgląd w drużyny tylko do
odczytu, poziom botów, eksport wyników do arkusza, alarm debetu i inwestor ratunkowy."""

from datetime import datetime, timedelta
from io import StringIO

import pytest
from django.core.management import call_command
from django.utils import timezone

from gry import harmonogram as hg
from gry import serwisy
from gry.models import Gra

pytestmark = pytest.mark.django_db

JSON = "application/json"
FIRMY = [{"nazwa": "Kebab Ali", "bot": None}, {"nazwa": "Pita Pan", "bot": None},
         {"nazwa": "Bot", "bot": "tani", "poziom": "trudny"}]


@pytest.fixture
def gra(client):
    d = {"nazwa": "Klasa", "ziarno": "7", "liczba_rund": 4, "firmy": FIRMY}
    return client.post("/api/gry", d, content_type=JSON).json()["id"]


def _mg(client, gra):
    return client.get(f"/api/gry/{gra}/mg").json()


def _ustaw(client, gra, **d):
    return client.post(f"/api/gry/{gra}/prowadzenie", d, content_type=JSON)


def _lokalnie(*a):
    return timezone.make_aware(datetime(*a), timezone.get_current_timezone())


def test_nastepny_termin_tygodniowy():
    terminy = hg.popraw([{"dzien": 3, "godzina": "8:00"}, {"dzien": 1, "godzina": "08:00"},
                         {"dzien": 1, "godzina": "08:00"}])
    assert terminy == [{"dzien": 1, "godzina": "08:00"}, {"dzien": 3, "godzina": "08:00"}]
    pon = _lokalnie(2026, 10, 26, 12, 0)  # poniedziałek
    assert hg.nastepny(terminy, pon) == _lokalnie(2026, 10, 27, 8, 0)
    assert hg.nastepny(terminy, _lokalnie(2026, 10, 27, 8, 0)) == _lokalnie(2026, 10, 29, 8, 0)  # ściśle po
    assert hg.nastepny(terminy, _lokalnie(2026, 10, 29, 9, 0)) == _lokalnie(2026, 11, 3, 8, 0)
    assert hg.nastepny([], pon) is None
    for zle in ([{"dzien": 7, "godzina": "8:00"}], [{"dzien": 1, "godzina": "25:00"}], [{"dzien": 1}], "pon"):
        with pytest.raises(ValueError):
            hg.popraw(zle)


def test_harmonogram_zamyka_runde_po_terminie(client, gra):
    assert _ustaw(client, gra, harmonogram=[{"dzien": 9, "godzina": "8:00"}]).status_code == 400
    p = _ustaw(client, gra, harmonogram=[{"dzien": 0, "godzina": "8:00"}]).json()["prowadzenie"]
    assert p["harmonogram_opis"] == "poniedziałek 08:00" and p["termin"]
    termin = datetime.fromisoformat(p["termin"])
    assert hg.do_zamkniecia(termin - timedelta(minutes=1)) == []
    assert hg.do_zamkniecia(termin) == [(gra, termin)]
    assert hg.zamknij_spoznione(termin) == [{"gra": gra, "nazwa": "Klasa", "runda": 1}]
    # następny termin liczony od zamknięcia – za tydzień, ta sama komenda nic już nie zamyka
    assert hg.zamknij_spoznione(termin + timedelta(minutes=5)) == []
    assert _mg(client, gra)["gra"]["runda"] == 2
    nowy = datetime.fromisoformat(_mg(client, gra)["prowadzenie"]["termin"])
    assert nowy > termin + timedelta(days=6)


def test_komenda_zamykaj_rundy(client, gra):
    _ustaw(client, gra, harmonogram=[{"dzien": 0, "godzina": "8:00"}])
    Gra.objects.filter(pk=gra).update(termin_od=timezone.now() - timedelta(days=8))
    out = StringIO()
    call_command("zamykaj_rundy", stdout=out)
    assert "runda 1 zamknięta" in out.getvalue() and _mg(client, gra)["gra"]["runda"] == 2


def test_pauza_wstrzymuje_decyzje_zamkniecie_i_harmonogram(client, gra, uczen):
    ala = uczen("ala")
    client.post(f"/api/gry/{gra}/druzyny/Kebab Ali", {"dodaj": "ala"}, content_type=JSON)
    _ustaw(client, gra, harmonogram=[{"dzien": 0, "godzina": "8:00"}])
    Gra.objects.filter(pk=gra).update(termin_od=timezone.now() - timedelta(days=8))
    p = _ustaw(client, gra, pauza=True).json()["prowadzenie"]
    assert p["pauza"] and p["termin"] is None and hg.do_zamkniecia() == []
    url = f"/api/gry/{gra}/decyzje/Kebab Ali?wersja=0"
    v = ala.get(f"/api/gry/{gra}/widok/Kebab Ali").json()
    assert v["prowadzenie"]["pauza"] and not v["tylko_odczyt"]
    assert ala.put(url, v["decyzje"], content_type=JSON).status_code == 400
    assert ala.post(f"/api/gry/{gra}/wyslij/Kebab Ali", {"wyslane": True}, content_type=JSON).status_code == 400
    assert client.post(f"/api/gry/{gra}/przelicz").status_code == 400
    assert ala.get(f"/api/gry/{gra}/stan/Kebab Ali").json()["pauza"]
    # wznowienie: termin, który minął w czasie pauzy, nie zamyka rundy od razu
    p = _ustaw(client, gra, pauza=False).json()["prowadzenie"]
    assert not p["pauza"] and p["termin"] and hg.do_zamkniecia() == []
    assert ala.put(url, v["decyzje"], content_type=JSON).status_code == 200


def test_mistrz_gry_oglada_druzyne_uczniow_tylko_do_odczytu(client, gra, uczen):
    ala = uczen("ala")
    client.post(f"/api/gry/{gra}/druzyny/Kebab Ali", {"dodaj": "ala"}, content_type=JSON)
    v = client.get(f"/api/gry/{gra}/widok/Kebab Ali").json()
    assert v["tylko_odczyt"]
    url = f"/api/gry/{gra}/decyzje/Kebab Ali?wersja=0"
    assert client.put(url, v["decyzje"], content_type=JSON).status_code == 403
    assert client.post(f"/api/gry/{gra}/wyslij/Kebab Ali", {"wyslane": True}, content_type=JSON).status_code == 403
    assert not ala.get(f"/api/gry/{gra}/widok/Kebab Ali").json()["tylko_odczyt"]
    # drużynę bez uczniów prowadzi mistrz gry
    v2 = client.get(f"/api/gry/{gra}/widok/Pita Pan").json()
    assert not v2["tylko_odczyt"]
    assert client.put(f"/api/gry/{gra}/decyzje/Pita Pan?wersja=0", v2["decyzje"], content_type=JSON).status_code == 200
    # mistrz gry nadal zamyka rundę za wszystkich
    assert client.post(f"/api/gry/{gra}/przelicz").json()["runda"] == 2


def test_poziom_botow(client, gra):
    bot = next(f for f in _mg(client, gra)["firmy"] if f["bot"])
    assert bot["poziom"] == "trudny"
    assert set(_mg(client, gra)["prowadzenie"]["poziomy"]) == {"latwy", "sredni", "trudny", "niemozliwy"}
    assert _ustaw(client, gra, poziom={"firma": "Bot", "poziom": "latwy"}).status_code == 200
    assert next(f for f in _mg(client, gra)["firmy"] if f["bot"])["poziom"] == "latwy"
    assert _ustaw(client, gra, poziom={"firma": "Bot", "poziom": "mistrz"}).status_code == 400
    assert _ustaw(client, gra, poziom={"firma": "Kebab Ali", "poziom": "latwy"}).status_code == 404
    zle = {"nazwa": "X", "firmy": [{"nazwa": "A", "bot": None}, {"nazwa": "B", "bot": "tani", "poziom": "?"}]}
    assert client.post("/api/gry", zle, content_type=JSON).status_code == 400


def test_eksport_csv(client, gra, uczen):
    for _ in range(3):
        client.post(f"/api/gry/{gra}/przelicz")
    r = client.get(f"/api/gry/{gra}/wyniki.csv")
    assert r.status_code == 200 and r["Content-Type"].startswith("text/csv")
    tekst = r.content.decode("utf-8")
    assert tekst.startswith("﻿runda;tydzień;firma;bot;przychody") and ";majątek netto;" in tekst
    wiersze = tekst.strip().split("\r\n")
    assert len(wiersze) == 1 + 3 * 3   # nagłówek + 3 rundy × 3 firmy
    assert any(w.startswith("2;T2;Kebab Ali;;") for w in wiersze) and "," in wiersze[1]  # przecinek dziesiętny
    ranking = client.get(f"/api/gry/{gra}/ranking.csv").content.decode("utf-8").strip().split("\r\n")
    assert ranking[0].startswith("﻿miejsce;firma") and len(ranking) == 4 and ranking[1].startswith("1;")
    assert client.get(f"/api/gry/{gra}/inne.csv").status_code == 404
    assert uczen("ala").get(f"/api/gry/{gra}/wyniki.csv").status_code == 403


def test_alarm_debetu_i_inwestor_ratunkowy(client, gra):
    """Alarm przy firmie z debetem ponad limit; mistrz gry przysyła inwestora albo go odwołuje."""
    assert client.post(f"/api/gry/{gra}/przelicz", content_type=JSON).status_code == 200
    r = _ustaw(client, gra, inwestor={"firma": "Kebab Ali", "kwota": 10000})
    assert r.status_code == 400 and "debetem ponad limit" in r.json()["blad"]
    f = serwisy.wczytaj(gra).stan(1).firmy["Kebab Ali"]   # gra w pamięci: debet ponad limit po rundzie 1
    f.debet, f.gotowka = 50000, 0
    ali = next(x for x in _mg(client, gra)["firmy"] if x["nazwa"] == "Kebab Ali")
    assert ali["alarm"] > 0 and ali["inwestor"] is None and ali["inwestor_przyslany"] is None
    p = _ustaw(client, gra, inwestor={"firma": "Kebab Ali", "kwota": 30000}).json()
    assert next(x for x in p["firmy"] if x["nazwa"] == "Kebab Ali")["inwestor_przyslany"] == 30000
    assert p["gra"]["inwestor"]["max_kwota"] >= 30000
    p = _ustaw(client, gra, inwestor={"firma": "Kebab Ali", "kwota": 0}).json()
    assert next(x for x in p["firmy"] if x["nazwa"] == "Kebab Ali")["inwestor_przyslany"] is None


def test_refleksja_druzyny_przy_wysylaniu_decyzji(client, gra):
    """Refleksja przy „Wyślij decyzje” – widzi ją mistrz gry (panel, CSV); opcja gry wymagana / wyłączona."""
    url = f"/api/gry/{gra}/wyslij/Kebab Ali"
    assert _mg(client, gra)["gra"]["refleksja"] == "opcjonalna"
    v = client.post(url, {"wyslane": True, "refleksja": "  Obniżamy ceny,\n bo  sprzedaliśmy połowę. "}, content_type=JSON).json()
    assert v["refleksja"] == "Obniżamy ceny, bo sprzedaliśmy połowę." and v["gra"]["refleksja"] == "opcjonalna"
    assert _mg(client, gra)["refleksje"] == [{"runda": 1, "firma": "Kebab Ali", "tekst": "Obniżamy ceny, bo sprzedaliśmy połowę."}]
    assert client.post(f"/api/gry/{gra}/wyslij/Pita Pan", {"wyslane": True}, content_type=JSON).json()["przeliczono"]
    wiersze = client.get(f"/api/gry/{gra}/wyniki.csv").content.decode("utf-8").strip().split("\r\n")
    assert wiersze[0].endswith(";refleksja drużyny")
    assert any(w.startswith("1;") and "Kebab Ali" in w and w.endswith(";Obniżamy ceny, bo sprzedaliśmy połowę.") for w in wiersze)

    assert _ustaw(client, gra, refleksja="zawsze").status_code == 400
    assert _ustaw(client, gra, refleksja="wymagana").json()["gra"]["refleksja"] == "wymagana"
    r = client.post(url, {"wyslane": True, "refleksja": "  "}, content_type=JSON)
    assert r.status_code == 400 and "co zmieniacie" in r.json()["blad"]
    assert client.post(url, {"wyslane": True, "refleksja": "x" * 900}, content_type=JSON).json()["refleksja"] == "x" * 500
    _ustaw(client, gra, refleksja="wylaczona")
    client.post(url, {"wyslane": False}, content_type=JSON)
    v = client.post(url, {"wyslane": True, "refleksja": "nowa"}, content_type=JSON).json()
    assert v["refleksja"] == "x" * 500   # wyłączona: tekstu nie zapisujemy (stary zostaje w historii)
    nowa = client.post("/api/gry", {"nazwa": "B", "firmy": FIRMY, "refleksja": "wymagana"}, content_type=JSON).json()["id"]
    assert _mg(client, nowa)["gra"]["refleksja"] == "wymagana"
    assert client.post("/api/gry", {"nazwa": "C", "firmy": FIRMY, "refleksja": "?"}, content_type=JSON).status_code == 400


# --- tryb lekcyjny (gry/lekcje.py) ---------------------------------------------------------------------------------

LEKCJE = {"rundy_na_zywo": 2, "termin_dni": 5}


def _nowa(client, **d):
    d = {"nazwa": "Klasa", "ziarno": "7", "liczba_rund": 4, "firmy": FIRMY, **d}
    return client.post("/api/gry", d, content_type=JSON)


def test_lekcje_zakresy_i_domyslne_z_danych():
    from gry import lekcje
    z = lekcje.zakresy()
    assert lekcje.popraw({}) == {"rundy_na_zywo": z["rundy_na_zywo"]["domyslnie"], "termin_dni": z["termin_dni"]["domyslnie"]}
    assert lekcje.popraw(None) is None and lekcje.popraw(False) is None
    assert lekcje.popraw({"rundy_na_zywo": "4", "termin_dni": 14}) == {"rundy_na_zywo": 4, "termin_dni": 14}
    for zle in ({"rundy_na_zywo": 0}, {"rundy_na_zywo": 7}, {"termin_dni": 15}, {"termin_dni": 0}, {"termin_dni": "x"},
                {"termin_dni": 2.5}, {"termin_dni": True}, "tak"):
        with pytest.raises(ValueError):
            lekcje.popraw(zle)


def test_lekcje_wyliczenie_terminu():
    from gry import lekcje
    od = _lokalnie(2026, 11, 2, 10, 0)
    assert lekcje.termin(None, 5, od) is None            # gra „na żywo”
    assert lekcje.termin(LEKCJE, 1, od) is None and lekcje.termin(LEKCJE, 2, od) is None   # rundy na żywo
    assert lekcje.termin(LEKCJE, 3, od) == od + timedelta(days=5)
    assert lekcje.opis(LEKCJE, 2)["tekst"] == "na żywo: runda 2 z 2"
    assert lekcje.opis(LEKCJE, 3)["etap"] == "miedzy" and lekcje.opis(None, 1) is None


def test_lekcje_kreator_i_przebieg_rund(client):
    assert _nowa(client, lekcje={"rundy_na_zywo": 9}).status_code == 400
    id_ = _nowa(client, lekcje=LEKCJE).json()["id"]
    p = _mg(client, id_)["prowadzenie"]
    assert p["lekcje"]["etap"] == "na_zywo" and p["termin"] is None and not p["termin_minal"]
    assert p["zakresy_lekcji"]["termin_dni"]["max"] == 14
    client.post(f"/api/gry/{id_}/przelicz")      # runda 1 → 2: nadal na żywo
    assert _mg(client, id_)["prowadzenie"]["termin"] is None
    client.post(f"/api/gry/{id_}/przelicz")      # runda 2 → 3: między lekcjami
    p = _mg(client, id_)["prowadzenie"]
    assert p["lekcje"]["etap"] == "miedzy" and p["lekcje"]["tekst"] == "między lekcjami: 5 dni na rundę"
    od = Gra.objects.get(pk=id_).termin_od
    assert datetime.fromisoformat(p["termin"]) == od + timedelta(days=5) and not p["termin_minal"]
    # po terminie: panel pokazuje „termin minął”, a komenda zamykająca zamyka rundę
    Gra.objects.filter(pk=id_).update(termin_od=timezone.now() - timedelta(days=6))
    assert _mg(client, id_)["prowadzenie"]["termin_minal"] is True
    assert hg.zamknij_spoznione()[0]["runda"] == 3
    assert _mg(client, id_)["prowadzenie"]["termin_minal"] is False


def test_lekcje_zmiana_w_trakcie_gry_i_pauza(client):
    id_ = _nowa(client).json()["id"]
    assert _mg(client, id_)["prowadzenie"]["lekcje"] is None
    assert _ustaw(client, id_, lekcje={"rundy_na_zywo": 1, "termin_dni": 3}).status_code == 200
    client.post(f"/api/gry/{id_}/przelicz")
    p = _mg(client, id_)["prowadzenie"]
    assert p["lekcje"]["rundy_na_zywo"] == 1 and p["termin"]
    assert _ustaw(client, id_, lekcje={"termin_dni": 99}).status_code == 400
    assert _ustaw(client, id_, pauza=True).json()["prowadzenie"]["termin"] is None   # pauza: bez terminu
    assert _ustaw(client, id_, pauza=False, lekcje=None).json()["prowadzenie"]["lekcje"] is None
    assert _mg(client, id_)["prowadzenie"]["termin"] is None


def test_stara_gra_bez_pol_lekcji_dziala_jak_dotad(client, gra):
    obj = Gra.objects.get(pk=gra)
    assert "lekcje" not in obj.konfiguracja
    p = _mg(client, gra)["prowadzenie"]
    assert p["lekcje"] is None and p["termin"] is None and p["termin_minal"] is False
    assert hg.do_zamkniecia(timezone.now() + timedelta(days=400)) == []
    # harmonogram tygodniowy ma pierwszeństwo przed trybem lekcyjnym
    _ustaw(client, gra, lekcje={"rundy_na_zywo": 1, "termin_dni": 3})
    client.post(f"/api/gry/{gra}/przelicz")
    p = _ustaw(client, gra, harmonogram=[{"dzien": 0, "godzina": "8:00"}]).json()["prowadzenie"]
    assert hg.opis({"dzien": 0, "godzina": "08:00"}) in p["harmonogram_opis"] and p["termin"]
    assert datetime.fromisoformat(p["termin"]).astimezone(timezone.get_current_timezone()).weekday() == 0
