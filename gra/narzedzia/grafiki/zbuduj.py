"""Zapisuje pliki SVG i README.md do panel_gracza/static/grafiki/ oraz składa podglad4.html
(w tym folderze, poza gitem) z szablon4.html i static/motywy/zmienne.css.
Uruchomienie z głównego folderu repo: python narzedzia/grafiki/zbuduj.py narzedzia/grafiki/dane.json"""
import json
import os
import pathlib
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import baza
import postacie  # noqa: F401  (rejestruje grafiki w baza.G)
import wnetrza  # noqa: F401

TU = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(TU))
STATIC = os.path.join(REPO, 'panel_gracza', 'static')
GRAF = os.path.join(STATIC, 'grafiki')
WYGLAD = TU   # podglad4.html powstaje obok szablonu

# 1. Pliki SVG
for nazwa, (w, h, inner, opis) in baza.G.items():
    sciezka = os.path.join(GRAF, nazwa.replace('/', os.sep) + '.svg')
    os.makedirs(os.path.dirname(sciezka), exist_ok=True)
    with open(sciezka, 'w', encoding='utf-8', newline='\n') as f:
        f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
                f'<title>{opis}</title>{inner}</svg>\n')

# 2. README
FOLDERY = [('ikony', 'Ikony paska i interfejsu (24×24, kreska `currentColor`)'),
           ('postacie', 'Postacie (pole 120×260, stopy na y=256, środek x=60)'),
           ('wnetrze', 'Elementy wnętrza kebaba (sprzęt w poziomach 1–3 = zestawy ★–★★★)'),
           ('dekor', 'Dekor w stylach: podstawowy, prl, nowoczesny, studencki, rodzinny'),
           ('tla', 'Tła: typy lokali, widoki stref, lokal surowy, działka, hala sklepu'),
           ('stany', 'Stany lokalu: etapy budowy i plac budowy'),
           ('sklep', 'Sklep meblowy')]
md = ['# Grafiki LUKRUM (podgląd 4)', '',
      'Własne płaskie grafiki SVG do wnętrz kebaba, sklepu meblowego i paska. Stan: **projekt do zatwierdzenia**.', '',
      '## Jak używać', '',
      '- **Kolory.** W plikach nie ma wpisanych kolorów. Ikony używają `currentColor`. Reszta używa zmiennych CSS:',
      '  pięciu wspólnych (`--papier`, `--tusz`, `--akcent`, `--akcent-2`, `--ramka`) i pomocniczych `--g-*`',
      '  (skóra, drewno, metal, ściana…). Wszystkie są w `static/motywy/zmienne.css` dla trzech palet (Bar mleczny, Pewex, wysoka widoczność), każda jasna i ciemna.',
      '- **Wstawianie.** Zmienne CSS działają tylko wtedy, gdy SVG jest w dokumencie: wklej plik inline albo jako',
      '  `<symbol>` i rysuj przez `<use href="#…">`. Przez `<img src>` grafika nie zobaczy zmiennych strony',
      '  (ikony z `currentColor` też wymagają inline).',
      '- **Fonty.** Napisy w grafikach (np. „ZAPLECZE”) biorą krój z `--font-szyld` albo `--font-gruby`.',
      '- **Animacje.** Klasy do animowania w CSS strony: `.para` (para z rożna), `.neon` (świecące części),',
      '  `.sekundnik` (zegar dworcowy), `.hak` (żuraw). Wyłącz je przy `prefers-reduced-motion`.',
      '- **Miny obsługi.** `obsluga-kasjerka.svg` i `obsluga-kucharz.svg` mają trzy grupy `.mina-dobra`, `.mina-zwykla`, `.mina-zla`,',
      '  `.mina-zmeczona` (domyślnie widać zwykłą). Są też osobne pliki z jedną miną (`…-dobra.svg` itd.).',
      '  Bywalcy i goście mają grupy `.mina-dobra`, `.mina-zwykla`, `.mina-zla`.',
      '- **Składanie sceny.** Scena lokalu ma 1220×612: ściana 1220×380 na górze, podłoga 1220×232 pod nią, na to',
      '  przezroczysta nakładka typu lokalu (`tla/typ-*.svg`), potem okno, sprzęt, dekor i postacie.',
      '  Współrzędne z podglądu są w `podglad4.html` (funkcja `scenaLokalu`).',
      '- **Lektury.** Nazwy plików bywalców to id z `bywalcy.yaml`. W interfejsie nie podpisujemy, z jakiej lektury',
      '  jest postać. Postacie są własnymi interpretacjami, nie wzorują się na ekranizacjach.',
      '- **Marki.** Nazwy sklepów w podglądzie są tekstem. Żadna grafika nie odtwarza cudzego logo.', '',
      '## Zmiana grafik', '',
      'Pliki powstają ze skryptów w `narzedzia/grafiki/` (`postacie.py`, `wnetrza.py`). Po zmianie uruchom',
      '`python narzedzia/grafiki/zbuduj.py narzedzia/grafiki/dane.json` (z głównego folderu repo): zapisze pliki SVG, ten spis i podgląd `narzedzia/grafiki/podglad4.html`.', '',
      '## Spis']
for folder, tytul in FOLDERY:
    md += ['', f'### `{folder}/` – {tytul}', '', '| Plik | Rozmiar | Opis |', '|---|---|---|']
    for nazwa in sorted(k for k in baza.G if k.startswith(folder + '/')):
        w, h, _, opis = baza.G[nazwa]
        md.append(f'| `{nazwa}.svg` | {w}×{h} | {opis} |')
with open(os.path.join(GRAF, 'README.md'), 'w', encoding='utf-8', newline='\n') as f:
    f.write('\n'.join(md) + '\n')

# 3. Podgląd
if len(sys.argv) > 1:
    D = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding='utf-8'))
    for b in D['bywalcy']:
        for k in ('lektura', 'autor'):
            b.pop(k, None)  # w interfejsie nie podpisujemy lektur
    for d in D['dymki']:
        for k in ('cytat', 'cytat_zrodlo', 'sprawdzil'):
            d.pop(k, None)
    symbole = ''.join(f'<symbol id="g-{k.replace("/", "-")}" viewBox="0 0 {w} {h}">{inner}</symbol>'
                      for k, (w, h, inner, _) in baza.G.items())
    rozm = {k.replace('/', '-'): [w, h] for k, (w, h, _, _) in baza.G.items()}
    t = pathlib.Path(TU, 'szablon4.html').read_text(encoding='utf-8')
    t = (t.replace('__ZMIENNE__', pathlib.Path(STATIC, 'motywy', 'zmienne.css').read_text(encoding='utf-8'))
          .replace('__SYMBOLE__', symbole).replace('__ROZM__', json.dumps(rozm))
          .replace('__DANE__', json.dumps(D, ensure_ascii=False)))
    with open(os.path.join(WYGLAD, 'podglad4.html'), 'w', encoding='utf-8', newline='\n') as f:
        f.write(t)
    print('podglad4.html', len(t))
print('grafik:', len(baza.G))
