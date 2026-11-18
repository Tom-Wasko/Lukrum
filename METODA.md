# Jak powstał LUKRUM (metoda pracy i jawność użycia AI)

> Szkic do akceptacji autora i rozmowy z opiekunem projektu (kapitanem). Nie jest jeszcze częścią zgłoszenia.

## Autor i zespół
LUKRUM jest pomysłem i projektem jednego autora: cele gry, mechaniki, wygląd, teksty, nawiązania
literackie i wszystkie decyzje podejmuje autor. Nauczyciel jest opiniodawcą od strony lekcji i konkursu. Mapę Lublina
przygotował kolega autora wraz z własnymi narzędziami AI.

## Jak użyto sztucznej inteligencji
Kod, dane i dokumentację pisze asystent AI (Claude, Anthropic) w ramach zespołu: autor decyduje, asystent-lider
rozpisuje zadania, pomocnicze agenty je wykonują, a każdą zmianę sprawdzają testy automatyczne (ponad 700) i druga,
niezależna kontrola. Autor czyta i zatwierdza ustalenia, a wszystkie decyzje zapisane są w notatkach projektu
(`Decyzje`, `Do decyzji`). Podział pracy opisuje `warsztat/ZESPOL.md`.

## Co jest dziełem człowieka, a co AI
| Obszar | Człowiek | AI |
|---|---|---|
| Pomysł, cele edukacyjne, zasady gry | autor | doradztwo, warianty |
| Liczby i realia (prawo, ceny, Lublin) | autor wskazuje źródła | zbiera, przelicza, sprawdza testami |
| Teksty i nawiązania literackie | autor akceptuje | projekty tekstów |
| Kod, grafiki SVG, testy | autor zatwierdza | pisze i sprawdza |
| Mapa Lublina | kolega autora | jego narzędzia |

## Czego jeszcze nie wiemy
Aktualny regulamin konkursu „Zwolnieni z Teorii” nie został jeszcze przeczytany w całości (strona organizatora
blokuje automaty). Czy i jak trzeba ujawniać użycie AI, ustala autor z kapitanem i organizatorem: pytania zebrane są
w `notatki/Analizy/Regulamin ZwzT a AI.md`. Ten plik zostanie dopasowany do odpowiedzi.

## Dane i prawo
Mapa pochodzi z OpenStreetMap (licencja ODbL). Nazwy marek, osób i lektur: zasady opisuje `notatki/Decyzje.md`
(„Marki i prawo”). Gra jest symulacją edukacyjną, nie poradą prawną ani inwestycyjną.
