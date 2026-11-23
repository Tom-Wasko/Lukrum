# Stack technologiczny – LUKRUM

Przeglądarkowa symulacja biznesowa. Silnik gry to czysty Python. Nad nim jest cienka warstwa Django: zapisuje decyzje,
udostępnia API JSON i serwuje panele gracza i mistrza gry. Wszystkie liczby gry leżą w plikach YAML.
Stan na 22.11.2026.

## W skrócie
| Warstwa | Technologia | Wersja w `.venv` |
|---|---|---|
| Język | Python | ≥ 3.12 (rozwijane i testowane na 3.13; skrypty startowe wybierają 3.14, 3.13 lub 3.12) |
| Silnik gry | czysty Python, pydantic (stan, schematy), numpy (popyt, losowość) | pydantic 2.14, numpy 2.5 |
| Optymalizacja | scipy `linprog` (HiGHS) – plan obsługi klientów w `kuchnia/operacje.py` | scipy 1.18 |
| Dane gry | YAML (PyYAML), walidowane schematami pydantic | PyYAML 6.0 |
| Aplikacja webowa | Django: API JSON i szablony stron | 5.2 |
| Logowanie | konta Django + django-allauth (opcjonalnie Microsoft / Entra ID szkoły) | allauth 65 |
| Baza danych | SQLite (`db.sqlite3`, poza gitem) | wbudowana |
| Frontend | czysty JavaScript (moduły ES, bez bundlera), CSS, Chart.js w `static/vendor/` | – |
| Testy | pytest, pytest-django, hypothesis | pytest 9.1, hypothesis 6.170 |
| Jakość kodu | ruff (lint, linia ≤ 100) | 0.17 |
| Udostępnianie | `cloudflared` (darmowy tunel Cloudflare, `hostuj.bat`) | pobierany do `narzedzia/` |

Zależności są w `requirements.txt` (instalacja do `.venv`), konfiguracja narzędzi w `pyproject.toml`.
Projekt nie używa Dockera, npm ani frameworków JS i nie potrzebuje usług zewnętrznych poza opcjonalnym logowaniem
Microsoft i tunelem.

## Architektura
```
przeglądarka ── HTML (szablony) ──▶ panel_gracza / panel_mg / konta
     │
     └── fetch JSON ──▶ api/widoki.py ──▶ gry/serwisy.py ──▶ silnik/gra.py (czysty Python)
                          │                   │                  │
                api/prezentacja.py       SQLite: Gra, Runda,     dane/*.yaml
                (widok `v` gracza)     Decyzja, Druzyna
```

### Silnik (`silnik/`)
- **Nie importuje Django**, więc boty, symulator balansu i testy działają bez serwera.
- **Rdzeń:**
  - `gra.py` – klasa `Gra`: konfiguracja, decyzje w rundach, stany po rundach i przeliczanie;
  - `runda.py` – przebieg tygodnia dzień po dniu;
  - `decyzje.py` – format decyzji (opisany w docstringu) i ich zastosowanie;
  - `model.py` – stan gry jako drzewo modeli pydantic (`StanGry`); `StanGry.kopia()` kopiuje stan bez raportów
    minionych rund, które są tylko do odczytu;
  - `dane.py` i `schematy.py` – wczytanie i walidacja YAML (`python -m silnik.dane sprawdz`);
  - `harmonogram.py` – odblokowanie ekranów i elementów gry w kolejnych tygodniach;
  - `boty.py` – decyzje botów (5 strategii × 4 poziomy);
  - `limity.py`, `losowosc.py`.
- **Podpakiety mechanik:** `kuchnia/` (menu, jakość, operacje, dostawcy, magazyn, świeżość), `rynek/` (popyt,
  konkurencja, kalendarz miejski, reklama, promocje, handel), `ludzie/`, `nieruchomosci/`, `ksiegowosc/` (KPiR,
  rozliczenie, uzgodnienie kasy, biuro, urząd, środki trwałe), `pieniadze/` (banki, Harpagon, kasyno, portfel
  właściciela, zaległości), `swiat/` (zdarzenia, awarie), `wyniki/` (karta wyników, wnioski).
- **Pieniądze:** w stanie są liczbami całkowitymi w groszach (pola `…_gr`), a silnik liczy w złotych przez właściwości.
  `Decimal` służy tylko do zaokrągleń „połówki w górę”.
- **Losowość** ma jedno źródło: `losowosc.strumien(ziarno, runda, cel, *klucze)`. Każdy nazwany strumień to
  `numpy.random.Generator` z ziarnem wyprowadzonym skrótem. To samo ziarno i te same decyzje dają zawsze ten sam wynik.
- **Zapis gry (event sourcing):** baza trzyma konfigurację i decyzje, a nie stan. Silnik odtwarza stan, przeliczając
  rundy. Wczytana gra zostaje w pamięci serwera (`gry/serwisy.py`) z policzonymi stanami, dopóki nie zmieni się
  `Gra.zmieniono`. Gry można eksportować i importować jako `.json`.

