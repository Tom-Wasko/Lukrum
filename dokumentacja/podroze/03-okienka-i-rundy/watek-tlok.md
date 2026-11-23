# Wątek: tlok (podróż 03)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/03-okienka-i-rundy/wspolne.md` (zasady, testy, commity).
  Gałąź bazowa: `podroz-03`. Równolegle mogą pracować: `03/poprawki-okienek`, `03/prawo`, `03/odblokowania`
  (harmonogram, zeszyt).
- **Cel (Z21 + Z42, decyzje szefa 23.11):**
  1. **Tłok obniża opinię.** `silnik/wnetrza/stan.py` liczy `tlok` (średnie wykorzystanie załogi) tylko do rysunku.
     Gdy załoga jest zajęta blisko 100%, goście czekają, a opinia lokalu lekko spada (`silnik/rynek/opinie.py`).
     Próg i siła w `dane/zalozenia.yaml` (`{wartosc, pewnosc, zrodlo}`); oprzyj się na źródle o czasie oczekiwania
     w gastronomii, jeśli znajdziesz, inaczej `pewnosc: zalozenie`.
  2. **Wyposażenie podnosi opinię.** Kupione wyposażenie i udogodnienia lokalu lekko podnoszą ocenę. Najpierw sprawdź,
     co już działa przez karty sprzętu (`boty.yaml` wspomina „+0,06 karty”), żeby **nie liczyć dwa razy**. Opisz to
     w raporcie.
  3. **Tłok widoczny we wnętrzu kebaba:** kolejka gości przy ladzie rośnie z tłokiem, miny załogi już są; napis
     („Tłok: duży ▲”), bo stan nigdy nie może być pokazany samym kolorem. Pliki: `swiat/sceny/` kebaba
     i `swiat/wnetrze.js`; **nie ruszaj** `swiat/pora.js` ani bloku `/* podróż 03/pora */`.
  4. **Z42, „ukryte” mechaniki (zgłosił majster):** każdy skutek ma być widoczny dla gracza. Zrób spis
     `dokumentacja/wiedza/analizy/ukryte-mechaniki.md`: mechanika → gdzie liczona → czy i gdzie gracz to widzi →
     propozycja pokazania. Pokaż w grze tylko skutki z punktów 1–2 (np. w księdze gości: „Opinia ▼ przez kolejki”),
     resztę zostaw jako propozycje dla szefa.
- **Balans:** `balans.symuluj 12 sredni 7` przed i po; zmiana wyników botów do ok. ±5%, inaczej opisz i zmniejsz siłę.
- **Nie ruszaj:** `silnik/harmonogram.py`, `dane/zeszyt.yaml`, okienek z `03/poprawki-okienek`, `ikony_marek.js`.
  Testów wzorów w `testy/dane_zamrozone/` nie zmieniasz (jeśli test tego wymaga, nowe parametry mają domyślnie
  wartość „wyłączone”; opisz to).
- **Gotowe, gdy:** testy nowych skutków (tłok ↑ → opinia ↓, wyposażenie ↑ → opinia ↑, brak podwójnego liczenia);
  zrzuty kebaba przy małym i dużym tłoku (`gra/narzedzia/zrzuty.py`, port 8794, `../_robocze/zrzuty-tlok/`);
  notatka `dokumentacja/funkcje/Tlok.md` z szablonu; pełne testy zielone, `ruff`, `node --check`,
  `silnik.dane sprawdz` czyste.

## Raport
