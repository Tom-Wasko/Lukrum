# Wątek: paragon (podróż 03)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/03-okienka-i-rundy/wspolne.md`. Są tam zasady, makiety, testy i commity.
- **Cel:** okienko zakupów w sklepach i hurtowniach wygląda jak paragon kasowy (Z34, wariant A). Po zakupie ten sam
  format paragonu potwierdza, co kupiono.
- **Ustalone:**
  - Po wątku 02/sklepy każdy sklep ma własną teczkę z filtrem `dostawca` i działem:
    `swiat/rysunek.js` (`R.zamow`, `R.koszyk`) i `zakladki/dostawcy.js`.
  - Hurtownia sprzętu jest w `zakladki/inwestycje.js`.
  - Logika zamówień (decyzja `zamowienia`) zostaje bez zmian. Zmieniasz wygląd i układ okienka.
- **Decyzje szefa (`dokumentacja/Decyzje.md`, 22.11):**
  - Zakupy to **wariant A (paragon kasowy)**.
  - Majster dodał: „też format paragonu”:
    - pozycje w kolumnie jak na paragonie (nazwa, ilość × cena, kwota);
    - suma na dole;
    - data i nazwa sklepu w nagłówku;
    - krój o stałej szerokości.
  - Okienko pokazuje tylko ofertę tego sklepu i działu. Widać w nim, co jest już w koszyku i co już kupione w tej rundzie.
  - Bez porównań z innymi sklepami.
- **Pliki do zmiany:**
  - `swiat/rysunek.js` (części zakupowe), `zakladki/dostawcy.js`, `zakladki/inwestycje.js`;
  - sceny sklepów i hurtowni w `swiat/sceny/`: biedronka, lidl, auchan, stokrotka, makro, selgros, eurocash, bazar,
    piekarnia, sprzet_gastro, park_handlowy;
  - style sklepu;
  - testy w `gra/testy/swiat` i `gra/testy/aplikacja`.
- **Nie ruszaj:**
  - `zakladki/zdarzenia.js`, `swiat/sceny/park.js`, `swiat/sceny/poczta.js`;
  - `pulpit/*`, `zakladki/wujek.js`, `mapa/*`, `swiat/sceny/zana_*`;
  - sceny kebaba (lada, rożen), poza samym okienkiem zakupu.
- **Gotowe, gdy:**
  - Każdy sklep i hurtownia otwiera paragon ze swoją ofertą.
  - Dodawanie i usuwanie pozycji działa.
  - Po zakupie pokazuje się paragon potwierdzenia.
  - Wygląd działa w 3 paletach, każda w trybie jasnym i ciemnym.
  - Pełne testy są zielone.
- **Dokumenty:** README i INSTRUKCJA, jeśli opisują zakupy.

## Raport
