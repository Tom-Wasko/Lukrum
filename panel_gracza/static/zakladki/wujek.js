// List od wujka (fable-wujek, 16.11.2026): prowadzenie za rękę na Planie tygodnia. Zastępuje kafelki „Plan rundy”:
// zadania są po kolei, każde mówi, DOKĄD iść (miejsce w mieście) i co tam zrobić, a pierwsze niezrobione jest wyróżnione.
// Treść (list wujka, zadania tygodnia, zadania stałe) jest w danych: dane/zeszyt.yaml, do panelu trafia jako v.zeszyt
// (api/zeszyt.py). Odhaczenie liczy pulpit/zeszyt-warunki.js ze stanu po roboczych decyzjach (v.stan) i wizyt zapisanych przez serwer.
import { esc } from "./wspolne.js";
import { wczytajGrafiki } from "../swiat/swiat.js";
import { spelniony } from "../pulpit/zeszyt-warunki.js";

// zadania bieżącego tygodnia z odhaczeniem: [{ id, gdzie, tekst, kartka, czemu, zeton, punkt, ok, szare }]; null – brak zeszytu w widoku
function zadania(v) {
  const z = v.zeszyt;
  if (!z) return null;
  return (z.zadania || []).map((x) => ({ ...x, ok: spelniony(v, x), szare: !!x.wyszarzone }));
}
export const zadanieZeszytu = (v, id) => (v.zeszyt?.zadania || []).find((x) => x.id === id) || null;

// co otwiera się w tym tygodniu, a co za tydzień (harmonogram gry: c.odRundy) – zamiast szukania kłódek w menu
const NOWOSCI = ["sprzet", "dostawcy", "sprzedaz", "raport", "karta_wynikow", "promocje", "udogodnienia", "wyposazenie", "dekor", "ubezpieczenia",
  "przejecia", "agencje", "handel", "internet"];
function nowosci(v, c) {
  if (!c?.odRundy) return "";
  const w = (r) => NOWOSCI.filter((k) => c.jestZakladka(k) && !c.wylaczona(k) && !c.ukryta(k) && c.odRundy(k) === r);
  const teraz = v.runda > (v.gra.runda_startowa || 1) ? w(v.runda) : [], potem = w(v.runda + 1);
  if (!teraz.length && !potem.length) return "";
  const link = (k) => `<a data-zakladka-k="${k}" href="#${k}">${esc(c.tytulZakladki(k))}</a>`;
  return `<div class="lw-nowe">${teraz.length ? `<span><b>Nowe w tym tygodniu:</b> ${teraz.map(link).join(", ")}</span>` : ""}
    ${potem.length ? `<span><b>Za tydzień otworzy się:</b> ${potem.map((k) => esc(c.tytulZakladki(k))).join(", ")}</span>` : ""}</div>`;
}

// Krok „teraz” na mapie miasta: budynek, do którego trzeba pójść, dostaje obwódkę i plakietkę „teraz”. Mapa (strona
// [mapa]) nie jest zmieniana: wystarcza reguła CSS po atrybucie data-id znacznika, więc działa też po przerysowaniu mapy.
// Żeton zadania to id budynku albo zespołu z dane/mapa/budynki.yaml; „lokal” – własny lokal drużyny; „bazar” – bez żetonu.
export const budynekZadania = (v, z) => (z ? (z.zeton === "lokal" ? v.stan.lokale?.[0]?.id : z.zeton) || null : null);
export function celNaMapie(v, z) {
  const id = budynekZadania(v, z);
  let styl = document.getElementById("lw-cel-styl");
  if (!id || !/^[\w-]+$/.test(id)) { styl?.remove(); return; }
  if (!styl) { styl = document.createElement("style"); styl.id = "lw-cel-styl"; document.head.appendChild(styl); }
  const zn = `.lm-znak[data-id="${id}"]`;
  styl.textContent = `${zn} { z-index: 19 !important; } ${zn} .lm-kafel { outline: 3px solid var(--akcent); outline-offset: 3px; }
    ${zn} .lm-kafel::after { content: "teraz"; position: absolute; left: 50%; bottom: calc(100% + 6px); translate: -50% 0; background: var(--akcent); color: var(--papier);
      font: 400 12px/1.5 var(--font-szyld); letter-spacing: .06em; text-transform: uppercase; padding: 0 6px; border-radius: 3px; white-space: nowrap; }
    @media (prefers-reduced-motion: no-preference) { ${zn} .lm-kafel { animation: lw-puls 1.6s ease-in-out infinite; } }
    @keyframes lw-puls { 50% { outline-offset: 8px; } }`;
  const k = z.punkt;   // to samo we wnętrzu: klikalne miejsce sceny i pozycja listy
  if (k && /^[\w-]+$/.test(k)) styl.textContent += `.sw-scena .hot[data-k="${k}"] { border: .22em solid var(--akcent); background: color-mix(in srgb, var(--akcent) 14%, transparent); }
    .sw-scena .hot[data-k="${k}"]::before { background: var(--akcent); } .sw-scena .hot[data-k="${k}"] .podpis { opacity: 1; background: var(--akcent); }
    .sw-lista button[data-k="${k}"] { box-shadow: inset 5px 0 0 var(--akcent); border-color: var(--akcent); }
    .sw-lista button[data-k="${k}"] b::after { content: " – teraz"; color: var(--akcent); font-family: var(--font-szyld); letter-spacing: .05em; text-transform: uppercase; font-size: .8em; }`;
}

