# Sklepy, hurtownie i piętra biurowca

- **Stan:** w grze (podróż 02, wątek „sklepy”, 22.11.2026)
- **Gdzie w grze:** każdy sklep i hurtownia (Hurtownie, Park handlowy), biurowiec przy Zana, Mój kebab (rożen)

## Dla ucznia (do instrukcji)
Każdy sklep pokazuje tylko to, co sam ma na półkach. Klikasz alejkę, na przykład „Pieczywo”, i w okienku widzisz tylko
pieczywo: ceny z tego sklepu, ile już masz w magazynie i ile włożono do koszyka na ten tydzień. Ilość wpisujesz
przy towarze. Nic nie jest kupione, dopóki nie wyślesz decyzji. Gdzie taniej, sprawdzisz w zeszycie wujka, a nie
w sklepie. Hurtownia sprzętu działa tak samo: stanowisko albo sprzęt, który klikniesz, ma własne okienko
z trzema jakościami do wyboru, a to, co już stoi w kuchni, jest oznaczone „masz już”.

W biurowcu przy Zana winda wiezie na piętro, a piętro pokazuje ofertę jednej agencji: drukarnia ulotki, radio billboard
i spot, agencja eventowa festyny. Rożen w kebabie pokazuje, jaki sprzęt już masz i w jakim jest stanie. Nowy kupisz
w Parku handlowym. Z kebaba nie da się tam wejść na skróty: okienko tylko podpowiada, dokąd iść, i pokazuje mapę.

## Zasada działania
- Okienko sklepu korzysta z tych samych zamówień co dawny ekran dostawców (decyzja `zamowienia`, bez zmian w silniku).
  Pokazuje działy wskazane przez punkt sceny (`teczka.dzialy`), ceny jednego dostawcy i pasek „W koszyku”.
- Porównania sklepów w okienku nie ma. Zostaje w zeszycie wujka.
- Pozycje sprzętu: punkt sceny hurtowni ma listę nazw z `dane/sprzet.yaml`; okienko pokazuje tylko te, z jakością
  do wyboru i stanem „masz już” / „w koszyku”.
- Piętro biurowca ustawia filtr na jedną agencję z `dane/mapa/reklama.yaml`; filtr działa tylko w tym wnętrzu.
- Odesłania z kebaba (Park, Pracownia Analiz, Szkoła Kebabu) to informacja i przycisk „Pokaż na mapie”.
- Żaden punkt wnętrza nie otwiera osobnej karty: wszystko jest oknem nad wnętrzem.

## Czego uczy (do planu zajęć)
- pojęcia: oferta dostawcy, cena jednostkowa i rabat ilościowy, koszyk zamówień, zapas w magazynie, planowanie zakupów
- pytania do omówienia: po co sprawdzać zapas, zanim się zamówi? Czym różni się tani i drogi sprzęt w całym okresie
  używania? Dlaczego reklama w jednej agencji nie zastępuje drugiej?
- krótkie zadanie dla drużyn: zaplanujcie zamówienie na tydzień z dwóch różnych działów i uzasadnijcie ilości.

## Do promocji
„Jeden sklep, jedna półka, jedna decyzja. Wiesz, co kupujesz i skąd.”

## Nawiązanie literackie
„Lalka” (Prus): sklep Wokulskiego, w którym towar, cena i klient układają się w jedną rozmowę przy ladzie.
