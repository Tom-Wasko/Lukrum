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

## Raport wyko (23.11.2026)

**Zrobione**
1. **Tłok → opinia.** `popyt.py` zapisuje obciążenie lokalu dzień po dniu (`obsluga.obciazenie`, najbardziej zajęte
   stanowisko: kasa albo kuchnia). `opinie.py`: `obciazenie_dnia`, `kara_za_tlok` i nowy powód `tlok` w ocenie tygodnia
   (kara × waga „czekanie” grup). Parametry `opinie.tlok_prog: 0.85` i `opinie.tlok: 0.3` w `dane/mapa/klienci.yaml`
   (założenie; brak publicznego pomiaru czasu oczekiwania w gastronomii). W schemacie domyślnie wyłączone
   (`tlok_prog` 1, `tlok` 0), więc `dane_zamrozone` bez zmian. Nowe komentarze gości „tlok”.
2. **Wyposażenie → opinia: już działało** (`opinie.py`, powód `wyposazenie` = `mnoznik_wyposazenia` + dekor).
   „+0,06 karty” z `boty.yaml` to wynik końcowy firmy, nie ocena gości. Udogodnienia (benefity załogi) wchodzą tylko
   przez nastrój załogi. **Niczego nie dodawałem, żeby nie liczyć dwa razy**; test pilnuje zestawu powodów.
3. **Widoczność.** Wnętrze kebaba: kolejka gości 1/3/5 + napis „Tłok: mały ✓ / średni – / duży ▲”
   (`swiat/sceny.js`, `swiat/swiat.js`). Księga gości: wiersz „Czekanie” obejmuje `tlok`. Klienci: kolumna „Tłok”.
4. **Z42:** `dokumentacja/wiedza/analizy/ukryte-mechaniki.md` (13 wierszy; w grze tylko 1–2, reszta propozycje).
5. `dokumentacja/funkcje/Tlok.md`, INSTRUKCJA i README zaktualizowane.

**Balans** (`balans.symuluj 12 sredni 7`, przed `tlok: 0`, po 0,3): zrównoważony 100337→100508, tani 78772→78121,
premium 51788→53368 (+3,0%), agresywny 17493→17412, naśladowca 81395→80629; średnia 65957→66007 (+0,1%). W ±5%.

**Dowody**
- `pytest -q -p no:cacheprovider` (pełne): `937 passed in 382.89s`
- `ruff check .`: `All checks passed!`; `node --check` sceny.js, swiat.js, ksiega.js, klienci.js: ok
- `silnik.dane sprawdz`: `Dane w porządku`
- nowe testy `testy/rynek/test_tlok_opinie.py` (3); w `test_klienci_opinie.py` do zestawu powodów dopisany `tlok`
- zrzuty: `_robocze/zrzuty-tlok/` (poza gitem; mały/duży × jasny/ciemny, duży w palecie wysokiej), serwer zatrzymany.
  Tłok w zrzutach wymuszony podmianą odpowiedzi API w przeglądarce (w grze pokazowej obciążenie jest niskie).

**Uwagi**
- Poza briefem dotknięte: `ksiega.js`, `klienci.js` (powód `tlok`), `schematy.py` (pola opinii).
- Siła tłoku mała (≈ −0,3 ★ przy pełnym tłoku cały tydzień); łatwo zmienić w YAML.
- `test_kasyno::test_mistrz_gry_widzi_klub` nie padł.

## Propozycje
- Wiersze 3–13 z `ukryte-mechaniki.md` (najtańsze: podpowiedź o zaufaniu do oceny i o wrażliwości grup).
