"""Wnętrza z makiet (panel_gracza/static/swiat/sceny/): każdy żeton budynku ma scenę, a punkty scen prowadzą do istniejących ekranów.

Sceny to moduły JS (jeden plik na scenę, rejestr sceny/index.js). Test czyta rejestr i dane mapy, a punkty scen sprawdza
uruchamiając je w Node z atrapą biblioteki rysunku (bez przeglądarki). Bez Node'a test punktów jest pomijany.
"""
import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

import pytest
import yaml

from testy.aplikacja.test_swiat import _ekrany

GRA = Path(__file__).resolve().parents[2]
SCENY = GRA / "panel_gracza" / "static" / "swiat" / "sceny"
INDEX = (SCENY / "index.js").read_text(encoding="utf-8")


def _blok(nazwa: str) -> str:
    return re.search(rf"export const {nazwa} = {{(.*?)}};", INDEX, re.S).group(1)


def _sceny() -> set[str]:
    return set(re.findall(r"^  (\w+): \{ tytul:", _blok("SCENY"), re.M))


def _budynki_sceny() -> dict[str, str]:
    return dict(re.findall(r'^  (\w+): "([\w?=]+)",', _blok("BUDYNKI_SCENY"), re.M))


def _bez_sceny() -> set[str]:
    return set(re.findall(r"^  (\w+):", _blok("BEZ_SCENY"), re.M))


def test_kazdy_zeton_budynku_ma_scene_albo_jawny_wyjatek():
    mapa = yaml.safe_load((GRA / "dane" / "mapa" / "budynki.yaml").read_text(encoding="utf-8"))
    zetony = {b["id"] for b in mapa["budynki"]} | {z["id"] for z in mapa.get("zespoly", [])}
    ze_scena = set(_budynki_sceny())
    assert zetony <= ze_scena | _bez_sceny(), zetony - ze_scena - _bez_sceny()
    assert not ze_scena & _bez_sceny()


def test_wpisy_rejestru_wskazuja_istniejace_sceny():
    sceny = _sceny()
    assert {m.stem for m in SCENY.glob("*.js")} - {"index"} == sceny
    for zeton, cel in _budynki_sceny().items():
        assert cel.split("?")[0] in sceny, zeton


def test_sceny_nie_maja_kolorow_na_sztywno_ani_globalnych():
    for plik in [*SCENY.glob("*.js"), GRA / "panel_gracza" / "static" / "swiat" / "rysunek.js",
                 GRA / "panel_gracza" / "static" / "swiat" / "wnetrza.css"]:
        tekst = plik.read_text(encoding="utf-8")
        assert not re.search(r"#[0-9a-fA-F]{3,8}\b(?!\w)", re.sub(r"href=\"#[^\"]*\"|url\(#\w+\)", "", tekst)), plik.name
        assert not re.search(r"\brgba?\(|\bhsla?\(", tekst), plik.name
        assert "window.SCENA" not in tekst, plik.name


@pytest.mark.skipif(shutil.which("node") is None, reason="brak Node.js")
def test_punkty_scen_prowadza_do_istniejacych_ekranow():
    with tempfile.TemporaryDirectory() as tmp:
        for plik in SCENY.glob("*.js"):
            (Path(tmp) / f"{plik.stem}.mjs").write_text(plik.read_text(encoding="utf-8"), encoding="utf-8")
        wyjscie = subprocess.run(["node", str(Path(__file__).with_name("wnetrza_punkty.mjs")), tmp],
                                 capture_output=True, text=True, encoding="utf-8", check=True).stdout
    dane = json.loads(wyjscie)
    assert not dane["bledy"], dane["bledy"]
    ekrany = _ekrany()
    nieznane = {(s, p["et"], p["ekran"]) for s, ps in dane["wynik"].items() for p in ps if p["ekran"] and p["ekran"] not in ekrany}
    assert not nieznane, nieznane
    for s, ps in dane["wynik"].items():
        assert ps, f"scena {s} bez klikalnych miejsc"
        for p in ps:
            assert p["ekran"] or p["odsyla"] or p["wejscie"] or p["et"], (s, p)
        for p in ps:
            if p["wejscie"]:
                assert re.sub(r"\.html.*", "", p["wejscie"]) in _sceny(), (s, p)


