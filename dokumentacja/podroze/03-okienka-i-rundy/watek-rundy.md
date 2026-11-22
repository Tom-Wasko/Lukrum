# Wątek: rundy (podróż 03)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/03-okienka-i-rundy/wspolne.md`. Są tam zasady, testy i commity.
  Wątki `03/list` i `03/zeszyt` są już scalone.
- **Cel (Z32):** w każdej rundzie gracz ma 3–4 sensowne rzeczy do zrobienia. Majster w rundzie 2 kupił tylko bułki.
- **Decyzje szefa (`dokumentacja/Decyzje.md`, 22.11):**
  1. **Zadania „sprawdźcie” stają się konkretnymi ruchami w grze.** Zeszyt sam odhacza zadanie, gdy decyzja w tej
     rundzie różni się od poprzedniej. Zatwierdzone przykłady:
     - t.4 „Sprawdźcie tabelę” → „Zmieńcie jedną rzecz po tabeli: cenę, menu albo zespół”;
     - t.5 „Sprawdźcie kalendarz” → „Zamówcie więcej towaru na tydzień z wydarzeniem”;
     - t.6 „Sprawdźcie ratę i debet” → „Spłaćcie część debetu albo raty”;
     - t.7 „Przejrzyjcie umowy” → „Dajcie podwyżkę albo zmieńcie umowę jednej osobie”;
     - t.8 „Sprawdźcie rywala” → „Zamówcie detektywa i odpowiedzcie ceną jednego dania”;
     - t.9 „Porównajcie połowy” → „Zmieńcie albo usuńcie danie, które najmniej zarabia”;
     - t.12 „Sprawdźcie koszty stałe” → „Obniżcie jeden koszt stały”.
     Pozostałe tygodnie uzupełnij według tego wzoru. Opieraj się tylko na decyzjach, które już są w grze; nie wymyślaj
     nowych mechanik.
  2. **Cel tygodnia od wujka:** co rundę (od tygodnia 2) jeden cel z nagrodą, np. „sprzedajcie 300 dań” → opinia ▲.
     Cel jest sprawdzany po zamknięciu tygodnia, a wynik („cel osiągnięty ✓” albo „nie tym razem”) widać w zeszycie
     w następnej rundzie.
     - Cele, progi i nagrody trzymasz w danych (`dane/zeszyt.yaml` albo nowy plik `dane/cele.yaml`), z polami
       `{wartosc, pewnosc, zrodlo}`.
     - Nagroda jest mała i nie psuje balansu. Sprawdź to botami (`python -X utf8 -m balans.symuluj 12 sredni 7`
       przed zmianą i po niej) i wpisz wyniki do raportu.
     - Losowość tylko przez `silnik/losowosc.py`.
  3. Razem cel i zadania dają **3–4 rzeczy na rundę**.
  4. **Bez** dodatkowych spraw w lokalu.
- **Ustalone:**
  - Zadania na każdy tydzień są w `dane/zeszyt.yaml` (`tygodnie`, `stale`, `warunki`).
  - Warunki odhaczenia są w `panel_gracza/static/pulpit/zeszyt-warunki.js`. Test `testy/aplikacja/test_zeszyt.py`
    pilnuje, że każda nazwa warunku z danych ma tam swoją funkcję.
  - Do porównania z poprzednią rundą potrzebujesz decyzji z poprzedniej rundy w widoku `v`. Jeśli ich tam nie ma,
    dopisz małe pole w `api/prezentacja.py`, w osobnej funkcji.
  - Silnik tygodnia jest w `silnik/runda.py`. Cel tygodnia liczysz w osobnym module silnika, np. `silnik/cele.py`.
- **Pliki do zmiany:**
  - `dane/zeszyt.yaml`, ewentualnie `dane/cele.yaml`;
  - `pulpit/zeszyt-warunki.js` i tylko część zadań i celu w `pulpit/zeszyt.js`;
  - nowy moduł w `silnik/` i jego podpięcie;
  - `api/prezentacja.py`, osobna funkcja;
  - testy.
- **Nie ruszaj:** `swiat/rysunek.js`, `zakladki/dostawcy.js`, `zakladki/inwestycje.js`, `zakladki/zdarzenia.js`,
  `swiat/sceny/park.js`, `swiat/sceny/zana_*`, `mapa/*`. Te pliki należą do wątków, które wciąż pracują.
- **Gotowe, gdy:**
  - Każdy tydzień od 2 do ostatniego ma 3–4 rzeczy: cel i zadania będące decyzjami.
  - W raporcie jest tabela tydzień → zadania i cel. Szef obejrzy ją z telefonu.
  - Do każdego nowego warunku jest test i do celu jest test.
  - Wynik botów przed zmianą i po niej jest w raporcie.
  - `python -X utf8 -m silnik.dane sprawdz` jest czysty, a pełne testy są zielone.
  - Jest notatka `dokumentacja/funkcje/Cel-tygodnia.md`.
- **Zrzuty ekranu:** nie ma przeglądarki, więc zrzutów nie robisz.

## Raport
