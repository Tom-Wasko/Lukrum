// Scena wnętrza „zana_eventy”: piętro Domu reklamy (biurowiec przy ul. Zana 39), wybierane w windzie (winda_zana). Pokój z makiety dom_reklamy
// (archiwum/fable-17.11/fable-wnetrza) powiększony na całą scenę. Decyzja szefa 18.11.2026: każde piętro to osobna scena.
// TYTUL: „Kozi Gród Events” (stół degustacyjny, balony, namiot) | Reklama
// KOLEJNOSC: 23
// SYMBOLE: postacie-gosc-student
// Kanały: dane/mapa/reklama.yaml.
export default function (R) {
  const K = 1.43, TX = -355, TY = 306, YP = 455;   // pokój 850×104 z makiety: x 250–1100 → 0–1215, linia podłogi na y = 455
  const bx = (x) => Math.round((x - 250) * K + 2), by = (y) => Math.round(TY + y * K);
  const ludzik = (n, cx, mina) => R.osoba(n, cx, 101, 0.36, mina);

  const pokoj = () => {
    let s = "";
    s += `<path class="k1 bez" d="M500 18q280 26 580 0"/>` + Array.from({ length: 13 }, (_, i) => `<path class="k1" d="M${520 + i * 44} ${22 + Math.sin(i / 4) * 6}l10 16 10-16z" fill="${R.KOL[i % 4]}"/>`).join("");
    s += R.lada(560, 64, 170, 40, { panele: false, front: "var(--g-biel)" }) + [0, 1, 2].map((i) => `<path class="k1" d="M${584 + i * 46} 64h22l-4-12h-14z" fill="var(--g-mieso)"/>`).join("") + ludzik("gosc-student", 780)
      + [0, 1, 2].map((i) => `<path class="k1 bez" d="M${880 + i * 22} 94q4-20 ${-6 + i * 6}-34"/><ellipse class="k1" cx="${874 + i * 28}" cy="46" rx="13" ry="16" fill="${R.KOL[(i * 2) % 4]}"/>`).join("")
      + R.skrzynka(980, 54, 90, 40, "var(--g-drewno2)", "NAMIOT");
    s += `<path class="k" d="M250 104h850" />`;
    return s;
  };
  return {
    id: "zana_eventy", tytul: "„Kozi Gród Events”", adres: "ul. Zana 39, piętro 3", wroc: "Winda", wrocDo: "winda_zana.html",
    opis: "Piętro trzecie: stół degustacyjny, balony, chorągiewki i skrzynie z namiotem. Tu zamawia się degustacje na festynach i Noc Kebaba.",
    rysuj: (R) => {
      let s = R.sciana("var(--g-sciana)", YP) + R.podloga("wykladzina", YP, "color-mix(in srgb, var(--akcent-2) 25%, var(--g-podloga))") + `<rect x="0" y="0" width="1220" height="26" fill="var(--g-metal2)" opacity=".5"/>`
        + R.swietlowka(130, 26, 170) + R.swietlowka(530, 26, 170) + R.swietlowka(930, 26, 170);
      s += `<rect class="k" x="12" y="60" width="130" height="186" fill="var(--g-sciana2)" opacity=".5"/>` + R.okno(40, 86, 150, 130, { zaluzje: true })
        + R.szyld(660, 52, 470, 56, "„Kozi Gród Events”", { tlo: "var(--akcent-2)", tekst: "var(--g-biel)", r: 22 }) + R.t(660, 132, "festyny · degustacje", 15, { f: "tekst", bez: true, op: .85 })
        + R.tabliczka(1112, 70, 176, "Piętro 3", "Biurowiec przy Zana · ul. Zana 39");
      s += `<g transform="translate(${TX} ${TY}) scale(${K})">` + pokoj() + `</g>`; s += R.zanaDekor("eventy");
      s += R.osoba("gosc-student", 400, 600, 0.85, "zwykla") + R.paprotka(70, 580, 0.9);
      return s;
    },
    punkty: () => [{ x: 8, y: by(0) + 4, w: 1204, h: Math.round(104 * K) - 8, et: "Eventy", gdzie: "gora", 
      teczka: { tytul: "„Kozi Gród Events”", okruszek: "piętro 3", wstep: "Kampania = kanał × strefa × liczba emisji. Działa od następnego tygodnia.",
        pola: [["Degustacja na festynie osiedlowym", "strefa ▾"], ["Noc Kebaba na otrzęsinach", "Miasteczko akademickie"]], decyzje: ["kampanie"], ekran: "agencje", agencja: "kozi_grod", funkcja: "marketing" } }],
    osoby: [{ x: 400, stopy: 600, s: 0.85, imie: "Organizator", tekst: "Festyn bez kebaba to jak wesele bez wujka. Zamawiamy namiot?", powitanie: true }],
  };
}
