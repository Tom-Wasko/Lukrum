# Wątek: wydajnosc (podróż 03)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/03-okienka-i-rundy/wspolne.md`. Są tam zasady, testy i commity.
  Wątki paragon, wydarzenia, list, zeszyt i wyniki są już scalone. Równolegle pracują tylko `03/rundy` i `03/opisy`.
- **Cel (Z37):** gra wczytuje się szybciej. Dziś panel gracza ładuje około 80 modułów JS osobnymi żądaniami.
- **Ustalone:**
  - Wejście do panelu to `panel_gracza/templates/panel_gracza/gra.html`, który ładuje `{{ statyczne }}app.js` jako moduł.
    Strona startowa ładuje `pulpit_ucznia.js`.
  - Po wątku 02/mapa pierwsze wczytanie trwało 914 ms. Mierz tak samo przed zmianą i po niej, na serwerze lokalnym.
    Do pomiaru nie potrzebujesz przeglądarki: policz żądania i sprawdź, czy ich liczba spadła.
- **Jak (decyzja Archiego):**
  1. Najpierw `<link rel="modulepreload">`: generowana lista modułów (np. polecenie `manage.py` albo skrypt w
     `narzedzia/`, który zbiera importy od `app.js`) wstawiana do szablonu.
  2. Jeśli to za mało, opcjonalnie jeden plik z modułami. Tylko bez nowych zależności npm, które trzeba instalować u
     szefa, i bez kroku budowania, który trzeba pamiętać przed `start.bat`. Jeśli budowanie jest potrzebne,
     `manage.py graj` musi je robić sam.
  3. Zmiana nie może zepsuć trybu deweloperskiego: edycja pliku JS i odświeżenie strony mają nadal działać.
- **Pliki do zmiany:**
  - szablony w `panel_gracza/templates/`;
  - nowe narzędzie w `narzedzia/` albo `panel_gracza/`;
  - w razie potrzeby `lukrum/settings` i widok, który podaje `statyczne`;
  - testy w `gra/testy/aplikacja/`.
- **Nie ruszaj:** treści modułów JS (wolno tylko poprawić importy, jeśli to konieczne), `dane/`, `silnik/`.
- **Gotowe, gdy:**
  - Lista preload obejmuje wszystkie moduły, do których dochodzi `app.js`. Pilnuje tego test: nowy moduł bez preloadu
    nie przejdzie.
  - W raporcie są liczby przed i po: liczba żądań i czas pierwszego wczytania.
  - README i `gra/dokumentacja/STACK.md` mają akapit o wczytywaniu.
  - Pełne testy są zielone.
- **Zrzuty ekranu:** nie.

## Raport
