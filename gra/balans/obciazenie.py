"""Próba obciążenia: klasa (domyślnie 30 uczniów w 8 drużynach) i mistrz gry na jednym serwerze.

Serwer uruchom jak `hostuj`, ale lokalnie, bez tunelu (od `graj` różni się brakiem konta
mistrza gry z automatu i `DEBUG=0`):

    LUKRUM_DEBUG=0 python -X utf8 manage.py runserver 127.0.0.1:8798 --noreload --nostatic

Skrypt zakłada konta i grę w tej samej bazie (`db.sqlite3` obok `manage.py`), potem w osobnych
wątkach loguje uczniów przez formularz, wczytuje panel, co kilka sekund pyta o `stan` (tak jak
strona), zapisuje decyzje (PUT), wysyła je, a mistrz gry zamyka rundę. Mierzy czasy odpowiedzi
(mediana, 95. percentyl, maksimum) i błędy.

    python -X utf8 -m balans.obciazenie [port] [uczniow] [druzyn] [sekund_decyzji] [zestaw]
"""

import http.cookiejar
import json
import os
import random
import re
import statistics
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "lukrum.settings")
import django  # noqa: E402

django.setup()

from django.contrib.auth import get_user_model  # noqa: E402

from gry import serwisy  # noqa: E402
from konta import druzyny  # noqa: E402
from konta.role import nadaj_mg  # noqa: E402
from silnik import Gra as GraSilnika  # noqa: E402
from silnik.boty import decyzje_bota  # noqa: E402

HASLO = "proba-klasa-1"
POMIARY: list[tuple[str, int, float]] = []  # (nazwa zapytania, status, ms)
BLEDY: list[str] = []
SKLAD: dict[str, list[str]] = {}
KONFLIKTY: list[str] = []
BLOKADA = threading.Lock()


def zaloz(uczniow: int, druzyn: int, zestaw: str | None) -> tuple[str, dict[str, list[str]], dict]:
    """Konta, gra i skład drużyn. Zwraca (id gry, {firma: [loginy]}, {firma: decyzje rundy 1})."""
    Konto = get_user_model()
    mg, _ = Konto.objects.get_or_create(username="mg_proba")
    mg.set_password(HASLO)
    mg.save()
    nadaj_mg(mg, True)
    firmy = [f"Druzyna {i + 1}" for i in range(druzyn)]
    g = GraSilnika.nowa("Proba obciazenia", [(f, None) for f in firmy], 3, 7, funkcje=zestaw)
    id_ = serwisy.utworz(g)
    sklad = {f: [] for f in firmy}
    for i in range(uczniow):
        login = f"proba{i + 1:02d}"
        u, _ = Konto.objects.get_or_create(username=login)
        u.set_password(HASLO)
        u.save()
        f = firmy[i % druzyn]
        druzyny.dodaj(id_, f, login)
        sklad[f].append(login)
    decyzje = {
        f: decyzje_bota(g.dane, g.stan(0), f, "zrownowazony", g.runda, g.konfiguracja)
        for f in firmy
    }
    return id_, sklad, decyzje


