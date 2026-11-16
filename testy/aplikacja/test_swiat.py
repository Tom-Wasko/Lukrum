"""Świat gry (fable-swiat): miejsca z wnętrzami zamiast działów menu (panel_gracza/static/swiat/).

Pilnuje spójności danych, których nie sprawdzi przeglądarka w testach: klikalne miejsca prowadzą do istniejących
ekranów, budynki mapy do istniejących miejsc, a zestaw grafik jest aktualny.
"""
import re
import subprocess
import sys
from pathlib import Path

import yaml

GRA = Path(__file__).resolve().parents[2]
STATIC = GRA / "panel_gracza" / "static"
MIEJSCA_JS = (STATIC / "swiat" / "miejsca.js").read_text(encoding="utf-8")
INDEX_JS = (STATIC / "zakladki" / "index.js").read_text(encoding="utf-8")


def _ekrany() -> set[str]:
    """Klucze ekranów panelu: rejestr ZAKLADKI, zakładki złożone i dawne klucze (ALIAS)."""
    rejestr = re.search(r"const ZAKLADKI = \{([^}]*)\}", INDEX_JS).group(1)
    zlozone = re.findall(r"^  (\w+): zlozona\(", INDEX_JS, re.M)
    aliasy = re.search(r"export const ALIAS = \{([^}]*)\}", INDEX_JS).group(1)
    return set(re.findall(r"\w+", rejestr)) | set(zlozone) | set(re.findall(r"(\w+):", aliasy))


def test_punkty_miejsc_prowadza_do_istniejacych_ekranow():
    cele = set(re.findall(r'cel: "(\w+)"', MIEJSCA_JS))
    assert cele and cele <= _ekrany(), cele - _ekrany()


def test_miejsca_z_paska_maja_opis_i_ekrany():
    miejsca = set(re.findall(r"^  (\w+): \{\n    tytul:", MIEJSCA_JS, re.M))
    w_pasku = dict(re.findall(r'miejsce: "(\w+)",\s*pod: \[([^\]]*)\]', INDEX_JS))
    assert set(w_pasku) == miejsca
    for m, pod in w_pasku.items():
        assert set(re.findall(r'"(\w+)"', pod)) <= _ekrany(), m


def test_budynki_mapy_trafiaja_do_miejsc():
    """Każdy budynek z danych mapy (poza parkami) ma wnętrze albo ekran – nic nie zostaje bez wejścia."""
    mapa = yaml.safe_load((GRA / "dane" / "mapa" / "budynki.yaml").read_text(encoding="utf-8"))
    znane = set(re.findall(r'"(\w+)"', "\n".join(re.findall(r"budynki: \[([^\]]*)\]", MIEJSCA_JS))))
    znane |= set(re.findall(r"(\w+):", re.search(r"BUDYNEK_DO_EKRANU = \{([^}]*)\}", MIEJSCA_JS).group(1)))
    budynki = {b["id"] for b in mapa["budynki"] if b["zakladka"] != "zdarzenia"}
    zespoly = {z["id"] for z in mapa.get("zespoly", [])}
    assert budynki | zespoly <= znane, (budynki | zespoly) - znane
    assert znane <= budynki | zespoly, znane - budynki - zespoly


def test_zestaw_grafik_jest_aktualny():
    skrypt = GRA / "narzedzia" / "grafiki" / "zestaw.py"
    wynik = subprocess.run([sys.executable, str(skrypt), "--sprawdz"], capture_output=True, text=True)
    assert wynik.returncode == 0, wynik.stderr or wynik.stdout
