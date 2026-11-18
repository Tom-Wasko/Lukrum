// Scena wnętrza „dom_reklamy” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/dom_reklamy.md.
// TYTUL: Dom reklamy (przekrój z windą: portiernia + 4 piętra) | Reklama
// KOLEJNOSC: 20
// SYMBOLE: postacie-bywalec-zagloba postacie-sprzedawca postacie-bywalec-papkin postacie-gosc-student postacie-bywalec-jozio
// Biurowiec w przekroju. Szyb windy z lewej, na każdym piętrze pokój jednej firmy. Klik w piętro: kabina jedzie, potem teczka.
// Kanały: dane/mapa/reklama.yaml. Piętro 4 (internet) zamknięte do tygodnia z harmonogramu (element „internet”).
export default function (R) {
  const WYS = 104, DOL = 580, X1 = 250, X2 = 1100, y0 = (n) => DOL - (n + 1) * WYS;   // n: 0 = parter … 4
  let pietro = 0;
  // tydzień gry i tydzień otwarcia internetu podaje gra (R.gra, ustawia wnetrze.js); bez gry: internet otwarty
  const gra = () => R.gra || { tydzien: 1, odRundy: () => 0 };
  const zamkniety = () => (gra().odRundy("internet") || 0) > gra().tydzien;
  const P = [
    { nr: "P", firma: "Portiernia", pod: "klucze · spis firm", et: "Twoje kampanie" },
    { nr: "1", firma: "Drukarnia „Papier Przyjmie”", pod: "ulotki · plakaty · gazeta", et: "Ulotki i plakaty" },
    { nr: "2", firma: "„Fala Koziołka”", pod: "radio · billboardy", et: "Radio i billboard" },
    { nr: "3", firma: "„Kozi Gród Events”", pod: "festyny · degustacje", et: "Eventy" },
    { nr: "4", firma: "„Lajk i Spółka”", pod: "reklama w internecie", et: "Internet" },
  ];
  const ludzik = (n, cx, pn, mina) => R.osoba(n, cx, y0(pn) + WYS - 3, 0.36, mina);
  function pokoj(n) {
    const y = y0(n), zamk = n === 4 && zamkniety(), p = P[n];
    let s = `<rect x="${X1}" y="${y}" width="${X2 - X1}" height="${WYS}" fill="${zamk ? "var(--g-sciana2)" : n % 2 ? "var(--g-sciana)" : "color-mix(in srgb, var(--g-sciana) 80%, var(--g-karta))"}"/><rect x="${X1}" y="${y + WYS - 10}" width="${X2 - X1}" height="10" fill="var(--g-podloga2)"/><path class="k" d="M${X1} ${y + WYS}h${X2 - X1}"/>`;
    s += R.swietlowka(560, y + 3, 110) + (n ? R.swietlowka(860, y + 3, 110) : "");
    // szyld firmy na ścianie przy windzie
    s += `<rect class="k" x="${X1 + 14}" y="${y + 16}" width="232" height="46" rx="3" fill="${zamk ? "var(--g-metal2)" : "var(--g-tablica)"}"/>` + R.t(X1 + 130, y + 36, p.firma, 16, { fill: "var(--g-biel)", w: 216 }) + R.t(X1 + 130, y + 54, p.pod, 12.5, { fill: "var(--g-biel)", f: "tekst", w: 216 });
    if (n === 0) { // portiernia: lada, tablica z kluczami, gablota „Twoje kampanie”, drzwi wejściowe, paprotka
      s += `<rect class="k" x="520" y="${y + 20}" width="110" height="44" fill="var(--g-drewno)"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path class="k1" d="M${532 + (i % 4) * 26} ${y + 28 + Math.floor(i / 4) * 18}v8" stroke-width="2.5" stroke="var(--uwaga)"/>`).join("")
        + ludzik("bywalec-zagloba", 575, 0);
      s += R.lada(500, y + 62, 150, 42, { panele: false }) + R.telefon(610, y + 62);
      s += `<rect class="k3" x="700" y="${y + 12}" width="210" height="70" fill="var(--g-drewno2)"/>` + R.t(805, y + 28, "TWOJE KAMPANIE", 13, { ls: 1.5 })
        + [["ULOTKI", ""], ["RADIO", ""], ["FESTYN", ""]].map(([a, b], i) => `<rect class="k1" x="${708 + i * 66}" y="${y + 34}" width="60" height="42" fill="var(--g-biel)" transform="rotate(${i - 1} ${738 + i * 66} ${y + 55})"/>` + R.t(738 + i * 66, y + 52, a, 10, { fill: "var(--g-czern)", w: 54 }) + R.t(738 + i * 66, y + 68, b, 11, { fill: "var(--g-czern)", f: "tekst" })).join("");
      s += R.drzwi(1010, y + 14, 60, WYS - 14, { typ: "szklo" }) + R.paprotka(950, y + 70, 0.55) + `<rect class="k1" x="938" y="${y + 88}" width="24" height="6" fill="var(--g-drewno)"/>`;
    }
    if (n === 1) { // drukarnia: maszyna z walcami, ryzy papieru, plakaty na sznurku
      s += `<rect class="k" x="540" y="${y + 50}" width="150" height="46" fill="var(--g-metal2)"/><circle class="k" cx="575" cy="${y + 50}" r="18" fill="var(--g-metal)"/><circle class="k" cx="625" cy="${y + 46}" r="22" fill="var(--g-tablica)"/><circle class="k" cx="668" cy="${y + 52}" r="14" fill="var(--g-metal)"/><path class="k" d="M690 ${y + 66}h44v6h-44z" fill="var(--g-biel)"/>`;
      s += [0, 1, 2].map((i) => `<rect class="k1" x="${760 + i * 4}" y="${y + 86 - i * 9}" width="56" height="9" fill="var(--g-biel)"/>`).join("") + `<path class="k1 bez" d="M850 ${y + 22}q110 16 220 0"/>`
        + [0, 1, 2, 3].map((i) => `<rect class="k1" x="${866 + i * 50}" y="${y + 28 + (i % 2) * 3}" width="38" height="48" fill="${R.KOL[i]}"/>`).join("") + ludzik("sprzedawca", 500, 1);
    }
    if (n === 2) { // radio: studio za szybą, mikrofon, lampka „NA ANTENIE”, makieta billboardu
      s += `<rect class="k" x="520" y="${y + 20}" width="250" height="${WYS - 30}" fill="var(--g-tablica)"/><rect class="k1" x="530" y="${y + 28}" width="230" height="40" fill="var(--g-szklo)" opacity=".5"/>` + ludzik("bywalec-papkin", 600, 2)
        + `<path class="k bez" d="M650 ${y + 94}v-30l22-10" stroke-width="3"/><rect class="k" x="668" y="${y + 44}" width="12" height="20" rx="6" fill="var(--g-metal)"/><rect class="k" x="690" y="${y + 74}" width="70" height="20" fill="var(--g-metal2)"/>`
        + `<rect class="k" x="790" y="${y + 24}" width="96" height="24" rx="4" fill="var(--g-czern)"/><g class="neon">` + R.t(838, y + 41, "NA ANTENIE", 13, { fill: "var(--akcent)" }) + `</g>`;
      s += `<path class="k" d="M960 ${y + 94}v-34M1040 ${y + 94}v-34" stroke-width="3"/>` + R.plakat(930, y + 22, 140, 42, ["BILLBOARD", "przy rondzie"], "var(--akcent-2)", 12);
    }
    if (n === 3) { // eventy: stół degustacyjny, balony, skrzynie z namiotem, chorągiewki
      s += `<path class="k1 bez" d="M500 ${y + 18}q280 26 580 0"/>` + Array.from({ length: 13 }, (_, i) => `<path class="k1" d="M${520 + i * 44} ${y + 22 + Math.sin(i / 4) * 6}l10 16 10-16z" fill="${R.KOL[i % 4]}"/>`).join("");
      s += R.lada(560, y + 64, 170, 40, { panele: false, front: "var(--g-biel)" }) + [0, 1, 2].map((i) => `<path class="k1" d="M${584 + i * 46} ${y + 64}h22l-4-12h-14z" fill="var(--g-mieso)"/>`).join("") + ludzik("gosc-student", 780, 3)
        + [0, 1, 2].map((i) => `<path class="k1 bez" d="M${880 + i * 22} ${y + 94}q4-20 ${-6 + i * 6}-34"/><ellipse class="k1" cx="${874 + i * 28}" cy="${y + 46}" rx="13" ry="16" fill="${R.KOL[(i * 2) % 4]}"/>`).join("")
        + R.skrzynka(980, y + 54, 90, 40, "var(--g-drewno2)", "NAMIOT");
    }
    if (n === 4) { // internet: biurka z monitorami, pufa, lampa pierścieniowa; zamknięte: zgaszone, kartka
      s += R.biurko(520, y + 64, 150, 40) + R.monitor(540, y + 64, 0.8) + R.monitor(606, y + 64, 0.8) + R.biurko(720, y + 64, 110, 40) + R.monitor(748, y + 64, 0.8);
      s += `<circle class="k3 bez" cx="900" cy="${y + 44}" r="18" stroke="var(--g-biel)"/><path class="k" d="M900 ${y + 62}v32M884 ${y + 94}h32" stroke-width="3"/><ellipse class="k" cx="1000" cy="${y + 84}" rx="34" ry="14" fill="var(--akcent-2)"/>`;
      if (zamk) s += `<rect x="${X1}" y="${y}" width="${X2 - X1}" height="${WYS}" fill="var(--g-czern)" opacity=".35"/>` + R.kartka(640, y + 26, 150, 50, [`OD TYGODNIA ${gra().odRundy("internet")}`, "remont, przepraszamy"], -2, 13);
      else s += ludzik("bywalec-jozio", 960, 4);
    }
    return s;
  }
  return {
    id: "dom_reklamy", tytul: "Dom reklamy", adres: "ul. Zana, Rury", opis: "Biurowiec w przekroju: winda, portiernia z gablotą kampanii i cztery piętra agencji: drukarnia, radio, eventy, internet.",
    rysuj: (R) => {
      let s = `<rect width="1220" height="612" fill="var(--g-niebo)"/>` + R.podloga("beton", DOL, "var(--g-podloga2)");
      // bryła, dach z neonem i masztem radiowym
      s += `<rect class="k3" x="120" y="${y0(4)}" width="${X2 - 120}" height="${DOL - y0(4)}" fill="var(--g-sciana2)"/><rect class="k3" x="108" y="${y0(4) - 14}" width="${X2 - 96}" height="14" fill="var(--g-metal2)"/>`;
      s += `<path class="k bez" d="M300 ${y0(4) - 14}v-22M860 ${y0(4) - 14}v-22"/>` + R.neon(580, y0(4) - 22, "DOM REKLAMY", 30) + `<path class="k bez" d="M1000 ${y0(4) - 14}v-40M986 ${y0(4) - 30}h28M992 ${y0(4) - 42}h16" stroke-width="3"/>`;
      for (let n = 0; n < 5; n++) s += pokoj(n);
      // szyb windy: liny, numery pięter, kabina (przesuwana transformacją)
      s += `<rect class="k3" x="130" y="${y0(4)}" width="110" height="${DOL - y0(4)}" fill="var(--g-tablica)"/><path d="M175 ${y0(4)}v${DOL - y0(4)}M195 ${y0(4)}v${DOL - y0(4)}" stroke="var(--g-metal)" stroke-width="2"/>`;
      for (let n = 0; n < 5; n++) s += `<path class="k" d="M130 ${y0(n) + WYS}h110"/><circle class="k" cx="${X1 - 2}" cy="${y0(n) + 84}" r="13" fill="${n === pietro ? "var(--uwaga)" : "var(--g-biel)"}" data-nr="${n}" class="k nr-pietra"/>` + R.t(X1 - 2, y0(n) + 89.5, P[n].nr, 15, { fill: "var(--g-czern)", f: "gruby" });
      s += `<g class="winda-kabina" style="transform:translateY(${-pietro * WYS}px)"><rect class="k3" x="140" y="${y0(0) + 8}" width="90" height="${WYS - 10}" fill="var(--g-metal)"/><rect class="k" x="150" y="${y0(0) + 18}" width="34" height="${WYS - 22}" fill="var(--g-drewno2)"/><rect class="k" x="186" y="${y0(0) + 18}" width="34" height="${WYS - 22}" fill="var(--g-drewno2)"/><rect class="k1" x="172" y="${y0(0) + 10}" width="26" height="8" fill="var(--uwaga)"/></g>`;
      // otoczenie: latarnia, drzewo, słup z plakatami
      s += R.osoba("gosc-sasiadka", 60, 606, 0.5, "zwykla");
      return s;
    },
    punkty: () => P.map((p, n) => {
      const zamk = n === 4 && zamkniety(), kan = [
        [["Ulotki LSM (drukarnia)", "jeszcze 2 tyg.", "3 emisje, strefa LSM"], ["Spot w „Radiu Tichy”", "! kończy się w tym tygodniu"], ["Degustacja na festynie", "✓ odbyła się w tyg. 5"]],
        [["Ulotki za wycieraczki", "strefa ▾ · emisje 1–4"], ["Plakaty na słupach ogłoszeniowych", "strefa ▾ · emisje"], ["Ogłoszenie w „Gazecie Pana Cogito”", "całe miasto"]],
        [["Billboard przy rondzie", "strefa ▾ · tygodnie"], ["Spot w „Radiu Tichy”", "całe miasto · emisje"]],
        [["Degustacja na festynie osiedlowym", "strefa ▾"], ["Noc Kebaba na otrzęsinach", "Miasteczko akademickie"]],
        [["Posty na grupach osiedlowych", "strefa ▾"], ["Influencerka „Kebabowa Królowa”", "TikTok"], ["Własne filmiki na TikToku", "czas właściciela"], ["Wizytówka w Mapach Google i opinie", "stała"], ["Grupa „Lublin Jedzie”", "posty i konkursy"]]][n];
      return { x: X1 + 4, y: y0(n) + 4, w: X2 - X1 - 8, h: WYS - 8, et: p.et, gdzie: "prawo", zamkniete: zamk ? `od tyg. ${gra().odRundy("internet")}` : "", ktoMowi: "Portier", zamknieteTekst: `Czwarte piętro jeszcze w remoncie. „Lajk i Spółka” otwiera od tygodnia ${gra().odRundy("internet")}.`,
        stan: n === 0 ? "!" : "", opisStanu: "jedna kampania kończy się w tym tygodniu", opoznienie: 950,
        przed: () => { pietro = n; const k = document.querySelector(".winda-kabina"); if (k) k.style.transform = `translateY(${-n * WYS}px)`; },
        teczka: { tytul: n ? p.firma : "Twoje kampanie", okruszek: n ? `piętro ${p.nr}` : "portiernia", wstep: n ? "Kampania = kanał × strefa × liczba emisji. Działa od następnego tygodnia." : "Co teraz działa, co się kończy i ile kosztuje. Nową kampanię zamawia się na piętrze agencji.",
          pola: kan, decyzje: n ? ["kampanie"] : null, ekran: n === 4 ? "internet" : n ? "agencje" : "agencje (podsumowanie)", funkcja: "marketing" } };
    }),
    osoby: [{ x: 575, stopy: y0(0) + WYS - 3, s: 0.36, imie: "Portier", tekst: "Drukarnia pierwsze, radio drugie, festyny trzecie. Windą, windą, schody w malowaniu.", powitanie: true }],
  };
}
