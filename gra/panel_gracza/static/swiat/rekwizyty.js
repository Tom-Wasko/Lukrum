// Wspólna paczka rekwizytów do wnętrz i parków (wątek „charakter”, P2): dół scen, meble, drobiazgi, zieleń, PRL.
// Dopisuje helpery do R z rysunek.js (nie zmienia istniejących). Style: k, k1, k3, bez, efekt; kolory tylko zmiennymi.
// Wszystkie funkcje zwracają tekst SVG; współrzędne w płótnie 1220×612 (jak sceny).
import { R } from "./rysunek.js";

/** Rząd krzeseł poczekalni (n sztuk co `odstep`), stopy na y. */
R.krzeslaRzad = (x, y, n = 3, odstep = 62, kolor = "var(--akcent-2)") =>
  Array.from({ length: n }, (_, i) => R.krzeslo(x + i * odstep, y, 1, kolor)).join("");

/** Kosz na śmieci uliczny/parkowy (słupek + pojemnik z pokrywą). */
R.pojemnik = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path class="k" d="M-14-48h28l-3 48h-22z" fill="var(--g-zielen2)"/><rect class="k" x="-17" y="-54" width="34" height="8" rx="3" fill="var(--g-metal)"/><path class="bez" d="M-8-40v32M0-40v32M8-40v32" stroke="var(--tusz)" opacity=".35"/></g>`;

/** Wózek sklepowy: koszyk z siatki, rączka, dwa kółka. */
R.wozekSklep = (x, y, s = 1, kolor = "var(--g-metal2)") => `<g transform="translate(${x} ${y}) scale(${s})"><path class="k" d="M-34-62h74l-10 42h-54z" fill="${kolor}" fill-opacity=".55"/><path class="bez" d="M-28-48h64M-24-34h54M-12-62l4 42M6-62l2 42M24-62l0 42" stroke="var(--tusz)" opacity=".4"/><path class="k bez" d="M-34-62l-14-14h-8" stroke-width="3"/><path class="k bez" d="M-26-20v6h56" stroke-width="3"/><circle class="k" cx="-20" cy="-6" r="6" fill="var(--g-czern)"/><circle class="k" cx="26" cy="-6" r="6" fill="var(--g-czern)"/></g>`;

/** Wieża koszyków sklepowych (wsunięte w siebie). */
R.wiezaKoszykow = (x, y, n = 4, kolor = "var(--akcent)") => Array.from({ length: n }, (_, i) =>
  `<path class="k" d="M${x} ${y - 22 - i * 9}h44l-6 20h-32z" fill="${kolor}"/><path class="k bez" d="M${x + 8} ${y - 22 - i * 9}q14-8 28 0" stroke-width="3"/>`).join("");

/** Stos skrzynek (n warstw po dwie), lekko przesunięte. */
R.stosSkrzynek = (x, y, n = 3, w = 64, kolor = "var(--g-drewno)") => Array.from({ length: n }, (_, i) =>
  `<rect class="k" x="${x + (i % 2) * 6}" y="${y - (i + 1) * 28}" width="${w}" height="28" fill="${kolor}"/><path class="bez" d="M${x + 8 + (i % 2) * 6} ${y - (i + 1) * 28 + 10}h${w - 16}M${x + 8 + (i % 2) * 6} ${y - (i + 1) * 28 + 19}h${w - 16}" stroke="var(--tusz)" opacity=".35"/>`).join("");

/** Bieżnik/dywan korytarzowy z szlaczkiem (pas poziomy na podłodze). */
R.biegacz = (x, y, w, h = 26, kolor = "var(--akcent)") => `<rect class="k" x="${x}" y="${y}" width="${w}" height="${h}" fill="${kolor}" fill-opacity=".75"/><path class="bez" d="M${x + 6} ${y + 5}h${w - 12}M${x + 6} ${y + h - 5}h${w - 12}" stroke="var(--papier)" stroke-width="2" stroke-dasharray="10 6" opacity=".8"/>`;

/** Wycieraczka przy drzwiach. */
R.wycieraczka = (x, y, w = 110) => `<rect class="k" x="${x}" y="${y}" width="${w}" height="16" rx="3" fill="var(--g-czern)" fill-opacity=".7"/><path class="bez" d="M${x + 8} ${y + 8}h${w - 16}" stroke="var(--papier)" stroke-dasharray="3 5" opacity=".6"/>`;

/** Plakat z hasłem w duchu PRL: ramka, mocna litera, pasek. Hasło krótkie (2–3 słowa). */
R.plakatPRL = (x, y, w, h, haslo, kolor = "var(--akcent)") => `<rect class="k" x="${x}" y="${y}" width="${w}" height="${h}" fill="var(--papier)"/><rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${h * 0.52}" fill="${kolor}"/><path class="bez" d="M${x + 6} ${y + 6 + h * 0.52}l${w * 0.3}-${h * 0.2}l${w * 0.25}${h * 0.1}l${w * 0.3}-${h * 0.14}v${h * 0.24}z" fill="var(--g-czern)" fill-opacity=".35"/>` + R.t(x + w / 2, y + h - 14, haslo, Math.max(10, Math.round(w / 9)), { f: "var(--tusz)", w: 700 });

