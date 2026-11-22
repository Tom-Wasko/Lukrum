# Wątek: notatki (podróż 01)
<!-- Brief pisze Archi. Wyko czyta tylko ten plik: wszystko, co ustalone, musi być tutaj. -->

## Brief
- **Cel:** przenieść całą wiedzę z dawnego repo notatek (`C:/Users/PC/Pulpit/lukrum/notatki/`) i z pamięci Claude'a
  do `dokumentacja/` repo Lukrum, w układzie cyberiady. Po tym wątku notatki idą do archiwum, więc nic nie może zginąć.

- **Ustalone (nie sprawdzaj ponownie):**
  - Repo to `C:/Users/PC/Pulpit/lukrum` (Tom-Wasko/Lukrum). Kod gry w `gra/`. Pracujesz w swoim worktree.
  - Folder `notatki/` jest poza gitem (w `.gitignore`), więc w worktree go nie ma. **Pierwsze polecenie:**
    `cp -r C:/Users/PC/Pulpit/lukrum/notatki _robocze/notatki` (`_robocze/` jest poza gitem) i czytaj kopię stamtąd.
    **Nigdy nie rób `cd` poza swój worktree** (sesja traci wtedy dostęp) i nie wołaj EnterWorktree: już w nim jesteś. Notatek nie zmieniaj ani nie usuwaj (zrobi to Archi).
  - Istnieją już (napisał Archi): `dokumentacja/Stan.md`, `Zadania.md` (pusty, `Następny numer: Z1`),
    `Decyzje.md` (5 decyzji szefa i 2 Archiego z 2026-11-22), `podroze/01-migracja/plan.md`, `wiedza/.gitkeep`.
  - Nazwy plików: bez ogonków i spacji w nazwach folderów; w nazwach plików `.md` ogonki zamień (np. `Wyglad.md`,
    `nawiazania.md`), treść zostaje po polsku z ogonkami. Linki wewnętrzne Obsidiana (w podwójnych nawiasach kwadratowych) zamień na zwykłe
    linki Markdown do nowych ścieżek (względne).
  - Pliki `.docx` przenieś bez zmian (binarnie) do `dokumentacja/wiedza/analizy/`.

- **Mapa: plik notatek → miejsce** (każdy plik ma miejsce; nic nie pomijaj):
  | Notatki | Dokumentacja |
  |---|---|
  | `Postęp.md` | `Zadania.md`: każde otwarte zadanie jako `- Z<n> · treść` (numery od Z1, kolejno; licznik „Następny numer” na górze). Sekcje: W toku / Zaplanowane / Odłożone. Rzeczy zrobione → `historia/postep.md` (bez numerów). |
  | `Do decyzji.md` | `Stan.md`, sekcja „Czeka na szefa”: każde otwarte pytanie jako `- P<n>: pytanie?` z opcjami (rekomendacja pierwsza, jeśli w notatce jest). Rozstrzygnięte → `Decyzje.md`. |
  | `Decyzje.md` | `Decyzje.md`, sekcja „Szefa”, format `- RRRR-MM-DD · decyzja` (data z notatki; bez daty: `2026-11 ·`). Dopisz pod istniejącymi z 22.11 posortowane od najstarszych. |
  | `Plan.md` | `dokumentacja/Plan.md` |
  | `Wygląd.md` | `dokumentacja/Wyglad.md` |
  | `Mapa.md` | `dokumentacja/Mapa.md` |
  | `WSPOLPRACA.md` | `dokumentacja/wiedza/wspolpraca.md` |
  | `Nawiązania literackie.md` | `dokumentacja/wiedza/nawiazania.md` |
  | `Historia.md` | `dokumentacja/historia/historia.md` |
  | `README.md` | treść użyteczna → odpowiednie pliki; jeśli opisuje tylko układ notatek, pomiń i zapisz to w raporcie |
  | `Analizy/*.md`, `Analizy/*.docx` | `dokumentacja/wiedza/analizy/` (nazwy bez ogonków i spacji, np. `krytyka-wnetrz-16-11.md`; `.docx` z oryginalną nazwą) |
  | `Funkcje/*.md` (18) | `dokumentacja/funkcje/<nazwa-bez-ogonkow>.md`, treść bez zmian poza linkami |
  | `Serie/**` | `dokumentacja/historia/serie/<seria>/…` (ten sam podział na serie) |
  | `Zespół/Dziennik lidera.md`, `Zespół/Rejestr agentów.md` | `dokumentacja/historia/zespol/` |
  - Dodaj `dokumentacja/historia/README.md` (3–5 linii: co tu jest, że to archiwum dawnego zespołu i serii).
  - Dodaj `dokumentacja/funkcje/README.md` tylko jeśli w notatkach jest szablon notatki funkcji (przenieś go tam).

