"""Składa grafiki z `gra/panel_gracza/static/grafiki/` w jeden plik symboli dla wnętrz (static/swiat/).

    python narzedzia/grafiki/zestaw.py          zapisuje static/grafiki/zestaw.svg i zestaw.json
    python narzedzia/grafiki/zestaw.py --sprawdz  kończy się błędem, gdy zapisane pliki są nieaktualne

`zestaw.svg` – ukryty <svg> z <symbol id="g-<folder>-<plik>">; strona wkleja go raz do dokumentu, żeby grafiki
widziały zmienne CSS palety. `zestaw.json` – rozmiary pól {"<folder>-<plik>": [szer, wys]}.
Pomijane: pliki postaci z jedną miną (`…-dobra.svg` itd. – miny przełącza atrybut data-mina) i ten zestaw.
"""
import json
import re
import sys
from pathlib import Path

KATALOG = Path(__file__).resolve().parents[2] / "gra" / "panel_gracza" / "static" / "grafiki"
JEDNA_MINA = re.compile(r"obsluga-\w+-(dobra|zwykla|zmeczona)$")


def zbuduj() -> tuple[str, str]:
    symbole, rozmiary = [], {}
    for plik in sorted(KATALOG.glob("*/*.svg")):
        if JEDNA_MINA.search(plik.stem):
            continue
        tekst = plik.read_text(encoding="utf-8")
        m = re.search(r'<svg[^>]*viewBox="0 0 ([\d.]+) ([\d.]+)"[^>]*>(.*)</svg>\s*$', tekst, re.S)
        if not m:
            raise SystemExit(f"{plik}: brak viewBox")
        nazwa = f"{plik.parent.name}-{plik.stem}"
        rozmiary[nazwa] = [float(m[1]) if "." in m[1] else int(m[1]), float(m[2]) if "." in m[2] else int(m[2])]
        srodek = re.sub(r"<title>.*?</title>", "", m[3], flags=re.S)
        symbole.append(f'<symbol id="g-{nazwa}" viewBox="0 0 {m[1]} {m[2]}">{srodek}</symbol>')
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true">'
           f'<defs>{"".join(symbole)}</defs></svg>\n')
    return svg, json.dumps(rozmiary, ensure_ascii=False, separators=(",", ":")) + "\n"


def main() -> None:
    svg, rozm = zbuduj()
    pliki = {KATALOG / "zestaw.svg": svg, KATALOG / "zestaw.json": rozm}
    if "--sprawdz" in sys.argv:
        stare = [p.name for p, t in pliki.items() if not p.exists() or p.read_text(encoding="utf-8") != t]
        if stare:
            raise SystemExit(f"Nieaktualne: {', '.join(stare)} – uruchom python narzedzia/grafiki/zestaw.py")
        return
    for p, t in pliki.items():
        p.write_text(t, encoding="utf-8", newline="\n")
        print(p.name, len(t) // 1024, "kB")


if __name__ == "__main__":
    main()
