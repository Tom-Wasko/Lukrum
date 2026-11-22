// Scena wnętrza „sprzet_gastro” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/sprzet_gastro.md.
// TYTUL: Hurtownia sprzętu gastronomicznego (rożny na podestach, kasy, komis) | Park handlowy
// KOLEJNOSC: 61
// SYMBOLE: wnetrze-rozen-1 wnetrze-rozen-2 wnetrze-rozen-3 wnetrze-kasa-1 wnetrze-kasa-2 wnetrze-kasa-3
// Decyzja szefa 3: sprzęt kupuje się tylko tutaj. Ceny: dane/sprzet.yaml (Rożen 2 500 / 4 500 / 10 000; utrzymanie 120 / 55 / 25 miesięcznie).
export default function (R) {
  const YP = 400;
  const garnki = (px, py, pw, ph) => Array.from({ length: Math.floor(pw / 46) }, (_, k) => `<rect class="k1" x="${px + k * 46 + 4}" y="${py + ph - 34 - (k % 2) * 8}" width="36" height="${34 + (k % 2) * 8}" rx="3" fill="var(--g-metal)"/><path class="k1" d="M${px + k * 46} ${py + ph - 26 - (k % 2) * 8}h4M${px + k * 46 + 40} ${py + ph - 26 - (k % 2) * 8}h4"/>`).join("");
  return {
    id: "sprzet_gastro", tytul: "Hurtownia sprzętu gastronomicznego", adres: "Park handlowy, Węglin Południowy", wroc: "Park handlowy", wrocDo: "park_handlowy.html", opis: "Hala wystawowa: trzy rożny na podestach z metkami, stół z frytownicą i grillem, półka z kasami, kącik komisu i lada sprzedawcy.",
    rysuj: (R) => {
      let s = R.sciana("var(--g-sciana)", YP) + `<rect x="0" y="0" width="1220" height="22" fill="var(--akcent-2)"/>` + R.podloga("plytki", YP) + [150, 530, 910].map((x) => R.swietlowka(x, 22, 170)).join("");
      s += R.szyld(610, 50, 470, 48, "Sprzęt gastronomiczny", { tlo: "var(--g-tablica)", tekst: "var(--g-biel)", r: 24 }) + R.t(610, 116, "Konstruktorzy T&K · kupno · wynajem · serwis", 13, { f: "tekst", bez: true, op: .8 });
      // trzy rożny na podestach
      [["wnetrze-rozen-1", "★ 2 500"], ["wnetrze-rozen-2", "★★ 4 500"], ["wnetrze-rozen-3", "★★★ 10 000"]].forEach(([n, c], i) => { const x = 50 + i * 132;
        s += `<rect class="k" x="${x - 6}" y="${YP - 22}" width="126" height="22" fill="var(--g-metal2)"/>` + R.u(n, x, YP - 22 - 190, 0.95) + R.cenowka(x + 6, YP - 246, c, 104); });
      s += R.tabliczka(242, 100, 240, "Rożny", "serwis: 120 / 55 / 25 zł mies.");
      // stół z frytownicą, grillem i krajalnicą; regał z garnkami
      s += R.regal(470, 150, 320, 170, 2, garnki, "var(--g-metal2)") + R.lada(460, 316, 340, 84, { front: "var(--g-metal)", blat: "var(--g-metal2)" });
      s += `<rect class="k" x="480" y="276" width="90" height="40" fill="var(--g-metal2)"/><rect class="k1" x="488" y="268" width="32" height="14" fill="var(--g-czern)"/><rect class="k1" x="530" y="268" width="32" height="14" fill="var(--g-czern)"/>` + R.cenowka(476, 330, "FRYTOWNICA od 1 500", 130);
      s += `<path class="k" d="M600 316h80v-14h-80z" fill="var(--g-czern)"/><path class="k" d="M600 302l80-16v10l-80 14z" fill="var(--g-metal2)"/>` + `<circle class="k" cx="740" cy="290" r="26" fill="var(--g-metal)"/><circle cx="740" cy="290" r="4" fill="var(--g-czern)"/><rect class="k" x="716" y="306" width="60" height="10" fill="var(--g-metal2)"/>`;
      // półki z kasami
      s += R.tabliczka(915, 126, 180, "Kasy i lady", "od 900 zł") + R.regal(830, 170, 170, 230, 3, null, "var(--g-drewno)") + R.u("wnetrze-kasa-1", 870, 190, 0.8) + R.u("wnetrze-kasa-2", 870, 264, 0.8) + R.u("wnetrze-kasa-3", 870, 338, 0.8);
      // komis
      s += R.plakat(1036, 130, 150, 64, ["KOMIS", "skup · sprzedaż"], "var(--g-drewno)", 19) + `<g opacity=".75">` + R.u("wnetrze-rozen-1", 1056, YP - 160, 0.8) + `</g>` + R.cenowka(1060, 226, "UŻYWANY", 90);
      // pierwszy plan: lada sprzedawcy z katalogiem na łańcuszku, wózek z kartonem
      s += R.osobaZa("sprzedawca", 640, 486, 610, 1.0) + R.lada(500, 482, 280, 120) + R.papiery(540, 482, 6) + `<path class="k1 bez" d="M584 474q30-36 60-6"/>` + R.t(640, 556, "KATALOG · ZAMÓWIENIA", 14, { ls: 1.5 });
      s += R.wozekPlatf(900, 604) + R.fikus(1180, 596, 0.9) + R.osoba("gosc-student", 330, 606, 0.82, "zwykla");
      return s;
    },
    punkty: [
      { x: 36, y: 120, w: 406, h: 286, et: "Rożny i grille", stan: "!", opisStanu: "w lokalu nie ma jeszcze rożna", teczka: { tytul: "Sprzęt kuchni", okruszek: "podesty z rożnami", zakladki: ["Kup", "Wynajmij", "Twój sprzęt"], wstep: "Każde danie potrzebuje swojego sprzętu. Tani sprzęt ma droższy serwis i gorszą ocenę dania.",
        pola: [["Rożen ★", "2 500 zł", "serwis 120 zł miesięcznie"], ["Rożen ★★", "4 500 zł", "serwis 55 zł miesięcznie"], ["Rożen ★★★", "10 000 zł", "serwis 25 zł miesięcznie"], ["Na stanowisko", "kuchnia 1 ▾"]], decyzje: ["sprzet_kup", "sprzet_sprzedaj"], ekran: "wnetrze_sprzet" } },
      { x: 454, y: 144, w: 352, h: 262, et: "Frytownice i chłodzenie", teczka: { tytul: "Sprzęt do dań dodatkowych i chłodnia", okruszek: "stół roboczy", wstep: "Frytki i napoje potrzebują własnego sprzętu. Szafa chłodnicza i zamrażarka dają miejsce na towar.",
        pola: [["Frytownica", "1 500 / 2 800 / 6 500 zł"], ["Lodówka na napoje", "1 000 / 1 600 / 3 000 zł"], ["Szafa chłodnicza (600 / 800 / 1 400 l)", "2 200 / 3 500 / 7 800 zł", "★★★ trzyma towar dzień dłużej"], ["Zamrażarka (250 / 300 / 600 l)", "1 400 / 2 200 / 4 800 zł"]], decyzje: ["sprzet_kup"], ekran: "wnetrze_sprzet" } },
      { x: 822, y: 120, w: 186, h: 286, et: "Kasy", teczka: { tytul: "Sprzęt kasy", okruszek: "półki z kasami", wstep: "Stanowisko kasy potrzebuje kasy fiskalnej, lady i tablicy menu. Lepszy sprzęt przyspiesza obsługę, tańszy ją spowalnia.", pola: [["Kasa fiskalna", "900 / 1 500 / 3 300 zł", "obsługa −10% / bez zmian / +15%"], ["Lada z witryną", "1 500 / 2 500 / 5 500 zł", "obsługa −5% / bez zmian / +10%"], ["Tablica menu", "300 / 600 / 1 400 zł", "obsługa −5% / bez zmian / +10%"]], decyzje: ["sprzet_kup"], ekran: "wnetrze_sprzet" } },
      { x: 1026, y: 120, w: 170, h: 286, et: "Komis", gdzie: "prawy-brzeg", teczka: { tytul: "Komis: sprzedaj sprzęt", okruszek: "kącik komisu", wstep: "Niepotrzebny sprzęt można odsprzedać poniżej ceny zakupu.", pola: [["Frytownica ★ (kuchnia 2)", "sprzedaj za 750 zł"]], decyzje: ["sprzet_sprzedaj"], ekran: "wnetrze_sprzet" } },
      { x: 494, y: 430, w: 292, h: 174, et: "Leasing", gdzie: "wewn", odsyla: { kto: "Sprzedawca", tekst: "Nie ma gotówki? Bank „Ziemia Obiecana” da ten sam rożen w ratach, od 5% wpłaty.", stan: "Gotówka firmy: 12 480 zł", miejsce: "Pierzeja bankowa" } },
    ],
    osoby: [{ x: 640, stopy: 610, s: 1.0, h: 120, imie: "Sprzedawca", tekst: "Rożen to serce lokalu. Bez niego nie ma co otwierać, proszę wybrać z głową.", powitanie: true }],
  };
}
