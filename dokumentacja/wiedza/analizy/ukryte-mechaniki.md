# Ukryte mechaniki (Z42, zgłosił majster)

Zasada: każdy skutek w grze ma być widoczny dla gracza. Spis zrobiony przeglądem kodu (23.11.2026, wątek 03/tlok):
mechanika → gdzie liczona → czy i gdzie gracz to widzi → propozycja pokazania. Wiersze 1–2 pokazał wątek tłok, wiersze 3–13 wątek ukryte (23.11.2026, Z42): zmieniło się tylko pokazanie, mechaniki bez zmian.

| # | Mechanika | Gdzie liczona | Czy gracz widzi | Propozycja pokazania | Pokazane: gdzie (plik/ekran) |
|---|---|---|---|---|---|
| 1 | **Tłok obniża opinię** (nowe) | `silnik/rynek/opinie.py` (`kara_za_tlok`, powód `tlok`), obciążenie dnia z `silnik/rynek/popyt.py` | tak: wnętrze kebaba (kolejka + „Tłok: duży ▲”), księga gości (wiersz „Czekanie”), tabela opinii w Klientach (kolumna „Tłok”) | zrobione | tak (wątek tłok) |
| 2 | **Wyposażenie podnosi opinię** (istniało, było niewidoczne z nazwy) | `opinie.py` (powód `wyposazenie` = `mnoznik_wyposazenia` + dekor) | tak: księga gości, wiersz „Wnętrze”; kolumna „Wyposażenie” w Klientach | zrobione (opis w `funkcje/Tlok.md`) | tak (wątek tłok) |
| 3 | Zaufanie do oceny (`W/(W+n0)`): mało opinii = ocena słabo działa na popyt | `opinie.py: zaufanie, mnoznik` | częściowo: „Mnożnik popytu” w tabeli, bez wyjaśnienia dlaczego nowy lokal go nie ma | podpowiedź „Za mało opinii, ocena jeszcze nie działa na gości” przy mnożniku | księga gości: zdanie „Mało opinii…” z % siły oceny (`swiat/ksiega.js`); Klienci ▸ opinie, lista pod tabelą (`zakladki/klienci.js`) |
| 4 | Zanik starych opinii (×0,6 co tydzień) | `opinie.py: po_rundzie` | opis w stopce tabeli, bez liczb | pasek „waga opinii” albo zdanie w księdze gości | księga gości: „Stare opinie liczą się co tydzień na 60% wagi” (`swiat/ksiega.js`) |
| 5 | Nasycenie wyposażenia (kolejna sztuka działa słabiej) | `silnik/kuchnia/jakosc.py: mnoznik_wyposazenia` | nie | w sklepie z wyposażeniem: „kolejne takie samo daje mniej” | Park handlowy ▸ wyposażenie: „▼ każda kolejna sztuka słabiej”, +% teraz kontra bez nasycenia (`zakladki/inwestycje.js`, `v.wyposazenie_efekt`) |
| 6 | Wrażliwość grup na cenę i czekanie (studenci vs biurowi) | `silnik/rynek/klienci.py: wagi_oceny, wrazliwosc` | częściowo: zakładka Klienci pokazuje grupy | przy powodzie „Czekanie”: „biurowi znoszą kolejki gorzej” | księga gości: „Goście tego lokalu źle znoszą czekanie (waga …)” (`swiat/ksiega.js`, `opinie.czekanie_grup`) |
| 7 | Zmęczenie załogi → miny, tempo, pomyłki | `silnik/kuchnia/operacje.py`, `wnetrza/stan.py: mina` | tak: miny; nie widać wprost skutku w pomyłkach | w HR przy osobie: „zmęczenie → więcej pomyłek” (jest „skłonność do pomyłek”) | HR ▸ profil osoby: „▲ Zmęczenie… rośnie ryzyko pomyłek” (`zakladki/hr.js`, `v.progi_czasu_pracy.zmeczenie`) |
| 8 | Rozruch nowego lokalu (mniej gości w pierwszych tygodniach) | `silnik/rynek/popyt.py: rozruch` | tak: w ofercie/ogólne | sprawdzić, czy komunikat jest w kebabie | OK, widać w Ogólne (`zakladki/ogolne.js: rozruchHtml`) i w prognozie oferty (`zakladki/oferta.js`) |
| 9 | Świeżość i straty składników (partie, chłodnia, sanepid) | `silnik/kuchnia/swiezosc.py`, `magazyn.py` | tak: dostawcy, ikony sanepidu | OK; dodać do księgi gości powód „Świeżość” | księga gości: zdanie o świeżości przy Smaku (`swiat/ksiega.js`); straty w Zaplecze ▸ Świeżość (`zakladki/swiezosc.js`) |
| 10 | Zamiana dania (brak składnika → gość bierze zamiennik albo odchodzi) | `silnik/kuchnia/menu.py` | częściowo: „BRAK” na tablicy, bez liczby, ilu odeszło | wiersz „Przeszli na inne danie / odeszli” w wynikach | OK, widać w Zaplecze ▸ Świeżość: tabela „Wzięli inne danie / Odeszli” (`zakladki/swiezosc.js: wynikiMenu`) |
| 11 | Nasycenie reklamy | `silnik/rynek/reklama.py` | w marketingu | OK | OK, widać w Marketing: kolumna z liczbą emisji i nasyceniem w % (`zakladki/marketing.js`) |
| 12 | Udogodnienia dla załogi (benefity) → nastrój → praca | `silnik/runda.py` (`_procent_lokali`), zadowolenie | nastrój tak, związek przyczynowy nie | w zakładce Zespół: „benefity +X nastroju” | HR ▸ udogodnienia: tabela „Ile udogodnienia dały nastrojowi” i składniki nastroju w profilu osoby (`zakladki/hr.js`, `pracownicy[].skladniki`) |
| 13 | Losowość opinii (rozrzut ÷ √n) | `opinie.py` | nie | zdanie „przy kilku opiniach ocena skacze” | księga gości: „±0,1 ★ przez przypadek” (`swiat/ksiega.js`, `opinie.rozrzut`) |

## Uwagi
- Wiersze 3–13 są pokazane w grze; żadna nie zmienia mechaniki, tylko pokazuje jej skutek (notatka: `funkcje/Widoczne-skutki.md`).
- **Wyposażenie a karty sprzętu:** `boty.yaml` („+0,06 karty”) mówi o wyniku końcowym (karta firmy), nie o ocenie
  gości. Do oceny wyposażenie wchodzi jednym kanałem (`opinie.py`, powód `wyposazenie`), a „udogodnienia” (benefity
  załogi) działają tylko przez nastrój załogi, więc nic nie liczy się dwa razy.
