// Sklep meblowy „Meblościanka” (fable-sklep, 16.11.2026): dekor lokalu – cztery grupy elementów w pięciu stylach.
// Silnik: silnik/rynek/dekor.py, dane: dane/mapa/dekor.yaml, widok: v.dekor { katalog, lokale }.
// Decyzje (jak wyposażenie – w wybranym lokalu): dekor_kup [[grupa, styl]], dekor_ustaw {grupa: styl}.
// Zakupy idą najpierw do wózka (lista decyzji), kasa pokazuje paragon; płaci się przy zamknięciu tygodnia.
import { esc, proc, zl } from "./wspolne.js";
import { idWybranego, lokalWybrany, nazwaLokalu } from "./lokal_wybor.js";
import { wczytajGrafiki } from "../swiat/swiat.js";
import { rozmiarGrafiki } from "../swiat/sceny.js";

const uz = (n, x, y, s = 1) => {
  const [w, h] = rozmiarGrafiki(n);
  return `<use href="#g-${n}" x="${x}" y="${y}" width="${w * s}" height="${h * s}"/>`;
};
const saGrafiki = () => !!rozmiarGrafiki("dekor-meble-prl")[0];
// miniatura elementu w danym stylu (te same grafiki, co we wnętrzu kebaba)
function miniatura(grupa, styl) {
  if (!saGrafiki()) return `<svg viewBox="0 0 240 120" aria-hidden="true"></svg>`;   // grafiki jeszcze się wczytują
  const pusto = `<text x="120" y="66" text-anchor="middle" font-size="15" fill="var(--tusz)" opacity=".6" font-family="var(--font-szyld)" letter-spacing="1.5">PUSTE ŚCIANY</text>`;
  const rys = {
    sciany: () => ["420 260 300 150", uz(`dekor-sciana-${styl}`, 0, 0) + uz(`dekor-podloga-${styl}`, 0, 380)],
    szyld: () => ["-10 -27 280 120", uz(`dekor-szyld-${styl}`, 0, 0)],
    dodatki: () => ["0 0 240 120", styl === "podstawowy" ? pusto
      : uz(`dekor-zdjecie-${styl}`, 12, 22) + uz(`dekor-plakat-${styl}`, 126, 12) + uz(`dekor-roslina-${styl}`, 186, 4)],
    meble: () => ["0 0 320 160", uz(`dekor-lampa-${styl}`, 10, 0, 0.9) + uz(`dekor-meble-${styl}`, 90, 8)],
  }[grupa]();
  return `<svg viewBox="${rys[0]}" aria-hidden="true" preserveAspectRatio="xMidYMid meet">${rys[1]}</svg>`;
}

const cel = (d, id) => (id ? ((d.w_lokalu = d.w_lokalu || {})[id] = d.w_lokalu[id] || {}) : d);
const czytaj = (d, id, k) => (id ? d.w_lokalu?.[id]?.[k] : d[k]);

function stanSklepu(c) {
  const lok = lokalWybrany(c.v), D = c.v.dekor, id = idWybranego(c.v);
  const L = lok && D?.lokale?.[lok.id];
  if (!L) return null;
  const wozek = (czytaj(c.d || {}, id, "dekor_kup") || []).filter(([g, s]) => D.katalog.grupy[g] && D.katalog.style[s]);
  const wWozku = (g, s) => wozek.some(([a, b]) => a === g && b === s);
  const mial = (g, s) => (L.kupione[g] || []).includes(s) && !wWozku(g, s);
  return { lok, L, K: D.katalog, id, wozek, wWozku, mial };
}

function pieczec(K, dop) {
  if (dop >= K.prog - 1e-9) return `<span class="dk-pieczec pelny">✓ trafia: pełny efekt</span>`;
  if (K.prog_czesciowy > 0 && dop >= K.prog_czesciowy - 1e-9) return `<span class="dk-pieczec pol">◐ trafia częściowo: połowa efektu</span>`;
  return `<span class="dk-pieczec brak">✕ nie trafia: bez efektu</span>`;
}

function regal(S, c, s) {
  const { K, L } = S, st = K.style[s], podst = s === K.domyslny_styl, dop = L.dopasowanie[s] || 0;
  const kto = st.klienci.map((g) => `${esc(K.klienci?.[g] || g)} ${proc(L.udzialy[g] || 0, 0)}`).join(" + ");
  const wyl = c.edycja ? "" : "disabled";
  const wiersze = Object.entries(K.grupy).map(([g, x]) => {
    const w = S.wWozku(g, s), ma = podst || S.mial(g, s);
    // w wózku: styl będzie założony po zakupie; inaczej aktywny jest ten z widoku (stan po decyzjach)
    const aktywny = L.aktywne[g] === s && !w;
    const przycisk = aktywny ? `<span class="dk-stan">✓ w lokalu</span>`
      : ma ? `<button class="btn czarny maly" data-akcja="dekor-ustaw" data-g="${g}" data-s="${s}" ${wyl}>${podst ? "Zdejmij" : "Załóż"}</button>`
        : `<button class="btn ${w ? "zielony" : "pom"} maly" data-akcja="dekor-wozek" data-g="${g}" data-s="${s}" ${wyl}>${w ? "✓ W wózku" : "Do wózka"}</button>`;
    return `<div class="dk-poz ${aktywny ? "aktywny" : ""}"><div class="dk-min">${miniatura(g, s)}</div>
      <div class="dk-opis"><b>${esc(x.nazwa)}</b><span>${podst ? "w cenie lokalu" : ma ? "kupione" : zl(x.cena)}</span></div>${przycisk}</div>`;
  }).join("");
  return `<article class="dk-regal"><header><h3>${esc(st.nazwa)}</h3><p>${esc(st.opis)}</p>
    ${podst ? `<span class="dk-pieczec brak">bez efektu</span>` : `<p class="dk-kto">Lubią: ${kto || "–"} = <b>${proc(dop, 0)}</b> gości tej okolicy</p>${pieczec(K, dop)}`}
    </header>${wiersze}</article>`;
}

