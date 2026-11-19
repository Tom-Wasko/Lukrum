// Scena wnętrza „kamienica_rachmistrzow” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/kamienica_rachmistrzow.md.
// TYTUL: Kamienica rachmistrzów (klatka schodowa, 4 biura) | Księgowość
// KOLEJNOSC: 30
// Klatka schodowa starej kamienicy: dwa biura na parterze, dwa na piętrze (galeria), schody pośrodku, spis lokatorów i skrzynki.
// Dane: dane/mapa/biura.yaml (pakiety S/M/L brutto za miesiąc, OC, ryzyko błędu).
export default function (R) {
  const DOL = 548, PIETRO = 268;
  const BIURA = [
    { id: "jks", nazwa: "J.K.Ś.", pod: "pakiet S 390 zł · OC", x: 90, pietro: 0 },
    { id: "scrooge", nazwa: "Scrooge", pod: "pakiet S 190 zł", x: 1000, pietro: 0 },
    { id: "asteroida_328", nazwa: "Asteroida 328", pod: "pakiet S 590 zł · OC", x: 200, pietro: 1 },
    { id: "jozef_k", nazwa: "Józef K.", pod: "pakiet S 250 zł", x: 890, pietro: 1 },
  ];
  const dy = (b) => (b.pietro ? PIETRO : DOL) - 190;
  function wejscie(b) {
    const y = dy(b), cx = b.x + 65; let s = R.drzwi(b.x, y, 130, 190, { typ: b.id === "jozef_k" ? "matowa" : "drewno", kolor: b.id === "asteroida_328" ? "var(--g-tablica)" : b.id === "scrooge" ? "var(--g-metal2)" : undefined });
    s += b.id === "jozef_k" ? `<rect class="k" x="${cx - 80}" y="${y - 54}" width="160" height="46" rx="3" fill="var(--g-biel)"/>` + R.t(cx, y - 33, "K.", 16, { fill: "var(--g-czern)", f: "gruby" }) + R.t(cx, y - 15, b.pod, 13, { fill: "var(--g-czern)", f: "tekst", w: 150 })
      : R.tabliczka(cx, y - 54, 170, b.nazwa, b.pod);
    if (b.id === "scrooge") s += [0, 1, 2].map((i) => `<rect class="k1" x="${b.x + 104}" y="${y + 60 + i * 26}" width="18" height="12" fill="var(--g-metal)"/>`).join("") + R.kartka(b.x + 22, y + 40, 72, 44, ["W ŚWIĘTA", "nieczynne"], 3, 11);
    if (b.id === "asteroida_328") s += [[20, 30], [70, 22], [100, 60], [40, 78], [86, 100]].map(([a, c]) => `<path d="M${b.x + a} ${y + c}l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z" fill="var(--uwaga)"/>`).join("");
    if (b.id === "jks") s += R.kartka(b.x + 26, y + 34, 78, 30, ["A–Z"], -2, 13) + `<rect class="k1" x="${b.x + 10}" y="${y + 190 - 6}" width="110" height="6" fill="var(--g-rudy)"/>`;
    if (b.id === "jozef_k") s += R.krzeslo(b.x - 40, PIETRO, 0.8) + R.krzeslo(b.x - 84, PIETRO, 0.8) + R.kartka(b.x + 28, y + 110, 76, 44, ["WNIOSKI", "w 3 egz."], -3, 11);
    if (b.moje) s += `<path class="k" d="M${cx + 86} ${y - 8}v-50"/><path class="k" d="M${cx + 86} ${y - 58}h92l-7 11 7 11h-92z" fill="var(--akcent)"/>` + R.t(cx + 128, y - 42, "TWOJE BIURO", 12, { fill: "var(--papier)", w: 76 });
    return s;
  }
  return {
    id: "kamienica_rachmistrzow", tytul: "Kamienica rachmistrzów", adres: "Krakowskie Przedmieście (lokalizacja tymczasowa)", opis: "Klatka schodowa kamienicy z czterema biurami rachunkowymi: J.K.Ś. i Scrooge na parterze, Asteroida 328 i Józef K. na piętrze.",
    rysuj: (R) => {
      let s = R.sciana("var(--g-sciana)", DOL) + R.lamperia(PIETRO + 150, DOL, "color-mix(in srgb, var(--g-zielen) 45%, var(--g-sciana2))") + R.lamperia(120, PIETRO, "color-mix(in srgb, var(--g-zielen) 45%, var(--g-sciana2))") + R.podloga("lastryko", DOL);
      // galeria piętra z balustradą (przerwa na wylot schodów), schody, żarówka na kablu
      s += `<rect class="k3" x="0" y="${PIETRO}" width="1220" height="16" fill="var(--g-podloga2)"/>`;
      for (let i = 0; i < 10; i++) s += `<rect class="k" x="${430 + i * 36}" y="${DOL - (i + 1) * 28}" width="${360 - i * 36 + 20}" height="28" fill="var(--g-podloga)"/>`;
      s += `<path class="k3 bez" d="M430 ${DOL - 70}L790 ${PIETRO - 70}" stroke="var(--g-drewno)" stroke-width="7"/>` + Array.from({ length: 10 }, (_, i) => `<path class="k" d="M${448 + i * 36} ${DOL - 28 - i * 28}v-56" stroke="var(--g-metal2)" stroke-width="3"/>`).join("");
      s += `<path class="k3 bez" d="M0 ${PIETRO - 60}h470M810 ${PIETRO - 60}h410" stroke="var(--g-drewno)" stroke-width="6"/>` + Array.from({ length: 40 }, (_, i) => { const x = 14 + i * 30.5; return x > 470 && x < 810 ? "" : `<path d="M${x} ${PIETRO - 60}v60" stroke="var(--g-metal2)" stroke-width="3"/>`; }).join("");
      s += `<path class="k" d="M610 0v60"/><path class="k" d="M600 60h20v10a10 14 0 0 1-20 0z" fill="var(--uwaga)"/>` + R.snop(610, 84, 120, 180);
      s += BIURA.map(wejscie).join("");
      // spis lokatorów (drewniana tablica), skrzynki na listy, dozorczyni z miotłą, wiadro, wycieraczka przy wejściu
      s += `<rect class="k3" x="246" y="${DOL - 170}" width="168" height="130" rx="3" fill="var(--g-drewno)"/>` + R.t(330, DOL - 148, "SPIS LOKATORÓW", 13, { fill: "var(--g-biel)", ls: 1 })
        + BIURA.map((b, i) => `<rect class="k1" x="256" y="${DOL - 138 + i * 23}" width="148" height="19" fill="var(--g-biel)"/>` + R.t(262, DOL - 124 + i * 23, `${b.pietro ? "I p." : "parter"}  ${b.nazwa}`, 12.5, { fill: "var(--g-czern)", kot: "start", w: 138 })).join("");
      s += [0, 1, 2, 3].map((i) => `<rect class="k" x="${822 + i * 40}" y="${DOL - 150}" width="36" height="48" fill="var(--g-metal)"/><path class="k1" d="M${828 + i * 40} ${DOL - 136}h24"/>` + (i === 0 ? `<path class="k1" d="M830 ${DOL - 140}l14-10 10 12z" fill="var(--g-biel)"/>` : "")).join("");
      s += R.osoba("bywalec-dulska", 700, 604, 0.68, "zwykla") + `<path class="k" d="M742 ${604 - 120}l30 118" stroke="var(--g-drewno)" stroke-width="4"/><path class="k" d="M762 596l22 4-4 12-26-6z" fill="var(--uwaga)"/>`;
      return s;
    },
    punkty: () => BIURA.map((b) => ({ x: b.x - 22, y: dy(b) - 62, w: 174, h: 254, et: "Wejdź", nazwa: `Biuro „${b.nazwa}”`, cichy: true, gdzie: "wewn", wejscie: `biuro_rachunkowe.html?f=${b.id}` }))
      .concat([{ x: 240, y: DOL - 176, w: 180, h: 142, et: "Porównaj biura", gdzie: "gora", teczka: { tytul: "Spis lokatorów: porównanie biur", okruszek: "tablica w sieni", wstep: "Ceny brutto za miesiąc (pakiet M: 120 dokumentów). Zmiana biura kosztuje tydzień pakietu nowego biura.",
        pola: [["J.K.Ś. ★ Twoje biuro: dokładne, z ubezpieczeniem OC", "690 zł", "dopłata 5,50 zł za dokument ponad limit; kadry do 4 osób w cenie; nie myli się"], ["Scrooge: najtańsze, w tygodniu ze świętem zamknięte", "360 zł", "dopłata 3,30 zł; pomyłka w 2 tygodniach na 100, mandat 200 zł płacisz Ty"],
          ["Asteroida 328: bez limitu dokumentów, z OC", "990 zł", "żadnych dopłat za dokumenty; kadry do 6 osób w cenie; nie myli się"], ["Józef K.: tanie, ale zmiana pakietu trwa 2 tygodnie", "450 zł", "dopłata 4,30 zł; pomyłka w 4 tygodniach na 100, bez OC"]], ekran: "biuro (porównanie)" } },
      { x: 814, y: DOL - 158, w: 170, h: 64, et: "Poczta z urzędu", stan: "!", opisStanu: "nowe pismo", gdzie: "gora", teczka: { tytul: "Skrzynka: pisma z urzędu", okruszek: "skrzynki na listy", wstep: "Pisma o błędach w deklaracjach i mandatach. Biuro z OC oddaje mandat w tym samym tygodniu.", pola: [["Tydzień 5: deklaracja VAT bez uwag", "✓"], ["Tydzień 4: pismo z urzędu skarbowego", "! mandat 200 zł", "oddany przez biuro z OC"]], ekran: "biuro (historia błędów)" } }]),
    osoby: [{ x: 700, stopy: 604, s: 0.68, imie: "Dozorczyni", tekst: "Do rachmistrzów? Porządni ludzie, tylko ten z piętra każe na wszystko czekać. Buty wytrzeć!", powitanie: true }],
  };
}
