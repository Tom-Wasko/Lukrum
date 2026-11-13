"""Porównanie banków na typowych scenariuszach (dane/mapa/banki.yaml).

    python -X utf8 -m balans.koszty_bankow [rundy] [-o plik.md]

Scenariusze (każdy opłaca się innej strategii): tani lokal z dużym obrotem (konto i terminal),
oszczędzanie nadwyżki (lokaty), kredyt na start, kredyt inwestycyjny pod zastaw, leasing, debet.
Kreska – bank nie ma takiego produktu. Liczby w zł na całą grę (domyślnie 12 rund).
"""
import sys

from silnik.dane import dane_domyslne

OBROT_TYGODNIA = 20000      # sprzedaż tygodnia: scenariusz taniego lokalu z dużym obrotem
NADWYZKA = 40000            # gotówka na lokatach
KREDYT_START = 30000        # kredyt na start (26 rund)
KREDYT_INWEST = 150000      # kredyt pod zastaw lokalu (104 rundy)
SPRZET = 30000              # cena sprzętu w leasingu
DEBET = 30000               # debet przez 3 tygodnie


def odsetki_kredytu(kwota: float, stopa: float, rund: int, rwr: int, ile: int) -> float:
    """Odsetki z `ile` pierwszych rat kredytu o równych ratach kapitałowych."""
    return sum((kwota - kwota / rund * k) * stopa / rwr for k in range(ile))


def kredyt(k: dict | None, kwota: float, okres: int, rwr: int, rund: int) -> int | None:
    if not k:
        return None
    odsetki = odsetki_kredytu(kwota, k["oprocentowanie"], okres, rwr, rund)
    return round(kwota * k["prowizja"] + odsetki)


def leasing(lz: dict | None, rwr: int, rund: int) -> int | None:
    if not lz:
        return None
    rata_odsetek = SPRZET * (1 - lz["wplata"]) * lz["oprocentowanie"] / rwr
    return round(SPRZET * lz["wplata"] + rund * rata_odsetek)


def debet(d: dict, stopa_karna: float, rwr: int) -> tuple[int, int]:
    """(koszt trzech tygodni na minusie, kwota ponad limit)."""
    ponad = max(0, DEBET - d["limit"])
    w_limicie = min(DEBET, d["limit"]) * d["oprocentowanie"] / rwr
    return round(3 * (d["oplata"] + w_limicie + ponad * stopa_karna / rwr)), ponad


def liczby(dane, rund: int) -> list[dict]:
    u, rwr = dane.mapa["banki"], dane.rund_w_roku
    wynik = []
    for b in u["banki"]:
        t = b["terminal"]
        konto = rund * (dane.na_runde(b["konto"]) + dane.na_runde(t["abonament"])
                        + OBROT_TYGODNIA * u["udzial_kart"] * t["prowizja"])
        najlepsza = max(b["lokaty"].values())
        produkty = {k["produkt"]: k for k in b["kredyty"]}
        wynik.append({
            "bank": b["nazwa"], "specjalizacja": b["specjalizacja"], "konto": round(konto),
            "lokata": round(NADWYZKA * najlepsza * min(rund, 13) / rwr),
            "start": kredyt(produkty.get("start"), KREDYT_START, 26, rwr, rund),
            "inwest": kredyt(produkty.get("inwestycyjny"), KREDYT_INWEST, 104, rwr, rund),
            "leasing": leasing(b.get("leasing"), rwr, rund),
            "debet": debet(b["debet"], u["stopa_karna"], rwr),
        })
    return wynik


def tabela(dane, rund: int) -> str:
    w = ["| bank | specjalizacja | konto+terminal (duży obrót) | lokaty | kredyt na start | "
         "kredyt inwestycyjny | leasing | debet 30 tys. na 3 tyg. |", "|" + "---|" * 8]

    def f(v):
        return "–" if v is None else f"{v:,}".replace(",", " ")
    for x in liczby(dane, rund):
        koszt, ponad = x["debet"]
        alarm = f", ponad limit {f(ponad)} (alarm)" if ponad else ", bez alarmu"
        w.append(f"| {x['bank']} | {x['specjalizacja']} | {f(x['konto'])} | {f(x['lokata'])} | "
                 f"{f(x['start'])} | {f(x['inwest'])} | {f(x['leasing'])} | {f(koszt)}{alarm} |")
    return "\n".join(w)


if __name__ == "__main__":
    arg = sys.argv[1:]
    wyjscie = None
    if "-o" in arg:
        i = arg.index("-o")
        wyjscie = arg[i + 1]
        del arg[i:i + 2]
    tekst = tabela(dane_domyslne(), int(arg[0]) if arg else 12)
    print(tekst)
    if wyjscie:
        with open(wyjscie, "w", encoding="utf-8") as p:
            p.write(tekst + "\n")
