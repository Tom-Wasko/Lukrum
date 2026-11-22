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
                assert set(p["sprzet"]) <= sprzet, (scena, p["et"], p["sprzet"])


def test_pietra_biurowca_maja_filtr_agencji():
    agencje = set(yaml.safe_load((GRA / "dane" / "mapa" / "reklama.yaml").read_text(encoding="utf-8"))["agencje"])
    punkty = _punkty_scen()
    for pietro in ("zana_drukarnia", "zana_radio", "zana_eventy"):
        assert [p["agencja"] for p in punkty[pietro]] and all(p["agencja"] in agencje for p in punkty[pietro]), pietro
    assert len({p["agencja"] for k in ("zana_drukarnia", "zana_radio", "zana_eventy") for p in punkty[k]}) == 3
