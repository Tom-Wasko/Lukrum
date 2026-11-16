# LUKRUM – przewodnik dla agenta

Czytaj na początku sesji. Autor pisze po polsku, więc **odpowiadaj po polsku**.

## Co to jest
LUKRUM to edukacyjna symulacja biznesowa dla szkół średnich (lekcje WOS, konkurs „Zwolnieni z Teorii”).
- Drużyny (1–4 osoby) prowadzą kebaby na wspólnej mapie Lublina. Do tego dochodzą boty o 5 strategiach i 4 poziomach.
- Runda to tydzień gry (domyślnie 18 rund, 50 000 zł na start). Mistrz gry (nauczyciel) zamyka rundę, a silnik liczy
  tydzień dzień po dniu.
- Funkcje gry (zaopatrzenie, marketing, księgowość…) mistrz gry może zakryć. Wtedy robi je autopilot, a drużyny
  odsłaniają je same (`dane/funkcje.yaml`).

Plan przebudowy, wygląd i notatki funkcji są w osobnym prywatnym repo **`Tom-Wasko/Lukrum-notatki`**
(lokalnie `../notatki/`): `PLAN_PRZEBUDOWY.md`, `Wygląd.md`, `Funkcje/`. Zadania i postęp: `dokumentacja/POSTEP.md`.

**Współpraca (od 13.11):** mapę robi kolega autora (`[mapa]`), mechaniki i wnętrza autor (`[mechaniki]`). Przed pracą
przeczytaj `WSPOLPRACA.md` w repo notatek i zrób `git pull` w obu repo. Każdy pracuje na swojej gałęzi
(`mapa-…`, `mechaniki-…`, `wnetrza-…`). Do `main` trafiają tylko pull requesty przejrzane przez drugą stronę. Cudzych
plików nie ruszamy bez wpisu w `WSPOLPRACA.md`.

**Zasada nadrzędna:** w repo nie może być żadnych wzmianek ani zapożyczeń z innych gier biznesowych. Nowe mechaniki
projektujemy od zera, opisując je realiami (prawo, rynek, Lublin), a nie odwołaniami do innych gier.

## Mapa repozytorium
```
README.md            opis dla ludzi – ZAWSZE aktualny (patrz „Git”)
AGENTS.md            ten plik
dokumentacja/        POSTEP.md (zadania), STACK.md (technologie, polecenia), OPIS_GRY.md (mechaniki)
raporty/<etap>/      plan.md etapu, raporty agentów, pomiary
gra/
  silnik/            silnik gry: czysty Python (pydantic, numpy), bez Django
    kuchnia/ rynek/ ludzie/ nieruchomosci/ ksiegowosc/ pieniadze/ swiat/ wyniki/   podpakiety mechanik
  dane/              WSZYSTKIE liczby gry w YAML (mapa/, zdarzenia/, kalendarz/, zalozenia.yaml, funkcje.yaml…)
  api/               Django: widoki JSON; prezentacja.py buduje widok `v` dla panelu
  panel_gracza/      strony gracza; static/zakladki/*.js (moduły ES, rejestr w index.js)
  panel_mg/          panel mistrza gry (/mg/)
  gry/, konta/       modele Django (SQLite), konta i logowanie
  lukrum/            projekt Django (ustawienia, adresy)
  balans/            symulacje botów i pomiary balansu
  testy/             pytest, podfoldery jak podpakiety silnika + aplikacja/
  INSTRUKCJA.md      instrukcja dla graczy (/jak-grac)
```
Poza repo, w `lukrum/`: `notatki/` (notatki autora, Obsidian), `_robocze/` (kopie i briefy agentów,
`BRIEF_AGENTA.md`, `narzedzia/cdp.py` do zrzutów), `_archiwum/`.

## Polecenia (z `gra/`)
```
.venv/Scripts/python -X utf8 -m pytest -q -p no:cacheprovider   # pełne testy, kilka minut
.venv/Scripts/python -m ruff check .                            # linia ≤ 100 znaków
.venv/Scripts/python -X utf8 -m silnik.dane sprawdz             # schematy i odwołania w dane/*.yaml
.venv/Scripts/python -X utf8 -m balans.symuluj 12 sredni 7      # gra botów, 12 rund ≈ 3 s
.venv/Scripts/python -X utf8 manage.py graj                     # serwer http://127.0.0.1:8765
```

