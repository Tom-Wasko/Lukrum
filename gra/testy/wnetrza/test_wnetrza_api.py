"""API wnętrz: widok drużyny, odpowiedź na propozycję, ustawienia dymków mistrza gry i uprawnienia."""
import pytest

from silnik import dane as modul_danych

pytestmark = pytest.mark.django_db
JSON = "application/json"


@pytest.fixture
def dane_wnetrz(monkeypatch, kat_wnetrza):
    """Gry w tym teście liczą się na danych z testowymi wnętrzami (API czyta `dane_domyslne()`)."""
    monkeypatch.setattr(modul_danych, "KATALOG_DANYCH", kat_wnetrza)


def _gra(client, uczen) -> tuple[str, object, object]:
    d = {"nazwa": "W", "ziarno": "7", "liczba_rund": 6,
         "firmy": [{"nazwa": "Ala", "bot": None}, {"nazwa": "Ola", "bot": None}, {"nazwa": "Bot", "bot": "tani"}]}
    r = client.post("/api/gry", d, content_type=JSON)
    assert r.status_code == 200, r.json()
    id_ = r.json()["id"]
    ala, ola = uczen("ala"), uczen("ola")
    for c, f, k in ((client, "Ala", "ala"), (client, "Ola", "ola")):
        assert c.post(f"/api/gry/{id_}/druzyny/{f}", {"dodaj": k}, content_type=JSON).status_code == 200
    return id_, ala, ola


def _runda_2(client, id_):
    assert client.post(f"/api/gry/{id_}/przelicz").status_code == 200


def test_gra_bez_wnetrz_ma_404(client, uczen):
    id_, ala, _ = _gra(client, uczen)   # dane zamrożone nie mają dane/wnetrza/
    assert ala.get(f"/api/gry/{id_}/wnetrza/Ala").status_code == 404
    assert client.get(f"/api/gry/{id_}/wnetrza-ustawienia").status_code == 404


def test_widok_wnetrza_i_uprawnienia(dane_wnetrz, client, uczen):
    id_, ala, ola = _gra(client, uczen)
    r = ala.get(f"/api/gry/{id_}/wnetrza/Ala")
    assert r.status_code == 200
    w = r.json()
    assert w["runda"] == 1 and w["rodzaje"]["wos"] and w["wlaczone"] == dict.fromkeys(w["rodzaje"], True)
    assert {"pracownicy", "wyposazenie", "udogodnienia", "tlok"} <= set(w["stan"]) and w["wskazniki"] == {"runda": 1}
    assert [x["tekst"] for x in w["dymki"] if x["kto"] == "wujek"] == ["WUJ-START"]   # runda 1: okazja „start”
    assert w["propozycja"] is None   # propozycje od rundy 2
    assert ala.get(f"/api/gry/{id_}/wnetrza/Ola").status_code == 403
    assert ola.get(f"/api/gry/{id_}/wnetrza/Ala").status_code == 403
    assert client.get(f"/api/gry/{id_}/wnetrza/Ola").status_code == 200   # mistrz gry widzi każdą firmę
    assert client.get(f"/api/gry/{id_}/wnetrza/Nikt").status_code == 404
    assert client.get("/api/gry/nie-ma/wnetrza/Ala").status_code == 404


def test_filtr_gracza_to_tylko_widok(dane_wnetrz, client, uczen):
    id_, ala, _ = _gra(client, uczen)
    _runda_2(client, id_)
    pelny = ala.get(f"/api/gry/{id_}/wnetrza/Ala").json()
    wos = ala.get(f"/api/gry/{id_}/wnetrza/Ala?rodzaje=wos").json()
    assert {x["rodzaj"] for x in wos["dymki"] if x["kto"] != "wujek"} <= {"wos"} and wos["filtr_gracza"] == ["wos"]
    assert ala.get(f"/api/gry/{id_}/wnetrza/Ala?rodzaje=").json()["dymki"] == [x for x in pelny["dymki"] if x["kto"] == "wujek"]
    assert ala.get(f"/api/gry/{id_}/wnetrza/Ala").json()["dymki"] == pelny["dymki"]   # nic nie zapisano
    assert ala.get(f"/api/gry/{id_}/wnetrza/Ala?rodzaje=kawa").status_code == 400
    assert pelny["propozycja"] is not None   # filtr dymków nie chowa propozycji


