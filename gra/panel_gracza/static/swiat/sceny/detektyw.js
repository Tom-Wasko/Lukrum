// Scena wnętrza „detektyw” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/detektyw.md.
// TYTUL: Biuro detektywistyczne „Sokole Oko” (tablica ze sznurkiem, biurko z lampą) | Analiza
// KOLEJNOSC: 83
// Raport o rywalu (decyzja `detektyw`, funkcja analiza). Ciasne biuro w klimacie kryminału: żaluzje, pasy światła, prochowiec.
export default function (R) {
  const YP = 400;
  return {
    id: "detektyw", tytul: "Biuro detektywistyczne „Sokole Oko”", adres: "okolice dworca PKP", opis: "Biuro detektywa: okno z żaluzjami, tablica korkowa ze zdjęciami lokali połączonymi sznurkiem, biurko z lampą i maszyną do pisania, szafa na akta.",
    rysuj: (R) => {
      let s = R.sciana("var(--g-sciana2)") + R.podloga("parkiet", YP, "var(--g-drewno2)");
      s += R.okno(60, 70, 240, 220, { zaluzje: true, widok: "var(--g-niebo)" }) + Array.from({ length: 7 }, (_, i) => `<path class="efekt" d="M320 ${96 + i * 30}l300 ${60 + i * 6}v12l-300-${60 + i * 6}z" fill="var(--g-biel)" opacity=".12"/>`).join("");
      // tablica ze zdjęciami lokali i sznurkiem
      s += `<rect class="k3" x="370" y="50" width="400" height="250" fill="var(--g-drewno)"/><rect class="k" x="380" y="60" width="380" height="230" fill="var(--g-drewno2)"/>`;
      const Z = [[400, 80, "KOZIOŁEK"], [530, 90, "ROŻEN EXPRESS"], [650, 76, "PITA PANY"], [450, 190, "SUŁTAN"], [600, 196, "?"]];
      s += `<path class="bez" d="M${Z.map(([x, y]) => `${x + 45} ${y + 10}`).join("L")}" stroke="var(--akcent)" stroke-width="2.5"/>` + Z.map(([x, y, n], i) => `<g transform="rotate(${[-3, 2, -1, 3, -2][i]} ${x + 45} ${y + 40})"><rect class="k1" x="${x}" y="${y}" width="90" height="80" fill="var(--g-biel)"/><rect class="k1" x="${x + 8}" y="${y + 8}" width="74" height="46" fill="var(--g-metal2)"/><path d="M${x + 20} ${y + 54}v-24h50v24" fill="var(--g-szklo)" class="k1"/>` + R.t(x + 45, y + 72, n, 11, { fill: "var(--g-czern)", w: 82 }) + `<circle cx="${x + 45}" cy="${y + 8}" r="4" fill="var(--akcent)"/></g>`).join("");
      // szafa na akta, wieszak z prochowcem, drzwi z matową szybą
      s += [0, 1, 2, 3].map((i) => `<rect class="k" x="820" y="${150 + i * 62}" width="130" height="62" fill="var(--g-metal)"/><rect class="k1" x="860" y="${166 + i * 62}" width="50" height="14" fill="var(--g-biel)"/><rect class="k1" x="874" y="${190 + i * 62}" width="22" height="6" fill="var(--g-metal2)"/>`).join("") + R.t(885, 140, "AKTA", 14, { ls: 3, op: .8 });
      s += R.wieszak(1000, YP) + `<path class="k" d="M978 ${YP - 164}h44l-6-16h-32z" fill="var(--g-drewno)"/><path class="k" d="M968 ${YP - 164}h64" stroke-width="3"/>`;
      s += R.drzwi(1080, 120, 110, 280, { typ: "matowa" }) + `<g transform="translate(1135 210) scale(-1 1)">` + R.t(0, 0, "SOKOLE OKO", 13, { fill: "var(--g-czern)" }) + `</g>`;
      // biurko detektywa: lampa, maszyna, teczki, lornetka
      s += R.osobaZa("gosc-podrozny", 660, 424, 560, 1.05, "zwykla") + R.biurko(400, 420, 440, 140, { front: "var(--g-drewno)", blat: "var(--g-czern)" });
      s += R.maszyna(450, 420, 0.95) + R.teczki(740, 420, 5) + `<path class="k bez" d="M560 420v-50q0-18 26-14" stroke-width="4"/><path class="k" d="M574 350l34 6-10 24z" fill="var(--g-zielen2)"/><path class="efekt" d="M590 380l-50 40h110z" fill="var(--uwaga)" opacity=".25"/>` + `<circle class="k" cx="780" cy="410" r="11" fill="var(--g-czern)"/><circle class="k" cx="806" cy="410" r="11" fill="var(--g-czern)"/>`;
      s += R.krzeslo(250, 604, 1.4, "var(--g-drewno)") + R.kosz(150, 566) + R.kaloryfer(110, 318, 10);
      return s;
    },
    punkty: [
      { x: 390, y: 310, w: 460, h: 256, et: "Zleć śledztwo", teczka: { tytul: "Kogo sprawdzić?", okruszek: "biurko detektywa", wstep: "Detektyw przynosi dokładne dane jednej firmy: ceny, sprzedaż, zespół, zamówienia. Raport przychodzi po tygodniu.", pola: [["Firma", "Rożen Express ▾"], ["Cena raportu", "wg cennika"]], decyzje: ["detektyw"], ekran: "konkurencja", funkcja: "analiza" } },
      { x: 364, y: 44, w: 412, h: 262, et: "Kto jest kim", gdzie: "gora", teczka: { tytul: "Lokale konkurencji", okruszek: "tablica", wstep: "To, co widać z ulicy bez płacenia: gdzie stoją lokale, jakie mają menu i kolejki.", pola: [["Kebab u Koziołka", "Śródmieście · 7 dań"], ["Rożen Express", "LSM · 4 dania"], ["Pita Pany", "Czechów · 5 dań"]], ekran: "konkurencja", funkcja: "analiza" } },
      { x: 814, y: 120, w: 142, h: 284, et: "Raporty", stan: "✓", klasa: "zy", opisStanu: "raport gotowy", teczka: { tytul: "Zamówione raporty", okruszek: "szafa na akta", wstep: "Wszystkie raporty, które już przyszły.", pola: [["Tydzień 5: Pita Pany", "otwórz"]], ekran: "konkurencja (raporty)", funkcja: "analiza" } },
    ],
    osoby: [{ x: 660, stopy: 560, s: 1.05, h: 130, imie: "Detektyw", tekst: "Każdy kebab ma tajemnicę. Za drobną opłatą powiem, ile rywal bierze za tortillę.", powitanie: true }],
  };
}