### Dane gry (`dane/`)
- Pliki główne: `zalozenia.yaml` (każdy parametr ma postać `{wartosc, pewnosc, zrodlo}`), `uslugi.yaml` (dania),
  `zasoby.yaml`, `sprzet.yaml`, `dostawcy.yaml`, `kandydaci.yaml`, `katalog.yaml`, `boty.yaml` i `podatki_2026.yaml`.
- `zeszyt.yaml`: treść zeszytu wujka (listy, zadania tygodni, strony „Gdzie co kupić”). `api/zeszyt.py` składa z niej
  `v.zeszyt`, warunki odhaczenia liczy `panel_gracza/static/pulpit/zeszyt-warunki.js`, a wizyty we wnętrzach zapisuje
  `api/wizyty.py` (`Runda.zeszyt`).
- `zrodla.yaml`: treść strony `/zrodla` („Nawiązania i źródła”: klucz nawiązań, źródła liczb i prawa, autorzy grafik, fontów,
  nagrań i mapy). Silnik go nie czyta: `panel_gracza/zrodla.py` + `templates/panel_gracza/zrodla.html`, test `testy/aplikacja/test_zrodla.py`.
- `radio.yaml`: radio „Fala Koziołka” (stacje, nagrania z autorem, źródłem i licencją, teksty prowadzącego). Silnik
  go nie czyta: `panel_gracza/radio.py` daje `/radio.json` (odbiornik `static/pulpit/radio.js`) i stronę
  `/nagrania-w-radiu`. Pliki MP3 (mono) leżą w `panel_gracza/static/radio/<stacja>/`; `lukrum/statyczne.py` obsługuje
  dla nich nagłówek `Range` (przewijanie, wznawianie słuchowiska). Zasady i limit paczki pilnuje `testy/aplikacja/test_radio.py`.
- Katalogi: `mapa/` (strefy, budynki, lokale, popyt, menu, banki, biura, Harpagon, promocje, reklama),
  `kalendarz/` (kalendarz miejski Lublina) i `zdarzenia/` (eventy w parkach, losowe, handel, kasyno, urząd…).
- **Żadnych liczb gry w kodzie silnika.** Pilnuje tego test `test_w_kodzie_silnika_nie_ma_liczb_gry`.
- Testy wzorów czytają zamrożoną kopię danych `testy/dane_zamrozone/`.

### Warstwa Django (korzeń repozytorium)
- `lukrum/` – ustawienia i URL-e. Ustawienia lokalne komputera trzyma `lokalne.json` (poza gitem). Zmienne
  środowiskowe: `LUKRUM_DEBUG`, `LUKRUM_HOSTY`, `LUKRUM_HTTPS`, `LUKRUM_SECRET_KEY` i ustawienia Microsoft
  (`LOGOWANIE_MICROSOFT.md`).
- `gry/` – modele `Gra`, `Runda`, `Decyzja` i `Druzyna`, serwisy z blokadą i transakcją, harmonogram automatycznego
  zamykania rund i komenda `zamykaj_rundy`.
- `api/` – widoki JSON (`widoki.py`) i budowa widoku gracza (`prezentacja.py`).
- `konta/` – role (mistrz gry: grupa `mistrz_gry` albo superużytkownik; uczeń widzi tylko swoje drużyny), adapter
  allauth i komenda `konto`.
- `panel_gracza/` – strony gracza, instrukcja „Jak grać” i komendy `graj` (serwer lokalny 127.0.0.1:8765 z kontem
  mistrza gry), `hostuj` (serwer z tunelem Cloudflare) i `instrukcja_pdf` (PDF przez Edge albo Chrome bez okna).
- `panel_mg/` – panel mistrza gry `/mg/`.

### Frontend
- Strony to szablony Django (`*/templates/`). Dane ekranów przychodzą z API jako JSON.
- Wnętrza (`static/swiat/`): `rysunek.js` to biblioteka cegiełek SVG (kolory tylko ze zmiennych palety), `sceny/<id>.js` to jedna scena
  wnętrza (rysunek, punkty, postacie), `static/swiat/sceny/index.js` to rejestr i tabela żeton budynku → scena, `wnetrze.js` łączy scenę z grą
  (stan punktów z widoku gry), `wnetrza.css` to style. Test `testy/aplikacja/test_wnetrza_sceny.py` pilnuje, że każdy żeton ma scenę.
- Mapa Lublina (`static/mapa/lublin.js`, `widok.js`, `mapa.css`): świat w SVG, żetony w HTML nad nim. Grubość linii to `N px / --k` (`--k` = px na
  metr z chwili zatrzymania mapy; bez `vector-effect: non-scaling-stroke`, który jest drogi w każdej klatce). W ruchu (klasa `lm-ruch`,
  do 150 ms po ostatniej zmianie widoku) rysunek SVG jest schowany, a w jego miejsce działa zdjęcie mapy (`static/mapa/zdjecie.js`): canvas
  o 30% większy z każdej strony, w rozdzielczości ekranu, rysowany ze stylów obliczonych tych samych elementów (kolory, grubości, kreski,
  napisy ulic wzdłuż toru), przesuwany i skalowany transformem CSS. Zdjęcie robi się w bezczynności po zatrzymaniu mapy, po zmianie palety,
  pory dnia i fontów (a w ruchu, gdy widok wyjdzie poza zdjęcie albo powiększenie przekroczy 2,4×). Bez zdjęcia (błąd canvas) rysują się
  wektory. Test: `test_mapa_w_ruchu_nie_chowa_linii`.
