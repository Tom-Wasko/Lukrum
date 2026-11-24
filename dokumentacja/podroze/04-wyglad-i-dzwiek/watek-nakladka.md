# Wątek: nakladka (podróż 04)

## Brief
- **Najpierw przeczytaj:**
  - `dokumentacja/wiedza/analizy/przeglad-wnetrz.md` (cały; Twoje poprawki to P1, P3, P4, P11, P12, P13);
  - `dokumentacja/Wyglad.md`;
  - warstwa sceny: `gra/panel_gracza/static/swiat/wnetrze.js`, `sceny.js`, `rysunek.js`, `wnetrza.css`;
  - sceny: `swiat/sceny/index.js` i 2–3 przykładowe sceny (`ratusz.js`, `makro.js`, `redakcja.js`);
  - dymki po stronie serwera: `gra/silnik/wnetrza/dymki.py` (tylko czytasz).
  - Gałąź bazowa: `main`. Zrzuty „przed” są w `C:/Users/PC/Pulpit/lukrum/_robocze/zrzuty-wnetrza/`.
- **Cel (Z4, wątek A „nakładka”; szef 24.11):** jedna warstwa dla wszystkich scen.
  1. **P1 dymki:** dymki postaci domyślnie zwinięte (mała ikona „…” przy postaci). Kliknięcie albo klawiatura otwiera
     dymek, a drugie kliknięcie albo Esc go zamyka. Otwarty dymek nie zasłania szyldu, tablicy ani rekwizytu z punktem
     (układ wybierany po stronie, gdzie jest miejsce). Nowy dymek w rundzie (np. wujek) ma znak, że jest nowy (nie samym kolorem).
  2. **P3 punkty:** punkty `.pkt` z pigułek na małe „szyldy” pasujące do planszy (tusz, papier, PRL), bez nachodzenia
     na siebie i na rekwizyt (prosty rozkład kolizji w warstwie, nie ręcznie w każdej scenie). Dostępne z klawiatury, z opisem.
  3. **P4 telefon (≤ 600 px):** scena jako pasek bez punktów i dymków na rysunku; pod sceną lista akcji (punkty sceny
     jako przyciski) i dymki jako krótka lista. Na komputerze bez zmian poza P1 i P3.
  4. **P11:** kontrast małych napisów (tabliczki „POK. 12”, szare podpisy) ≥ 7:1 w palecie wysokiej, ≥ 4,5:1 w pozostałych.
  5. **P12:** gazeta „Kurier” w redakcji mieści się w scenie (zmniejszona albo zwinięta).
  6. **P13:** kapsułki „Powrót / Mapa” w nagłówku w jednej linii (hurtownia, sceny Zana).
- **Zasady:**
  - kolory tylko ze zmiennych `motywy/zmienne.css`;
  - każda zmiana działa w 3 paletach × jasny/ciemny;
  - stan nigdy samym kolorem;
  - teksty neutralne płciowo;
  - bez kopiowania cudzych wnętrz;
  - zero wzmianek o innych grach.
- **Nie ruszaj:**
  - silnika i danych gry;
  - treści dymków;
  - rysunków rekwizytów i układu scen poza tym, czego wymaga nakładka (rekwizyty, kebab i palety ciemne to następne wątki B i C);
  - INSTRUKCJI i README (opis zmian dla gracza daj w raporcie, wpisze Archi).
- **Testy:**
  - dla nowej logiki (rozkład punktów bez kolizji, dymek zwinięty i otwarty) test w `testy/swiat` albo `testy/wnetrza`;
  - `node --check` zmienionych modułów (`cp plik.js "$TEMP/t.mjs" && node --check "$TEMP/t.mjs"`);
  - na koniec pełne testy i `ruff`.
- **Zrzuty:**
  - port 8789, `gra/narzedzia/zrzuty.py`, do `C:/Users/PC/Pulpit/lukrum/_robocze/zrzuty-nakladka/`;
  - „po” dla tych samych scen co w przeglądzie: bar jasny i wysoka ciemny 1366×768 dla wszystkich scen, telefon 390×844 dla kebabu, banku, hurtowni, ratusza i agencji pracy;
  - nazwy plików jak w `zrzuty-wnetrza`, żeby dało się zestawić „przed i po”;
  - po pracy zatrzymaj serwer.
- **Gotowe, gdy:** P1, P3, P4, P11, P12, P13 zrobione; zrzuty są; pełne testy zielone, `ruff`, `node --check` (wyniki w raporcie).
  W raporcie podaj też opis zmian dla gracza (2–3 zdania do INSTRUKCJI).
- **Dalej:** po akceptacji szefa dostaniesz kontynuację (wątek B: kebab i ciemna paleta, potem C: charakter scen). Nie zaczynaj ich sam.
- **Archi:** archi-lukrum.

## Raport
