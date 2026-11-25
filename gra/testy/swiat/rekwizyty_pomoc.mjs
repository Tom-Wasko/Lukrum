// Pomocnik testu test_rekwizyty.py: ładuje prawdziwy rysunek.js + rekwizyty.js i sceny (bez przeglądarki).
// Wypisuje JSON { helpery: {nazwa: bool}, sceny: {id: {dol: n, svg: dlugosc}}, banki: {b: svg} }.
import fs from "fs";
import os from "os";
import path from "path";
import { pathToFileURL } from "url";
const swiat = process.argv[2];
const nic = () => {};
global.document = { querySelector: () => null, getElementById: () => null, addEventListener: nic, querySelectorAll: () => [] };
global.window = global;
global.addEventListener = nic;
const url = (p) => pathToFileURL(path.join(swiat, p)).href;
const { R } = await import(url("rysunek.js"));
const { REKWIZYTY } = await import(url("rekwizyty.js"));
const helpery = {};
for (const n of REKWIZYTY) {
  const w = typeof R[n] === "function" ? String(n === "kasetony" ? R[n](100, 300) : R[n](200, 500, 120, 60, "HASŁO")) : "";
  helpery[n] = w.includes("<") && !w.includes("NaN") && !w.includes("undefined");
}
// sceny jako moduły .mjs w katalogu tymczasowym (importują ./rysunek.js tylko przez R z argumentu)
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sceny-"));
const sceny = {}, banki = {}, biura = {};
const ustaw = (q) => { R.q = new URLSearchParams(q); };
for (const f of fs.readdirSync(path.join(swiat, "sceny")).filter((x) => x.endsWith(".js") && x !== "index.js")) {
  const id = f.slice(0, -3), kopia = path.join(tmp, id + ".mjs");
  fs.copyFileSync(path.join(swiat, "sceny", f), kopia);
  const warianty = { bank: ["b=kmicic", "b=wokulski", "b=ziemia", "b=rzecki", "b=soplicowo"], park: ["p=ogrod_saski", "p=blonia", "p=zalew"],
    biuro_rachunkowe: ["f=jks", "f=jozef_k", "f=scrooge"] }[id] || [""];
  for (const q of warianty) {
    try {
      ustaw(q);
      const S = (await import(pathToFileURL(kopia).href)).default(R);
      const svg = String(S.rysuj(R));
      const dol = (svg.match(/(?:y|cy)="(\d+(?:\.\d+)?)"|translate\((?:-?[\d.]+)[ ,]+(\d+(?:\.\d+)?)\)/g) || [])
        .map((m) => parseFloat((m.match(/(\d+(?:\.\d+)?)\)?"?$/) || [0, 0])[1])).filter((v) => v >= 400).length;
      sceny[id + (q ? "?" + q : "")] = { dol, svg: svg.length };
      if (id === "bank") banki[q] = svg;
      if (id === "biuro_rachunkowe") biura[q] = svg;
    } catch (e) { sceny[id + "?" + q] = { blad: e.message }; }
  }
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(JSON.stringify({ helpery, sceny, banki, biura }));
