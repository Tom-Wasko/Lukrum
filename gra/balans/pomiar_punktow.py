"""Pomiar wyniku punktowego botów: średni wynik gry (0–1000), rozrzut, działy, bankructwa.

    python -X utf8 -m balans.pomiar_punktow [rundy] [poziomy] [ziarna] [-o plik.md]
    python -X utf8 -m balans.pomiar_punktow 12 latwy,sredni,trudny 7,11,23 -o pomiar.md

Wszystkie strategie z dane/boty.yaml grają w jednej grze na jednym poziomie (jak balans.symuluj).
Bankructwo to firma, która skończyła grę z gotówką ≤ 0 albo z długiem u Harpagona.
"""
import statistics as st
import sys
import time

from silnik.dane import dane_domyslne
from silnik.gra import Gra
from silnik.wyniki import punkty as pk


def gra(dane, rund: int, poziom: str, ziarno: int) -> dict:
    strategie = list(dane.boty["strategie"])
    firmy = [(n, n) for n in strategie]
    g = Gra.nowa("pomiar", firmy, rund, ziarno, poziomy={n: poziom for n in strategie})
    for _ in range(rund):
        s = g.przelicz(wymus=True)
    wynik = {}
    for n, f in s.firmy.items():
        karty = {r: s.wyniki[r][n]["karta"] for r in range(1, rund + 1)}
        dzialy = {}
        for r in range(2, rund + 1):
            for d, v in karty[r]["dzialy"].items():
                dzialy.setdefault(d, []).append(v["punkty"])
        tygodnie = {r: k["punkty"] for r, k in karty.items()}
        dlug = bool(f.harpagon and f.harpagon.dlug > 0)
        wynik[n] = {"wynik": pk.ranking(dane, tygodnie, rund)["wynik"],
                    "otwarcie": karty[1]["punkty"], "gotowka": f.gotowka,
                    "bankructwo": f.gotowka <= 0 or dlug,
                    "dzialy": {d: st.mean(x) for d, x in dzialy.items()}}
    return wynik


def tabela(dane, rund: int, poziomy: list[str], ziarna: list[int]) -> str:
    nazwy = list(dane.z["wynik"]["dzialy"])
    wiersze = []
    for poziom in poziomy:
        zbior: dict[str, list[dict]] = {}
        for z in ziarna:
            for n, x in gra(dane, rund, poziom, z).items():
                zbior.setdefault(n, []).append(x)
        wiersze.append(f"\n### Poziom {poziom} ({len(ziarna)} ziarna, {rund} rund)\n")
        wiersze.append("| strategia | wynik | min–maks | otwarcie | gotówka zł | bankructwa | "
                       + " | ".join(nazwy) + " |")
        wiersze.append("|" + "---|" * (6 + len(nazwy)))
        for n, xs in zbior.items():
            w = [x["wynik"] for x in xs]
            dz = " | ".join(f"{st.mean(x['dzialy'][d] for x in xs):.0f}" for d in nazwy)
            otw = st.mean(x["otwarcie"] for x in xs)
            kasa = st.mean(x["gotowka"] for x in xs)
            bank = sum(x["bankructwo"] for x in xs)
            wiersze.append(f"| {n} | {st.mean(w):.0f} | {min(w):.0f}–{max(w):.0f} | {otw:.0f} "
                           f"| {kasa:.0f} | {bank}/{len(xs)} | {dz} |")
    return "\n".join(wiersze)


if __name__ == "__main__":
    arg = sys.argv[1:]
    wyjscie = None
    if "-o" in arg:
        i = arg.index("-o")
        wyjscie = arg[i + 1]
        del arg[i:i + 2]
    d = dane_domyslne()
    rund = int(arg[0]) if arg else 12
    poziomy = arg[1].split(",") if len(arg) > 1 else list(d.boty["poziomy"])
    ziarna = [int(z) for z in arg[2].split(",")] if len(arg) > 2 else [7, 11, 23]
    t = time.time()
    tekst = tabela(d, rund, poziomy, ziarna)
    print(tekst)
    print(f"\n({time.time() - t:.0f} s)")
    if wyjscie:
        with open(wyjscie, "w", encoding="utf-8") as p:
            p.write(tekst + "\n")
