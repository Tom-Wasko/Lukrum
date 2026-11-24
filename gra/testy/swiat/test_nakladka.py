"""Nakładka sceny (04/nakladka): rozkład szyldów bez nachodzenia, układ dymka i kontrast napisów na scenie."""

import json
import re
import shutil
import subprocess

import pytest
from pomocnicze import KATALOG_GRY

STATIC = KATALOG_GRY / "panel_gracza" / "static"
POMIAR = """
import { naKrzyz, rozlozSzyldy, ulozDymek, kluczDymka, widziany, oznaczWidziany } from "./nakladka.mjs";
const w = JSON.parse(process.argv[2]);
const wynik = {};
// 1. gęsto: osiem punktów w jednym rzędzie, szyldy szersze niż rekwizyty, do tego postać
const pkt = w.punkty.map((r, i) => ({ id: i, rect: r, szyld: { w: 120, h: 24 }, gdzie: "dol" }));
const sz = rozlozSzyldy(pkt, { w: 1220, h: 612 }, w.przeszkody);
const pr = sz.map((s) => ({ x: s.x, y: s.y, w: 120, h: 24 }));
let kolizje = 0;
for (let i = 0; i < pr.length; i++) {
  for (let j = i + 1; j < pr.length; j++) if (naKrzyz(pr[i], pr[j])) kolizje++;
  for (const p of w.przeszkody) if (naKrzyz(pr[i], p)) kolizje++;
}
wynik.kolizje = kolizje;
wynik.wScenie = pr.every((r) => r.x >= 0 && r.y >= 0 && r.x + r.w <= 1220 && r.y + r.h <= 612);
wynik.nachodzi = sz.filter((s) => s.nachodzi).length;
// 2. dymek: obok postaci są rekwizyty z punktami – dymek nie wchodzi na nie i mieści się w scenie
const d = ulozDymek(w.osoba, { w: 200, h: 60 }, w.rekwizyty, { w: 1220, h: 612 });
const rd = { x: d.x, y: d.y, w: 200, h: 60 };
wynik.dymekNaRekwizycie = w.rekwizyty.some((p) => naKrzyz(rd, p));
wynik.dymekNaPostaci = naKrzyz(rd, w.osoba);
wynik.dymekWScenie = rd.x >= 0 && rd.y >= 0 && rd.x + 200 <= 1220 && rd.y + 60 <= 612;
// 3. dymek przy krawędzi sceny nadal się mieści
const k = ulozDymek({ x: 1130, y: 20, w: 80, h: 200 }, { w: 220, h: 80 }, [], { w: 1220, h: 612 });
wynik.krawedz = k.x + 220 <= 1220 && k.x >= 0 && k.y >= 0;
// 4. „nowe” znika po otwarciu
const klucz = kluczDymka(3, "kebab", "Wujek");
wynik.przed = widziany(klucz); oznaczWidziany(klucz); wynik.po = widziany(klucz);
wynik.innaRunda = widziany(kluczDymka(4, "kebab", "Wujek"));
console.log(JSON.stringify(wynik));
"""
WEJSCIE = {
    "punkty": [{"x": 100 + i * 130, "y": 300, "w": 110, "h": 90} for i in range(8)],
    "przeszkody": [{"x": 400, "y": 380, "w": 90, "h": 220}],
    "osoba": {"x": 500, "y": 300, "w": 92, "h": 232},
    "rekwizyty": [{"x": 380, "y": 200, "w": 110, "h": 90}, {"x": 600, "y": 260, "w": 140, "h": 100},
                  {"x": 380, "y": 100, "w": 400, "h": 80}],
}


@pytest.fixture(scope="module")
def pomiar(tmp_path_factory):
    if not shutil.which("node"):
        pytest.skip("brak node")
    kat = tmp_path_factory.mktemp("nakladka")
    shutil.copy(STATIC / "swiat" / "nakladka.js", kat / "nakladka.mjs")
    (kat / "pomiar.mjs").write_text(POMIAR, encoding="utf-8")
    wynik = subprocess.run(["node", "pomiar.mjs", json.dumps(WEJSCIE)], cwd=kat, capture_output=True,
                           text=True, encoding="utf-8", timeout=60)
    assert wynik.returncode == 0, wynik.stderr
    return json.loads(wynik.stdout)


def test_szyldy_nie_nachodza_na_siebie_ani_na_postac(pomiar):
    assert pomiar["kolizje"] == 0
    assert pomiar["nachodzi"] == 0


def test_szyldy_mieszcza_sie_w_scenie(pomiar):
    assert pomiar["wScenie"]


