# Losowanie drużyn i kartki z hasłami

- **Stan:** w grze (podróż 04, wątek kreator, Z47, 24.11.2026)
- **Gdzie w grze:** panel mistrza gry `/mg/` ▸ Nowa gra ▸ krok 2 „Drużyny i boty”; po „Utwórz grę” strona kartek

## Dla ucznia (do instrukcji)
Nauczyciel losuje, kto z kim gra. Dostajesz kartkę z loginem i hasłem – zaloguj się nią na stronie gry i wejdź do swojej
drużyny. Hasło przepisuj uważnie: w nim nie ma liter „l” i „o” ani cyfr „1” i „0”, żeby ich nie pomylić.

## Zasada działania
- Mistrz gry wkleja imiona i nazwiska (po jednym w linii) i/albo zaznacza istniejące konta uczniów.
- „Rozlosuj” dzieli ich losowo i po równo między drużyny uczniów (różnica najwyżej 1; np. 13 osób w 4 drużynach to 4, 3, 3, 3).
  W drużynie najwyżej 4 osoby. Wynik widać przed utworzeniem gry; można losować ponownie i ręcznie przenieść ucznia.
- Przy „Utwórz grę” serwer zakłada brakujące konta (login z imienia i nazwiska, losowe hasło) i dopisuje uczniów do drużyn.
- Strona kartek: nagłówek z nazwą drużyny, pod nim kartki do wycięcia (uczeń, login, hasło, adres logowania), linia cięcia.
  Druk A4 czarno-biało, każda drużyna zaczyna nową stronę. Konta istniejące mają „dotychczasowe” zamiast hasła.
  Dotychczasowa tabela haseł zostaje w panelu gry (zakładka Drużyny) jako widok na ekranie; jej okno ma też „Drukuj kartki”.
- Przyciski kroków kreatora są przypięte do dołu ekranu.
- Kod: `konta/druzyny.py: rozlosuj`, API `POST /api/losowanie`, pole `sklad` w `POST /api/gry`
  (`api/widoki.py: _sklad_z_zapytania, _zaloz_sklad`), `panel_mg/static/mg/pulpit.js`, `kartki.js`, `kartki.css`.

## Liczby i źródła
Brak liczb gry. Limit 4 osób w drużynie: `konta/druzyny.py: MAKS_CZLONKOW`; do 60 nowych kont naraz.

## Czego uczy (do planu zajęć)
- pojęcia: losowy dobór, równy podział zadań w zespole, odpowiedzialność za dane logowania
- pytania do omówienia: czym różni się zespół dobrany losowo od dobranego samodzielnie? Co zyskuje, a co traci firma?
- krótkie zadanie dla drużyn: ustalcie w 5 minut podział ról w firmie.

## Do promocji
„Klasa w minutę podzielona na firmy: losowanie, konta i kartki z hasłami gotowe.”

## Nawiązanie literackie
Lalka (Prus): spółka Wokulskiego i Suzina powstaje z ludzi, których zestawił przypadek i rachunek.
