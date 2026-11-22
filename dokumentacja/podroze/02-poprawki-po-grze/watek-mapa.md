# Wątek: mapa (podróż 02)

## Brief
- **Cel:** mapa ma działać płynnie i pokazywać właściwe ikony i liczniki. To uwagi z gier testowych 20 i 22.11
  (Z31 i część Z29 w `dokumentacja/Zadania.md`).
- **Ustalone (nie sprawdzaj ponownie):**
  - Projekt: gra w `gra/` (przewodnik `gra/AGENTS.md`, zasady `CLAUDE.md` w korzeniu). Ścieżki niżej liczone od
    `gra/panel_gracza/static/`.
  - Mapa: `mapa/widok.js` (przesuwanie, przybliżanie), `mapa/lublin.js`, `mapa/ikony.js` (`WG_ID` ma już wpisy
    `kamienica_rachmistrzow: "kalkulator"` i `park_handlowy: "meble"`), `zakladki/mapa.js`, `mapa_budynki.js`,
    `mapa_teren.js`, `mapa_pojazdy.js`, `mapa_uklad.js`, dane `gra/dane/mapa/budynki.yaml` (żetony mają `geo`
    i `mapa: {x, y}`).
- **Do zrobienia (uwagi szefa i majstra):**
  1. „Mapa zacina się mocarnie”: zmierz czas klatki przy przesuwaniu i przybliżaniu (Performance albo
     `requestAnimationFrame` w konsoli), znajdź przyczynę (np. przerysowanie całego SVG, filtry, cienie, liczba węzłów,
     nasłuchy) i usuń ją. Liczby przed i po wpisz do raportu.
  2. „Wczytywanie no”: wolne wczytywanie gry i mapy. Zmierz czas do pierwszego widoku, przyspiesz (leniwe ładowanie,
     mniej zapytań, cache).
  3. Wolne „usuń zamówione zasoby”: znajdź, gdzie jest ten przycisk (`grep -rn "usu" zakladki/`), i przyspiesz.
     Jeśli leży w `zakladki/dostawcy.js` (należy do wątku `02/sklepy`), opisz przyczynę w raporcie zamiast zmieniać ten plik.
  4. Brak ikony Kamienicy rachmistrzów na mapie (szef). Park handlowy też nie widać na mapie. Oba żetony mają się
     pojawiać i mieć ikonę.
  5. Licznik (np. 4 albo 5) przy Kamienicy bankowej i Biurowcu przy Zana sugeruje coś do zrobienia, choć nic nie ma.
     Licznik ma się pojawiać tylko przy prawdziwym zadaniu albo błędzie.
  6. Po zmianie rundy na oddalonej mapie widać wszystkie ikony (powinny być ukryte jak zwykle przy oddaleniu).
- **Pliki do zmiany:** `mapa/*`, `zakladki/mapa*.js`, `gra/dane/mapa/budynki.yaml`, `mapa/mapa.css`, testy
  w `gra/testy/swiat/` i `gra/testy/aplikacja/`. Jeśli przyczyna wolnego wczytywania siedzi w `api/` albo w `app.js`,
  możesz je zmienić.
  **Nie ruszaj** (inne wątki pracują równolegle): `swiat/*`, `zakladki/dostawcy.js`, `marketing.js`, `inwestycje.js`,
  `pulpit/karta.js`, `pulpit/zeszyt.js`, `pulpit/pulpit.js`, `zakladki/hr.js`, `rynek_pracy.js`, `oferta.js`, `lokal.js`,
  `zdarzenia.js`. Wspólne pliki CSS (`pulpit/pulpit.css`, `styl.css`) zmieniaj tylko, dopisując blok na końcu
  z komentarzem `/* podróż 02/mapa */`.
- **Zasady:** liczby gry tylko w `dane/*.yaml`, kolory przez zmienne z `motywy/zmienne.css`, 3 palety × jasny i ciemny,
  stan nigdy samym kolorem. Po zmianie `dane/*.yaml` uruchom `PY -X utf8 -m silnik.dane sprawdz`. Każde miejsce
  na mapie ma własny żeton i własne wnętrze. Pozycji żetonów, które ustawił szef (`kamienica_rachmistrzow`, `blonia`,
  `kamienica_bankowa`), nie przesuwaj. Testów nie osłabiaj, do naprawy logiki dodaj test.
- **Gotowe, gdy:**
  - przesuwanie i przybliżanie mapy jest płynne (czas klatki przed i po w raporcie);
  - wczytywanie jest szybsze (czasy w raporcie);
  - widać żetony Kamienicy rachmistrzów i Parku handlowego;
  - liczniki pojawiają się tylko przy prawdziwych zadaniach;
  - po zmianie rundy oddalona mapa zachowuje się jak zwykle.

  Sprawdź w przeglądarce na serwerze (`manage.py graj --port 8763 --bez-przegladarki`, gra `manage.py gra_pokazowa`,
  zmiana rundy z panelu MG), potem zatrzymaj serwer. Dowód: `PY -X utf8 -m pytest -q -p no:cacheprovider 2>&1 | tail -5`
  (pełne, raz na koniec), `PY -m ruff check .`, `node --check` każdego zmienionego modułu.
- **Zrzuty ekranu:** nie.
- **Dokumenty do poprawienia:** `gra/dokumentacja/STACK.md`, jeśli zmienia się budowa mapy.
- **Archi:** archi-lukrum

## Raport
<!-- Pisze wyko na końcu. -->
**Stan:** gotowe | częściowo | zablokowane
**Zmienione pliki:**
**Dowód:** `<komenda>` → `<ostatnie linie wyniku>`
**Decyzje, które podjąłem:**
**Pytania do szefa:**
**Propozycje (poza zakresem):**
**Commity:**
