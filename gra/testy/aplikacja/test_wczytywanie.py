"""Wczytywanie panelu: `modulepreload` obejmuje wszystkie moduły dochodzące z `app.js`."""

import posixpath
import re
from pathlib import Path

from panel_gracza import moduly

STATIC = Path(moduly.KORZEN)


def _niezaleznie(wejscie):
    """Prostszy zbieracz: każde `from "./…"` i `import "./…"` w osiągalnych plikach."""
    wzor = re.compile(r"""(?<![\w.])(?:from|import)\s*["'](\.[^"']+)["']""")
    widziane, stos = set(), [wejscie]
    while stos:
        p = stos.pop()
        if p in widziane:
            continue
        widziane.add(p)
        for m in wzor.finditer((STATIC / p).read_text(encoding="utf-8")):
            stos.append(posixpath.normpath(posixpath.join(posixpath.dirname(p), m.group(1))))
    return widziane


def test_lista_preload_obejmuje_wszystkie_moduly_z_app_js():
    lista = set(moduly.graf())
    for plik in lista:
        assert (STATIC / plik).exists(), plik
    assert lista == _niezaleznie("app.js")
    assert len(lista) > 40


def test_strona_gry_ma_preload(client):
    r = client.post("/api/gry", {"nazwa": "Test wczytywania", "liczba_rund": 4, "ziarno": "1",
                                 "firmy": [{"nazwa": "Moja firma", "bot": None}]},
                    content_type="application/json")
    assert r.status_code == 200, r.json()
    html = client.get(f"/gra/{r.json()['id']}/Moja firma").content.decode()
    adresy = re.findall(r'<link rel="modulepreload" href="/static/v[0-9a-f]+/([^"]+)"', html)
    assert adresy == moduly.lista()
    assert "app.js" in adresy
