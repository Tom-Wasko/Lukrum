// Czas właściciela (gra z lokalami, silnik/ludzie/czas_wlasciciela.py): pula godzin na rundę na sprawy poza lokalem.
// Decyzja, na którą nie starcza godzin, jest odrzucona (lista błędów).
import { brakWynikow, esc, licz, podsumowanie, tabela } from "./wspolne.js";

const ZAKLADKA = { dostawcy: "Dostawcy", mapa: "Park (mapa)", sprawy: "Mój lokal", zatrudnienie: "Zatrudnienie" };

// godziny na tydzień (rundę): pula / sprawy poza lokalem / na stanowisku / wolne (wszystko z zalozenia.yaml: operacje)
export function licznikCzasu(C, krotko = false) {
  const stan = C.na_stanowisku || 0, wolne = C.wolne_po_stanowisku ?? C.wolne;
  const h = (x) => `${licz(x, 1)} h`;
  return krotko
    ? `Godziny właściciela w tygodniu: pula ${h(C.pula)} − poza lokalem ${h(C.wykorzystane)} = na stanowisku ${h(stan)}, wolne ${h(wolne)}`
    : `<div class="pasek ciemny"><span>Pula: <span class="kwota">${h(C.pula)}</span></span>
      <span>Sprawy poza lokalem: <span class="kwota">${h(C.wykorzystane)}</span></span>
      <span>Na stanowisku: <span class="kwota">${h(stan)}</span></span>
      <span>Wolne: <span class="kwota">${h(wolne)}</span></span></div>`;
}

function czasHtml(C, tytul) {
  const poza = C.pula ? Math.min(100, C.wykorzystane / C.pula * 100) : 0, stan = C.pula ? Math.min(100 - poza, (C.na_stanowisku || 0) / C.pula * 100) : 0;
  const odrzucone = C.pozycje.filter((p) => !p.przyjete);
  return licznikCzasu(C) + `
    <div style="display:flex;height:10px;border-radius:5px;background:var(--tlo-2, #e6e6e6);margin:8px 0;overflow:hidden" title="Zielony – sprawy poza lokalem, niebieski – praca na stanowisku">
      <div style="width:${poza}%;background:${poza >= 100 ? "#e5333f" : "#1e9e5a"}"></div><div style="width:${stan}%;background:#2f7fd6"></div></div>`
    + tabela(tytul, ["Na co", "Gdzie to ustawić", "Godziny", "Status"],
      C.pozycje.length ? C.pozycje.map((p) => [esc(p.opis), `<a data-zakladka-k="${esc(p.zakladka)}">${esc(ZAKLADKA[p.zakladka] || p.zakladka)}</a>`,
        `${licz(p.godziny, 1)} h`, p.stanowisko ? "stoi na stanowisku" : p.przyjete ? "zaplanowane" : `<span class="minus">odrzucone – brak czasu</span>`])
        : [["Nic nie zużywa czasu właściciela.", "", "", ""]],
      { klasy: ["l", "l"], stopka: ["Razem", "", `${licz(C.wykorzystane + (C.na_stanowisku || 0), 1)} h`, ""] })
    + (odrzucone.length ? `<div class="komunikat">${odrzucone.length === 1 ? "Jedna decyzja została odrzucona" : `Odrzucone decyzje: ${odrzucone.length}`}
        – zabrakło czasu właściciela. Zmniejsz liczbę dni zakupów w dyskontach albo zamów u dostawcy z dowozem.</div>` : "");
}

export const czas_wlasciciela = {
  tytul: "Czas właściciela", tytulPelny: "Czas właściciela", ikona: "zegar", odblokowanie: (v) => !!v.lokale, ukryta: (v) => !v.lokale,
  info: `Właściciel ma w tygodniu pulę godzin. Najpierw schodzą z niej sprawy poza lokalem: każdy dzień zakupów w dyskoncie
    (odbiór osobisty – <a data-zakladka-k="dostawcy">hurtownie i dyskonty</a> na mapie), rekrutacja, kursy z towarem między lokalami, eventy w parkach.
    Gdy godzin zabraknie, kolejna sprawa nie dojdzie do skutku – zobaczysz to na liście błędów. Godziny, które zostaną,
    właściciel sam spędza na pustym stanowisku w lokalu (pracuje jak pracownik 1★, bez pensji; najwyżej tyle, ile etat). Nie trzeba tego
    ustawiać – im mniej spraw poza lokalem, tym dłużej stoi za ladą.`,
  decyzje({ v }) {
    return v.czas_wlasciciela ? czasHtml(v.czas_wlasciciela, "Plan czasu właściciela w tej rundzie") : `<p class="podpowiedz">Brak danych.</p>`;
  },
  wyniki({ v }) {
    const C = v.wyniki?.czas_wlasciciela;
    if (!C) return brakWynikow("Wyniki pojawią się po pierwszej rundzie.");
    const odrz = C.pozycje.filter((p) => !p.przyjete).length;
    const wolne = C.wolne_po_stanowisku ?? C.wolne;
    return podsumowanie([`Z ${licz(C.pula, 1)} h właściciel spędził <b>${licz(C.wykorzystane, 1)} h</b> na sprawach poza lokalem i <b>${licz(C.na_stanowisku || 0, 1)} h</b> na stanowisku, wolne zostało ${licz(wolne, 1)} h.`,
      odrz ? `${licz(odrz)} ${odrz === 1 ? "decyzja nie doszła" : "decyzji nie doszło"} do skutku – zabrakło godzin.` : ""], odrz ? "zly" : wolne <= 0 ? "uwaga" : "ok")
      + czasHtml(C, "Czas właściciela w rundzie");
  },
};
