// Scena wnętrza „zana_portiernia”: piętro Domu reklamy (biurowiec przy ul. Zana 39), wybierane w windzie (winda_zana). Pokój z makiety dom_reklamy
// (archiwum/fable-17.11/fable-wnetrza) powiększony na całą scenę. Decyzja szefa 18.11.2026: każde piętro to osobna scena.
// TYTUL: Portiernia Domu reklamy (lada, klucze, spis pięter, drzwi do pokoju z księgą) | Reklama
// KOLEJNOSC: 19
// SYMBOLE: postacie-bywalec-zagloba
// Kanały: dane/mapa/reklama.yaml.
export default function (R) {
  const K = 1.43, TX = -355, TY = 306, YP = 455;   // pokój 850×104 z makiety: x 250–1100 → 0–1215, linia podłogi na y = 455
  const bx = (x) => Math.round((x - 250) * K + 2), by = (y) => Math.round(TY + y * K);
  const gra = () => R.gra || { tydzien: 1, odRundy: () => 0 };
  const zamkniete = (p) => p.scena === "zana_internet" && (gra().odRundy("internet") || 0) > gra().tydzien;
  // piętra (jak w windzie: winda_zana.js); parter to ta portiernia
  const PIETRA = [
    { nr: "4", firma: "Internet", pod: "Lajk i Spółka", scena: "zana_internet" },
    { nr: "3", firma: "Eventy", pod: "Kozi Gród Events", scena: "zana_eventy" },
    { nr: "2", firma: "Radio", pod: "Fala Koziołka", scena: "zana_radio" },
    { nr: "1", firma: "Drukarnia", pod: "Papier Przyjmie", scena: "zana_drukarnia" },
  ];
  const ludzik = (n, cx, mina) => R.osoba(n, cx, 101, 0.36, mina);

  const pokoj = () => {
    let s = "";
    s += `<rect class="k" x="520" y="20" width="110" height="44" fill="var(--g-drewno)"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path class="k1" d="M${532 + (i % 4) * 26} ${28 + Math.floor(i / 4) * 18}v8" stroke-width="2.5" stroke="var(--uwaga)"/>`).join("");
    s += R.lada(500, 62, 150, 42, { panele: false }) + R.telefon(610, 62);
    // spis pięter (podróż 03/wyniki, Z38): która agencja jest na którym piętrze; wiersze są klikalne (punkty niżej)
    s += `<rect class="k3" x="688" y="4" width="236" height="98" fill="var(--g-tablica)"/>` + R.t(806, 17, "SPIS PIĘTER", 12, { fill: "var(--g-biel)", ls: 1.5 })
      + PIETRA.map((p, i) => R.t(698, 34 + i * 15, `${p.nr}  ${p.firma}`, 11, { fill: "var(--g-biel)", kot: "start", w: 112 })
        + R.t(914, 34 + i * 15, zamkniete(p) ? `od tyg. ${gra().odRundy("internet")}` : p.pod, 10, { fill: "var(--g-biel)", f: "tekst", kot: "end", w: 110 })).join("")
      + R.t(698, 95, "↑  Winda: wszystkie piętra", 12, { fill: "var(--g-biel)", kot: "start", w: 200 });
    s += R.drzwi(1010, 14, 60, 90, { typ: "matowa", napis: "POK. 12" }) + R.paprotka(950, 70, 0.55) + `<rect class="k1" x="938" y="88" width="24" height="6" fill="var(--g-drewno)"/>`;
    s += `<path class="k" d="M250 104h850" />`;
    return s;
  };
  return {
    id: "zana_portiernia", tytul: "Portiernia Domu reklamy", adres: "ul. Zana 39, parter", wroc: "Winda", wrocDo: "winda_zana.html",
    opis: "Parter Domu reklamy: portiernia ze spisem pięter (która agencja gdzie), przejściem do windy i drzwiami do pokoju z księgą firmy (KPiR).",
    rysuj: (R) => {
      let s = R.sciana("var(--g-sciana)", YP) + R.podloga("wykladzina", YP, "color-mix(in srgb, var(--akcent-2) 25%, var(--g-podloga))") + `<rect x="0" y="0" width="1220" height="26" fill="var(--g-metal2)" opacity=".5"/>`
        + R.swietlowka(130, 26, 170) + R.swietlowka(530, 26, 170) + R.swietlowka(930, 26, 170);
      s += `<rect class="k" x="12" y="60" width="130" height="186" fill="var(--g-sciana2)" opacity=".5"/>` + R.okno(40, 86, 150, 130, { zaluzje: true })
        + R.szyld(660, 52, 470, 56, "Portiernia", { tlo: "var(--g-tablica)", tekst: "var(--g-biel)", r: 22 }) + R.t(660, 132, "klucze · spis pięter · księga", 15, { f: "tekst", bez: true, op: .85 })
        + R.tabliczka(1112, 70, 176, "Parter", "Biurowiec przy Zana · ul. Zana 39");
      s += `<g transform="translate(${TX} ${TY}) scale(${K})">` + pokoj() + `</g>`;
      s += R.osoba("bywalec-zagloba", 130, 604, 0.85, "zwykla");
      s += R.wycieraczka(560, 590, 120) + R.doniczka(1170, 596, 1);
      return s;
    },
    punkty: () => [
      ...PIETRA.map((p, i) => ({ x: bx(688), y: by(22 + i * 15), w: Math.round(236 * K), h: Math.round(15 * K), et: `Piętro ${p.nr}: ${p.firma.toLowerCase()}`,
        nazwa: `Piętro ${p.nr}: ${p.firma}`, gdzie: "gora", cichy: true, wejscie: `${p.scena}.html`, zamkniete: zamkniete(p) ? `od tyg. ${gra().odRundy("internet")}` : "" })),
      { x: bx(688), y: by(84), w: Math.round(236 * K), h: Math.round(16 * K), et: "Winda: wszystkie piętra", nazwa: "Winda", gdzie: "gora", cichy: true, wejscie: "winda_zana.html" },
      { x: bx(1002), y: by(8), w: Math.round(76 * K), h: Math.round(96 * K), et: "Pokój 12: księga firmy", nazwa: "Pokój z księgą firmy", gdzie: "wewn", cichy: true, wejscie: "pokoj_ksiegi.html" },
    ],
    osoby: [{ x: 130, stopy: 604, s: 0.85, imie: "Portier", tekst: "Spis pięter wisi na tablicy: drukarnia pierwsze, radio drugie, festyny trzecie, internet czwarte. Księga firmy w pokoju dwunastym, na wprost.", powitanie: true }],
  };
}
