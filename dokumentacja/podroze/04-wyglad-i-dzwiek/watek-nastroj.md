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
