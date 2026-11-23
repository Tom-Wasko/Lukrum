# Podróż 03: okienka-i-rundy
Start: 2026-11-22 ok. 21:20 · Zadania: Z34, Z33, Z9, Z28, Z26 (noc); Z32, Z36, Z35, Z5, Z38 (jutro)
Budżet: reszta dzisiejszego limitu 5h + dwa limity jutro.

## Kontekst
Podróż 02 jest zamknięta. Szef wybrał wygląd nowych okienek (`Decyzje.md`, 22.11). Szef idzie spać za najwyżej godzinę,
a jutro będzie dostępny tylko przez telefon. Dlatego dziś startuję szybko 5 wyko na rozłącznych plikach. Jutro Z32 po zatwierdzeniu przez szefa.

## Tryb i scalanie
- Do wyjścia szefa pracuję w trybie nadzorowanym. Wychodząc, szef pisze `/papa do jutra`. Od tej chwili i jutro
  pracuję w trybie autonomicznym: scalam na gałąź `podroz-03`, a pytania wysyłam tekstem z powiadomieniem.
- Do `main` scalam dopiero, gdy szef obejrzy zmiany (`/hejo`).
- Wyko naraz: w nocy 5 (szef pozwolił na wielu, a nocny limit ma się zużyć). Jutro najwyżej 2–3.
- W nocy zrobię też propozycję zadań Z32, żeby szef zatwierdził ją rano z telefonu.

## Kryteria sukcesu
- [x] Zakupy: okienko sklepu i hurtowni wygląda jak paragon kasowy (wariant A z makiet), także ten sam format paragonu
      po zakupie. Działa we wszystkich sklepach, w 3 paletach, w trybie jasnym i ciemnym.
- [x] Wydarzenia: tablica korkowa (wariant A). Przy każdej opcji decyzji są wskazówki ▲▼ z siłą (▲▲, ▼), bez liczb,
      wzięte z danych skutków. Każdy park ma własny wygląd przy tym samym układzie (postać i wydarzenie).
      Przycisk w parku prowadzi do wydarzenia, nie do kalendarza.
- [x] List z decyzjami: rubryki z B (kwoty, ✓ ! ○, odnośnik „popraw”) w kopercie z A. List wysuwa się z koperty,
      a po nadaniu pojawia się stempel.
- [x] Z9: „Nowe w tej rundzie” bez starych nazw. Z28: `e.detail.obsluzone` jest opisane w kontraktach zdarzeń.
      Z26: znana przyczyna niestabilnego testu, a jeśli się da, test jest naprawiony. (Z26 odłożone: test nie zawiódł w tej podróży.)
- [x] Jutro (po zatwierdzeniu przez szefa): Z32, czyli w każdej rundzie kilka sensownych zadań.
- [x] W nocy także:
  - Z36: wyniki tygodnia w kebabie.
  - Z35: zeszyt.
  - Z5: lista wujka prowadzi do budynku.
  - Z38: Portiernia jako spis pięter.
- [x] Testy do nowej logiki. Pełne testy są zielone, a `ruff` i `node --check` czyste (wyniki w raportach).

## Wątki
| Fala | Wątek | Zakres | Pliki (własność) |
|---|---|---|---|
| noc | `03/paragon` | Z34 zakupy A | `swiat/rysunek.js` (R.zamow, R.koszyk), `zakladki/dostawcy.js`, `inwestycje.js`, sceny sklepów |
| noc | `03/wydarzenia` | Z34 wydarzenia A + Z33 | `zakladki/zdarzenia.js`, `swiat/sceny/park.js`, `dane/zdarzenia/*`, odczyt skutków w `api/prezentacja.py` |
| noc | `03/list` | Z34 list B w kopercie A | `swiat/sceny/poczta.js`, część listu w `pulpit/pulpit.js` i `zakladki/zadania.js` |
| noc | Archi | Z9, Z28, Z26 | strona startowa, dokumentacja kontraktów, `test_kasyno.py` |
| jutro | `03/rundy` | Z32 | dane zeszytu wujka i wydarzeń (po scaleniu `03/wydarzenia`) |
| noc | `03/zeszyt` | Z35 + Z5 | `pulpit/zeszyt.js`, `zakladki/wujek.js`, przybliżanie mapy |
| noc | `03/wyniki` | Z36 + Z38 | nowy ekran w kebabie, `swiat/sceny/zana_portiernia.js` |

CSS: każdy wyko dopisuje swoje reguły na końcu w bloku `/* podróż 03/<wątek> */`. Konflikty rozwiązuję ja.
Wszystkie briefy zawierają:
- wybrane warianty i link do makiet: https://claude.ai/artifact/YKpg6woJrPqaHFZE59vqjk;
- zasady z `CLAUDE.md`: liczby w `dane/*.yaml`, teksty neutralne płciowo, kolory przez zmienne, 3 palety × jasny
  i ciemny, stan nigdy samym kolorem, zero wzmianek o innych grach;
