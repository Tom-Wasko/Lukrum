// Scena wnętrza „pierzeja_bankowa” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/pierzeja_bankowa.md.
// TYTUL: Pierzeja bankowa (fasada 5 kamienic) | Banki i giełda
// KOLEJNOSC: 10
// Fasada: pięć wąskich kamienic przy Krakowskim Przedmieściu, każda to jeden bank. Klik w kamienicę = wejście do banku.
export default function (R) {
  // dane banków: dane/mapa/banki.yaml (nazwa, specjalizacja, konto, lokaty, debet, kredyty). Solaris pominięty (5 zamiast 6 – pytanie do szefa).
  const BANKI = [
    { id: "kmicic", nazwa: "Kmicic", haslo: "kredyt na start", znak: "K", mur: "color-mix(in srgb, var(--g-rudy) 55%, var(--g-sciana))", marka: "var(--akcent)", tk: "var(--papier)", szyld: "wstega", szczyt: "schodki", liczba: "kredyt 14,9%" },
    { id: "wokulski", nazwa: "Wokulski i S-ka", haslo: "kredyt inwestycyjny", znak: "W", mur: "var(--g-biel)", marka: "var(--g-tablica)", szyld: "prostokat", szczyt: "attyka", liczba: "kredyt 6,9%" },
    { id: "ziemia", nazwa: "Ziemia Obiecana", haslo: "leasing sprzętu", znak: "Z", mur: "color-mix(in srgb, var(--g-mieso) 50%, var(--g-sciana))", marka: "var(--g-drewno)", szyld: "luk", szczyt: "pila", liczba: "leasing 7,5%" },
    { id: "rzecki", nazwa: "Oszczędności Rzeckiego", haslo: "najlepsze lokaty", znak: "R", mur: "var(--g-sciana2)", marka: "var(--akcent-2)", tk: "var(--papier)", szyld: "owal", szczyt: "trojkat", liczba: "lokata 4,2%" },
    { id: "soplicowo", nazwa: "Soplicowo", haslo: "tanie konto", znak: "S", mur: "color-mix(in srgb, var(--g-zielen) 35%, var(--g-biel))", marka: "var(--g-zielen2)", szyld: "prostokat", szczyt: "dworek", liczba: "konto 0 zł" },
  ];
  const X0 = 22, SZ = 235.2, ZIEMIA = 548;
  const top = [96, 62, 118, 84, 132];
  function szczyt(b, x, t, w) {
    const k = "var(--g-rudy)";
    if (b.szczyt === "schodki") return `<path class="k3" d="M${x} ${t}v-18h${w * .2}v-18h${w * .2}v-18h${w * .2}v18h${w * .2}v18h${w * .2}v18z" fill="${b.mur}"/><path class="k" d="M${x + w / 2} ${t - 54}v-30"/><path class="k" d="M${x + w / 2} ${t - 84}h26l-7 8 7 8h-26z" fill="var(--akcent)"/>`;
    if (b.szczyt === "attyka") return `<rect class="k3" x="${x - 4}" y="${t - 14}" width="${w + 8}" height="14" fill="var(--g-sciana2)"/><path class="k3" d="M${x + w * .25} ${t - 14}q${w * .25}-44 ${w * .5} 0z" fill="var(--g-sciana2)"/>` + R.t(x + w / 2, t - 19, "1878", 13, { f: "gruby" })
      + [0.08, 0.92].map((f) => `<path class="k" d="M${x + w * f - 7} ${t - 14}v-16l7-8 7 8v16z" fill="var(--g-sciana2)"/>`).join("");
    if (b.szczyt === "pila") return `<path class="k3" d="M${x} ${t}v-30l${w / 3} 30v-30l${w / 3} 30v-30l${w / 3} 30z" fill="var(--g-metal2)"/><rect class="k3" x="${x + w * .72}" y="${t - 92}" width="22" height="70" fill="${b.mur}"/><rect class="k" x="${x + w * .72 - 3}" y="${t - 98}" width="28" height="8" fill="${k}"/>`
      + `<path class="efekt" d="M${x + w * .72 + 11} ${t - 102}q-14-16 2-28q14-12 0-26" fill="none" stroke="var(--g-siwy)" stroke-width="7" stroke-linecap="round" opacity=".6"/>`;
    if (b.szczyt === "trojkat") return `<path class="k3" d="M${x - 6} ${t}l${w / 2 + 6}-52 ${w / 2 + 6} 52z" fill="${k}"/><circle class="k" cx="${x + w / 2}" cy="${t - 20}" r="11" fill="var(--g-szklo)"/>`;
    return `<path class="k3" d="M${x - 8} ${t}l26-46h${w - 36}l26 46z" fill="${k}"/><rect class="k" x="${x + w / 2 - 20}" y="${t - 40}" width="40" height="30" fill="${b.mur}"/><rect class="k1" x="${x + w / 2 - 10}" y="${t - 34}" width="20" height="20" fill="var(--g-szklo)"/>`;
  }
  function kamienica(b, i) {
    const x = X0 + i * SZ, w = SZ, t = top[i], cx = x + w / 2;
    let s = szczyt(b, x, t, w) + `<rect class="k3" x="${x}" y="${t}" width="${w}" height="${ZIEMIA - t}" fill="${b.mur}"/>`;
    // piętra: okna co 96 jednostek, gzyms nad parterem
    for (let p = 0; t + 26 + p * 96 < 300; p++) for (const f of [0.2, 0.5, 0.8]) s += R.okno(x + w * f - 21, t + 26 + p * 96, 42, 58, { firanka: (i + p) % 2 === 0, widok: i === 1 && p === 1 && f === 0.5 ? "var(--uwaga)" : undefined });
    if (b.szczyt === "dworek") s += [0.14, 0.86].map((f) => `<rect class="k" x="${x + w * f - 8}" y="366" width="16" height="${ZIEMIA - 366}" fill="var(--g-biel)"/>`).join("") + `<path class="k3" d="M${x + 6} 366h${w - 12}l-20-22h${-(w - 52)}z" fill="var(--g-rudy)"/>`;
    s += `<rect class="k" x="${x - 4}" y="356" width="${w + 8}" height="12" fill="var(--g-sciana2)"/>`;
    // parter: szyld, markiza, witryna, drzwi
    s += R.szyld(cx, 374, w - 22, 54, b.nazwa, { tlo: b.marka, tekst: b.tk, ksztalt: b.szyld, t2: b.haslo, znak: b.znak });
    s += R.markiza(x + 16, 436, w - 32, b.marka, 22);
    s += `<rect class="k" x="${x + 16}" y="466" width="${w - 104}" height="${ZIEMIA - 478}" fill="var(--g-szklo)"/><path d="M${x + 28} ${ZIEMIA - 20}l26-44M${x + 48} ${ZIEMIA - 20}l16-28" stroke="var(--g-biel)" stroke-width="4" opacity=".55" class="efekt"/>`
      + `<rect class="k" x="${x + 12}" y="${ZIEMIA - 12}" width="${w - 96}" height="12" fill="var(--g-sciana2)"/>` + R.t(x + 16 + (w - 104) / 2, 500, b.liczba, 17, { f: "gruby", w: w - 112, fill: "var(--g-czern)" });
    s += R.drzwi(x + w - 70, 462, 50, ZIEMIA - 462, { typ: "szklo", kolor: b.marka });
    if (b.moje) s += `<path class="k" d="M${x + w - 20} 372v-58" stroke-width="3"/><path class="k" d="M${x + w - 20} 314h-112l8 12-8 12h112z" fill="var(--akcent)"/>` + R.t(x + w - 72, 331, "TU MASZ KONTO", 12.5, { fill: "var(--papier)", w: 96 });
    return s;
  }
  return {
    id: "pierzeja_bankowa", tytul: "Pierzeja bankowa", adres: "Krakowskie Przedmieście, deptak", opis: "Pięć kamienic przy deptaku, w każdej jeden bank: Kmicic, Wokulski i S-ka, Ziemia Obiecana, Oszczędności Rzeckiego, Soplicowo.",
    rysuj: (R) => {
      let s = `<rect width="1220" height="612" fill="var(--g-niebo)"/><ellipse cx="180" cy="60" rx="70" ry="16" fill="var(--g-biel)" opacity=".7" class="efekt"/><ellipse cx="930" cy="40" rx="90" ry="14" fill="var(--g-biel)" opacity=".7" class="efekt"/>`;
      s += BANKI.map(kamienica).join("");
      s += R.podloga("bruk", ZIEMIA, "var(--g-podloga2)");
      // latarnia pastorał, słup ogłoszeniowy ze spisem banków, ławka, hydrant, przechodnie
      s += `<path class="k bez" d="M1196 ${ZIEMIA + 40}v-250q0-22-26-22" stroke-width="5"/><path class="k" d="M1158 ${ZIEMIA - 236}h24l-5 20h-14z" fill="var(--uwaga)"/>`;
      s += `<rect class="k3" x="560" y="${ZIEMIA - 20}" width="100" height="78" rx="6" fill="var(--g-zielen2)"/><path class="k3" d="M552 ${ZIEMIA - 20}q58-34 116 0z" fill="var(--g-zielen2)"/><rect class="k1" x="570" y="${ZIEMIA - 10}" width="80" height="58" fill="var(--g-biel)"/>`
        + [0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M576 ${ZIEMIA - 2 + i * 7}h68" stroke="var(--g-czern)" opacity=".5"/>`).join("");
      s += R.lawka(250, ZIEMIA + 58, 130) + R.osoba("bywalec-rzecki", 918, 606, 0.62) + R.osoba("gosc-turystka", 455, 608, 0.6, "zwykla");
      return s;
    },
    punkty: () => BANKI.map((b, i) => ({ x: X0 + i * SZ + 6, y: top[i] - 20, w: SZ - 12, h: ZIEMIA - top[i] + 20, et: "Wejdź", nazwa: `Bank „${b.nazwa}”`, cichy: true, gdzie: "wewn", wejscie: `bank.html?b=${b.id}` }))
      .concat([{ x: 548, y: ZIEMIA - 54, w: 124, h: 114, et: "Porównaj banki", gdzie: "srodek", teczka: { tytul: "Spis banków", okruszek: "słup ogłoszeniowy", wstep: "Jedna liczba na bank: to, czym się wyróżnia. Lokaty, kredyty i leasing bierze się tylko w banku, w którym firma ma konto.",
        pola: [["Kmicic: kredyt na start, bez historii firmy", "14,9%", "do 60 000 zł, konto 35 zł miesięcznie"], ["Wokulski i S-ka: kredyt inwestycyjny pod zastaw", "6,9%", "do 400 000 zł, konto 25 zł"], ["Ziemia Obiecana: leasing sprzętu ★ Twoje konto", "7,5%", "wpłata własna 5%, konto 25 zł"],
          ["Oszczędności Rzeckiego: lokata na 13 tygodni", "4,2%", "lokata tygodniowa 2,0%, konto 20 zł"], ["Soplicowo: konto firmowe i terminal", "0 zł", "prowizja od kart 0,79%"]], ekran: "bank (porównanie)", decyzje: ["bank"] } }]),
    osoby: [{ x: 918, stopy: 606, s: 0.62, imie: "Pan Ignacy", tekst: "Pieniądz lubi porządek. Proszę najpierw porównać, potem wchodzić." }],
  };
}
