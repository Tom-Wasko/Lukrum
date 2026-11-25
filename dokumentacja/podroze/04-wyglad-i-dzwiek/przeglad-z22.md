# Przegląd Z22: gałąź podroz-04 względem main

Recenzent: świeże spojrzenie, bez wiedzy o przebiegu prac. Kodu nie zmieniano. Zakres: `git diff main...podroz-04`
(JS/CSS panelu, dane YAML, silnik `banki.py` i `runda.py`, teksty dla gracza, dokumentacja).

Sprawdzone: `ruff check .` bez uwag, `silnik.dane sprawdz` w porządku, 27 testów w trzech dotkniętych plikach
(`test_kebab_wyglad.py`, `test_reklama.py`, `test_zdarzenia.py`) przechodzi. Pełnego przebiegu testów (ok. 7 min)
i zrzutów ekranu nie robiłem. Adresy Wolnych Lektur z `nawiazania.md` sprawdziłem: 5 z 5 odpowiada HTTP 200.

## Ważne

### 1. Położenia billboardów bez źródła, przynajmniej jedno prawdopodobnie błędne (wysoki)
- Gdzie: `gra/dane/mapa/reklama.yaml` (punkty `billboard_dmowskiego`, `billboard_kul`, `billboard_thatcher`),
  np. `billboard_kul` ok. l. 102-106.
- Problem: po przeliczeniu rzutem z `lublin.json` punkt „Rondo 100-lecia KUL” (51.25584, 22.50721) leży ok. 3,7 km
  na zachód od środka mapy, a KUL jest ok. 1,2 km od centrum. Punkt „Rondo Thatcher” (51.28011, 22.55296) wypada
  ok. 3,5 km na północ, w Czechowie. Nie znalazłem źródła potwierdzającego nazwy ani położenia (wyszukiwanie
  nic nie zwróciło o Lublinie), a plik nie podaje `zrodlo`. Zasada projektu: wiedza ze źródeł, nie zmyślona
  (`gra/AGENTS.md` pkt 5 i baza).
- Dlaczego źle: gra jest na lekcje WOS w Lublinie, a uczeń z Lublina od razu zobaczy billboard „przy KUL” w polu.
  Nazwa rzeczywistego ronda w grze musi się zgadzać z rzeczywistością (prawdziwe nazwy własne).
- Poprawka: sprawdzić każdy punkt w OSM albo w mapie miasta i wpisać źródło. Jeśli ronda nie ma, nazwać billboard
  neutralnie (np. „Billboard przy al. Racławickich”) i dać współrzędne rzeczywistej ulicy. Dopisać `zrodlo` do
  punktów. Zadanie Z7 (weryfikacja położeń) nadal otwarte, więc ten wątek też je potrzebuje.

### 2. Z52: opłata za debet po rozliczeniu banku zmienia ekonomię gry bez testu i bez pomiaru (wysoki)
- Gdzie: `gra/silnik/runda.py:290-291`, `gra/silnik/pieniadze/banki.py:507-541` (`oplata_debetu`).
- Problem 1: warunek `"debet" not in bank_koniec` chroni przed podwójnym naliczeniem tylko pośrednio, bo zależy od
  tego, że `koniec_rundy` zawsze wpisuje klucz `debet`, gdy go nalicza. Przy parametrze opłaty równym 0
  (`oplata_debet_bez_zgody`) klucz może nie powstać i opłata zostanie liczona drugi raz. Warunek jest ukryty
  przed czytelnikiem i niczym niepilnowany.
- Problem 2: nie widzę osobnego testu jednostkowego nowej ścieżki (minus powstaje dopiero po podatkach i biurze,
  opłata jest naliczona dokładnie raz, kwota w `bank_koniec`). Zasada: do nowej mechaniki dodaj test.
- Problem 3: zmiana wpływa na wynik każdej gry z debetem, a nie ma śladu ponownego pomiaru balansu
  (`balans.symuluj`) ani wpisu w `INSTRUKCJA.md` / `OPIS_GRY.md` (zmiana widoczna dla gracza).
- Poprawka: wstawić jawne pole (np. `bank_koniec["debet_naliczony"] = True`) zamiast sprawdzania obecności klucza,
  dopisać test na dwa scenariusze (minus przed i po rozliczeniu banku), uruchomić `balans.symuluj 12 sredni 7`
  przed i po, dopisać akapit do instrukcji.

## Średnie

### 3. Billboardy pokazują się wszystkie naraz, niezależnie od strefy kampanii (średni)
- Gdzie: `gra/silnik/rynek/reklama.py:280-293` (`billboardy`), opisy w `reklama.yaml`
  (np. l. 104: „trafia głównie do studiujących”, pole `strefa`).
