# Zadania
Następny numer: Z53

Kolejność ustalona 22.11: najpierw lekkie poprawki, potem ważne, potem mniej ważne. Zrobione dawniej:
`historia/postep.md`. Pytania do zadań: `Stan.md`, „Czeka na szefa”. Uwagi z gier testowych 20 i 22.11 (szef,
majster) w nawiasach: numer z listy szefa albo „m” (majster).

## W toku

## Następnie
Podróż 04-wyglad-i-dzwiek (start 24.11):

## Zrobione w tej podróży
- Z8 · billboardy Fali Koziołka na 3 rondach (widoczne tylko przy trwającej kampanii; żeton, opis, legenda), lokale botów potwierdzone na mapie (25.11; wątek 04/billboardy, 429 passed w rynek+swiat+aplikacja). Zostaje: przycisk „Stara mapa” do zdjęcia po teście z klasą
- Z3 · seria `budynki`: pierzeja 5 banków, giełda osobno, redakcja: sceny i żetony powstały w wątkach A–C podróży 04 (25.11)
- Z10 · nawiązania literackie: 5 nowych historii w parkach (Dulska, Zemsta, Trylogia, Lalka, Judym), klucz w INSTRUKCJI i /zrodla (25.11; wątek 04/nawiazania, testy zielone)
- Z4 · seria `wnetrza`: osobne wnętrze dla każdego żetonu (projekt Fable 17.11, makiety w `_archiwum/fable-17.11/fable-wnetrza/`), PRL w holach, krytyka i poprawki wybrane przez szefa; majster: wnętrza wyglądają źle; podpisy na makietach przed wdrożeniem (wyko 04/wnetrza) Wątki A, B, C zrobione i scalone do `main` (25.11).
- Z51 · dane piekarni: gazetka (1 pozycja, −10…20%) w `dane/dostawcy.yaml`, ceny pieczywa były od rundy 2 (25.11; testy swiat+aplikacja 349 passed)
- Z11 · dźwięk: lekkie dźwięki domyślnie (dzwonek, skwierczenie, gwar, stempel), łatwe wyciszenie, MG wycisza klasę; bez muzyki z syntezatora; plus odgłosy tła zależne od miejsca (CC0), domyślnie dźwięki tak / tło nie (scalone do `podroz-04`; 6 nagrań czeka na Commons) Nagrania: 10 z 11 (24.11 szef pobrał 6 ostatnich); stempel nadal bez nagrania.
- Z13 · wizyty wujka przy ladzie w ważnych momentach (04/wujek, gałąź `podroz-04`)
- Z23 · prawo (reszta; część z 23.11 zrobiona w podróży 03): decyzje po przeglądzie z 16.11; notki edukacyjne w instrukcji (progi PIP, staż, ZUS, odsetki, lichwa art. 304, CEIDG/PIS, daty roku szkolnego); ekran „Nawiązania i źródła”; drobne (stopki, PDF zgodny z `.md`, ODbL, User-Agent, autorstwo grafik, dymki 16-latków); wyszukać możliwe prawdziwe nazwiska i firmy (Jakub Klimek-Ślęzak, Zenon Lupa, e-Księgi24.pl) i zmienić przy trafieniu; informacja o klubie w instrukcji MG; lista kontrolna przeglądu (stałe wspólne z dawnym projektem → 0, brak nazw z dawnej gry, `ikony_marek.js` bez prawdziwych logo, tabela nawiązań, wykaz grafik i fontów); rozmowa z prawnikiem (04/prawo, gałąź `podroz-04`; zostaje: rozmowa z prawnikiem)
- Z49 · zawartość wszystkich okien w stylu ramy danego okna (teczka, paragon, list, okienko urzędu…); spis okien, wzór na 3 oknach do akceptacji (04/wzor + 04/okna, gałąź `podroz-04`)
- Z50 · radio: ikona radia obok kaski (dzisiejszy przycisk nic nie robi), wysuwany retro odbiornik ze zmianą stacji na nim, gwar cichnie przy radiu (04/radio, gałąź `podroz-04`)
- Z6 · wygląd: przegląd rzadkich ekranów w trybie ciemnym i w wysokiej widoczności; pełny przegląd na telefonie (reszta: propozycje w `wiedza/analizy/przeglad-wygladu-23-11.md`) (04/kontrast, gałąź `podroz-04`)
- Z47 · kreator /mg/: „Rozlosuj uczniów po drużynach”, kartki z hasłami w podziale na drużyny, przyciski kroków przypięte do dołu (1366×768) (04/kreator, gałąź `podroz-04`)

## Zaplanowane

### Lekkie poprawki

### Ważne
- Z20 · zgłoszenie do „Zwolnieni z Teorii” z datą lekcji (31.03.2027, niepotwierdzone); `METODA.md` (jawność AI) po pobraniu regulaminu (`wiedza/analizy/regulamin-zwzt-a-ai.md`)

### Mniej ważne
- Z7 · mapa: położenia lokali w `lokale.yaml: geo` zamiast w `lublin.json`; odsyłacze dla twórców usunąć z `budynki.yaml`; opisy 11 punktów orientacyjnych i położenia Auchan/błonia/Lidl sprawdzić w źródłach; wybór ikony lokalu (6 wariantów, dziś 3) i usunięcie `/static/mapa/podglad_lokali.html`
- Z14 · wydarzenia dla filii, popyt z mapy (nastrój zespołu na twarzach zrobiony 25.11, wątek 04/nastroj: miny obsługi w kebabie z nastroju)
- Z52 · naprawić test `pieniadze/test_debet_i_przeglad::test_debet_w_rozegranej_grze_oplata_tylko_przy_minusie_na_koniec_tygodnia` (pada w pełnym przebiegu, r. 7 bot „agresywny”; także na bazie sprzed Z8; osobno przechodzi)
- Z22 · niezależny przegląd całości (kod, dane, teksty, zrzuty)
- Z27 · wersja na telefon (układ razem z majstrem) i pilot w szkole do maja 2027
- Z24 · nazwa w UPRP i znaki towarowe (zwłaszcza poza szkołami), publikacja za zgodą szefa
- Z39 · moduły panelu w jednym pliku (paczka), jeśli preload z 03/wydajnosc nie wystarczy przez hostuj/Cloudflare; najpierw zmierzyć. Pomiar 25.11 (statyczny): app.js ładuje 75 modułów (1164 KB), łańcuch importów ma 11 poziomów; czas przez hostuj/Cloudflare niezmierzony; paczka wymaga kroku budowania (nowe narzędzie): decyzja szefa

## Odłożone
- Z19 · (czeka na powrót kolegi) serwer szkoły: szef z kolegą ustawia LUKRUM na serwerze szkoły (FTP) 23.11; osoba od `manage.py zamykaj_rundy`, dane uczniów (RODO) i notka w instrukcji
- Z48 · zeszyt wujka na telefonie (dziś tylko ekran ≥ 901 px); późna przyszłość
- Z26 · niestabilny test kasyna (dziś `test_mistrz_gry_widzi_klub`): 22.11 nie powtórzył się w 2 pełnych przebiegach; wrócić, gdy się pojawi
- Z2 · gry testowe: znajomi 20 i 22.11 za nami; dalej 4–6 osób ze stoperem, potem klasa; balans jest dotąd tylko z botów;
  w najbliższej grze sprawdzić poprawki z podróży 02 (sklepy, Park, mapa, drobne), kategorie w rzędzie (1) i „Jak grać” w zakładkach (3)
