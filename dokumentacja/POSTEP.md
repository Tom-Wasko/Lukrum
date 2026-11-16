# LUKRUM – postęp prac

Zadania i stan etapów. Pełny plan przebudowy jest w repo `Tom-Wasko/Lukrum-notatki` (`PLAN_PRZEBUDOWY.md`). Każdy etap kończy się
przeglądem autora.

## Etap 1 – gra pod nową nazwą (zrobione 13.11.2026, poprawki po przeglądzie)
Gra ma działać jak dotąd. Nowy wygląd przyjdzie później.
- [x] Nowe repozytorium, kopia sprawdzonych plików gry, pakiet Django `lukrum`
- [x] Nowe README, AGENTS.md, STACK.md, OPIS_GRY.md
- [x] Usunięcie starych nazw i wzmianek z kodu, danych i testów; źródła założeń opisane realiami
- [x] Usunięcie starego wyglądu (tabele); obecny wygląd bez zmian
- [x] Prawdziwe marki: zastrzeżenie w grze, własne ikony zamiast logo
- [x] Ukryty klub „Pod Złotym Koziołkiem”: hasło „koziol” otwiera go zawsze
- [x] Instrukcja dla graczy i PDF pod nową nazwą
- [x] Sprawdzenie: pełne testy, ruff, `silnik.dane sprawdz`, gra botów

## Etap 1½ – planowanie wyglądu (rozmowa z autorem)
Wynik: `raporty/wyglad/plan.md` z kierunkiem wyglądu mapy, kolorami, czcionkami i wersją na telefon.

## Nowe mechaniki – tor A (w tle, osobna gałąź `mechaniki-a`)
- [x] wynik 0–1000 pkt z pięciu działów, ranking jako suma tygodni, „Wielkie otwarcie” (gałąź mechaniki-a)
- [ ] debet z opłatą zamiast automatycznego kredytu (zrobione), pomyłki w szczycie zamiast reklamacji
- [x] biura w pakietach S/M/L, kapitał 50 000 zł, banki ze specjalizacjami (nazwy z lektur)
- [ ] kadry według Kodeksu pracy, nowe katalogi, usunięcie starej reklamy
- [ ] pomiary botów i raport do zatwierdzenia przez autora

## Nowe mechaniki – tor B (po prototypie mapy)
- [ ] opinie gości w gwiazdkach, nastrój zespołu, wydarzenia dla filii, popyt z mapy, fabuła z wujkiem-restauratorem
- [ ] przepisanie wszystkich opisów w grze pod nowe mechaniki

## Etap 2 – prototyp mapy Lublina (cel: 16.11.2026)
Mapa z danych OpenStreetMap (podpis „© autorzy OpenStreetMap”) z płynnym przybliżaniem. Wnętrze kebaba
(lada, kuchnia, sala, zaplecze, biuro), pasek skrótów i obsługa telefonu.
- [x] adresy i współrzędne budynków i zespołów z OSM (`gra/dane/mapa/budynki.yaml`: `adres`, `geo`)
- [x] dane mapy z OSM: granice dzielnic, woda, zieleń, drogi, kolej (`narzedzia/mapa/pobierz_osm.py` →
  `gra/panel_gracza/static/mapa/lublin.json`)
- [x] silnik mapy z płynnym przybliżaniem i trzema poziomami szczegółów (`gra/panel_gracza/static/mapa/`)
- [x] budynki-ikony, zespoły (kamienica bankowa, biurowiec przy Zana), lokale, parki ze zdarzeniami, warstwy
- [x] pasek skrótów (na telefonie na dole), trzy palety × jasny/ciemny ze wspólnych zmiennych
- [ ] wnętrza po kliknięciu budynku (strona mechanik; do tego czasu otwiera się dotychczasowa zakładka)
- [ ] położenia lokali w danych gry (dziś w `lublin.json`), boty i billboardy na mapie, przegląd autora

## Etap 3 – wszystkie miejsca na mapie
Banki, urzędy, hurtownie, giełda i pozostałe strefy zamiast zakładek. Nawiązania literackie. Boty na mapie.

## Etap 4 – lekcje
Scenariusze lekcji WOS dla nauczyciela i gotowe zestawy odsłoniętych funkcji.
Projekt pięciu scenariuszy (gałąź `fable`, 16.11.2026): [`SCENARIUSZE_LEKCJI.md`](SCENARIUSZE_LEKCJI.md) – do przejrzenia, bez odwołań do podstawy programowej i bez próby w klasie.

## Etap 5 – audyt i publikacja
Przegląd całości, sprawdzenie znaków towarowych i publikacja.
