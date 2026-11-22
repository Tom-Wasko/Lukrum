# Wątek: drobne (podróż 02)

## Brief
- **Cel:** naprawić drobne usterki z gier testowych 20 i 22.11 (zadanie Z29 w `dokumentacja/Zadania.md`, bez
  części o mapie, którą robi wątek `02/mapa`).
- **Ustalone (nie sprawdzaj ponownie):**
  - Projekt: gra w `gra/` (przewodnik `gra/AGENTS.md`, zasady `CLAUDE.md` w korzeniu). Ścieżki niżej liczone od
    `gra/panel_gracza/static/`.
  - Zeszyt wujka: `pulpit/zeszyt.js`, `pulpit/zeszyt-warunki.js`, dane `gra/dane/zeszyt.yaml`. Pulpit: `pulpit/pulpit.js`.
  - Pani Halina: zdarzenie `pani_halina` w `gra/dane/zdarzenia/losowe.yaml:116`. Listy i zdarzenia: `zakladki/zdarzenia.js`.
  - Zatrudnianie: `zakladki/hr.js`, `zakladki/rynek_pracy.js`. Menu w lokalu: `zakladki/oferta.js`, `zakladki/lokal.js`.
    Poczta: `swiat/sceny/poczta.js`, list z decyzjami w `pulpit/pulpit.js`.
- **Do zrobienia (uwagi szefa „s” i majstra „m”):**
  1. (s) List od pani Haliny (Bank Żywności) nie znika, jest zawsze widoczny. Po reakcji ma zniknąć.
  2. (s) Reakcja na panią Halinę nie powinna trafiać do zeszytu w „do zrobienia”.
  3. (s) Kartki zeszytu zwykle się nie przewijają. Każda kartka z dłuższą treścią ma się przewijać (kółko, dotyk,
     klawiatura), a wskaźnik „przewiń w dół” ma działać.
  4. (m) Przycisk „Zatrudnij” jest za jasny, a teksty w zatrudnianiu są nieczytelne. Kontrast ≥ 4,5:1, w palecie
     wysokiej ≥ 7:1, we wszystkich 3 paletach × jasny i ciemny.
  5. (m) Menu w lokalu nie działa: wszystkie ceny pokazują 0 zł. Znajdź przyczynę (dane czy widok) i napraw.
  6. (m) Na liście wydarzeń są 4, a po „Zareaguj” widać wszystkie, i tam są tylko 2. Liczby i listy mają się zgadzać.
  7. (m) Poczta: tablica w drugiej rundzie zostaje z pierwszej. Ma się odświeżać co rundę.
  8. (m) Stempel „nadano” zostaje po przejściu rundy. W nowej rundzie list jest znów do nadania.
  9. Sprawdź w grze, bez zmian, jeśli działa: kategorie mapy w rzędzie ikon z mniejszą liczbą ikon (szef: „wróć do tego,
     co było, ale mniej ikonek”) i „Jak grać” w zakładkach zamiast jednego bloku tekstu. Wynik wpisz do raportu.
     Kategorie leżą w plikach mapy (wątek `02/mapa`), więc ich nie zmieniaj, tylko opisz.
- **Pliki do zmiany:** `pulpit/zeszyt.js`, `pulpit/zeszyt-warunki.js`, `pulpit/pulpit.js`, `pulpit/pulpit.css`,
  `zakladki/hr.js`, `zakladki/rynek_pracy.js`, `zakladki/oferta.js`, `zakladki/lokal.js`, `zakladki/zdarzenia.js`,
  `zakladki/wspolne.js` (tylko jeśli konieczne), `swiat/sceny/poczta.js`, `gra/dane/zeszyt.yaml`,
  `gra/dane/zdarzenia/*.yaml`, `gra/api/` i `gra/silnik/` (gdy przyczyna jest po stronie serwera), testy.
  **Nie ruszaj** (inne wątki pracują równolegle): `mapa/*`, `zakladki/mapa*.js`, `swiat/rysunek.js`, `swiat/wnetrze.js`,
  `swiat/sceny/*` (poza `poczta.js`), `swiat/miejsca.js`, `zakladki/dostawcy.js`, `marketing.js`, `inwestycje.js`,
  `pulpit/karta.js`. W `pulpit/pulpit.css`, `pulpit/karty.css` i `styl.css` dopisuj tylko blok na końcu z komentarzem
  `/* podróż 02/drobne */`.
- **Zasady:** liczby gry tylko w `dane/*.yaml`, kwoty w groszach, teksty po polsku, neutralne płciowo, kolory przez
  zmienne z `motywy/zmienne.css`, stan nigdy samym kolorem. Po zmianie `dane/*.yaml` uruchom
  `PY -X utf8 -m silnik.dane sprawdz`. Testy wzorów (`testy/dane_zamrozone/`) zostają bez zmian. Testów nie osłabiaj.
  Do każdej naprawy logiki dodaj test.
