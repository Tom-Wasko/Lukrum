# Wątek: radio (podróż 04)

## Brief
- **Kontynuacja `04/dzwieki`** (ten sam wyko). Gałąź bazowa: `podroz-04` (tryb autonomiczny; ma scalone 04/okna
  i 04/dzwieki). Najpierw `git merge podroz-04`. Równolegle nikt nie pracuje.
- **Cel (Z50, decyzja szefa 23.11):** „przycisk radia dziś nic nie robi; zamiast niego ikona radia obok kaski; nie ma
  okna radia: kliknięcie wysuwa retro radio, na którym bezpośrednio zmienia się stacje; gdy radio gra, gwar cichnie”.
- **Do zrobienia:**
  1. **Naprawa:** ustal, czemu przycisk radia na pasku pulpitu (`pulpit/pulpit.js`, akcja `pp-radio`, `przelaczRadio`
     z `pulpit/radio.js`, panel `#pp-radio-panel`) nic nie robi; opisz przyczynę w raporcie.
  2. **Ikona radia obok kaski** (kaska = licznik pieniędzy gracza na pulpicie; jeśli to nie jest jednoznaczne w kodzie,
     wybierz miejsce przy liczniku pieniędzy i opisz w raporcie). Pozycja radia w lewym pasku znika (pozycja w ⚙ zostaje).
  3. **Wysuwany retro odbiornik zamiast okna/szuflady:** kliknięcie ikony wysuwa (animacja, szacunek dla
     `prefers-reduced-motion`) rysunek odbiornika z nutką PRL (skala stacji, gałka strojenia, gałka głośności,
     włącznik). Stacje zmienia się **bezpośrednio na odbiorniku** (gałka/skala, klik i klawiatura), bez okna `okno()`.
     Ponowny klik albo Esc chowa. Logika stacji, prowadzącego, „Lalki” i szumu bez zmian.
  4. **Gwar cichnie przy radiu:** gdy radio gra, `lukrum.dzwiek.przycisz(true)`, po zatrzymaniu `przycisz(false)`.
- **Nie ruszaj:** `dane/radio.yaml` i plików MP3, okien (`swiat/okna*.css`), mechaniki. Kolory tylko ze zmiennych,
  3 palety × jasny/ciemny, „wysoka” ≥ 7:1, stan nie samym kolorem (▶ ■ ♪), działa na telefonie (dotyk, szerokość 375).
  Rysunek odbiornika własny (CSS/SVG), bez kopiowania cudzych grafik.
- **Testy:** test węzłowy/aplikacji: ikona jest w pulpicie, klik otwiera odbiornik, zmiana stacji na odbiorniku,
  `przycisz` wołane przy starcie i zatrzymaniu radia.
- **Zrzuty:** port 8782, `C:/Users/PC/Pulpit/lukrum/_robocze/zrzuty-radio/`: odbiornik schowany i wysunięty, bar jasny,
  pewex ciemny, wysoka ciemny, 1366×768 i 375×812. Po pracy zatrzymaj serwer.
- **Gotowe, gdy:** jak wyżej; INSTRUKCJA i README (gdzie jest radio); notatka `dokumentacja/funkcje/radio-fala-koziolka.md`
  uzupełniona; pełne testy zielone, `ruff`, `node --check`, `silnik.dane sprawdz` (wyniki w raporcie).
- **Archi:** archi-lukrum.

## Raport
