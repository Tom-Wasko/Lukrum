# Protokół lidera

Dla lidera, czyli głównej sesji Claude Opus. Agenci tego nie czytają. Podstawa: sprawozdanie z researchu
(`../notatki/Zespół/Sprawozdanie – zespół agentów.md`).

## 1. Zasada główna
Lider **mało robi sam**. Ustala szczegóły z szefem, dzieli pracę, pisze briefy, sprawdza i dokumentuje.
Nie każda praca opłaca się jako agent. Agent startuje od zera (AGENTS.md, brief, czytanie plików), a system wieloagentowy
zużywa według Anthropic ok. 15 razy więcej tokenów niż czat.

**Lider robi sam:**
- zmiany do ~10 linii i poprawki tekstów;
- decyzje i rozmowę z szefem;
- teksty dla graczy i nawiązania literackie (redakcja);
- przegląd diffu agenta.

**Deleguje:**
- prace niezależne, które idą równolegle;
- prace o dużym wyniku: pełne testy, szerokie szukanie, pomiary;
- recenzję „świeżym okiem”;
- prace mechaniczne i masowe.

**Nie dzieli** jednej zmiany na plan, kod i test u różnych agentów, bo każdy musiałby czytać ten sam kontekst.

## 2. Dobór agenta
| Model | Do czego | Wysiłek (myślenie) | Uwaga |
|---|---|---|---|
| **Haiku** | zwiad (gdzie co jest), listy plików, sprawdzanie linków i formatów, podmiany według gotowej listy, streszczenie wyniku testów | `low` | nie do logiki kodu ani decyzji |
| **Sonnet** | **domyślny wykonawca:** kod według briefu, testy, UI, zrzuty, przepisywanie dokumentów według planu, research w sieci | `medium`; `high` przy trudnym błędzie lub recenzji | żądaj dowodu, bo potrafi napisać „gotowe” za wcześnie |
| **Opus** | trudna architektura, druga opinia, recenzja zmian ryzykownych | `high` | drogi, tylko gdy Sonnet sobie nie radzi lub stawka jest wysoka |
| **Fable** | długie samodzielne prace i audyty, zadania twórcze | `high` | **dostępny tylko do 17.11.2026 8:00** (darmowy okres szefa), potem poza zespołem; w nocy 15/16.11 dał dużo dobrych funkcji, ale wyszedł poza zakres i zostawił wiele plików poza ustalonymi miejscami, więc dostaje sztywną listę plików wyjściowych i warunek stopu |

**Wysiłek (poziom myślenia)** ustawia pole `effort` w definicji agenta (`zwiadowca` low, `wykonawca` medium,
`recenzent` high) albo parametr `effort` w wywołaniu. Wyższy wysiłek to dłuższe myślenie i więcej tokenów, więc `high`
dajemy tylko tam, gdzie błąd jest drogi (decyzje, recenzja, trudny błąd). Do prac mechanicznych wystarcza `low`.

**Agenci nie tworzą własnych agentów.** W Claude Code podagent nie może uruchomić podagenta, i to dotyczy także Opusa
i Fable. Rozdziela tylko lider. Gdy praca wymaga podziału, agent opisuje go w raporcie („Propozycje”), a lider
wysyła kolejne briefy.

Typy agentów:
- `Explore`: tylko odczyt, jednorazowy (nie da się go wznowić). **Zawsze podawaj `model`**, bo domyślnie bierze drogi model.
- `general-purpose`: pisze i można go wznowić przez SendMessage.
- `fork`: dziedziczy kontekst i cache lidera; tani, gdy zadanie wymaga tego, co lider już wie, ale działa zawsze na modelu lidera.
- Własne definicje: `lukrum/.claude/agents/`, czyli `zwiadowca` (Haiku), `wykonawca` (Sonnet), `recenzent` (Sonnet).
  Wspólne zasady siedzą w ich definicji, więc brief ich nie powtarza. Działają w sesjach uruchomionych z `lukrum/`.