// Plan tygodnia (pulpit, zeszyt, lista wujka): zadania z v.zeszyt z odhaczeniem; `nastepny` – pierwsze niezrobione (nie wyszarzone).
// Zwraca { lista: [{klucz, gdzie, co, opis, kartka, zeton, punkt, ok, szare, teraz}], nastepny, zrobione, razem } albo null (brak zeszytu).
export function planTygodnia(v) {
  const Z = zadania(v);
  if (!Z) return null;
  const pierwszy = Z.findIndex((x) => !x.ok && !x.szare);
  const lista = Z.map((x, i) => ({ klucz: x.id, gdzie: x.gdzie, co: x.tekst, opis: x.czemu, kartka: x.kartka, zeton: x.zeton, punkt: x.punkt,
    ok: x.ok, szare: x.szare, teraz: i === pierwszy }));
  const liczone = lista.filter((x) => !x.szare);
  return { lista, nastepny: lista[pierwszy] || null, zrobione: liczone.filter((x) => x.ok).length, razem: liczone.length };
}
// obwódka „teraz” na budynku następnego zadania także poza Planem tygodnia (pulpit: mapa jest ekranem domyślnym)
export function oznaczCel(v) {
  const plan = planTygodnia(v);
  celNaMapie(v, v.wyslane || !plan?.nastepny ? null : zadanieZeszytu(v, plan.nastepny.klucz));
}

// List wujka na bieżący tydzień: { tytul, tresc } albo null, gdy wujek nic nie napisał (zeszyt pulpitu, strona „Lista wujka”)
export function listTygodnia(v) {
  const z = v.zeszyt;
  return z?.list ? { tytul: z.tytul, tresc: z.list } : null;
}

export function listWujka(v, c) {
  const plan = planTygodnia(v);
  if (!plan) return "";
  const list = listTygodnia(v);
  oznaczCel(v);
  if (list) wczytajGrafiki();   // portret wujka z zestawu grafik (pojawia się sam, gdy zestaw się wczyta)
  const html = plan.lista.map((k, i) => `<li class="${k.ok ? "zrobione" : k.teraz ? "teraz" : k.szare ? "szare" : ""}"><a data-zakladka-k="${esc(k.punkt)}" href="#${esc(k.punkt)}">
    <span class="lw-nr" aria-hidden="true">${k.ok ? "✓" : i + 1}</span><span class="lw-co"><small>${esc(k.gdzie)}</small><b>${esc(k.co)}</b><span>${esc(k.opis)}</span></span>
    <span class="lw-stan">${k.ok ? "zrobione" : k.teraz ? "teraz →" : k.szare ? "robi to gra" : ""}</span></a></li>`).join("");
  return `<section class="lw-list ${list ? "" : "bez-listu"}" aria-label="Plan tygodnia krok po kroku">
    ${list ? `<div class="lw-kartka"><svg class="lw-portret" viewBox="0 0 64 80" aria-hidden="true"><use href="#g-wnetrze-portret-wujka" width="64" height="80"/></svg>
      <div><p class="lw-naglowek">List od wujka · tydzień ${v.zeszyt.tydzien}</p><h2>${esc(list.tytul)}</h2><p>${esc(list.tresc)}</p><p class="lw-podpis">Wasz wujek</p></div></div>` : ""}
    <div class="lw-kroki"><div class="lw-tytul"><span>Do zrobienia w tym tygodniu</span><span>${plan.zrobione} z ${plan.razem}</span></div><ol>${html}</ol>${nowosci(v, c)}</div></section>`;
}
