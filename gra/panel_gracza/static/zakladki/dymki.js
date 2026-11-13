// Kółka „i” z dymkiem (przebudowa zakładek 2.11.2026, archiwum/plany/przebudowa_zakladek.md): na stronie zostają nagłówki,
// tabele, pola i krótkie etykiety, a opisy i objaśnienia pokazują się w dymku po najechaniu (albo dotknięciu) kółka.

// kółko z treścią dymka (HTML: tekst i/lub infografika SVG)
export const kolko = (html, klasa = "") => html
  ? `<span class="kolko-i ${klasa}" tabindex="0" role="button" aria-label="Wyjaśnienie">i<span class="dymek-tresc">${html}</span></span>`
  : "";

const DLUGA = 60;   // znaków – krótsza podpowiedź zostaje na stronie jako etykieta
const NAGLOWEK = ".pasek, .tabela-tytul, h3, h4, .kg";

// N10 (poprawki 3): kółko nie może wisieć w osobnym, pustym wierszu – dokleja się do najbliższego wcześniejszego nagłówka,
// etykiety albo tytułu (do 3 elementów wstecz w tym samym kontenerze); gdy go nie ma, zostaje w linii z poprzedzającym akapitem
const ETYKIETA = "h2, h3, h4, label:not(.pole), legend, .pasek, .tabela-tytul, .sekcja-tytul, .czesc-tytul, .zd-parki-tytul, .zd-czas-tekst, .etykieta, .kg";
const W_LINII = "p, .komunikat, .kafelki-lokali";

// gdzie postawić kółko podpowiedzi-akapitu: nagłówek przed nim, tytuł tabeli przed nim, nagłówek kafelka albo najbliższa etykieta
function kotwica(el) {
  const p = el.previousElementSibling;
  if (p?.matches(NAGLOWEK)) return p;
  if (p?.matches(".tab-wrap") && p.previousElementSibling?.matches(".tabela-tytul")) return p.previousElementSibling;
  const kafel = el.closest(".kafel")?.querySelector(":scope > .kg");
  if (kafel) return kafel;
  let q = p;
  for (let i = 0; q && i < 3; i++, q = q.previousElementSibling) {
    if (q.matches("details")) { const sum = q.querySelector(":scope > summary"); if (sum) return sum; }
    if (q.matches(ETYKIETA)) return q;
  }
  return p?.matches(W_LINII) ? p : null;
}

// długie podpowiedzi (.podpowiedz) → kółka „i”; ostrzeżenia (.minus) i podpowiedzi z polami zostają na wierzchu
export function zwinPodpowiedzi(korzen) {
  korzen.querySelectorAll(".podpowiedz").forEach((el) => {
    if (el.closest(".dymek-tresc") || el.matches(".minus, .zostaw")) return;
    if (el.querySelector("input, select, textarea, button, [data-akcja], .minus")) return;
    if (el.textContent.trim().length < DLUGA) return;
    const k = document.createElement("span");
    k.innerHTML = kolko(el.innerHTML);
    const kolkoEl = k.firstElementChild;
    const cel = !el.matches("span") || el.parentElement?.matches(".kd") ? kotwica(el)
      : el.parentElement?.querySelector(":scope > .etykieta");   // podpowiedź-span w kafelku liczby: kółko przy etykiecie
    if (cel) { cel.appendChild(kolkoEl); el.remove(); } else el.replaceWith(kolkoEl);
  });
}

// wyzwalacz dymka: kółko „i” albo dowolny element .ma-dymek z ukrytą .dymek-tresc w środku (np. wydarzenie w kalendarzu)
const WYZWALACZ = ".kolko-i, .ma-dymek";

