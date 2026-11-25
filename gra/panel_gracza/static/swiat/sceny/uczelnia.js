// Scena wnętrza „uczelnia” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/uczelnia.md.
// TYTUL: Pracownia Analiz UMCS (stół z mapą stref, kalendarz-zdzierak, wykres) | Analiza
// KOLEJNOSC: 82
// Klienci w strefach, kalendarz miasta, prognoza (funkcja analiza). Detektyw ma własny żeton, więc tu tylko odsyłacz.
export default function (R) {
  const YP = 390;
  return {
    id: "uczelnia", tytul: "Pracownia Analiz UMCS", adres: "Miasteczko akademickie UMCS", opis: "Pracownia naukowa: duży stół z mapą Lublina i pinezkami, wykres słupkowy na sztaludze, kalendarz-zdzierak, regał z segregatorami.",
    rysuj: (R) => {
      let s = R.sciana() + R.boazeria(310, YP) + R.podloga("parkiet", YP, "var(--g-podloga)") + R.lampa(600, 30) + R.okno(420, 70, 170, 190, { firanka: true }) + R.okno(640, 70, 170, 190, {});
      // wykres słupkowy na sztaludze
      s += `<path class="k" d="M90 ${YP + 30}l60-330M250 ${YP + 30}l-60-330M170 ${YP + 30}v-120" stroke-width="5" stroke="var(--g-drewno)"/><rect class="k3" x="60" y="90" width="220" height="190" fill="var(--g-biel)"/>` + R.t(170, 114, "POPYT W STREFACH", 13, { fill: "var(--g-czern)", ls: 1 })
        + [70, 120, 50, 96, 140].map((h, i) => `<rect class="k1" x="${80 + i * 38}" y="${262 - h}" width="28" height="${h}" fill="${R.KOL[i % 4 === 1 ? 4 : i % 4]}"/>`).join("") + `<path d="M72 262h196" stroke="var(--g-czern)" stroke-width="2"/>`;
      // kalendarz-zdzierak i regał
      s += `<rect class="k3" x="960" y="70" width="170" height="180" fill="var(--g-biel)"/><rect class="k" x="960" y="70" width="170" height="40" fill="var(--akcent)"/>` + R.t(1045, 98, "LISTOPAD", 17, { fill: "var(--papier)", ls: 2 }) + R.t(1045, 176, "9", 70, { fill: "var(--g-czern)", f: "gruby" }) + R.t(1045, 204, "poniedziałek", 14, { fill: "var(--g-czern)", f: "tekst", bez: true }) + R.t(1045, 234, "Juwenalia za 2 tyg.", 13, { fill: "var(--g-czern)", f: "tekst", bez: true, w: 156 });
      s += R.regal(960, 270, 220, 120, 2, R.segregatory, "var(--g-drewno)");
      // stół z mapą stref
      s += `<path class="k3" d="M300 420h620l50 80h-720z" fill="var(--g-biel)"/><path class="k" d="M250 500h720v16h-720z" fill="var(--g-drewno)"/><path class="k" d="M280 516v90M940 516v90" stroke-width="7"/>`;
      s += `<path d="M330 492q120-60 260-30t280-34" fill="none" stroke="var(--akcent-2)" stroke-width="7" opacity=".7"/>` + [[380, 446, "var(--g-zielen)"], [520, 436, "var(--g-sciana2)"], [660, 440, "var(--uwaga)"], [800, 434, "var(--g-skora2)"], [450, 476, "var(--g-skora)"], [730, 480, "var(--g-zielen)"]].map(([x, y, k], i) => `<path class="k1" d="M${x} ${y}l70-8 20 22-80 12z" fill="${k}" opacity=".7"/><path class="k" d="M${x + 44} ${y + 10}v-22" stroke-width="2"/><circle class="k1" cx="${x + 44}" cy="${y - 14}" r="7" fill="${i % 2 ? "var(--akcent)" : "var(--akcent-2)"}"/>`).join("");
      s += `<circle class="k3 bez" cx="900" cy="470" r="20"/><path class="k" d="M914 484l26 22" stroke-width="6"/>` + R.t(610, 548, "MAPA STREF · LUBLIN", 15, { fill: "var(--g-biel)", ls: 2 });
      s += R.osoba("bywalec-jozio", 190, 606, 0.86) + R.fikus(1180, 600, 0.95) + R.maszyna(1010, 270, 0.7);
      s += R.biegacz(380, 584, 420, 22, "var(--akcent-2)") + R.doniczka(80, 596, 1.2) + R.krzeslaRzad(1000, 598, 3);
      return s;
    },
    punkty: [
      { x: 244, y: 404, w: 732, h: 120, et: "Klienci w strefach", teczka: { tytul: "Kto mieszka w której strefie", okruszek: "stół z mapą", wstep: "Grupy klientów w strefach miasta: ilu ich jest, ile są gotowi zapłacić, czego szukają.", pola: [["Miasteczko akademickie", "studenci: dużo, tanio"], ["Śródmieście", "biurowi, turyści: drożej"], ["Twoja strefa", "LSM ▾"]], ekran: "klienci", funkcja: "analiza" } },
      { x: 954, y: 64, w: 182, h: 192, et: "Kalendarz miasta", stan: "!", opisStanu: "wydarzenie za 2 tygodnie", teczka: { tytul: "Wydarzenia w mieście", okruszek: "kalendarz", wstep: "Juwenalia, jarmarki i mecze: kiedy i gdzie przyjdą tłumy.", pola: [["Juwenalia (Miasteczko akademickie)", "za 2 tyg."], ["Mecz Motoru (Zygmuntowskie)", "sobota"]], ekran: "kalendarz", funkcja: "analiza" } },
      { x: 54, y: 84, w: 232, h: 202, et: "Prognoza popytu", teczka: { tytul: "Prognoza na następny tydzień", okruszek: "wykres", wstep: "Ile porcji każdego dania sprzeda się przy Twoich cenach. Prognoza myli się o kilka do kilkunastu procent.", pola: [["Kebab w bułce", "138 porcji"], ["Frytki", "57 porcji"]], ekran: "klienci (prognoza)", funkcja: "analiza" } },
      { x: 954, y: 264, w: 232, h: 132, et: "Konkurencja", gdzie: "prawy-brzeg", odsyla: { kto: "Doktorant", tekst: "My liczymy klientów. Rywali śledzi detektyw „Sokole Oko” przy dworcu.", miejsce: "Biuro „Sokole Oko”" } },
    ],
    osoby: [{ x: 190, stopy: 606, s: 0.86, imie: "Doktorant", tekst: "Dane nie kłamią, najwyżej milczą. Proszę spojrzeć, gdzie mieszkają głodni studenci.", powitanie: true, strona: "prawo" }],
  };
}
