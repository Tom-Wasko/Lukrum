// Scena wnętrza „zana_drukarnia”: piętro Domu reklamy (biurowiec przy ul. Zana 39), wybierane w windzie (winda_zana). Pokój z makiety dom_reklamy
// (archiwum/fable-17.11/fable-wnetrza) powiększony na całą scenę. Decyzja szefa 18.11.2026: każde piętro to osobna scena.
// TYTUL: Drukarnia „Papier Przyjmie” (maszyna, ryzy, plakaty na sznurku) | Reklama
// KOLEJNOSC: 21
// SYMBOLE: postacie-sprzedawca
// Kanały: dane/mapa/reklama.yaml.
export default function (R) {
  const K = 1.43, TX = -355, TY = 306, YP = 455;   // pokój 850×104 z makiety: x 250–1100 → 0–1215, linia podłogi na y = 455
  const bx = (x) => Math.round((x - 250) * K + 2), by = (y) => Math.round(TY + y * K);
  const ludzik = (n, cx, mina) => R.osoba(n, cx, 101, 0.36, mina);

  const pokoj = () => {
    let s = "";
    s += `<rect class="k" x="540" y="50" width="150" height="46" fill="var(--g-metal2)"/><circle class="k" cx="575" cy="50" r="18" fill="var(--g-metal)"/><circle class="k" cx="625" cy="46" r="22" fill="var(--g-tablica)"/><circle class="k" cx="668" cy="52" r="14" fill="var(--g-metal)"/><path class="k" d="M690 66h44v6h-44z" fill="var(--g-biel)"/>`;
    s += [0, 1, 2].map((i) => `<rect class="k1" x="${760 + i * 4}" y="${86 - i * 9}" width="56" height="9" fill="var(--g-biel)"/>`).join("") + `<path class="k1 bez" d="M850 22q110 16 220 0"/>`
      + [0, 1, 2, 3].map((i) => `<rect class="k1" x="${866 + i * 50}" y="${28 + (i % 2) * 3}" width="38" height="48" fill="${R.KOL[i]}"/>`).join("") + ludzik("sprzedawca", 500);
    s += `<path class="k" d="M250 104h850" />`;
    return s;
  };
  return {
    id: "zana_drukarnia", tytul: "Drukarnia „Papier Przyjmie”", adres: "ul. Zana 39, piętro 1", wroc: "Winda", wrocDo: "winda_zana.html",
    opis: "Piętro pierwsze: maszyna drukarska z walcami, ryzy papieru i plakaty na sznurku. Tu zamawia się ulotki, plakaty i ogłoszenia w gazecie.",
    rysuj: (R) => {
      let s = R.sciana("var(--g-sciana)", YP) + R.podloga("wykladzina", YP, "color-mix(in srgb, var(--akcent-2) 25%, var(--g-podloga))") + `<rect x="0" y="0" width="1220" height="26" fill="var(--g-metal2)" opacity=".5"/>`
        + R.swietlowka(130, 26, 170) + R.swietlowka(530, 26, 170) + R.swietlowka(930, 26, 170);
      s += `<rect class="k" x="12" y="60" width="130" height="186" fill="var(--g-sciana2)" opacity=".5"/>` + R.okno(40, 86, 150, 130, { zaluzje: true })
        + R.szyld(660, 52, 470, 56, "Drukarnia „Papier Przyjmie”", { tlo: "var(--g-tablica)", tekst: "var(--g-biel)", r: 22 }) + R.t(660, 132, "ulotki · plakaty · gazeta", 15, { f: "tekst", bez: true, op: .85 })
        + R.tabliczka(1120, 70, 150, "Piętro 1", "Dom reklamy · Zana 39");
      s += `<g transform="translate(${TX} ${TY}) scale(${K})">` + pokoj() + `</g>`;
      s += R.osoba("sprzedawca", 400, 600, 0.85) + R.paprotka(70, 580, 0.9);
      return s;
    },
    punkty: () => [{ x: 8, y: by(0) + 4, w: 1204, h: Math.round(104 * K) - 8, et: "Ulotki i plakaty", gdzie: "gora", 
      teczka: { tytul: "Drukarnia „Papier Przyjmie”", okruszek: "piętro 1", wstep: "Kampania = kanał × strefa × liczba emisji. Działa od następnego tygodnia.",
        pola: [["Ulotki za wycieraczki", "strefa ▾ · emisje 1–4"], ["Plakaty na słupach ogłoszeniowych", "strefa ▾ · emisje"], ["Ogłoszenie w „Gazecie Pana Cogito”", "całe miasto"]], decyzje: ["kampanie"], ekran: "agencje", funkcja: "marketing" } }],
    osoby: [{ x: 400, stopy: 600, s: 0.85, imie: "Pan Zdzisław", tekst: "Wydrukuję wszystko, co da się złożyć na pół. Z literówkami gratis.", powitanie: true }],
  };
}
