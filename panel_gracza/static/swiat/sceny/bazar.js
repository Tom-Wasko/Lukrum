// Scena wnętrza „bazar” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/bazar.md.
// TYTUL: Bazar (stragany drużyn: giełda handlu) – propozycja nowego żetonu | Miasto
// KOLEJNOSC: 96
// Giełda handlu (decyzje `handel_wystaw`, `handel_licytuj`; funkcja handel; od tygodnia 6). Każdy stragan to ogłoszenie innej drużyny.
// Limity z dane/zdarzenia/handel.yaml: najwyżej 5 ogłoszeń, cena wywoławcza 50–200% wartości, przebicie o 3%.
export default function (R) {
  const YP = 430, S = [["Rożen Express", "Tortilla ★★ × 3", "od 35 zł", "prowadzi: Pita Pany 41 zł"], ["Pita Pany", "Frytownica ★", "od 750 zł", "bez ofert"], ["Kebab u Koziołka", "Napój ★★ × 5", "od 150 zł", "! przebito Was: 171 zł"]];
  const stragan = (x, i, [kto, co, od]) => `<path class="k" d="M${x + 110} ${YP - 10}v-190" stroke-width="5"/><path class="k3" d="M${x} ${YP - 196}q110-90 220 0z" fill="${R.KOL[i === 1 ? 4 : i]}"/>` + [0.25, 0.5, 0.75].map((f) => `<path d="M${x + 220 * f} ${YP - 196}q${(0.5 - f) * 60}-50 ${(0.5 - f) * 220}-66" fill="none" stroke="var(--papier)" stroke-width="3" opacity=".6"/>`).join("")
    + `<rect class="k3" x="${x + 10}" y="${YP - 80}" width="200" height="14" fill="var(--g-drewno2)"/><path class="k" d="M${x + 24} ${YP - 66}l-14 66M${x + 196} ${YP - 66}l14 66M${x + 60} ${YP - 66}l30 66M${x + 160} ${YP - 66}l-30 66" stroke-width="4"/>`
    + [0, 1, 2, 3].map((k) => `<rect class="k1" x="${x + 24 + k * 44}" y="${YP - 110 - (k % 2) * 8}" width="36" height="${30 + (k % 2) * 8}" fill="${R.KOL[(k + i) % 4]}"/>`).join("")
    + `<rect class="k" x="${x + 20}" y="${YP - 176}" width="180" height="50" fill="var(--g-biel)"/>` + R.t(x + 110, YP - 156, kto, 14, { fill: "var(--g-czern)", f: "gruby", w: 168 }) + R.t(x + 110, YP - 138, co, 12.5, { fill: "var(--g-czern)", f: "tekst", bez: true, w: 168 }) + R.cenowka(x + 60, YP - 56, od, 100);
  return {
    id: "bazar", tytul: "Bazar", adres: "plac targowy (miejsce na mapie do ustalenia)", opis: "Plac targowy: trzy stragany pod parasolami z ogłoszeniami innych drużyn, własny stragan z pustym stołem, tablica Kupię / Sprzedam, licytator z dzwonkiem.",
    rysuj: (R) => {
      let s = `<rect width="1220" height="${YP}" fill="var(--g-niebo)"/>` + [0, 1, 2, 3, 4].map((i) => `<rect class="k" x="${i * 250 - 20}" y="${120 + (i % 2) * 40}" width="250" height="${YP - 120 - (i % 2) * 40}" fill="${["var(--g-sciana)", "var(--g-sciana2)", "var(--g-biel)"][i % 3]}"/>` + [0, 1, 2].map((k) => `<rect class="k1" x="${i * 250 + 10 + k * 70}" y="${170 + (i % 2) * 40}" width="36" height="50" fill="var(--g-szklo)"/>`).join("")).join("") + R.podloga("bruk", YP, "var(--g-podloga2)");
      s += S.map((d, i) => stragan(50 + i * 260, i, d)).join("");
      // własny stragan: pusty stół, tabliczka
      s += `<path class="k" d="M970 ${YP - 10}v-190" stroke-width="5"/><path class="k3" d="M860 ${YP - 196}q110-90 220 0z" fill="var(--akcent)"/><rect class="k3" x="870" y="${YP - 80}" width="200" height="14" fill="var(--g-drewno2)"/><path class="k" d="M884 ${YP - 66}l-14 66M1056 ${YP - 66}l14 66" stroke-width="4"/><rect class="k" x="880" y="${YP - 176}" width="180" height="50" fill="var(--uwaga)"/>` + R.t(970, YP - 146, "TWÓJ STRAGAN", 15, { fill: "var(--g-czern)" }) + `<rect class="bez" x="890" y="${YP - 118}" width="160" height="36" stroke="var(--tusz)" stroke-width="2" stroke-dasharray="8 6"/>` + R.t(970, YP - 94, "wystaw towar albo sprzęt", 12, { f: "tekst", bez: true });
      // tablica Kupię / Sprzedam, waga szalkowa, licytator, kupujący
      s += `<path class="k" d="M1150 ${YP + 60}v-260" stroke-width="7" stroke="var(--g-drewno)"/><rect class="k3" x="1100" y="200" width="100" height="130" fill="var(--g-biel)"/>` + R.t(1150, 224, "KUPIĘ", 13, { fill: "var(--g-czern)" }) + R.t(1150, 284, "SPRZEDAM", 13, { fill: "var(--g-czern)" }) + [240, 252, 300, 312].map((y) => `<path d="M1110 ${y}h80" stroke="var(--g-czern)" opacity=".5"/>`).join("");
      s += `<path class="k" d="M330 560v-70M290 500h80" stroke-width="4"/><path class="k" d="M270 520h40l-6 14h-28zM350 512h40l-6 14h-28z" fill="var(--g-metal)"/><path class="k" d="M290 500v20M370 500v12"/>` + R.osoba("bywalec-papkin", 620, 606, 0.86) + `<path class="k" d="M664 470q0-18 14-18t14 18z" fill="var(--uwaga)"/><path class="k" d="M678 452v-10"/>` + R.osoba("gosc-sasiadka", 180, 606, 0.8) + R.osoba("gosc-student", 880, 606, 0.8, "zwykla");
      return s;
    },
    punkty: [
      { x: 44, y: 150, w: 790, h: 290, et: "Okazje", stan: "!", opisStanu: "ktoś przebił Waszą ofertę", teczka: { tytul: "Ogłoszenia innych drużyn", okruszek: "stragany", wstep: "Licytacja jest jawna i trwa cały tydzień. Kolejna oferta musi przebić prowadzącą o co najmniej 3%. Wygrywa najwyższa przy zamknięciu tygodnia.",
        pola: S.map(([kto, co, od, stan]) => [`${kto}: ${co}`, od, stan]).concat([["Twoja oferta", "kwota"]]), decyzje: ["handel_licytuj"], ekran: "handel", funkcja: "handel" } },
      { x: 854, y: 150, w: 232, h: 290, et: "Twój stragan", teczka: { tytul: "Wystaw towar albo sprzęt", okruszek: "własny stragan", wstep: "Najwyżej 5 ogłoszeń w tygodniu. Cena wywoławcza od 50% do 200% wartości. Licytacja w następnym tygodniu.", pola: [["Co", "Napój ★★ ▾"], ["Ile opakowań", "2"], ["Cena wywoławcza", "60 zł"]], decyzje: ["handel_wystaw"], ekran: "handel", funkcja: "handel" } },
      { x: 1094, y: 190, w: 112, h: 150, et: "Zakończone", gdzie: "prawy-brzeg", teczka: { tytul: "Zakończone transakcje", okruszek: "tablica", wstep: "Co kto kupił i za ile. Obie strony dostały fakturę.", pola: [["Tydzień 6: Pita mrożona ★ × 2", "sprzedano za 71 zł"]], ekran: "handel (historia)", funkcja: "handel" } },
    ],
    osoby: [{ x: 620, stopy: 606, s: 0.86, imie: "Licytator", tekst: "Kto da więcej? Nadwyżka u jednych to okazja dla drugich.", powitanie: true }],
  };
}
