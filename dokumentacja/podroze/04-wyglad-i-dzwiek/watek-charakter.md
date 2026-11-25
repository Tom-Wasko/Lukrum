# Wątek: charakter (podróż 04)

## Brief
- **Najpierw przeczytaj:**
  - `dokumentacja/wiedza/analizy/przeglad-wnetrz.md` (cały; Twoje poprawki: P2, P6, P7, P8, P9, P14, P15);
  - `dokumentacja/Wyglad.md`;
  - `gra/panel_gracza/static/swiat/sceny/index.js`;
  - wzory dobrego charakteru: `pierzeja_bankowa.js`, `poczta.js`, `ratusz.js`;
  - powtarzające się szablony: `bank.js` (`?b=`), `park.js` (`?p=`), `biuro_rachunkowe.js`, markety (`auchan.js`, `lidl.js`, `biedronka.js`, `stokrotka.js`, `makro.js`, `selgros.js`, `eurocash.js`), `piekarnia.js`, `park_handlowy.js`;
  - nakładkę z wątku A: `swiat/nakladka.js` (punkty-szyldy i dymki układają się same).
  - Gałąź bazowa: `main`. Zrzuty „przed”: `_robocze/zrzuty-wnetrza/` i `_robocze/zrzuty-nakladka/`.
- **Cel (Z4, wątek C „charakter scen”; szef 24.11):**
  1. **P2:** dół scen zapełniony (podłoga, meble, drobiazgi), przez wspólną paczkę rekwizytów w nowym pliku
     `swiat/rekwizyty.js` (krzesła, kosze, wózki, skrzynki, chodnik, plakat, kwiatek itd., w stylu istniejących rysunków).
  2. **P6:** każdy z 5 banków i każde biuro rachunkowe ma własne wnętrze. Ten sam szablon z innym kolorem nie wystarcza:
     różny układ i jeden charakterystyczny przedmiot. Realia: bank spółdzielczy, oddział w kamienicy, nowoczesna sala itd.
  3. **P7:** parki mają własne tła (drzewa, alejki, ławki, pomnik albo fontanna zgodne z prawdziwym parkiem w Lublinie, ogólnie, bez kopiowania zdjęć).
  4. **P8:** markety mają własne rekwizyty: hurtownia z regałami paletowymi, dyskont z koszami, supermarket z wózkami.
  5. **P9:** więcej PRL tam, gdzie pasuje: urzędy, poczta, hole, piekarnia (lastryko, boazeria, kasetony, neony, plakaty).
  6. **P14:** puste kafelki akcji w piekarni. Jeśli brakuje danych, opisz to w raporcie i nie dopisuj liczb gry.
  7. **P15:** refleksy na szybach w parku handlowym.
- **Nie ruszaj:**
  - kebabu, `swiat/sceny.js` (sekcja kebab), `swiat/rysunek.js` (postacie) i palet ciemnych postaci: to wątek B, który robi równolegle inny wyko;
  - silnika i danych gry;
  - treści dymków.
  - Jeśli musisz zmienić coś wspólnego (np. `wnetrza.css`), dopisuj na końcu pliku we własnej sekcji, żeby scalenie było proste.
- **Zasady:**
  - kolory tylko ze zmiennych;
  - 3 palety × jasny/ciemny;
  - stan nigdy samym kolorem;
  - teksty neutralne płciowo;
  - inspiracje tylko jako pomysł, bez kopiowania;
  - zero wzmianek o innych grach;
  - prawdziwe marki tylko tak, jak już są w grze.
- **Zrzuty:**
  - port 8790, do `_robocze/zrzuty-charakter/`;
  - każda zmieniona scena w barze jasnym i wysokiej ciemnej (1366×768), nazwy jak w `zrzuty-wnetrza`;
  - po pracy zatrzymaj serwer.
- **Testy:**
  - test do `rekwizyty.js` (np. każda scena ma coś w dolnej części; banki różnią się układem);
  - `node --check`, `testy/swiat` i `testy/wnetrza`;
  - na koniec pełne testy i `ruff`.
- **Gotowe, gdy:** P2, P6–P9, P14, P15 zrobione, zrzuty są, testy zielone (wyniki w raporcie). Jeśli wątek przekroczy ok. 8 h, skończ etap (np. banki i markety), commitnij i napisz do mnie.
- **Archi:** archi-lukrum.

## Raport
