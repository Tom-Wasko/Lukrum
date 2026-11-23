# Lista kontrolna przeglądu przed pokazaniem gry (Z23, wątek 03/przeglad-prawny)

Data: 23.11.2026. Zebrane fakty, bez oceny prawnej (ta czeka na prawnika). ✓ = w porządku, ! = do decyzji szefa.
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

## Do decyzji szefa
- **Pkt 4:** rozstrzygnięte 23.11.2026: ogólne ikony zamiast znaków sieci (zrobione). Pytanie do prawnika o użycie nazw marek zostaje.
- **Pkt 3:** czy liczbę 0,3162 w opisie źródła przeliczyć od zera (jest w nawiasie w tekście; zmiana wartości dotyka liczb gry).
