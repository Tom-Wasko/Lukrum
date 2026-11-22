# Wskazówki skutków na tablicy wydarzeń

- **Stan:** wdrożone w podróży 03 (wątek `03/wydarzenia`), do sprawdzenia przez szefa
- **Gdzie w grze:** mapa → park (albo wnętrze parku → tablica „Co się tu dzieje”) → okno z kartką wydarzenia

## Dla ucznia (do instrukcji)
W parku wiszą kartki z wydarzeniami. Pod każdą możliwą reakcją widać wskazówki: **▲** to coś, co wzrośnie, **▼** to coś, co
spadnie, a dwie strzałki (▲▲, ▼▼) znaczą, że zmiana będzie duża. Na przykład „Kasa ▼ · Goście ▲▲” to droga reakcja, po której
przyjdzie dużo gości. Dokładnych liczb nie ma, więc trzeba samemu ocenić, czy to się opłaca. Dopisek „ciąg dalszy…” mówi, że
historia będzie miała następną scenę. Każdy park ma inną tablicę (inne godło, hasło i wzór tła).

## Zasada działania
- Wskaźniki: Kasa (złotówki: przychód minus koszt reakcji i porcji), Goście (zmiana popytu razy liczba rund), Czas (godziny
  właściciela), Kontrola (szansa kontroli sanepidu), Kadra (kandydat do pracy).
- Siłę liczy `api/prezentacja.py` (`wskazowki_opcji`) z kosztu i skutków opcji w `dane/zdarzenia/parki.yaml`.
  Progi „mała / duża zmiana” są w `dane/zdarzenia/wskazowki.yaml` (założenie, do kalibracji po lekcjach).
- Znak jest zawsze w tekście (▲ ▼), nigdy samym kolorem; działa w paletach bar, pewex i wysokiej widoczności.
- Wygląd parków: `static/swiat/parki_wyglad.js` (godło, hasło, wzór) i blok „03/wydarzenia” w `static/styl.css`.

## Czego uczy (do planu zajęć)
- pojęcie z WOS / przedsiębiorczości: koszt alternatywny (czas właściciela albo pieniądze), ryzyko i decyzja przy niepełnej
  informacji, wizerunek firmy w okolicy
- pytanie do omówienia: czy lepiej wydać czas, czy pieniądze, gdy nie wiadomo dokładnie, co z tego wyniknie?
- krótkie zadanie dla drużyn: wybierzcie trzy kartki i uzasadnijcie, którą reakcję wybierzecie na podstawie samych strzałek

## Do promocji
Tablica korkowa z kartkami na pinezkach i strzałkami „co zyskasz, co stracisz” – czytelne od pierwszego spojrzenia, bez tabel.

## Nawiązanie
Tablice ogłoszeń w lubelskich parkach i na osiedlach; decyzje z niepełną informacją jak u właściciela małego lokalu.
