# Podróż 04: wygląd-i-dźwięk
Zadania: Z49 (nowe: zawartość okien w stylu swojego okna), Z11 (dźwięki + gwar miejsca), Z50 (nowe: radio – ikona obok
kaski, odbiornik PRL, gwar cichnie przy radiu). Tryb: nadzorowany (szef jest), potem ewentualnie `/papa`.
Plan zatwierdzony przez szefa 23.11 wieczorem; start 24.11 rano.

## Kontekst
Szef: w wielu oknach (np. Sokole Oko ▸ „Zleć śledztwo”) rama jest już PRL-owa, ale w środku siedzą panele ze starego
projektu (nowoczesne `.kafel`, `.karta`, `.btn`, `.pole`, tabele z `styl.css`, kolory `--biel`, `--pom`, `--zielony`).
Dzieje się tak, bo punkt sceny otwiera teczkę (`swiat/wnetrze.js` → `c.teczka(ekran)`), a w niej renderuje się stary
ekran z `zakladki/*.js`. Problem jest w prawie wszystkich oknach.

Decyzje szefa (23.11, okienko) – do `Decyzje.md`:
- Okna mają już **własne style** (teczka, paragon, list, tablica korkowa, zeszyt…). **Nie wciskać jednego szablonu do
  wszystkich**: zawartość każdego okna ma pasować do jego ramy, a całość ma być spójna.
- Najpierw **wzór na 3 oknach** (Sokole Oko, bank, kadry) do akceptacji, potem reszta.
- Tło: **tylko odgłosy** (gwar, ulica, biuro) zależne od miejsca; prawdziwa muzyka wyłącznie z radia.
- Domyślnie: krótkie dźwięki włączone, odgłosy/muzyka wyłączone; łatwe wyciszenie; MG wycisza klasę.
- Odgłosy i dźwięki: **prawdziwe nagrania CC0 / domena publiczna**, lista z źródłami do akceptacji szefa przed pobraniem.
- Radio na końcu podróży: **przycisk radia dziś nic nie robi** – naprawić; zamiast przycisku **ikona radia obok kaski**.
  **Nie ma okna radia:** kliknięcie wysuwa retro radio, na nim bezpośrednio zmienia się stacje. Gdy radio gra, gwar cichnie.

## Kryteria sukcesu
- [ ] Spis wszystkich okien gry (scena → punkt → ekran → rama → stan) w `wiedza/analizy/spis-okien.md`
- [ ] Wzór na 3 oknach zaakceptowany przez szefa (strona przed/po)
- [ ] Każde okno ze spisu: zawartość w stylu swojej ramy, w spisie „zgodne” + zrzut
- [ ] 3 palety × jasny/ciemny działają, wysoka ≥ 7:1, stan nie samym kolorem
- [ ] Krótkie dźwięki i gwar każdego miejsca; ⚙ wyciszanie; MG wycisza klasę; strona nagrań z licencjami
- [ ] Radio: ikona obok kaski działa, odbiornik PRL, gwar cichnie przy radiu
- [ ] Pełne testy zielone, `ruff`, `node --check`, `silnik.dane sprawdz` czyste