/** Doniczka z kwiatkiem na parapecie/podłodze. */
R.doniczka = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path class="k" d="M-12-22h24l-4 22h-16z" fill="var(--g-rudy)"/><path class="k1 bez" d="M0-22v-30M0-36q-12-6-16-16M0-40q12-4 16-14" stroke="var(--g-zielen2)" stroke-width="3"/><circle class="k" cx="0" cy="-58" r="8" fill="var(--uwaga)"/><circle cx="0" cy="-58" r="3" fill="var(--g-czern)"/></g>`;

/** Kasetony sufitowe/ścienne: siatka płytek w pasie y1–y2 (PRL: hole, urzędy). */
R.kasetony = (y1, y2, x1 = 0, x2 = 1220, krok = 80) => {
  let s = `<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" fill="var(--g-sciana2)"/>`;
  for (let x = x1; x < x2; x += krok) s += `<path class="bez" d="M${x} ${y1}v${y2 - y1}" stroke="var(--tusz)" opacity=".18"/>`;
  return s + `<path class="bez" d="M${x1} ${y1}h${x2 - x1}M${x1} ${y2}h${x2 - x1}" stroke="var(--tusz)" opacity=".3"/>`;
};

/** Drzewo parkowe: pień i korona (typ: liść, topola, kasztan, sosna). */
R.drzewo = (x, y, s = 1, typ = "lisc") => {
  const kor = typ === "sosna" ? `<path class="k" d="M-34-80l34-86l34 86zM-28-130l28-64l28 64z" fill="var(--g-zielen2)"/>`
    : typ === "topola" ? `<ellipse class="k" cx="0" cy="-130" rx="30" ry="96" fill="var(--g-zielen)"/>`
    : typ === "kasztan" ? `<circle class="k" cx="-34" cy="-118" r="44" fill="var(--g-zielen)"/><circle class="k" cx="34" cy="-118" r="44" fill="var(--g-zielen2)"/><circle class="k" cx="0" cy="-154" r="50" fill="var(--g-zielen)"/>`
      : `<circle class="k" cx="0" cy="-130" r="62" fill="var(--g-zielen)"/><circle class="k" cx="-34" cy="-104" r="38" fill="var(--g-zielen2)"/><circle class="k" cx="36" cy="-108" r="36" fill="var(--g-zielen2)"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})"><rect class="k" x="-8" y="-84" width="16" height="84" fill="var(--g-drewno)"/>${kor}</g>`;
};

/** Krzew albo żywopłot (szerokość w). */
R.krzew = (x, y, w = 90, kolor = "var(--g-zielen2)") => `<path class="k" d="M${x} ${y}q0-34 ${w * 0.2}-34q${w * 0.15}-18 ${w * 0.3}-6q${w * 0.2}-16 ${w * 0.3} 6q${w * 0.2} 0 ${w * 0.2} 34z" fill="${kolor}"/>`;

/** Klomb z kwiatami (rząd kropek w obwódce). */
R.klomb = (x, y, w = 120) => `<ellipse class="k" cx="${x + w / 2}" cy="${y}" rx="${w / 2}" ry="14" fill="var(--g-drewno2)"/>` + Array.from({ length: 7 }, (_, i) => `<circle class="k1" cx="${x + 14 + i * (w - 28) / 6}" cy="${y - 6 - (i % 2) * 4}" r="5" fill="${["var(--uwaga)", "var(--akcent)", "var(--papier)"][i % 3]}"/>`).join("");

