# Wątek: nastroj (podróż 04, Z14)

## Brief
- **Najpierw przeczytaj:** `gra/silnik/wnetrza/stan.py` (`nastroj()`, `wskazniki()`: `nastroj_zespolu`), `gra/silnik/wnetrza/schematy.py`,
  `gra/silnik/wnetrza/dymki.py`, `gra/panel_gracza/static/swiat/rysunek.js` (`R.osoba`, parametr `mina`: dobra|zwykla|zla|zmeczona),
  `swiat/sceny.js` (kebab: `obsluga[].mina`), `swiat/swiat.css` (reguły `data-mina`), `dokumentacja/Wyglad.md`.
- **Cel (Z14; szef 25.11: „tylko nastrój zespołu na twarzach”):** postacie zespołu (obsługa kebabu i inni pracownicy widoczni
  w scenach drużyny) mają minę zależną od nastroju, który już liczy silnik (zadowolenie → skala 0–100 w `dane/wnetrza/silnik.yaml: nastroj`).
  1. Ustal, gdzie mina jest już ustawiana, a gdzie sztywna; spraw, by każda postać pracownika w scenach drużyny brała minę z nastroju
     (progi w danych `dane/wnetrza/silnik.yaml`, nie w kodzie).
  2. Stan nie samym kolorem: mina to kształt twarzy; w palecie wysokiej i w ciemnych musi być czytelna. Jeśli brakuje wariantów min
     w rysunku postaci, dorysuj tylko te (`mina-zla`, `mina-zmeczona`) w stylu istniejących.
  3. Dymek/opis (aria-label lub podpis przy postaci) mówi słowami, jak się czuje osoba (np. „zmęczona obsługa”: formy neutralne płciowo).
- **BEZ:** mechaniki gry, wydarzeń dla filii, popytu z mapy, zmian wzorów silnika. Tylko prezentacja nastroju, który już jest.
- **Nie ruszaj:** `swiat/sceny/*.js` poza koniecznym podaniem miny, mapy, danych poza progami nastroju.
- **Testy:** test, że nastrój niski/wysoki daje różne miny (JSON widoku sceny albo test jednostkowy); `node --check` zmienionych modułów;
  `testy/swiat`, `testy/wnetrza`, `silnik.dane sprawdz`; na koniec pełne testy i `ruff`.
- **Zrzuty:** port 8790, `gra/narzedzia/zrzuty.py`, do `_robocze/zrzuty-nastroj/`: kebab z obsługą w złym i dobrym nastroju (bar jasny,
  wysoka ciemny). Po pracy zatrzymaj serwer.
- **Gotowe, gdy:** miny zależą od nastroju, zrzuty są, testy zielone (wyniki w raporcie), opis dla gracza 1–2 zdania.
- **Scalanie:** tryb autonomiczny: do `podroz-04`, nie do `main`. Nie pushuj. Nie zaczynaj nic poza briefem.
- **Archi:** archi-lukrum.

## Raport

## Co zrobione
- Silnik już liczył minę z nastroju (`dane/wnetrza/silnik.yaml: miny`: smutna, zmęczona, wesoła, neutralna). Front mapował to źle i obsługa nie miała miny „zła”. Teraz `swiat.js` ma `MINA = { wesola: dobra, zmeczona: zmeczona, smutna: zla }` (neutralna = zwykła).
- Narysowane brakujące warianty „zła” dla kasjerki i kucharza (`narzedzia/grafiki/postacie.py`, SVG przegenerowane: `obsluga-*-zla.svg`, `zestaw.*`, README grafik).
- Opis słowami przy postaci: `aria-label` + `<title>` (dobry / zwykły / zły nastrój w zespole, zmęczone osoby w zespole), neutralnie płciowo (`sceny.js: osobaSvg`).
- Dokumentacja: `INSTRUKCJA.md`, `README.md`.
- Opis dla gracza: „W kebabie nastrój zespołu widać na twarzach: osoby przy ladzie i na kuchni są uśmiechnięte, gdy w zespole jest dobrze, zachmurzone, gdy jest źle, i zmęczone, gdy mają za dużo pracy. Opis słowami jest przy każdej postaci.”
- Commity: 10e5ac0, 4c0b5e5 (gałąź `worktree-podroz-04-nastroj`, bez push).

## Dowody
- `ruff check .` → All checks passed!
- Pełne testy: `1 failed, 1028 passed in 405.00s`. Jedyny błąd: `testy/pieniadze/test_debet_i_przeglad.py::test_debet_w_rozegranej_grze_oplata_tylko_przy_minusie_na_koniec_tygodnia` (AssertionError, runda 7, bot „agresywny”: brak „tydzień na minusie” w opisach). Powtarza się po osobnym uruchomieniu (`1 failed, 6 passed`), więc to nie niestabilność. Moje zmiany nie dotykają silnika ani danych (tylko grafiki, JS, testy front); podejrzenie: wcześniejsze zmiany podróży (np. 152cc76 Z51 dane dostawców / okazje wujka zmieniły przebieg gry bota). Nie naprawiałem (poza briefem).
- Nowe testy: `testy/swiat/test_kebab_wyglad.py` (miny zależą od nastroju + opis słowami; wszystkie miny w rysunku) → przechodzą w pełnym przebiegu.
- Zrzuty: `gra/_robocze/zrzuty-nastroj/` (kebab-bar-jasny-{stan-gry,zla,dobra}.png, kebab-wysoka-ciemny-{zla,dobra}.png; poza gitem). Uwaga: stan realny pokazał „zwykłą”, więc warianty zła/dobra wymuszono w przeglądarce przez `data-mina`.

## Propozycje
- Zbadać padający test debetu na `podroz-04` przed scaleniem do main.
- Dodać test silnik→front: każda mina z `silnik.yaml` ma wpis w `MINA`.
