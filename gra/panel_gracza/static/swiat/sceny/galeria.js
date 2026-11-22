// Scena wnętrza „galeria” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/galeria.md.
// TYTUL: Galeria „Pod Zegarem” (hol z zegarem, sklep „Dla zespołu”) | Ludzie
// KOLEJNOSC: 84
// Udogodnienia dla pracowników (decyzje `udogodnienia_kup`, `udogodnienia_sprzedaj`; funkcja rozwoj; od tygodnia 3).
// Ceny: dane/katalog.yaml → udogodnienia (np. kącik socjalny 480 zł, ekspres 3 400 zł + 320 zł mies., pokój socjalny 3 300 zł).
export default function (R) {
  const YP = 420;
  return {
    id: "galeria", tytul: "Galeria „Pod Zegarem”", adres: "ul. Lipowa, Śródmieście", opis: "Hol galerii handlowej z wielkim zegarem nad schodami ruchomymi, witryną sklepu Dla zespołu, saturatorem i automatem z gumami.",
    rysuj: (R) => {
      let s = R.sciana("var(--g-sciana)", YP) + R.podloga("plytki", YP) + `<rect x="0" y="0" width="1220" height="18" fill="var(--g-metal2)"/>`;
      // zegar i schody ruchome
      s += R.zegar(610, 96, 62, 10, 10) + `<path class="k3" d="M480 420l200-230h70v30l-180 200z" fill="var(--g-metal)"/><path class="k" d="M470 400l200-230h80" fill="none" stroke-width="7" stroke="var(--g-czern)"/>` + Array.from({ length: 8 }, (_, i) => `<path class="k1" d="M${506 + i * 24} ${392 - i * 27}h22"/>`).join("") + R.osoba("gosc-student", 640, 300, 0.5, "dobra");
      // witryna „Dla zespołu”
      s += R.szyld(240, 44, 300, 46, "Dla zespołu", { tlo: "var(--g-zielen2)", tekst: "var(--g-biel)", r: 24 }) + R.markiza(50, 100, 380, "var(--g-zielen2)", 22) + `<rect class="k3" x="40" y="124" width="400" height="296" fill="var(--g-sciana2)"/><rect x="40" y="384" width="400" height="36" fill="var(--g-podloga)"/>`;
      s += [0, 1, 2].map((i) => `<rect class="k" x="${60 + i * 44}" y="150" width="40" height="150" fill="var(--g-metal)"/><rect class="k1" x="${66 + i * 44}" y="160" width="28" height="8" fill="var(--g-czern)"/><circle cx="${90 + i * 44}" cy="230" r="3" fill="var(--g-czern)"/>`).join("") + R.cenowka(62, 310, "SZAFKI 900", 100);
      s += `<path class="k" d="M210 384v-50q0-16 16-16h110q16 0 16 16v50z" fill="var(--akcent-2)"/><rect class="k" x="200" y="350" width="20" height="34" rx="6" fill="var(--akcent-2)"/><rect class="k" x="342" y="350" width="20" height="34" rx="6" fill="var(--akcent-2)"/>` + R.cenowka(228, 290, "POKÓJ SOCJALNY 3 300", 150);
      s += `<rect class="k" x="230" y="170" width="60" height="44" rx="4" fill="var(--g-czern)"/><rect class="k1" x="236" y="176" width="34" height="32" fill="var(--g-szklo)"/>` + `<path class="k" d="M320 214h36l-4-40h-28z" fill="var(--g-metal)"/><path class="k bez" d="M356 184q14 0 12 14t-12 10"/>` + R.cenowka(226, 222, "KĄCIK SOCJALNY 480", 140) + `<circle class="k" cx="400" cy="180" r="24" fill="var(--g-metal)"/><path class="k" d="M400 204v100M380 304h40" stroke-width="4"/>` + [0, 1, 2].map((i) => `<path class="k1" d="M400 180l${[20, -16, -4][i]} ${[6, 12, -22][i]}" stroke-width="3"/>`).join("");
      s += `<path class="efekt" d="M60 400l110-250" stroke="var(--g-biel)" stroke-width="10" opacity=".25"/><rect class="k3 bez" x="40" y="124" width="400" height="296"/>`;
      // prawa strona: saturator, automat z gumami, witryna do wynajęcia
      s += `<rect class="k3" x="800" y="124" width="250" height="296" fill="var(--g-sciana2)"/>` + Array.from({ length: 7 }, (_, i) => `<path d="M${800 + i * 40} 124l-40 296" stroke="var(--g-biel)" stroke-width="10" opacity=".3"/>`).join("") + R.kartka(860, 220, 130, 60, ["LOKAL", "DO WYNAJĘCIA"], -3, 14);
      s += `<rect class="k3" x="1080" y="250" width="110" height="170" rx="6" fill="var(--g-biel)"/><rect class="k" x="1092" y="262" width="86" height="50" fill="var(--akcent-2)"/>` + R.t(1135, 292, "WODA", 14, { fill: "var(--papier)" }) + `<path class="k" d="M1110 330h14v30h-14zM1146 330h14v30h-14z" fill="var(--g-szklo)"/>` + R.t(1135, 396, "SATURATOR", 11, { fill: "var(--g-czern)" });
      s += `<path class="k" d="M740 600v-60" stroke-width="6"/><circle class="k3" cx="740" cy="510" r="34" fill="var(--g-szklo)"/>` + Array.from({ length: 9 }, (_, i) => `<circle cx="${722 + (i % 3) * 18}" cy="${500 + Math.floor(i / 3) * 12}" r="6" fill="${R.KOL[i % 4]}"/>`).join("") + `<rect class="k" x="716" y="540" width="48" height="24" fill="var(--akcent)"/>`;
      // pierwszy plan
      s += R.lawka(900, 604, 170) + R.fikus(60, 600, 1.0) + R.osoba("obsluga-kasjerka", 830, 606, 0.86) + R.osoba("gosc-sasiadka", 280, 608, 0.8, "zwykla");
      return s;
    },
    punkty: [
      { x: 34, y: 34, w: 412, h: 392, et: "Udogodnienia", stan: "▼", klasa: "st", opisStanu: "nastrój zespołu spada", teczka: { tytul: "Udogodnienia dla zespołu", okruszek: "witryna „Dla zespołu”", zakladki: ["Kup", "Masz"], wstep: "Zadowoleni ludzie pracują szybciej i rzadziej odchodzą. Część udogodnień kosztuje co miesiąc.",
        pola: [["Kącik socjalny z czajnikiem i mikrofalą", "480 zł", "utrzymanie 10 zł miesięcznie"], ["Szafki z zamkiem", "900 zł"], ["Pokój socjalny z kanapą i telewizorem", "3 300 zł", "utrzymanie 25 zł miesięcznie"], ["Ekspres do kawy ziarnistej dla zespołu", "3 400 zł", "utrzymanie 320 zł miesięcznie"], ["Posiłki pracownicze", "400 zł", "utrzymanie 120 zł miesięcznie"]], decyzje: ["udogodnienia_kup", "udogodnienia_sprzedaj"], ekran: "udogodnienia", funkcja: "rozwoj" } },
      { x: 470, y: 180, w: 290, h: 246, et: "Szkolenia", gdzie: "dol", odsyla: { kto: "Sprzedawczyni", tekst: "Szkolenia są w Lubelskiej Szkole Kebabu przy Nadbystrzyckiej. U nas rzeczy na zaplecze.", miejsce: "Lubelska Szkoła Kebabu" } },
    ],
    osoby: [{ x: 830, stopy: 606, s: 0.86, imie: "Sprzedawczyni", tekst: "Wypoczęty kucharz kroi szybciej. Pokój socjalny zwraca się w nastrojach.", powitanie: true }],
  };
}
