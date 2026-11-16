# LUKRUM – przewodnik dla agenta

Czytasz to, bo dostałeś zadanie w projekcie LUKRUM. **Odpowiadaj po polsku.** Ten plik jest krótki celowo: przeczytaj
go raz, a potem działaj według briefu. Nie czytaj innych dokumentów, jeśli brief ich nie wskazuje.

## 1. Projekt
LUKRUM to edukacyjna symulacja biznesowa dla liceów (WOS, konkurs „Zwolnieni z Teorii”). Drużyny prowadzą kebaby na
mapie Lublina. Runda to tydzień gry. Nauczyciel jako mistrz gry (MG) zamyka rundę, a silnik liczy tydzień dzień po dniu.
Gracz porusza się po **mapie**. Budynki mają **wnętrza** (sceny), a decyzje podejmuje się w okienkach we wnętrzach.

## 2. Zespół
| Rola | Kto | Co robi |
|---|---|---|
| **szef** | autor (Tom-Wasko) | decyduje o celach, mechanikach, wyglądzie; akceptuje scalenia do `main` |
| **lider** | Claude Opus (główna sesja) | ustala szczegóły z szefem, pisze briefy, rozdziela pracę, sprawdza, scala, dokumentuje |
| **agent** | podagent (Haiku / Sonnet / Opus / Fable) | wykonuje **jeden** brief i oddaje raport |
| **majster** | kolega szefa i jego agenci | mapa Lublina; tablica współpracy: `../notatki/WSPOLPRACA.md` |
| **kapitan** | nauczyciel, opiekun projektu w szkole | opiniuje grę od strony lekcji i konkursu |

Protokół lidera: `dokumentacja/zespol/LIDER.md` (agent go nie czyta).

## 3. Jak pracujesz (agent)
1. **Brief to cała Twoja wiedza i całe Twoje pozwolenie.** Rób dokładnie to, co w nim jest. Nie poszerzaj zakresu.
   Pomysły spoza briefu zapisz w raporcie w „Propozycje”, nie wdrażaj ich.
2. **Nie powtarzaj rozpoznania.** Lider podaje pliki i fakty. Szukaj grepem, czytaj fragmenty (offset/limit), nie całe
   duże pliki. Nie czytaj `../_archiwum`, `../archiwum`, `../analizy` ani notatek, chyba że brief każe.
3. **Ruszasz tylko pliki z briefu.** Gdy trzeba zmienić inny plik, opisz to w raporcie i nie zmieniaj go. Wyjątek: test
   dla Twojej zmiany.
4. **Nie twórz plików poza wskazanymi.** Żadnych własnych planów, dzienników, notatek ani zrzutów w repo. Robocze rzeczy
   wrzucaj do `../_robocze/<seria>/` i usuń je przed końcem, jeśli nie są potrzebne.
5. **Gotowe = dowód.** Na koniec podaj komendę i jej wynik (ostatnie linie), np. `714 passed`. Nie pisz samego „działa”.
6. **Utknąłeś?** Po dwóch nieudanych próbach przerwij i opisz problem w raporcie. Nie zgaduj decyzji szefa.
7. **Commit i push robi lider**, chyba że brief mówi inaczej.

**Raport** (plik `raporty/<seria>/<temat>.md`, a w odpowiedzi do lidera najwyżej 15 linii):
```
## <temat> – <gotowe | częściowo | zablokowane>
Zmienione pliki: …
Dowód: <komenda> → <wynik>
Decyzje, które podjąłem: …
Problemy / pytania do szefa: …
Propozycje (poza zakresem): …
```

## 4. Mapa repozytorium
```
README.md, AGENTS.md
dokumentacja/   POSTEP.md (zadania), OPIS_GRY.md (mechaniki), STACK.md (technologie), SCENARIUSZE_LEKCJI.md,
                zespol/ (protokół lidera, szablon briefu)
raporty/<seria>/  plan.md serii i raporty agentów
narzedzia/      mapa/ (pobieranie OSM), grafiki/ (generator SVG)
gra/
  silnik/       czysty Python (pydantic, numpy), bez Django; podpakiety mechanik
  dane/         WSZYSTKIE liczby gry w YAML (mapa/, zdarzenia/, kalendarz/, zalozenia.yaml, funkcje.yaml…)
  api/          Django, widoki JSON; prezentacja.py buduje widok `v` dla panelu
  panel_gracza/ szablony + static/: app.js, lukrum.js, zakladki/*.js (rejestr index.js), swiat/ (miejsca, sceny),
                mapa/ (lublin.js, widok.js), motywy/ (zmienne.css, dostepnosc.css)
  panel_mg/     panel mistrza gry (/mg/)
  gry/, konta/  modele Django (SQLite), logowanie
  balans/       symulacje botów i pomiary balansu
  testy/        pytest; podfoldery jak w silniku + aplikacja/, swiat/, wnetrza/
  INSTRUKCJA.md instrukcja dla graczy (/jak-grac)
```
Poza repo, w `lukrum/`: `notatki/` (repo `Tom-Wasko/Lukrum-notatki`), `_robocze/` (kopie robocze agentów, narzędzia
do zrzutów), `_archiwum/`.

