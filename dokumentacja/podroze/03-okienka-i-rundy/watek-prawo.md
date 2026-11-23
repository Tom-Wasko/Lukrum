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
