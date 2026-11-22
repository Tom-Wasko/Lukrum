"""Rozgrzanie silnika przy starcie serwera (`graj`, `hostuj`).

Pierwszy widok gry po starcie trwał ok. 2,2 s: dopiero wtedy ładowały się ciężkie moduły (scipy,
widoki API), a solver liniowy robił pierwsze obliczenie. Wątek w tle robi to z góry, więc serwer
odpowiada od razu, a pierwszy gracz nie czeka. Wołają to tylko komendy uruchamiające serwer;
testy i inne komendy zarządzania jej nie używają.
"""

import threading


def rozgrzej() -> None:
    """Ładuje moduły i wykonuje jedno małe obliczenie solvera (jak w kuchni)."""
    from scipy.optimize import linprog

    from api import widoki  # noqa: F401
    from silnik.kuchnia import operacje  # noqa: F401

    linprog(
        c=[-1.0, 0.0], A_ub=[[1.0, 1.0]], b_ub=[1.0], bounds=[(0, None), (0, 1)], method="highs"
    )


def rozgrzej_w_tle() -> threading.Thread:
    """Uruchamia `rozgrzej` w wątku-demonie. Błąd rozgrzewki nie może przeszkodzić serwerowi."""

    def praca():
        try:
            rozgrzej()
        except Exception:  # noqa: BLE001 - rozgrzewka jest tylko przyspieszeniem
            pass

    watek = threading.Thread(target=praca, name="rozgrzewka", daemon=True)
    watek.start()
    return watek
