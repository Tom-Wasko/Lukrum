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
- [ ] Zakupy: okienko sklepu i hurtowni wygląda jak paragon kasowy (wariant A z makiet), także ten sam format paragonu
      po zakupie. Działa we wszystkich sklepach, w 3 paletach, w trybie jasnym i ciemnym.
- [ ] Wydarzenia: tablica korkowa (wariant A). Przy każdej opcji decyzji są wskazówki ▲▼ z siłą (▲▲, ▼), bez liczb,
      wzięte z danych skutków. Każdy park ma własny wygląd przy tym samym układzie (postać i wydarzenie).
      Przycisk w parku prowadzi do wydarzenia, nie do kalendarza.
- [ ] List z decyzjami: rubryki z B (kwoty, ✓ ! ○, odnośnik „popraw”) w kopercie z A. List wysuwa się z koperty,
      a po nadaniu pojawia się stempel.
- [ ] Z9: „Nowe w tej rundzie” bez starych nazw. Z28: `e.detail.obsluzone` jest opisane w kontraktach zdarzeń.
      Z26: znana przyczyna niestabilnego testu, a jeśli się da, test jest naprawiony.
- [ ] Jutro (po zatwierdzeniu przez szefa): Z32, czyli w każdej rundzie kilka sensownych zadań.
- [ ] W nocy także:
  - Z36: wyniki tygodnia w kebabie.
  - Z35: zeszyt.
  - Z5: lista wujka prowadzi do budynku.
  - Z38: Portiernia jako spis pięter.
- [ ] Testy do nowej logiki. Pełne testy są zielone, a `ruff` i `node --check` czyste (wyniki w raportach).

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
