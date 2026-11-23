# Wykaz grafik, fontów, nagrań i danych zewnętrznych

Stan: 23.11.2026 (wątek 03/przeglad-prawny, Z23). Ścieżki od `gra/panel_gracza/static/`. Zebrane z plików repo; nic nie
oceniamy prawnie. Przy nowej grafice, foncie albo nagraniu dopisz wiersz.

## Fonty (lokalnie, `fonty/`; teksty licencji w `fonty/OFL.txt`)
| Plik (rodzina) | Źródło / autorzy | Licencja |
|---|---|---|
| `oswald-*.woff2` | Oswald Project Authors, github.com/googlefonts/OswaldFont | SIL OFL 1.1 |
| `pt-sans-*.woff2` | ParaType Ltd., paratype.com | SIL OFL 1.1 (zastrzeżone nazwy „PT Sans”, „ParaType”) |
| `alfa-slab-one-*.woff2` | The Alfa Slab One Project Authors (jmsole.cl) | SIL OFL 1.1 (zastrzeżona nazwa „Alfa Slab”) |
| `atkinson-hyperlegible-*.woff2` | Braille Institute of America, Inc. (2020) | SIL OFL 1.1 |
| `caveat-400-700-latin.woff2` | The Caveat Project Authors, github.com/googlefonts/caveat (kopia z github.com/google/fonts/tree/main/ofl/caveat) | SIL OFL 1.1 |

Deklaracje `@font-face`: `fonty/fonty.css` (5 rodzin). OFL zezwala na dołączanie do oprogramowania bez zmiany nazwy kroju.

## Grafiki (`grafiki/`)
| Folder | Pliki | Źródło | Licencja |
|---|---|---|---|
| `ikony/`, `dekor/`, `postacie/`, `sklep/`, `stany/`, `tla/`, `wnetrze/` | 118 plików SVG (+ `zestaw.svg`, `zestaw.json`, `README.md` ze spisem) | własne, generowane skryptami `gra/narzedzia/grafiki/` (`postacie.py`, `wnetrza.py`, `zbuduj.py`); README: „Żadna grafika nie odtwarza cudzego logo”, postacie to własne interpretacje | własne (autor projektu) |
| `favicon.svg` | 1 plik | własny | własny |
| `zakladki/ikony_marek.js` | ogólne ikony branżowe i ikony naszych marek (bez znaków prawdziwych firm) | własne rysunki liniowe | własny; nazwy firm w tekstach z zastrzeżeniem w stopce |

Na liście plików śledzonych w `gra/` nie ma rastrowych obrazów (png, jpg) poza folderem `fonty/` (pliki `woff2`).

## Nagrania radia „Fala Koziołka” (`radio/`, 46 plików mp3)
Źródło i licencja każdego nagrania: `gra/dane/radio.yaml` (pola `zrodlo`, `licencja`; pilnuje test).
| Stacja | Źródło | Licencja (z `radio.yaml`) |
|---|---|---|
| `klasyczna/` (Chopin) | Musopen na archive.org | CC0 albo znak domeny publicznej 1.0 |
| `jazz/` | Library of Congress National Jukebox, Internet Archive | domena publiczna (Public Domain Mark 1.0) |
| `polska/` | Library of Congress National Jukebox, Internet Archive | domena publiczna (Public Domain Mark 1.0 albo z mocy prawa, nagrania z lat 1907–1925) |
| `lalka/` (3 rozdziały) | Fundacja Wolne Lektury, wolnelektury.pl | Licencja Wolnej Sztuki 1.3, wymaga podania autora, wykonawcy i licencji |

## Dane i biblioteki zewnętrzne
| Co | Źródło | Licencja | Podpis w grze |
|---|---|---|---|
| Mapa Lublina (`mapa/lublin.json`) | OpenStreetMap, pobrano 2026-11-15 | ODbL | link „© autorzy OpenStreetMap” (`mapa/lublin.js:457`), `INSTRUKCJA.md:612`, `README.md:81`, `METODA.md:31` |
| `vendor/chart.umd.min.js` | Chart.js 4.4.4 (kopia z jsDelivr) | MIT | nagłówek licencji w pliku |

## Luki do uzupełnienia
- Podpis autorstwa grafik i nagrań widoczny w grze (poza mapą): w repo nie znaleziono; do decyzji szefa, czy ma być w menu ⚙ albo na ekranie „Nawiązania i źródła” (Z23).
- Dla `lalka/` licencja wymaga podania autora i wykonawcy: sprawdzić, czy grający to widzą.