- `panel_gracza/static/app.js` uruchamia panel. Ekrany decyzji i wyników to moduły ES w `static/zakladki/*.js` z rejestrem
  w `index.js` (nazwa folderu jest historyczna: gracz widzi je jako okienka we wnętrzach, nie jako zakładki).
  Okienko nad wnętrzem otwiera `okno(...)` z `zakladki/wspolne.js`.
  Opisy i objaśnienia są w kółkach „i” z dymkiem (`zakladki/dymki.js`).
  Wykresy rysuje Chart.js (`static/vendor/chart.umd.min.js`).
- Wczytywanie panelu: `app.js` importuje ok. 70 modułów w 5 „piętrach” (przeglądarka poznaje import dopiero po pobraniu
  rodzica). Szablon `gra.html` dopisuje więc `<link rel="modulepreload">` dla każdego modułu, do którego `app.js` dochodzi
  zwykłymi importami. Listę liczy `panel_gracza/moduly.py` z samych źródeł, przy każdym żądaniu przy `DEBUG` i raz na proces
  poza nim: bez budowania, więc edycja pliku JS i odświeżenie działają. Importy leniwe `import("…")` (budynki, wnętrza) nie
  wchodzą na listę. Pilnuje tego `testy/aplikacja/test_wczytywanie.py`.
- Układ i wygląd: `motyw.js` wybiera układ menu (z boku `bok` albo u góry `klasyczny`), a `motywy/zmienne.css` daje trzy palety
  (bar, pewex, wysoka z kontrastem co najmniej 7:1) × tryb jasny/ciemny; kolory bierze się tylko ze zmiennych, stan oznacza znak
  (▲ ▼ !, `motywy/dostepnosc.css`), nie sam kolor. `motywy/grafik.css` to nieużywany już układ „grafik”.
- Pulpit (`static/pulpit/`): Plan tygodnia, zeszyt wujka (`zeszyt.js`, treść z `dane/zeszyt.yaml`), radio, list z decyzjami.
- Składnię modułu JS sprawdza `node --check plik.mjs` (skopiuj `.js` jako `.mjs`).

### Narzędzia poboczne
- `balans/symuluj.py` – gry samych botów do pomiaru balansu (`python -X utf8 -m balans.symuluj 12 sredni 7`).
- `balans/warianty.py` – pary gier (badana firma różni się jedną decyzją) do kalibracji: `szybki` (≤ 10 min),
  `pelny` (w tle, wznawiany z `gry.csv`), `raport`, `lista`; wyniki w `_robocze/pomiary/kalibracja/` (poza repozytorium, w folderze `lukrum/`).
- `balans/odcisk.py` – odcisk stanów gier botów przed i po zmianie kodu bez zmiany zasad (`zapisz` / `porownaj`).
- `narzedzia/cloudflared.exe` – pobierany raz przez `hostuj`.

## Testy i jakość
- `testy/`: ponad 900 testów pytest w podfolderach odpowiadających podpakietom silnika (`rdzen/`, `kuchnia/`,
  `rynek/`…), `aplikacja/` (API, panele, konta, sceny wnętrz), `swiat/` (zdarzenia w parkach, awarie) i `wnetrza/` (dymki, bywalcy). Wspólne funkcje są w `pomocnicze.py`.
- Testy własności używają hypothesis (np. uzgodnienie kasy). Testy pilnują też determinizmu i scenariuszy co do
  grosza.
- ruff: linia ≤ 100, cel `py312`, reguły `E, F, W, I, B, UP`. Dla starszego kodu (`silnik/`,
  `api/prezentacja.py`, `testy/`) część reguł jest wyłączona w `pyproject.toml`. Globalnego `ruff format` nie używamy.

```
cd gra
.venv/Scripts/python -m pytest -q                          # pełny przebieg ok. 7 min
.venv/Scripts/python -m ruff check .
.venv/Scripts/python -X utf8 -m silnik.dane sprawdz
.venv/Scripts/python manage.py graj                        # albo start.bat
```

## Wydajność (orientacyjnie, laptop autora)
- Gra 5 botów × 18 rund liczy się w ok. 5 s, a widok gracza buduje się w ok. 0,1 s.
- Najwięcej kosztują: plan obsługi (scipy HiGHS), prognozy popytu botów i import scipy (ok. 1 s przy starcie).

## Konwencje
- Identyfikatory po polsku bez ogonków (`snake_case`, klasy `PascalCase`). Komentarze, docstringi i teksty dla
  gracza po polsku z ogonkami.
- Końce linii LF (`.gitattributes`), z wyjątkiem `*.bat` w CRLF.
- Historia liniowa na `main`: jeden commit na skończoną część etapu, a postęp w `dokumentacja/Stan.md`. Zasady pracy agentów
  opisuje `AGENTS.md`.
