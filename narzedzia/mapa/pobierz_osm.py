"""Dane nowej mapy Lublina z OpenStreetMap → gra/panel_gracza/static/mapa/lublin.json.

Pobiera (Overpass) granice dzielnic, wodę, zieleń, drogi i kolej, upraszcza je i zapisuje jako ścieżki SVG
w metrach (rzut lokalny wokół środka miasta). Do tego geokoduje (Nominatim) miejsca z miasto.yaml i dodatkowe
punkty charakterystyczne Lublina oraz dopisuje `geo` lokalom w lokale.yaml, które go jeszcze nie mają. Dane © autorzy OpenStreetMap, licencja ODbL.

Uruchomienie z głównego folderu repo (wymaga PyYAML, czyli środowiska gry):
    gra/.venv/Scripts/python -X utf8 narzedzia/mapa/pobierz_osm.py [--bez-pamieci]

Odpowiedzi serwerów zostają w folderze tymczasowym systemu (ponowne uruchomienie nie pyta sieci drugi raz).
"""
from __future__ import annotations

import hashlib
import json
import math
import sys
import tempfile
import time
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

import yaml

REPO = Path(__file__).resolve().parents[2]
DANE = REPO / "gra" / "dane" / "mapa"
WYNIK = REPO / "gra" / "panel_gracza" / "static" / "mapa" / "lublin.json"
PAMIEC = Path(tempfile.gettempdir()) / "osm-pamiec"
NAGLOWKI = {"User-Agent": "geokoder-skrypt/1.0", "Accept-Language": "pl"}
OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass-api.de/api/interpreter",
            "https://overpass.kumi.systems/api/interpreter"]

# środek rzutu (plac Litewski) i ramka pobierania: południe, zachód, północ, wschód
LAT0, LON0 = 51.2482, 22.5600
RAMKA = (51.12, 22.42, 51.33, 22.72)
M_NA_STOPIEN = 111_194.9
COS0 = math.cos(math.radians(LAT0))

# uproszczenie (m) i progi
TOL = {"dzielnice": 12, "woda": 8, "zielen": 10, "glowne": 6, "ulice": 5, "kolej": 10, "rzeki": 6}
MIN_POLE_ZIELENI = 12_000     # m²; mniejsze skwery tylko z nazwą
MIN_POLE_WODY = 4_000
KLASY = {"motorway": "ekspresowa", "trunk": "ekspresowa", "motorway_link": "ekspresowa", "trunk_link": "ekspresowa",
         "primary": "glowna", "primary_link": "glowna", "secondary": "zbiorcza", "tertiary": "lokalna"}

