// Scena wnętrza „park_handlowy” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/park_handlowy.md.
// TYTUL: Park handlowy (pasaż: wyposażenie lokalu i „Meblościanka”) | Park handlowy
// KOLEJNOSC: 60
// Pasaż z dwiema witrynami i drogowskazem do hali ze sprzętem (jedyne miejsce kupna sprzętu): witryna = punkt, towar widać za szybą (krytyka P1). Stoliki i ogródek = wyposażenie, wystrój = dekor.
export default function (R) {
  const YP = 420;
  const fotel = (x, y, kol) => `<path class="k" d="M${x} ${y}v-50q0-14 14-14h52q14 0 14 14v50z" fill="${kol}"/><rect class="k" x="${x - 10}" y="${y - 34}" width="18" height="34" rx="6" fill="${kol}"/><rect class="k" x="${x + 72}" y="${y - 34}" width="18" height="34" rx="6" fill="${kol}"/>`;
  return {
    id: "park_handlowy", tytul: "Park handlowy", adres: "Węglin Południowy (lokalizacja tymczasowa)", opis: "Pasaż handlowy z dwiema witrynami: po lewej wyposażenie lokalu (stolik z parasolem, telewizor, kiosk), po prawej sklep meblowy Meblościanka.",
    rysuj: (R) => {
      let s = R.sciana("var(--g-sciana2)", YP) + R.podloga("plytki", YP) + [200, 610, 1020].map((x) => R.swietlowka(x - 80, 10, 160)).join("");
      // lewa witryna: wyposażenie lokalu
      s += R.szyld(300, 34, 380, 46, "Wyposażenie lokalu", { tlo: "var(--akcent-2)", tekst: "var(--papier)", r: 22 }) + R.markiza(50, 92, 500, "var(--akcent-2)", 24);
      s += `<rect class="k3" x="40" y="118" width="520" height="302" fill="var(--g-sciana)"/><rect x="40" y="380" width="520" height="40" fill="var(--g-podloga)"/>`;
      s += `<path class="k" d="M180 380v-170" stroke-width="4"/><path class="k" d="M90 214q90-70 180 0z" fill="var(--akcent)"/><path d="M135 214q22-36 45-56M225 214q-22-36-45-56" stroke="var(--papier)" stroke-width="3" fill="none"/>`
        + `<rect class="k" x="140" y="330" width="80" height="10" fill="var(--g-drewno2)"/><path class="k" d="M180 340v40" stroke-width="5"/>` + R.krzeslo(110, 384, 0.9, "var(--g-drewno2)") + R.krzeslo(250, 384, 0.9, "var(--g-drewno2)");
      s += `<rect class="k" x="320" y="150" width="130" height="78" rx="4" fill="var(--g-czern)"/><rect x="328" y="158" width="114" height="62" fill="var(--g-zielen)"/><circle cx="385" cy="189" r="12" fill="var(--g-biel)"/>` + R.t(385, 244, "MECZ MOTORU", 12, { op: .8 });
      s += `<rect class="k" x="320" y="262" width="130" height="36" rx="6" fill="var(--g-biel)"/><path d="M330 284h110M330 290h110" stroke="var(--g-czern)" opacity=".5"/>` + `<rect class="k" x="480" y="210" width="56" height="170" rx="4" fill="var(--g-metal2)"/><rect class="k1" x="488" y="220" width="40" height="64" fill="var(--g-szklo)"/>` + R.t(508, 310, "KIOSK", 11, { fill: "var(--g-biel)" });
      s += R.cenowka(70, 140, "OGRÓDEK 6 000", 110) + R.cenowka(320, 316, "TV 2 900", 76) + R.cenowka(470, 150, "KIOSK 9 000", 86);
      s += `<path class="efekt" d="M60 418h90l110-298h-60zM190 418h40l80-298h-30z" fill="var(--g-biel)" opacity=".1"/><rect class="k3 bez" x="40" y="118" width="520" height="302"/>`;
      // słup z drogowskazem
      s += `<rect class="k" x="576" y="60" width="68" height="360" fill="var(--g-sciana)"/>` + R.tabliczka(610, 200, 84, "Sprzęt", "hala obok ➜");
      // prawa witryna: Meblościanka
      s += R.neon(920, 72, "MEBLOŚCIANKA", 34) + R.markiza(670, 92, 500, "var(--akcent)", 24) + `<rect class="k3" x="660" y="118" width="520" height="302" fill="color-mix(in srgb, var(--g-drewno2) 35%, var(--g-sciana))"/><rect x="660" y="380" width="520" height="40" fill="var(--g-drewno2)"/>`;
      s += `<rect class="k3" x="690" y="150" width="300" height="230" fill="var(--g-drewno)"/>` + [0, 1, 2].map((k) => `<rect class="k" x="${700 + k * 96}" y="160" width="88" height="100" fill="${k === 1 ? "var(--g-szklo)" : "var(--g-drewno2)"}" opacity="${k === 1 ? .7 : 1}"/><rect class="k" x="${700 + k * 96}" y="270" width="88" height="100" fill="var(--g-drewno2)"/><circle cx="${780 + k * 96}" cy="320" r="3.5" fill="var(--uwaga)"/>`).join("")
        + [0, 1, 2].map((i) => `<path class="k1" d="M${812 + i * 22} 250l8-22 8 22z" fill="var(--g-biel)"/>`).join("") + `<path d="M690 156h300" stroke="var(--g-biel)" stroke-width="3" opacity=".5" class="efekt"/>` + R.paprotka(740, 116, 0.8);
      s += `<path class="k" d="M1060 380v-150" stroke-width="4"/><path class="k" d="M1020 230l14-56h52l14 56z" fill="var(--uwaga)"/>` + Array.from({ length: 9 }, (_, i) => `<path d="M${1024 + i * 9} 230v10" stroke="var(--tusz)" stroke-width="2"/>`).join("") + fotel(1010, 384, "var(--akcent-2)") + fotel(1090, 384, "var(--g-zielen)");
      s += R.cenowka(700, 130, "PRL · NOWOCZESNY · STUDENCKI · RODZINNY", 270) + `<path class="efekt" d="M680 418h90l110-298h-60zM810 418h40l80-298h-30z" fill="var(--g-biel)" opacity=".1"/><rect class="k3 bez" x="660" y="118" width="520" height="302"/>`;
      // pierwszy plan
      s += R.lawka(500, 604, 150) + R.fikus(60, 590, 1.0) + R.osoba("sprzedawca", 1130, 606, 0.85) + R.osoba("gosc-sasiadka", 330, 606, 0.8, "zwykla");
      return s;
    },
    punkty: [
      { x: 34, y: 86, w: 532, h: 340, et: "Stoliki i ogródek", teczka: { tytul: "Wyposażenie lokalu", okruszek: "witryna z lewej", zakladki: ["Kup", "Twoje wyposażenie"], wstep: "Rzeczy dla gości. Podnoszą atrakcyjność lokalu i ocenę. Część ma koszt miesięczny.",
        pola: [["Stoły i ławy z jasnego drewna", "3 100 zł"], ["Ogródek z parasolami", "6 000 zł", "utrzymanie 120 zł miesięcznie"], ["Ekran z transmisją meczów Motoru Lublin", "2 900 zł", "utrzymanie 120 zł miesięcznie"], ["Kiosk do zamówień", "9 000 zł", "utrzymanie 150 zł miesięcznie"], ["Toaleta dla gości", "5 500 zł", "utrzymanie 80 zł miesięcznie"]], decyzje: ["wyposazenie_kup", "wyposazenie_sprzedaj"], ekran: "wyposazenie", funkcja: "wyposazenie" } },
      { x: 654, y: 40, w: 532, h: 386, et: "Wystrój", teczka: { tytul: "Meblościanka: wystrój lokalu", okruszek: "witryna z prawej", zakladki: ["Ściany i podłoga", "Szyld i neon", "Dodatki", "Meble"], wstep: "Styl przyciąga określonych gości. Kupiony styl zostaje na zawsze, aktywny można zmieniać za darmo.",
        pola: [["Ściany i podłoga: styl ▾", "2 400 zł"], ["Szyld i neon: styl ▾", "1 800 zł"], ["PRL", "turyści, imprezowicze"], ["Nowoczesny", "biurowi, podróżni"]], decyzje: ["dekor_kup", "dekor_ustaw"], ekran: "dekor", funkcja: "wyposazenie" } },
      { x: 568, y: 150, w: 84, h: 276, et: "Sprzęt", gdzie: "wewn", cichy: true, nazwa: "Hala ze sprzętem gastronomicznym", wejscie: "sprzet_gastro.html" },
    ],
    osoby: [{ x: 1130, stopy: 606, s: 0.85, imie: "Sprzedawca", tekst: "Goście jedzą też oczami. Styl dobiera się do tych, którzy mają przychodzić.", powitanie: true, strona: "lewo" }],
  };
}