- Problem: gdy trwa kampania billboardowa (własna albo cudza z poprzedniej rundy), funkcja zwraca wszystkie 3 punkty,
  a opisy i pole `strefa` sugerują, że każdy dotyczy innej grupy. Gracz zobaczy „billboard akademicki” także wtedy,
  gdy kampania celuje gdzie indziej. Dodatkowo mapa ujawnia, że konkurencja prowadzi kampanię, co może być
  zamierzone, ale nie ma o tym decyzji w `Decyzje.md`.
- Poprawka: filtrować punkty po strefie kampanii albo usunąć sugestię strefy z opisów. Decyzję o pokazywaniu cudzych
  kampanii zapisać w `Decyzje.md` (do potwierdzenia przez szefa).

### 4. Męska forma w tekście dla gracza (średni)
- Gdzie: `gra/dane/zdarzenia/parki.yaml:1151` (historia `wachlarz`, scena `lornetka`):
  „Pan z lornetką prosi, żebyś go zatrzymał”.
- Problem: „zatrzymał” to forma męska zwrócona do gracza; teksty dla gracza mają być neutralne płciowo
  (`CLAUDE.md`, `gra/AGENTS.md` pkt 5). Wokół są też podobne konstrukcje: l. 1038 „żebyś rozsądził sprawę”
  (też męskie). Warto przejrzeć wszystkie pięć nowych historii (bal_pozorow, spor_o_murek, kulig_karczma,
  wachlarz, doktor_z_walizka) pod tym kątem; test `test_zdarzenia.py` takiego sprawdzenia nie robi.
- Poprawka: „prosi o zatrzymanie go”, „prosi, by sprawę rozstrzygnięto”, „Wydawany jest wyrok…” lub strona bierna.

## Drobne (niski priorytet)

5. `gra/panel_gracza/static/swiat/swiat.js:54,81`: opis miny „Imię: zmęczone osoby w zespole” przy jednej osobie
   (liczba mnoga, „osoby w zespole” zamiast stanu danej osoby). Lepiej: „Imię: zmęczenie” / „Imię: zły nastrój”.
   Wpis w l. 82 dla zastępczego „Pracownik” duplikuje ten sam szablon opisu.
6. `gra/testy/swiat/test_kebab_wyglad.py`: testy min sprawdzają regexem kod źródłowy JS, nie zachowanie. Zmiana
   formatowania kodu może je zepsuć, a błąd logiki ich nie złapie. Lepiej test danych (`silnik.yaml: miny`) plus
   prosty test w node na `MINA`.
7. `gra/panel_gracza/static/mapa/mapa.css:164-169` kopiuje reguły `.lm-miejsce .zt` z l. 185-189 (duplikacja).
   Wspólny selektor `.lm-miejsce .zt, .lm-billboard .zt` skróci i uprości utrzymanie. Kafel billboardu nie jest
   pomniejszany przy oddaleniu mapy (inaczej niż miejsca), może zasłaniać napisy.
8. `reklama.yaml`: nazwa agencji „Fala Koziołka” wpisana na sztywno w opisach punktów. Przy zmianie nazwy agencji opisy
   się rozjadą. Lepiej opis bez nazwy albo wstawienie nazwy z danych.
9. `gra/panel_gracza/static/swiat/wnetrze.js:151`: dodanie `.polka, .tlok-znak` do przeszkód szyldów jest sensowne,
   ale bez testu ani zrzutu na wąskim ekranie (telefon). Warto sprawdzić zrzutem w 3 paletach.
10. `dokumentacja/wiedza/nawiazania.md`: adresy Wolnych Lektur opisane jako niesprawdzone, a faktycznie odpowiadają
    HTTP 200 (sprawdzone dzisiaj). Zaktualizować adnotację na „sprawdzone <data>”.
11. Nowe historie parków: sprawdzić, czy każda ma wpis w `zrodla.yaml` z realnym źródłem i czy nawiązania literackie
    są opisane w `dokumentacja/funkcje/` (zasada: nowa funkcja gry to notatka z szablonu). Nie znalazłem notatki
    dla nowych historii ani dla billboardów na mapie.

## Zgodność z zasadami (krótko)
- Kolory w nowym CSS: tylko ze zmiennych, bez surowych wartości (w przejrzanych zmianach). Stan miny niesie opis
  tekstowy (`aria-label` i `<title>`), więc nie jest samym kolorem.
- Zero wzmianek o innych grach biznesowych w przejrzanym diffie i w opisach historii.
- Liczby gry: progi min i punkty billboardów w danych YAML, nie w silniku. Poprawnie.
- Commity: autor Tom-Wasko, bez dopisków (sprawdzone w `git log`).