# zapytania do geokodera tam, gdzie sam adres albo nazwa nie wystarcza
MIEJSCA = {
    "zamek": "Zamek Lubelski, Lublin", "brama_krakowska": "Brama Krakowska, Lublin",
    "wieza_trynitarska": "Wieża Trynitarska, Lublin", "plac_po_farze": "Plac Po Farze, Lublin",
    "plac_litewski": "Plac Litewski, Lublin", "csk": "Centrum Spotkania Kultur, Lublin",
    "umcs": "Plac Marii Curie-Skłodowskiej, Lublin", "kul": "Aleje Racławickie 14, Lublin",
    "politechnika_lubelska": "Nadbystrzycka 38D, Lublin", "dworzec_metropolitalny": "Dworzec Lublin, Lublin",
    "arena": "Arena Lublin, Lublin", "lotnisko": "Port Lotniczy Lublin", "gorki_czechowskie": "Górki Czechowskie, Lublin",
}
# punkty charakterystyczne Lublina poza danymi gry (tylko mapa): id, nazwa, zapytania do geokodera, opis
DODATKOWE = [
    ("trybunal", "Trybunał Koronny", ["Trybunał Koronny, Lublin", "Rynek 1, Lublin"],
     "Dawny ratusz na środku Rynku. Od 1578 roku zbierał się tu Trybunał Koronny, najwyższy sąd szlachecki. "
     "Pod budynkiem zaczyna się Lubelska Trasa Podziemna."),
    ("katedra", "Archikatedra", ["Archikatedra, Lublin", "Królewska 10, Lublin"],
     "Dawny kościół jezuitów z przełomu XVI i XVII wieku. W zakrystii akustycznej szept słychać w przeciwległym rogu."),
    ("brama_grodzka", "Brama Grodzka", ["Brama Grodzka, Lublin", "Grodzka 21, Lublin"],
     "Dawne przejście między miastem chrześcijańskim a dzielnicą żydowską, dlatego nazywana też Bramą Żydowską. "
     "Dziś działa tu Ośrodek „Brama Grodzka – Teatr NN”."),
    ("nowy_ratusz", "Nowy Ratusz", ["Plac Króla Władysława Łokietka 1, Lublin", "Ratusz, Lublin"],
     "Siedziba władz miasta przy placu Łokietka. W południe z balkonu rozlega się hejnał Lublina."),
    ("teatr", "Teatr im. Juliusza Osterwy", ["Teatr im. Juliusza Osterwy, Lublin", "Narutowicza 17, Lublin"],
     "Teatr przy ulicy Narutowicza w gmachu z XIX wieku."),
    ("centrum_kultury", "Centrum Kultury", ["Peowiaków 12, Lublin"],
     "Dawny klasztor wizytek przy ulicy Peowiaków. Koncerty, teatr i festiwale."),
    ("skansen", "Muzeum Wsi Lubelskiej", ["Muzeum Wsi Lubelskiej, Lublin", "Aleja Warszawska 96, Lublin"],
     "Skansen przy alei Warszawskiej: chałupy, dwór, wiatrak i miasteczko z dawnej Lubelszczyzny."),
    ("dworzec_glowny", "Dworzec Lublin Główny", ["Lublin Główny", "Dworzec PKP, Lublin"],
     "Dworzec kolejowy z XIX wieku, kilka kroków od Dworca Metropolitalnego."),
    ("most", "Most Lutosławskiego", ["Most Lutosławskiego, Lublin", "Most Mariana Lutosławskiego, Lublin"],
     "Zabytkowy żelbetowy most na Bystrzycy przy ulicy Zamojskiej, z początku XX wieku."),
    ("kosciol_czwartek", "Kościół św. Mikołaja na Czwartku", ["Kościół św. Mikołaja, Lublin", "Słowikowskiego 1, Lublin"],
     "Kościół na wzgórzu Czwartek. Tu, przy dawnym targu, zaczynał się Lublin."),
    ("cmentarz_lipowa", "Cmentarz przy Lipowej", ["Cmentarz przy ulicy Lipowej, Lublin", "Lipowa 16, Lublin"],
     "Zabytkowy cmentarz z końca XVIII wieku z częściami katolicką, ewangelicką, prawosławną i wojskową."),
]
# lokale, których adresu geokoder nie znajduje nad Zalewem (ul. Żeglarska wypada poza miastem): położenie z ręki
POPRAWKI = {"zemborzyce_1": (51.1915, 22.5290), "zemborzyce_3": (51.1830, 22.5165)}
# punkty charakterystyczne, które geokoder myli z innym miejscem albo stawia na lokalu z danych gry
POPRAWKI_MIEJSC = {"nowy_ratusz": (51.2478, 22.5657), "dworzec_glowny": (51.2307, 22.5693)}
POZA_MIASTEM = {"Świdnik Duży-Leśniczówka"}   # dzielnica sąsiedniej gminy w ramce pobierania


# --- sieć z pamięcią -------------------------------------------------------------------------------------------------

def _z_pamieci(klucz: str, pobierz, uzyj=True):
    PAMIEC.mkdir(exist_ok=True)
    plik = PAMIEC / (hashlib.sha1(klucz.encode()).hexdigest() + ".json")
    if uzyj and plik.exists():
        return json.loads(plik.read_text(encoding="utf-8"))
    dane = pobierz()
    plik.write_text(json.dumps(dane), encoding="utf-8")
    return dane


def overpass(zapytanie: str, uzyj_pamieci=True) -> list[dict]:
    def pobierz():
        blad = None
        for proba in range(6):
            adres = OVERPASS[proba % len(OVERPASS)]
            try:
                zadanie = urllib.request.Request(adres, data=urllib.parse.urlencode({"data": zapytanie}).encode(),
                                                 headers=NAGLOWKI)
                with urllib.request.urlopen(zadanie, timeout=100) as odp:
                    return json.load(odp)["elements"]
            except Exception as e:  # noqa: BLE001 – serwery Overpass bywają przeciążone, próbujemy następny
                blad = e
                print(f"  {adres}: {e}; ponawiam", file=sys.stderr)
                time.sleep(4 + 3 * proba)
        raise RuntimeError(f"Overpass nie odpowiada: {blad}")
    return _z_pamieci(zapytanie, pobierz, uzyj_pamieci)


