Zasady zespołu: `warsztat/ZESPOL.md`; role i ścieżki projektu: `CLAUDE.md` w folderze `lukrum/`.

# LUKRUM – przewodnik po repozytorium gry

Dla każdego, kto zmienia kod: agenta, majstra, programisty. **Odpowiadaj po polsku.** Plik jest krótki celowo.

## 1. Projekt
LUKRUM to edukacyjna symulacja biznesowa dla liceów (WOS, konkurs „Zwolnieni z Teorii”). Drużyny prowadzą kebaby na
mapie Lublina. Runda to tydzień gry. Nauczyciel jako mistrz gry (MG) zamyka rundę, a silnik liczy tydzień dzień po dniu.
Gracz porusza się po **mapie**. Budynki mają **wnętrza** (sceny), a decyzje podejmuje się w okienkach we wnętrzach.

## 2. Mapa repozytorium
```
README.md, AGENTS.md, INSTRUKCJA.md (+ .pdf; strona /jak-grac)
manage.py, start.bat, hostuj.bat, staly_link.bat, requirements.txt, pyproject.toml
silnik/         czysty Python (pydantic, numpy), bez Django; podpakiety mechanik
dane/           WSZYSTKIE liczby gry w YAML (mapa/, zdarzenia/, kalendarz/, zalozenia.yaml, funkcje.yaml…)
api/            Django, widoki JSON; prezentacja.py buduje widok `v` dla panelu
panel_gracza/   szablony + static/: app.js, lukrum.js, zakladki/*.js (rejestr index.js), swiat/ (miejsca, sceny),
                mapa/ (lublin.js, widok.js), motywy/ (zmienne.css, dostepnosc.css), grafiki/
panel_mg/       panel mistrza gry (/mg/)
gry/, konta/, lukrum/   modele Django (SQLite), logowanie, ustawienia
balans/         symulacje botów i pomiary balansu
testy/          pytest; podfoldery jak w silniku + aplikacja/, swiat/, wnetrza/
narzedzia/      mapa/ (pobieranie OSM), grafiki/ (generator SVG)
dokumentacja/   STACK.md, OPIS_GRY.md, SCENARIUSZE_LEKCJI.md, LOGOWANIE_MICROSOFT.md
```
Poza repo, w `lukrum/`: `notatki/` (repo `Tom-Wasko/Lukrum-notatki`), `warsztat/`, `_robocze/`, `archiwum/`.

## 3. Polecenia (z korzenia repozytorium, `PY = .venv/Scripts/python`)
```
PY -X utf8 -m pytest -q -p no:cacheprovider testy/<plik>.py   # w trakcie: tylko dotknięte testy
PY -X utf8 -m pytest -q -p no:cacheprovider 2>&1 | tail -5    # raz na koniec, kilka minut
PY -m ruff check .                                            # linia ≤ 100 znaków
PY -X utf8 -m silnik.dane sprawdz                             # po każdej zmianie dane/*.yaml
PY -X utf8 -m balans.symuluj 12 sredni 7                      # gra botów, 12 rund ≈ 3 s
PY -X utf8 manage.py graj --port <PORT> --bez-przegladarki    # serwer (w tle); gra testowa: manage.py gra_pokazowa
cp plik.js "$TEMP/t.mjs" && node --check "$TEMP/t.mjs"        # składnia modułu JS
```
Po pracy zatrzymaj uruchomiony serwer.

## 4. Silnik w pigułce
- `silnik/gra.py`: `Gra.nowa(nazwa, [(firma, strategia_bota|None)], liczba_rund, ziarno, **opcje)`, potem `ustaw_decyzje`,
  `wyslij`, `przelicz`, `stan(r)`, `wyniki`. Format decyzji: docstring `silnik/decyzje.py`. Tydzień: `silnik/runda.py`.
- Funkcje gry (odkryta/zakryta/wyłączona): `silnik/funkcje.py` + `dane/funkcje.yaml`. Nową decyzję przypisz w `DECYZJE`,
  nowy ekran w `funkcje.yaml: zakladki` (pilnują tego testy).
- Losowość **tylko** z `silnik/losowosc.py: strumien(...)`. Kwoty w groszach (`int`, pola `…_gr`).
- `StanGry.kopia()` nie kopiuje raportów minionych rund, więc dawne `stan.wyniki` są tylko do odczytu.
- Okno pop-up: `okno(tytul, html, {male, srednie, przyciski})` w `static/zakladki/wspolne.js`. Wejście do budynku:
  `lukrum.otworzWnetrze(id)`, powrót `lukrum.wrocNaMape()`.

## 5. Zasady kodu i treści
- **Żadnych liczb gry w kodzie silnika**, tylko w `dane/*.yaml` (pilnuje test). Parametr w `zalozenia.yaml` ma postać
  `{wartosc, pewnosc: potwierdzone|skalibrowane|zalozenie, zrodlo}`. Gdy zmieniasz liczbę, popraw `zrodlo`.
- Identyfikatory po polsku bez ogonków. Teksty dla gracza po polsku z ogonkami, **neutralne płciowo** (formy bezosobowe).
- Do nowej mechaniki dodaj test. Testów nie osłabiaj. Testy wzorów czytają `testy/dane_zamrozone/`, których nie zmieniasz.
- Branża (menu, składniki, sprzęt) siedzi w danych. Nie wpisuj „kebaba” na sztywno w silniku.
- **Nic z innych gier biznesowych** (nazwy, mechaniki, wzmianki). Mechaniki opisujemy realiami: prawo, rynek, Lublin.
- Nazwa: „LUKRUM” w tekstach (nie odmienia się: „w LUKRUM”, rodzaj nijaki), `lukrum` w identyfikatorach.
- **Wygląd:** kolory tylko przez zmienne z `motywy/zmienne.css`. Każdy ekran działa w 3 paletach (bar, pewex, wysoka)
  × jasny/ciemny. Stan nigdy samym kolorem (▲ ▼ !, `dostepnosc.css`). Styl: plansza + czytelna apka + nutka PRL.

## 6. Git
- Repo `Tom-Wasko/Lukrum` (prywatne). Gałęzie i kopie robocze (`<seria>-<temat>`): zasady w `warsztat/ZESPOL.md`.
- Autor commitów to **tylko Tom-Wasko** (`git -c user.name=Tom-Wasko commit`), bez `Co-Authored-By`, `Claude-Session`
  ani „Generated with…”, także w opisach PR. Bez `push --force`.
- Nie commituj `db.sqlite3`, `lokalne.json`, `zapisy/`, `*.log` ani zrzutów ekranu.
- README zawsze aktualny: commit, który zmienia to, co widzi gracz, albo sposób uruchomienia, poprawia README.

## 7. Gdzie się pisze dokumentację
| Co | Gdzie |
|---|---|
| zmiana widoczna dla gracza | `INSTRUKCJA.md` + `README.md` |
| zmiana mechaniki albo budowy | `dokumentacja/OPIS_GRY.md`, `dokumentacja/STACK.md` |
| nowa albo przerobiona funkcja gry | notatka `notatki/Funkcje/<Nazwa>.md` wg szablonu (gdy brief każe) |
| wszystko inne (raport, plan serii, decyzje, postęp) | repozytorium notatek, według briefu |

## 8. Pułapki
- `testy/pieniadze/test_kasyno.py::test_mistrz_gry_nie_widzi_klubu` bywa niestabilny w pełnym przebiegu (osobno
  przechodzi). Zgłoś, nie naprawiaj na siłę.
- Windows: uruchamiaj Pythona z `-X utf8`. Ścieżki z polskimi znakami bierz w cudzysłów.