- wymóg dowodów w raporcie.

## Kolejność (dziś, szybko)
1. Pobieram zmiany (`git fetch`) i scalam ewentualne zmiany majstra z `origin/maciex` (testy `swiat` i `aplikacja`).
2. Zakładam `podroze/03-okienka-i-rundy/plan.md` i 3 briefy wątków, aktualizuję `Stan.md` i `Zadania.md`
   (Z34, Z33 w toku), robię commit i push.
3. Uruchamiam 5 wyko (`wyko.py`) i odświeżam dziennik.
4. Sam robię Z9, Z28 i Z26.
5. Po `/papa`:
   - zakładam gałąź `podroz-03` i pętlę kontroli co 45 minut;
   - po każdym wątku: przegląd diffu, testy dotkniętych plików, scalenie do `podroz-03`, `claude stop`/`rm`;
   - przed scaleniem `03/paragon` przegląd robi recenzent.
6. Jutro rano: propozycja zadań Z32 do szefa (tekst i powiadomienie), potem druga fala.
7. Na koniec pełne testy na `podroz-03` i podsumowanie z kosztem. Do `main` po powrocie szefa.

## Weryfikacja
- Testy: `PY -X utf8 -m pytest -q -p no:cacheprovider 2>&1 | tail -5`, `PY -m ruff check .`, `node --check`
  na zmienionych modułach.
- Serwer na wolnym porcie (8765 może zajmować `start.bat` szefa) i przejście kryteriów w Chrome. Zatrzymuję go po pracy.

## Trzeci plan (23.11, decyzja szefa): przed testem na klasie
Zasada: robimy to, bez czego test na klasie się nie uda albo będzie mylący; reszta (dźwięki Z11, boty na mapie Z8,
wnętrza Z4, budynki Z3, nawiązania Z10, wizyty wujka Z13/Z14, UPRP Z24) czeka.

| Wątek | Zadania | Po co przed klasą |
|---|---|---|
| `03/ukryte` | Z42 | gracz widzi, dlaczego coś się stało (wiersze 3–13 spisu `wiedza/analizy/ukryte-mechaniki.md`) |
| `03/kartki` | Z44 | zeszyt z kartkami zamiast przewijania (prosto na lekcji, także na tablicy interaktywnej) |
| `03/lekcja` | Z17, Z45 | runda mieści się w lekcji; zestawy funkcji pod 5 scenariuszy; próba 30 graczy + MG przez hostuj |
| później | Z18 | przewodnik nauczyciela (po `03/lekcja`, bo opisze zmierzony przebieg) |

Lista gotowości do testu (odhaczam po dowodzie):
- [x] runda ≤ 15 min (szacunek): przeliczenie 8 drużyn 0,6 s; lekcje 1–4 mieszczą się w 25 min gry (`wiedza/analizy/czas-lekcji.md`); pomiar na żywej klasie przy teście
- [x] 30 graczy naraz (start klasy 3–4 s zostaje, szef: bez serwera wieloprocesowego): 0 błędów, po starcie 20–190 ms; start całej klasy naraz 3–4 s (pytanie do szefa: serwer wieloprocesowy)
- [x] logowanie klasy hasłami z kartek: limity logowania z jednego IP poprawione (`test_klasa_naraz.py`), INSTRUKCJA „Dla mistrza gry”
- [ ] 1366×768 i telefon: część poprawiona (03/wyglad), reszta kontrastów to propozycje w `przeglad-wygladu-23-11.md`
- [x] skutki widoczne (Z42); zeszyt kartki (Z44, telefon 30 stron, 1366 23 strony, 0 z przewijaniem)
- [x] przewodnik nauczyciela (Z18, + PDF); zmiana zestawu w tej samej grze (Z46); scalenie do `main`

## Zrobione w podróży (stan 23.11 17:55)
Z34, Z33, Z35, Z5, Z36, Z38, Z9, Z28, Z32, Z37, Z16, Z25, Z12, Z21, Z42, Z23 (część z 23.11), Z15, Z44, Z17, Z45; Z6 częściowo (reszta: propozycje w `wiedza/analizy/przeglad-wygladu-23-11.md`). Scalone do `main` 23.11 17:50 (960 passed). Potem: Z18 (przewodnik + PDF, tabela podstawy programowej z zpe.gov.pl), Z46 (zmiana zestawu w /mg/, 965 passed). Z19 odłożone (kolega). Z6: reszta propozycji.
