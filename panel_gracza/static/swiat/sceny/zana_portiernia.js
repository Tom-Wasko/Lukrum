// Scena wnętrza „zana_portiernia”: piętro Domu reklamy (biurowiec przy ul. Zana 39), wybierane w windzie (winda_zana). Pokój z makiety dom_reklamy
// (archiwum/fable-17.11/fable-wnetrza) powiększony na całą scenę. Decyzja szefa 18.11.2026: każde piętro to osobna scena.
// TYTUL: Portiernia Domu reklamy (lada, klucze, gablota „Twoje kampanie”, drzwi do pokoju z księgą) | Reklama
// KOLEJNOSC: 19
// SYMBOLE: postacie-bywalec-zagloba
// Kanały: dane/mapa/reklama.yaml.
export default function (R) {
  const K = 1.43, TX = -355, TY = 306, YP = 455;   // pokój 850×104 z makiety: x 250–1100 → 0–1215, linia podłogi na y = 455
  const bx = (x) => Math.round((x - 250) * K + 2), by = (y) => Math.round(TY + y * K);
  const ludzik = (n, cx, mina) => R.osoba(n, cx, 101, 0.36, mina);

  const pokoj = () => {
    let s = "";
    s += `<rect class="k" x="520" y="20" width="110" height="44" fill="var(--g-drewno)"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path class="k1" d="M${532 + (i % 4) * 26} ${28 + Math.floor(i / 4) * 18}v8" stroke-width="2.5" stroke="var(--uwaga)"/>`).join("");
    s += R.lada(500, 62, 150, 42, { panele: false }) + R.telefon(610, 62);
    s += `<rect class="k3" x="700" y="12" width="210" height="70" fill="var(--g-drewno2)"/>` + R.t(805, 28, "TWOJE KAMPANIE", 13, { ls: 1.5 })
      + [["ULOTKI", ""], ["RADIO", ""], ["FESTYN", ""]].map(([a, b], i) => `<rect class="k1" x="${708 + i * 66}" y="34" width="60" height="42" fill="var(--g-biel)" transform="rotate(${i - 1} ${738 + i * 66} 55)"/>` + R.t(738 + i * 66, 52, a, 10, { fill: "var(--g-czern)", w: 54 }) + R.t(738 + i * 66, 68, b, 11, { fill: "var(--g-czern)", f: "tekst" })).join("");
    s += R.drzwi(1010, 14, 60, 90, { typ: "matowa", napis: "POK. 12" }) + R.paprotka(950, 70, 0.55) + `<rect class="k1" x="938" y="88" width="24" height="6" fill="var(--g-drewno)"/>`;
    s += `<path class="k" d="M250 104h850" />`;
    return s;
  };
  return {
    id: "zana_portiernia", tytul: "Portiernia Domu reklamy", adres: "ul. Zana 39, parter", wroc: "Winda", wrocDo: "winda_zana.html",
    opis: "Parter Domu reklamy: portiernia z tablicą kluczy, gablota „Twoje kampanie” i drzwi do pokoju z księgą firmy (KPiR).",
    rysuj: (R) => {
      let s = R.sciana("var(--g-sciana)", YP) + R.podloga("wykladzina", YP, "color-mix(in srgb, var(--akcent-2) 25%, var(--g-podloga))") + `<rect x="0" y="0" width="1220" height="26" fill="var(--g-metal2)" opacity=".5"/>`
        + R.swietlowka(130, 26, 170) + R.swietlowka(530, 26, 170) + R.swietlowka(930, 26, 170);
      s += `<rect class="k" x="12" y="60" width="130" height="186" fill="var(--g-sciana2)" opacity=".5"/>` + R.okno(40, 86, 150, 130, { zaluzje: true })
        + R.szyld(660, 52, 470, 56, "Portiernia", { tlo: "var(--g-tablica)", tekst: "var(--g-biel)", r: 22 }) + R.t(660, 132, "klucze · spis firm · kampanie", 15, { f: "tekst", bez: true, op: .85 })
        + R.tabliczka(1120, 70, 150, "Parter", "Dom reklamy · Zana 39");
      s += `<g transform="translate(${TX} ${TY}) scale(${K})">` + pokoj() + `</g>`;
      s += R.osoba("bywalec-zagloba", 130, 604, 0.85, "zwykla");
      return s;
    },
    punkty: () => [
      { x: bx(700), y: by(12), w: Math.round(210 * K), h: Math.round(70 * K), et: "Twoje kampanie", gdzie: "gora", stan: "!", opisStanu: "jedna kampania kończy się w tym tygodniu",
        teczka: { tytul: "Twoje kampanie", okruszek: "gablota przy portierni", wstep: "Co teraz działa, co się kończy i ile kosztuje. Nową kampanię zamawia się na piętrze agencji.",
          pola: [["Ulotki LSM (drukarnia)", "jeszcze 2 tyg.", "3 emisje, strefa LSM"], ["Spot w „Radiu Tichy”", "! kończy się w tym tygodniu"], ["Degustacja na festynie", "✓ odbyła się w tyg. 5"]], ekran: "agencje (podsumowanie)", funkcja: "marketing" } },
      { x: bx(1002), y: by(8), w: Math.round(76 * K), h: Math.round(96 * K), et: "Pokój 12: księga firmy", nazwa: "Pokój z księgą firmy", gdzie: "wewn", cichy: true, wejscie: "pokoj_ksiegi.html" },
    ],
    osoby: [{ x: 130, stopy: 604, s: 0.85, imie: "Portier", tekst: "Drukarnia pierwsze, radio drugie, festyny trzecie. Księga firmy w pokoju dwunastym, na wprost. Windą, windą, schody w malowaniu.", powitanie: true }],
  };
}
