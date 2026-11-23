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
| Wszystkie wnętrza | wszystkie palety | zeszyt wujka: tekst „następny krok” ma kontrast 4,0–4,9:1 (kolor rudy na jasnej kartce) | pominięte: przerabia 03/kartki. Propozycja: tekst kartki zawsze `--g-czern`, krok „teraz” oznaczony ▶ i pogrubieniem |
| Sanepid, okno „Higiena” | wysoka ciemna | cena w kartach opcji turkusowa, kontrast 6,9:1 (< 7:1) | propozycja: użyć `--tusz` albo jaśniejszego koloru dla cen w „wysokiej” (nie znaleziono jeszcze, skąd bierze się kolor) |
| Banki (5 wnętrz), okno „Porównaj banki” | wysoka ciemna | „37 760 zł”, „Najtańszy leasing”: 4,5–4,6:1 | propozycja: sprawdzić kolor wyróżnienia w tabeli banków |
| Park handlowy, market budowlany | wysoka ciemna | liczniki „1”, „4” w kartach: 4,5–4,8:1 | propozycja |
| Agencja pracy | wysoka ciemna | „36 na rynku”, „Pokaż więcej”: 4,1–4,4:1 | propozycja |
| Galeria, ubezpieczyciel, stolarnia | bar jasny i wysoka | liczby w licznikach: 2,7–4,5:1 | propozycja |
| Kamienica rachmistrzów | bar jasny | „Najtańsze”, „O biurze”, „108 zł”: 1,6–1,7:1 (do sprawdzenia: możliwe tło obrazkowe, którego pomiar nie widzi) | propozycja: obejrzeć w przeglądarce |
| Poczta | bar jasny | przycisk „Popraw”: 1,4:1 (jak wyżej, do sprawdzenia) | propozycja |
| Przyciski ✕ okien, „Wybierz” | pulpit | 40×40 px (na komputerze akceptowalne, na telefonie < 44 px) | propozycja: `min-width/height: 44px` w `swiat/wnetrza.css` |
| Wnętrza (ilustracje SVG) | wszystkie | teksty w ilustracjach (tablice) mają kolory z grafik, nie z palety: pomiar je zgłasza, to część ilustracji, nie interfejs | bez zmian |
| Poziome przewijanie | 390 px | nie wykryto | ✓ |

## Czego nie zrobiono (do ustalenia z Archim)
- Zrzuty „po” (dla poprawek wyżej): serwer w tle został wyłączony przez system (mało pamięci), nie uruchamiałem go
  ponownie. Poprawki zweryfikowane tylko pomiarem sprzed wyłączenia (menu i strzałki) oraz testami.
- Przegląd okien na telefonie (plik kroków `_robocze/k_okna_tel.json` jest gotowy, nieuruchomiony).
- Pełne testy (7 min): uruchomiono tylko `testy/aplikacja` (261 zielonych), `ruff` czysty, `node --check` czysty.