**Opus jako agent** tylko wtedy, gdy Sonnet sobie nie poradził, i lider mówi o tym szefowi. Działających agentów nie
restartuje się dla oszczędności, bo czytanie już zjadło tokeny.

**Zawsze jawnie ustaw `model`** w wywołaniu. Poprawki do pracy agenta wysyłaj temu samemu agentowi (SendMessage), bo
zachowuje kontekst i cache. Nowego stawiaj, gdy temat jest inny albo agent utknął dwa razy.

## 3. Brief (szablon)
Brief jest krótki, ale kompletny. Agent nie widzi rozmowy lidera.
```
Seria/temat: <seria>-<temat>   Kopia: ../_robocze/<seria>-<temat> (gałąź <seria>-<temat>)   [albo: tylko odczyt]
Cel: <1–3 zdania: co ma działać po Twojej pracy, z perspektywy gracza>
Ustalone (nie sprawdzaj ponownie): <fakty i ścieżki:linie od lidera/zwiadu>
Pliki do zmiany: <lista>        Nie ruszaj: <lista / „wszystko inne”>
Decyzje szefa: <cytaty z dziennika, jeśli dotyczą>
Gotowe, gdy: <sprawdzalne kryteria + komenda testu i oczekiwany wynik>
Zrzuty: <0 | 1–2: które ekrany, które palety/tryby>
Notatka funkcji: <tak: Funkcje/<Nazwa>.md | nie>
Raport: raporty/<seria>/<temat>.md, odpowiedź ≤ 15 linii (format z AGENTS.md §3)
```
Skala wysiłku: proste pytanie to 1 agent i kilka wywołań narzędzi. Większa seria to 2–4 agentów o rozłącznych plikach.

## 4. Równoległość
- Domyślnie do **5 agentów naraz**, w tym do **3 piszących kod**. Piszący zawsze mają **rozłączne pliki**, a gdy pliki
  się nakładają, praca idzie po kolei. Dlaczego nie więcej piszących:
  - limit subskrypcji (5 godzin) zużywają wszyscy razem, więc 16.11 przerwał obu agentów Fable naraz;
  - każdy piszący kończy pełnym pytestem (ok. 6 min, mocno obciąża komputer), więc kilka naraz spowalnia wszystkich;
  - każdą gałąź trzeba przejrzeć i scalić, a więcej równoległych gałęzi to więcej konfliktów.

  Prace tylko do odczytu albo w osobnych folderach (zwiad, recenzja, research, dokumenty) mogą iść szerzej. Limit
  można podnieść, gdy prace są małe i niezależne.
- Każdy agent piszący ma kopię `../_robocze/<seria>-<temat>` z gałęzią `<seria>-<temat>` od gałęzi serii.
  Polecenie: `git worktree add ../_robocze/<seria>-<temat> -b <seria>-<temat> <seria>`. Środowisko Pythona jest jedno,
  `lukrum_gra/gra/.venv`, uruchamiane z kopii po ścieżce bezwzględnej.
- Agenci tylko do odczytu (zwiad, recenzja) mogą działać obok piszących.
- Po scaleniu: `git worktree remove`, usuń lokalną gałąź tematu. Gałęzie na GitHubie usuwa się tylko za zgodą szefa.

## 5. Przebieg serii
0. **Majster:** `git fetch` i przegląd nowych commitów na `origin/maciex` przed każdą serią i przed scaleniem. Gdy
   majster zmienił pliki, na których pracujemy, ściągnij je najpierw i zapisz to w „Stan prac”.
1. **Ustalenie z szefem:** pytania z opcjami i rekomendacją, bez limitu liczby. Narzędzie pytań mieści 4 naraz, więc
   większy zestaw idzie kilkoma rundami pod rząd. Szef lubi serie pytań i czyta się go
   dokładnie, bo „1 oraz 3” oznacza połączenie opcji.
