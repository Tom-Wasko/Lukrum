// Scena wnętrza „rozen” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/rozen.md.
// TYTUL: Zakłady Mięsne „Rożen” (producent: chłodnia ze stożkami kebaba, waga, biuro zbytu) | Zaopatrzenie
// KOLEJNOSC: 57
// Producent stożków kebab z Łęcznej: najlepsza cena i jakość mięsa (★★ i ★★★), ale najmniejsze zamówienie 800 zł, dowóz wt. i pt.,
// dostępny od tygodnia 3 (od_rundy). Dane: dane/dostawcy.yaml → Zakłady Mięsne „Rożen” z Łęcznej.
export default function (R) {
  const ID = "rozen", YP = 420;
  const stozek = (x, y, h, kol = "var(--g-mieso)") => `<path class="k bez" d="M${x} ${y}v14"/><path class="k" d="M${x - 26} ${y + 14}h52l-14 ${h}h-24z" fill="${kol}"/>` + [0.25, 0.5, 0.75].map((f) => `<path d="M${x - 26 + 14 * f} ${y + 14 + h * f}h${52 - 28 * f}" stroke="var(--tusz)" opacity=".3"/>`).join("");
  return {
    id: ID, tytul: "Zakłady Mięsne „Rożen”", adres: "ul. Turystyczna, wylot na Łęczną", opis: "Zakład mięsny: otwarta chłodnia z wiszącymi stożkami kebaba, waga platformowa, okienko biura zbytu i rampa.",
    rysuj: (R) => {
      let s = R.sciana("var(--g-biel)", YP) + Array.from({ length: 10 }, (_, i) => `<path d="M0 ${i * 42}h1220" stroke="var(--tusz)" opacity=".1"/>`).join("") + Array.from({ length: 30 }, (_, i) => `<path d="M${i * 42} 0v${YP}" stroke="var(--tusz)" opacity=".1"/>`).join("") + R.podloga("plytki", YP, "var(--g-podloga)") + R.swietlowka(200, 14, 200) + R.swietlowka(760, 14, 200);
      s += R.szyld(250, 40, 420, 46, "Zakłady Mięsne „Rożen”", { tlo: "var(--g-rudy)", tekst: "var(--g-biel)", r: 22 });
      // chłodnia: szeroka wnęka z odsuniętymi drzwiami, szyna z hakami, 6 stożków w dwóch jakościach
      s += `<rect class="k3" x="60" y="110" width="520" height="310" fill="var(--g-szklo)" opacity=".45"/><rect class="k3 bez" x="60" y="110" width="520" height="310"/><rect class="k3" x="580" y="110" width="70" height="310" fill="var(--g-metal)"/><rect class="k" x="596" y="250" width="12" height="60" fill="var(--g-metal2)"/><path class="k" d="M80 140h480" stroke-width="5"/>`
        + [130, 210, 290].map((x) => stozek(x, 140, 180)).join("") + [380, 450, 520].map((x) => stozek(x, 140, 210, "var(--g-rudy)")).join("") + R.cenowka(170, 370, "★★ 307,30", 100) + R.cenowka(400, 384, "★★★ 405,64", 110) + `<rect class="k1" x="72" y="118" width="40" height="18" fill="var(--g-czern)"/>` + R.t(92, 132, "+2°C", 11, { fill: "var(--g-biel)", f: "gruby" });
      // biuro zbytu: okienko w ściance, tablica z zasadami, rzeźnik; rampa
      s += R.literki(690, 110, 250, 140, "ZBYT · ZASADY", [["MIN. ZAMÓWIENIE", "800 ZŁ"], ["DOWÓZ", "WT. I PT."], ["MROŻONE", "TANIEJ"]], 14) + R.osobaZa("obsluga-kucharz", 815, 344, 470, 1.0) + R.lada(700, 340, 230, 90, { front: "var(--g-metal)", blat: "var(--g-metal2)" }) + R.papiery(720, 340, 4) + R.stemple(840, 340);
      s += R.rampa(990, 180, 200, 240, "Rampa: wt. i pt.");
      // pierwszy plan: waga platformowa z pojemnikiem, wózek z pojemnikami mrożonego mięsa
      s += `<rect class="k" x="220" y="560" width="200" height="16" fill="var(--g-metal2)"/><path class="k" d="M420 568h40v-120" fill="none" stroke-width="4"/><circle class="k" cx="460" cy="432" r="20" fill="var(--g-biel)"/><path d="M460 432l10-12" stroke="var(--akcent)" stroke-width="3"/>` + R.skrzynka(250, 500, 140, 60, "var(--akcent-2)", "MROŻONE 10 kg") + R.wozekPlatf(600, 604);
      return s;
    },
    punkty: () => [
      { x: 54, y: 104, w: 530, h: 322, et: "Mięso na rożen", stan: "✓", klasa: "zy", opisStanu: "najtańsze mięso ★★★ w mieście", teczka: R.zamow(ID, "Mięso", "chłodnia") },
      { x: 210, y: 420, w: 270, h: 170, et: "Mięso mrożone", gdzie: "wewn", teczka: R.zamow(ID, "Mrożonki", "waga") },
      { x: 684, y: 104, w: 262, h: 330, et: "Koszyk tygodnia", stan: "!", opisStanu: "do najmniejszego zamówienia brakuje 180 zł", teczka: R.koszyk(ID, "biuro zbytu") },
      { x: 984, y: 136, w: 212, h: 290, et: "Dni dostaw", teczka: R.dowoz(ID) },
    ],
    osoby: [{ x: 815, stopy: 470, s: 1.0, h: 130, imie: "Kierownik zbytu", tekst: "Stożki robimy sami, taniej nie będzie. Ale poniżej ośmiuset złotych nie ruszam ciężarówki.", powitanie: true }],
    plakietki: [{ x: 520, y: 20, html: "Przed tygodniem 3: brama zamknięta, kartka „<b>Sprzedaż od tygodnia 3</b>”." }],
  };
}
