# Wątek: prawo (podróż 03)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/03-okienka-i-rundy/wspolne.md` (zasady, testy, commity) oraz
  `dokumentacja/wiedza/lista-kontrolna-przegladu.md` i `wykaz-grafik-i-fontow.md` (wynik 03/przeglad-prawny).
  Gałąź bazowa: `podroz-03`. Równolegle mogą pracować: `03/poprawki-okienek` (okienka), `03/odblokowania`
  (silnik/harmonogram, zeszyt), `03/tlok` (silnik/rynek, wnętrza).
- **Cel (Z23, decyzje szefa 23.11 w `Decyzje.md`):**
  1. **Ikony sieci:** w `panel_gracza/static/zakladki/ikony_marek.js` usuń sekcję LOGA (uproszczone znaki 12
     prawdziwych sieci). Zostają ogólne ikony branżowe (sklep, hurtownia, bank…). Nazwy firm w tekstach zostają
     z zastrzeżeniem w stopce. Popraw test `test_ikony_marek.py` (ma pilnować, że nie ma loga marek), listę
     kontrolną (punkt LOGA → ✓) i wykaz grafik.
  2. **0,3162:** nachylenie składnika płacy w zadowoleniu (`dane/zalozenia.yaml`, ok. linii 620, i miejsce, skąd
     silnik bierze tę wartość). Przelicz od zera z danych GUS (np. przeciętne wynagrodzenie, struktura wynagrodzeń,
     badania zadowolenia z pracy). Zapisz w `zrodlo` źródło z odnośnikiem, wzór i wynik. Jeśli wynik różni się
     o więcej niż 20%, uruchom `balans.symuluj 12 sredni 7` przed i po i podaj liczby w raporcie. Nie zostawiaj
     liczby 0,3162 w repo (także w tekstach).
  3. **Ekran „Nawiązania i źródła”:** strona w grze (np. `/zrodla`, odnośnik w ustawieniach ⚙ i w stopce strony
     „Jak grać”), czytana z pliku danych: nawiązania literackie (`dokumentacja/wiedza/`: szukaj pliku o nawiązaniach),
     źródła liczb (GUS, przepisy), autorzy grafik, fontów i nagrań z wykazu (z licencją), mapa © OpenStreetMap (ODbL).
     Plus krótka stopka w `INSTRUKCJA.md` z odsyłaczem do tej strony; odśwież `INSTRUKCJA.pdf`
     (`manage.py instrukcja_pdf`).
- **Wygląd strony:** czytelna apka z nutką PRL, kolory przez zmienne z `motywy/zmienne.css`, 3 palety × jasny/ciemny.
  Zrzuty: `gra/narzedzia/zrzuty.py` (opis w pliku), serwer na porcie 8792, zrzuty do `../_robocze/zrzuty-prawo/`.
- **Nie ruszaj:** okienek z `03/poprawki-okienek`, `silnik/harmonogram.py`, `dane/zeszyt.yaml`, `silnik/rynek/`.
- **Zasady:** fakty ze źródeł z odnośnikami, bez ocen prawnych. Zero wzmianek o innych grach biznesowych.
  Notki prawne do instrukcji (PIP, ZUS, lichwa) dalej czekają na prawnika.
- **Gotowe, gdy:** grep nie znajduje LOGA ani 0,3162; strona działa (zrzut bar jasny + wysoka); `silnik.dane sprawdz`
  czysty; pełne testy zielone, `ruff`, `node --check` czyste (wyniki w raporcie).

## Raport

### Raport wyko (03/prawo, 23.11.2026)
Gałąź `worktree-podroz-03-prawo`, commity po każdym kroku.

**1. Ikony sieci: zrobione.** Usunięta sekcja `LOGA` (12 znaków prawdziwych sieci), gałąź `LOGA[k]` w `ikonaMarki`
i reguła `.logo-marki` w `styl.css`. Zostają ogólne ikony branżowe (koszyk, wózek, paleta, bank, dom, młotek).
Nowy test `test_bez_logo_prawdziwych_marek`; lista kontrolna pkt 4 → ✓, wykaz grafik zaktualizowany.

