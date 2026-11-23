# Ukryte mechaniki (Z42, zgłosił majster)

Zasada: każdy skutek w grze ma być widoczny dla gracza. Spis zrobiony przeglądem kodu (23.11.2026, wątek 03/tlok):
mechanika → gdzie liczona → czy i gdzie gracz to widzi → propozycja pokazania. W grze pokazane są tylko skutki
z wątku tłok (wiersze 1–2); reszta to **propozycje do decyzji szefa**.

| # | Mechanika | Gdzie liczona | Czy gracz widzi | Propozycja pokazania |
|---|---|---|---|---|
| 1 | **Tłok obniża opinię** (nowe) | `silnik/rynek/opinie.py` (`kara_za_tlok`, powód `tlok`), obciążenie dnia z `silnik/rynek/popyt.py` | tak: wnętrze kebaba (kolejka + „Tłok: duży ▲”), księga gości (wiersz „Czekanie”), tabela opinii w Klientach (kolumna „Tłok”) | zrobione |
| 2 | **Wyposażenie podnosi opinię** (istniało, było niewidoczne z nazwy) | `opinie.py` (powód `wyposazenie` = `mnoznik_wyposazenia` + dekor) | tak: księga gości, wiersz „Wnętrze”; kolumna „Wyposażenie” w Klientach | zrobione (opis w `funkcje/Tlok.md`) |
| 3 | Zaufanie do oceny (`W/(W+n0)`): mało opinii = ocena słabo działa na popyt | `opinie.py: zaufanie, mnoznik` | częściowo: „Mnożnik popytu” w tabeli, bez wyjaśnienia dlaczego nowy lokal go nie ma | podpowiedź „Za mało opinii, ocena jeszcze nie działa na gości” przy mnożniku |
| 4 | Zanik starych opinii (×0,6 co tydzień) | `opinie.py: po_rundzie` | opis w stopce tabeli, bez liczb | pasek „waga opinii” albo zdanie w księdze gości |
| 5 | Nasycenie wyposażenia (kolejna sztuka działa słabiej) | `silnik/kuchnia/jakosc.py: mnoznik_wyposazenia` | nie | w sklepie z wyposażeniem: „kolejne takie samo daje mniej” |
| 6 | Wrażliwość grup na cenę i czekanie (studenci vs biurowi) | `silnik/rynek/klienci.py: wagi_oceny, wrazliwosc` | częściowo: zakładka Klienci pokazuje grupy | przy powodzie „Czekanie”: „biurowi znoszą kolejki gorzej” |
| 7 | Zmęczenie załogi → miny, tempo, pomyłki | `silnik/kuchnia/operacje.py`, `wnetrza/stan.py: mina` | tak: miny; nie widać wprost skutku w pomyłkach | w HR przy osobie: „zmęczenie → więcej pomyłek” (jest „skłonność do pomyłek”) |
| 8 | Rozruch nowego lokalu (mniej gości w pierwszych tygodniach) | `silnik/rynek/popyt.py: rozruch` | tak: w ofercie/ogólne | sprawdzić, czy komunikat jest w kebabie |
| 9 | Świeżość i straty składników (partie, chłodnia, sanepid) | `silnik/kuchnia/swiezosc.py`, `magazyn.py` | tak: dostawcy, ikony sanepidu | OK; dodać do księgi gości powód „Świeżość” |
| 10 | Zamiana dania (brak składnika → gość bierze zamiennik albo odchodzi) | `silnik/kuchnia/menu.py` | częściowo: „BRAK” na tablicy, bez liczby, ilu odeszło | wiersz „Przeszli na inne danie / odeszli” w wynikach |
| 11 | Nasycenie reklamy | `silnik/rynek/reklama.py` | w marketingu | OK |
| 12 | Udogodnienia dla załogi (benefity) → nastrój → praca | `silnik/runda.py` (`_procent_lokali`), zadowolenie | nastrój tak, związek przyczynowy nie | w zakładce Zespół: „benefity +X nastroju” |
| 13 | Losowość opinii (rozrzut ÷ √n) | `opinie.py` | nie | zdanie „przy kilku opiniach ocena skacze” |

## Uwagi
- Wiersze 3–13 są propozycjami; żadna nie zmienia mechaniki, tylko pokazanie jej skutku.
- **Wyposażenie a karty sprzętu:** `boty.yaml` („+0,06 karty”) mówi o wyniku końcowym (karta firmy), nie o ocenie
  gości. Do oceny wyposażenie wchodzi jednym kanałem (`opinie.py`, powód `wyposazenie`), a „udogodnienia” (benefity
  załogi) działają tylko przez nastrój załogi, więc nic nie liczy się dwa razy.
