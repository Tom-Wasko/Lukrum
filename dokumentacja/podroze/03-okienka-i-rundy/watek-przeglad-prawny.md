# Wątek: przeglad-prawny (podróż 03)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/03-okienka-i-rundy/wspolne.md`. Są tam zasady, testy i commity.
  Gałąź bazowa: `podroz-03`. Równolegle pracuje tylko `03/pora`.
- **Cel (część Z23):** lista kontrolna przed pokazaniem gry w szkole i w konkursie. Robisz tylko te części Z23,
  które nie wymagają decyzji szefa ani prawnika.
- **Do zrobienia:**
  1. **Prawdziwe nazwiska i firmy.** Wyszukaj w internecie (WebSearch), czy istnieją prawdziwe osoby albo firmy
     o nazwach użytych w grze. Na pewno sprawdź: Jakub Klimek-Ślęzak, Zenon Lupa, e-Księgi24.pl. Przejdź też po
     postaciach i firmach w `gra/dane/` (zdarzenia, mapa, rynek pracy, agencje).
     - Trafienie to prawdziwa, rozpoznawalna osoba albo działająca firma o tej samej nazwie w Polsce. Zmień wtedy
       nazwę na wymyśloną, w danych i w testach.
     - W raporcie tabela: nazwa → co znaleziono (z odnośnikiem) → zmienione na.
  2. **Lista kontrolna.** Sprawdź poleceniami (grep):
     - brak nazw, mechanik i wzmianek o innych grach biznesowych w repo;
     - `ikony_marek.js` bez prawdziwych logo;
     - stopki i autorstwo grafik oraz fontów: wykaz w nowym pliku `dokumentacja/wiedza/wykaz-grafik-i-fontow.md`
       (plik → źródło → licencja; fonty z `fonty/`; mapa: ODbL i OpenStreetMap z podpisem w grze);
     - czy `INSTRUKCJA.pdf` zgadza się z `INSTRUKCJA.md` (wygeneruj ponownie `manage.py instrukcja_pdf`, jeśli nie).
     Wynik zapisz w `dokumentacja/wiedza/lista-kontrolna-przegladu.md`: punkt → polecenie → wynik → ✓ albo !.
  3. **Stałe ze starego projektu.** Jeśli `Zadania.md` (Z23) albo `wiedza/` opisuje, jak sprawdzić „stałe wspólne
     z dawnym projektem”, zrób to i zapisz wynik. Nic nie zmieniaj, jeśli zmiana dotyka liczb gry: wpisz to do raportu.
- **Nie ruszaj:** liczb w `dane/` (nazwy możesz zmieniać), `silnik/` poza tekstami z nazwami,
  `panel_gracza/static/swiat/*`, bo pracuje tam `03/pora`. Nie pisz notek prawnych do instrukcji (progi PIP, ZUS,
  lichwa): to czeka na prawnika.
- **Zasady:** sam niczego nie oceniasz prawnie, tylko zbierasz fakty ze źródeł z odnośnikami. Zero wzmianek o innych
  grach biznesowych także w raporcie: tam, gdzie coś znajdziesz, podaj plik i linię, bez cytowania nazwy.
- **Gotowe, gdy:**
  - Tabela nazwisk jest gotowa, a trafienia zmienione.
  - Lista kontrolna i wykaz grafik są w repo.
  - Po zmianach danych `silnik.dane sprawdz` jest czysty.
  - Pełne testy są zielone.
- **Zrzuty ekranu:** nie.

- **Z pierwszej próby (sesja padła na złym katalogu, 23.11 07:10):**
  - Wyszukiwanie w sieci nie znalazło prawdziwych osób ani firm: Klimek-Ślęzak, Lupa, e-Księgi24.pl, Sokole Oko
    i inne. Jedyne podobne to „Debet/Credit” z Krakowa (inna pisownia, inne miasto).
  - Nazwisk nie zmieniasz. Wpisz tę tabelę do raportu (krótko uzupełnij odnośniki).
  - `ikony_marek.js` ma sekcję LOGA z „uproszczonymi znakami prawdziwych marek”: opisz to w liście kontrolnej jako !,
    nic nie usuwaj.
  - **Nie wychodź poleceniem `cd` poza swój worktree** (do `_archiwum/` ani wyżej). `_archiwum` czytaj narzędziem
    Read, z pełną ścieżką.

## Raport