def test_dymek_nie_zaslania_rekwizytu_ani_postaci(pomiar):
    assert not pomiar["dymekNaRekwizycie"]
    assert not pomiar["dymekNaPostaci"]
    assert pomiar["dymekWScenie"]
    assert pomiar["krawedz"]


def test_znak_nowe_znika_po_otwarciu_dymka_i_wraca_w_nowej_rundzie(pomiar):
    assert pomiar["przed"] is False
    assert pomiar["po"] is True
    assert pomiar["innaRunda"] is False


def test_dymki_sa_domyslnie_zwiniete_a_telefon_ma_liste():
    css = (STATIC / "swiat" / "wnetrza.css").read_text(encoding="utf-8")
    assert re.search(r"\.wn-dymek[^{]*\{[^}]*display: none", css)          # zwinięty do czasu kliknięcia
    assert ".wn-osoba.otwarty .wn-dymek { display: grid; }" in css
    assert not re.search(r":hover \.wn-dymek", css)                       # sam kursor niczego nie otwiera
    assert "@media (max-width: 600px)" in css and ".sw-scena .sw-nakladka { display: none; }" in css
    assert ".sw-dymki { display: grid; }" in (STATIC / "swiat" / "swiat.css").read_text(encoding="utf-8")


def test_kapsulki_powrotu_w_jednej_linii():
    css = (STATIC / "swiat" / "swiat.css").read_text(encoding="utf-8")
    assert re.search(r"\.sw-wroty \{[^}]*flex-wrap: nowrap", css)
    assert '<div class="sw-wroty">' in (STATIC / "swiat" / "swiat.js").read_text(encoding="utf-8")


# --- kontrast małych napisów na scenie (P11): biały napis na tablicy, metalu i drewnie ---------------------------------
def _zmienne(paleta, tryb):
    css = re.sub(r"/\*.*?\*/", "", (STATIC / "motywy" / "zmienne.css").read_text(encoding="utf-8"), flags=re.S)
    pasujace = {
        ":root": True, '[data-tryb="ciemny"]': tryb == "ciemny",
        '[data-paleta="pewex"]': paleta == "pewex",
        '[data-paleta="pewex"][data-tryb="ciemny"]': (paleta, tryb) == ("pewex", "ciemny"),
        '[data-paleta="wysoka"]': paleta == "wysoka",
        '[data-paleta="wysoka"][data-tryb="ciemny"]': (paleta, tryb) == ("wysoka", "ciemny"),
    }
    d = {}
    for sel, blok in re.findall(r"([^{}]+)\{([^{}]*)\}", css):
        if pasujace.get(sel.strip()):
            d.update(re.findall(r"(--[\w-]+):\s*([^;]+);", blok))
    return d


def _kolor(v, d):
    v = v.strip()
    m = re.fullmatch(r"var\((--[\w-]+)\)", v)
    if m:
        return _kolor(d[m.group(1)], d)
    if v.startswith("#"):
        h = v.lstrip("#")
        h = "".join(c * 2 for c in h) if len(h) == 3 else h
        return [int(h[i:i + 2], 16) for i in (0, 2, 4)]
    m = re.fullmatch(r"color-mix\(in srgb,\s*(.+?)\s+(\d+)%,\s*(.+?)\)", v)
    a, b, p = _kolor(m.group(1), d), _kolor(m.group(3), d), int(m.group(2)) / 100
    return [a[i] * p + b[i] * (1 - p) for i in range(3)]


def _jasnosc(c):
    f = [(x / 255 / 12.92) if x / 255 <= 0.03928 else ((x / 255 + 0.055) / 1.055) ** 2.4 for x in c]
    return .2126 * f[0] + .7152 * f[1] + .0722 * f[2]


@pytest.mark.parametrize("paleta", ["bar", "pewex", "wysoka"])
@pytest.mark.parametrize("tryb", ["jasny", "ciemny"])
def test_bialy_napis_na_tablicy_metalu_i_drewnie_ma_kontrast(paleta, tryb):
    d = _zmienne(paleta, tryb)
    prog = 7 if paleta == "wysoka" else 4.5
    biel = _jasnosc(_kolor("var(--g-biel)", d))
    for tlo in ("--g-tablica", "--g-metal2", "--g-drewno"):
        t = _jasnosc(_kolor(f"var({tlo})", d))
        kontrast = (max(biel, t) + .05) / (min(biel, t) + .05)
        assert kontrast >= prog, f"{paleta}/{tryb}: biel na {tlo} = {kontrast:.2f}"
