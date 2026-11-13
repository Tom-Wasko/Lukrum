"""Panel mistrza gry (tylko rola mistrza gry): pulpit z grami, kreator gry, prowadzenie rund."""

from functools import wraps

from django.core.exceptions import PermissionDenied
from django.http import Http404
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie

from gry import serwisy
from gry.models import Gra
from konta.role import jest_mg
from silnik import funkcje as fn
from silnik.dane import dane_domyslne


def wymaga_mg(widok):
    @wraps(widok)
    def opakowanie(request, *args, **kwargs):
        if not jest_mg(request.user):
            raise PermissionDenied("Panel mistrza gry jest tylko dla mistrza gry.")
        return widok(request, *args, **kwargs)

    return opakowanie


def _funkcje_kreatora(dane) -> dict:
    """Krok 3 kreatora: funkcje i gotowe zestawy z `dane/funkcje.yaml` (J7)."""
    return {
        "funkcje": [
            {"klucz": k, "nazwa": f["nazwa"], "krotko": f.get("krotko", ""),
             "ikona": f.get("ikona"), "zakryta": f.get("zakryta", "")}
            for k, f in fn.rejestr(dane).items()
        ],
        "zestawy": [
            {"klucz": k, "nazwa": z["nazwa"], "opis": z.get("opis", ""),
             "stany": fn.stany_zestawu(dane, k)}
            for k, z in fn.zestawy(dane).items()
        ],
        "domyslny_zestaw": (getattr(dane, "funkcje", None) or {}).get("domyslny_zestaw"),
    }


@wymaga_mg
@ensure_csrf_cookie
def lista(request):
    dane = dane_domyslne()
    ustawienia = {
        "strategie": {k: v["nazwa"] for k, v in dane.boty["strategie"].items()},
        "poziomy": {k: v["nazwa"] for k, v in (dane.boty.get("poziomy") or {}).items()
                    if not v.get("tylko_pomiar")},   # bez poziomów do pomiarów (Z5: „jak człowiek”)
        "rundy": dane.katalog_ofert["rundy"]["domyslna_liczba"],
        "maks_rund": dane.rund_w_roku,
        "kapital": dane.z["finanse"]["kapital_startowy"],
        "kapital_tekst": f"{dane.z['finanse']['kapital_startowy']:,.0f}".replace(",", " "),
        "pierwsza": dane.nazwa_rundy(1),
        "okres": dane.okres["mianownik"],
        "mnoga": dane.okres["mnoga"],
    }
    ustawienia.update(_funkcje_kreatora(dane))
    return render(request, "panel_mg/lista.html", {"ustawienia": ustawienia})


@wymaga_mg
@ensure_csrf_cookie
def gra(request, id_):
    try:
        g = serwisy.wczytaj(id_)
    except Gra.DoesNotExist:
        raise Http404("Nie ma takiej gry.") from None
    return render(request, "panel_mg/gra.html", {"id": id_, "nazwa": g.konfiguracja["nazwa"]})
