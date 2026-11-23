"""Czas przeliczenia tygodnia przez silnik przy 8 drużynach (pomiar do `czas-lekcji.md`).

    python -X utf8 -m balans.czas_rundy [rundy] [zestaw]
    python -X utf8 -m balans.czas_rundy 6 lekcja_3_klient_i_opinia
"""
import statistics
import sys
import time

from silnik.dane import dane_domyslne
from silnik.gra import Gra


def zmierz(rund: int, zestaw: str | None, ziarno: int = 7) -> list[float]:
    strategie = list(dane_domyslne().boty["strategie"])
    firmy = [(f"Druzyna {i + 1}", strategie[i % len(strategie)]) for i in range(8)]
    g = Gra.nowa("czas", firmy, rund, ziarno, **({"funkcje": zestaw} if zestaw else {}))
    czasy = []
    for _ in range(rund):
        t = time.perf_counter()
        g.przelicz(wymus=True)
        czasy.append(time.perf_counter() - t)
    return czasy


if __name__ == "__main__":
    rund = int(sys.argv[1]) if len(sys.argv) > 1 else 6
    zestaw = sys.argv[2] if len(sys.argv) > 2 else None
    c = zmierz(rund, zestaw)
    print(f"zestaw {zestaw or '(wszystko odkryte)'}, 8 drużyn, {rund} rund")
    print("czasy rund [s]: " + ", ".join(f"{x:.2f}" for x in c))
    print(f"mediana {statistics.median(c):.2f} s, maksimum {max(c):.2f} s")
