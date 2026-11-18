// Scena wnętrza „gielda” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/gielda.md.
// TYTUL: Giełda: parkiet „Byk i Koziołek” | Banki i giełda
// KOLEJNOSC: 12
// Decyzja szefa 6: giełda to osobny budynek (żeton `gielda`). Funkcja `gielda`: prywatne pieniądze właściciela; w silniku jeszcze bez decyzji.
export default function (R) {
  const SPOLKI = [["KOZIOŁ SA", "41,20", "▲", "+2,1%"], ["BYSTRZYCA", "17,85", "▼", "−0,8%"], ["CEBULARZ", "9,40", "▲", "+5,6%"], ["TROLEJBUS", "63,00", "=", "0,0%"], ["WĄWÓZ", "22,15", "▼", "−3,2%"], ["OBLIGACJE 26 TYG.", "100,00", "=", "3,0%"]];
  return {
    id: "gielda", tytul: "Parkiet „Byk i Koziołek”", adres: "Krakowskie Przedmieście, osobno od pierzei bankowej", opis: "Sala giełdy: tablica kursów ze strzałkami, pulpit maklera z telefonami, dalekopis z taśmą, dzwon i rzeźby byka i koziołka.",
    rysuj: (R) => {
      let s = R.sciana() + R.boazeria(270, 380) + R.podloga("parkiet", 380);
      s += [200, 610, 1020].map((x) => R.kula(x, 14, 16)).join("");
      // wielka tablica kursów (klapkowa): 6 wierszy, strzałka + procent
      s += `<rect class="k3" x="300" y="40" width="620" height="230" rx="4" fill="var(--g-czern)"/>` + R.t(610, 68, "NOTOWANIA · TYDZIEŃ 6", 17, { fill: "var(--g-biel)", ls: 3 })
        + SPOLKI.map(([a, b, c, d], i) => { const y = 98 + i * 28, kol = c === "▲" ? "var(--zysk)" : c === "▼" ? "var(--strata)" : "var(--g-biel)";
          return `<rect x="314" y="${y - 19}" width="592" height="24" fill="var(--g-tablica)"/>` + R.t(326, y, a, 17, { fill: "var(--g-biel)", kot: "start", ls: 1.5 }) + R.t(700, y, b, 18, { fill: "var(--g-biel)", kot: "end", f: "gruby" }) + R.t(740, y, c, 18, { fill: c === "=" ? "var(--g-biel)" : "var(--g-biel)", f: "tekst" }) + R.t(894, y, d, 16, { fill: "var(--g-biel)", kot: "end", f: "tekst" }); }).join("");
      // dzwon giełdowy, zegar, rzeźby na postumentach
      s += `<path class="k" d="M150 60v40"/><path class="k3" d="M118 150q0-50 32-50t32 50l10 14h-84z" fill="var(--uwaga)"/><circle class="k" cx="150" cy="170" r="7" fill="var(--g-metal2)"/><path class="k1 bez" d="M150 177v40"/>` + R.zegar(1070, 110, 34, 9, 30) + R.t(1070, 170, "sesja 9:00–17:00", 13, { f: "tekst", bez: true, op: .8 });
      s += `<rect class="k" x="60" y="300" width="110" height="80" fill="var(--g-sciana2)"/><path class="k3" d="M70 300q-6-40 26-46l-10-18 18 10q20-8 40 4l14-12-6 20q16 16 8 42z" fill="var(--g-metal2)"/>` + R.t(115, 350, "BYK", 14) + `<rect class="k" x="1050" y="300" width="110" height="80" fill="var(--g-sciana2)"/><path class="k3" d="M1066 300q-4-30 20-40l-8-22 16 14q14-4 26 2l10-18 2 24q14 14 8 40z" fill="var(--g-metal2)"/>` + R.t(1105, 350, "KOZIOŁEK", 13);
      // pulpit maklera (półokrągły) z trzema telefonami, makler w zarękawkach; dalekopis z taśmą
      s += R.osobaZa("bywalec-papkin", 610, 392, 548, 1.1) + `<path class="k3" d="M430 390q180-40 360 0v130h-360z" fill="var(--g-drewno2)"/><path class="k" d="M420 380q190-44 380 0v14q-190-44-380 0z" fill="var(--g-drewno)"/>` + R.telefon(470, 382, "var(--g-czern)") + R.telefon(530, 372) + R.telefon(700, 374, "var(--g-czern)") + R.t(610, 470, "ZLECENIA", 17, { fill: "var(--g-czern)", ls: 3 });
      s += `<rect class="k" x="880" y="440" width="110" height="110" fill="var(--g-drewno)"/><path class="k" d="M900 440a36 30 0 0 1 72 0z" fill="var(--g-szklo)" opacity=".7"/><circle class="k" cx="936" cy="430" r="12" fill="var(--g-metal)"/><path class="k1" d="M940 440q30 60 10 110t40 50" fill="none" stroke="var(--g-biel)" stroke-width="9"/>` + R.t(935, 500, "DALEKOPIS", 12, { fill: "var(--g-biel)" });
      // okienko „Rachunek właściciela” z lewej, barierka parkietu, inwestor z teczką
      s += R.lada(180, 420, 190, 110) + R.szyba(190, 300, 170, 120) + R.tabliczka(275, 248, 180, "Rachunki", "prywatne") + R.osobaZa("obsluga-kasjerka", 275, 424, 566, 1.0);
      s += `<path class="k bez" d="M0 560h1220" stroke="var(--g-drewno)" stroke-width="7"/>` + Array.from({ length: 21 }, (_, i) => `<path d="M${10 + i * 60} 560v52" stroke="var(--g-drewno)" stroke-width="5"/>`).join("") + R.osoba("gosc-podrozny", 1120, 606, 0.8, "zwykla");
      return s;
    },
    punkty: [
      { x: 294, y: 34, w: 632, h: 242, et: "Notowania", gdzie: "gora", teczka: { tytul: "Notowania", okruszek: "tablica kursów", wstep: "Kursy zmieniają się co tydzień. Strzałka i procent pokazują zmianę od poprzedniego tygodnia.", pola: SPOLKI.map(([a, b, c, d]) => [a, `${b} zł ${c}`, d]), ekran: "gielda", funkcja: "gielda" } },
      { x: 424, y: 290, w: 372, h: 236, et: "Kup albo sprzedaj", teczka: { tytul: "Zlecenie u maklera", okruszek: "pulpit maklera", zakladki: ["Kup", "Sprzedaj", "Twoje akcje"], wstep: "Inwestujesz <b>prywatne</b> pieniądze właściciela, nie kasę firmy. Prowizja maklera od każdego zlecenia.", pola: [["Spółka", "CEBULARZ ▾"], ["Liczba akcji", "100"], ["Wartość zlecenia", "940 zł", "w portfelu właściciela: 3 200 zł"]], ekran: "gielda", funkcja: "gielda (w silniku jeszcze bez klucza decyzji: DECYZJE.gielda = ())" } },
      { x: 174, y: 256, w: 202, h: 280, et: "Portfel właściciela", gdzie: "dol", odsyla: { kto: "Kasjerka", tekst: "Wypłatę z firmy na prywatny rachunek robi się w kebabie, w szufladzie biurka. Tu tylko pokazuję saldo.", stan: "Portfel właściciela: 3 200 zł", miejsce: "Mój kebab" } },
      { x: 870, y: 400, w: 150, h: 200, et: "Wiadomości", gdzie: "gora", teczka: { tytul: "Depesze z rynku", okruszek: "dalekopis", wstep: "Krótkie wiadomości, które mogą ruszyć kursami w następnym tygodniu.", pola: [["„Cebularz” otwiera drugą piekarnię", "▲"], ["Remont torowiska: „Trolejbus” ostrzega przed stratą", "▼"]], ekran: "gielda (wiadomości)", funkcja: "gielda" } },
    ],
    osoby: [{ x: 610, stopy: 548, s: 1.1, h: 120, imie: "Makler", tekst: "Byk rośnie, niedźwiedzia nie mamy, jest koziołek. Co kupujemy za prywatne?", powitanie: true }],
    plakietki: [{ x: 20, y: 20, html: "Tu gra się za <b>prywatne pieniądze właściciela</b>." }],
  };
}
