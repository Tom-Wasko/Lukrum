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

### Wątek 03/rundy: zrobione (22.11.2026)
**Co:** każdy tydzień od 2 do ostatniego ma cel od wujka (nowy `silnik/cele.py`, dane w `dane/zeszyt.yaml: cele`
z `{wartosc, pewnosc, zrodlo}`) oraz 2–3 zadania będące decyzjami (razem 3–4). Dziewięć nowych warunków „zmiana”
w `zeszyt-warunki.js` (zeszyt odhacza je sam, gdy decyzja różni się od poprzedniej rundy). Cel rozlicza
`silnik/runda.py` po zamknięciu tygodnia; wynik („✓ osiągnięty”/„✗ nie tym razem”) jest w zeszycie w następnej rundzie
(`api/zeszyt.py`, `pulpit/zeszyt.js`, styl w `pulpit.css`). Notatka `dokumentacja/funkcje/Cel-tygodnia.md`, README i INSTRUKCJA.

**Tabela tydzień → zadania i cel**
| Tydz. | Zadania | Cel |
|---|---|---|
| 2 | pieczywo, mięso i towar, Pracownia Analiz | sprzedać 150 dań |
| 3 | mięso u producenta, promocja, coś dla zespołu | sprzedać 300 dań |
| 4 | zmienić cenę/menu/zespół po tabeli, polisa, higiena | obsłużyć ≥80% chętnych |
| 5 | ulotki, więcej towaru na wydarzenie, nowa cena dania | więcej dań niż tydzień wcześniej |
| 6 | bazar, lokata, spłata części długu | tydzień na plusie |
| 7 | szkolenie, reklama w internecie, podwyżka/umowa | sprzedać 600 dań |
| 8 | danie specjalne, radio/billboard, detektyw + cena | większy przychód niż tydzień wcześniej |
| 9 | zmiana najsłabszego dania, drugi lokal?, święto | obsłużyć ≥85% chętnych |
| 10 | stoisko na festynie, gdzie tłum, więcej towaru | sprzedać 800 dań |
| 11 | drugie danie specjalne, cena dania, premia/umowa | tydzień na plusie |
| 12 | obniżyć koszt stały, nowa cena, więcej towaru | więcej dań niż tydzień wcześniej |
| 13 | odświeżyć reklamę, podwyżka/umowa, zmiana dania | sprzedać 900 dań |
| 14 | zespół przed grudniem, więcej towaru, koszt stały | obsłużyć ≥90% chętnych |
| 15 | spłata długu, nowa cena, reklama | większy przychód niż tydzień wcześniej |
| 16 | mniej towaru na święta, premia/umowa, zmiana dania | sprzedać 1000 dań |
| 17 | mniej towaru, spłata długu, koszt stały | tydzień na plusie |
| ostatni | mniej towaru, spłata, koszt stały | obsłużyć ≥85% chętnych |

**Boty `balans.symuluj 12 sredni 7,11,23`, średnia gotówka poziomu średniego:** bez nagrody (mnożnik 1,0) 64 229 zł,
z nagrodą (1,03) 65 985 zł (+2,7%). Ziarno 7 po zmianie: zrównoważony 100 337, naśladowca 81 395, tani 78 772,
premium 51 788, agresywny 17 493 (układ sił bez zmian). Nagroda jest mała i nie psuje balansu.

**Dowody:**
- `silnik.dane sprawdz` → `Dane w porządku: ... (wersja 5f03bce4a321).`
- `ruff check .` → `All checks passed!`
- `pytest testy/aplikacja/test_zeszyt.py` → `21 passed`; `testy/rdzen/test_cele.py` → `15 passed`
- pełne testy → `1 failed, 916 passed in 334.79s`; jedyny fail `test_w_kodzie_silnika_nie_ma_liczb_gry` (liczba 5 w `min_length`
  schematu celu) naprawiony; po poprawce `test_dane.py` + `test_cele.py` → `32 passed`. `test_kasyno` nie zawiódł.

**Odchylenia od briefu:** nagroda to +3% popytu na 1 tydzień (Efekt „popyt”), nie „opinia ▲” (brak bezpiecznego
punktu zaczepienia bez nowej mechaniki); widok w `api/zeszyt.py` (osobne funkcje), nie w `prezentacja.py`; w tygodniu 2
scalono zadania, „wystrój” (t.4) i „wyniki” (t.3) wypadły z listy tygodnia. „Mniej towaru” wymaga zamówienia
niezerowego i mniejszego od poprzedniego. Bez sprawdzenia w przeglądarce.

**Propozycje:** progi dań dla drużyn z wieloma lokalami (dziś pod jeden lokal); cel „opinia ▲” po decyzji szefa.
