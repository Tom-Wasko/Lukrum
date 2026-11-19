// Scena wnętrza „winda_zana”: widok ze środka windy w Domu reklamy (biurowiec przy ul. Zana 39). Decyzja szefa 18.11.2026:
// jak kamienica bankowa, ale zamiast widoku z zewnątrz – panel z guzikami pięter; każde piętro to osobna scena.
// TYTUL: Biurowiec przy Zana: winda (guziki pięter) | Reklama
// KOLEJNOSC: 20
// SYMBOLE: postacie-bywalec-zagloba
// Parter = portiernia, „Twoje kampanie” i pokój z księgą firmy; 1 drukarnia, 2 radio, 3 eventy, 4 internet (zamknięty do tygodnia z harmonogramu).
export default function (R) {
  const gra = () => R.gra || { tydzien: 1, odRundy: () => 0 };
  const zamkniety = () => (gra().odRundy("internet") || 0) > gra().tydzien;
  // piętro: guzik, etykieta na tabliczce obok, scena wejścia
  const P = [
    { nr: "4", firma: "Internet", pod: "„Lajk i Spółka”", scena: "zana_internet" },
    { nr: "3", firma: "Eventy", pod: "„Kozi Gród Events”", scena: "zana_eventy" },
    { nr: "2", firma: "Radio", pod: "„Fala Koziołka”", scena: "zana_radio" },
    { nr: "1", firma: "Drukarnia", pod: "„Papier Przyjmie”", scena: "zana_drukarnia" },
    { nr: "P", firma: "Portiernia", pod: "kampanie · księga", scena: "zana_portiernia" },
  ];
  const X0 = 868, Y0 = 118, DY = 80;   // panel z guzikami po prawej ścianie
  const guzik = (p, i) => {
    const y = Y0 + i * DY, zamk = p.nr === "4" && zamkniety();
    return `<circle class="k3" cx="${X0 + 30}" cy="${y + 28}" r="22" fill="${zamk ? "var(--g-metal2)" : "var(--g-biel)"}"/>`
      + `<circle class="k1" cx="${X0 + 30}" cy="${y + 28}" r="15" fill="none"/>` + R.t(X0 + 30, y + 35, p.nr, 22, { fill: "var(--g-czern)", f: "gruby" })
      + `<rect class="k1" x="${X0 + 62}" y="${y + 6}" width="196" height="44" rx="3" fill="var(--g-biel)"/>`
      + R.t(X0 + 72, y + 26, p.firma, 17, { fill: "var(--g-czern)", kot: "start", w: 176 }) + R.t(X0 + 72, y + 43, zamk ? `od tygodnia ${gra().odRundy("internet")}` : p.pod, 13, { fill: "var(--g-czern)", f: "tekst", kot: "start", w: 176 })
      + (zamk ? `<path class="k" d="M${X0 + 240} ${y + 14}l8 8m0-8l-8 8" stroke="var(--strata)" stroke-width="3"/>` : "");
  };
  return {
    id: "winda_zana", tytul: "Biurowiec przy Zana: winda", adres: "ul. Zana 39", opis: "Wnętrze windy w biurowcu przy Zana: drzwi kabiny, lustro i panel z guzikami pięter. Parter to portiernia, wyżej drukarnia, radio, eventy i internet.",
    rysuj: (R) => {
      let s = R.sciana("var(--g-sciana2)", 548) + `<rect x="0" y="0" width="1220" height="40" fill="var(--g-metal2)"/>` + R.podloga("lastryko", 548, "var(--g-podloga2)");
      s += R.swietlowka(430, 40, 360) + `<path class="k1" d="M0 548h1220" /><rect x="0" y="520" width="1220" height="28" fill="var(--g-drewno2)" opacity=".5"/>`;
      // lamperia ze szczeblami i poręcz po lewej ścianie
      s += `<rect x="0" y="330" width="250" height="190" fill="var(--g-drewno2)" opacity=".7"/><path class="k" d="M0 330h250" stroke-width="3"/>`
        + `<path class="k3 bez" d="M18 360h214" stroke="var(--g-metal)" stroke-width="9"/><path class="k" d="M30 352v16M220 352v16"/>`;
      // lustro i tabliczka UDT
      s += `<rect class="k3" x="52" y="96" width="150" height="220" fill="var(--g-szklo)" opacity=".55"/><path d="M70 300l100-180M110 300l70-126" stroke="var(--g-biel)" stroke-width="12" opacity=".35" class="efekt"/>`
        + R.tabliczka(127, 238 + 90, 176, "Maks. 4 osoby", "300 kg · dźwig osobowy");
      // drzwi kabiny (dwa skrzydła z szybką), wskaźnik piętra nad nimi
      s += `<rect class="k3" x="290" y="116" width="500" height="410" fill="var(--g-sciana)"/>`
        + `<rect class="k" x="300" y="126" width="240" height="400" fill="var(--g-metal)"/><rect class="k" x="540" y="126" width="240" height="400" fill="var(--g-metal)"/>`
        + `<rect class="k1" x="320" y="146" width="200" height="300" fill="var(--g-metal2)" opacity=".35"/><rect class="k1" x="560" y="146" width="200" height="300" fill="var(--g-metal2)" opacity=".35"/>`
        + `<path d="M330 150l60-0 -80 300M470 150l-120 300" stroke="var(--g-biel)" stroke-width="10" opacity=".18" class="efekt"/>`
        + `<rect class="k1" x="468" y="200" width="14" height="110" rx="6" fill="var(--g-metal2)"/><rect class="k1" x="598" y="200" width="14" height="110" rx="6" fill="var(--g-metal2)"/>`;
      s += `<rect class="k3" x="440" y="52" width="200" height="52" rx="4" fill="var(--g-czern)"/>` + [0, 1, 2, 3, 4].map((i) => R.t(466 + i * 37, 90, P[4 - i].nr, 26, { fill: i === 0 ? "var(--uwaga)" : "var(--g-metal2)", f: "gruby" })).join("")
        + `<path d="M440 66h0" /><path class="k" d="M420 60l-16 16h32zM660 76l16-16h-32z" fill="var(--g-metal)"/>`;
      s += R.neon(540, 30, "DOM REKLAMY", 24);
      // panel z guzikami
      s += `<rect class="k3" x="${X0 - 18}" y="${Y0 - 40}" width="316" height="${P.length * DY + 54}" rx="8" fill="var(--g-tablica)"/>` + R.t(X0 + 140, Y0 - 14, "DOKĄD? NACIŚNIJ PIĘTRO", 14, { fill: "var(--g-biel)", ls: 1.2, w: 280 })
        + P.map(guzik).join("");
      s += R.gasnica(808, 448);
      s += R.osoba("bywalec-zagloba", 150, 600, 0.78, "zwykla");
      return s;
    },
    punkty: () => P.map((p, i) => {
      const zamk = p.nr === "4" && zamkniety();
      return { x: X0 - 14, y: Y0 + i * DY - 2, w: 306, h: 62, et: p.nr === "P" ? "Parter: portiernia" : `Piętro ${p.nr}: ${p.firma.toLowerCase()}`, nazwa: `${p.nr === "P" ? "Parter" : `Piętro ${p.nr}`}: ${p.firma}`,
        gdzie: "lewo", cichy: true, wejscie: `${p.scena}.html`, zamkniete: zamk ? `od tyg. ${gra().odRundy("internet")}` : "" };
    }),
    osoby: () => [{ x: 150, stopy: 600, s: 0.78, imie: "Pasażer", tekst: `Parter: portiernia, drukarnia na pierwszym, radio na drugim, festyny na trzecim.${zamkniety() ? ` Czwarte w malowaniu, otwiera od tygodnia ${gra().odRundy("internet")}.` : " Na czwartym internet."}`, powitanie: true }],
  };
}
