# Podróż 02: poprawki-po-grze
Start: 2026-11-22 · tryb nadzorowany · scalanie do `main` · Zadania: Z29, Z30, Z1, Z31, Z34

## Cel
Naprawić to, co szef i majster znaleźli w grach testowych 20 i 22.11. Chodzi o sklepy, piętra, Park handlowy, mapę
i drobne usterki, żeby następna gra testowa (Z2) szła bez tych błędów. Do tego przygotować makiety nowych okienek.

## Kryteria sukcesu
- [x] Każdy sklep i hurtownia otwiera okienko tylko ze swoją ofertą. Widać w nim, co jest już w koszyku i co już kupione.
      W piekarni nie da się kupić mięsa. Każde stanowisko w hurtowni sprzętu prowadzi do swojego sprzętu.
      Sprawdzam w grze, na 3 sklepach i w hurtowni.
- [x] Piętro w biurowcu przy Zana pokazuje tylko swoje opcje. Winda i piętra są przerysowane.
- [x] Rożen w kebabie pokazuje kupiony sprzęt, nikogo nie przenosi i nie każe kupować drugi raz.
- [x] Park handlowy: żeton widać na mapie, wnętrze działa, z kebaba nie da się przejść prosto do Parku.
- [x] Klik opcji we wnętrzu nigdy nie otwiera osobnej karty, zawsze tylko okienko (teczkę).
- [x] Mapa: przesuwanie i przybliżanie bez widocznych przycięć. Wyko mierzy czas klatki przed i po, liczby idą do raportu.
      Szybsze wczytywanie i „usuń zamówione zasoby”.
- [x] Mapa: widać ikonę Kamienicy rachmistrzów. Po zmianie rundy oddalona mapa nie pokazuje wszystkich ikon.
      Licznik przy budynku pojawia się tylko przy prawdziwym zadaniu.
- [x] Drobne z Z29:
  - list pani Haliny znika po reakcji, a reakcji nie ma w zeszycie w „do zrobienia”;
  - kartki zeszytu się przewijają;
  - przycisk „Zatrudnij” i teksty w zatrudnianiu są czytelne (kontrast ≥ 4,5:1, w palecie wysokiej ≥ 7:1);
  - menu w lokalu pokazuje ceny, nie same 0 zł;
  - liczba wydarzeń na liście zgadza się z widokiem po „Zareaguj”;
  - tablica na Poczcie odświeża się w nowej rundzie, a stempel „nadano” znika po przejściu rundy.
- [x] Do każdej naprawionej usterki logiki jest test. Pełne testy są zielone (wynik w raporcie), `ruff` i `node --check` czyste.
- [x] Makiety (Z34): strona na claude.ai z 2–3 wariantami okienka zakupów (paragon, także jego format), wydarzeń
      i listu z decyzjami. Szef wybiera, wdrożenie w następnej podróży.

## Wątki
Trzy wątki wyko pracują równolegle na rozłącznych plikach. Wspólne mogą być tylko pliki CSS: każdy wyko dopisuje
swoje reguły na końcu w osobnym bloku z komentarzem `/* podróż 02/<wątek> */`, a konflikty przy scalaniu rozwiązuję ja.

| Wątek | Kto | Zakres | Pliki (własność) | Stan |
|---|---|---|---|---|
| `02/sklepy` | wyko | Z30, Z1 | `swiat/rysunek.js` (R.zamow, R.koszyk…), `swiat/wnetrze.js`, `swiat/sceny/*` (bez `poczta.js`), `zakladki/dostawcy.js`, `marketing.js`, `inwestycje.js`, `swiat/miejsca.js`, `pulpit/karta.js` | scalone 22.11 |
| `02/mapa` | wyko | Z31 + część Z29 dotycząca mapy (ikony, liczniki, ikony po zmianie rundy) | `mapa/*`, `zakladki/mapa*.js`, `dane/mapa/budynki.yaml` | scalone 22.11 |
| `02/drobne` | wyko | reszta Z29 | `pulpit/zeszyt.js`, `pulpit/pulpit.js`, `zakladki/hr.js`, `rynek_pracy.js`, `oferta.js`, `lokal.js`, `zdarzenia.js`, `swiat/sceny/poczta.js`, dane listów i zdarzeń | scalone 22.11 |
| `02/drogi` | wyko | linie mapy widoczne w ruchu (po grze szefa, część Z37) | `mapa/*`, `zakladki/mapa*.js` | scalone 22.11 (zdjęcie mapy w ruchu) |
| `02/makiety` | Archi | Z34 | https://claude.ai/artifact/YKpg6woJrPqaHFZE59vqjk | gotowe; szef: zakupy A, wydarzenia A, list B w kopercie A |