def _budynki_mapy():
    return yaml.safe_load((GRA / "dane" / "mapa" / "budynki.yaml").read_text(encoding="utf-8"))


def test_kamienica_i_park_handlowy_maja_zetony_na_mapie():
    """Decyzja szefa 18.11: kamienica rachmistrzów i Park handlowy są na mapie. Kamienica ma adres tymczasowy, Park
    od 19.11 realny (park handlowy przy al. Kraśnickiej 128, wybrany przez lidera na polecenie szefa)."""
    mapa = _budynki_mapy()
    kam = next(b for b in mapa["budynki"] if b["id"] == "kamienica_rachmistrzow")
    park = next(z for z in mapa["zespoly"] if z["id"] == "park_handlowy")
    for zeton in (kam, park):
        assert zeton["geo"] and zeton["adres"]
    assert "tymczasow" in (kam["opis"] + kam["adres"]).lower()
    assert park["adres"] == "al. Kraśnicka 128" and "tymczasow" not in (park["opis"] + park["adres"]).lower()
    assert _budynki_sceny()["kamienica_rachmistrzow"] == "kamienica_rachmistrzow"
    assert _budynki_sceny()["park_handlowy"] == "park_handlowy"


def test_drukarnia_nie_ma_zetonu_na_mapie_a_dom_reklamy_ma_winde():
    """Drukarnia jest piętrem Domu reklamy (żeton biurowca przy Zana), nie osobnym budynkiem; biura rachunkowe są w kamienicy."""
    mapa = _budynki_mapy()
    drukarnia = next(b for b in mapa["budynki"] if b["id"] == "drukarnia")
    assert drukarnia["zespol"] == "biurowiec_zana" and not drukarnia.get("geo")
    assert _budynki_sceny()["biurowiec_zana"] == "winda_zana"
    assert not any(b["id"] == "biura" for b in mapa["budynki"])
    winda = (SCENY / "winda_zana.js").read_text(encoding="utf-8")
    pietra = re.findall(r'scena: "(\w+)"', winda)
    assert pietra == ["zana_internet", "zana_eventy", "zana_radio", "zana_drukarnia", "zana_portiernia"]
    assert set(pietra) <= _sceny()
    assert "wejscie: \"pokoj_ksiegi.html\"" in (SCENY / "zana_portiernia.js").read_text(encoding="utf-8")


def test_park_handlowy_prowadzi_do_hali_sprzetu_a_kebab_nie_do_parku():
    park = (SCENY / "park_handlowy.js").read_text(encoding="utf-8")
    assert 'wejscie: "sprzet_gastro.html"' in park
    swiat = (GRA / "panel_gracza" / "static" / "swiat" / "swiat.js").read_text(encoding="utf-8")
    assert 'M.id === "kebab" && MIEJSCA.kebab.punkty.some' in swiat   # ekran z kebaba wraca do kebaba, nie do Parku
    kebab = (GRA / "panel_gracza" / "static" / "swiat" / "miejsca.js").read_text(encoding="utf-8").split("kebab: {", 1)[1]
    # decyzja 16.11: kebab odsyła sprzęt i wystrój do Parku – tylko jawnym odsyłaczem (miejsce + komunikat), nie okruszkiem
    assert kebab.count("park_handlowy") == kebab.count('miejsce: "park_handlowy", odsyla:')
    # rożen w kebabie pokazuje kupiony sprzęt (teczka), nie odsyła do hurtowni (podróż 02/sklepy)
    assert 'miejsce: "sprzet_gastro"' not in kebab


def _punkty_scen():
    with tempfile.TemporaryDirectory() as tmp:
        for plik in SCENY.glob("*.js"):
            (Path(tmp) / f"{plik.stem}.mjs").write_text(plik.read_text(encoding="utf-8"), encoding="utf-8")
        wyjscie = subprocess.run(["node", str(Path(__file__).with_name("wnetrza_punkty.mjs")), tmp],
                                 capture_output=True, text=True, encoding="utf-8", check=True).stdout
    return json.loads(wyjscie)["wynik"]


