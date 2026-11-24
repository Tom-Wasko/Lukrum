// Scena wnętrza „zana_internet”: piętro Domu reklamy (biurowiec przy ul. Zana 39), wybierane w windzie (winda_zana). Pokój z makiety dom_reklamy
// (archiwum/fable-17.11/fable-wnetrza) powiększony na całą scenę. Decyzja szefa 18.11.2026: każde piętro to osobna scena.
// TYTUL: „Lajk i Spółka” (biurka z monitorami, lampa pierścieniowa) | Reklama
// KOLEJNOSC: 24
// SYMBOLE: postacie-bywalec-jozio
// Kanały: dane/mapa/reklama.yaml.
export default function (R) {
  const K = 1.43, TX = -355, TY = 306, YP = 455;   // pokój 850×104 z makiety: x 250–1100 → 0–1215, linia podłogi na y = 455
  const bx = (x) => Math.round((x - 250) * K + 2), by = (y) => Math.round(TY + y * K);
  const ludzik = (n, cx, mina) => R.osoba(n, cx, 101, 0.36, mina);
  const gra = () => R.gra || { tydzien: 1, odRundy: () => 0 };
  const zamkniety = () => (gra().odRundy("internet") || 0) > gra().tydzien;
  const pokoj = () => {
    let s = "";
    s += R.biurko(520, 64, 150, 40) + R.monitor(540, 64, 0.8) + R.monitor(606, 64, 0.8) + R.biurko(720, 64, 110, 40) + R.monitor(748, 64, 0.8);
    s += `<circle class="k3 bez" cx="900" cy="44" r="18" stroke="var(--g-biel)"/><path class="k" d="M900 62v32M884 94h32" stroke-width="3"/><ellipse class="k" cx="1000" cy="84" rx="34" ry="14" fill="var(--akcent-2)"/>`;
    if (zamkniety()) s += `<rect x="250" y="0" width="850" height="104" fill="var(--g-czern)" opacity=".35"/>` + R.kartka(640, 26, 150, 50, [`OD TYGODNIA ${gra().odRundy("internet")}`, "remont, przepraszamy"], -2, 13);
    else s += ludzik("bywalec-jozio", 960);
    s += `<path class="k" d="M250 104h850" />`;
    return s;
  };
  return {
    id: "zana_internet", tytul: "„Lajk i Spółka”", adres: "ul. Zana 39, piętro 4", wroc: "Winda", wrocDo: "winda_zana.html",
    opis: "Piętro czwarte: biurka z monitorami, lampa pierścieniowa i pufa. Tu zamawia się reklamę w internecie: posty, influencerkę, TikToka i wizytówkę w mapach. Otwarte od tygodnia z harmonogramu.",
    rysuj: (R) => {
      let s = R.sciana("var(--g-sciana)", YP) + R.podloga("wykladzina", YP, "color-mix(in srgb, var(--akcent-2) 25%, var(--g-podloga))") + `<rect x="0" y="0" width="1220" height="26" fill="var(--g-metal2)" opacity=".5"/>`
        + R.swietlowka(130, 26, 170) + R.swietlowka(530, 26, 170) + R.swietlowka(930, 26, 170);
      s += `<rect class="k" x="12" y="60" width="130" height="186" fill="var(--g-sciana2)" opacity=".5"/>` + R.okno(40, 86, 150, 130, { zaluzje: true })
        + R.szyld(660, 52, 470, 56, "„Lajk i Spółka”", { tlo: "var(--akcent)", tekst: "var(--g-biel)", r: 22 }) + R.t(660, 132, "reklama w internecie", 15, { f: "tekst", bez: true, op: .85 })
        + R.tabliczka(1112, 70, 176, "Piętro 4", "Biurowiec przy Zana · ul. Zana 39");
      s += `<g transform="translate(${TX} ${TY}) scale(${K})">` + pokoj() + `</g>`;
      s += (zamkniety() ? "" : R.osoba("bywalec-jozio", 400, 600, 0.85, "zwykla")) + R.paprotka(70, 580, 0.9);
      return s;
    },
    punkty: () => [{ x: 8, y: by(0) + 4, w: 1204, h: Math.round(104 * K) - 8, et: "Internet", gdzie: "gora", ktoMowi: "Portier", zamkniete: zamkniety() ? `od tyg. ${gra().odRundy("internet")}` : "",
      zamknieteTekst: `Czwarte piętro jeszcze w remoncie. „Lajk i Spółka” otwiera od tygodnia ${gra().odRundy("internet")}.`,
      teczka: { tytul: "„Lajk i Spółka”", okruszek: "piętro 4", wstep: "Kampania = kanał × strefa × liczba emisji. Działa od następnego tygodnia.",
        pola: [["Posty na grupach osiedlowych", "strefa ▾"], ["Influencerka „Kebabowa Królowa”", "TikTok"], ["Własne filmiki na TikToku", "czas właściciela"], ["Wizytówka w Mapach Google i opinie", "stała"], ["Grupa „Lublin Jedzie”", "posty i konkursy"]],
        decyzje: ["kampanie"], ekran: "internet", funkcja: "marketing" } }],
    osoby: () => (zamkniety() ? [] : [{ x: 400, stopy: 600, s: 0.85, imie: "Social media", tekst: "Lajki same się nie zrobią. Influencerka kosztuje, ale kebab wygląda w kadrze świetnie.", powitanie: true }]),
  };
}