## Jak działa silnik
- `silnik/gra.py`: wywołanie `Gra.nowa(nazwa, [(firma, strategia_bota|None)], liczba_rund, ziarno, **opcje)` i metody
  `ustaw_decyzje`, `wyslij`, `przelicz`, `stan(r)`, `wyniki`.
- `silnik/decyzje.py`: format decyzji (docstring) i ich zastosowanie. `silnik/runda.py`: przebieg tygodnia.
- `silnik/funkcje.py` + `dane/funkcje.yaml`: funkcje gry (odkryta/zakryta/wyłączona). Nową decyzję gracza przypisz
  w `DECYZJE` do funkcji (pilnuje tego test), a nową zakładkę do `funkcje.yaml: zakladki`.
- Losowość pochodzi **tylko** z `silnik/losowosc.py: strumien(...)`. To samo ziarno daje ten sam wynik.
- Kwoty w stanie są w groszach (`int`, pola `…_gr`).
- `StanGry.kopia()` nie kopiuje raportów minionych rund, więc dawne `stan.wyniki` są **tylko do odczytu**.

## Zasady kodu
- **Żadnych liczb gry w kodzie silnika**, wszystko trzymamy w `dane/*.yaml` (pilnuje test). Parametry w `zalozenia.yaml`
  mają postać `{wartosc, pewnosc: potwierdzone|skalibrowane|zalozenie, zrodlo}`. Gdy zmieniasz liczbę, popraw `zrodlo`.
- Identyfikatory piszemy po polsku bez ogonków, teksty dla gracza po polsku z ogonkami. Teksty mają być neutralne płciowo.
- Do nowej mechaniki dodaj test. Testów nie osłabiaj. Testy wzorów czytają zamrożone dane `testy/dane_zamrozone/`,
  a zmiana liczb w `dane/` ich nie łamie.
- Branża (menu, składniki, sprzęt, klienci) siedzi w danych. Nie wpisuj „kebaba” na sztywno w silniku.

## Git
- Repo: github.com/Tom-Wasko/Lukrum (prywatne), gałąź `main`.
- Autor commitów to **tylko Tom-Wasko**: bez linii `Co-Authored-By`, `Claude-Session` i „Generated with…”, także w PR.
- **Commity rzadko:** jeden na skończoną część etapu, a nie na każdą poprawkę. Push na koniec sesji. Bez `push --force`.
- **README zawsze aktualny:** commit, który zmienia to, co widzi gracz, sposób uruchomienia albo stan etapów,
  poprawia README w tym samym commicie.
- Na koniec etapu: przegląd `gra/INSTRUKCJA.md` (wszystko, co widzi gracz) i PDF (`manage.py instrukcja_pdf`).
- Nie commituj `gra/db.sqlite3`, `gra/lokalne.json`, `gra/zapisy/` ani `*.log`.

## Agenci
Zasady w `PLAN_PRZEBUDOWY.md` (repo notatek), rozdz. 9, i w `../_robocze/BRIEF_AGENTA.md`. W skrócie:
- Opus decyduje i sprawdza, Sonnet robi prace mechaniczne.
- Agent dostaje gotowy brief z listą plików i pisze raport do pliku.
- Poprawki dostaje ten sam agent, bez stawiania nowego.
- Agenci pracujący naraz mają rozłączne pliki.
- Pełne testy uruchamiamy raz, na koniec.

## Notatki autora (`../notatki/`)
Zmiana albo dodanie czegokolwiek w notatkach wymaga zgody autora. Bez niej zapisz propozycję w raporcie etapu.

## Kiedy pytać autora
Pytaj o nową mechanikę, zmianę zasad widocznych dla gracza, usunięcie funkcji i wygląd. Liczby i wzory, które służą
celom planu, możesz zmieniać sam, z pomiarem przed i po.
