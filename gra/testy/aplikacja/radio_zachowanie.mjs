// Pomocnik testu test_radio.py (podróż 04/radio): ładuje prawdziwy moduł radia pod Node'em ze stubem DOM
// i sprawdza zachowanie odbiornika. Użycie: node radio_zachowanie.mjs KATALOG_static. Wypisuje JSON { wynik, bledy }.
import path from "path";
import { pathToFileURL } from "url";

const bledy = [], wynik = {};
const luzny = () => new Proxy(function () {}, {
  set: (t, k, v) => { t[k] = v; return true; },
  get: (t, k) => (k === Symbol.toPrimitive ? () => "" : k === "length" ? 0 : k === "then" ? undefined : k === "nextNode" ? () => null : k in t ? t[k] : luzny()),
  apply: () => luzny() });

// prosty atrapa elementu: atrybuty, klasy, dataset, style, a po wpisaniu innerHTML – dzieci o znanych id i przyciski stacji
const elementy = new Map();
class Atrapa {
  constructor(id) { this.id = id; this.hidden = false; this.dataset = {}; this.attrs = {}; this.klasy = new Set(); this.zmienne = {}; this.textContent = ""; this._html = ""; this.dzieci = []; this.sluchacze = {}; }
  get classList() { return { toggle: (k, tak) => (tak ? this.klasy.add(k) : this.klasy.delete(k)), add: (k) => this.klasy.add(k), remove: (k) => this.klasy.delete(k), contains: (k) => this.klasy.has(k) }; }
  get style() { return { setProperty: (k, v) => { this.zmienne[k] = v; } }; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] ?? null; }
  addEventListener(typ, f) { (this.sluchacze[typ] ||= []).push(f); }
  focus() { globalThis.__fokus = this.id; }
  closest() { return null; }
  querySelector(sel) { return sel === ".pp-znak" ? this.znak : null; }
  querySelectorAll(sel) { return sel === ".odb-st" ? this.dzieci : []; }
  get innerHTML() { return this._html; }
  set innerHTML(h) {
    this._html = String(h);
    this.dzieci = [];
    for (const m of this._html.matchAll(/id="([\w-]+)"/g)) elementy.set(m[1], new Atrapa(m[1]));
    for (const m of this._html.matchAll(/class="odb-st"[^>]*data-s="([\w-]+)"/g)) { const b = new Atrapa(""); b.dataset.s = m[1]; this.dzieci.push(b); }
    for (const m of this._html.matchAll(/data-s="([\w-]+)"/g)) if (!this.dzieci.some((d) => d.dataset.s === m[1])) { const b = new Atrapa(""); b.dataset.s = m[1]; this.dzieci.push(b); }
  }
}
for (const id of ["pp-radio-panel", "pp-radio"]) elementy.set(id, new Atrapa(id));
elementy.get("pp-radio").znak = new Atrapa("znak");
elementy.get("pp-radio-panel").hidden = true;   // jak w pulpicie: <aside hidden>
const dokument = { getElementById: (id) => elementy.get(id) || null, addEventListener() {} };
globalThis.document = new Proxy(dokument, { get: (t, k) => (k in t ? t[k] : luzny()) });

const przyciszenia = [];
const zapis = {};
const okno = { lukrum: { dzwiek: { przycisz: (t) => przyciszenia.push(t) } }, addEventListener() {}, speechSynthesis: null, AudioContext: undefined, webkitAudioContext: undefined };
globalThis.window = new Proxy(okno, { get: (t, k) => (k in t ? t[k] : luzny()) });
globalThis.localStorage = { getItem: (k) => zapis[k] ?? null, setItem: (k, v) => { zapis[k] = v; } };
const DANE = { nadawca: { nazwa: "Fala Koziołka", opis: "Radio testowe" }, prowadzacy: { co_ile: 2, powitania: ["x"], wtracenia: ["x"], zapowiedzi: ["x"] },
  stacje: ["a", "b", "c"].map((id, i) => ({ id, rodzaj: "szum", nazwa: `Stacja ${id}`, fala: `6${i},0`, opis: `opis ${id}` })) };
globalThis.fetch = async () => ({ ok: true, json: async () => DANE });

const st = path.resolve(process.argv[2]);
const R = await import(pathToFileURL(path.join(st, "pulpit/radio.js")).href);
const sprawdz = async (nazwa, fn) => { try { wynik[nazwa] = await fn(); } catch (e) { bledy.push(`${nazwa}: ${e.message}`); } };
const panel = () => elementy.get("pp-radio-panel");
const aktywna = () => panel().dzieci.filter((x) => x.klasy.has("aktywny")).map((x) => x.dataset.s);

await sprawdz("otwarcie", async () => {
  const przed = R.radioOtwarte();
  await R.AKCJE_RADIA["pp-radio"]();
  return { przed, po: R.radioOtwarte(), stacje: panel().dzieci.length, ikona_aria: elementy.get("pp-radio").attrs["aria-expanded"], wl: elementy.get("pp-radio-wl")?.textContent };
});
await sprawdz("zmiana_stacji_na_odbiorniku", async () => {
  await R.AKCJE_RADIA["radio-stacja"]({ dataset: { s: "b" } });
  const klik = aktywna();
  await R.AKCJE_RADIA["radio-strojenie"]({ dataset: { d: "1" } });
  const gałka_dalej = aktywna();
  await R.AKCJE_RADIA["radio-strojenie"]({ dataset: { d: "1" } });
  const zawiniecie = aktywna();
  await R.AKCJE_RADIA["radio-strojenie"]({ dataset: { d: "-1" } });
  return { klik, gałka_dalej, zawiniecie, wstecz: aktywna(), zapisana: JSON.parse(zapis["lukrum-radio"]).stacja, wskazowka: panel().zmienne["--i"], kat: elementy.get("pp-radio-stroj").zmienne["--kat"] };
});
await sprawdz("przyciszanie_gwaru", async () => {
  const po_starcie = [...przyciszenia];   // zmiana stacji uruchomiła radio
  await R.AKCJE_RADIA["radio-wl"]();   // gra → wyłącz
  const po_stopie = [...przyciszenia];
  await R.AKCJE_RADIA["radio-wl"]();   // włącz
  return { po_starcie, po_stopie, na_koncu: przyciszenia.at(-1), wl: elementy.get("pp-radio-wl").textContent, znak_ukryty: elementy.get("pp-radio").znak.hidden };
});
await sprawdz("schowanie", async () => {
  await R.AKCJE_RADIA["pp-radio"]();   // ponowny klik chowa
  const po_kliku = R.radioOtwarte();
  await R.AKCJE_RADIA["pp-radio"]();
  R.zamknijRadio();   // Esc
  return { po_kliku, po_esc: R.radioOtwarte(), gra_dalej: elementy.get("pp-radio").znak.hidden === false };
});
console.log(JSON.stringify({ wynik, bledy }));
process.exit(0);