/** Fontanna: misa na trzonie, strumyki, woda w basenie. */
R.fontanna = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse class="k" cx="0" cy="-8" rx="84" ry="16" fill="var(--g-metal2)"/><ellipse cx="0" cy="-12" rx="70" ry="10" fill="var(--g-szklo)" opacity=".8"/><rect class="k" x="-10" y="-70" width="20" height="62" fill="var(--g-metal)"/><ellipse class="k" cx="0" cy="-72" rx="34" ry="8" fill="var(--g-metal2)"/><path class="bez" d="M0-82v-34M0-100q-26-10-34 30M0-100q26-10 34 30" stroke="var(--g-szklo)" stroke-width="4" opacity=".9"/></g>`;

/** Pomnik na cokole (typ: obelisk, popiersie, kolumna). */
R.pomnik = (x, y, s = 1, typ = "obelisk") => {
  const gora = typ === "popiersie" ? `<circle class="k" cx="0" cy="-122" r="14" fill="var(--g-metal)"/><path class="k" d="M-22-84q0-26 22-26t22 26z" fill="var(--g-metal)"/>`
    : typ === "kolumna" ? `<rect class="k" x="-12" y="-170" width="24" height="86" fill="var(--g-metal)"/><circle class="k" cx="0" cy="-178" r="10" fill="var(--g-metal2)"/>`
      : `<path class="k" d="M-14-84l6-96h16l6 96z" fill="var(--g-metal)"/><path class="k" d="M-8-180l8-16l8 16z" fill="var(--g-metal2)"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})"><rect class="k" x="-34" y="-20" width="68" height="20" fill="var(--g-metal2)"/><rect class="k" x="-24" y="-84" width="48" height="64" fill="var(--g-metal2)"/>${gora}</g>`;
};

/** Szklarnia (Ogród Botaniczny): łukowa konstrukcja z szybami i roślinami w środku. */
R.szklarnia = (x, y, w = 240, h = 150) => `<path class="k" d="M${x} ${y}v-${h * 0.6}q${w / 2}-${h * 0.7} ${w} 0v${h * 0.6}z" fill="var(--g-szklo)" fill-opacity=".55"/><path class="k bez" d="M${x + w / 3} ${y}v-${h * 0.9}M${x + w * 2 / 3} ${y}v-${h * 0.9}M${x} ${y - h * 0.3}h${w}" stroke-width="3"/><path class="k" d="M${x + 30} ${y}q10-60 40-50q-6 30 4 50zM${x + w - 70} ${y}q14-70 44-56q-8 34 4 56z" fill="var(--g-zielen2)"/>`;

/** Altana/pawilon z daszkiem. */
R.altana = (x, y, w = 170) => `<path class="k" d="M${x - 14} ${y - 96}l${w / 2 + 14}-44l${w / 2 + 14} 44z" fill="var(--g-rudy)"/><path class="k bez" d="M${x + 6} ${y - 96}v96M${x + w - 6} ${y - 96}v96" stroke-width="6"/><rect class="k" x="${x}" y="${y - 12}" width="${w}" height="12" fill="var(--g-drewno2)"/><path class="k bez" d="M${x + 6} ${y - 40}h${w - 12}" stroke-width="3"/>`;

/** Regał wysoki hurtowni z paletami (cztery kondygnacje) – dla hurtowni, gdy potrzeba więcej nóg przy podłodze. */
R.paletyRzad = (x, y, n = 3, kolor = "var(--g-drewno)") => Array.from({ length: n }, (_, i) =>
  `<rect class="k" x="${x + i * 84}" y="${y - 12}" width="78" height="12" fill="${kolor}"/><rect class="k" x="${x + i * 84 + 6}" y="${y - 52}" width="66" height="40" fill="var(--g-drewno2)"/><path class="bez" d="M${x + i * 84 + 12} ${y - 32}h54" stroke="var(--tusz)" opacity=".4"/>`).join("");

/** Lista nazw dodanych helperów (test pilnuje, że każdy zwraca tekst SVG). */
export const REKWIZYTY = ["krzeslaRzad", "pojemnik", "wozekSklep", "wiezaKoszykow", "stosSkrzynek", "biegacz", "wycieraczka", "plakatPRL", "doniczka", "kasetony", "drzewo", "krzew", "klomb", "fontanna", "pomnik", "szklarnia", "altana", "paletyRzad"];
