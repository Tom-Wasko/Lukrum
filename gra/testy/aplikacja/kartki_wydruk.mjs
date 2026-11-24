// Pomocnik testu test_kreator.py: ładuje prawdziwy moduł kartek i wypisuje JSON { html } dla podanych grup.
// Użycie: node kartki_wydruk.mjs KATALOG_static GRUPY_JSON
import path from "path";
import { pathToFileURL } from "url";

const [, , katalog, grupy] = process.argv;
const { kartkiHtml } = await import(pathToFileURL(path.join(katalog, "mg", "kartki.js")).href);
console.log(JSON.stringify({ html: kartkiHtml(JSON.parse(grupy), "https://lukrum.test/konta/login/") }));