def test_odpowiedz_na_propozycje(dane_wnetrz, client, uczen):
    id_, ala, ola = _gra(client, uczen)
    _runda_2(client, id_)
    url = f"/api/gry/{id_}/wnetrza/Ala/odpowiedz"
    p = ala.get(f"/api/gry/{id_}/wnetrza/Ala").json()["propozycja"]
    assert p["wybrana"] is None and p["domyslna"] == "odmowa" and "skutki" not in str(p["odpowiedzi"])
    assert {"id", "kto", "imie", "tekst", "odpowiedzi", "reakcja"} <= set(p)
    assert ala.post(url, {"odpowiedz": "kawa"}, content_type=JSON).status_code == 400
    assert ola.post(url, {"odpowiedz": "odmowa"}, content_type=JSON).status_code == 403
    assert client.post(url, {"odpowiedz": "odmowa"}, content_type=JSON).status_code == 403   # mistrz gry – tylko odczyt drużyny
    odp = next(o["id"] for o in p["odpowiedzi"] if o["id"] != "odmowa")
    r = ala.post(url, {"odpowiedz": odp}, content_type=JSON)
    assert r.status_code == 200 and r.json()["propozycja"]["wybrana"] == odp and r.json()["propozycja"]["reakcja"]
    assert ala.get(f"/api/gry/{id_}/wnetrza/Ala").json()["propozycja"]["wybrana"] == odp
    assert ola.get(f"/api/gry/{id_}/wnetrza/Ola").json()["propozycja"]["wybrana"] is None   # tylko ta drużyna
    assert ala.post(url, {"odpowiedz": "odmowa"}, content_type=JSON).json()["propozycja"]["wybrana"] == "odmowa"
    assert ala.post(f"/api/gry/{id_}/wyslij/Ala", {}, content_type=JSON).status_code == 200
    assert ala.post(url, {"odpowiedz": odp}, content_type=JSON).status_code == 400   # decyzje wysłane


def test_brak_propozycji_w_rundzie_1(dane_wnetrz, client, uczen):
    id_, ala, _ = _gra(client, uczen)
    r = ala.post(f"/api/gry/{id_}/wnetrza/Ala/odpowiedz", {"odpowiedz": "tak"}, content_type=JSON)
    assert r.status_code == 400 and "nie ma propozycji" in r.json()["blad"]


def test_odpowiedz_przezywa_zapis_i_wczytanie_gry(dane_wnetrz, client, uczen):
    from gry import serwisy
    id_, ala, _ = _gra(client, uczen)
    _runda_2(client, id_)
    p = ala.get(f"/api/gry/{id_}/wnetrza/Ala").json()["propozycja"]
    odp = next(o["id"] for o in p["odpowiedzi"] if o["id"] != "odmowa")
    ala.post(f"/api/gry/{id_}/wnetrza/Ala/odpowiedz", {"odpowiedz": odp}, content_type=JSON)
    serwisy._pamiec.clear()   # wczytanie z bazy
    assert ala.get(f"/api/gry/{id_}/wnetrza/Ala").json()["propozycja"]["wybrana"] == odp


def test_ustawienia_dymkow_tylko_mistrz_gry(dane_wnetrz, client, uczen):
    id_, ala, _ = _gra(client, uczen)
    url = f"/api/gry/{id_}/wnetrza-ustawienia"
    assert ala.get(url).status_code == 403 and ala.post(url, {"dymki": {"wos": False}}, content_type=JSON).status_code == 403
    r = client.get(url).json()
    assert r["dymki"] == dict.fromkeys(("cena_smak", "plotki", "propozycje", "wos"), True) and r["rodzaje"]["wos"]
    assert client.post(url, {"dymki": {"wos": False, "plotki": False}}, content_type=JSON).json()["dymki"]["wos"] is False
    assert client.get(url).json()["dymki"] == {"cena_smak": True, "plotki": False, "propozycje": True, "wos": False}
    assert client.post(url, {"dymki": {"kawa": True}}, content_type=JSON).status_code == 400
    assert client.post(url, {"dymki": {"wos": "nie"}}, content_type=JSON).status_code == 400
    assert client.post(url, {}, content_type=JSON).status_code == 400
    assert client.get(url).json()["dymki"]["plotki"] is False   # błędne zapisy niczego nie zmieniły


def test_wylaczone_rodzaje_znikaja_od_nastepnego_wyliczenia(dane_wnetrz, client, uczen):
    id_, ala, _ = _gra(client, uczen)
    _runda_2(client, id_)
    url = f"/api/gry/{id_}/wnetrza-ustawienia"
    assert ala.get(f"/api/gry/{id_}/wnetrza/Ala").json()["propozycja"] is not None
    client.post(url, {"dymki": dict.fromkeys(("cena_smak", "plotki", "propozycje", "wos"), False)}, content_type=JSON)
    w = ala.get(f"/api/gry/{id_}/wnetrza/Ala").json()   # w trakcie rundy, bez przeliczania
    assert w["propozycja"] is None and all(x["kto"] == "wujek" for x in w["dymki"])
    assert w["wlaczone"] == dict.fromkeys(w["rodzaje"], False)
    client.post(url, {"dymki": {"propozycje": True}}, content_type=JSON)
    assert ala.get(f"/api/gry/{id_}/wnetrza/Ala").json()["propozycja"] is not None