## 5. Polecenia (z `gra/`, `PY = .venv/Scripts/python`)
```
PY -X utf8 -m pytest -q -p no:cacheprovider testy/<plik>.py   # w trakcie: tylko dotknięte testy
PY -X utf8 -m pytest -q -p no:cacheprovider 2>&1 | tail -5    # raz na koniec, kilka minut
PY -m ruff check .                                            # linia ≤ 100 znaków
PY -X utf8 -m silnik.dane sprawdz                             # po każdej zmianie dane/*.yaml
PY -X utf8 -m balans.symuluj 12 sredni 7                      # gra botów, 12 rund ≈ 3 s
PY -X utf8 manage.py graj --port <PORT> --bez-przegladarki    # serwer (w tle); gra testowa: manage.py gra_pokazowa
cp plik.js "$TEMP/t.mjs" && node --check "$TEMP/t.mjs"        # składnia modułu JS
```
**Zrzuty ekranu** tylko gdy brief każe, najwyżej 2 na zmianę:
`CDP_PORT=<port> python ../../_robocze/narzedzia/cdp.py <URL> <plik.png> ["js"…]`. Po pracy zatrzymaj serwer.

## 6. Silnik w pigułce
- `silnik/gra.py`: `Gra.nowa(nazwa, [(firma, strategia_bota|None)], liczba_rund, ziarno, **opcje)`, potem `ustaw_decyzje`,
  `wyslij`, `przelicz`, `stan(r)`, `wyniki`. Format decyzji: docstring `silnik/decyzje.py`. Tydzień: `silnik/runda.py`.
- Funkcje gry (odkryta/zakryta/wyłączona): `silnik/funkcje.py` + `dane/funkcje.yaml`. Nową decyzję przypisz w `DECYZJE`,
  nowy ekran w `funkcje.yaml: zakladki` (pilnują tego testy).
- Losowość **tylko** z `silnik/losowosc.py: strumien(...)`. Kwoty w groszach (`int`, pola `…_gr`).
- `StanGry.kopia()` nie kopiuje raportów minionych rund, więc dawne `stan.wyniki` są tylko do odczytu.
- Okno pop-up: `okno(tytul, html, {male, srednie, przyciski})` w `static/zakladki/wspolne.js`. Wejście do budynku:
  `lukrum.otworzWnetrze(id)`, powrót `lukrum.wrocNaMape()`.

## 7. Zasady kodu i treści
- **Żadnych liczb gry w kodzie silnika**, tylko w `dane/*.yaml` (pilnuje test). Parametr w `zalozenia.yaml` ma postać
  `{wartosc, pewnosc: potwierdzone|skalibrowane|zalozenie, zrodlo}`. Gdy zmieniasz liczbę, popraw `zrodlo`.
- Identyfikatory po polsku bez ogonków. Teksty dla gracza po polsku z ogonkami, **neutralne płciowo** (formy bezosobowe).
- Do nowej mechaniki dodaj test. Testów nie osłabiaj. Testy wzorów czytają `testy/dane_zamrozone/`, których nie zmieniasz.
- Branża (menu, składniki, sprzęt) siedzi w danych. Nie wpisuj „kebaba” na sztywno w silniku.
- **Nic z innych gier biznesowych** (nazwy, mechaniki, wzmianki). Mechaniki opisujemy realiami: prawo, rynek, Lublin.
- Nazwa: „LUKRUM” w tekstach (nie odmienia się: „w LUKRUM”, rodzaj nijaki), `lukrum` w identyfikatorach.
- **Wygląd:** kolory tylko przez zmienne z `motywy/zmienne.css`. Każdy ekran działa w 3 paletach (bar, pewex, wysoka)
  × jasny/ciemny. Stan nigdy samym kolorem (▲ ▼ !, `dostepnosc.css`). Styl: plansza + czytelna apka + nutka PRL.

## 8. Git
- Repo `Tom-Wasko/Lukrum` (prywatne). Pracujesz na gałęzi z briefu (`<seria>-<temat>`), zwykle w kopii
  `../_robocze/<seria>-<temat>`. **Nie dotykasz `main`.**
- Autor commitów to **tylko Tom-Wasko** (`git -c user.name=Tom-Wasko commit`), bez `Co-Authored-By`, `Claude-Session`
  ani „Generated with…”, także w opisach PR. Bez `push --force`.
- Nie commituj `gra/db.sqlite3`, `gra/lokalne.json`, `gra/zapisy/`, `*.log` ani zrzutów ekranu.
- README zawsze aktualny: commit, który zmienia to, co widzi gracz, albo sposób uruchomienia, poprawia README.

## 9. Gdzie się pisze dokumentację
| Co | Gdzie |
|---|---|
| raport agenta, plan serii | `raporty/<seria>/` |
| nowa albo przerobiona funkcja gry | notatka `../notatki/Funkcje/<Nazwa>.md` wg `_Szablon funkcji.md` (gdy brief każe) |
| zmiana widoczna dla gracza | `gra/INSTRUKCJA.md` + README |
| zadania i stan etapów | `dokumentacja/POSTEP.md` (pisze lider) |
| decyzje szefa i lidera | `../notatki/Zespół/Dziennik lidera.md` (pisze lider) |

## 10. Pułapki
- `testy/pieniadze/test_kasyno.py::test_mistrz_gry_nie_widzi_klubu` bywa niestabilny w pełnym przebiegu (osobno
  przechodzi). Zgłoś, nie naprawiaj na siłę.
- Windows: uruchamiaj Pythona z `-X utf8`. Ścieżki z polskimi znakami bierz w cudzysłów.
