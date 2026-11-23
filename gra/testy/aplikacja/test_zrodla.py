"""Strona „Nawiązania i źródła” (/zrodla, wątek 03/prawo, 23.11.2026): treść z dane/zrodla.yaml, dostępna bez logowania,
z odnośnikami w ⚙ i w stopce „Jak grać”; w kodzie i danych nie ma starej liczby ze wspólnego projektu (decyzja szefa)."""

from pathlib import Path

import pytest
import yaml

GRA = Path(__file__).resolve().parents[2]
DANE = yaml.safe_load((GRA / "dane" / "zrodla.yaml").read_text(encoding="utf-8"))


@pytest.mark.django_db
def test_strona_zrodel_pokazuje_dane(client):
    r = client.get("/zrodla", REMOTE_ADDR="10.0.0.5")
    assert r.status_code == 200
    html = r.content.decode()
    for n in DANE["nawiazania"]["pozycje"]:
        assert n["autor"] in html and n["utwor"] in html
    for f in DANE["fonty"]["pozycje"]:
        assert f["nazwa"] in html and f["adres"] in html
    assert "OpenStreetMap" in html and "ODbL" in html and "/nagrania-w-radiu" in html
    assert "potwierdzone" in html and "skalibrowane" in html and "założenie" in html


def test_liczby_wg_pewnosci_sa_dodatnie():
    from panel_gracza import zrodla
    ile = {p["nazwa"]: p["ile"] for p in zrodla.liczby_wg_pewnosci()}
    assert sum(ile.values()) > 50 and ile["założenie"] > 0


@pytest.mark.django_db
def test_odnosniki_do_strony(client):
    assert "/zrodla" in client.get("/jak-grac", REMOTE_ADDR="10.0.0.5").content.decode()
    assert "/zrodla" in (GRA / "panel_gracza" / "static" / "pulpit" / "pulpit.js").read_text(encoding="utf-8")
    assert "/zrodla" in (GRA / "INSTRUKCJA.md").read_text(encoding="utf-8")


def test_wszystkie_nawiazania_z_instrukcji_sa_w_danych():
    """Klucz w INSTRUKCJA.md i w dane/zrodla.yaml mówią to samo (tabela „Klucz do nawiązań literackich”)."""
    tekst = (GRA / "INSTRUKCJA.md").read_text(encoding="utf-8")
    klucz = tekst.split("### Klucz do nawiązań literackich", 1)[1].split("\n---", 1)[0]
    wiersze = [w for w in klucz.splitlines() if w.startswith("| ") and not w.startswith("| W grze") and "---" not in w]
    assert len(wiersze) == len(DANE["nawiazania"]["pozycje"])
    for n in DANE["nawiazania"]["pozycje"]:
        assert any(n["w_grze"] in w and n["autor"] in w for w in wiersze), n["w_grze"]


def test_nie_ma_liczby_0_3162():
    for sciezka in [*(GRA / "dane").rglob("*.yaml"), *(GRA / "silnik").rglob("*.py"), GRA / "INSTRUKCJA.md", GRA / "README.md"]:
        tekst = sciezka.read_text(encoding="utf-8")
        assert "0,31" + "62" not in tekst and "0.31" + "62" not in tekst, sciezka
