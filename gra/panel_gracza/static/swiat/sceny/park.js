// Scena wnętrza „park” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/park.md.
// TYTUL: Parki i zalew (wzór dla 7 miejsc, parametr ?p=) | Miasto
// KOLEJNOSC: 95
// Jedyna scena plenerowa. Jeden szablon; wariant różni obiekt w tle. Zdarzenia tego miejsca i odsyłacz do stoiska (Biurowiec przy Zana, piętro 3).
export default function (R) {
  const YP = 440, P = {
    ogrod_saski: { nazwa: "Ogród Saski", adres: "Śródmieście", ob: "muszla" }, park_ludowy: { nazwa: "Park Ludowy", adres: "nad Bystrzycą", ob: "karuzela" },
    ogrod_botaniczny: { nazwa: "Ogród Botaniczny UMCS", adres: "Sławinek", ob: "szklarnia" }, park_bronowicki: { nazwa: "Park Bronowicki", adres: "Bronowice", ob: "altana" },
    park_rury: { nazwa: "Park Rury", adres: "wąwóz między LSM a Czubami", ob: "mostek" }, blonia: { nazwa: "Błonia pod Zamkiem", adres: "Stare Miasto", ob: "scena" }, zalew: { nazwa: "Zalew Zemborzycki", adres: "Zemborzyce", ob: "molo" } };
  const id = P[R.q.get("p")] ? R.q.get("p") : "ogrod_saski", p = P[id];
  const obiekt = () => p.ob === "muszla" ? `<path class="k3" d="M560 ${YP}v-90a190 190 0 0 1 380 0v90z" fill="var(--g-biel)"/><path class="k" d="M610 ${YP}v-80a140 140 0 0 1 280 0v80z" fill="var(--g-sciana2)"/><rect class="k" x="540" y="${YP - 16}" width="420" height="16" fill="var(--g-drewno2)"/>`
    : p.ob === "karuzela" ? `<path class="k3" d="M560 250l190-80 190 80z" fill="var(--akcent)"/><path class="k" d="M750 170v${YP - 170}" stroke-width="8"/><rect class="k" x="570" y="${YP - 24}" width="360" height="24" fill="var(--g-drewno2)"/>` + [600, 680, 820, 900].map((x, i) => `<path class="k" d="M${x} 250v100"/><ellipse class="k" cx="${x}" cy="370" rx="26" ry="16" fill="${R.KOL[i]}"/>`).join("")
    : p.ob === "szklarnia" ? `<path class="k3" d="M540 ${YP}v-140q210-120 420 0v140z" fill="var(--g-szklo)" opacity=".7"/>` + Array.from({ length: 8 }, (_, i) => `<path class="k" d="M${570 + i * 52} ${YP}v-${150 + Math.sin((i + 0.5) / 8 * Math.PI) * 48}"/>`).join("") + `<path class="k" d="M540 ${YP - 70}h420"/>` + R.paprotka(700, YP - 40, 1.4) + R.paprotka(820, YP - 40, 1.2)
    : p.ob === "altana" ? `<path class="k3" d="M620 240l130-80 130 80z" fill="var(--g-rudy)"/>` + [640, 720, 780, 860].map((x) => `<path class="k" d="M${x} 240v${YP - 240}" stroke-width="7" stroke="var(--g-biel)"/>`).join("") + `<rect class="k" x="630" y="${YP - 60}" width="240" height="10" fill="var(--g-biel)"/><rect class="k" x="620" y="${YP - 14}" width="260" height="14" fill="var(--g-drewno2)"/>`
    : p.ob === "mostek" ? `<path class="k3" d="M480 ${YP}q270-170 540 0v-30q-270-170-540 0z" fill="var(--g-drewno2)"/>` + Array.from({ length: 11 }, (_, i) => `<path class="k" d="M${510 + i * 48} ${YP - 46 - Math.sin((i + 0.5) / 11 * Math.PI) * 78}v-40"/>`).join("") + `<path class="k bez" d="M480 ${YP - 70}q270-170 540 0" stroke-width="5"/>`
    : p.ob === "scena" ? `<path class="k3" d="M540 150l110-60h200l110 60v40h-420z" fill="var(--g-sciana2)"/><path class="k" d="M560 190v${YP - 210}M940 190v${YP - 210}" stroke-width="8" stroke="var(--g-metal2)"/><rect class="k3" x="540" y="${YP - 30}" width="420" height="30" fill="var(--g-czern)"/><rect class="k" x="600" y="210" width="300" height="120" fill="var(--g-tablica)"/>` + R.t(750, 280, "KONCERT", 28, { fill: "var(--g-biel)", f: "gruby" })
    : `<rect x="440" y="${YP - 110}" width="780" height="110" fill="var(--g-szklo)"/><path d="M460 ${YP - 80}q30-10 60 0t60 0M700 ${YP - 50}q30-10 60 0t60 0M960 ${YP - 84}q30-10 60 0t60 0" fill="none" stroke="var(--g-biel)" stroke-width="3" class="efekt"/><rect class="k3" x="560" y="${YP - 40}" width="360" height="14" fill="var(--g-drewno2)"/>` + [580, 680, 780, 880].map((x) => `<path class="k" d="M${x} ${YP - 26}v26" stroke-width="6"/>`).join("") + `<path class="k" d="M1020 ${YP - 60}h120l-20 26h-80z" fill="var(--g-biel)"/><path class="k" d="M1076 ${YP - 60}v-110l60 96z" fill="var(--akcent)"/>`;
  const drzewo = (x, y, s = 1) => `<path class="k" d="M${x} ${y}v${-110 * s}" stroke="var(--g-drewno)" stroke-width="${10 * s}"/><ellipse class="k" cx="${x}" cy="${y - 150 * s}" rx="${60 * s}" ry="${76 * s}" fill="var(--g-zielen)"/><ellipse cx="${x - 16 * s}" cy="${y - 170 * s}" rx="${24 * s}" ry="${30 * s}" fill="var(--g-zielen2)" opacity=".4"/>`;
  return {
    warianty: Object.entries(P).map(([k, v]) => [`p=${k}`, v.nazwa]),
    id: "park", tytul: p.nazwa, adres: p.adres, opis: `${p.nazwa}: alejka, tablica ogłoszeń z afiszami wydarzeń, ławka i miejsce na stoisko.`,
    rysuj: (R) => {
      let s = `<rect width="1220" height="${YP}" fill="var(--g-niebo)"/><ellipse cx="300" cy="70" rx="90" ry="18" fill="var(--g-biel)" opacity=".7" class="efekt"/><ellipse cx="1000" cy="110" rx="70" ry="14" fill="var(--g-biel)" opacity=".7" class="efekt"/>`
        + `<path d="M0 ${YP - 60}q300-60 620-10t600-20v90h-1220z" fill="var(--g-zielen2)" opacity=".5"/><rect x="0" y="${YP}" width="1220" height="${612 - YP}" fill="var(--g-zielen)"/><path class="k" d="M0 ${YP}h1220"/><path d="M0 500h1220v70h-1220z" fill="var(--g-podloga)"/><path class="k1" d="M0 500h1220M0 570h1220"/>`;
      s += drzewo(60, YP, 1.1) + drzewo(470, YP, 0.9) + drzewo(1160, YP, 1.0) + obiekt();
      // tablica ogłoszeń z afiszami
      s += `<path class="k" d="M150 ${YP + 40}v-250M410 ${YP + 40}v-250" stroke-width="8" stroke="var(--g-drewno)"/><rect class="k3" x="140" y="210" width="280" height="200" fill="var(--g-drewno2)"/><path class="k3" d="M130 210l150-40 150 40z" fill="var(--g-zielen2)"/>`
        + R.plakat(156, 226, 120, 100, ["FESTYN", "sobota"], "var(--akcent)", 17) + R.plakat(286, 226, 120, 70, ["BIEG", "niedziela 10:00"], "var(--akcent-2)", 15) + R.kartka(290, 310, 110, 80, ["KINO", "POD CHMURKĄ", "za 2 tyg."], 2, 13) + R.kartka(160, 340, 110, 56, ["ZGUBIONO", "jamnika"], -3, 12);
      // miejsce na stoisko, ławka, kosz, latarnia, spacerowicze
      s += `<rect class="bez" x="1000" y="420" width="190" height="70" stroke="var(--tusz)" stroke-width="2" stroke-dasharray="9 7"/><path class="k" d="M1095 420v-60" stroke-width="4"/><rect class="k" x="1030" y="320" width="130" height="44" fill="var(--g-biel)"/>` + R.t(1095, 340, "MIEJSCE", 12, { fill: "var(--g-czern)" }) + R.t(1095, 356, "NA STOISKO", 12, { fill: "var(--g-czern)" });
      s += R.lawka(620, 498, 170) + `<path class="k" d="M850 498v-40h34v40z" fill="var(--g-czern)"/><circle class="k" cx="867" cy="446" r="12" fill="var(--g-czern)"/><path class="k" d="M860 448h14" stroke="var(--uwaga)" stroke-width="4"/><ellipse cx="867" cy="474" rx="10" ry="14" fill="var(--g-biel)"/>`
        + `<path class="k bez" d="M940 500v-190q0-18-22-18" stroke-width="5"/><path class="k" d="M906 286h24l-5 18h-14z" fill="var(--uwaga)"/>` + R.osoba("gosc-sasiadka", 470, 600, 0.78) + R.osoba("gosc-student", 580, 604, 0.78) + R.osoba("bywalec-zagloba", 760, 602, 0.78);
      return s;
    },
    punkty: [
      // przycisk parku otwiera okienko wydarzeń tego parku (tablica korkowa z kartkami), nie kalendarz – obsługa: swiat/wnetrze.js (parkId)
      { x: 130, y: 166, w: 300, h: 290, et: "Co się tu dzieje", parkId: id, teczka: { tytul: `Wydarzenia: ${p.nazwa}`, okruszek: "tablica ogłoszeń", wstep: "Wydarzenia w tym parku w tym tygodniu: wybierz reakcję. Przy każdej opcji strzałki pokazują, co zyskasz, a co stracisz.", ekran: "–" } },
      { x: 994, y: 310, w: 202, h: 186, et: "Stoisko", gdzie: "prawy-brzeg", odsyla: { kto: "Tabliczka", tekst: "Stoisko albo degustację na festynie zamawia się w agencji „Kozi Gród Events”, Biurowiec przy Zana, piętro 3.", stan: "Najbliższy festyn: sobota", miejsce: "Biurowiec przy Zana" } },
    ],
    osoby: [{ x: 760, stopy: 602, s: 0.78, imie: "Spacerowicz", tekst: "W sobotę będzie tu pół miasta. Kto ma stoisko, ten ma kolejkę.", powitanie: true }],
  };
}