Co ustaliłem przy rozpoznaniu (idzie do briefów):
- Przyczyna punktu 12: wszystkie sklepy mają wspólną teczkę `ZAMOWIENIA = { ekran: "zaop_dostawy" }` w
  `swiat/rysunek.js:171`. `kliknijPunkt` w `swiat/wnetrze.js` otwiera ogólny ekran dostawców i tylko przewija go
  do nazwy sklepu (`przewinDo`). Teczkę trzeba więc przebudować: okienko sklepu z filtrem `dostawca` i działem.
  Porównanie cen zostaje tylko w zeszycie wujka („gdzie kupić”).
- Biurowiec ma ten sam mechanizm dla agencji (`marketing.js`, sceny `zana_*.js`, `winda_zana.js`).
- Zasady z `CLAUDE.md`: liczby w `dane/*.yaml`, teksty neutralne płciowo, kolory przez zmienne, 3 palety × jasny i ciemny,
  stan nigdy samym kolorem.

## Kolejność
1. Zmiany majstra: `origin/maciex` bez nowych commitów (22.11), nic do scalenia.
2. Zakładam `dokumentacja/podroze/02-poprawki-po-grze/plan.md`, piszę 3 briefy `watek-*.md`, aktualizuję `Stan.md`, commit.
3. Uruchamiam 3 wyko (`wyko.py`). Sam w tym czasie robię makiety Z34 i odświeżam dziennik.
4. Po każdym wątku: przegląd diffu, testy dotkniętych plików, scalenie do `main`, `claude stop`/`rm`. Przed
   scaleniem wątku `02/sklepy` (największy) przegląd robi recenzent.
5. Na koniec pełne testy, krótka gra sprawdzająca kryteria, `/podroz koniec`.

## Weryfikacja
- `PY -X utf8 -m pytest -q -p no:cacheprovider 2>&1 | tail -5`, `PY -m ruff check .`, `node --check` na zmienionych modułach.
- Serwer `manage.py graj --port <PORT> --bez-przegladarki` i przejście kryteriów w przeglądarce (Chrome). Bez zrzutów
  dla szefa, który sprawdza sam w grze.

## Podsumowanie
Zakończona 2026-11-22 o 19:47 (start 12:33), na polecenie szefa, przed jego grą sprawdzającą. Kryteria są
odhaczone na podstawie raportów wątków, testów i przeglądu Archiego. W grze sprawdzi je następna gra testowa (Z2).

**Zrobione**
- Z30, Z1 (`02/sklepy`): każdy sklep i hurtownia otwiera tylko swoją ofertę, z koszykiem i tym, co kupione;
  stanowiska w hurtowni sprzętu prowadzą do swojego sprzętu; piętra przy Zana tylko ze swoimi opcjami; rożen
  pokazuje kupiony sprzęt; Park handlowy z żetonem i wnętrzem; opcje we wnętrzu zawsze w okienku. Recenzent
  znalazł 2 błędy, poprawione przed scaleniem.
- Z31, część Z29 (`02/mapa`): ikony i liczniki na mapie; pierwsze wczytanie 2238 → 914 ms (pamięć plików
  `immutable`, rozgrzewka modułów w tle).
- Reszta Z29 (`02/drobne`): list pani Haliny, kartki zeszytu, „Zatrudnij”, ceny w menu, liczba wydarzeń, Poczta.
- Część Z37 (`02/drogi`, po grze szefa): drogi, granice i kolej widoczne w ruchu. Na czas ruchu mapa jest
  zdjęciem (canvas), po zatrzymaniu wracają wektory. Zoom kółkiem 97 → 6 ms na klatkę, przesuwanie 6 ms.
  Wcześniejsze uproszczenia (chowanie linii, zmiana grubości, kreski w pełną linię) szef odrzucił po obejrzeniu.
- Z34, część pierwsza (`02/makiety`): makiety okienek, szef wybrał zakupy A, wydarzenia A, list B w kopercie A.
- Testy: 899 passed (pełny przebieg na `02/drogi` przed scaleniem), `ruff` i `node --check` czyste.

**Odłożone**
- Z34: wdrożenie wybranych okienek (następna podróż).
- Z37: moduły JS w jeden plik albo `modulepreload`.
- Z38: Portiernia Zana jako spis pięter (decyzja szefa 22.11).
- Z29: sprawdzenie w grze kategorii w rzędzie (1) i „Jak grać” w zakładkach (3), przeniesione do Z2.

**Koszt** (`zuzycie.py`, okno 12:33–19:47, tokeny ważone, jednostki wejścia Sonneta)

| sesja | ważone |
|---|---|
| archi-lukrum | 6,85 M |
| archi · agenci (recenzent, zwiadowca) | 0,88 M |
| wyko 02/sklepy | 6,25 M |
| wyko 02/mapa | 3,59 M |
| wyko 02/drobne | 3,15 M |
| wyko 02/drogi | 2,72 M |
| **razem** | **23,44 M** |