**2. 0,3162: usunięte z repo (poza historycznym wpisem w `Decyzje.md` i briefami), ale NIE przeliczone z GUS.**
- Liczba była tylko w tekście pola `zrodlo` (`zalozenia.yaml`, `oferta_pracy`). Silnik jej nie używał: realne nachylenie to
  `zadowolenie_osoby.wspolczynniki.placa_wzgledem_preferowanej = 0,3`, już opisane jako „okrągłe założenie LUKRUM”.
- Tekst poprawiony na to nazwane pole i wartość 0,3. Wartość w grze się nie zmieniła, więc `balans.symuluj` przed/po
  nie był potrzebny (różnica 0%).
- Przeliczenia „od zera z GUS” nie zrobiłem: brak dostępu do sieci i w repo nie ma żadnych danych GUS o zadowoleniu;
  wymyślanie liczby byłoby niezgodne z zasadą „wiedza ze źródeł”.
- **Pytanie do szefa (co i po co):** zostawić 0,3 jako jawne założenie (stan teraz), czy zlecić wyszukanie źródła
  (np. badania satysfakcji z pracy a wynagrodzenie) i wtedy skalibrować? Zmiana wartości dotknie balansu.

**3. Strona /zrodla („Nawiązania i źródła”): zrobione.** Dane: `dane/zrodla.yaml` (klucz 12 nawiązań, źródła liczb
i przepisy, grafiki, mapa OSM ODbL, 5 krojów OFL, Chart.js, odsyłacz do `/nagrania-w-radiu`). Kod: `panel_gracza/zrodla.py`,
`widoki.zrodla`, `templates/panel_gracza/zrodla.html`, URL i wyjątek logowania w `konta/middleware.py`. Podział liczb gry na
potwierdzone/skalibrowane/założenie liczony z `zalozenia.yaml`. Odnośniki: ⚙ → „O grze”, stopka „Jak grać”, stopka
`INSTRUKCJA.md` (+ odświeżony `INSTRUKCJA.pdf`). Notatka `dokumentacja/funkcje/Nawiazania-i-zrodla.md`, README, STACK.
Test `testy/aplikacja/test_zrodla.py`; do listy plików opcjonalnych w `test_dane_zamrozone.py` dopisany `zrodla.yaml`
(jak `radio.yaml`; to nie osłabia testu, plik nie jest czytany przez silnik).
- Zrzuty (bar jasny, wysoka ciemny, pewex jasny): `_robocze/zrzuty-prawo/` (poza gitem).
- Uwaga: strona jest publiczna i zawiera klucz nawiązań, który `INSTRUKCJA.md` (też publiczna) już zawiera; notatka
  `wiedza/nawiazania.md` mówi „w interfejsie nie podpisujemy”: na ekranach gry nadal nie podpisujemy, klucz jest tylko na tej stronie.
- Linki do GUS, ISAP, ZUS, PIP to strony główne instytucji (bez głębokich linków, bo nie miałem jak ich zweryfikować).
  Autor mapy („kolega autora”) i data pobrania z `METODA.md` i wykazu.

**Dowody**
- `grep`: `git grep -nE "0[,.]3162|LOGA" -- .` (w `gra/`) → brak trafień.
- `pytest -q` (pełne): 1 failed, 939 passed w 390 s; jedyny błąd to `test_dane_zamrozone` (brak `zrodla.yaml` na liście
  opcjonalnych), poprawiony; po poprawce `testy/rdzen/test_dane_zamrozone.py` → `5 passed`. Test niestabilny z AGENTS.md nie wrócił.
- `ruff check .` → `All checks passed!`; `node --check` (`ikony_marek.js`, `pulpit.js`) → ok.
- `python -X utf8 -m silnik.dane sprawdz` → `Dane w porządku: … (wersja 15aaba0bef2d)`.
- `testy/aplikacja/test_zrodla.py` + `test_ikony_marek.py` + `test_radio.py` → przechodzą.
- Serwer na 8792 zatrzymany.

**Propozycje:** głębokie linki do konkretnych aktów w ISAP po weryfikacji przez prawnika; notki prawne (PIP, ZUS, lichwa) dalej czekają na prawnika.
