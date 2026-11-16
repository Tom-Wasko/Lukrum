// „Kurier rankingowy” – pierwsza strona gazety w redakcji (fable-kurier, 16.11.2026). Co tydzień nowe wydanie złożone
// z danych, które gra już liczy: ranking (v.ranking, v.karta_skumulowana), tydzień w liczbach (v.tydzien), wnioski
// (v.wnioski). Niczego nie zmienia w zasadach: to inny sposób pokazania wyników, zanim gracz wejdzie w tabele.
import { esc, licz, nazwaFirmy, nazwaRundy, zl } from "../zakladki/wspolne.js";

const pkt = (x) => (x == null ? "–" : licz(Math.round(x)));
const odmiana = (n, a, b, c) => (n === 1 ? a : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? b : c);

function ranking(v) {
  const R = v.ranking;
  if (!R?.rundy?.length) return null;
  const ost = R.miejsca[R.rundy[R.rundy.length - 1]], przed = R.rundy.length > 1 ? R.miejsca[R.rundy[R.rundy.length - 2]] : null;
  const firmy = Object.keys(ost).sort((a, b) => ost[a] - ost[b]);
  const ruch = (f) => (przed?.[f] ? przed[f] - ost[f] : 0);
  return { ost, przed, firmy, ruch };
}

function tytulGlowny(v, L) {
  const lider = L.firmy[0], ja = v.firma, skum = v.karta_skumulowana || {};
  const p = pkt(skum[lider]?.punkty), drugi = L.firmy[1];
  const przewaga = drugi && skum[lider]?.punkty != null && skum[drugi]?.punkty != null ? Math.round(skum[lider].punkty - skum[drugi].punkty) : null;
  const nowy = L.przed && L.przed[lider] !== 1;
  const tytul = lider === ja ? (nowy ? `„${nazwaFirmy(v, ja)}” na czele! Zmiana lidera w lidze kebabów` : `„${nazwaFirmy(v, ja)}” nie oddaje prowadzenia`)
    : nowy ? `Zmiana lidera: „${nazwaFirmy(v, lider)}” wychodzi na prowadzenie` : `„${nazwaFirmy(v, lider)}” wciąż na czele ligi kebabów`;
  const lead = `Po tygodniu „${nazwaRundy(v.runda - 1)}” lider ma ${p} pkt${przewaga != null ? `, o ${licz(przewaga)} ${odmiana(przewaga, "punkt", "punkty", "punktów")} więcej niż „${nazwaFirmy(v, drugi)}”` : ""}.`
    + (lider === ja ? " Redakcja gratuluje i przypomina: ostatnie tygodnie ważą w tabeli najwięcej." : ` „${nazwaFirmy(v, ja)}” zajmuje ${L.ost[ja] ?? "–"}. miejsce na ${L.firmy.length}.`);
  return [tytul, lead];
}

function tabelaLigi(v, L) {
  const skum = v.karta_skumulowana || {};
  const strz = (d) => (d > 0 ? `<span class="znak-zysk">${d}</span>` : d < 0 ? `<span class="znak-strata">${-d}</span>` : `<span aria-label="bez zmian">=</span>`);
  return `<table class="kr-tabela"><caption>Tabela ligowa</caption><tbody>${L.firmy.map((f) => `<tr class="${f === v.firma ? "ja" : ""}"><td>${L.ost[f]}.</td>
    <th scope="row">${esc(nazwaFirmy(v, f))}${f === v.firma ? " (Wy)" : ""}</th><td>${strz(L.ruch(f))}</td><td>${pkt(skum[f]?.punkty)} pkt</td></tr>`).join("")}</tbody></table>`;
}

