// Scena wnętrza „akademia” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/akademia.md.
// TYTUL: Lubelska Szkoła Kebabu (sala wykładowa: tablica z kursami, rzutnik folii) | Ludzie
// KOLEJNOSC: 81
// Szkolenia (decyzja `szkolenia`, funkcja rozwoj; od tygodnia 7). Sala widziana z ostatniej ławki.
export default function (R) {
  const YP = 380;
  const lawka = (x, y) => `<rect class="k" x="${x}" y="${y}" width="230" height="14" fill="var(--g-drewno2)"/><rect class="k" x="${x + 10}" y="${y + 14}" width="210" height="46" fill="var(--g-drewno)"/><path class="k" d="M${x + 14} ${y + 60}v40M${x + 216} ${y + 60}v40" stroke-width="5"/>`;
  return {
    id: "akademia", tytul: "Lubelska Szkoła Kebabu", adres: "ul. Nadbystrzycka, okolice Politechniki", opis: "Sala wykładowa: trójdzielna tablica z planem kursów, rzutnik folii, gablota z dyplomami, manekin z rożnem treningowym, ławki z pulpitami.",
    rysuj: (R) => {
      let s = R.sciana() + R.lamperia(290, YP, "color-mix(in srgb, var(--akcent-2) 22%, var(--g-sciana2))") + R.podloga("parkiet", YP, "var(--g-podloga)") + R.swietlowka(300, 10, 170) + R.swietlowka(760, 10, 170);
      // tablica trójdzielna z planem kursów
      s += `<rect class="k3" x="250" y="50" width="720" height="220" fill="var(--g-drewno)"/>` + [0, 1, 2].map((i) => `<rect class="k" x="${258 + i * 236}" y="58" width="${i === 1 ? 232 : 232}" height="204" fill="var(--g-tablica)"/>`).join("") + `<rect class="k" x="250" y="270" width="720" height="10" fill="var(--g-drewno2)"/>`;
      s += R.t(374, 86, "KURSY", 18, { fill: "var(--g-biel)", ls: 4 }) + [["Higiena i HACCP", "1 tydz."], ["Szybki nóż", "2 tyg."], ["Obsługa gościa", "2 tyg."]].map(([a, b], i) => R.t(270, 118 + i * 30, a, 16, { fill: "var(--g-biel)", kot: "start", f: "tekst", bez: true, w: 150 }) + R.t(480, 118 + i * 30, b, 15, { fill: "var(--g-biel)", kot: "end", f: "tekst", bez: true })).join("");
      s += `<path class="bez" d="M520 230l40-60 40 30 50-90 50 40" stroke="var(--g-biel)" stroke-width="4"/><path d="M510 240h210M510 240v-150" stroke="var(--g-biel)" stroke-width="2"/>` + R.t(610, 86, "nóż ➜ szybkość", 15, { fill: "var(--g-biel)", f: "tekst", bez: true });
      s += R.t(846, 86, "W TYM TYGODNIU", 15, { fill: "var(--g-biel)", ls: 2 }) + R.t(846, 130, "Staszek: Szybki nóż", 15, { fill: "var(--g-biel)", f: "tekst", bez: true, w: 210 }) + R.t(846, 156, "zostały 2 tyg.", 14, { fill: "var(--g-biel)", f: "tekst", bez: true });
      // gablota z dyplomami, manekin z rożnem treningowym
      s += `<rect class="k3" x="40" y="80" width="170" height="250" fill="var(--g-drewno)"/><rect class="k" x="50" y="90" width="150" height="230" fill="var(--g-szklo)" opacity=".5"/>` + [0, 1, 2, 3].map((i) => `<rect class="k1" x="${60 + (i % 2) * 70}" y="${104 + Math.floor(i / 2) * 106}" width="60" height="80" fill="var(--g-biel)"/><circle cx="${90 + (i % 2) * 70}" cy="${164 + Math.floor(i / 2) * 106}" r="8" fill="${i < 2 ? "var(--akcent)" : "none"}" class="k1"/><path d="M${68 + (i % 2) * 70} ${120 + Math.floor(i / 2) * 106}h44M${68 + (i % 2) * 70} ${132 + Math.floor(i / 2) * 106}h44" stroke="var(--g-czern)" opacity=".5"/>`).join("") + R.t(125, 72, "DYPLOMY", 14, { ls: 2, op: .75 });
      s += `<path class="k" d="M1080 ${YP}v-90" stroke-width="5"/><path class="k" d="M1050 ${YP - 90}q0-70 30-70t30 70z" fill="var(--g-biel)"/><circle class="k" cx="1080" cy="${YP - 176}" r="18" fill="var(--g-skora)"/><path class="k" d="M1062 ${YP - 190}q18-30 36 0v-14q-18-12-36 0z" fill="var(--g-biel)"/><path class="k" d="M1050 ${YP}h60"/>`
        + `<path class="k" d="M1150 ${YP}v-170" stroke-width="4"/><path class="k" d="M1132 ${YP - 150}h36l-8 100h-20z" fill="var(--g-mieso)"/>` + R.wieszak(1010, YP);
      // rzutnik folii na stoliku, wykładowca
      s += `<rect class="k" x="560" y="330" width="130" height="10" fill="var(--g-drewno)"/><path class="k" d="M574 340v40M676 340v40" stroke-width="4"/><rect class="k" x="590" y="300" width="70" height="30" fill="var(--g-metal2)"/><path class="k bez" d="M650 300v-40h-30" stroke-width="4"/><rect class="k" x="596" y="252" width="34" height="14" fill="var(--g-metal)"/>` + `<path class="efekt" d="M612 252l-60-100h180z" fill="var(--g-biel)" opacity=".12"/>`;
      s += R.osoba("bywalec-judym", 460, 440, 0.86) + `<path class="k" d="M494 300l70-80" stroke-width="3" stroke="var(--g-drewno)"/>`;
      // ławki z pulpitami na pierwszym planie, uczeń-pracownik przy jednej
      s += R.osobaZa("obsluga-kucharz", 315, 486, 640, 1.0, "zwykla") + lawka(200, 482) + lawka(500, 482) + lawka(800, 482) + R.papiery(560, 482, 3) + R.papiery(860, 482, 2);
      return s;
    },
    punkty: [
      { x: 244, y: 44, w: 732, h: 242, et: "Kursy", teczka: { tytul: "Zapisz na szkolenie", okruszek: "tablica", zakladki: ["Kursy", "Trwają"], wstep: "Szkolenie działa tydzień po tygodniu. Pracownik na kursie pracuje normalnie, a po kursie robi to samo lepiej.",
        pola: [["Kto", "Staszek B., kucharz ▾"], ["Kurs", "Szybki nóż ▾", "2 tygodnie; cena z katalogu szkoleń"], ["Higiena i HACCP dla całego zespołu", "zapisz wszystkich"]], decyzje: ["szkolenia"], ekran: "szkolenia", funkcja: "rozwoj" } },
      { x: 34, y: 60, w: 182, h: 276, et: "Dyplomy", teczka: { tytul: "Ukończone szkolenia", okruszek: "gablota", wstep: "Kto z zespołu co ukończył.", pola: [["Ola W.: Obsługa gościa", "✓ tydzień 8"], ["Staszek B.: Higiena i HACCP", "✓ tydzień 7"]], ekran: "szkolenia (historia)", tryb: "wyniki", funkcja: "rozwoj" } },
      { x: 1000, y: 150, w: 190, h: 236, et: "Udogodnienia", gdzie: "prawy-brzeg", odsyla: { kto: "Wykładowca", tekst: "Kanapę i czajnik dla zespołu kupuje się w Galerii „Pod Zegarem”. U nas tylko wiedza.", miejsce: "Galeria „Pod Zegarem”" } },
    ],
    osoby: [{ x: 460, stopy: 440, s: 0.86, imie: "Wykładowca", tekst: "Kebab kroi się nożem, ale zarabia się głową. Zapraszam na kurs, miejsca są.", powitanie: true }],
  };
}
