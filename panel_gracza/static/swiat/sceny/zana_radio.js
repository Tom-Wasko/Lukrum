// Scena wnętrza „zana_radio”: piętro Domu reklamy (biurowiec przy ul. Zana 39), wybierane w windzie (winda_zana). Pokój z makiety dom_reklamy
// (archiwum/fable-17.11/fable-wnetrza) powiększony na całą scenę. Decyzja szefa 18.11.2026: każde piętro to osobna scena.
// TYTUL: „Fala Koziołka” (studio radiowe, billboard) | Reklama
// KOLEJNOSC: 22
// SYMBOLE: postacie-bywalec-papkin
// Kanały: dane/mapa/reklama.yaml.
export default function (R) {
  const K = 1.43, TX = -355, TY = 306, YP = 455;   // pokój 850×104 z makiety: x 250–1100 → 0–1215, linia podłogi na y = 455
  const bx = (x) => Math.round((x - 250) * K + 2), by = (y) => Math.round(TY + y * K);
  const ludzik = (n, cx, mina) => R.osoba(n, cx, 101, 0.36, mina);

  const pokoj = () => {
    let s = "";
    s += `<rect class="k" x="520" y="20" width="250" height="${104 - 30}" fill="var(--g-tablica)"/><rect class="k1" x="530" y="28" width="230" height="40" fill="var(--g-szklo)" opacity=".5"/>` + ludzik("bywalec-papkin", 600)
      + `<path class="k bez" d="M650 94v-30l22-10" stroke-width="3"/><rect class="k" x="668" y="44" width="12" height="20" rx="6" fill="var(--g-metal)"/><rect class="k" x="690" y="74" width="70" height="20" fill="var(--g-metal2)"/>`
      + `<rect class="k" x="790" y="24" width="96" height="24" rx="4" fill="var(--g-czern)"/><g class="neon">` + R.t(838, 41, "NA ANTENIE", 13, { fill: "var(--akcent)" }) + `</g>`;
    s += `<path class="k" d="M960 94v-34M1040 94v-34" stroke-width="3"/>` + R.plakat(930, 22, 140, 42, ["BILLBOARD", "przy rondzie"], "var(--akcent-2)", 12);
    s += `<path class="k" d="M250 104h850" />`;
    return s;
  };
  return {
    id: "zana_radio", tytul: "„Fala Koziołka”", adres: "ul. Zana 39, piętro 2", wroc: "Winda", wrocDo: "winda_zana.html",
    opis: "Piętro drugie: studio radiowe za szybą, mikrofon, lampka „NA ANTENIE” i makieta billboardu. Tu zamawia się spoty w radiu i billboardy przy rondach.",
    rysuj: (R) => {
      let s = R.sciana("var(--g-sciana2)", YP) + R.podloga("wykladzina", YP, "color-mix(in srgb, var(--akcent-2) 25%, var(--g-podloga))") + `<rect x="0" y="0" width="1220" height="26" fill="var(--g-metal2)" opacity=".5"/>`
        + R.swietlowka(130, 26, 170) + R.swietlowka(530, 26, 170) + R.swietlowka(930, 26, 170);
      s += `<rect class="k" x="12" y="60" width="130" height="186" fill="var(--g-sciana2)" opacity=".5"/>` + R.okno(40, 86, 150, 130, { zaluzje: true })
        + R.szyld(660, 52, 470, 56, "„Fala Koziołka”", { tlo: "var(--g-tablica)", tekst: "var(--g-biel)", r: 22 }) + R.t(660, 132, "radio · billboardy", 15, { f: "tekst", bez: true, op: .85 })
        + R.tabliczka(1120, 70, 150, "Piętro 2", "Biurowiec przy Zana · ul. Zana 39");
      s += `<g transform="translate(${TX} ${TY}) scale(${K})">` + pokoj() + `</g>`;
      s += R.osoba("bywalec-papkin", 400, 600, 0.85, "zwykla") + R.fikus(70, 590, 0.9);
      return s;
    },
    punkty: () => [{ x: 8, y: by(0) + 4, w: 1204, h: Math.round(104 * K) - 8, et: "Radio i billboard", gdzie: "gora", 
      teczka: { tytul: "„Fala Koziołka”", okruszek: "piętro 2", wstep: "Kampania = kanał × strefa × liczba emisji. Działa od następnego tygodnia.",
        pola: [["Billboard przy rondzie", "strefa ▾ · tygodnie"], ["Spot w „Radiu Tichy”", "całe miasto · emisje"]], decyzje: ["kampanie"], ekran: "agencje", funkcja: "marketing" } }],
    osoby: [{ x: 400, stopy: 600, s: 0.85, imie: "Redaktor", tekst: "Spot piętnaście sekund, kebab trzy razy. Słuchacze to zapamiętają, o ile nie przełączą na disco polo.", powitanie: true }],
  };
}
