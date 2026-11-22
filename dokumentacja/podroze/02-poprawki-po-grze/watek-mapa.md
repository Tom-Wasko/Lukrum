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
**Stan:** częściowo (płynność mapy, licznik, oddalenie po rundzie: gotowe; wczytywanie i „usuń zamówione”: przyczyny opisane, poprawki leżą poza moimi plikami)
**Zmienione pliki:** `gra/panel_gracza/static/mapa/lublin.js`, `mapa/mapa.css` (blok na końcu, `/* podróż 02/mapa */`), `gra/testy/aplikacja/test_pulpit.py` (nowy test).
**Dowód:**
- Płynność (Edge, 1400×850, poziom 3, ok. 2500 węzłów DOM, bez throttlingu), czas klatki przed → po:
  przesuwanie: mediana 18,2 ms (p95 30,4; 15 klatek >33 ms) → 6,1 ms (p95 6,2; 2 klatki >33 ms);
  zoom kółkiem: mediana 103 ms → 30 ms; zoom przyciskami: 79 ms → 24 ms. Czas zadań przeglądarki na 14 krokach zoomu: 6,3 s → 2,35 s.
  Przy spowolnieniu CPU ×4 (tylko „przed”): przesuwanie p95 133 ms, zoom ok. 580 ms na klatkę.
- Przyczyna: w każdej klatce przeglądarka od nowa rysuje cienkie linie SVG z `vector-effect: non-scaling-stroke` (granice dzielnic z kreskowaniem,
  kolej, ulice osiedlowe, napisy ulic). Skrypty i układ to tylko 0,1–0,5 s z 6 s. Rozwiązanie: klasa `lm-ruch` na mapie w czasie ruchu
  (znika 150 ms po ostatniej zmianie widoku), CSS chowa te warstwy.
- Wczytywanie (localhost): ok. 1,7 s do pierwszych żetonów, 3,0 s do końca „Wczytywania…”. Składa się z 94 żądań (ok. 80 modułów JS osobno)
  i `api/gry/<id>/widok` (197 KB). Serwer: widok 200 ms po rozgrzaniu, ale pierwsze wywołanie po starcie serwera ok. 2,5 s (`scipy linprog` w silniku
  i importy). Do tego `lukrum/statyczne.py` daje `no-cache` na wszystkich plikach statycznych (przeglądarka pyta o każdy ze 94 plików przy każdym
  wejściu) i liczy `wersja()` (ok. 42 ms) przy każdym renderze strony. Tych plików nie ruszałem (spoza briefu), patrz Propozycje.
- „Usuń zamówione zasoby”: przycisk jest w `zakladki/dostawcy.js` (`zam-usun`, `zam-wyczysc`), czyli w pliku wątku `02/sklepy`: nie zmieniałem.
  Przyczyna: każde kliknięcie robi PUT całych decyzji (ok. 200 ms serwera, odpowiedź 197 KB) i pełne przerysowanie strony (`ustaw` → `rysuj`)
  zamiast odświeżenia fragmentu. `zmien(fn, lokalnie)` w `app.js` już to umie: wystarczy drugi argument.
- Żetony: Kamienica rachmistrzów i Park handlowy są na mapie w tej wersji (sprawdzone w przeglądarce: kalkulator z szyldem po przybliżeniu,
  zespół parku jest w DOM; `WG_ID` ma wpisy). Brakującej ikony nie znalazłem, zgłoszenie mogło dotyczyć starszego stanu. Nic nie zmieniałem.
- Licznik: 4 i 5 przy Kamienicy bankowej i Biurowcu to była liczba firm w zespole (`lm-ile`). Usunięty; plakietka „!” zostaje tylko przy prawdziwej sprawie (parki).
- Po zmianie rundy: `po()` zerowało część pamięci, ale nie `ostatniZanik`, więc nowa ramka nie dostawała `--zanik` i żetony były widoczne na oddalonej
  mapie. Poprawione (reset `ostatniZanik`, `ostatnieK`, `czysta`). W przeglądarce po zmianie rundy na oddalonej mapie `--zanik` = 0,00 i widać tylko własny
  lokal. Nie porównywałem z wersją sprzed poprawki (nie odtworzyłem błędu osobno).