def test_sklepy_pokazuja_tylko_swoje_dzialy_i_istniejacy_sprzet():
    """Podróż 02/sklepy: punkt sklepu ma dostawcę i działy (okienko jednego sklepu), hurtownia sprzętu – pozycje z danych."""
    dostawcy = (GRA / "panel_gracza" / "static" / "zakladki" / "dostawcy.js").read_text(encoding="utf-8")
    blok = dostawcy.split("export const DZIALY", 1)[1].split("};", 1)[0]
    dzialy = {m.strip('"') for m in re.findall(r'^\s+("[^"]+"|[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]+): \[', blok, re.M)}
    assert dzialy, "brak listy działów w dostawcy.js"
    sprzet = set(yaml.safe_load((GRA / "dane" / "sprzet.yaml").read_text(encoding="utf-8"))["sprzet"])
    for scena, punkty in _punkty_scen().items():
        for p in punkty:
            if p["dostawca"] and p["widok"] == "dzial":
                assert p["dzialy"], (scena, p["et"])
                assert set(p["dzialy"]) <= dzialy, (scena, p["et"], p["dzialy"])
            if p["sprzet"]:
                assert set(p["sprzet"]["nazwy"]) <= sprzet, (scena, p["et"], p["sprzet"])


def test_pietra_biurowca_maja_filtr_agencji():
    agencje = set(yaml.safe_load((GRA / "dane" / "mapa" / "reklama.yaml").read_text(encoding="utf-8"))["agencje"])
    punkty = _punkty_scen()
    for pietro in ("zana_drukarnia", "zana_radio", "zana_eventy"):
        assert [p["agencja"] for p in punkty[pietro]] and all(p["agencja"] in agencje for p in punkty[pietro]), pietro
    assert len({p["agencja"] for k in ("zana_drukarnia", "zana_radio", "zana_eventy") for p in punkty[k]}) == 3


# zakładki złożone z kilku części: punkt nie może prowadzić do nich wprost (klucz części otwiera okno jednej sprawy)
ZLOZONE = {"lokal_przeglad", "wnetrze_sprzet", "wnetrze_wyposazenie", "hr_rozwoj", "zaop_dostawy", "zaop_magazyn",
           "zaop_przewozy", "lokal_menu"}
# jawne wyjątki: (scena, etykieta punktu) → powód, dla którego punkt otwiera to samo co wcześniejszy punkt tej sceny
_JEDNA_SPRAWA = "ekran jednej sprawy (jedna zakładka gry, nie złożona z kilku); punkty to różne stoły tej samej usługi"
TEN_SAM_EKRAN: dict[tuple[str, str], str] = {par: _JEDNA_SPRAWA for par in [
    ("agencja_nieruchomosci", "Twoje klucze"), ("agencja_pracy", "Twoje ogłoszenia"), ("agencja_pracy", "Agencja"),
    ("agencja_pracy", "Headhunter"), ("bank", "Kredyty"), ("bank", "Lokaty"), ("bazar", "Twój stragan"),
    ("bazar", "Zakończone"), ("biuro_rachunkowe", "Cennik"), ("biuro_rachunkowe", "Twoje dokumenty"),
    ("detektyw", "Kto jest kim"), ("detektyw", "Raporty"), ("gielda", "Kup albo sprzedaj"), ("gielda", "Wiadomości"),
    ("harpagon", "Twój dług"), ("kamienica_rachmistrzow", "Poczta z urzędu"), ("poczta", "Potwierdzenia"),
    ("pokoj_ksiegi", "Dokumenty"), ("sanepid", "Kontrole"), ("ubezpieczyciel", "Co grozi"),
    ("ubezpieczyciel", "Twoje polisy"), ("uczelnia", "Prognoza popytu")]}


