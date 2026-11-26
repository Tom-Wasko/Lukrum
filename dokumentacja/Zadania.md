# Zadania
Następny numer: Z56

Kolejność ustalona 22.11: najpierw lekkie poprawki, potem ważne, potem mniej ważne. Zrobione dawniej:
`historia/postep.md`. Pytania do zadań: `Stan.md`, „Czeka na szefa”. Uwagi z gier testowych 20 i 22.11 (szef,
majster) w nawiasach: numer z listy szefa albo „m” (majster).

## W toku

## Następnie
Podróż 04-wyglad-i-dzwiek (start 24.11):

## Zrobione w tej podróży

## Zaplanowane

### Lekkie poprawki

### Ważne
- Z20 · zgłoszenie do „Zwolnieni z Teorii” z datą lekcji (31.03.2027, niepotwierdzone); `METODA.md` (jawność AI) po pobraniu regulaminu (`wiedza/analizy/regulamin-zwzt-a-ai.md`)

### Mniej ważne
- Z7 · mapa (reszta): współrzędne OSM dla 10 punktów orientacyjnych i Auchan/błoni/Lidla porównać z `xy`/`geo` (próg 80 m; wymaga sieci, Nominatim był zablokowany); „zakrystia akustyczna” w katedrze i który most Lutosławskiego (opis „most”) do potwierdzenia; wybór ikony lokalu (6 wariantów, dziś 3) i usunięcie `/static/mapa/podglad_lokali.html` (decyzja szefa). Zrobione 25.11: geo lokali w `lokale.yaml`, odsyłacze usunięte, opisy sprawdzone (poprawione Trybunał 1579 i Czwartek), raport w `podroze/04-wyglad-i-dzwiek/watek-punkty-zrodla.md`
- Z14 · wydarzenia dla filii, popyt z mapy (nastrój zespołu na twarzach zrobiony 25.11, wątek 04/nastroj: miny obsługi w kebabie z nastroju)
- Z53 · po przeglądzie Z22 (`podroze/04-wyglad-i-dzwiek/przeglad-z22.md`): położenia 3 billboardów w `reklama.yaml` do sprawdzenia w OSM + `zrodlo` (Rondo 100-lecia KUL ok. 3,7 km od centrum); billboardy niezależne od strefy kampanii (decyzja szefa); test nowej ścieżki debetu (Z52) + pomiar balansu; drobne: CSS `.lm-billboard`, mina „zmęczone osoby”, notatka `funkcje/` dla historii parkowych i billboardów
- Z55 · ceny i oferty na rysunkach wnętrz z danych gry (`/api/katalogi`), nie przepisane z makiet (dziś np. `sceny/bank*.js`: „14,9%”, „35 ZŁ”); wzór w gałęzi `wnetrza-cenniki` (`swiat/cennik.js`, 22.11, sprzed przeniesienia repo, nie do scalenia wprost; gałąź usunąć po zrobieniu)
- Z54 · przegląd pozostałych nowych historii (`parki.yaml`) pod kątem neutralności płciowej (2 formy męskie poprawione 25.11)
- Z27 · wersja na telefon (układ razem z majstrem) i pilot w szkole do maja 2027
- Z24 · nazwa w UPRP i znaki towarowe (zwłaszcza poza szkołami), publikacja za zgodą szefa
- Z39 · moduły panelu w jednym pliku (paczka), jeśli preload z 03/wydajnosc nie wystarczy przez hostuj/Cloudflare; najpierw zmierzyć. Pomiar 25.11 (statyczny): app.js ładuje 75 modułów (1164 KB), łańcuch importów ma 11 poziomów; czas przez hostuj/Cloudflare niezmierzony; paczka wymaga kroku budowania (nowe narzędzie): decyzja szefa

## Odłożone
- Z19 · (czeka na powrót kolegi) serwer szkoły: szef z kolegą ustawia LUKRUM na serwerze szkoły (FTP) 23.11; osoba od `manage.py zamykaj_rundy`, dane uczniów (RODO) i notka w instrukcji
- Z48 · zeszyt wujka na telefonie (dziś tylko ekran ≥ 901 px); późna przyszłość
- Z26 · niestabilny test kasyna (dziś `test_mistrz_gry_widzi_klub`): 22.11 nie powtórzył się w 2 pełnych przebiegach; wrócić, gdy się pojawi
- Z2 · gry testowe: znajomi 20 i 22.11 za nami; dalej 4–6 osób ze stoperem, potem klasa; balans jest dotąd tylko z botów;
  w najbliższej grze sprawdzić poprawki z podróży 02 (sklepy, Park, mapa, drobne), kategorie w rzędzie (1) i „Jak grać” w zakładkach (3)
