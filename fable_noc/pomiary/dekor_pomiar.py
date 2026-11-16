"""Pomiar dekoru lokalu: ta sama gra botów (poziom średni) bez dekoru i z pełnym, najlepiej dopasowanym kompletem
(4 grupy elementów, 8 300 zł) kupionym przez jedną firmę w rundzie R_ZAKUP (wstrzyknięta decyzja bota).
Uruchomienie z katalogu gra/ (worktree): python -X utf8 dekor_pomiar.py [rundy] [ziarna] [strategie]
Zwrot = pierwszy tydzień po zakupie, w którym gotówka firmy z dekorem dogania gotówkę bez dekoru (różnica ≥ 0)."""
import copy
import statistics
import sys

from silnik.dane import dane_domyslne
from silnik.gra import Gra
from silnik.rynek import dekor as dk

R_ZAKUP = 4   # wyposażenie (a z nim sklep meblowy) odkrywa się w tygodniu 4 (katalog.yaml: inwestycje_wyposazenie)
RUNDY = int(sys.argv[1]) if len(sys.argv) > 1 else 24
ZIARNA = [int(x) for x in sys.argv[2].split(",")] if len(sys.argv) > 2 else [7, 11, 23]
STRATEGIE = sys.argv[3].split(",") if len(sys.argv) > 3 else list(dane_domyslne().boty["strategie"])


def rozegraj(ziarno: int, kto: str | None, wzor=None):
    """Gra botów; z `wzor` (gra kontrolna) powtarza jej decyzje co do joty, więc różnicę robi tylko dekor
    (bez szumu rozjeżdżających się decyzji botów). Zwraca (gra, stan końcowy, co kupiono)."""
    dane = dane_domyslne()
    strategie = list(dane.boty["strategie"])
    g = Gra.nowa("balans", [(n, n) for n in strategie], RUNDY, ziarno, poziomy={n: "sredni" for n in strategie})
    uzyty = {}
    for r in range(1, RUNDY + 1):
        if wzor is not None:
            g.decyzje[r] = {n: copy.deepcopy(d) for n, d in wzor.decyzje[r].items() if n in strategie}
            if kto and r == R_ZAKUP:
                lok = g.stan(r - 1).firmy[kto].lokale[0]
                styl = max((x for x in dane.mapa["dekor"]["style"] if x != "podstawowy"),
                           key=lambda x: dk.dopasowanie(dane, lok.id, x))
                uzyty.update(styl=styl, dop=dk.dopasowanie(dane, lok.id, styl), lokal=lok.id,
                             strefa=dane.lokale[lok.id]["strefa"])
                g.decyzje[r][kto]["dekor_kup"] = [[x, styl] for x in dane.mapa["dekor"]["grupy"]]
        s = g.przelicz(wymus=True)
    return g, s, uzyty


def popyt(s, n, r):
    return sum(v["popyt"] for v in s.wyniki[r][n]["sprzedaz"].values())


def zysk_porcji(s, n, rundy):
    """Zysk netto (po podatku) z jednej dodatkowej porcji w lokalu z zapasem mocy: (przychód − towary) / porcje × (1 − podatek)."""
    p = [(s.wyniki[r][n]["kpir"], sum(v["sprzedaz"] for v in s.wyniki[r][n]["sprzedaz"].values())) for r in rundy]
    k = sum(x["przychody"] - x["towary"] for x, _ in p) / sum(q for _, q in p)
    podatek = sum(x["dochod_netto"] for x, _ in p) / sum(x["dochod"] for x, _ in p)
    return k * podatek


def sprzedaz(s, n, r):
    return sum(v["sprzedaz"] for v in s.wyniki[r][n]["sprzedaz"].values())


wiersze = []
for ziarno in ZIARNA:
    g0, s0, _ = rozegraj(ziarno, None)
    for n in STRATEGIE:
        _, s1, u = rozegraj(ziarno, n, g0)
        roznica = {r: s1.wyniki[r][n]["gotowka"] - s0.wyniki[r][n]["gotowka"] for r in range(R_ZAKUP, RUNDY + 1)}
        zwrot = next((r - R_ZAKUP for r in range(R_ZAKUP + 1, RUNDY + 1) if roznica[r] >= 0), None)
        ost = RUNDY
        tyg = (roznica[ost] - roznica[R_ZAKUP + 1]) / (ost - R_ZAKUP - 1)   # średni przyrost różnicy na tydzień po zakupie
        po = range(R_ZAKUP + 1, RUNDY + 1)
        dpopyt = sum(popyt(s1, n, r) - popyt(s0, n, r) for r in po) / len(po)
        pot = dpopyt * zysk_porcji(s0, n, po)   # zysk tygodniowy, gdyby cały dodatkowy popyt został obsłużony
        wiersze.append({"dpopyt": dpopyt, "pot": pot, "popyt0": sum(popyt(s0, n, r) for r in po) / len(po),
                        "ziarno": ziarno, "firma": n, **u, "zwrot": zwrot, "roznica_koniec": roznica[ost],
                        "zysk_tyg": tyg, "sprz0": sum(sprzedaz(s0, n, r) for r in range(R_ZAKUP + 1, RUNDY + 1)),
                        "sprz1": sum(sprzedaz(s1, n, r) for r in range(R_ZAKUP + 1, RUNDY + 1)),
                        "ocena0": s0.firmy[n].lokale[0].ocena, "ocena1": s1.firmy[n].lokale[0].ocena,
                        "gotowka0": s0.firmy[n].gotowka, "gotowka1": s1.firmy[n].gotowka,
                        "cena": 8300})
print("| ziarno | firma | strefa | styl (dopasowanie) | ocena przed → po | popyt/tyg. przed (+Δ) | zysk/tyg. przy pełnej konwersji | zwrot przy pełnej konwersji (tyg.) | symulacja botów: przyrost gotówki/tyg. |")
print("|---|---|---|---|---|---|---|---|---|")
for w in wiersze:
    print(f"| {w['ziarno']} | {w['firma']} | {w['strefa']} | {w['styl']} ({w['dop']:.2f}) | {w['ocena0'] or 0:.2f} → {w['ocena1'] or 0:.2f} "
          f"| {w['popyt0']:.0f} (+{w['dpopyt']:.0f}, {w['dpopyt'] / w['popyt0']:+.1%}) | {w['pot']:.0f} zł "
          f"| {8300 / w['pot'] if w['pot'] > 0 else float('inf'):.1f} | {w['zysk_tyg']:.0f} zł |")
pot = statistics.mean(w["pot"] for w in wiersze)
sym = statistics.mean(w["zysk_tyg"] for w in wiersze)
print(f"\nŚrednio ({len(wiersze)} gier): zysk/tyg. przy pełnej konwersji {pot:.0f} zł → zwrot {8300 / pot:.1f} tyg.; "
      f"w symulacji botów (moc ograniczona godzinami kuchni) przyrost gotówki {sym:.0f} zł/tyg.")
for n in STRATEGIE:
    z = [w["pot"] for w in wiersze if w["firma"] == n]
    print(f"- {n}: zwrot przy pełnej konwersji {8300 / statistics.mean(z):.1f} tyg.")