- `pytest testy/aplikacja/test_pulpit.py testy/aplikacja/test_swiat.py` → `36 passed in 4.03s`
- `ruff check .` → `All checks passed!`; `silnik.dane sprawdz` → `Dane w porządku`; `node --check` lublin.js → ok (test `test_skladnia_js`).
- Pełne testy: `pytest -q -p no:cacheprovider` (pełne) → `877 passed in 353.88s (0:05:53)`
**Decyzje, które podjąłem:** licznik firm przy zespole usunięty całkiem (dla banków i biurowca nie ma dziś źródła spraw); w ruchu mapy chwilowo znikają
granice, kolej i ulice (wracają po 150 ms).
**Pytania do szefa:** czy akceptujesz, że przy przesuwaniu granice dzielnic i kolej chwilowo znikają? (Alternatywa: zostawić je i mieć wolniejszy ruch.)
**Propozycje (poza zakresem):**
1. `lukrum/statyczne.py`: dla adresów `/static/v<wersja>/` dać `Cache-Control: max-age=31536000, immutable` zamiast `no-cache`, a `wersja()` policzyć raz na proces.
2. Rozgrzanie silnika przy starcie serwera (pierwszy widok gry ok. 2,5 s).
3. Złożenie modułów JS w jeden plik (80 żądań) albo `modulepreload`.
4. `dostawcy.js`: `zam-usun` i `zam-wyczysc` z drugim argumentem `lokalnie` (wątek `02/sklepy`).
5. Docelowo obrysy bez `non-scaling-stroke` (stała szerokość przez `--k`), wtedy linie mogłyby zostać w ruchu.
**Commity:** `git log --oneline -4` na gałęzi `worktree-podroz-02-mapa`

## Dopisek: Z31 (cache statyków i rozgrzewka), po prośbie Archiego
**Zmienione pliki:** `gra/lukrum/statyczne.py`, nowy `gra/lukrum/rozgrzewka.py`, `gra/panel_gracza/management/commands/graj.py` i `hostuj.py`
(wywołanie `rozgrzej_w_tle()`), testy w `gra/testy/aplikacja/test_konta.py`.
**Co:** adresy `/static/v<wersja>/…` dostają `Cache-Control: max-age=31536000, immutable` (adresy bez wersji zostają `no-cache`).
`wersja()` liczy się raz na proces, gdy `DEBUG` jest wyłączony (`hostuj`); przy `DEBUG` (domyślnie, także `graj`) za każdym razem, żeby zmiany plików
było widać od razu. Cache jest unieważniany, gdy zmieni się `STATICFILES_DIRS`. Rozgrzewka (wątek-demon przy starcie `graj` i `hostuj`) ładuje
`api.widoki`, `silnik.kuchnia.operacje`, scipy i robi jedno małe `linprog`; testy i inne komendy jej nie wołają.
**Pomiary (localhost, Edge, ta sama gra):**
- Pierwszy widok gry po starcie serwera (Django test client, osobny proces): 2238 ms → 914 ms po rozgrzewce; kolejne widoki bez zmian (ok. 183 ms).
  Pozostałe ok. 0,7 s to pierwsze wczytanie stanu gry, którego rozgrzewka ogólna nie obejmuje.
- Ponowne wejście w tę samą stronę (przeglądarka z cache): 848 ms → 447 ms i 631 ms → 374 ms; zapytań z odpowiedzią 304: 89 → 0.
- Pierwsze wejście w przeglądarce (zimny cache): bez wyraźnej zmiany (1844 ms przed, 2120–2328 ms po; rozrzut pomiarów większy niż różnica).
  Zysk jest więc przy kolejnych wejściach, nie przy pierwszym.
**Dowód:** `ruff check .` → `All checks passed!`; testy: `pytest -q -p no:cacheprovider testy/aplikacja` → `222 passed in 126.25s`
**Uwaga:** w teście `test_strony_wczytuja_pliki_statyczne_z_wersja_w_adresie` zmieniłem oczekiwanie z `no-cache` na `immutable` dla adresu z wersją
(zamierzona zmiana zachowania); dodane testy: wersja liczona raz poza DEBUG i za każdym razem w DEBUG, adres bez wersji dalej `no-cache`, rozgrzewka nie wywala serwera.