function zOstatniejChwili(v, L) {
  const inne = L.firmy.filter((f) => L.ruch(f) !== 0).sort((a, b) => L.ruch(b) - L.ruch(a));
  const w = [];
  const gora = inne[0], dol = inne[inne.length - 1];
  if (gora && L.ruch(gora) > 0) w.push(`<b>Skok tygodnia.</b> „${esc(nazwaFirmy(v, gora))}” w górę o ${L.ruch(gora)} ${odmiana(L.ruch(gora), "miejsce", "miejsca", "miejsc")}.`);
  if (dol && L.ruch(dol) < 0) w.push(`<b>Zadyszka.</b> „${esc(nazwaFirmy(v, dol))}” traci ${-L.ruch(dol)} ${odmiana(-L.ruch(dol), "miejsce", "miejsca", "miejsc")}.`);
  if (!w.length) w.push("<b>Bez przetasowań.</b> Kolejność w tabeli taka sama jak tydzień temu. Cisza przed burzą?");
  const zostalo = v.gra.liczba_rund - v.runda + 1;
  w.push(zostalo > 0 ? `<b>Kalendarz.</b> Do końca sezonu ${odmiana(zostalo, "został", "zostały", "zostało")} ${zostalo} ${odmiana(zostalo, "tydzień", "tygodnie", "tygodni")}.` : "<b>Koniec sezonu.</b> To wydanie zamyka ligę.");
  return w.map((t) => `<p>${t}</p>`).join("");
}

function waszTydzien(v) {
  const T = v.tydzien;
  if (!T) return "";
  const f = (x) => (x.format === "zl" ? zl(x.wartosc) : licz(x.wartosc));
  const znak = (x) => {
    if (x.poprzednia == null || x.wartosc === x.poprzednia) return "";
    const lepiej = (x.wartosc - x.poprzednia) * (x.lepiej ?? 1) > 0;
    return `<span class="${lepiej ? "znak-zysk" : "znak-strata"}" title="tydzień wcześniej: ${esc(x.format === "zl" ? zl(x.poprzednia) : licz(x.poprzednia))}"></span>`;
  };
  return `<dl class="kr-liczby">${T.liczby.slice(0, 5).map((x) => `<div><dt>${esc(x.etykieta)}</dt><dd>${znak(x)}${f(x)}</dd></div>`).join("")}</dl>
    ${(T.zdania || []).slice(0, 3).map((z) => `<p>${esc(z)}</p>`).join("")}`;
}

function rada(v, c) {
  const r = (v.wnioski?.do_poprawy || []).find((x) => !c.ukryta(x.zakladka));
  return r ? `<p><b>${esc(r.tytul)}.</b> ${esc(r.co)}</p><p><a data-zakladka-k="wnioski" href="#wnioski">Więcej w dziale porad →</a></p>`
    : `<p>W tym tygodniu redakcja nie ma uwag. Tak trzymać.</p>`;
}

export function gazeta(c) {
  const v = c.v, L = ranking(v), nr = Math.max(0, v.runda - (v.gra.runda_startowa || 1));
  const winieta = `<header class="kr-winieta"><span>Wydanie nr ${nr || 1}</span><h2>Kurier rankingowy</h2><span>${esc(nazwaRundy(Math.max(1, v.runda - 1)))} · egzemplarz bezpłatny</span></header>`;
  if (!L) return `<article class="kr" aria-label="Kurier rankingowy">${winieta}<div class="kr-pusto"><h3>Pierwszy numer jeszcze w drukarni</h3>
    <p>Redakcja czeka na wyniki. Tabela ligowa ukaże się, gdy zamknie się pierwszy tydzień sprzedaży.</p></div></article>`;
  const [tytul, lead] = tytulGlowny(v, L);
  return `<article class="kr" aria-label="Kurier rankingowy">${winieta}
    <div class="kr-glowna"><h3>${esc(tytul)}</h3><p class="kr-lead">${esc(lead)}</p></div>
    <div class="kr-szpalty">
      <section>${tabelaLigi(v, L)}<p><a data-zakladka-k="ranking" href="#ranking">Pełna tabela i wykres →</a></p></section>
      <section><h4>Z ostatniej chwili</h4>${zOstatniejChwili(v, L)}</section>
      <section><h4>Wasz tydzień w liczbach</h4>${waszTydzien(v)}<p><a data-zakladka-k="karta_wynikow" href="#karta_wynikow">Punkty tygodnia →</a></p></section>
      <section><h4>Redakcja radzi</h4>${rada(v, c)}</section>
    </div></article>`;
}