def test_zaden_punkt_nie_otwiera_zlozonego_ekranu_ani_tej_samej_zawartosci():
    """Usterka z gier testowych: każdy punkt otwierał ten sam złożony ekran (np. „Instalacje i wyposażenie” + „Sklep
    meblowy”). Punkt otwiera okno jednej sprawy: dostawca z działem, pozycje sprzętu, auto-dostawy, agencja albo ekran
    (część zakładki). Punkty o różnych etykietach w jednej scenie nie otwierają identycznej zawartości."""
    kolizje: list[str] = []
    for scena, punkty in _punkty_scen().items():
        klucze: dict[tuple, str] = {}
        for p in punkty:
            zwykly = not (p["dostawca"] or p["sprzet"] or p["agencja"] or p["auto"])
            if zwykly:
                assert p["ekran"] not in ZLOZONE, f"{scena}: „{p['et']}” otwiera złożony ekran {p['ekran']}"
            if p["dostawca"]:
                klucz = ("sklep", p["dostawca"], p["widok"], tuple(p["dzialy"]))
            elif p["sprzet"]:
                klucz = ("sprzet", tuple(p["sprzet"]["nazwy"]), p["sprzet"]["widok"])
            elif p["agencja"]:
                klucz = ("agencja", p["agencja"], p["ekran"])
            elif p["auto"]:
                klucz = ("auto",)
            elif p["ekran"]:
                klucz = ("ekran", p["ekran"], p["tryb"])
            else:
                continue   # odesłanie, wejście albo dymek z własnym wstępem
            if klucz in klucze and (scena, p["et"]) not in TEN_SAM_EKRAN:
                kolizje.append(f"{scena}: „{p['et']}” i „{klucze[klucz]}” otwierają to samo: {klucz}")
            klucze.setdefault(klucz, p["et"])
    assert not kolizje, "\n".join(kolizje)


def test_usuwanie_zamowien_odswieza_tylko_liste_a_nie_cala_strone():
    """Z31: „Usuń” i „Usuń wszystkie” nie przerysowują całej zakładki: zmien(fn, lokalnie) odświeża listę zamówień."""
    dostawcy = (GRA / "panel_gracza" / "static" / "zakladki" / "dostawcy.js").read_text(encoding="utf-8")
    assert "<div data-lista-zam>" in dostawcy and "function odswiezListe" in dostawcy
    usun = dostawcy.split('"zam-usun":', 1)[1].split('"auto-prognoza"', 1)[0]
    assert usun.count("poListe(c)") == 2   # zam-usun i zam-wyczysc: drugi argument zmien



# jawne wyjątki kebaba: (klucz punktu, cel) → powód. Reszta punktów kebaba nie może otwierać zakładki złożonej z kilku części.
KEBAB_ZLOZONE = {
    ("lada", "lokal_przeglad"): "„Mój lokal” (stan, sprawy, obsada, sprzedaż) to jedna lada; do decyzji szefa, czy rozdzielić (raport wątku sklepy)",
    ("menu", "lokal_menu"): "zakładka złożona z jednej części (menu i ceny)",
    ("chlodnia", "zaop_magazyn"): "magazyn i świeżość to jedna sprawa chłodni",
    ("stoliki", "wnetrze_wyposazenie"): "odesłanie do Parku handlowego (bez okna)",
    ("szkolenia", "hr_rozwoj"): "odesłanie do akademii (bez okna)",
}


def test_kebab_prowadzi_do_zlozonych_ekranow_tylko_przez_jawny_wyjatek():
    miejsca = (GRA / "panel_gracza" / "static" / "swiat" / "miejsca.js").read_text(encoding="utf-8")
    pary = re.findall(r'klucz: "(\w+)", cel: "(\w+)"', miejsca.split("kebab: {", 1)[1])
    zlozone = {(k, c) for k, c in pary if c in ZLOZONE}
    assert zlozone <= set(KEBAB_ZLOZONE), zlozone - set(KEBAB_ZLOZONE)
    assert "wnetrze_sprzet" not in {c for _, c in pary}