def geokoduj(zapytanie: str, uzyj_pamieci=True) -> tuple[float, float] | None:
    def pobierz():
        url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode({
            "q": zapytanie, "format": "jsonv2", "limit": 1, "countrycodes": "pl",
            "viewbox": "22.38,51.35,22.80,51.10", "bounded": 1})
        with urllib.request.urlopen(urllib.request.Request(url, headers=NAGLOWKI), timeout=30) as odp:
            wynik = json.load(odp)
        time.sleep(1.1)   # zasady Nominatim: najwyżej jedno zapytanie na sekundę
        return [float(wynik[0]["lat"]), float(wynik[0]["lon"])] if wynik else None
    w = _z_pamieci("nominatim:" + zapytanie, pobierz, uzyj_pamieci)
    return tuple(w) if w else None


# --- geometria -------------------------------------------------------------------------------------------------------

def rzut(lat: float, lon: float) -> tuple[float, float]:
    """Stopnie → metry od środka; x na wschód, y na południe (jak w SVG)."""
    return (lon - LON0) * M_NA_STOPIEN * COS0, -(lat - LAT0) * M_NA_STOPIEN


def uprosc(p: list[tuple[float, float]], tol: float) -> list[tuple[float, float]]:
    """Douglas–Peucker bez rekurencji."""
    if len(p) < 3:
        return p
    zostaw = [False] * len(p)
    zostaw[0] = zostaw[-1] = True
    stos = [(0, len(p) - 1)]
    while stos:
        a, b = stos.pop()
        (x1, y1), (x2, y2) = p[a], p[b]
        dx, dy = x2 - x1, y2 - y1
        dl = math.hypot(dx, dy) or 1e-9
        naj, gdzie = 0.0, -1
        for i in range(a + 1, b):
            d = abs(dy * (p[i][0] - x1) - dx * (p[i][1] - y1)) / dl if dl > 1e-6 else math.hypot(p[i][0] - x1, p[i][1] - y1)
            if d > naj:
                naj, gdzie = d, i
        if naj > tol and gdzie > 0:
            zostaw[gdzie] = True
            stos += [(a, gdzie), (gdzie, b)]
    return [q for q, z in zip(p, zostaw) if z]


def pole(p) -> float:
    return abs(sum(p[i][0] * p[i - 1][1] - p[i - 1][0] * p[i][1] for i in range(len(p)))) / 2


def srodek(p) -> list[int]:
    """Środek ciężkości wielokąta (dla napisów)."""
    a = cx = cy = 0.0
    for i in range(len(p)):
        (x1, y1), (x2, y2) = p[i - 1], p[i]
        k = x1 * y2 - x2 * y1
        a += k
        cx += (x1 + x2) * k
        cy += (y1 + y2) * k
    if abs(a) < 1e-6:
        return [round(sum(q[0] for q in p) / len(p)), round(sum(q[1] for q in p) / len(p))]
    return [round(cx / (3 * a)), round(cy / (3 * a))]


def sciezka(p, zamknij=False) -> str:
    """Ścieżka SVG w metrach, współrzędne względne (krócej)."""
    q = [(round(x), round(y)) for x, y in p]
    czesci = [f"M{q[0][0]} {q[0][1]}"]
    for (x0, y0), (x1, y1) in zip(q, q[1:]):
        if (x1, y1) != (x0, y0):
            czesci.append(f"l{x1 - x0} {y1 - y0}")
    return "".join(czesci) + ("z" if zamknij else "")


def punkty(el) -> list[tuple[float, float]]:
    return [rzut(g["lat"], g["lon"]) for g in el.get("geometry", []) if g]


