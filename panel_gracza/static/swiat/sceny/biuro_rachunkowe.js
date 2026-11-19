// Scena wnętrza „biuro_rachunkowe” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/biuro_rachunkowe.md.
// TYTUL: Wnętrze biura rachunkowego (wzór dla 4 biur, parametr ?f=) | Księgowość
// KOLEJNOSC: 31
// SYMBOLE: postacie-bywalec-rzecki postacie-bywalec-judym postacie-bywalec-zagloba postacie-bywalec-papkin
// Gabinet: biurko z księgowym, regał segregatorów, cennik pakietów S/M/L, okno, jeden rekwizyt biura. Dane: dane/mapa/biura.yaml.
export default function (R) {
  const F = {
    jks: { nazwa: "J.K.Ś.", kto: "Pan Jakub", postac: "bywalec-rzecki", sciana: "var(--g-sciana)", cennik: [["S · 60 DOK.", "390 ZŁ"], ["M · 120 DOK.", "690 ZŁ"], ["L · 200 DOK.", "1 050 ZŁ"], ["DOPŁATA ZA DOK.", "OD 4,90"]], kadry: "do 4 osób w cenie, potem 45 zł za etat", ryzyko: "nie myli się; ubezpieczenie OC",
      tekst: "Segregatory stoją alfabetycznie. W środku też, tylko od tyłu, żeby urzędnik się zmęczył." },
    jozef_k: { nazwa: "Józef K.", kto: "Józef K.", postac: "bywalec-judym", sciana: "var(--g-sciana2)", cennik: [["S · 60 DOK.", "250 ZŁ"], ["M · 120 DOK.", "450 ZŁ"], ["L · 200 DOK.", "700 ZŁ"], ["ZMIANA PAKIETU", "2 TYG."]], kadry: "61,50 zł za etat", ryzyko: "pomyłka w 4 tygodniach na 100; bez OC, mandat płaci firma",
      tekst: "Zmiana pakietu? Naturalnie. Wniosek w trzech egzemplarzach, odpowiedź za dwa tygodnie." },
    scrooge: { nazwa: "Scrooge", kto: "Pan Scrooge", postac: "bywalec-zagloba", sciana: "color-mix(in srgb, var(--g-sciana2) 70%, var(--g-metal2))", cennik: [["S · 60 DOK.", "190 ZŁ"], ["M · 120 DOK.", "360 ZŁ"], ["L · 200 DOK.", "560 ZŁ"], ["W ŚWIĘTA", "ZAMKNIĘTE"]], kadry: "73,80 zł za etat", ryzyko: "pomyłka w 2 tygodniach na 100; bez OC",
      tekst: "Święta to wymysł kasjerów. W tygodniu ze świętem dokumenty poczekają, z dopłatą." },
    asteroida_328: { nazwa: "Asteroida 328", kto: "Pan Bankier", postac: "bywalec-papkin", sciana: "color-mix(in srgb, var(--g-sciana) 70%, var(--akcent-2))", cennik: [["S · BEZ LIMITU", "470 ZŁ"], ["M · BEZ LIMITU", "790 ZŁ"], ["L · BEZ LIMITU", "1 190 ZŁ"], ["DOPŁATY", "ŻADNYCH"]], kadry: "do 6 osób w cenie, potem 36,90 zł za etat", ryzyko: "nie myli się; ubezpieczenie OC",
      tekst: "Proszę nie przeszkadzać, liczę. Każdy dokument sprawdzam trzy razy, więc dopłat nie będzie." },
  };
  const id = F[R.q.get("f")] ? R.q.get("f") : "jks", f = F[id];
  const rekwizyt = () => id === "jks" ? R.kartka(690, 120, 110, 62, ["PRZEPRASZAM", "za zero z 1998 r.", "J.K.Ś."], 4, 11)
    : id === "jozef_k" ? [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect class="k1" x="${930 + (i % 2) * 8}" y="${560 - i * 22}" width="120" height="22" fill="${i % 3 ? "var(--g-biel)" : "var(--g-drewno2)"}"/>`).join("") + [0, 1, 2, 3, 4].map((i) => `<rect class="k1" x="${1080 - (i % 2) * 6}" y="${560 - i * 22}" width="100" height="22" fill="${i % 2 ? "var(--g-biel)" : "var(--g-sciana2)"}"/>`).join("")
    : id === "scrooge" ? `<rect class="k" x="1020" y="250" width="120" height="130" rx="6" fill="var(--g-czern)"/><rect class="k1" x="1040" y="300" width="80" height="50" fill="var(--g-tablica)"/><path class="k" d="M1080 250v-250" stroke-width="10" stroke="var(--g-czern)"/>` + R.kartka(690, 116, 116, 70, ["GRUDZIEŃ", "24 25 26", "skreślone"], 3, 12) + `<path d="M706 150l84 30M706 180l84-30" stroke="var(--strata)" stroke-width="3"/>`
    : `<path class="k bez" d="M1030 560l40-150M1110 560l-40-150M1070 410v150" stroke-width="5"/><path class="k3" d="M1010 360l130 60-14 22-130-60z" fill="var(--g-metal2)"/><circle class="k" cx="1000" cy="352" r="16" fill="var(--g-szklo)"/>`
      + `<path class="k" d="M500 286a22 30 0 0 1 44 0v14h-44z" fill="var(--g-szklo)" opacity=".6"/><path class="k1" d="M522 300v-22" stroke="var(--g-zielen2)" stroke-width="2.5"/><circle cx="522" cy="272" r="6" fill="var(--akcent)" class="k1"/>`;
  return {
    id: "biuro_rachunkowe", tytul: `Biuro rachunkowe „${f.nazwa}”`, adres: "Kamienica rachmistrzów, Krakowskie Przedmieście", wroc: "Kamienica", wrocDo: "kamienica_rachmistrzow.html",
    opis: `Gabinet biura ${f.nazwa}: biurko, regał z segregatorami, cennik pakietów na ścianie.`,
    rysuj: (R) => {
      const noc = id === "asteroida_328";
      let s = R.sciana(f.sciana) + R.boazeria(300, 380) + R.podloga("parkiet", 380, "var(--g-podloga)");
      s += R.okno(880, 70, 150, 190, { widok: noc ? "var(--g-tablica)" : undefined, firanka: !noc }) + (noc ? [[900, 100], [950, 150], [1000, 96], [930, 210], [1004, 190], [968, 118]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="3" fill="var(--uwaga)"/>`).join("") : "");
      s += R.literki(60, 60, 290, 160, "CENNIK · MIESIĄC BRUTTO", f.cennik, 14.5) + R.zegar(420, 100, 28, 3, 40);
      // regał z segregatorami (5 półek), kaloryfer pod oknem, fikus
      s += R.regal(560, 60, 250, 320, 4, id === "jozef_k" ? (px, py, pw, ph) => R.papiery(px + 6, py + ph, 6) + R.papiery(px + 70, py + ph, 8) + R.papiery(px + 140, py + ph, 5) : R.segregatory) + (id === "jks" ? R.t(685, 54, "Z ← A", 13, { op: .7 }) : "");
      s += R.kaloryfer(900, 300, 9) + R.fikus(1150, 560, 1.1);
      // księgowy za biurkiem, na blacie: maszyna do liczenia z taśmą, liczydło, lampka, teczki
      s += R.osobaZa(f.postac, 330, 404, 520, 1.1) + R.biurko(140, 400, 400, 130);
      s += R.maszyna(180, 400, 0.9) + `<path class="k1" d="M196 364q-6-40 16-60" fill="none" stroke="var(--g-biel)" stroke-width="12"/>` + `<rect class="k" x="420" y="356" width="96" height="44" fill="var(--g-drewno)"/>` + [0, 1, 2].map((r) => `<path d="M424 ${366 + r * 12}h88" stroke="var(--g-czern)"/>` + [0, 1, 2, 3, 4].map((k) => `<circle cx="${436 + k * 9 + r * 14}" cy="${366 + r * 12}" r="4" fill="${R.KOL[(k + r) % 4]}" class="k1"/>`).join("")).join("") + R.teczki(250, 400, 4);
      s += id === "scrooge" ? `<rect class="k1" x="370" y="372" width="8" height="28" fill="var(--g-biel)"/><path d="M374 372q-5-8 0-14q5 6 0 14" fill="var(--uwaga)"/>` : `<path class="k bez" d="M380 400v-40q0-16 22-12" stroke-width="3"/><path class="k" d="M392 344l28 8-10 18z" fill="var(--akcent-2)"/>`;
      s += R.krzeslo(250, 600, 1.3, "var(--g-drewno)") + R.krzeslo(420, 600, 1.3, "var(--g-drewno)");
      return s + rekwizyt();
    },
    punkty: () => [
      { x: 130, y: 250, w: 420, h: 290, et: "Umowa i pakiet", teczka: { tytul: `Umowa z biurem „${f.nazwa}”`, okruszek: "biurko", zakladki: ["Pakiet", "Kadry", "Zmiana biura"], wstep: f.moje ? "To Twoje biuro. Pakiet zmienisz od następnego tygodnia." : "Księgi Twojej firmy prowadzi dziś J.K.Ś. Przejście tutaj kosztuje tydzień nowego pakietu.",
        pola: [["Pakiet", "M ▾", "S, M albo L: cena miesięczna, limit dokumentów, dopłata ponad limit"], ["Kadry (płace i ZUS za pracowników)", f.kadry], ["Pomyłki w deklaracjach", f.ryzyko.split(";")[0], f.ryzyko], [f.moje ? "Biuro" : "Wybierz to biuro", f.moje ? "to ✓" : "Podpisz umowę"]], decyzje: ["biuro", "pakiet"], ekran: "biuro" } },
      { x: 54, y: 54, w: 302, h: 172, et: "Cennik", gdzie: "dol", teczka: { tytul: "Cennik pakietów", okruszek: "tablica", wstep: "Cena brutto za miesiąc. W tygodniu gra liczy 12/52 tej kwoty.", pola: f.cennik.map(([a, b]) => [a, b]), ekran: "biuro (cennik)" } },
      { x: 554, y: 54, w: 262, h: 332, et: "Twoje dokumenty", stan: f.moje ? "!" : "", opisStanu: "blisko limitu pakietu", teczka: { tytul: "Dokumenty w tym miesiącu", okruszek: "regał", wstep: "Dokument to zapis w księdze, faktura za środek trwały, operacja bankowa albo faktura biura.", pola: [["Dokumenty w tym miesiącu", "112 z 120", "! po przekroczeniu limitu dopłata za każdy dokument"], ["Rada", "weź pakiet L"]], ekran: "biuro (dokumenty)" } },
      { x: 1000, y: 396, w: 180, h: 190, et: "Księguj samodzielnie", gdzie: "prawy-brzeg", odsyla: { kto: f.kto, tekst: "Samodzielnie? Można. Księga leży w Biurowcu przy Zana, a deklaracje składa się w urzędzie.", stan: "Dziś księgi prowadzi biuro J.K.Ś.", miejsce: "Biurowiec przy Zana" } },
    ],
    osoby: [{ x: 330, stopy: 520, s: 1.1, h: 130, imie: f.kto, tekst: f.tekst, powitanie: true, strona: "prawo" }],
    plakietki: [{ x: 20, y: 556, html: f.moje ? "<b>✓ To biuro prowadzi Twoje księgi.</b> Pakiet M." : "Twoje biuro: <b>J.K.Ś.</b> (parter, z lewej)." }],
  };
}
