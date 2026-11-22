// Scena wnętrza „redakcja” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/redakcja.md.
// TYTUL: Redakcja „Kuriera” (gazeta na biurku na pierwszym planie) | Media
// KOLEJNOSC: 40
// Decyzja szefa 11: scena redakcji, a gazeta z wynikami tygodnia leży na biurku na pierwszym planie (jeden kadr zamiast dwóch pod sobą).
export default function (R) {
  const wiersz = (x, y, w, n = 4) => Array.from({ length: n }, (_, i) => `<path d="M${x} ${y + i * 9}h${i === n - 1 ? w * 0.6 : w}" stroke="var(--g-czern)" opacity=".4" stroke-width="2"/>`).join("");
  return {
    id: "redakcja", tytul: "Redakcja „Kuriera rankingowego”", adres: "Śródmieście, poza deptakiem", opis: "Redakcja gazety: tablica z tabelą ligową, biurka z maszynami do pisania, archiwum roczników, a na pierwszym planie świeży numer z wynikami tygodnia.",
    rysuj: (R) => {
      let s = R.sciana() + R.boazeria(250, 340) + R.podloga("parkiet", 340) + R.lampa(420, 30) + R.lampa(940, 30);
      // ściana: tablica ligowa kredą, zegar, okno z żaluzjami, napis redakcji
      s += `<rect class="k3" x="40" y="46" width="300" height="196" fill="var(--g-drewno)"/><rect class="k" x="50" y="56" width="280" height="176" fill="var(--g-tablica)"/>` + R.t(190, 80, "TABELA LIGOWA", 16, { fill: "var(--g-biel)", ls: 2 })
        + [["1.", "Kebab u Koziołka", "▲"], ["2.", "Wasza drużyna", "▲"], ["3.", "Rożen Express", "▼"], ["4.", "Pita Pany", "="], ["5.", "Sułtan z LSM", "▼"]].map(([a, b, c], i) => R.t(64, 108 + i * 26, a, 16, { fill: "var(--g-biel)", kot: "start", f: "gruby" }) + R.t(92, 108 + i * 26, b, 16, { fill: i === 1 ? "var(--uwaga)" : "var(--g-biel)", kot: "start", f: "tekst", bez: true, w: 190 }) + R.t(316, 108 + i * 26, c, 16, { fill: "var(--g-biel)", kot: "end", f: "tekst" })).join("");
      s += R.zegar(420, 110, 28, 8, 50) + R.szyld(660, 56, 330, 50, "Kurier rankingowy", { tlo: "var(--g-biel)", tekst: "var(--g-czern)", f: "gruby", r: 24 }) + R.t(660, 128, "redakcja · dział wyników · dział porad", 13, { f: "tekst", bez: true, op: .8 });
      // archiwum roczników (regał z oprawionymi tomami) i szafka z szufladkami
      s += R.regal(930, 60, 250, 280, 3, (px, py, pw, ph, nr) => Array.from({ length: 9 }, (_, k) => `<rect class="k1" x="${px + k * 26}" y="${py + 8}" width="23" height="${ph - 8}" fill="${k % 3 === nr % 3 ? "var(--akcent)" : "var(--g-drewno2)"}"/><rect x="${px + k * 26 + 5}" y="${py + 20}" width="13" height="16" fill="var(--g-biel)" opacity=".85"/>`).join("")) + R.t(1055, 52, "ARCHIWUM", 14, { ls: 2, op: .75 });
      // biurka w głębi: redaktor przy maszynie (dział wyników), biurko działu porad ze stosem listów
      s += R.osobaZa("bywalec-papkin", 470, 300, 380, 0.82) + R.biurko(390, 296, 190, 70) + R.maszyna(420, 296, 0.8) + R.telefon(520, 296);
      s += R.osobaZa("bywalec-dulska", 780, 300, 380, 0.82) + R.biurko(690, 296, 200, 70) + [0, 1, 2, 3, 4].map((i) => `<rect class="k1" x="${708 + (i % 2) * 6}" y="${288 - i * 7}" width="46" height="7" fill="var(--g-biel)"/>`).join("") + `<path class="k1" d="M830 296h44v-26h-44zM830 270l22 14 22-14" fill="var(--g-biel)"/>` + R.t(790, 348, "DZIAŁ PORAD", 12, { op: .75, ls: 1 }) + R.t(485, 348, "DZIAŁ WYNIKÓW", 12, { op: .75, ls: 1 });
      // pierwszy plan: blat biurka przez całą szerokość, na nim świeży numer gazety (obrócony), kubek, okulary, ołówek
      s += `<rect class="k3" x="-10" y="470" width="1240" height="150" fill="var(--g-drewno)"/><rect class="k" x="-10" y="460" width="1240" height="16" fill="var(--g-drewno2)"/>`;
      s += `<g transform="rotate(-2.5 610 470)"><rect class="k3" x="300" y="372" width="620" height="250" fill="var(--g-biel)"/><path class="k" d="M610 420v200" opacity=".5"/>`
        + R.t(610, 404, "KURIER RANKINGOWY", 27, { fill: "var(--g-czern)", f: "gruby" }) + `<path d="M316 412h588M316 416h588" stroke="var(--g-czern)" stroke-width="1.5"/>` + R.t(610, 432, "wydanie po tygodniu 5 · Lublin · egzemplarz Waszej drużyny", 11.5, { fill: "var(--g-czern)", f: "tekst", bez: true })
        + R.t(456, 462, "WASZ TYDZIEŃ W LICZBACH", 14, { fill: "var(--g-czern)", ls: 1 })
        + [["klienci", "412", "▲"], ["przychód", "9 870 zł", "▲"], ["dochód", "2 340 zł", "▼"]].map(([a, b, c], i) => R.t(326, 492 + i * 36, a, 13, { fill: "var(--g-czern)", f: "tekst", kot: "start", bez: true }) + R.t(560, 496 + i * 36, b, 25, { fill: "var(--g-czern)", f: "gruby", kot: "end" }) + R.t(584, 494 + i * 36, c, 18, { fill: c === "▲" ? "var(--zysk)" : "var(--strata)", f: "tekst" })).join("")
        + R.t(764, 462, "PUNKTY TYGODNIA: 612 / 1000", 14, { fill: "var(--g-czern)", ls: 1 }) + [["Sprzedaż", 150], ["Finanse", 96], ["Ludzie", 138], ["Klienci", 120], ["Rozwój", 108]].map(([a, b], i) => R.t(634, 486 + i * 22, a, 13, { fill: "var(--g-czern)", f: "tekst", kot: "start", bez: true }) + `<rect class="k1" x="716" y="${475 + i * 22}" width="150" height="13" fill="none"/><rect x="716" y="${475 + i * 22}" width="${b * 0.75}" height="13" fill="var(--g-czern)" opacity=".7"/>` + R.t(900, 486 + i * 22, String(b), 13, { fill: "var(--g-czern)", f: "gruby", kot: "end" })).join("") + `</g>`;
      s += `<path class="k" d="M150 470h54l-6 -50h-42z" fill="var(--g-biel)"/><path class="k bez" d="M204 430q22 0 20 18t-22 14" stroke-width="4"/>` + `<circle class="k bez" cx="1000" cy="490" r="14" stroke-width="3"/><circle class="k bez" cx="1036" cy="492" r="14" stroke-width="3"/><path class="k" d="M1014 490h8"/>` + `<path class="k" d="M1080 540l90-26 4 10-90 26z" fill="var(--uwaga)"/>`;
      return s;
    },
    punkty: [
      { x: 296, y: 366, w: 628, h: 240, et: "Wyniki tygodnia", stan: "▲", klasa: "zy", opisStanu: "dochód dodatni, o jedno miejsce wyżej", gdzie: "gora", teczka: { tytul: "Kurier rankingowy: wydanie po tygodniu 5", okruszek: "gazeta na biurku", zakladki: ["Pierwsza strona", "Punkty tygodnia", "Rachunek wyników"], wstep: "Pełne wyniki ostatniego tygodnia. Trzy duże liczby, potem pięć działów po 200 punktów.",
        pola: [["Klienci", "412 ▲", "o 38 więcej niż tydzień wcześniej"], ["Przychód", "9 870 zł ▲"], ["Dochód", "2 340 zł ▼", "wyższy czynsz i rata kredytu"], ["Punkty tygodnia", "612 / 1000"]], ekran: "karta_wynikow, raport" } },
      { x: 34, y: 40, w: 312, h: 208, et: "Tabela ligowa", teczka: { tytul: "Tabela ligowa", okruszek: "tablica", wstep: "Miejsca drużyn tydzień po tygodniu. Strzałka pokazuje zmianę od poprzedniego wydania.", pola: [["1. Kebab u Koziołka", "3 240 pkt ▲"], ["2. Wasza drużyna", "3 105 pkt ▲"], ["3. Rożen Express", "2 980 pkt ▼"]], ekran: "ranking" } },
      { x: 684, y: 190, w: 212, h: 184, et: "Dział porad", stan: "!", opisStanu: "3 nowe wnioski", gdzie: "gora", teczka: { tytul: "Dział porad: co poszło dobrze, co poprawić", okruszek: "biurko działu porad", wstep: "Trzy najważniejsze wnioski z ostatniego tygodnia, każdy z miejscem, w którym da się to poprawić.", pola: [["! Zabrakło mięsa w piątek i sobotę", "➜ Makro"], ["▲ Promocja studencka przyciągnęła 60 gości", "✓"], ["▼ Kolejka w porze obiadu: 14 osób odeszło", "➜ Agencja pracy"]], ekran: "wnioski" } },
      { x: 924, y: 40, w: 262, h: 306, et: "Archiwum", teczka: { tytul: "Archiwum: poprzednie wydania", okruszek: "regał roczników", wstep: "Wyniki wszystkich minionych tygodni, do porównania.", pola: [["Tydzień 4", "dochód 2 910 zł"], ["Tydzień 3", "dochód 1 120 zł"], ["Tydzień 2", "dochód −640 zł"]], ekran: "raport (historia)" } },
    ],
    osoby: [{ x: 470, stopy: 380, s: 0.82, h: 110, imie: "Redaktor", tekst: "Świeży numer na biurku! Jeszcze ciepły, proszę nie rozmazać farby.", powitanie: true }],
  };
}
