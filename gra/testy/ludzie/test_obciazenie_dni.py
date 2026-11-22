"""obciążenie każdej osoby w dni tygodnia (Ludzie ▸ Zespół, wyniki – tabela pn–nd).

Dzień = praca potrzebna na obsłużenie wszystkich klientów, którzy przyszli (także tych, co odeszli z kolejki,
bo zabrakło godzin), wobec godzin stanowiska tego dnia. Ponad 1 – tyle pracy zabrakło. Tylko raport: wyniki gry
bez zmian, bez przeciążenia średnia z 7 dni = tygodniowe `obciazenie`."""
import pytest

from silnik.dane import dane_domyslne
from silnik.gra import Gra
from silnik.kuchnia.operacje import obsluz
from silnik.model import Firma, Pracownik, Stanowisko
from silnik.runda import _obciazenie_dni

D = dane_domyslne()
BOTY = ("zrownowazony", "agresywny")
RUND = 4


def _gra_botow():
    g = Gra.nowa("p6", [(b, b) for b in BOTY], RUND + 1, 7, poziomy={b: "sredni" for b in BOTY})
    for _ in range(RUND):
        s = g.przelicz(wymus=True)
    return s


def _osoby(s):
    for r, firmy in sorted(s.wyniki.items()):
        for f, w in firmy.items():
            for p in w.get("pracownicy", []):
                yield r, f, p


@pytest.fixture(scope="module")
def stan():
    return _gra_botow()


def test_siedem_dni_i_srednia_jak_tydzien(stan):
    sprawdzone = 0
    for r, _, p in _osoby(stan):
        dni = p.get("obciazenie_dni")
        if r == 1:   # pierwsza runda – bez lokalu i obsługi, tabeli nie ma
            assert dni is None
            continue
        assert isinstance(dni, list) and len(dni) == len(D.mapa["popyt"]["dni_tygodnia"]["nazwy"])
        if all(x is not None and x <= 1 for x in dni):   # bez przeciążenia – średnia dni = tydzień
            assert sum(dni) / len(dni) == pytest.approx(p["obciazenie"], abs=2e-3)
            sprawdzone += 1
    assert sprawdzone


def test_powtarzalnosc(stan):
    drugi = _gra_botow()
    assert [p.get("obciazenie_dni") for *_, p in _osoby(stan)] == [p.get("obciazenie_dni") for *_, p in _osoby(drugi)]


def test_bez_danych_dziennych_pusto(stan):
    f = next(iter(stan.firmy.values()))
    s = next(iter(f.stanowiska), None)
    assert _obciazenie_dni(D, f, None, s) == {}            # stary zapis / bez obsługi – panel nie pokazuje tabeli
    assert _obciazenie_dni(D, f, {"dni_kasy_lokali": {}}, s) == {}


def _firma_kebab(danie, zapas=10_000):
    """Jedno stanowisko kuchni z kucharzem, kasa z kasjerem, duży zapas składników (jakość 3)."""
    f = Firma(nazwa="C")
    sprzet = set(D.uslugi[danie]["sprzet"])
    f.stanowiska = [Stanowisko(nr=1, typ="kuchnia", sprzet={n: 3 for n in sprzet}, pracownik="k1"),
                    Stanowisko(nr=1, typ="kasa", sprzet={n: 3 for n in D.sprzet_kasy}, pracownik="r1")]
    for id_, zawod in (("k1", "Kucharz"), ("r1", "Kasjer")):
        f.pracownicy[id_] = Pracownik(id=id_, imie_nazwisko=id_, zawod=zawod, gwiazdki=3, pensja_preferowana=5300,
                                      koszt_rekrutacji=400, zadowolenie_klientow=0.95,
                                      ryzyko_pomylki=0.0, pensja=5300, stanowisko=1)
    for n in D.uslugi[danie]["zasoby"]:
        f.magazyn[f"{n}|3"] = zapas
        f.wartosc_magazynu_gr[f"{n}|3"] = zapas * 100
    return f


def test_bez_braku_potrzebne_rowne_przepracowanym():
    w = obsluz(D, _firma_kebab("kebab_w_bulce"), {"kebab_w_bulce": 300}, ziarno=1, runda=3)
    assert w["utracona"].get("kebab_w_bulce", 0) == 0
    assert w["potrzebne_stanowisk"][1] == pytest.approx(w["godziny_stanowisk"][1])
    assert w["potrzebne_kasy"] == pytest.approx(w["godziny_kasy"])
    assert w["potrzebne_stanowisk"][1] < w["pojemnosc_stanowisk"][1]


def test_za_mala_obsada_ponad_100():
    """Jeden kucharz i dziesięć razy za dużo klientów – potrzebne godziny kuchni ponad pojemność stanowiska."""
    f = _firma_kebab("kebab_w_bulce")
    w0 = obsluz(D, _firma_kebab("kebab_w_bulce"), {"kebab_w_bulce": 1}, ziarno=1, runda=3)
    h1 = w0["potrzebne_stanowisk"][1]                       # godziny kuchni na jednego klienta (grupa 1)
    popyt = round(10 * w0["pojemnosc_stanowisk"][1] / h1)
    w = obsluz(D, f, {"kebab_w_bulce": popyt}, ziarno=1, runda=3)
    assert w["przyczyna"]["kebab_w_bulce"] == "pracownicy/sprzęt"
    obc = w["potrzebne_stanowisk"][1] / w["pojemnosc_stanowisk"][1]
    assert obc > 1 and obc == pytest.approx(10, rel=0.05)
    assert w["godziny_stanowisk"][1] <= w["pojemnosc_stanowisk"][1] + 1e-6   # przepracowane – nie ponad godziny
