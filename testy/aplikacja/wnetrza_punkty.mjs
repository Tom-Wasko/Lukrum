// Pomocnik testu test_wnetrza_sceny.py: ładuje sceny wnętrz (panel_gracza/static/swiat/sceny/*.js) z atrapą biblioteki rysunku
// i wypisuje JSON { id: [{ et, ekran, odsyla, wejscie }] } oraz błędy rysowania. Użycie: node wnetrza_punkty.mjs KATALOG_Z_KOPIAMI_MJS
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
const kat = process.argv[2];
const Z = { ekran: "zaop_dostawy" };
const atrapa = () => new Proxy({ q: new URLSearchParams(), sk: 1, pal: "bar", esc: (x) => x, KOL: [], gra: { tydzien: 1, odRundy: () => 0 },
  zamow: () => Z, koszyk: () => Z, dowoz: () => Z, gazetka: () => Z }, { get: (t, k) => (k in t ? t[k] : () => "") });
global.document = { querySelector: () => null, getElementById: () => null };
const wynik = {}, bledy = [];
for (const f of fs.readdirSync(kat).filter((x) => x.endsWith(".mjs") && x !== "index.mjs")) {
  const id = f.slice(0, -4), R = atrapa();
  const q = { bank: "b=kmicic", biuro_rachunkowe: "f=jks", park: "p=ogrod_saski" }[id] || "";
  R.q = new URLSearchParams(q);
  try {
    const S = (await import(pathToFileURL(path.resolve(kat, f)).href)).default(R);
    S.rysuj(R);
    const w = S.widoki ? Object.values(S.widoki) : [S];
    wynik[id] = w.flatMap((x) => (typeof x.punkty === "function" ? x.punkty(R) : x.punkty || [])).map((p) => ({
      et: p.et, ekran: p.teczka ? String(p.teczka.ekran || "").split(/[^a-z0-9_]/i)[0] : "", odsyla: !!p.odsyla, wejscie: p.wejscie || "" }));
  } catch (e) { bledy.push(`${id}: ${e.message}`); }
}
console.log(JSON.stringify({ wynik, bledy }));