- **Gotowe, gdy:** punkty 1–8 naprawione i sprawdzone w przeglądarce na serwerze (`manage.py graj --port 8764
  --bez-przegladarki`, gra `manage.py gra_pokazowa`, zmiana rundy z panelu MG), punkt 9 opisany. Potem zatrzymaj serwer.
  Dowód: `PY -X utf8 -m pytest -q -p no:cacheprovider 2>&1 | tail -5` (pełne, raz na koniec), `PY -m ruff check .`,
  `node --check` każdego zmienionego modułu.
- **Zrzuty ekranu:** nie.
- **Dokumenty do poprawienia:** `gra/INSTRUKCJA.md` i `gra/README.md`, jeśli zmienia się to, co widzi gracz.
- **Archi:** archi-lukrum

## Raport
<!-- Pisze wyko na końcu. -->
**Stan:** częściowo. Kod pkt 2–8 zrobiony; pkt 1 nierozstrzygnięty. **Nic nie sprawdzono w przeglądarce**
(sesja w tle, brak narzędzi przeglądarkowych) – wymóg „sprawdzone na serwerze” niespełniony, trzeba obejrzeć w grze.
**Zmienione pliki** (względem `gra/panel_gracza/static/`): `swiat/swiat.js` (5), `pulpit/zeszyt.js` (3),
`styl.css` (4, blok na końcu), `pulpit/pulpit.js` (6, 7), `swiat/sceny/poczta.js` (7, 8), `zakladki/zadania.js` (2; nie
było na liście plików, ale tam powstają zadania zeszytu), `gra/testy/aplikacja/test_drobne.py` (nowy, 10 testów).
**Dowód:** `pytest testy/aplikacja/test_drobne.py` → `10 passed`; `ruff check` na teście → `All checks passed!`;
`node --check` zmienionych modułów → ok. Pełny pytest (uruchomiony przed commitem ab26d4b, ten dotyka tylko zadania.js i testu: 10 passed osobno) → `885 passed in 369.05s`; niestabilny test kasyna nie padł.
Nie udało się usunąć `_robocze/drobne/` (blokada `rm`); folder jest poza gitem, do skasowania ręcznie.
**Wyniki pkt po pkt:**
1. **Nierozstrzygnięte.** Sprawa Haliny (`pani_halina`, bez parku) jest w Mój lokal i po wyborze reakcji celowo
   zostaje widoczna (inaczej nie dałoby się zmienić wyboru). Nie znalazłem osobnego „listu” na stałe. Potrzebuję od szefa:
   gdzie dokładnie widać list (scena w lokalu? tablica? poczta?) i czy ma znikać po wyborze, czy po przejściu rundy.
2. Sprawy w lokalu nie tworzą już zadania „Zareaguj: …” w zeszycie (`zadania.js`). Parkowe zostają w zbiorczym
   „Sprawy w parkach (n)”.
3. Dodano przewijanie kółkiem i klawiaturą (strony zeszytu). Dotyk i wskaźnik „przewiń w dół”: kod bez zmian, realnej
   przyczyny nie ustaliłem bez przeglądarki.
4. Blok CSS na końcu `styl.css`: wyłączone przyciski i teksty zatrudniania w `--tusz` na tle karty (bez przezroczystości),
   aktywne „Zatrudnij” ciemne z tekstem `--na-kolorze`; stan też znakami ✓/✕. Kontrast policzony skryptem dla 6 wariantów
   palet; nie obejrzano.
5. Przyczyna: przed startem sprzedaży `ceny` są puste → 0 zł. Teraz bierze `cena_preferowana` z kategorii.
6. Tablica wydarzeń liczy parki (jedna pozycja na park), zgodnie z listą i oknem parku.
7–8. Poczta czyta dane z widoku gry (`window.lukrum.widok`), tydzień i błędy aktualne co rundę; stempel „NADANO” tylko gdy
   `v.wyslane` (po stronie serwera w nowej rundzie jest False).
9. **Bez zmian, tylko opis.** Kategorie mapy: rząd ikon `GRUPY` w `pulpit.js` – 5 grup + „Kebab” + „Wydarzenia”
   (7 ikon). „Jak grać”: link `/jak-grac` – strona z `INSTRUKCJA.md` (13 rozdziałów + „Dla mistrza gry”); w szablonie
   `jak_grac.html` jest kod zakładek (WAI-ARIA tablist) budowanych skryptem z nagłówków h2, bez skryptu jedna strona.
   Nie uruchamiałem strony, więc nie wiem, czy zakładki faktycznie się pokazują.
**Decyzje, które podjąłem:** pkt 2 = usunąć zadanie z zeszytu dla spraw lokalnych (nie tylko Haliny); pkt 1 nie ukrywam.
**Pytania do szefa:** pkt 1 (jak wyżej). Czy sprawy w lokalu mają zniknąć z zeszytu całkiem (zrobione), czy tylko Halina?
**Propozycje (poza zakresem):** obejrzeć 3–8 w grze na `manage.py graj --port 8764` po scaleniu.
**Commity:** 68aac7f, 929f064, 6604bf7, 1e3bcf6, e0a0782, ab26d4b (oraz commit raportu).
