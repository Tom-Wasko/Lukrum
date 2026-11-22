# Podróż 02: poprawki-po-grze
Start: 2026-11-22 · tryb nadzorowany · scalanie do `main` · Zadania: Z29, Z30, Z1, Z31, Z34

## Cel
Naprawić to, co szef i majster znaleźli w grach testowych 20 i 22.11. Chodzi o sklepy, piętra, Park handlowy, mapę
i drobne usterki, żeby następna gra testowa (Z2) szła bez tych błędów. Do tego przygotować makiety nowych okienek.

## Kryteria sukcesu
- [ ] Każdy sklep i hurtownia otwiera okienko tylko ze swoją ofertą. Widać w nim, co jest już w koszyku i co już kupione.
      W piekarni nie da się kupić mięsa. Każde stanowisko w hurtowni sprzętu prowadzi do swojego sprzętu.
      Sprawdzam w grze, na 3 sklepach i w hurtowni.
- [ ] Piętro w biurowcu przy Zana pokazuje tylko swoje opcje. Winda i piętra są przerysowane.
- [ ] Rożen w kebabie pokazuje kupiony sprzęt, nikogo nie przenosi i nie każe kupować drugi raz.
- [ ] Park handlowy: żeton widać na mapie, wnętrze działa, z kebaba nie da się przejść prosto do Parku.
- [ ] Klik opcji we wnętrzu nigdy nie otwiera osobnej karty, zawsze tylko okienko (teczkę).
- [ ] Mapa: przesuwanie i przybliżanie bez widocznych przycięć. Wyko mierzy czas klatki przed i po, liczby idą do raportu.
      Szybsze wczytywanie i „usuń zamówione zasoby”.
- [ ] Mapa: widać ikonę Kamienicy rachmistrzów. Po zmianie rundy oddalona mapa nie pokazuje wszystkich ikon.
      Licznik przy budynku pojawia się tylko przy prawdziwym zadaniu.
- [ ] Drobne z Z29:
  - list pani Haliny znika po reakcji, a reakcji nie ma w zeszycie w „do zrobienia”;
  - kartki zeszytu się przewijają;
  - przycisk „Zatrudnij” i teksty w zatrudnianiu są czytelne (kontrast ≥ 4,5:1, w palecie wysokiej ≥ 7:1);
  - menu w lokalu pokazuje ceny, nie same 0 zł;
  - liczba wydarzeń na liście zgadza się z widokiem po „Zareaguj”;
  - tablica na Poczcie odświeża się w nowej rundzie, a stempel „nadano” znika po przejściu rundy.
- [ ] Do każdej naprawionej usterki logiki jest test. Pełne testy są zielone (wynik w raporcie), `ruff` i `node --check` czyste.
- [ ] Makiety (Z34): strona na claude.ai z 2–3 wariantami okienka zakupów (paragon, także jego format), wydarzeń
      i listu z decyzjami. Szef wybiera, wdrożenie w następnej podróży.

## Wątki
Trzy wątki wyko pracują równolegle na rozłącznych plikach. Wspólne mogą być tylko pliki CSS: każdy wyko dopisuje
swoje reguły na końcu w osobnym bloku z komentarzem `/* podróż 02/<wątek> */`, a konflikty przy scalaniu rozwiązuję ja.

| Wątek | Kto | Zakres | Pliki (własność) | Stan |
|---|---|---|---|---|
| `02/sklepy` | wyko | Z30, Z1 | `swiat/rysunek.js` (R.zamow, R.koszyk…), `swiat/wnetrze.js`, `swiat/sceny/*` (bez `poczta.js`), `zakladki/dostawcy.js`, `marketing.js`, `inwestycje.js`, `swiat/miejsca.js`, `pulpit/karta.js` | plan |
| `02/mapa` | wyko | Z31 + część Z29 dotycząca mapy (ikony, liczniki, ikony po zmianie rundy) | `mapa/*`, `zakladki/mapa*.js`, `dane/mapa/budynki.yaml` | plan |
| `02/drobne` | wyko | reszta Z29 | `pulpit/zeszyt.js`, `pulpit/pulpit.js`, `zakladki/hr.js`, `rynek_pracy.js`, `oferta.js`, `lokal.js`, `zdarzenia.js`, `swiat/sceny/poczta.js`, dane listów i zdarzeń | plan |
| `02/makiety` | Archi | Z34 | artefakt na claude.ai | w toku |

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
<!-- Na końcu: co zrobione, co odłożone (→ Zadania.md), koszt (narzedzia/zuzycie.py). -->
