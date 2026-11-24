# Lista kontrolna przeglądu przed pokazaniem gry (Z23, wątek 03/przeglad-prawny)

Data: 23.11.2026, uaktualnione 24.11.2026 (wątek 04/prawo). Zebrane fakty, bez oceny prawnej (ta czeka na prawnika). ✓ = w porządku, ! = do decyzji szefa.
Polecenia z korzenia repozytorium; w poleceniach nie wpisujemy nazwy dawnej gry (w sprawozdaniu: „nazwa dawnej gry”).

| # | Punkt | Polecenie | Wynik | |
|---|---|---|---|---|
| 1 | Nazwa dawnej gry w plikach repo | `git grep -i -c "<nazwa dawnej gry>"` | 0 trafień | ✓ |
| 2 | Nazwy własne z dawnych katalogów (banki, firmy, nazwy ekranów: 7 haseł z archiwalnego porównania) | `git grep -n -i -E "<7 haseł>"` | 0 trafień | ✓ |
| 3 | Stałe wspólne z dawnym projektem (21 liczb z archiwalnego porównania: karta wyników, popyt, reklama) | `git grep -n -E "<21 liczb, także z przecinkiem>" -- gra` | 1 trafienie: `gra/dane/zalozenia.yaml:620`, liczba **0,3162** w tekście pola `zrodlo` (nachylenie składnika płacy na karcie zadowolenia). Samo pole z liczbą nie występuje (grep `0[.,]316` w `gra/dane`, `gra/silnik`: tylko ta linia). Dodatkowo `kandydaci.yaml:62` `ryzyko_pomylki: 0.0165` jest bliskie 0,0163, ale to inna liczba | ! |
| 4 | `ikony_marek.js` bez prawdziwych logo | `grep -c "logo-marki" gra/panel_gracza/static/zakladki/ikony_marek.js` | Sekcję ze znakami 12 prawdziwych sieci usunięto (03/prawo, decyzja szefa 23.11.2026). Zostały ogólne ikony branżowe; pilnuje tego `test_bez_logo_prawdziwych_marek`. Nazwy firm w tekstach zostają z zastrzeżeniem w stopce. | ✓ |
| 5 | Wykaz grafik i fontów | `dokumentacja/wiedza/wykaz-grafik-i-fontow.md` | Napisany: fonty OFL (5 rodzin), grafiki własne SVG (118 plików), radio (46 nagrań, licencje w `radio.yaml`), mapa OSM/ODbL, Chart.js MIT | ✓ |
| 6 | Podpis OpenStreetMap w grze | `git grep -n -i openstreetmap -- gra/panel_gracza gra/INSTRUKCJA.md gra/README.md` | `lublin.js:457` (link „© autorzy OpenStreetMap” przy mapie), `INSTRUKCJA.md:612`, `README.md:81`, `METODA.md:31`, `lublin.json` pole `zrodlo` | ✓ |
| 7 | Licencje fontów dołączone | `grep -n "^=====" gra/panel_gracza/static/fonty/OFL.txt` | 5 sekcji (Oswald, PT Sans, Alfa Slab One, Atkinson Hyperlegible, Caveat), każda z pełnym tekstem OFL 1.1 | ✓ |
| 8 | `INSTRUKCJA.pdf` zgodny z `.md` | `git log -1 -- gra/INSTRUKCJA.md` i `…pdf` | `.md` z 22.11 22:00, `.pdf` z 22.11 21:52 (starszy). Wygenerowano na nowo: `manage.py instrukcja_pdf` → „Zapisano … INSTRUKCJA.pdf (410 KB)” | ✓ (po poprawce) |
| 9 | Prawdziwe osoby i firmy o nazwach z gry | wyszukiwarka, tabela w raporcie wątku | brak trafień (Klimek-Ślęzak, Lupa, e-Księgi24.pl, Sokole Oko) | ✓ |

## Przebieg 24.11.2026 (04/prawo)
Punkty 1–3 wymagają haseł z archiwalnego porównania (poza gitem), więc dziś ich nie powtarzałem: ostatni wynik z 23.11 (1 ✓, 2 ✓, 3 !) nadal obowiązuje, a w tym wątku nie zmieniałem danych liczbowych ani silnika.

| # | Punkt | Polecenie dziś | Wynik | |
|---|---|---|---|---|
| 4 | Logo prawdziwych marek | `grep -c "logo-marki" gra/panel_gracza/static/zakladki/ikony_marek.js` | 0 | ✓ |
| 5 | Wykaz grafik i fontów | `dokumentacja/wiedza/wykaz-grafik-i-fontow.md` | uzupełniony o dźwięki gry (4 pliki w `static/dzwieki/`) | ✓ |
| 6 | Podpis OSM | `grep -rn -i openstreetmap gra/panel_gracza/static/mapa/lublin.js gra/INSTRUKCJA.md gra/README.md` | `lublin.js:458`, `INSTRUKCJA.md:693`, `README.md:12, 28, 89`; strona `/zrodla` ma ramkę z ODbL | ✓ |
| 7 | Licencje fontów | `grep -c "^=====" gra/panel_gracza/static/fonty/OFL.txt` | 5 | ✓ |
| 8 | PDF zgodny z `.md` | `manage.py instrukcja_pdf` po ostatniej zmianie `.md` | „Zapisano … INSTRUKCJA.pdf (457 KB)”. PDF powstaje z `.md` poleceniem `instrukcja_pdf`; za każdym razem po zmianie instrukcji uruchom je i zapisz w tym samym commicie | ✓ |
| 10 | User-Agent narzędzi pobierających | `grep -rn -i "user-agent" --include=*.py gra` | tylko `narzedzia/mapa/pobierz_osm.py:31`: „geokoder-skrypt/1.0” (bez danych osobowych). `zrzuty.py` i `balans/obciazenie.py` łączą się tylko z własnym serwerem | ✓ |
| 11 | Notki prawne w instrukcji | `INSTRUKCJA.md`, „Prawo za mechanikami” | 7 notek, każda z odnośnikiem; odsetki, lichwa, rok szkolny i CEIDG/sanepid sprawdzone w wyszukiwarce 24.11; PIP, staż i ZUS (numery artykułów z pamięci, bez numerów Dz.U.) **do sprawdzenia przez prawnika** | ! |
| 12 | Stopki z odnośnikiem do `/zrodla` | `grep -n "zrodla" gra/panel_gracza/templates/panel_gracza/*.html` | start, gra, „Jak grać”; `/zrodla` odsyła do „Jak grać” i „Nagrań w radiu” | ✓ |
| 13 | Klub (kasyno) w instrukcji MG | `grep -n "Ukryty klub" gra/INSTRUKCJA.md` | jest w części „Dla mistrza gry” (jak go zablokować) | ✓ |

## Do decyzji szefa
- **Pkt 4:** rozstrzygnięte 23.11.2026: ogólne ikony zamiast znaków sieci (zrobione). Pytanie do prawnika o użycie nazw marek zostaje.
- **Pkt 3:** czy liczbę 0,3162 w opisie źródła przeliczyć od zera (jest w nawiasie w tekście; zmiana wartości dotyka liczb gry).
