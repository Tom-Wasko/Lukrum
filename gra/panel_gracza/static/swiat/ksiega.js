// Księga gości we wnętrzu kebaba (fable-ksiega, 16.11.2026): ocena lokalu rozbita na pięć wymiarów, które rozumie
// każdy, kto czytał recenzje w internecie – smak, czekanie, cena, obsługa, wnętrze – i ostatnie wpisy gości.
// Liczby pochodzą z silnika opinii (silnik/rynek/opinie.py): v.wyniki.opinie[lokal].powody to gwiazdki dodane albo
// odjęte od oceny wyjściowej w ostatnim tygodniu. Tu tylko inaczej je pokazujemy i podpowiadamy, gdzie to poprawić.
import { esc, licz } from "../zakladki/wspolne.js";
import { lokalWybrany } from "../zakladki/lokal_wybor.js";

// wymiar → powody silnika, które się na niego składają, i miejsce, w którym gracz może coś z tym zrobić
const WYMIARY = [
  { nazwa: "Smak", powody: ["jakosc"], cel: "dostawcy", gdzie: "Hurtownie: lepsze składniki", zle: "goście narzekają na jakość dań", dobrze: "goście chwalą jedzenie" },
  { nazwa: "Czekanie", powody: ["kolejka", "tlok"], cel: "stanowiska", gdzie: "Rożen: stanowiska i ludzie", zle: "przy ladzie był tłok: goście czekali albo odeszli z kolejki", dobrze: "nikt nie odszedł z kolejki" },
  { nazwa: "Cena", powody: ["cena"], cel: "oferta", gdzie: "Tablica: ceny", zle: "drożej niż w okolicy", dobrze: "ceny nie odstraszają" },
  { nazwa: "Obsługa", powody: ["pomylki", "brak"], cel: "zespol", gdzie: "Zaplecze: grafik i szkolenia", zle: "pomyłki w zamówieniach albo brak dań z menu", dobrze: "bez pomyłek i braków" },
  { nazwa: "Wnętrze", powody: ["wyposazenie"], cel: "dekor", gdzie: "Park handlowy: wyposażenie i wystrój", zle: "", dobrze: "goście doceniają wyposażenie i wystrój" },
];
const gw = (x) => (x == null ? "–" : x.toFixed(1).replace(".", ","));
const gwiazdki = (n) => "★".repeat(Math.max(0, Math.min(5, n))) + "☆".repeat(5 - Math.max(0, Math.min(5, n)));

const proc = (x) => `${Math.round(x * 100)}%`;
// Z42 (03/ukryte): zdania „dlaczego” pod tabelą – liczby z silnika (v.wyniki.opinie[lokal]), bez liczenia wzorów w JS
function uwagi(O) {
  if (!O) return "";
  const z = [];
  z.push(O.zaufanie < 0.5
    ? `▼ Mało opinii: ocena działa na gości na ${proc(O.zaufanie)} swojej siły. Im więcej opinii, tym mocniej goście ufają gwiazdkom.`
    : `✓ Ocena działa na gości na ${proc(O.zaufanie)} swojej siły: opinii jest już dość, żeby goście jej ufali.`);
  if (O.zanik != null) z.push(`Stare opinie liczą się co tydzień na ${proc(O.zanik)} poprzedniej wagi, więc ocena nadąża za tym, jak jest teraz.`);
  if (O.rozrzut != null) z.push(`${O.rozrzut >= 0.3 ? "▲" : "–"} Ocena tygodnia mogła się wahać o ok. ±${gw(O.rozrzut)} ★ przez przypadek: przy kilku opiniach skacze, przy wielu się uspokaja.`);
  if (O.czekanie_grup != null && Math.abs(O.czekanie_grup - 1) >= 0.05) {
    z.push(O.czekanie_grup > 1 ? `▲ Goście tego lokalu źle znoszą czekanie (waga ${gw(O.czekanie_grup)}): biurowi i spieszący się karzą kolejki mocniej niż studenci.`
      : `▼ Goście tego lokalu znoszą czekanie lepiej niż przeciętnie (waga ${gw(O.czekanie_grup)}).`);
  }
  z.push("Smak zależy też od świeżości: zamiennik za brakujący składnik jest gorszy, a przeterminowane składniki idą do kosza (Zaplecze ▸ Świeżość).");
  return `<ul class="kg-uwagi">${z.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
}

export function ksiegaGosci(c) {
  const v = c.v, lok = lokalWybrany(v);
  if (!lok) return "";
  const O = v.wyniki?.opinie?.[lok.id], P = v.lokale?.opinie?.[lok.id];
  if (!O && !P) return "";
  const wiersze = O ? WYMIARY.map((w) => {
    const x = w.powody.reduce((s, p) => s + (O.powody?.[p] || 0), 0);
    const stan = x >= 0.05 ? "plus" : x <= -0.05 ? "minus" : "zero";
    const dl = Math.min(100, Math.round(Math.abs(x) / 1.2 * 100));   // pasek: 1,2 gwiazdki = pełna szerokość połowy
    const opis = stan === "plus" ? w.dobrze : stan === "minus" ? w.zle : "bez wpływu na ocenę";
    const link = stan !== "plus" && c.jestZakladka(w.cel) && !c.ukryta(w.cel) && !c.wylaczona(w.cel)
      ? ` <a data-zakladka-k="${w.cel}" href="#${w.cel}">${esc(w.gdzie)} →</a>` : "";
    return `<tr class="${stan}"><th scope="row">${w.nazwa}</th>
      <td class="kg-pasek" aria-hidden="true"><span><i style="width:${stan === "minus" ? dl : 0}%"></i></span><span><i style="width:${stan === "plus" ? dl : 0}%"></i></span></td>
      <td class="kg-ile"><span class="${stan === "plus" ? "znak-zysk" : stan === "minus" ? "znak-strata" : ""}">${stan === "zero" ? "0" : gw(Math.abs(x))} ★</span></td>
      <td class="kg-opis">${esc(opis || "bez wpływu na ocenę")}.${link}</td></tr>`;
  }).join("") : "";
  const wpisy = (P?.komentarze || []).slice(0, 3).map((k) => `<blockquote><span class="kg-gw" aria-label="${k.gwiazdki} na 5 gwiazdek">${gwiazdki(k.gwiazdki)}</span>
    <p>„${esc(k.tekst)}”</p><footer>${esc(k.podpis)}</footer></blockquote>`).join("");
  const ocena = P?.ocena ?? O?.ocena;
  return `<section class="kg" aria-label="Księga gości"><header><h2>Księga gości</h2>
      <p class="kg-ocena"><b>${gw(ocena)}</b> ★ <span>średnia z ${licz(P?.liczba ?? O?.liczba ?? 0)} opinii${O ? ` · ostatni tydzień: ${gw(O.ocena_tygodnia)} ★ (${licz(O.nowe)} nowych)` : ""}</span></p></header>
    <div class="kg-uklad">${O ? `<table class="kg-wymiary"><caption>Co w ostatnim tygodniu podniosło albo obniżyło ocenę</caption><tbody>${wiersze}</tbody></table>${uwagi(O)}` : ""}
      ${wpisy ? `<div class="kg-wpisy">${wpisy}</div>` : ""}</div>
    <p class="kg-stopka">Lepsza ocena to więcej gości: nowi klienci patrzą na gwiazdki, zanim wejdą.</p></section>`;
}