def pierscienie(el) -> list[list[tuple[float, float]]]:
    """Zamknięte obrysy zewnętrzne drogi (way) albo relacji (sklejone z członków „outer”)."""
    if el["type"] == "way":
        p = punkty(el)
        return [p] if len(p) > 3 and p[0] == p[-1] else []
    kawalki = [punkty(m) for m in el.get("members", []) if m["type"] == "way" and m.get("role") != "inner" and m.get("geometry")]
    gotowe, kawalki = [], [k for k in kawalki if len(k) > 1]
    while kawalki:
        obrys = kawalki.pop()
        while obrys[0] != obrys[-1]:
            for i, k in enumerate(kawalki):
                if k[0] == obrys[-1]:
                    obrys += k[1:]
                elif k[-1] == obrys[-1]:
                    obrys += k[-2::-1]
                elif k[-1] == obrys[0]:
                    obrys = k[:-1] + obrys
                elif k[0] == obrys[0]:
                    obrys = k[:0:-1] + obrys
                else:
                    continue
                kawalki.pop(i)
                break
            else:
                break   # niedomknięty obrys (ucięty ramką) – pomijamy
        if obrys[0] == obrys[-1] and len(obrys) > 3:
            gotowe.append(obrys)
    return gotowe


def sklej(linie: list[list[tuple[float, float]]]) -> list[list[tuple[float, float]]]:
    """Łączy odcinki o wspólnych końcach w dłuższe linie (mniej ścieżek, ładniejsze napisy ulic)."""
    linie = [list(x) for x in linie if len(x) > 1]
    konce: dict[tuple, list[int]] = {}
    for i, x in enumerate(linie):
        for k in (x[0], x[-1]):
            konce.setdefault(k, []).append(i)
    zuzyte, wynik = set(), []
    for i in range(len(linie)):
        if i in zuzyte:
            continue
        zuzyte.add(i)
        lin = linie[i]
        for przod in (True, False):
            while True:
                k = lin[-1] if przod else lin[0]
                kand = [j for j in konce.get(k, []) if j not in zuzyte]
                if len(kand) != 1:   # skrzyżowanie albo koniec
                    break
                j = kand[0]
                zuzyte.add(j)
                nast = linie[j] if linie[j][0] == k else linie[j][::-1]
                lin = lin + nast[1:] if przod else nast[::-1][:-1] + lin
        wynik.append(lin)
    return wynik


def w_polowie(p) -> tuple[tuple[float, float], tuple[float, float]]:
    """Punkt w połowie długości linii i jednostkowy kierunek linii w tym miejscu."""
    pol, przeszlo = dlugosc(p) / 2, 0.0
    for a, b in zip(p, p[1:]):
        odc = math.hypot(b[0] - a[0], b[1] - a[1])
        if odc and przeszlo + odc >= pol:
            t = (pol - przeszlo) / odc
            return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t), ((b[0] - a[0]) / odc, (b[1] - a[1]) / odc)
        przeszlo += odc
    return p[0], (1.0, 0.0)


def dlugosc(p) -> float:
    return sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(p, p[1:]))


# --- warstwy ---------------------------------------------------------------------------------------------------------

def ramka() -> str:
    return ",".join(str(x) for x in RAMKA)


def dzielnice(pam) -> tuple[list[dict], list[float]]:
    el = overpass(f'[out:json][timeout:120];rel["boundary"="administrative"]["admin_level"="9"]({ramka()});out geom;', pam)
    wynik, zasieg = [], [1e9, 1e9, -1e9, -1e9]
    for e in sorted(el, key=lambda e: e["tags"].get("name", "")):
        obrysy = sorted(pierscienie(e), key=pole, reverse=True)
        if not obrysy or e["tags"].get("name") in POZA_MIASTEM:
            continue
        p = uprosc(obrysy[0], TOL["dzielnice"])
        for x, y in p:
            zasieg = [min(zasieg[0], x), min(zasieg[1], y), max(zasieg[2], x), max(zasieg[3], y)]
        wynik.append({"nazwa": e["tags"]["name"], "d": sciezka(p, True), "srodek": srodek(p)})
    return wynik, [round(v) for v in zasieg]


def woda(pam) -> tuple[list[dict], list[dict]]:
    el = overpass(f'[out:json][timeout:120];(nwr["natural"="water"]({ramka()});'
                  f'way["waterway"~"^(river|stream)$"]["name"~"Bystrzyca|Czechówka|Czerniejówka"]({ramka()}););out geom;', pam)
    zbiorniki, rzeki = [], {}
    for e in el:
        t = e.get("tags", {})
        if t.get("waterway"):
            rzeki.setdefault(t["name"], []).append(punkty(e))
            continue
        for p in pierscienie(e):
            if pole(p) >= MIN_POLE_WODY:
                p = uprosc(p, TOL["woda"])
                zbiorniki.append({"nazwa": t.get("name"), "d": sciezka(p, True), "srodek": srodek(p), "pole": round(pole(p))})
    linie = [{"nazwa": n, "d": "".join(sciezka(uprosc(x, TOL["rzeki"])) for x in sklej(odc))} for n, odc in sorted(rzeki.items())]
    return sorted(zbiorniki, key=lambda z: -z["pole"]), linie


