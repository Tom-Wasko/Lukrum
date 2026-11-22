// Scena wnętrza „harpagon” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/harpagon.md.
// TYTUL: Kantor „U Harpagona” (sień kamienicy, okienko z kratą, drzwi sutereny) | Lokale
// KOLEJNOSC: 91
// Pożyczka poza bankiem (dane/mapa/harpagon.yaml: od 500 do 20 000 zł, 5% za tydzień, termin 4 tygodnie, potem 10% karnych i wizyty).
// Drzwi sutereny bez szyldu = „Nocna 13” (klub); widoczne dopiero po zaproszeniu (krytyka S3).
export default function (R) {
  const YP = 420;
  return {
    id: "harpagon", tytul: "Kantor „U Harpagona”", adres: "Stare Miasto, brama kamienicy", opis: "Sklepiona sień kamienicy: okienko kantoru z kratą i neonem, Harpagon liczy monety, obok Mistrz Jakub z księgą dłużników, w głębi schody do drzwi bez szyldu.",
    rysuj: (R) => {
      let s = R.sciana("color-mix(in srgb, var(--g-rudy) 30%, var(--g-sciana2))", YP) + Array.from({ length: 10 }, (_, r) => `<path d="M0 ${r * 42 + 20}h1220" stroke="var(--tusz)" opacity=".12"/>`).join("") + Array.from({ length: 40 }, (_, i) => `<path d="M${i * 62 + (i % 2) * 31} ${(i % 10) * 42 + 20}v42" stroke="var(--tusz)" opacity=".12"/>`).join("") + R.podloga("bruk", YP, "var(--g-podloga2)");
      // sklepienie i latarnia
      s += `<path class="k3" d="M0 0h1220v60q-610 150-1220 0z" fill="var(--g-sciana2)"/><path class="k" d="M610 136v40"/><path class="k" d="M592 176h36l-6 34h-24z" fill="var(--uwaga)"/>` + R.snop(610, 214, 150, 200);
      // okienko kantoru z kratą, neon
      s += R.neon(550, 126, "POŻYCZKI", 34) + `<rect class="k3" x="340" y="150" width="420" height="270" fill="var(--g-drewno)"/><rect class="k" x="370" y="176" width="360" height="150" fill="var(--g-czern)"/>` + R.osobaZa("bywalec-zagloba", 550, 326, 470, 1.05, "zwykla");
      s += Array.from({ length: 9 }, (_, i) => `<path d="M${390 + i * 40} 176v150" stroke="var(--g-metal)" stroke-width="5"/>`).join("") + `<path d="M370 226h360M370 276h360" stroke="var(--g-metal)" stroke-width="5"/><rect class="k bez" x="370" y="176" width="360" height="150"/>`;
      s += `<rect class="k" x="330" y="326" width="440" height="16" fill="var(--g-drewno2)"/>` + R.waga(440, 326) + [0, 1, 2].map((i) => `<ellipse class="k1" cx="${600 + i * 14}" cy="${322 - i * 4}" rx="12" ry="4" fill="var(--uwaga)"/>`).join("") + `<rect class="k" x="650" y="296" width="70" height="30" rx="4" fill="var(--g-metal2)"/><rect class="k1" x="678" y="306" width="14" height="12" fill="var(--uwaga)"/>`;
      s += R.plakat(790, 170, 170, 80, ["OD RĘKI.", "Drogo."], "var(--g-tablica)", 22);
      // Mistrz Jakub z księgą dłużników
      s += R.osoba("bywalec-rzecki", 170, 604, 0.9, "zwykla") + `<rect class="k" x="196" y="470" width="60" height="44" fill="var(--g-czern)"/>` + R.t(226, 498, "DŁUGI", 12, { fill: "var(--g-biel)" });
      // schody do sutereny, drzwi bez szyldu z wizjerem i światłem spod progu
      s += `<path class="k3" d="M1000 420v-190h190v190z" fill="var(--g-czern)"/>` + [0, 1, 2, 3].map((i) => `<rect class="k" x="${1000 + i * 12}" y="${420 + i * 30}" width="${190 - i * 12}" height="30" fill="var(--g-podloga)"/>`).join("") + R.drzwi(1050, 250, 100, 170, { typ: "metal", kolor: "var(--g-metal2)" }) + `<circle class="k" cx="1100" cy="300" r="7" fill="var(--uwaga)"/><path class="efekt" d="M1050 420h100" stroke="var(--uwaga)" stroke-width="5" opacity=".7"/>`;
      s += R.osoba("gosc-podrozny", 880, 606, 0.82, "zla");
      return s;
    },
    punkty: [
      { x: 330, y: 140, w: 440, h: 290, et: "Pożyczka od ręki", teczka: { tytul: "Pożyczka u Harpagona", okruszek: "okienko z kratą", zakladki: ["Weź", "Spłać"], wstep: "Pieniądze natychmiast, bez pytań i poza księgami. <b class=\"strata\">5% długu za każdy tydzień</b>, termin 4 tygodnie, potem 10% karnych i wizyty.",
        pola: [["Kwota", "5 000 zł", "od 500 do 20 000 zł, jedna pożyczka naraz"], ["Do oddania po 4 tygodniach", "ok. 6 080 zł"], ["Spłata", "kwota"]], decyzje: ["harpagon_wez", "harpagon_splac"], ekran: "harpagon", funkcja: "harpagon" } },
      { x: 90, y: 400, w: 190, h: 206, et: "Twój dług", gdzie: "gora", teczka: { tytul: "Księga dłużników", okruszek: "Mistrz Jakub", wstep: "Ile zostało, ile narosło i kiedy mija termin.", pola: [["Dług", "brak"], ["Termin", "–"]], ekran: "harpagon (stan długu)", funkcja: "harpagon" } },
      { x: 780, y: 160, w: 190, h: 100, et: "Kredyt w banku", gdzie: "dol", odsyla: { kto: "Mistrz Jakub", tekst: "Taniej będzie w banku, jeśli Państwa tam zechcą. Kmicic pożycza firmom bez historii.", stan: "Kredyt na start u Kmicica: 14,9% rocznie", miejsce: "Pierzeja bankowa" } },
      { x: 1000, y: 230, w: 190, h: 280, et: "Zapukaj", cichy: true, gdzie: "wewn", teczka: { tytul: "Nocna 13", okruszek: "drzwi bez szyldu", wstep: "Tu gra się za prywatne pieniądze właściciela. Wejście tylko po zaproszeniu.", pola: [["Stawka", "kwota z portfela właściciela"]], decyzje: ["kasyno"], ekran: "kasyno", funkcja: "po zaproszeniu" } },
    ],
    osoby: [{ x: 550, stopy: 470, s: 1.05, h: 130, imie: "Harpagon", tekst: "Pieniądze? Mam. Tylko potem proszę nie płakać nad procentem.", powitanie: true }],
  };
}
