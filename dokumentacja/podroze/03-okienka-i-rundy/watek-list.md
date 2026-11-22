# Wątek: list (podróż 03)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/03-okienka-i-rundy/wspolne.md`. Są tam zasady, makiety, testy i commity.
- **Cel:** nowy wygląd listu z decyzjami rundy, który gracz wysyła na Poczcie (Z34). To rubryki z wariantu B w kopercie
  z wariantu A.
- **Decyzje szefa (`dokumentacja/Decyzje.md`, 22.11):**
  - Rubryki decyzji jak w wariancie **B**:
    - kwoty;
    - znaki ✓ ! ○;
    - przy rubryce odnośnik „popraw”, który prowadzi do miejsca, gdzie tę decyzję się zmienia.
  - Koperta jak w wariancie **A**: list wysuwa się z koperty, po nadaniu pojawia się stempel.
  - Poprawione w 02, nie zepsuj tego:
    - stempel „nadano” znika po przejściu rundy;
    - tablica Poczty odświeża się w nowej rundzie.
- **Pliki do zmiany:**
  - `swiat/sceny/poczta.js`;
  - w `pulpit/pulpit.js` tylko część z listem i nadawaniem;
  - `zakladki/zadania.js`, jeśli tam jest podsumowanie decyzji;
  - style;
  - testy w `gra/testy/swiat` i `gra/testy/aplikacja`.
- **Nie ruszaj:** `swiat/rysunek.js`, `zakladki/dostawcy.js`, `zakladki/zdarzenia.js`, `swiat/sceny/park.js`,
  `pulpit/zeszyt.js`, `zakladki/wujek.js`, `mapa/*`.
- **Gotowe, gdy:**
  - List jest w kopercie i wysuwa się z animacją. Przy `prefers-reduced-motion` pojawia się bez animacji.
  - Rubryki mają kwoty i znaki.
  - Odnośnik „popraw” działa.
  - Po nadaniu jest stempel.
  - Pełne testy są zielone.

## Raport
