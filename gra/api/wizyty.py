"""Zapis wizyt drużyny we wnętrzach (warunek `wizyta` zeszytu wujka; treść: `api/zeszyt.py`).

- POST /api/gry/<id>/zeszyt/<firma>/wizyta   {"miejsce": "<id sceny>"}
  zapisuje wejście drużyny do wnętrza w bieżącej rundzie (decyzje[runda]["_zeszyt"][firma]);
  powtórne wejście nic nie zmienia. Mistrz gry oglądający cudzą drużynę i gra zakończona:
  bez zapisu.
"""
from __future__ import annotations

import re

from django.views.decorators.http import require_POST

from gry import serwisy

from .widoki import BladZapytania, _tylko_odczyt, api, cialo, odpowiedz, sprawdz_firme

MIEJSCE = re.compile(r"^[a-z0-9_]{1,40}$")
LIMIT_WIZYT = 100


def _wizyty(g, firma: str) -> list:
    return list(g.decyzje.get(g.runda, {}).get("_zeszyt", {}).get(firma, []))


@require_POST
@api
def api_zeszyt_wizyta(request, id_, firma):
    miejsce = cialo(request).get("miejsce")
    if not isinstance(miejsce, str) or not MIEJSCE.match(miejsce):
        raise BladZapytania('Oczekiwano {"miejsce": "<id sceny>"}.')
    with serwisy.zmiana(id_) as g:
        sprawdz_firme(request, id_, g, firma)
        if not g.zakonczona and not _tylko_odczyt(request, id_, firma):
            wszystkie = g.decyzje.setdefault(g.runda, {}).setdefault("_zeszyt", {})
            lista = wszystkie.setdefault(firma, [])
            if miejsce not in lista and len(lista) < LIMIT_WIZYT:
                lista.append(miejsce)
    return odpowiedz({"wizyty": _wizyty(g, firma)})
