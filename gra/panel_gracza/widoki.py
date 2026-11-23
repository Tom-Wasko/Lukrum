"""Strony gracza: lista gier, wybór firmy, strona z zakładkami."""

import secrets
from urllib.parse import quote

from django.core.exceptions import PermissionDenied
from django.http import Http404, JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import ensure_csrf_cookie

from gry import serwisy
from gry.models import Gra
from konta.druzyny import CIASTKO_URZADZENIA
from konta.role import firmy_ucznia, jest_mg, moze_firme

from . import moduly
from . import radio as radio_dane
from . import zrodla as zrodla_dane
from .instrukcja import instrukcja


def _gra(id_: str):
    try:
        return serwisy.wczytaj(id_)
    except Gra.DoesNotExist:
        raise Http404("Nie ma takiej gry.") from None


@never_cache
@ensure_csrf_cookie
def start(request):
    """Pulpit ucznia (seria „funkcje”, 9.11): karty gier drużyny z /api/pulpit. Mistrz gry
    widzi tu wszystkie gry tak jak drużyny, a nowe gry zakłada na swoim pulpicie (/mg/)."""
    return render(request, "panel_gracza/start.html", {"mg": jest_mg(request.user)})


def jak_grac(request):
    """Instrukcja dla graczy (INSTRUKCJA.md) – bez logowania, do przeczytania przed grą."""
    kontekst = instrukcja() | {"powrot": "/", "powrot_tekst": "Moje gry"}
    return render(request, "panel_gracza/jak_grac.html", kontekst)


def radio_json(request):
    """Stacje i nagrania radia „Fala Koziołka” dla odbiornika (static/pulpit/radio.js)."""
    return JsonResponse(radio_dane.dla_odbiornika())


def nagrania_w_radiu(request):
    """Spis nagrań radia: autor, wykonawca, rok, źródło i licencja każdego pliku (bez logowania)."""
    return render(request, "panel_gracza/nagrania_w_radiu.html", radio_dane.dla_strony())


def zrodla(request):
    """Nawiązania i źródła: lektury, liczby, prawo, autorzy grafik, fontów, nagrań (bez logowania)."""
    return render(request, "panel_gracza/zrodla.html", zrodla_dane.dla_strony())


@never_cache
@ensure_csrf_cookie
def wybor_firmy(request, id_):
    g = _gra(id_)
    ludzie = [f["nazwa"] for f in g.konfiguracja["firmy"] if not f["bot"]]
    if not jest_mg(request.user):
        moje = firmy_ucznia(request.user, id_)
        ludzie = [f for f in ludzie if f in moje]
        if not ludzie:
            raise PermissionDenied("Nie należysz do żadnej drużyny w tej grze.")
    if len(ludzie) == 1:
        return redirect(f"/gra/{quote(id_)}/{quote(ludzie[0], safe='')}")
    kontekst = {"id": id_, "gra": g.konfiguracja, "ludzie": ludzie}
    return render(request, "panel_gracza/wybor.html", kontekst)


@ensure_csrf_cookie
def strona_gry(request, id_, firma):
    g = _gra(id_)
    if firma not in {f["nazwa"] for f in g.konfiguracja["firmy"]}:
        raise Http404("Nie ma takiej firmy.")
    if not moze_firme(request.user, id_, firma):
        raise PermissionDenied("To nie jest firma Twojej drużyny.")
    kontekst = {"id": id_, "firma": firma, "mg": jest_mg(request.user), "moduly": moduly.lista()}
    odp = render(request, "panel_gracza/gra.html", kontekst)
    if not request.COOKIES.get(CIASTKO_URZADZENIA):   # przeglądarka w dzienniku zapisów
        odp.set_cookie(CIASTKO_URZADZENIA, secrets.token_hex(16), max_age=400 * 24 * 3600,
                       httponly=True, samesite="Lax")
    return odp
