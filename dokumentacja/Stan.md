# Stan
Archi żył: 2026-11-23 11:46
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
| 03/pora | Z12 | scalony na podroz-03 07:50 (934 passed; zrzuty 12:00/22:00 w kebabie i Biedronce OK) |
| 03/tlok | Z21, Z42 | scalony 07:12 (937 passed w wątku; balans ±0,1% średnio) |
| podroz-03 (całość) | – | pełne testy po scaleniach: 947 passed (07:25) |
| 03/prawo | Z23 (decyzje 23.11) | scalony 07:12 (939 passed; 0,3 zostaje jako jawne założenie, pytanie do szefa) |
| 03/odblokowania | Z15 | scalony 07:11 (938 passed; po scaleniu swiat+aplikacja 286 passed) |
| 03/wyglad | Z6 | scalone 11:31 (część; propozycje w spisie) |
| 03/ukryte | Z42 | scalone 11:40 |
| 03/kartki | Z44 | poprawka gęstości stron (od 11:36) |
| 03/lekcja | Z17, Z45 | scalone 11:44 (956 passed) |
| 03/poprawki-okienek | Z34 (dokończenie) | scalony na podroz-03 07:03 (929 passed w wątku; swiat+aplikacja po scaleniu 282 passed) |
| 03/przeglad-prawny | Z23 (część) | scalony na podroz-03 07:35 (lista kontrolna, wykaz grafik) |

## Czeka na szefa
- P1 (03/lekcja): zestaw funkcji wybiera się przy zakładaniu gry, więc na każdą lekcję jest nowa gra. Czy gra z lekcji 1 ma móc przejść na zestaw lekcji 2? Rekomendacja: tak (przełącznik zestawu w /mg/ między rundami).
- P2 (03/lekcja): start całej klasy naraz trwa 3–4 s (jeden proces). Wdrożyć serwer wieloprocesowy w `hostuj`? Rekomendacja: tak, przed testem na klasie.
- P3 (03/kartki): zeszyt jest tylko na ekranie ≥ 901 px; na telefonie go nie ma. Dodać zeszyt na telefonie? Rekomendacja: później (lekcja na laptopach).
- P4 (03/lekcja): kreator: „rozlosuj uczniów po drużynach” + kartki z hasłami w podziale na drużyny (dziś 60 kliknięć dla klasy). Rekomendacja: tak, przed testem.

## Od Pomocnika
