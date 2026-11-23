# Zestawy lekcji: przejście do następnej lekcji w tej samej grze

- **Stan:** w grze (podróż 03, wątek zestawy, Z46, 23.11.2026)
- **Gdzie w grze:** panel mistrza gry `/mg/` ▸ gra ▸ zakładka „Funkcje” ▸ ramka „Zestaw funkcji tej gry”; zeszyt wujka
  ▸ „Od tego tygodnia otwarte”

## Dla ucznia (do instrukcji)
Z lekcji na lekcję w grze przybywa możliwości. Nie zaczynacie od nowa: Wasza firma, pieniądze i wyniki zostają, a wujek
w liście ogłasza, co nowego się otworzyło („Nowa funkcja: …”). Nowa funkcja pojawia się w menu, a od tego tygodnia sami
o niej decydujecie, zamiast zostawiać ją grze.

## Zasada działania
- Nauczyciel jako mistrz gry między rundami wybiera następny zestaw funkcji (lista z `dane/funkcje.yaml: zestawy`,
  z opisem) i potwierdza „Zmień zestaw od następnej rundy”.
- Zmiana **tylko odsłania**: wyłączona → zakryta → odkryta. Funkcji już odkrytych nowy zestaw nie chowa; okno
  potwierdzenia pokazuje, co dojdzie i co mimo zestawu zostaje odkryte.
- Zmiana działa od bieżącej, jeszcze nieprzeliczonej rundy. Historia zmian jest w konfiguracji gry (`zmiany_funkcji`),
  więc rundy już przeliczone liczą się tak samo jak wtedy. Odrzucona w zakończonej grze.
- Funkcja wyłączona na starcie, a otwarta zmianą, otwiera też swoje elementy harmonogramu odblokowań od rundy zmiany.
- Kod: `silnik/funkcje.py: zmien_zestaw`, `silnik/gra.py: ustaw_zestaw`, API `POST /api/gry/<id>/prowadzenie`
  `{"zestaw": klucz}`, panel `panel_mg/static/mg/mg.js`, ogłoszenie `api/zeszyt.py: _nowe_funkcje`.

## Liczby i źródła
Brak własnych liczb. Zestawy i ich opisy: `dane/funkcje.yaml` (decyzja autora 23.11.2026, Z46).

## Czego uczy (do planu zajęć)
- pojęcia: rozwój firmy etapami, decyzja o zakresie działalności, specjalizacja a rozszerzanie oferty
- pytania do omówienia: co zyskujemy, gdy sami prowadzimy zaopatrzenie, zamiast zostawić je automatowi? Kiedy warto
  poszerzyć działalność?
- krótkie zadanie dla drużyn: wskażcie nową funkcję z listu i zapiszcie, co zrobicie z nią inaczej niż w zeszłym tygodniu.

## Do promocji
„Jedna firma, pięć lekcji: z tygodnia na tydzień dochodzą nowe możliwości.”

## Nawiązanie literackie
Lalka (Prus): Wokulski rozwija interes krok po kroku, dokładając kolejne rodzaje handlu, a nie zaczynając od nowa.
