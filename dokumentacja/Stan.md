# Stan
Archi żył: 2026-11-22 16:05 · wznowione 16:00 po limicie 5 h (wyko stały od 13:35)

## Podróż
02-poprawki-po-grze (start 2026-11-22, tryb nadzorowany, scalanie do `main`): Z29, Z30, Z1, Z31, Z34.
Plan: `podroze/02-poprawki-po-grze/plan.md`.

| Wątek | Kto | Stan |
|---|---|---|
| 02/sklepy | wyko-lukrum-02-sklepy (672af4e2) | w toku |
| 02/mapa | – | scalone 22.11 (254 testy aplikacja+swiat) |
| 02/drobne | – | scalone 22.11 (250 testów aplikacja+swiat) |
| 02/makiety | Archi | wybór szefa: zakupy A, wydarzenia A, list B w kopercie A; wdrożenie w następnej podróży |

## Czeka na szefa
Pytania przeniesione z dawnego „Do decyzji” (stan 17.11). Przegląd prawny z 16.11 to ćwiczenie, nie porada prawna.
Zadania do wykonania (notki edukacyjne, RODO, ekran „Nawiązania”, prawnik, wyszukanie nazw) są w `Zadania.md` (Z19, Z23).

Prawo:
- P1: Klub „Nocna 13” a niepełnoletni gracze?
  - A: zostaje, opisany w instrukcji MG („Dla mistrza gry”), zdanie o 18 latach, wyłącznik `LUKRUM_KASYNO=0` i w panelu MG, poza zestawami „Krótka lekcja” i „Pierwsza gra” (rekomendowane)
  - B: domyślnie wyłączony
  - C: usunięty
- P2: Logo prawdziwych marek (`LOGA` w `ikony_marek.js`)?
  - A: zostają, jak ustalono 14.11 (rekomendowane)
  - B: ogólne ikony sklepów
  - C: zmyślone nazwy
- P3: Porównania cen z prawdziwymi sieciami i opinie o Stokrotce, Auchan, Eurocashu (art. 23–24 k.c.)?
  - A: zostają (rekomendowane)
  - B: neutralne opisy
- P4: Zlecenie bez składek pracodawcy?
  - A: uproszczenie z notką w instrukcji (rekomendowane)
  - B: jak w prawie
- P5: Przejęcie debetu przez nowy bank?
  - A: uproszczenie z notką (rekomendowane)
  - B: spłata przed zmianą banku
- P6: Józio i bank „Solaris”?
  - A: zostają jako nawiązania (rekomendowane; projekt wnętrz z 17.11 proponuje usunąć Solarisa, 5 banków)
  - B: Józio tylko z imienia
  - C: zastąpić
- P7: Prawdziwe numery domów (lichwiarz, detektyw, lombard)?
  - A: zostają (rekomendowane)
  - B: tylko ulica
- P8: Paleta „Pewex”?
  - A: zostaje (rekomendowane)
  - B: nazwa opisowa
- P9: „Pracownia Analiz UMCS”?
  - A: nazwy zostają, opisy neutralne (rekomendowane)
  - B: zmienić nazwę

Gra:
- P10: Przyjąć 8 zmian już w `main` (Meblościanka, tytuły NAZWY i listy wujka, listy tylko w tygodniach 1–4, usunięty „Grafik zmian”, piąty wymiar księgi gości „wnętrze”, nowe ceny katalogów z przegraną premium, instrukcja, klikalne punkty)?
  - A: tak, wszystkie (rekomendowane)
  - B: przejrzeć po kolei
- P11: Gdzie postawić Kamienicę rachmistrzów i Dom reklamy (Z3)?
  - A: wybiera Archi przy serii `budynki`, szef ogląda zrzut (rekomendowane)
  - B: szef wskazuje miejsca
- P12: Ikony mapy i pasek wnętrza w jednym stylu linii?
  - A: tak (rekomendowane)
  - B: zostają różne
- P13: Balans do przeliczenia (stałe popytu i reklamy, progi punktów, odsetek pomyłek, agresywny bot blisko bankructwa na łatwym, zwroty ★★★ z założonej marży, reguły PIP: B2B i staż pominięte, licznik bez zerowania)?
  - A: po grze testowej z ludźmi (Z2) (rekomendowane)
  - B: teraz, z botów
- P14: Opłata za zmianę biura A→sam→A: dziś darmowa. Pobierać?
  - A: tak, pobierać (rekomendowane)
  - B: zostaje darmowa
- P15: Panel debetu i biura: rada „mniej godzin” bez suwaka?
  - A: dodać suwak godzin w tym miejscu (rekomendowane)
  - B: zmienić tekst rady
- P16: D3–D5 (lokata obniża punkty, kredyt w ostatnim tygodniu, ignorowanie zdarzeń) i szum ±16 pkt przy ocenie drużyn?
  - A: po grze testowej (rekomendowane)
  - B: teraz
- P17: Tygodnie 12–17: wystarczy sam przegląd?
  - A: tak (rekomendowane)
  - B: osobna seria poprawek
- P18: Dozorczyni / Dulska we wnętrzach?
  - A: zostaje jako nawiązanie (rekomendowane)
  - B: nowa postać

Lekcje i praca:
- P19: Ile tygodni na cykl gry (dziś ok. 4, w scenariuszach ok. 12)?
  - A: ustalić po lekcji próbnej ze stoperem (Z17) (rekomendowane)
  - B: 4
  - C: 12
- P20: Strona „Cel i termin” z kapitanem drużyny?
  - A: tak, przy przewodniku nauczyciela (Z18) (rekomendowane)
  - B: nie
- P21: Gra testowa z ludźmi za 7–10 dni bez zamrażania funkcji?
  - A: zamrozić funkcje na 2 dni przed grą (rekomendowane)
  - B: bez zamrażania
- P22: Ocena sposobu pracy: spotkanie z majstrem i licznik kosztów?
  - A: spotkanie po migracji; koszty pokazuje dziennik cyberiady (rekomendowane)
  - B: bez spotkania
- P23: Przełącznik „Ikony ogólne” dla urzędów (propozycja)?
  - A: nie teraz, zapisać w Odłożonych (rekomendowane)
  - B: zrobić
- P24: Układ na telefon z majstrem (Z27) i kiedy znika stary układ „bok”/„grafik”?
  - A: stary układ znika po teście z klasą, razem z przyciskiem „Stara mapa” (Z8) (rekomendowane)
  - B: od razu

## Od Pomocnika