class Klient:
    def __init__(self, baza: str):
        self.baza = baza
        self.ciastka = http.cookiejar.CookieJar()
        self.otwieracz = urllib.request.build_opener(
            urllib.request.HTTPCookieProcessor(self.ciastka)
        )

    def token(self) -> str:
        return next((c.value for c in self.ciastka if c.name == "csrftoken"), "")

    def zapytanie(
        self, nazwa: str, metoda: str, sciezka: str, cialo=None, formularz=None
    ) -> tuple[int, bytes]:
        dane, naglowki = None, {"X-CSRFToken": self.token(), "Referer": self.baza + "/"}
        if cialo is not None:
            dane, naglowki["Content-Type"] = json.dumps(cialo).encode(), "application/json"
        if formularz is not None:
            dane = urllib.parse.urlencode(formularz).encode()
        zad = urllib.request.Request(
            self.baza + sciezka, data=dane, method=metoda, headers=naglowki
        )
        t = time.perf_counter()
        try:
            with self.otwieracz.open(zad, timeout=60) as o:
                status, tresc = o.status, o.read()
        except urllib.error.HTTPError as e:
            status, tresc = e.code, e.read()
        except Exception as e:  # noqa: BLE001 – brak połączenia, przekroczony czas
            status, tresc = 0, str(e).encode()
        ms = (time.perf_counter() - t) * 1000
        with BLOKADA:
            POMIARY.append((nazwa, status, ms))
            if status == 0 or status >= 500:
                tytul = re.search(rb"<title>(.*?)</title>", tresc, re.S)
                BLEDY.append(f"{nazwa} {status}: {(tytul.group(1) if tytul else tresc[:120])!r}")
        return status, tresc

    def zaloguj(self, login: str) -> bool:
        self.zapytanie("logowanie: strona", "GET", "/konta/login/")
        s, _ = self.zapytanie(
            "logowanie: wyslanie",
            "POST",
            "/konta/login/",
            formularz={"login": login, "password": HASLO, "csrfmiddlewaretoken": self.token()},
        )
        return s in (200, 302) and any(c.name == "sessionid" for c in self.ciastka)


def uczen(
    baza: str,
    id_: str,
    firma: str,
    login: str,
    decyzje: dict,
    sekund: float,
    start: threading.Event,
):
    k = Klient(baza)
    if not k.zaloguj(login):
        with BLOKADA:
            BLEDY.append(f"{login}: logowanie nie powiodło się")
        return
    start.wait()
    k.zapytanie("panel: strona gry", "GET", f"/gra/{id_}/{urllib.parse.quote(firma)}")
    s, t = k.zapytanie("panel: widok", "GET", f"/api/gry/{id_}/widok/{urllib.parse.quote(firma)}")
    wersja = ""
    if s == 200:
        wersja = json.loads(t).get("druzyna", {}).get("autorzy", {}).get("wersja", "")
    koniec = time.time() + sekund
    nast_stan = time.time() + random.uniform(0, 5)
    # w drużynie decyzje zmienia zwykle jedna osoba naraz (reszta czyta): zapisuje pierwsza z listy
    redaktor = login == SKLAD[firma][0]
    nast_zapis = time.time() + (random.uniform(3, 10) if redaktor else 1e9)
    while time.time() < koniec:
        teraz = time.time()
        if teraz >= nast_stan:  # strona pyta co 5 s (zakładki na żywo) albo co 20 s
            k.zapytanie("stan", "GET", f"/api/gry/{id_}/stan/{urllib.parse.quote(firma)}")
            nast_stan = teraz + random.choice([5, 5, 20])
        if teraz >= nast_zapis:
            s, t = k.zapytanie(
                "zapis decyzji",
                "PUT",
                f"/api/gry/{id_}/decyzje/{urllib.parse.quote(firma)}?wersja={wersja}&zakladka=Test",
                cialo=decyzje,
            )
            if s == 200:
                wersja = json.loads(t).get("druzyna", {}).get("autorzy", {}).get("wersja", wersja)
            elif s == 409:  # konflikt: strona wczytuje widok i powtarza
                with BLOKADA:
                    if len(KONFLIKTY) < 3:
                        KONFLIKTY.append(t[:200].decode("utf-8", "replace"))
                s, t = k.zapytanie(
                    "panel: widok", "GET", f"/api/gry/{id_}/widok/{urllib.parse.quote(firma)}"
                )
                if s == 200:
                    wersja = (
                        json.loads(t).get("druzyna", {}).get("autorzy", {}).get("wersja", wersja)
                    )
            nast_zapis = teraz + random.uniform(8, 15)
        time.sleep(0.25)


