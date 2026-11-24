# Wątek: kontrast (podróż 04)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/wiedza/analizy/przeglad-wygladu-23-11.md` (przegląd 03/wyglad: tabela usterek
  i propozycji), `dokumentacja/Wyglad.md`. Gałąź bazowa: `podroz-04` (tryb autonomiczny; scalone 04/okna, 04/dzwieki,
  04/radio: okna mają nowe style w `swiat/okna.css` i `swiat/okna-teczka.css`). Równolegle nikt nie pracuje.
- **Cel (Z6):** przegląd rzadkich ekranów w trybie ciemnym i w „wysokiej” oraz pełny przegląd na telefonie; poprawki.
- **Do zrobienia:**
  1. Usterki z tabeli przeglądu oznaczone „propozycja”: zmierz od nowa na `podroz-04` (okna się zmieniły, część mogła
     zniknąć) i popraw te, które zostały: kontrast < 7:1 w „wysokiej” i < 4,5:1 w pozostałych paletach (Sanepid, banki
     „Porównaj banki”, park handlowy, agencja pracy, liczniki w galerii/ubezpieczycielu/stolarni, kamienica rachmistrzów
     i poczta – obejrzyj, czy to tło obrazkowe), przyciski ✕ i „Wybierz” ≥ 44 px na telefonie.
  2. Zeszyt wujka: tekst „następny krok” (kontrast 4,0–4,9:1): sprawdź, czy 03/kartki to rozwiązał; jeśli nie, popraw
     zgodnie z propozycją z przeglądu.
  3. **Przegląd okien na telefonie** (390×844, bar jasny i wysoka ciemna): plik kroków `_robocze/k_okna_tel.json`
     (z 03/wyglad; dopasuj do obecnych okien ze spisu `wiedza/analizy/spis-okien.md`). Pomiar automatyczny (kontrast,
     przewijanie poziome, przyciski < 44 px, ucięty tekst) + oglądanie; popraw usterki.
  4. Tabela przeglądu: dopisz stan każdego wiersza (poprawione ✓ / bez zmian z powodem) i nowe znaleziska.
- **Nie ruszaj:** mechaniki, tekstów, `dane/*.yaml`, plików dźwięku i radia. Poprawki w CSS (zmienne z
  `motywy/zmienne.css`; nowe zmienne tylko gdy konieczne, we wszystkich paletach), stan nigdy samym kolorem.
  Panel `/mg/` poza zakresem.
- **Zrzuty:** port 8784, `C:/Users/PC/Pulpit/lukrum/_robocze/zrzuty-kontrast/` (przed/po poprawionych ekranów).
  Jeden serwer; po pracy zatrzymaj.
- **Gotowe, gdy:** tabela przeglądu zaktualizowana; `testy/swiat` + `testy/aplikacja` zielone, `ruff`, `node --check`
  zmienionych modułów; na koniec pełne testy (wynik w raporcie).
- **Archi:** archi-lukrum.

## Raport