def zielen(pam) -> list[dict]:
    el = overpass(f'[out:json][timeout:180];(nwr["leisure"~"^(park|garden|nature_reserve)$"]({ramka()});'
                  f'nwr["landuse"~"^(forest|cemetery|meadow)$"]({ramka()});nwr["natural"="wood"]({ramka()}););out geom;', pam)
    wynik = []
    for e in el:
        t = e.get("tags", {})
        rodzaj = ("park" if t.get("leisure") else "cmentarz" if t.get("landuse") == "cemetery"
                  else "laka" if t.get("landuse") == "meadow" else "las")
        for p in pierscienie(e):
            a = pole(p)
            if a >= MIN_POLE_ZIELENI or (rodzaj == "park" and t.get("name") and a >= 4_000):
                p = uprosc(p, TOL["zielen"])
                wynik.append({"rodzaj": rodzaj, "nazwa": t.get("name") if rodzaj == "park" else None,
                              "d": sciezka(p, True), "srodek": srodek(p), "pole": round(a)})
    return sorted(wynik, key=lambda z: -z["pole"])


def glowne_drogi(pam) -> list[dict]:
    wzor = "|".join(KLASY)
    return overpass(f'[out:json][timeout:180];way["highway"~"^({wzor})$"]({ramka()});out geom;', pam)


def drogi(pam) -> tuple[list[dict], dict[str, str]]:
    el = glowne_drogi(pam)
    grupy: dict[tuple[str, str], list] = {}
    for e in el:
        t = e["tags"]
        grupy.setdefault((KLASY[t["highway"]], t.get("name") or t.get("ref") or ""), []).append(punkty(e))
    glowne = []
    for (klasa, nazwa), odc in sorted(grupy.items()):
        linie = [uprosc(x, TOL["glowne"]) for x in sklej(odc)]
        naj = max(linie, key=dlugosc)
        sr, kier = w_polowie(naj)
        if kier[0] < 0 or (abs(kier[0]) < 0.15 and kier[1] > 0):   # napis stoi w połowie ulicy: tam ma iść od lewej (pionowy – z dołu do góry)
            naj, kier = naj[::-1], (-kier[0], -kier[1])
        wpis = {"klasa": klasa, "nazwa": nazwa or None, "d": "".join(sciezka(x) for x in linie), "napis": None, "dl": round(dlugosc(naj))}
        if nazwa and dlugosc(naj) > 350:   # sr i kier: środek i kierunek napisu – mapa chowa napis, który wchodzi pod żeton
            wpis.update(napis=sciezka(naj), sr=[round(sr[0]), round(sr[1])], kier=[round(kier[0], 2), round(kier[1], 2)])
        glowne.append(wpis)
    # ulice osiedlowe: tylko rysunek, pokazywany z bliska; jedna ścieżka na kafel 2×2 km (przeglądarka nie rysuje całości)
    el = overpass(f'[out:json][timeout:180];way["highway"~"^(residential|unclassified|living_street|pedestrian)$"]'
                  f'["area"!="yes"]({ramka()});out geom;', pam)
    kafle: dict[str, list[str]] = {}
    for x in sklej([punkty(e) for e in el]):
        x = uprosc(x, TOL["ulice"])
        if dlugosc(x) < 40:
            continue
        kafle.setdefault(f"{int(x[0][0] // 2000)},{int(x[0][1] // 2000)}", []).append(sciezka(x))
    return glowne, {k: "".join(v) for k, v in sorted(kafle.items())}


def kolej(pam) -> str:
    el = overpass(f'[out:json][timeout:120];way["railway"="rail"][!"service"]({ramka()});out geom;', pam)
    return "".join(sciezka(uprosc(x, TOL["kolej"])) for x in sklej([punkty(e) for e in el]) if dlugosc(x) > 150)