## Wątki
| Kolejność | Wątek | Kto | Zakres | Pliki |
|---|---|---|---|---|
| 1 | `04/wzor` | wyko | spis okien + katalog ram (jakie rekwizyty już są); język wyglądu zawartości dla każdej ramy (teczka akt: maszynopis, pieczątki, rubryki; paragon; list; tablica; okienko urzędu); wzór na Sokole Oko (`konkurencja.js`), bank (`banki.js`), kadry (`hr.js`); zrzuty przed/po | nowy `swiat/okna.css` (style zawartości per rama, tylko zmienne), 3 moduły zakładek, spis |
| – | Archi | sam | strona przed/po dla szefa (artifact), pytanie o akceptację; lista nagrań CC0 (Wikimedia Commons, Freesound CC0) z linkami, licencją, rozmiarem → okienko do szefa | – |
| 2 (po akceptacji) | `04/okna-a` | wyko (kontynuacja `04/wzor`) | finanse i urzędy: `finanse, podatki, ubezpieczenia, urzad, formy, wlasciciel, przejecia, gielda, kasyno, harpagon` + ich sceny | swoje moduły + blok w `okna.css` |
| 2 | `04/okna-b` | wyko | firma i ludzie: `klienci, konkurencja (reszta), oferta, sprzedaz, swiezosc, marketing, rynek_pracy, lekcje, kalendarz, lokal, lokale, lokal_wybor, inwestycje, dekor, dostawcy, handel, ogolne, czas, funkcje, final` | swoje moduły + blok w `okna.css` |
| 2 (równolegle) | `04/dzwieki` | wyko | `pulpit/dzwiek.js` (krótkie dźwięki + gwar miejsca, Web Audio, głośności), `dane/dzwieki.yaml` (miejsce → odgłos, zdarzenie → dźwięk, źródło/licencja), ⚙ Dźwięk, MG wycisza klasę, strona nagrań; pliki do `static/dzwieki/` dopiero po akceptacji listy (pobieram ja) | nowe pliki + `pulpit.js` (⚙), `panel_mg` (wycisz) |
| 3 (koniec) | `04/radio` | kontynuacja `04/dzwieki` | **bez osobnego okna radia**: ikona radia obok kaski; kliknięcie wysuwa retro odbiornik, na którym bezpośrednio zmienia się stacje (gałka/skala) i głośność; naprawa dzisiejszego przycisku (nic nie robi); ściszanie gwaru przy radiu | `pulpit/radio.js`, `pulpit.js`, `pulpit.css` (blok radia) |

Najwyżej 3 wyko naraz. Zrzuty: `narzedzia/zrzuty.py`, każdy wątek własny port i `_robocze/zrzuty-<wątek>/`; jeden serwer na
wątek, pełne testy raz (pamięć). Zasady w briefach: kolory tylko ze zmiennych, 3 palety × 2 tryby, stan nie samym
kolorem, zero wzmianek o innych grach, mechanika bez zmian (tylko wygląd), teksty bez zmian treści.

## Kolejność
0. Dziś (23.11 wieczór): zapis planu, decyzji i zadań w repo, briefy `04/wzor` i `04/dzwieki` gotowe i zacommitowane.
   Start wyko i reszta: **jutro rano (24.11)** po słowie szefa.
1. `git fetch`, przegląd `origin/maciex`; `plan.md` podróży 04, Z49/Z50 w `Zadania.md`, decyzje szefa w `Decyzje.md`, Stan.
2. Brief i start `04/wzor` oraz `04/dzwieki` (kod bez plików nagrań).
3. Ja: lista nagrań CC0 → okienko do szefa → po zgodzie pobranie do `static/dzwieki/` (spis licencji w danych).
4. Wzór gotowy → strona przed/po → akceptacja szefa → `04/okna-a` (kontynuacja wyko wzoru) i `04/okna-b`.
5. Po `04/dzwieki`: kontynuacja `04/radio`.
6. Na koniec: galeria wszystkich okien dla szefa, pełne testy, scalenie, propozycja zamknięcia.

## Weryfikacja
- Zrzuty każdego okna ze spisu (bar jasny, pewex ciemny, wysoka ciemny) w galerii dla szefa.
- `pytest` (pełne raz na wątek), `ruff`, `node --check` zmienionych modułów, `silnik.dane sprawdz`.
- Dźwięk: test, że `dzwieki.yaml` ma źródło i licencję każdego pliku i że każde miejsce z `budynki.yaml` ma odgłos lub
  „cisza”; ręcznie w Chrome: wejście do kebaba → gwar, radio włączone → gwar cichnie, ⚙ wycisz → cisza.
