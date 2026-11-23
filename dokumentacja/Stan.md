# Stan
Archi żył: 2026-11-23 07:40
Tryb: autonomiczny od 06:22 23.11, budżet do 16:00 (nowe kroki do ok. 14:30), koniec najpóźniej 16:00. Scalanie na `podroz-03`.

## Podróż
**03-okienka-i-rundy** od 2026-11-22 21:40 (`podroze/03-okienka-i-rundy/plan.md`). W nocy 5 wyko, rano Z32 po
zatwierdzeniu szefa. Scalanie: do `main` dopóki szef jest, po `/papa` na `podroz-03`.

| Wątek | Zadania | Stan |
|---|---|---|
| 03/paragon | Z34 zakupy | scalone do main 21:50 (899 passed w wątku) |
| 03/wydarzenia | Z34 wydarzenia, Z33 | scalone do main 21:50 |
| 03/list | Z34 list | scalone do main 21:38 (899 passed) |
| 03/zeszyt | Z35, Z5 | scalone do main 21:38 (900 passed); czcionka zostaje Caveat |
| 03/wyniki | Z36, Z38 | scalone do main 21:45 (904 passed) |
| Archi | Z9, Z28 zrobione; Z26 odłożone | gotowe |
| 03/rundy | Z32 | scalony 22:00 (cel tygodnia, 3–4 ruchy w tygodniach 2–ostatni) |
| 03/wydajnosc | Z37 | scalony 21:56 (preload 71 modułów, 5 pięter żądań → 1) |
| 03/opisy | Z16, Z25 | scalony 22:06 (0 martwych odsyłaczy) |
| 03/pora | Z12 | start 06:50 |
| 03/przeglad-prawny | Z23 (część) | scalony na podroz-03 07:35 (lista kontrolna, wykaz grafik) |

## Czeka na szefa
- (23.11, z 03/przeglad-prawny) `ikony_marek.js` ma uproszczone loga 12 prawdziwych sieci. a) zamienić na ogólne
  ikony bez marek (rekomendacja, bezpieczniej przed konkursem), b) zostawić z zastrzeżeniem.
- (23.11) Liczba 0,3162 w `zalozenia.yaml:620` (nachylenie składnika płacy) jest wspólna ze starym projektem.
  a) przeliczyć od zera z danych GUS (rekomendacja), b) zostawić.
- (23.11) Podpis autorów grafik i nagrań (licencja wymaga autora): a) strona „Nawiązania i źródła” + stopka instrukcji
  (rekomendacja), b) tylko instrukcja.
- (23.11) Z41: inwestor ratunkowy wpłaca najwyżej 40 000 zł, a `zrodlo` mówi „max_kwota = kapitał startowy”, który od
  13.11 wynosi 50 000 zł. a) podnieść do 50 000 (rekomendacja, zgodnie z opisem), b) zostawić 40 000 i poprawić opis.
- (23.11) Wskazówki w wydarzeniach: wskaźnik „Goście” (tak nazwał wyko, to popyt w lokalach) czy „Opinia” (jak w Twoim
  przykładzie)? Rekomendacja: „Goście”, bo to dokładnie to, co liczy gra; opinia to osobny wskaźnik.
- (23.11) Nagroda za cel tygodnia: wyko dał +3% gości na tydzień zamiast „opinia ▲”. Rekomendacja: zostawić +3% gości
  (działa bez nowej mechaniki, balans botów +2,7%).

## Od Pomocnika