function kasa(S) {
  const { K, wozek } = S;
  const suma = wozek.reduce((a, [g]) => a + K.grupy[g].cena, 0);
  const poz = wozek.map(([g, s]) => {
    const co = `${esc(K.grupy[g].nazwa)} – ${esc(K.style[s].nazwa)}`;
    return `<li><span>${co}</span><b>${zl(K.grupy[g].cena)}</b>
      <button class="dk-usun" data-akcja="dekor-wozek" data-g="${g}" data-s="${s}" title="Wyjmij z wózka" aria-label="Wyjmij z wózka: ${co}">✕</button></li>`;
  }).join("");
  const ile = wozek.length === 1 ? "1 rzecz" : `${wozek.length} rzeczy`;
  return `<aside class="dk-kasa" aria-label="Wózek i kasa"><div class="dk-wozek"><svg viewBox="0 0 150 130" aria-hidden="true"><use href="#g-sklep-wozek" width="150" height="130"/></svg>
      <div><b>Wózek</b><span>${wozek.length ? ile : "pusty"}</span></div></div>
    ${wozek.length ? `<div class="dk-paragon"><div class="dk-par-glowa">„MEBLOŚCIANKA”<small>sklep meblowy · Park handlowy</small><small>PARAGON · płatne przy zamknięciu tygodnia</small></div>
      <ul>${poz}</ul><div class="dk-par-suma"><span>SUMA</span><b>${zl(suma)}</b></div>
      <div class="dk-par-stopka">Kupione zostaje w lokalu na zawsze.<br>Zwrotów nie przyjmujemy. Dziękujemy!</div></div>`
    : `<p class="podpowiedz">Wybierz rzeczy z regałów. Najpierw sprawdź pieczęć: styl musi trafiać do gości Twojej okolicy, inaczej to tylko ładny wydatek.</p>`}</aside>`;
}

export const dekor = {
  tytul: "Sklep meblowy", tytulPelny: "Sklep meblowy „Meblościanka” – wystrój lokalu", odblokowanie: "inwestycje_wyposazenie",
  ukryta: (v) => !v.dekor?.katalog,
  info: "Wystrój lokalu w czterech grupach (ściany, szyld, dodatki, meble). Styl działa, gdy lubi go wystarczająco dużo gości z okolicy lokalu: wtedy każda grupa dodaje trochę klientów i podnosi ocenę. Kupujesz raz, na zawsze; kupione style zmienia się za darmo.",
  decyzje(c) {
    const S = stanSklepu(c);
    if (!S) return `<p class="podpowiedz">Najpierw potrzebny jest lokal: wystrój kupuje się do konkretnego lokalu.</p>`;
    const { K, L } = S;
    const goscie = Object.entries(L.udzialy).filter(([, u]) => u > 0).sort((a, b) => b[1] - a[1])
      .map(([g, u]) => `<span class="dk-gosc"><i style="width:${Math.round(u * 100)}%"></i><b>${esc(K.klienci?.[g] || g)}</b> ${proc(u, 0)}</span>`).join("");
    return `<div class="dk">
      <div class="dk-okolica"><div><b>Goście okolicy: ${esc(nazwaLokalu(c.v, S.lok.id))}</b>
        <span class="podpowiedz">Pełny efekt: styl lubi co najmniej ${proc(K.prog, 0)} gości. Dopasowany wystrój tego lokalu: ${String(L.punkty).replace(".", ",")} z ${Object.keys(K.grupy).length} grup.</span></div>
        <div class="dk-goscie">${goscie}</div></div>
      <div class="dk-uklad"><div class="dk-regaly">${Object.keys(K.style).map((s) => regal(S, c, s)).join("")}</div>${kasa(S)}</div></div>`;
  },
  po(c) { if (!saGrafiki()) wczytajGrafiki().then((ok) => { if (ok && saGrafiki()) c.rysuj(); }); },
  akcje: {
    "dekor-wozek": async (el, c) => {
      const g = el.dataset.g, s = el.dataset.s, id = idWybranego(c.v);
      await c.zmien((d) => {
        const m = cel(d, id), l = m.dekor_kup || [];
        const jest = l.some(([a, b]) => a === g && b === s);
        // w wózku najwyżej jeden styl danej grupy: nowy wybór zastępuje poprzedni
        m.dekor_kup = jest ? l.filter(([a, b]) => !(a === g && b === s)) : [...l.filter(([a]) => a !== g), [g, s]];
        if (!m.dekor_kup.length) delete m.dekor_kup;
        if (m.dekor_ustaw) { delete m.dekor_ustaw[g]; if (!Object.keys(m.dekor_ustaw).length) delete m.dekor_ustaw; }
      });
    },
    "dekor-ustaw": async (el, c) => {
      const g = el.dataset.g, s = el.dataset.s, id = idWybranego(c.v);
      await c.zmien((d) => { const m = cel(d, id); m.dekor_ustaw = { ...(m.dekor_ustaw || {}), [g]: s }; });
    },
  },
};
