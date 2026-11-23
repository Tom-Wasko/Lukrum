# Widoczne skutki

- **Stan:** w grze (podróż 03, wątek ukryte, Z42, 23.11.2026)
- **Gdzie w grze:** księga gości pod wnętrzem kebaba, Klienci ▸ opinie, Park handlowy ▸ wyposażenie, HR ▸ profil osoby i
  udogodnienia

## Dla ucznia (do instrukcji)
Gra nie chowa niczego, co wpływa na Wasz wynik. Tam, gdzie decydujecie albo oglądacie wyniki, jest krótkie zdanie
„dlaczego”, ze znakiem ▲ ▼ ✓ (nigdy samym kolorem):
- **Księga gości:** ile siły ma ocena („Mało opinii: ocena działa na gości na 40% swojej siły”), że stare opinie z każdym
  tygodniem liczą się mniej, że przy kilku opiniach ocena skacze przez przypadek, że biurowi gorzej znoszą kolejki niż
  studenci i że świeżość składników wpływa na smak.
- **Wyposażenie:** każda kolejna sztuka podnosi liczbę gości słabiej; widać, ile dają dziś, a ile dawałyby bez tego.
- **Załoga:** w profilu osoby widać, z czego składa się jej nastrój (pensja, sprzęt, udogodnienia, szkolenia, umowa,
  przepracowanie) i od jakiego obciążenia rośnie ryzyko pomyłek. Udogodnienia mają tabelę „ile dały nastrojowi”.

## Zasada działania
- Mechaniki się nie zmieniły. Silnik tylko zapisuje liczby, które i tak liczył, w wyniku rundy
  (`opinie`: `zaufanie`, `zanik`, `rozrzut`, `czekanie_grup`; `pracownicy[].skladniki`) i w widoku
  (`wyposazenie_efekt`, `progi_czasu_pracy.zmeczenie`). Panel (JS) niczego nie liczy od nowa.
- Wiersze 8 (rozruch), 10 (zamiana dania) i 11 (nasycenie reklamy) były już widoczne; spis w
  `dokumentacja/wiedza/analizy/ukryte-mechaniki.md` mówi, gdzie.

## Liczby i źródła
Nowych liczb gry nie ma. Wyświetlane wartości pochodzą z istniejących parametrów (`klienci.yaml: opinie`,
`zalozenia.yaml: pomylki, wyposazenie_nasycenie`).

## Czego uczy (do planu zajęć)
- pojęcia: reputacja, próba statystyczna (mało opinii = duży rozrzut), malejące przychody krańcowe, motywacja pracowników
- pytania do omówienia: ile opinii trzeba, żeby ocenie ufać? Czy czwarty stolik jest wart tyle co pierwszy?
- krótkie zadanie: porównajcie, co daje udogodnienie osobie, która dostaje uczciwą pensję, i osobie, której pensja jest za niska.

## Do promocji
„W LUKRUM nic nie dzieje się po cichu: każdy skutek decyzji da się zobaczyć i zrozumieć.”

## Nawiązanie literackie
Lalka (Prus): Wokulski uczy się, że o powodzeniu sklepu decydują drobne rzeczy, których nie widać od razu.
