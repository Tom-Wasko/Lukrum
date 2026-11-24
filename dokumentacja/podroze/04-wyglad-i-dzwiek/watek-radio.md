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

**Przyczyna „przycisk radia nic nie robi”.** Panel otwierał się poprawnie (sprawdzone w Chrome bez okna). Radio „milczało”
z dwóch powodów: (1) gdy `audio.play()` został odrzucony (przeglądarka, brak gestu), kod wyłączał radio bez żadnego
komunikatu, więc klik wyglądał na martwy; (2) przy zmianie stacji stary `play()` kończył się `AbortError` po `pause()`
i też wyłączał radio. Teraz `AbortError` jest ignorowany, a inna porażka daje napis „Nie udało się zagrać. Kliknij
„Włącz” jeszcze raz.”.

**Zrobione**
- Ikona radia (`.pp-radio-ik#pp-radio`) **obok portfela** (kaski): tak wybrano, bo to dolny róg, gdzie nic nie zasłania
  mapy; pozycja w lewym pasku zniknęła z `IKONY_PASKA`, pozycja w ⚙ zostaje. Przy ikonie ♪, gdy radio gra.
- Wysuwany retro odbiornik zamiast okna (`<aside class="odb">`, własny rysunek CSS): skala stacji ze wskazówką, gałka
  strojenia, gałka głośności, włącznik (▶ Włącz / ■ Wyłącz), ekranik „Na antenie ♪”, antena. Stacje zmienia się
  klikiem w skalę, gałką (±1, z zawijaniem) i strzałkami ← →. Ponowny klik w ikonę albo Esc chowa (radio gra dalej).
  `prefers-reduced-motion`: bez animacji. Telefon (≤760 px): odbiornik na całą szerokość, bez anteny.
- Gdy radio gra: `lukrum.dzwiek.przycisz(true)`, po zatrzymaniu `przycisz(false)`.
- Nieruszane: `dane/radio.yaml`, MP3, `swiat/okna*.css`, logika stacji/prowadzącego/„Lalki”/szumu.
- Pliki: `static/pulpit/{radio.js,pulpit.js,pulpit.css}`, testy `test_radio.py`, `test_pulpit.py` (3 zmienne ustawiane
  ze skryptu: `--n --i --kat`), nowy `radio_zachowanie.mjs`; `INSTRUKCJA.md`, `README.md`, `radio-fala-koziolka.md`.

**Dowody**
- `pytest testy/aplikacja/test_radio.py testy/aplikacja/test_pulpit.py` → `92 passed`
- pełne: `pytest -q -p no:cacheprovider` → `979 passed in 366.35s (0:06:06)`
- `ruff check .` → `All checks passed!`; `silnik.dane sprawdz` → `Dane w porządku`; `node --check` radio.js, pulpit.js,
  radio_zachowanie.mjs → ok
- test węzłowy (prawdziwy `radio.js` ze stubem DOM): ikona otwiera odbiornik, klik/gałka zmieniają stację (z zawinięciem),
  `przycisz` wołane z `true` przy starcie i `false` przy stopie.
- Zrzuty (poza gitem): `C:/Users/PC/Pulpit/lukrum/_robocze/zrzuty-radio/` (12 plików: bar jasny, pewex ciemny, wysoka
  ciemny × schowany/wysunięty × 1366×768 i 375×812). Serwer 8782 zatrzymany.

**Uwagi / propozycje**
- Po ostatnim zrzucie skróciłem wskazówkę skali do wysokości skali (była za długa); tej drobnej poprawki nie ma na zrzutach.
- `INSTRUKCJA.pdf` nie jest odświeżony (generowany osobno).
- Propozycja: dźwięk „pstryknięcia” przy włączniku i obrocie gałki.