def raport(runda_s: float, uczniow: int) -> str:
    wiersze = [
        "| zapytanie | liczba | mediana ms | 95. percentyl ms | maks. ms | statusy ≠ 200 |",
        "|---|---|---|---|---|---|",
    ]
    nazwy = sorted({n for n, _, _ in POMIARY})
    for n in nazwy + ["(wszystkie)"]:
        p = [(s, ms) for nn, s, ms in POMIARY if n in (nn, "(wszystkie)")]
        ms = sorted(m for _, m in p)
        p95 = ms[min(len(ms) - 1, int(0.95 * len(ms)))]
        inne = {}
        for s, _ in p:
            if s not in (200, 302):
                inne[s] = inne.get(s, 0) + 1
        wiersze.append(
            f"| {n} | {len(ms)} | {statistics.median(ms):.0f} | {p95:.0f} | {ms[-1]:.0f} | "
            f"{', '.join(f'{k}×{v}' for k, v in sorted(inne.items())) or '–'} |"
        )
    return (
        "\n".join(wiersze)
        + f"\n\n{uczniow} uczniów, całość {runda_s:.0f} s; błędów serwera/połączenia: {len(BLEDY)}"
    )


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8798
    uczniow = int(sys.argv[2]) if len(sys.argv) > 2 else 30
    druzyn = int(sys.argv[3]) if len(sys.argv) > 3 else 8
    sekund = float(sys.argv[4]) if len(sys.argv) > 4 else 90
    zestaw = sys.argv[5] if len(sys.argv) > 5 else None
    baza = f"http://127.0.0.1:{port}"
    id_, sklad, decyzje = zaloz(uczniow, druzyn, zestaw)
    SKLAD.update(sklad)
    print(
        f"gra {id_}: {uczniow} uczniów, {druzyn} drużyn, zestaw {zestaw or '(wszystko odkryte)'}",
        flush=True,
    )
    start, wateki = threading.Event(), []
    for f, loginy in sklad.items():
        for lg in loginy:
            wateki.append(
                threading.Thread(target=uczen, args=(baza, id_, f, lg, decyzje[f], sekund, start))
            )
    for w in wateki:
        w.start()
    time.sleep(8)  # logowania (nie wliczamy do „pracy w lekcji”, ale są w pomiarach)
    t0 = time.time()
    start.set()
    for w in wateki:
        w.join()
    # wysłanie decyzji: po jednej osobie z drużyny, potem mistrz gry zamyka rundę
    kmg = Klient(baza)
    assert kmg.zaloguj("mg_proba"), "logowanie mistrza gry"
    wys = []
    for f, loginy in sklad.items():

        def wyslij(f=f, lg=loginy[0]):
            k = Klient(baza)
            k.zaloguj(lg)
            k.zapytanie(
                "wyslanie decyzji",
                "POST",
                f"/api/gry/{id_}/wyslij/{urllib.parse.quote(f)}",
                cialo={},
            )

        wys.append(threading.Thread(target=wyslij))
    for w in wys:
        w.start()
    for w in wys:
        w.join()
    kmg.zapytanie("MG: przeglad gry", "GET", f"/api/gry/{id_}/mg")
    kmg.zapytanie("MG: zamkniecie rundy", "POST", f"/api/gry/{id_}/przelicz", cialo={})
    kmg.zapytanie("MG: przeglad gry", "GET", f"/api/gry/{id_}/mg")
    # po przeliczeniu cała klasa wczytuje widok nowej rundy naraz
    po = []
    for f, loginy in sklad.items():
        for lg in loginy:

            def wczytaj(f=f, lg=lg):
                k = Klient(baza)
                k.zaloguj(lg)
                k.zapytanie(
                    "widok po zamknieciu rundy",
                    "GET",
                    f"/api/gry/{id_}/widok/{urllib.parse.quote(f)}",
                )

            po.append(threading.Thread(target=wczytaj))
    for w in po:
        w.start()
    for w in po:
        w.join()
    print(raport(time.time() - t0, uczniow))
    for k in KONFLIKTY:
        print("409:", k)
    for b in BLEDY[:10]:
        print("BŁĄD:", b)
