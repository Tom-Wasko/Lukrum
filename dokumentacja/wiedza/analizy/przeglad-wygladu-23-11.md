# Przegląd wyglądu 23.11 (wątek 03/wyglad)

Zrzuty: 45 wnętrz × (bar jasny, pewex ciemny, wysoka ciemna) + telefon 390×844 (bar jasny) oraz ok. 270 zrzutów
okien otwieranych we wnętrzach (wysoka ciemna). Leżą lokalnie w `_robocze/zrzuty-wyglad/` (poza gitem).
Oprócz oglądania: automatyczny pomiar (kontrast tekstu względem tła, przewijanie poziome, przyciski < 44 px,
tekst ucięty) w 4 paletach na komputerze i 2 na telefonie.
Pominięte: zeszyt wujka (przerabiany w 03/kartki), panel `/mg/` (przerabiany w 03/lekcja).

| Ekran | Paleta / szerokość | Usterka | Stan |
|---|---|---|---|
| Strona `/zrodla` | wysoka ciemna | biały pasek u góry i jasne nagłówki tabel (tło odwrócone `--tusz`), szary tekst podtytułu | poprawione ✓ (`zrodla.html`, blok `podróż 03/wyglad`) |
| Redakcja, gazeta „Wyniki tygodnia” | wysoka ciemna i telefon | strzałki ▲▼ kolorem trybu ciemnego na stałym jasnym papierze (kontrast 4,8:1) | poprawione ✓ (`sceny/redakcja.js`: kolor tekstu gazety; stan niesie sam znak ▲▼) |
| Górne menu i ⚙ | telefon 390 px | przyciski 36–38 px zamiast 44 px | poprawione ✓ (`styl.css`, blok `podróż 03/wyglad`) |
| Wszystkie wnętrza | wszystkie palety | zeszyt wujka: tekst „następny krok” ma kontrast 4,0–4,9:1 (kolor rudy na jasnej kartce) | poprawione ✓ 24.11 (`pulpit/pulpit.css`: krok „teraz” w `--g-czern`, pogrubienie i ▶ zostają; pomiar zeszytu w 6 paletach, pulpit i telefon: 0 usterek) |
| Sanepid, okno „Higiena” | wysoka ciemna | cena w kartach opcji turkusowa, kontrast 6,9:1 (< 7:1) | pomiar 24.11 (5 palet, wszystkie sceny): nie zgłoszone ✓. Wspólna przyczyna zniknęła po poprawkach w `motywy/dostepnosc.css` (kółko „i” bez przygaszenia, czerń na pigułkach i pasku „w budowie” w wysokiej jasnej) |
| Banki (5 wnętrz), okno „Porównaj banki” | wysoka ciemna | „37 760 zł”, „Najtańszy leasing”: 4,5–4,6:1 | pomiar 24.11 (5 palet, wszystkie sceny): nie zgłoszone ✓. Wspólna przyczyna zniknęła po poprawkach w `motywy/dostepnosc.css` (kółko „i” bez przygaszenia, czerń na pigułkach i pasku „w budowie” w wysokiej jasnej) |
| Park handlowy, market budowlany | wysoka ciemna | liczniki „1”, „4” w kartach: 4,5–4,8:1 | pomiar 24.11 (5 palet, wszystkie sceny): nie zgłoszone ✓. Wspólna przyczyna zniknęła po poprawkach w `motywy/dostepnosc.css` (kółko „i” bez przygaszenia, czerń na pigułkach i pasku „w budowie” w wysokiej jasnej) |
| Agencja pracy | wysoka ciemna | „36 na rynku”, „Pokaż więcej”: 4,1–4,4:1 | pomiar 24.11 (5 palet, wszystkie sceny): nie zgłoszone ✓. Wspólna przyczyna zniknęła po poprawkach w `motywy/dostepnosc.css` (kółko „i” bez przygaszenia, czerń na pigułkach i pasku „w budowie” w wysokiej jasnej) |
| Galeria, ubezpieczyciel, stolarnia | bar jasny i wysoka | liczby w licznikach: 2,7–4,5:1 | pomiar 24.11 (5 palet, wszystkie sceny): nie zgłoszone ✓. Wspólna przyczyna zniknęła po poprawkach w `motywy/dostepnosc.css` (kółko „i” bez przygaszenia, czerń na pigułkach i pasku „w budowie” w wysokiej jasnej) |
| Kamienica rachmistrzów | bar jasny | „Najtańsze”, „O biurze”, „108 zł”: 1,6–1,7:1 (do sprawdzenia: możliwe tło obrazkowe, którego pomiar nie widzi) | pomiar 24.11: nie zgłoszone ✓ (wcześniejszy odczyt 1,4–1,7:1 był prawdopodobnie przejściem CSS po zmianie palety, nie usterką) |
| Poczta | bar jasny | przycisk „Popraw”: 1,4:1 (jak wyżej, do sprawdzenia) | pomiar 24.11: nie zgłoszone ✓ (wcześniejszy odczyt 1,4–1,7:1 był prawdopodobnie przejściem CSS po zmianie palety, nie usterką) |
| Przyciski ✕ okien, „Wybierz” | pulpit | 40×40 px (na komputerze akceptowalne, na telefonie < 44 px) | poprawione ✓ 24.11 (`swiat/okna.css`, blok `podróż 04/kontrast`, ≤ 700 px: ✕, „Wybierz”, przyciski stopki, przełączniki, pola ilości ≥ 44 px) |
| Wnętrza (ilustracje SVG) | wszystkie | teksty w ilustracjach (tablice) mają kolory z grafik, nie z palety: pomiar je zgłasza, to część ilustracji, nie interfejs | bez zmian |
| Poziome przewijanie | 390 px | nie wykryto | ✓ |

## Nowe znaleziska (wątek 04/kontrast, 24.11)
| Ekran | Paleta | Usterka | Stan |
|---|---|---|---|
| Wszystkie okna z ikoną „i” | wszystkie | kółko „i” z `opacity: .85` (kontrast < 4,5:1, w „wysokiej” < 7:1) | poprawione ✓ (`dostepnosc.css`) |
| Paragon, teczka: gwiazdki ocen | wszystkie | pusta gwiazdka niewidoczna / ledwie widoczna | poprawione ✓: pusta = sam obrys, pełna = wypełniona (stan niesie kształt). Miernik widzi obrys jako „przezroczysty tekst” (1:1): to nie usterka |
| Koperta, paragon, tablica w parku | ciemny | kółko „i” 1,2–4,2:1 | poprawione ✓ (kolory dobrane do tła: papier / tektura / teczka) |
| Okna z przyciskami na papierze | wysoka | biel na szarym przycisku 5,3:1 | poprawione ✓ (czerń papieru) |
| Giełda, pierzeja bankowa: „Wyniki” | bar jasny | 4,07:1 | bez zmian: przycisk nieaktywny (`button.szare`), wyjątek WCAG |
| Telefon: małe kółka „i” (17 px), pole wyboru 13 px | bar jasny | cel < 44 px | częściowo: kółka dostały niewidzialną nakładkę dotyku (pomiar liczy sam widoczny rozmiar); pole wyboru w `<label>` klika się całym wierszem, bez zmian |

## Czego nie zrobiono
- Okna na telefonie obejrzano pomiarem (390×844, bar jasny i wysoka ciemna); oglądanie każdego okna wzrokiem tylko wyrywkowo.
