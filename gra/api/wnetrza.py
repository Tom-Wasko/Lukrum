"""Wnętrze kebaba w API: stan lokalu, dymki rundy, propozycje klientów i ustawienia dymków MG.

- GET  /api/gry/<id>/wnetrza/<firma>[?rodzaje=cena_smak,wos][&lokal=<id>]
  widok wnętrza drużyny (`rodzaje` – własny filtr gracza: tylko widok, nic nie zapisuje)
- POST /api/gry/<id>/wnetrza/<firma>/odpowiedz   {"odpowiedz": "<id>"}
  odpowiedź na propozycję bieżącej rundy
- GET/POST /api/gry/<id>/wnetrza-ustawienia   (tylko mistrz gry) {"dymki": {rodzaj: bool}}
  które rodzaje dymków są włączone; zmiana działa od następnego wyliczenia dymków
Drużyna widzi tylko swoją firmę (mistrz gry – każdą, ale odpowiedzi drużyn uczniów tylko czyta).
"""
from __future__ import annotations

from django.views.decorators.http import require_GET, require_http_methods, require_POST

from gry import serwisy
from silnik.wnetrza import propozycje as pr
from silnik.wnetrza import ustawienia as us
from silnik.wnetrza import widok as wd

from .widoki import BladZapytania, _moze_zmieniac, api, cialo, odpowiedz, sprawdz_firme, tylko_mg


def _wnetrza(g) -> None:
    if not g.dane.wnetrza:
        raise BladZapytania("Ta gra nie ma wnętrz.", 404)
    if g.zakonczona:
        raise BladZapytania("Gra jest zakończona.")


def _widok(g, firma: str, filtr: str | None, lokal: str | None) -> dict:
    try:
        wybrane = us.filtr_gracza(g.dane, filtr)
    except ValueError as e:
        raise BladZapytania(str(e)) from e
    return wd.widok(g.dane, g.stan(g.runda - 1), g.konfiguracja, firma, g.runda, wybrane, lokal)


@require_GET
@api
def api_wnetrza(request, id_, firma):
    g = serwisy.wczytaj(id_)
    sprawdz_firme(request, id_, g, firma)
    _wnetrza(g)
    return odpowiedz(_widok(g, firma, request.GET.get("rodzaje"), request.GET.get("lokal") or None))


@require_POST
@api
def api_wnetrza_odpowiedz(request, id_, firma):
    d = cialo(request)
    with serwisy.zmiana(id_) as g:
        sprawdz_firme(request, id_, g, firma)
        _wnetrza(g)
        _moze_zmieniac(request, id_, firma)
        if firma in g.wyslane():
            raise BladZapytania("Decyzje są wysłane – najpierw wróć do podejmowania decyzji.")
        p = wd.propozycja(g.dane, g.stan(g.runda - 1), g.konfiguracja, firma, g.runda)
        if p is None:
            raise BladZapytania("W tej rundzie nie ma propozycji do odpowiedzi.")
        pr.zapisz_odpowiedz(g.konfiguracja, firma, g.runda, p, str(d.get("odpowiedz", "")))
    return odpowiedz(_widok(g, firma, None, None))


@require_http_methods(["GET", "POST"])
@api
@tylko_mg
def api_wnetrza_ustawienia(request, id_):
    if request.method == "GET":
        g = serwisy.wczytaj(id_)
        _wnetrza_bez_konca(g)
        return odpowiedz(_ustawienia(g))
    d = cialo(request)
    zmiany = d.get("dymki")
    if not isinstance(zmiany, dict):
        raise BladZapytania("Oczekiwano {\"dymki\": {rodzaj: true/false}}.")
    with serwisy.zmiana(id_) as g:
        _wnetrza_bez_konca(g)
        us.ustaw(g.dane, g.konfiguracja, zmiany)   # ValueError → 400 (api)
    return odpowiedz(_ustawienia(g))


def _ustawienia(g) -> dict:
    return {"rodzaje": us.rodzaje(g.dane), "dymki": us.ustawione(g.dane, g.konfiguracja)}


def _wnetrza_bez_konca(g) -> None:
    """Ustawienia mistrza gry działają także po zakończeniu gry (nie ma nic do liczenia)."""
    if not g.dane.wnetrza:
        raise BladZapytania("Ta gra nie ma wnętrz.", 404)
