# Wątek: wyglad (podróż 03)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/03-okienka-i-rundy/wspolne.md` (zasady, testy, commity) oraz
  `dokumentacja/Wyglad.md`. Gałąź bazowa: `podroz-03`. Równolegle pracują: `03/prawo` (`ikony_marek.js`, nowa strona
  źródeł), `03/odblokowania` (zeszyt: `pulpit/zeszyt.js`, `dane/zeszyt.yaml`), `03/tlok` (scena kebaba,
  `swiat/wnetrze.js`, `silnik/rynek/`).
- **Cel (Z6):** przegląd rzadkich ekranów w trybie ciemnym i w wysokiej widoczności oraz pełny przegląd na telefonie.
  Najpierw zrzuty i spis usterek, potem poprawki usterek, które da się naprawić samym CSS albo drobną zmianą układu.
- **Jak:**
  - Narzędzie: `gra/narzedzia/zrzuty.py` (opis w pliku; krok `{"wyglad": [paleta, tryb]}`; telefon:
    `--szer 390 --wys 844`). Serwer na porcie 8795, gra testowa `manage.py gra_pokazowa`, zrzuty do
    `../_robocze/zrzuty-wyglad/` (poza gitem). Po pracy zatrzymaj serwer (także jeśli zostanie uruchomiony w tle).
  - Zakres: wszystkie wnętrza z `dane/mapa/budynki.yaml` (po jednym zrzucie) i okna, które się w nich otwierają
    (rzadkie: bank, urząd, giełda, licytacje, klub, rynek pracy, agencje reklamy, kurier, ustawienia, panel MG `/mg/`).
    Dla każdego: bar jasny, pewex ciemny, wysoka ciemna; na telefonie: bar jasny.
  - Spis `dokumentacja/wiedza/analizy/przeglad-wygladu-23-11.md`: ekran → paleta/szerokość → usterka → poprawione ✓
    albo propozycja. Typowe usterki: kontrast poniżej 7:1 w „wysokiej”, kolor na sztywno zamiast zmiennej, stan
    samym kolorem, tekst ucięty albo wystający, poziome przewijanie na 390 px, przyciski mniejsze niż 44 px na telefonie.
  - Poprawki: CSS w bloku `/* podróż 03/wyglad */` na końcu pliku, którego dotyczą; kolory tylko przez zmienne
    z `motywy/zmienne.css`. Gdy poprawka wymaga zmiany układu ekranu albo decyzji o wyglądzie, wpisz ją jako
    propozycję dla szefa i nie rób.
- **Nie ruszaj:** plików wymienionych przy równoległych wątkach, `silnik/`, `dane/` (poza tekstem, jeśli konieczne),
  bloków CSS innych wątków (`/* podróż 03/... */`), `swiat/pora.js`.
- **Gotowe, gdy:** spis jest w repo; każda poprawka ma zrzut „po” (nazwa w spisie); test `testy/aplikacja` na
  zmienne kolorów (jeśli istnieje) przechodzi; pełne testy zielone, `ruff`, `node --check` czyste (wyniki w raporcie).

## Raport
**Wątek 03/wyglad: częściowo zrobiony.** Spis: `dokumentacja/wiedza/analizy/przeglad-wygladu-23-11.md`.
- Poprawione (commit a832a49): pasek i tabele `/zrodla` w „wysokiej ciemnej”; strzałki gazety w redakcji; menu i ⚙ 44 px na telefonie.
- Reszta usterek jako propozycje w spisie (kontrasty cen/liczników w oknach w „wysokiej”, zeszyt → 03/kartki).
- Dowody: `ruff check .` → All checks passed!; `node --check redakcja.js` → ok; `pytest testy/aplikacja` → 261 passed in 160.57s.
- Nie zrobione: zrzuty „po”, okna na telefonie (serwer w tle zabity przez system z braku pamięci, nie uruchamiałem ponownie), pełne testy.
- Zapis listy pracowników do dziennika odrzucony przez klasyfikator uprawnień (zapis postępu przeszedł).

**Uzupełnienie (zrzuty „po”, na prośbę Archiego):** `_robocze/zrzuty-wyglad/po_zrodla_wysoka-ciemny.png` (pasek czarny z ramką, tabela bez białego nagłówka), `po_redakcja_wysoka-ciemny.png` (strzałki gazety), `po_menu_tel_bar-jasny.png` (390×844). Pomiar po poprawce: wysokości przycisków menu i ⚙ → `[44,44,…,44]` (18 elementów). Serwer zatrzymany. Pełnych testów nie puszczałem (zgodnie z poleceniem Archiego).