- **Fakty z pamięci → `Decyzje.md` (sekcja Szefa).** Pliki pamięci (czytaj, nie zmieniaj):
  `C:/Users/PC/.claude/projects/C--Users-PC-Pulpit-lukrum/memory/*.md` i
  `C:/Users/PC/.claude/projects/C--Users-PC-Pulpit-<stary-folder>-lukrum/memory/*.md`.
  Każdy fakt, który nie jest już w `CLAUDE.md` repo ani w `Decyzje.md`, dopisz jako decyzję z datą z pliku
  (lista kontrolna, co tam jest): commity tylko Tom-Wasko (13.11); push bez pytania, bez --force, nowe repo
  i usuwanie zdalnych gałęzi pytać (17.11); notatki funkcji z szablonu (13.11); majster robi mapę na `maciex`
  bez limitów, scalać od razu, każde miejsce ma własny token i wnętrze (16–17.11); wygląd: ilustrowana plansza
  + aplikacja + PRL, palety bar|pewex|wysoka (≥7:1) × jasna/ciemna, inspiracje wnętrz tylko jako pomysł,
  decyzje 16.11 (zeszyt wujka, portfel z boku, teczka zamiast okienka, pierzeja 5 banków); dokumenty prawne
  ze starą nazwą w `archiwum/prawne` gry; nazwa LUKRUM (lucrum = zysk, Lu = Lublin), powstała 13.11;
  nawiązania literackie; prawdziwe marki tylko z zastrzeżeniem; repo prywatne; terminy (gra testowa ewentualnie
  tydzień 23.11, kuratorium i urząd, spotkanie w 2027, testy w szkołach do maja 2027); jawność użycia AI
  (METODA.md, rozmowa z kapitanem); ZzT zgłoszony; lekcje przez kuratorium i UM Lublin; zasady pracy (README
  aktualny, commitować rzadko, pełne testy raz).
  Pomiń fakty o starym zespole agentów i warsztacie (nieaktualne) i opisz to w raporcie.

- **Zakaz wzmianek o innych grach:** w repo nie może być nazw innych gier biznesowych. W notatkach dotyczy to
  plików `Serie/porzadki/porzadki – {plan,recenzja,stan}.md` (słowa nazwy starej gry i starego folderu). Przy przenoszeniu przepisz
  te zdania neutralnie („poprzednia wersja projektu”) albo usuń, jeśli bez nazwy nie mają sensu.

- **Decyzje szefa:** `dokumentacja/Decyzje.md`, wpisy z 2026-11-22 (całe `notatki/` do `dokumentacja/`;
  Postęp → Zadania z Z<n>; Do decyzji → pytania w Stan; Dziennik lidera, Serie, Rejestr → historia).

- **Pliki do zmiany / utworzenia:** `dokumentacja/**` (oprócz `podroze/01-migracja/plan.md`); w `Stan.md` tylko
  sekcja „Czeka na szefa”. **Nie ruszaj:** `gra/`, `CLAUDE.md`, `README.md`, `.gitignore`, `notatki/`, pliki pamięci.

- **Gotowe, gdy:**
  1. Każdy plik z `notatki/` (oprócz `.obsidian/`) ma miejsce; w raporcie tabela plik → miejsce (lista z
     `find C:/Users/PC/Pulpit/lukrum/notatki -type f -not -path '*/.obsidian/*'`).
  2. `Zadania.md` ma numery Z1… bez luk, licznik = następny wolny.
  3. grep nazw starej gry i starego folderu (w treści i w nazwach plików) → pusto.
  4. `git grep -n "\[\[" -- dokumentacja` → pusto (brak linków Obsidiana).
  5. Commity z `git -c user.name=Tom-Wasko commit` (bez dopisków o AI), drzewo czyste.
- **Zrzuty ekranu:** nie.
- **Dokumenty do poprawienia:** brak (README i CLAUDE.md zrobi Archi, jeśli coś trzeba).
- **Archi:** archi-cyberiada

## Raport
**Stan:** gotowe (robił Archi; wyko usunięty po dwóch błędach „Autocompact is thrashing”).
**Mapa plików** (`notatki/` → `dokumentacja/`):

| Z notatek | Do |
|---|---|
| Postęp.md | `Zadania.md` (Z1–Z28) + kopia `historia/postep.md` |
| Do decyzji.md | `Stan.md`, „Czeka na szefa” (P1–P24) |
| Decyzje.md | `Decyzje.md`, sekcja szefa, „Decyzje 13–19.11” |
| Plan.md, Mapa.md, Wygląd.md | `Plan.md`, `Mapa.md`, `Wyglad.md` |
| WSPOLPRACA.md, Nawiązania literackie.md | `wiedza/wspolpraca.md`, `wiedza/nawiazania.md` |
| Analizy/ (12) | `wiedza/analizy/` |
| Funkcje/ (18) | `funkcje/` (nazwy bez ogonków i spacji) |
| Serie/ (14), Historia.md | `historia/serie/`, `historia/historia.md` |
| Zespół/ (2) | `historia/zespol/` |
| README.md | zasady → `historia/README.md`, spis → CLAUDE.md „Gdzie co jest” |
| .gitignore, .obsidian/ | niepotrzebne (zostają w archiwum) |

Pamięć (`memory/*.md`): zasady codzienne w `CLAUDE.md`; decyzje (commity, push, terminy, majster) w `Decyzje.md`;
o szefie i pytaniach okienkiem w preferencjach cyberiady; reguła „zapisuj do warsztatu” wygasła (warsztat w archiwum).
**Dowód:** zob. sprawdzenie w commicie (grep nazw i `[[` → pusto).
**Decyzje, które podjąłem:** stare odnośniki §n zamienione na numery P; dawne decyzje zostają tematami z datą w nawiasie.
**Pytania do szefa:** brak nowych.