def test_sceny_sklepow_wskazuja_dostawce_z_danych_a_dzialy_pokrywaja_zasoby():
    """Dostawca idzie z jawnego pola sceny (`dostawca`), a nie z dopasowania tytułu; każdy zasób w cenach ma dział."""
    dane = yaml.safe_load((GRA / "dane" / "dostawcy.yaml").read_text(encoding="utf-8"))
    dostawcy = set(dane["dostawcy"])
    sceny_sklepow = {}
    for plik in SCENY.glob("*.js"):
        m = re.search(r'id: ID, dostawca: "([^"]+)"', plik.read_text(encoding="utf-8"))
        if m:
            sceny_sklepow[plik.stem] = m.group(1)
    assert len(sceny_sklepow) == 9, sceny_sklepow   # 3 dyskonty + piekarnia + 3 hurtownie + zakład mięsny + Auchan
    assert set(sceny_sklepow.values()) <= dostawcy, set(sceny_sklepow.values()) - dostawcy
    # każdy punkt sklepu (teczka.dostawca) ma scenę z kluczem dostawcy
    for scena, punkty in _punkty_scen().items():
        if any(p["dostawca"] for p in punkty):
            assert scena in sceny_sklepow, f"scena {scena} ma punkty sklepu, ale nie ma pola dostawca"
    # działy pokrywają wszystkie zasoby, które dostawcy mają w cenach
    dostawcy_js = (GRA / "panel_gracza" / "static" / "zakladki" / "dostawcy.js").read_text(encoding="utf-8")
    blok = dostawcy_js.split("export const DZIALY", 1)[1].split("};", 1)[0]
    w_dzialach = set(re.findall(r'"([^"]+)"', blok.split("=", 1)[1]))
    zasoby = {z for miesiac in dane["ceny"].values() for ceny in miesiac.values() for z in ceny}
    assert zasoby <= w_dzialach, f"zasoby bez działu: {zasoby - w_dzialach}"


def test_panel_laduje_sie_a_sklep_bez_oferty_nie_otwiera_ogolnego_ekranu_dostawcow():
    """Zachowanie na prawdziwych modułach (Node ze stubem DOM): zakładki/index.js się ładuje (regresja: getter bez settera),
    runda 1 / późniejszy sklep to krótka informacja, a okno sklepu pokazuje tylko zasoby z działu."""
    wyjscie = subprocess.run(
        ["node", str(Path(__file__).with_name("zakladki_zachowanie.mjs")), str(GRA / "panel_gracza" / "static")],
        capture_output=True, text=True, encoding="utf-8", check=True).stdout
    dane = json.loads(wyjscie)
    assert not dane["bledy"], dane["bledy"]
    w = dane["wynik"]
    assert w["index_laduje_sie"] == {"agencje": "string", "hr_rozwoj_bez_lokali": True}
    assert w["dostawca_sceny"]["pusta_runda"] is None and w["dostawca_sceny"]["bez_klucza"] is None
    assert w["dostawca_sceny"]["jest"] == "Lidl"
    assert w["klik_bez_oferty"]["ekrany"] == []   # nie otwiera zaop_dostawy
    assert "otworzy się w tygodniu 3" in w["klik_bez_oferty"]["tresc"]
    assert w["okno_sklepu"]["ekrany"] == []
    tresc = w["okno_sklepu"]["tresc"]
    assert "Napój" in tresc and "Bułka" not in tresc and "Sos" not in tresc
    # podróż 03/paragon: okno sklepu jest paragonem (sklep w nagłówku, pozycja ilość × cena, suma), cena tylko z tego sklepu i działu
    of = w["paragon_sklepu"]["oferta"]
    assert "pp-paragon" in of and "LIDL" in of and "SUMA PLN" in of and "× 200,00" in of
    assert 'data-zmiana="ilosc"' in of and "Kupuję" in of and "Bułka" not in of and "Sos" not in of
    assert "✓" in of   # pozycja w koszyku oznaczona znakiem, nie samym kolorem
    pot = w["paragon_sklepu"]["potwierdzenie"]
    assert "POTWIERDZENIE ZAKUPU" in pot and "Napój" in pot and "Sos" in pot and "SUMA PLN" in pot and "Dziękujemy" in pot
    assert 'data-zmiana="ilosc"' not in pot   # potwierdzenie tylko do odczytu