// sprawa 11 (poprawki 2): w dymku najwyżej 1–2 zdania, reszta w zwijanym „Więcej”. Treść dzielimy w DOM: pierwszy blok
// (akapit) do końca 2. zdania zostaje, dalsze zdania i bloki (akapity, infografiki, tabele) idą do <details>.
const ZDANIA = 2, ZNAKI_KROTKIE = 160;   // interfejs: ile zdań na wierzchu; krótszy dymek zostaje w całości
const KONIEC_ZDANIA = /[.!?…](?=\s+[„"(A-ZĄĆĘŁŃÓŚŹŻ0-9])/g;

// miejsce podziału w węźle tekstowym bloku po `ile` zdaniach (zdania liczone w tekstach i elementach inline)
function podzielBlok(blok, ile) {
  let zostalo = ile;
  const idz = (wezel) => {
    for (const n of [...wezel.childNodes]) {
      if (n.nodeType === Node.TEXT_NODE) {
        KONIEC_ZDANIA.lastIndex = 0;
        let m;
        while ((m = KONIEC_ZDANIA.exec(n.textContent))) {
          if (--zostalo === 0) return { n, i: m.index + 1 };
        }
      } else if (n.nodeType === Node.ELEMENT_NODE && !n.matches("svg, table, ul, ol, div, p")) {
        const r = idz(n);
        if (r) return { ...r, w: r.w || n };
      }
    }
    return null;
  };
  return idz(blok);
}

export function skrocDymek(html) {
  const t = document.createElement("div");
  t.innerHTML = html;
  if (t.querySelector("details") || t.textContent.trim().length <= ZNAKI_KROTKIE) return html;
  // pierwszy blok: pierwszy element blokowy albo cała treść (sam tekst z inline)
  const bloki = [...t.childNodes].filter((n) => n.nodeType === Node.ELEMENT_NODE || n.textContent.trim());
  const blokowe = bloki.every((n) => n.nodeType === Node.ELEMENT_NODE && n.matches("p, div, ul, ol, table, svg, .podpowiedz"));
  const pierwszy = blokowe ? bloki[0] : t;
  const reszta = blokowe ? bloki.slice(1) : [];
  const podzial = pierwszy.matches?.("svg, table") ? null : podzielBlok(pierwszy, ZDANIA);
  const dalej = document.createElement("div");
  if (podzial && !podzial.w) {   // podział w tekście bezpośrednio w bloku: reszta tekstu i następne węzły do „Więcej”
    const ogon = podzial.n.splitText(podzial.i);
    let n = ogon;
    const doPrzeniesienia = [];
    while (n) { doPrzeniesienia.push(n); n = n.nextSibling; }
    const kontener = pierwszy === t ? dalej : dalej.appendChild(pierwszy.cloneNode(false));
    doPrzeniesienia.forEach((x) => kontener.appendChild(x));
  } else if (podzial?.w) {   // koniec zdania w elemencie inline: dzielimy za tym elementem
    let n = podzial.w.nextSibling;
    const kontener = pierwszy === t ? dalej : dalej.appendChild(pierwszy.cloneNode(false));
    while (n) { const nast = n.nextSibling; kontener.appendChild(n); n = nast; }
  }
  reszta.forEach((x) => dalej.appendChild(x));
  if (!dalej.textContent.trim() && !dalej.querySelector("svg, table")) return html;
  return `${t.innerHTML}<details class="wiecej"><summary>Więcej</summary>${dalej.innerHTML}</details>`;
}

// jeden wspólny dymek (position: fixed) – nie ucina go przewijana tabela ani okno
let dymek = null, przypiety = null;
function pokaz(k) {
  if (!dymek) {
    dymek = document.createElement("div"); dymek.className = "dymek"; document.body.appendChild(dymek);
    // dymek zostaje, gdy mysz przejdzie z kółka na dymek (żeby kliknąć „Więcej”); znika po wyjściu z dymku
    dymek.addEventListener("mouseenter", () => clearTimeout(zwloka));
    dymek.addEventListener("mouseleave", (e) => { if (!przypiety && !e.relatedTarget?.closest?.(WYZWALACZ)) schowajZaChwile(); });
    dymek.addEventListener("toggle", () => pokaz(dymek._k), true);   // po rozwinięciu „Więcej” – nowe położenie
  }
  if (dymek._k !== k || dymek.style.display !== "block") dymek.innerHTML = skrocDymek(k.querySelector(".dymek-tresc")?.innerHTML || "");
  dymek._k = k;
  dymek.style.display = "block";
  const r = k.getBoundingClientRect(), d = dymek.getBoundingClientRect();
  const x = Math.min(Math.max(8, r.left + r.width / 2 - d.width / 2), window.innerWidth - d.width - 8);
  const y = r.bottom + 8 + d.height < window.innerHeight ? r.bottom + 8 : Math.max(8, r.top - d.height - 8);
  dymek.style.left = `${x}px`; dymek.style.top = `${y}px`;
}
function schowaj() { clearTimeout(zwloka); if (dymek) dymek.style.display = "none"; przypiety = null; }
// chwila na przejście myszą z kółka na dymek (między nimi jest odstęp)
let zwloka = null;
const ZWLOKA_MS = 250;
function schowajZaChwile() { clearTimeout(zwloka); zwloka = setTimeout(schowaj, ZWLOKA_MS); }

document.addEventListener("mouseover", (e) => {
  const k = e.target.closest?.(WYZWALACZ);
  if (k && !przypiety) { clearTimeout(zwloka); pokaz(k); }
});
document.addEventListener("mouseout", (e) => {
  const k = e.target.closest?.(WYZWALACZ);
  if (k && !przypiety && !k.contains(e.relatedTarget) && !e.relatedTarget?.closest?.(".dymek")) schowajZaChwile();
});
document.addEventListener("focusin", (e) => { if (e.target.matches?.(WYZWALACZ)) pokaz(e.target); });
document.addEventListener("focusout", (e) => { if (e.target.matches?.(WYZWALACZ) && !przypiety) schowaj(); });
// klik / dotknięcie przypina dymek (ekrany dotykowe); drugi klik albo klik obok – zamyka
document.addEventListener("click", (e) => {
  const k = e.target.closest?.(WYZWALACZ);
  if (k) { e.preventDefault(); e.stopPropagation(); if (przypiety === k) schowaj(); else { pokaz(k); przypiety = k; } return; }
  if (przypiety && !e.target.closest?.(".dymek")) schowaj();
}, true);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") schowaj(); });
window.addEventListener("scroll", () => { if (!przypiety) schowaj(); }, { passive: true });