def uzupelnij_geo_lokali(pam) -> list[str]:
    """Dopisuje `geo` do lokali w lokale.yaml, które go nie mają (z adresu; POPRAWKI – położenia wpisane z ręki).
    Zmienia tylko te wpisy: nowa linia pod `adres:`. Żeby przeliczyć lokal po zmianie adresu, usuń jego `geo`."""
    plik = DANE / "lokale.yaml"
    surowy = plik.read_bytes()
    nl = "\r\n" if b"\r\n" in surowy else "\n"
    tekst = surowy.decode("utf-8").replace("\r\n", "\n")
    nowe = {}
    for lok in yaml.safe_load(tekst)["lokale"]:
        if lok.get("geo"):
            continue
        adres = lok["adres"].removeprefix("ul. ").removeprefix("al. ").replace("pl. ", "Plac ")
        wsp = POPRAWKI.get(lok["id"]) or geokoduj(f"{adres}, Lublin", pam) or geokoduj(f"{adres.rsplit(' ', 1)[0]}, Lublin", pam)
        if not wsp:
            raise RuntimeError(f"brak położenia lokalu {lok['id']} ({lok['adres']})")
        nowe[lok["id"]] = wsp
    if not nowe:
        return []
    linie, biezacy = [], None
    for linia in tekst.split("\n"):
        linie.append(linia)
        if linia.startswith("- id: "):
            biezacy = linia[6:].strip()
        elif linia.startswith("  adres:") and biezacy in nowe:
            lat, lon = nowe.pop(biezacy)
            linie.append(f"  geo: {{lat: {lat:.5f}, lon: {lon:.5f}}}")
    plik.write_bytes("\n".join(linie).replace("\n", nl).encode("utf-8"))
    return sorted(set(n["id"] for n in yaml.safe_load(tekst)["lokale"] if not n.get("geo")))


def punkty_gry(pam) -> dict:
    wynik = {"miejsca": {}}

    def xy(wsp):
        x, y = rzut(*wsp)
        return [round(x), round(y)]

    for ident, pytanie in MIEJSCA.items():
        wsp = geokoduj(pytanie, pam)
        if wsp:
            wynik["miejsca"][ident] = xy(wsp)
        else:
            print(f"  brak miejsca: {ident}", file=sys.stderr)
    wynik["dodatkowe"] = []
    for ident, nazwa, pytania, opis in DODATKOWE:
        wsp = POPRAWKI_MIEJSC.get(ident) or next((w for w in (geokoduj(q, pam) for q in pytania) if w), None)
        if wsp:
            wynik["dodatkowe"].append({"id": ident, "nazwa": nazwa, "opis": opis, "xy": xy(wsp)})
        else:
            print(f"  brak miejsca: {ident}", file=sys.stderr)
    return wynik


def main():
    pam = "--bez-pamieci" not in sys.argv
    print("dzielnice…")
    dz, zasieg = dzielnice(pam)
    print("woda…")
    zbiorniki, rzeki = woda(pam)
    print("zieleń…")
    ziel = zielen(pam)
    print("drogi…")
    glowne, ulice = drogi(pam)
    print("kolej…")
    tory = kolej(pam)
    print("lokale i miejsca…")
    dopisane = uzupelnij_geo_lokali(pam)
    pkt = punkty_gry(pam)
    wynik = {
        "zrodlo": "© autorzy OpenStreetMap, licencja ODbL (openstreetmap.org/copyright)",
        "pobrano": date.today().isoformat(),
        "rzut": {"lat0": LAT0, "lon0": LON0, "m_na_stopien": M_NA_STOPIEN, "cos0": round(COS0, 6)},
        "zasieg": zasieg, "dzielnice": dz, "woda": zbiorniki, "rzeki": rzeki, "zielen": ziel,
        "drogi": glowne, "ulice": ulice, "kolej": tory, **pkt,
    }
    WYNIK.parent.mkdir(parents=True, exist_ok=True)
    WYNIK.write_text(json.dumps(wynik, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{WYNIK.relative_to(REPO)}: {WYNIK.stat().st_size // 1024} kB; dzielnic {len(dz)}, wód {len(zbiorniki)}, "
          f"zieleni {len(ziel)}, dróg {len(glowne)}, kafli ulic {len(ulice)}, miejsc {len(pkt['miejsca'])} + {len(pkt['dodatkowe'])}; "
          f"geo dopisane do lokali: {len(dopisane)}")


if __name__ == "__main__":
    main()