2. **Plan:** `raporty/<seria>/plan.md` z numeracją punktów jak u szefa, z przypisaniem agent/model/pliki. Commit planu
   na gałęzi serii `<seria>`.
3. **Zwiad**, jeśli lider nie zna plików: jeden `zwiadowca`, wynik wklejany do briefów.
4. **Wykonanie:** briefy, agenci w tle. Lider im nie przeszkadza.
5. **Sprawdzenie:** przegląd diffu i dowodów. Zrzuty ogląda lider (najwyżej 2 na zmianę). Poprawki wracają do tego
   samego agenta.
6. **Scalenie:** pełny pytest + ruff raz na serię. Scalenie do `main` po akceptacji szefa. Push bez force.
7. **Dokumentacja:** POSTEP.md, README (gdy zmienia się to, co widzi gracz), notatki funkcji, dziennik lidera, pamięć.

Zmiany balansu (yaml, silnik): pomiar przed i po (`balans`), wnioski w raporcie serii.

## 6. Kontakt z szefem
- Szef dostępny: ważne wątpliwości od razu przez pytania. Drobiazgi lider rozstrzyga sam i **zapisuje wybór**.
- Szef niedostępny: pytania trafiają do `Dziennik lidera.md` → „Pytania do szefa”. Lider idzie dalej rekomendowaną opcją
  tylko wtedy, gdy da się ją łatwo cofnąć. W przeciwnym razie wstrzymuje ten punkt.
- Zawsze pytaj o: nową mechanikę, zmianę zasad widocznych dla gracza, usunięcie funkcji, wygląd, działania nieodwracalne
  albo widoczne na zewnątrz (push do `main`, usuwanie gałęzi, publikacja).

## 7. Oszczędzanie tokenów (lider)
- Wyniki agentów do plików, a do kontekstu lidera tylko streszczenie.
- Wyniki testów zawsze przycięte (`| tail -5`).
- Czytaj fragmenty plików, a do szerokiego szukania wysyłaj zwiadowcę.
- Nie zmieniaj modelu ani poziomu wysiłku w trakcie sesji, bo to unieważnia cache.
- `/compact` w naturalnych przerwach, `/clear` między niezwiązanymi tematami.
- **Pomiar kosztu (decyzja szefa 16.11):** po każdej serii lider dopisuje w „Stan prac” krótki wiersz dla każdego
  agenta: model, przybliżone zużycie (`/usage`, liczba tokenów z wyniku agenta) i czy wynik trafił do gry. Bez limitu
  prac, ale szef widzi, co się opłaca.

## 8. Plan B: wyczerpany limit albo zmiana subskrypcji
Limit 5-godzinny albo zmiana konta przerywa **wszystkich** agentów naraz, w połowie pracy. Zasada: **stan zawsze w plikach,
nie w pamięci rozmowy.**
- **Przed:**
  - agent zapisuje wynik przyrostowo (po każdym punkcie), a piszący commituje na swojej gałęzi po każdym kroku;
  - brief zawsze podaje plik wyniku;
  - lider na bieżąco prowadzi w Dzienniku lidera sekcję **„Stan prac”**: którzy agenci działają, nad czym, gdzie jest ich wynik.
- **Ta sama sesja** (limit się odnowił, `/rate-limit-options` czeka): wznów każdego przerwanego agenta przez SendMessage
  krótkim „wznów, sprawdź co już zapisane, dokończ”. Nie stawiaj nowego, bo stracisz jego kontekst.
- **Nowa sesja** (zmiana konta, zamknięty terminal): agentów z poprzedniej sesji nie da się wznowić. Nowy lider czyta
  „Stan prac” i stawia agentów od nowa z briefem „w `<plik wyniku>` jest częściowa praca, sprawdź i dokończ”.
- **Gdy limit zbliża się do końca:** nie startuj dużych prac. Najpierw dokończ i zapisz to, co trwa.
- **Kolejność przy niskim limicie:** najpierw domknięcie i zapis stanu, potem nowe prace. Przy wyborze modelu raczej Sonnet niż Opus.
